#!/usr/bin/env node
/**
 * Real-browser verification of the built site.
 *
 * Launches headless Chrome, drives it over the DevTools Protocol, and for every page:
 *   - renders it in Chrome and captures full-page screenshots (desktop and mobile)
 *   - asserts structural expectations (single h1, no unrendered markdown, stylesheet applied)
 *   - collects console errors and failed requests
 *   - exercises the interactive behaviour: search and the theme toggle
 *
 * Usage: node site/verify.mjs --base http://localhost:4321 --label public
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const argv = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = argv.indexOf(name)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}

const BASE = getArg('--base', 'http://localhost:4321').replace(/\/$/, '')
const LABEL = getArg('--label', 'site')
const PORT = Number(getArg('--port', '9333'))
const SHOT_DIR = path.join(ROOT, '.verify', LABEL)

const CHROME_CANDIDATES = [
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

const PUBLIC_PAGES = [
  { path: '/', name: 'home', minTables: 0, expectSchema: ['Organization', 'WebSite', 'Service', 'BreadcrumbList'] },
  { path: '/how-it-works/', name: 'how-it-works', minTables: 2 },
  { path: '/for-suppliers/', name: 'for-suppliers', minTables: 1 },
  { path: '/faq/', name: 'faq', minTables: 0, expectSchema: ['FAQPage'] },
]

const INTERNAL_PAGES = [
  { path: '/', name: 'index', minTables: 2 },
  { path: '/docs/vision-and-positioning/', name: 'vision', minTables: 4, expectDiagram: true },
  { path: '/docs/business-model-and-economics/', name: 'economics', minTables: 6 },
  { path: '/docs/functional-requirements/', name: 'requirements', minTables: 10 },
  { path: '/docs/user-journeys/', name: 'journeys', minTables: 6, expectDiagram: true },
  { path: '/docs/domain-model-and-authorisation/', name: 'domain', minTables: 8, expectDiagram: true },
  { path: '/docs/open-decisions-and-assumptions/', name: 'decisions', minTables: 2 },
  { path: '/docs/glossary/', name: 'glossary', minTables: 1 },
  { path: '/docs/brand-and-identity/', name: 'brand', minTables: 2 },
  { path: '/idea/', name: 'idea', minTables: 1 },
]

const PAGES = LABEL === 'internal' ? INTERNAL_PAGES : PUBLIC_PAGES

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let chromeStderr = ''

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error('No Chrome or Edge binary found.')
}

async function waitForDevtools(port, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (response.ok) return await response.json()
    } catch {
      /* not up yet */
    }
    await sleep(200)
  }
  throw new Error('Chrome DevTools endpoint did not become available.')
}

