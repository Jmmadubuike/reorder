#!/usr/bin/env node
/**
 * Render the social preview card and app icons to PNG using headless Chrome.
 *
 * Social platforms and Google do not render SVG previews, so these must be real raster images.
 * The results are committed to site/assets/ because a CI build has no browser available.
 *
 * Usage: node site/make-images.mjs
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.join(__dirname, 'assets')
const PORT = 9350

const CHROME_CANDIDATES = [
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

const MARK = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M18 32a14 14 0 0 1 28 0" fill="none" stroke="#F2A93B" stroke-width="7" stroke-linecap="round"/>
  <path d="M46 32a14 14 0 0 1-28 0" fill="none" stroke="#8FD3C2" stroke-width="7" stroke-linecap="round"/>
  <path d="M41 26.5l5.5 5.5-5.5 5.5" fill="none" stroke="#F2A93B" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23 37.5l-5.5-5.5 5.5-5.5" fill="none" stroke="#8FD3C2" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const iconPage = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${size}px; height:${size}px; overflow:hidden; }
  body { background:#0B5D4F; display:flex; align-items:center; justify-content:center; }
  svg { width:${Math.round(size * 0.68)}px; height:${Math.round(size * 0.68)}px; }
</style></head><body>${MARK}</body></html>`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      /* next */
    }
  }
  throw new Error('No Chrome or Edge binary found.')
}

async function waitForDevtools(port, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (response.ok) return true
    } catch {
      /* not up yet */
    }
    await sleep(200)
  }
  throw new Error('Chrome DevTools endpoint did not become available.')
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    socket.addEventListener('open', () => resolve(socket))
    socket.addEventListener('error', () => reject(new Error('WebSocket connection failed')))
  })
}

function client(socket) {
  let nextId = 1
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
  })
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id)
          reject(new Error(`CDP timeout: ${method}`))
        }
      }, 30000)
    })
}

async function main() {
  const chrome = await findChrome()
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'reorder-images-'))
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
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--remote-allow-origins=*',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${PORT}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  )

  try {
    await waitForDevtools(PORT)
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const page = targets.find((entry) => entry.type === 'page')
    const socket = await connect(page.webSocketDebuggerUrl)
    const send = client(socket)
    await send('Page.enable')

    const shoot = async (url, width, height, output) => {
      await send('Page.navigate', { url })
      await sleep(700)
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await sleep(350)
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width, height, scale: 1 },
      })
      const buffer = Buffer.from(shot.data, 'base64')
      await fs.writeFile(output, buffer)
      return buffer.length
    }

    const cardFile = pathToFileURL(path.join(ASSETS, 'og-card.html')).href
    const cardBytes = await shoot(cardFile, 1200, 630, path.join(ASSETS, 'og-image.png'))
    const iconBytes = await shoot(
      `data:text/html;charset=utf-8,${encodeURIComponent(iconPage(180))}`,
      180,
      180,
      path.join(ASSETS, 'apple-touch-icon.png')
    )
    const logoBytes = await shoot(
      `data:text/html;charset=utf-8,${encodeURIComponent(iconPage(512))}`,
      512,
      512,
      path.join(ASSETS, 'logo-512.png')
    )

    socket.close()
    console.log(`og-image.png          1200x630  ${cardBytes} bytes`)
    console.log(`apple-touch-icon.png   180x180  ${iconBytes} bytes`)
    console.log(`logo-512.png           512x512  ${logoBytes} bytes`)
  } finally {
    child.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