class Cdp {
  constructor(socket) {
    this.socket = socket
    this.nextId = 1
    this.pending = new Map()
    this.events = []
    this.closed = null
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`))
        else resolve(message.result)
        return
      }
      this.events.push(message)
    })
    socket.addEventListener('close', () => {
      this.closed = 'DevTools socket closed by the browser.'
      for (const { reject } of this.pending.values()) reject(new Error(this.closed))
      this.pending.clear()
    })
    socket.addEventListener('error', () => {
      this.closed = 'DevTools socket error.'
    })
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error(this.closed))
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 30000)
    })
  }

  takeEvents(name) {
    const taken = this.events.filter((event) => event.method === name)
    this.events = this.events.filter((event) => event.method !== name)
    return taken
  }

  clearEvents() {
    this.events = []
  }
}

const connect = (url) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    socket.addEventListener('open', () => resolve(socket))
    socket.addEventListener('error', () => reject(new Error('WebSocket connection failed')))
  })

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || 'evaluation failed')
  }
  return result.result.value
}

const AUDIT_SCRIPT = `(() => {
  const text = document.body.innerText || '';
  const body = getComputedStyle(document.body);
  return {
    title: document.title,
    h1: document.querySelectorAll('h1').length,
    h1Text: (document.querySelector('h1') || {}).innerText || '',
    tables: document.querySelectorAll('table').length,
    diagrams: document.querySelectorAll('[data-mermaid]').length,
    navLinks: document.querySelectorAll('.sidebar a, .hero a, .cta a').length,
    mdLink: Array.from(document.querySelectorAll('a')).filter(a => /\\.md($|#)/.test(a.getAttribute('href') || '')).length,
    stylesheets: document.styleSheets.length,
    bodyBg: body.backgroundColor,
    font: body.fontFamily,
    pipeRows: (text.match(/^\\|[\\s:|-]*-[\\s:|-]*\\|$/gm) || []).length,
    boldLeak: (text.match(/\\*\\*[A-Za-z]/g) || []).length,
    metaBlocks: document.querySelectorAll('.doc-meta').length,
    tocItems: document.querySelectorAll('.toc a').length,
    banner: document.querySelectorAll('.internal-banner').length,
    fallbackDiagrams: document.querySelectorAll('.diagram.is-fallback').length,
    flowItems: document.querySelectorAll('.flow li').length,
    diagramSvg: document.querySelectorAll('.diagram svg').length,
    whatsappLinks: document.querySelectorAll('a[href*="wa.me/2348036682403"]').length,
    emailLinks: document.querySelectorAll('a[href*="nexarchtechnologies@gmail.com"]').length,
    telLinks: document.querySelectorAll('a[href="tel:+2348036682403"]').length,
    staleContact: /hello@nexarchtechnologies\\.com|mailto:hello@/.test(document.body.innerHTML),
    lang: document.documentElement.lang,
    robots: (document.querySelector('meta[name="robots"]') || {}).content || '',
    canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
    ogImage: (document.querySelector('meta[property="og:image"]') || {}).content || '',
    ogLocale: (document.querySelector('meta[property="og:locale"]') || {}).content || '',
    twitterCard: (document.querySelector('meta[name="twitter:card"]') || {}).content || '',
    titleLength: (document.title || '').length,
    descriptionLength: ((document.querySelector('meta[name="description"]') || {}).content || '').length,
    schemaTypes: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => {
      try {
        const parsed = JSON.parse(node.textContent);
        return parsed['@type'] || 'UNTYPED';
      } catch (error) {
        return 'INVALID';
      }
    }),
  };
})()`

async function main() {
  const chrome = await findChrome()
  await fs.mkdir(SHOT_DIR, { recursive: true })
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'reorder-verify-'))

  const child = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-gpu-sandbox',
      '--in-process-gpu',
      '--disable-software-rasterizer',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--remote-allow-origins=*',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${PORT}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  )

  child.stderr.on('data', (chunk) => {
    chromeStderr += chunk.toString()
  })

  const results = []
  let failures = 0

  try {
    await waitForDevtools(PORT)
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const pageTarget = list.find((entry) => entry.type === 'page')
    if (!pageTarget) throw new Error('No page target available in Chrome.')

    const socket = await connect(pageTarget.webSocketDebuggerUrl)
    const cdp = new Cdp(socket)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Log.enable')
    await cdp.send('Network.enable')

    let indexCount = null

    for (const [pageIndex, page] of PAGES.entries()) {
      const url = `${BASE}${page.path}`
      cdp.clearEvents()
      await cdp.send('Page.navigate', { url })
      await sleep(900)

      const audit = await evaluate(cdp, AUDIT_SCRIPT)

      // Measure the search index from a real page origin, not about:blank.
      if (pageIndex === 0) {
        indexCount = await evaluate(
          cdp,
          `fetch('${BASE}/assets/search.json').then(r => r.ok ? r.json() : []).then(j => j.length).catch(() => -1)`
        )
      }

      const searchResult = await evaluate(
        cdp,
        `(async () => {
          const input = document.querySelector('[data-search-input]');
          if (!input) return { ok: false, reason: 'no search input' };
          input.focus();
          input.value = 'reorder';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 600));
          const box = document.querySelector('[data-search-results]');
          return {
            ok: !!(box && !box.hidden && box.querySelector('a')),
            count: box ? box.querySelectorAll('a').length : 0
          };
        })()`
      )

      const themeResult = await evaluate(
        cdp,
        `(() => {
          const btn = document.querySelector('[data-theme-toggle]');
          if (!btn) return { ok: false };
          const before = document.documentElement.dataset.theme;
          btn.click();
          const after = document.documentElement.dataset.theme;
          const bg = getComputedStyle(document.body).backgroundColor;
          btn.click();
          return { ok: before !== after, before, after, darkBg: bg };
        })()`
      )

      const consoleErrors = cdp
        .takeEvents('Runtime.consoleAPICalled')
        .filter((event) => event.params.type === 'error')
        .map((event) => event.params.args.map((arg) => arg.value ?? arg.description).join(' '))
      const logErrors = cdp
        .takeEvents('Log.entryAdded')
        .filter((event) => event.params.entry.level === 'error')
        .map((event) => event.params.entry.text)
      const failedRequests = cdp
        .takeEvents('Network.loadingFailed')
        .filter((event) => !/ERR_ABORTED/.test(event.params.errorText))

      const requestUrls = new Map(
        cdp
          .takeEvents('Network.requestWillBeSent')
          .map((event) => [event.params.requestId, event.params.request.url])
      )
      const requestFailures = failedRequests
        .map((event) => ({
          url: requestUrls.get(event.params.requestId) || 'unknown',
          error: event.params.errorText,
        }))
        .filter((failure) => !/ERR_ABORTED/.test(failure.error))

      const isExternal = (url) => /^https?:\/\//.test(url) && !/^https?:\/\/(127\.0\.0\.1|localhost)/.test(url)
      const localFailures = requestFailures.filter((failure) => !isExternal(failure.url))
      const externalFailures = requestFailures.filter((failure) => isExternal(failure.url))

      const problems = []
      if (audit.h1 !== 1) problems.push(`h1 count ${audit.h1}`)
      if (audit.stylesheets === 0) problems.push('no stylesheet loaded')
      if (audit.bodyBg === 'rgba(0, 0, 0, 0)') problems.push('stylesheet not applied to body')
      if (audit.mdLink > 0) problems.push(`${audit.mdLink} unresolved .md link(s)`)
      if (audit.pipeRows > 0) problems.push(`${audit.pipeRows} unrendered table row(s)`)
      if (audit.boldLeak > 0) problems.push(`${audit.boldLeak} unrendered bold marker(s)`)
      if (audit.tables < page.minTables) problems.push(`tables ${audit.tables} below expected ${page.minTables}`)
      if (page.expectDiagram && audit.diagrams === 0) problems.push('expected diagram not present')
      if (!searchResult.ok) problems.push(`search inactive (${searchResult.reason || 'no results'})`)
      if (!themeResult.ok) problems.push('theme toggle did not change theme')
      if (localFailures.length) {
        problems.push(`failed local requests: ${localFailures.map((failure) => `${failure.url} (${failure.error})`).join(', ')}`)
      }
      if (page.expectDiagram) {
        const rendered = audit.diagramSvg + (audit.fallbackDiagrams > 0 ? audit.flowItems : 0)
        if (rendered === 0) problems.push('diagram neither rendered nor degraded to a readable flow')
      }
      if (audit.staleContact) problems.push('placeholder contact details still present')
      if (audit.whatsappLinks === 0) problems.push('no WhatsApp contact link')
      if (audit.emailLinks === 0) problems.push('no email contact link')

      if (LABEL === 'internal') {
        if (!/noindex/.test(audit.robots)) problems.push('internal page is not noindex')
        if (audit.canonical) problems.push('internal page should not declare a canonical URL')
      } else {
        if (!audit.canonical.startsWith('https://reorder.nexarchtechnologies.com')) {
          problems.push(`canonical missing or wrong host (${audit.canonical || 'none'})`)
        }
        if (!/^https:\/\/.+og-image\.png$/.test(audit.ogImage)) problems.push('og:image missing or not absolute')
        if (audit.ogLocale !== 'en_NG') problems.push('og:locale not set to en_NG')
        if (audit.twitterCard !== 'summary_large_image') problems.push('twitter card not configured')
        if (audit.lang !== 'en-NG') problems.push(`html lang is ${audit.lang}`)
        if (audit.schemaTypes.includes('INVALID')) problems.push('invalid JSON-LD block')
        if (audit.titleLength > 65) problems.push(`title too long (${audit.titleLength} chars)`)
        if (audit.descriptionLength < 70 || audit.descriptionLength > 165) {
          problems.push(`meta description length ${audit.descriptionLength}`)
        }
        for (const type of page.expectSchema || []) {
          if (!audit.schemaTypes.includes(type)) problems.push(`missing ${type} structured data`)
        }
      }

      if (problems.length) failures += 1
      results.push({
        page: page.path,
        audit,
        searchResult,
        themeResult,
        consoleErrors,
        logErrors,
        localFailures,
        externalFailures,
        problems,
      })

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      })
      // Leave the page in a clean state before capturing: close search, scroll to top.
      await evaluate(
        cdp,
        `(() => {
          const input = document.querySelector('[data-search-input]');
          if (input) { input.value = ''; input.blur(); }
          const box = document.querySelector('[data-search-results]');
          if (box) { box.hidden = true; box.innerHTML = ''; }
          window.scrollTo(0, 0);
          return true;
        })()`
      )
      await sleep(400)
      const top = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1440, height: 1000, scale: 1 },
      })
      await fs.writeFile(path.join(SHOT_DIR, `${page.name}-top.png`), Buffer.from(top.data, 'base64'))

      const desktop = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
      await fs.writeFile(path.join(SHOT_DIR, `${page.name}-desktop.png`), Buffer.from(desktop.data, 'base64'))

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true,
      })
      await sleep(400)
      const mobile = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
      await fs.writeFile(path.join(SHOT_DIR, `${page.name}-mobile.png`), Buffer.from(mobile.data, 'base64'))

      await cdp.send('Emulation.clearDeviceMetricsOverride')
    }

    socket.close()

    console.log(`Chrome: ${chrome}`)
    console.log(`Search index entries: ${indexCount}`)
    console.log(`Screenshots: ${SHOT_DIR}`)
    for (const result of results) {
      const status = result.problems.length ? 'FAIL' : 'PASS'
      console.log(
        `${status} ${result.page} h1=${result.audit.h1} tables=${result.audit.tables} diagrams=${result.audit.diagrams} ` +
          `nav=${result.audit.navLinks} toc=${result.audit.tocItems} meta=${result.audit.metaBlocks} banner=${result.audit.banner} ` +
          `search=${result.searchResult.count} theme=${result.themeResult.after} consoleErrors=${result.consoleErrors.length} ` +
          `diagramSvg=${result.audit.diagramSvg} fallbackFlows=${result.audit.fallbackDiagrams}/${result.audit.flowItems} ` +
          `externalBlocked=${result.externalFailures.length} wa=${result.audit.whatsappLinks} mail=${result.audit.emailLinks} tel=${result.audit.telLinks}`
          + ` title=${result.audit.titleLength} desc=${result.audit.descriptionLength} schema=[${result.audit.schemaTypes.join(',')}] canon=${result.audit.canonical ? 'yes' : 'no'}`
      )
      for (const problem of result.problems) console.log(`     - ${problem}`)
      for (const error of result.consoleErrors.slice(0, 3)) console.log(`     ! console: ${error}`)
    }
    console.log(failures ? `\n${failures} page(s) failed browser verification.` : '\nAll pages passed browser verification.')
  } finally {
    child.kill()
  }
}

main().catch((error) => {
  console.error(error)
  if (chromeStderr.trim()) {
    console.error('--- Chrome output ---')
    console.error(chromeStderr.trim().split('\n').slice(-12).join('\n'))
  }
  process.exit(1)
})
