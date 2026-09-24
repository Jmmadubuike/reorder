#!/usr/bin/env node
/**
 * Reorder site builder — zero runtime dependencies.
 *
 * Two surfaces are produced from the same repository:
 *   --surface public    → the public marketing site for reorder.nexarchtechnologies.com
 *   --surface internal  → the full pre-development documentation pack
 *
 * The markdown subset implemented here is exactly the subset used by the documents in this
 * repository: headings, paragraphs, GFM tables, bullet and ordered lists, blockquotes, inline
 * code, fenced code blocks (including mermaid), bold, italic and links. Anything outside that
 * subset is rendered as plain text rather than being silently dropped.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const argv = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = argv.indexOf(name)
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback
}

const SURFACE = getArg('--surface', 'public')
if (!['public', 'internal'].includes(SURFACE)) {
  console.error(`Unknown surface: ${SURFACE}. Use --surface public or --surface internal.`)
  process.exit(1)
}

const BASE = getArg('--base', '').replace(/\/+$/, '')
const OUT_DIR = path.join(ROOT, getArg('--out', 'dist'))

const BRAND = {
  name: 'Reorder',
  company: 'Nexarch Technologies',
  category: 'Intelligent Restocking Infrastructure for Retail Businesses',
  tagline: 'Bring the market to the retailer.',
  domain: 'reorder.nexarchtechnologies.com',
  email: 'nexarchtechnologies@gmail.com',
  phoneDisplay: '+234 803 668 2403',
  phoneHref: 'tel:+2348036682403',
  whatsappHref: 'https://wa.me/2348036682403',
  color: '#0B5D4F',
}

const SITE_URL = `https://${BRAND.domain}`
const OG_IMAGE = `${SITE_URL}/assets/og-image.png`
const OG_IMAGE_ALT =
  'Reorder — intelligent restocking infrastructure. Sell, track, detect, reorder, source, deliver.'

const absoluteUrl = (pathname) => `${SITE_URL}${pathname}`

/** Extract question/answer pairs from the FAQ page so structured data cannot drift from the copy. */
function faqEntries(body) {
  const sections = body.split(/\n(?=##\s+)/)
  const entries = []
  for (const section of sections) {
    const match = section.match(/^##\s+(.+)\n([\s\S]*)$/)
    if (!match) continue
    const question = match[1].trim()
    if (/frequently asked questions/i.test(question)) continue
    const paragraph = match[2]
      .split('\n\n')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk && !/^[<|#>-]/.test(chunk))
    if (!paragraph) continue
    const answer = plainText(paragraph).slice(0, 1200)
    if (answer) entries.push({ question, answer })
  }
  return entries
}

function buildSchema(page, isHome, body) {
  if (SURFACE === 'internal') return []
  const orgId = `${SITE_URL}/#organization`
  const siteId = `${SITE_URL}/#website`

  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }],
  }
  if (!isHome) {
    crumbs.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: page.meta.short || page.meta.title,
      item: absoluteUrl(page.url),
    })
  }

  const schemas = [crumbs]

  if (isHome) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': orgId,
      name: BRAND.name,
      legalName: BRAND.company,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/assets/logo-512.png`,
      image: OG_IMAGE,
      description:
        'Reorder turns daily retail sales into a ready-made restock order and delivers it to pharmacies, supermarkets and small shops.',
      email: BRAND.email,
      telephone: '+2348036682403',
      areaServed: { '@type': 'Country', name: 'Nigeria' },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+2348036682403',
          email: BRAND.email,
          areaServed: 'NG',
          availableLanguage: ['en'],
        },
      ],
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': siteId,
      url: `${SITE_URL}/`,
      name: BRAND.name,
      inLanguage: 'en-NG',
      publisher: { '@id': orgId },
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Retail restocking and delivery',
      serviceType: 'B2B restocking and replenishment',
      description:
        'Reorder monitors retail sales and stock, proposes a replenishment order, sources the goods from importers, distributors and wholesalers, and delivers them to the business.',
      provider: { '@id': orgId },
      areaServed: { '@type': 'Country', name: 'Nigeria' },
      audience: {
        '@type': 'BusinessAudience',
        name: 'Pharmacies, supermarkets, mini-marts, kiosks and provisions shops',
      },
    })
  }

  if (page.meta.layout === 'faq') {
    const entries = faqEntries(body)
    if (entries.length) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: entries.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: { '@type': 'Answer', text: entry.answer },
        })),
      })
    }
  }

  return schemas
}

/* ------------------------------------------------------------------ *
 * Markdown engine
 * ------------------------------------------------------------------ */

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'section'

const isExternal = (href) => /^(?:https?:|mailto:|tel:)/i.test(href)

/** Render inline spans. `ctx` carries the link resolver and current source path. */
function renderInline(raw, ctx) {
  if (raw == null) return ''

  const codes = []
  let text = escapeHtml(raw).replace(/`([^`]+)`/g, (_match, code) => {
    codes.push(code)
    return `\u0000C${codes.length - 1}\u0000`
  })

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
    if (href.startsWith('#')) return `<a href="${href}">${label}</a>`
    if (isExternal(href)) {
      const safe = href.replace(/"/g, '%22')
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`
    }
    const resolved = ctx.resolveLink ? ctx.resolveLink(href, ctx.source) : null
    if (!resolved) return `<span class="xref">${label}</span>`
    // Links whose label is just a filename read better as the target document's title.
    const text = /\.md$/i.test(label.trim()) ? escapeHtml(resolved.title) : label
    return `<a href="${resolved.url}">${text}</a>`
  })

  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
  text = text.replace(/\u0000C(\d+)\u0000/g, (_match, index) => `<code>${codes[index]}</code>`)
  return text
}

const isTableSeparator = (line) => /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(line.trim()) && line.includes('-')

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

function renderTable(headerLine, separatorLine, bodyLines, ctx) {
  const header = splitRow(headerLine)
  const aligns = splitRow(separatorLine).map((cell) => {
    const left = cell.startsWith(':')
    const right = cell.endsWith(':')
    if (left && right) return 'center'
    if (right) return 'right'
    return 'left'
  })

  const alignAttr = (index) =>
    aligns[index] && aligns[index] !== 'left' ? ` style="text-align:${aligns[index]}"` : ''

  const head = header
    .map((cell, index) => `<th${alignAttr(index)}>${renderInline(cell, ctx)}</th>`)
    .join('')

  const body = bodyLines
    .map((line) => {
      const cells = splitRow(line)
      const cellsHtml = header
        .map((_unused, index) => `<td${alignAttr(index)}>${renderInline(cells[index] ?? '', ctx)}</td>`)
        .join('')
      return `<tr>${cellsHtml}</tr>`
    })
    .join('\n')

  return `<div class="table-wrap">\n<table>\n<thead><tr>${head}</tr></thead>\n<tbody>\n${body}\n</tbody>\n</table>\n</div>`
}

function renderBlocks(source, ctx, headings) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let index = 0
  const usedIds = new Map()

  const startOfBlock = (line) =>
    /^(#{1,6})\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*([-*]|\d+\.)\s+/.test(line) ||
    /^\|/.test(line) ||
    /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
    line.trim() === ''

  const uniqueId = (base) => {
    const count = usedIds.get(base) ?? 0
    usedIds.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  }

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim() === '') {
      index += 1
      continue
    }

    // Raw HTML block (used only by the designed landing page and a few disclosure widgets)
    if (/^<[a-zA-Z/]/.test(line) && !/^<https?:/i.test(line)) {
      const buffer = [line]
      index += 1
      while (index < lines.length && lines[index].trim() !== '') {
        buffer.push(lines[index])
        index += 1
      }
      out.push(buffer.join('\n'))
      continue
    }

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/)
    if (fence) {
      const lang = fence[1] || ''
      const buffer = []
      index += 1
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        buffer.push(lines[index])
        index += 1
      }
      index += 1
      const code = buffer.join('\n')
      if (lang === 'mermaid') {
        out.push(
          `<figure class="diagram">\n<div class="mermaid" data-mermaid>${escapeHtml(code)}</div>\n` +
            `<figcaption class="diagram-fallback">Diagram source retained. Enable JavaScript for the rendered flow.</figcaption>\n</figure>`
        )
      } else {
        out.push(`<pre class="code"><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(code)}</code></pre>`)
      }
      continue
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      let level = heading[1].length
      if (ctx.demoteHeadings) {
        if (level === 1) {
          if (ctx.seenH1) level = 2
          else ctx.seenH1 = true
        } else {
          level = Math.min(level + 1, 6)
        }
      }
      const text = heading[2].trim()
      const id = uniqueId(slugify(text))
      const anchor =
        level >= 2 ? `<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a>` : ''
      out.push(`<h${level} id="${id}">${renderInline(text, ctx)}${anchor}</h${level}>`)
      if (level === 2 || level === 3) headings.push({ level, text, id })
      index += 1
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>')
      index += 1
      continue
    }

    // Table
    if (/^\|/.test(line) && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headerLine = line
      const separatorLine = lines[index + 1]
      index += 2
      const body = []
      while (index < lines.length && /^\|/.test(lines[index])) {
        body.push(lines[index])
        index += 1
      }
      out.push(renderTable(headerLine, separatorLine, body, ctx))
      continue
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buffer = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        buffer.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      const inner = renderBlocks(buffer.join('\n'), ctx, headings)
      out.push(`<blockquote>\n${inner}\n</blockquote>`)
      continue
    }

    // List
    const listMatch = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/)
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1])
      const startAttr = ordered && listMatch[1] !== '1.' ? ` start="${listMatch[1].replace('.', '')}"` : ''
      const items = []
      let current = null
      while (index < lines.length) {
        const candidate = lines[index]
        const item = candidate.match(/^\s*([-*]|\d+\.)\s+(.*)$/)
        if (item) {
          if (current) items.push(current)
          current = item[2].trim()
          index += 1
          continue
        }
        if (candidate.trim() === '' || startOfBlock(candidate)) break
        if (current) current += ` ${candidate.trim()}`
        index += 1
      }
      if (current) items.push(current)
      const tag = ordered ? 'ol' : 'ul'
      const body = items.map((item) => `<li>${renderInline(item, ctx)}</li>`).join('\n')
      out.push(`<${tag}${startAttr}>\n${body}\n</${tag}>`)
      continue
    }

    // Paragraph, with a dedicated rendering for leading metadata runs
    const buffer = []
    while (index < lines.length && lines[index].trim() !== '' && !startOfBlock(lines[index])) {
      buffer.push(lines[index].trim())
      index += 1
    }
    if (buffer.length) {
      const isMeta = buffer.length >= 2 && buffer.every((entry) => /^[A-Z][A-Za-z /-]*:\s*\S/.test(entry))
      if (isMeta) {
        const items = buffer
          .map((entry) => {
            const pair = entry.match(/^([A-Z][A-Za-z /-]*):\s*(.*)$/)
            return `<div><dt>${renderInline(pair[1], ctx)}</dt><dd>${renderInline(pair[2], ctx)}</dd></div>`
          })
          .join('\n')
        out.push(`<dl class="doc-meta">\n${items}\n</dl>`)
      } else {
        out.push(`<p>${renderInline(buffer.join(' '), ctx)}</p>`)
      }
    }
  }

  return out.join('\n')
}

function parseFrontMatter(raw, fallbackTitle) {
  const meta = {}
  let body = raw
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (match) {
    body = raw.slice(match[0].length)
    for (const line of match[1].split('\n')) {
      const pair = line.match(/^([A-Za-z-]+):\s*(.*)$/)
      if (pair) meta[pair[1].trim()] = pair[2].trim().replace(/^["']|["']$/g, '')
    }
  }
  if (!meta.title) {
    const h1 = body.match(/^#\s+(.*)$/m)
    meta.title = h1 ? h1[1].trim() : fallbackTitle
  }
  return { meta, body }
}

const plainText = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/* ------------------------------------------------------------------ *
 * Page model
 * ------------------------------------------------------------------ */

const INTERNAL_GROUPS = [
  {
    label: 'Overview',
    pages: [{ source: 'README.md', url: '/' }],
  },
  {
    label: 'Strategy',
    pages: [
      { source: 'docs/00-vision-and-positioning.md', url: '/docs/vision-and-positioning/' },
      { source: 'docs/01-opportunity-and-vision.md', url: '/docs/opportunity-and-vision/' },
      { source: 'docs/02-customers-and-segments.md', url: '/docs/customers-and-segments/' },
      { source: 'docs/03-business-model-and-economics.md', url: '/docs/business-model-and-economics/' },
    ],
  },
  {
    label: 'Product',
    pages: [
      { source: 'docs/04-product-scope-and-phasing.md', url: '/docs/product-scope-and-phasing/' },
      { source: 'docs/05-user-journeys.md', url: '/docs/user-journeys/' },
      { source: 'docs/06-functional-requirements.md', url: '/docs/functional-requirements/' },
      { source: 'docs/07-domain-model-and-authz.md', url: '/docs/domain-model-and-authorisation/' },
      { source: 'docs/08-architecture-and-integrations.md', url: '/docs/architecture-and-integrations/' },
    ],
  },
  {
    label: 'Operations',
    pages: [
      { source: 'docs/09-supply-network-and-fulfillment.md', url: '/docs/supply-network-and-fulfilment/' },
      { source: 'docs/10-compliance-legal-and-risks.md', url: '/docs/compliance-legal-and-risks/' },
      { source: 'docs/11-validation-plan-and-metrics.md', url: '/docs/validation-plan-and-metrics/' },
      { source: 'docs/12-roadmap-and-gates.md', url: '/docs/roadmap-and-gates/' },
    ],
  },
  {
    label: 'Reference',
    pages: [
      { source: 'docs/13-open-decisions-and-assumptions.md', url: '/docs/open-decisions-and-assumptions/' },
      { source: 'docs/14-glossary.md', url: '/docs/glossary/' },
      { source: 'docs/15-brand-and-identity.md', url: '/docs/brand-and-identity/' },
      { source: 'MY_IDEA_REORDER.md', url: '/idea/', demoteHeadings: true },
    ],
  },
]

const PUBLIC_GROUPS = [
  {
    label: 'Reorder',
    pages: [
      { source: 'public/index.md', url: '/' },
      { source: 'public/how-it-works.md', url: '/how-it-works/' },
      { source: 'public/for-suppliers.md', url: '/for-suppliers/' },
      { source: 'public/faq.md', url: '/faq/' },
    ],
  },
]

const GROUPS = SURFACE === 'internal' ? INTERNAL_GROUPS : PUBLIC_GROUPS

async function readPage(entry) {
  const absolute = path.join(ROOT, entry.source)
  // Normalise line endings first: a Windows checkout produces CRLF, which would otherwise
  // stop front matter from parsing and silently drop every page title and meta description.
  const raw = (await fs.readFile(absolute, 'utf8')).replace(/\r\n/g, '\n')
  const { meta, body } = parseFrontMatter(raw, path.basename(entry.source, '.md'))
  return { ...entry, meta, body }
}

function buildLinkResolver(pages) {
  const bySource = new Map(pages.map((page) => [page.source, page]))
  const byBasename = new Map()
  for (const page of pages) {
    const base = path.posix.basename(page.source)
    if (!byBasename.has(base)) byBasename.set(base, page)
  }
  return (href, fromSource) => {
    const clean = href.split('#')[0]
    if (!clean || !clean.endsWith('.md')) return null
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromSource), clean))
    const page = bySource.get(resolved) ?? byBasename.get(path.posix.basename(clean))
    if (!page) return null
    return { url: `${BASE}${page.url}`, title: page.meta.short || page.meta.title }
  }
}

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Reorder">
  <rect width="64" height="64" rx="14" fill="#0B5D4F"/>
  <path d="M18 32a14 14 0 0 1 28 0" fill="none" stroke="#F2A93B" stroke-width="6" stroke-linecap="round"/>
  <path d="M46 32a14 14 0 0 1-28 0" fill="none" stroke="#8FD3C2" stroke-width="6" stroke-linecap="round"/>
  <path d="M41 27l5 5-5 5" fill="none" stroke="#F2A93B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M23 37l-5-5 5-5" fill="none" stroke="#8FD3C2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const THEME_BOOTSTRAP = `<script>(function(){try{var t=localStorage.getItem('reorder-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()</script>`

function navHtml(pages, groups, activeSource) {
  return groups
    .map((group) => {
      const items = group.pages
        .map((entry) => {
          const page = pages.find((candidate) => candidate.source === entry.source)
          if (!page) return ''
          const label = page.meta.short || page.meta.title
          const active = entry.source === activeSource ? ' aria-current="page" class="is-active"' : ''
          return `<li><a href="${BASE}${entry.url}"${active}>${escapeHtml(label)}</a></li>`
        })
        .join('\n')
      return `<div class="nav-group"><p class="nav-label">${escapeHtml(group.label)}</p><ul>${items}</ul></div>`
    })
    .join('\n')
}

function pageOrder(pages) {
  const flat = []
  for (const group of GROUPS) for (const entry of group.pages) flat.push(entry.source)
  return flat.map((source) => pages.find((page) => page.source === source)).filter(Boolean)
}

function shell({ page, pages, content, isHome, internalBuild }) {
  const ordered = pageOrder(pages)
  const position = ordered.findIndex((candidate) => candidate.source === page.source)
  const previous = position > 0 ? ordered[position - 1] : null
  const next = position >= 0 && position < ordered.length - 1 ? ordered[position + 1] : null

  const toc =
    page.headings && page.headings.filter((heading) => heading.level === 2).length > 1
      ? `<nav class="toc" aria-label="On this page"><p class="nav-label">On this page</p><ul>${page.headings
          .filter((heading) => heading.level === 2)
          .map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`)
          .join('')}</ul></nav>`
      : ''

  const pager = `<nav class="pager" aria-label="Document navigation">${
    previous ? `<a class="pager-link" href="${BASE}${previous.url}"><span>Previous</span><strong>${escapeHtml(previous.meta.title)}</strong></a>` : '<span></span>'
  }${
    next ? `<a class="pager-link pager-next" href="${BASE}${next.url}"><span>Next</span><strong>${escapeHtml(next.meta.title)}</strong></a>` : '<span></span>'
  }</nav>`

  const banner = internalBuild
    ? `<div class="internal-banner" role="note"><strong>Internal draft.</strong> Pre-development documentation. Not for public distribution.</div>`
    : ''

  const layoutClass = page.meta.layout === 'landing' ? 'layout-landing' : 'layout-doc'

  const seoTitle = page.meta.seoTitle || page.meta.title
  const description = page.meta.description || BRAND.category
  const canonical = absoluteUrl(page.url)
  const social = internalBuild
    ? ''
    : `<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND.name}">
<meta property="og:locale" content="en_NG">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${OG_IMAGE}">
<meta name="twitter:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}">
<link rel="apple-touch-icon" href="${BASE}/assets/apple-touch-icon.png">
<link rel="manifest" href="${BASE}/assets/site.webmanifest">
${(page.schema || []).map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`).join('\n')}`

  return `<!doctype html>
<html lang="${internalBuild ? 'en' : 'en-NG'}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(seoTitle)}${internalBuild || isHome || page.meta.seoTitle ? '' : ` · ${BRAND.name}`}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${internalBuild ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
<meta name="author" content="${BRAND.company}">
<meta name="theme-color" content="${BRAND.color}">
<meta property="og:title" content="${escapeHtml(seoTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
${social}
<link rel="icon" href="${BASE}/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${BASE}/assets/styles.css">
${THEME_BOOTSTRAP}
</head>
<body class="${layoutClass}">
<a class="skip-link" href="#main">Skip to content</a>
${banner}
<header class="topbar">
  <div class="topbar-inner">
    <button class="icon-button nav-toggle" type="button" aria-expanded="false" aria-controls="sidebar" data-nav-toggle>
      <span class="sr-only">Toggle navigation</span>
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <a class="brand" href="${BASE}/">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="28" height="28"><rect width="64" height="64" rx="14" fill="currentColor"/><path d="M18 32a14 14 0 0 1 28 0" fill="none" stroke="#F2A93B" stroke-width="7" stroke-linecap="round"/><path d="M46 32a14 14 0 0 1-28 0" fill="none" stroke="#8FD3C2" stroke-width="7" stroke-linecap="round"/></svg>
      </span>
      <span class="brand-text"><strong>${BRAND.name}</strong><small>${internalBuild ? 'Documentation' : 'Restocking infrastructure'}</small></span>
    </a>
    <div class="topbar-actions">
      <div class="search" data-search>
        <label class="sr-only" for="site-search">Search</label>
        <input id="site-search" type="search" placeholder="Search…" autocomplete="off" spellcheck="false" data-search-input>
        <div class="search-results" data-search-results hidden></div>
      </div>
      <button class="icon-button" type="button" data-theme-toggle aria-pressed="false">
        <span class="sr-only">Toggle colour theme</span>
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>
</header>
<div class="shell">
  <aside class="sidebar" id="sidebar" data-sidebar>
    <nav aria-label="Site sections">
${navHtml(pages, GROUPS, page.source)}
    </nav>
    <div class="sidebar-foot">
      <p class="sidebar-note">${internalBuild ? 'Internal draft · not for distribution' : `${BRAND.company}`}</p>
      <ul class="contact-list">
        <li><a class="sidebar-link" href="${BRAND.whatsappHref}" target="_blank" rel="noopener noreferrer">WhatsApp ${BRAND.phoneDisplay}</a></li>
        <li><a class="sidebar-link" href="mailto:${BRAND.email}">${BRAND.email}</a></li>
      </ul>
    </div>
  </aside>
  <main id="main" class="content">
${content}
${isHome ? '' : pager}
  </main>
  ${toc ? `<div class="toc-rail">${toc}</div>` : '<div class="toc-rail"></div>'}
</div>
<footer class="footer">
  <div class="footer-inner">
    <p><strong>${BRAND.name}</strong> — ${escapeHtml(BRAND.category)}</p>
    <p>${escapeHtml(BRAND.company)} · ${BRAND.domain}</p>
    <p class="footer-contact">
      <a href="${BRAND.whatsappHref}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <span aria-hidden="true">·</span>
      <a href="${BRAND.phoneHref}">${BRAND.phoneDisplay}</a>
      <span aria-hidden="true">·</span>
      <a href="mailto:${BRAND.email}">${BRAND.email}</a>
    </p>
  </div>
</footer>
<script src="${BASE}/assets/app.js" type="module"></script>
</body>
</html>`
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

async function main() {
  const entries = GROUPS.flatMap((group) => group.pages)
  const pages = []
  for (const entry of entries) {
    try {
      pages.push(await readPage(entry))
    } catch (error) {
      console.error(`Missing or unreadable source: ${entry.source} (${error.message})`)
      process.exitCode = 1
    }
  }
  if (!pages.length) {
    console.error('No pages built.')
    process.exit(1)
  }

  const resolveLink = buildLinkResolver(pages)
  const searchIndex = []

  await fs.rm(OUT_DIR, { recursive: true, force: true })
  await fs.mkdir(path.join(OUT_DIR, 'assets'), { recursive: true })

  for (const page of pages) {
    const headings = []
    const html = renderBlocks(
      page.body,
      { resolveLink, source: page.source, demoteHeadings: Boolean(page.demoteHeadings) },
      headings
    )
    page.html = html
    page.headings = headings

    searchIndex.push({
      u: `${BASE}${page.url}`,
      t: page.meta.title,
      h: headings.filter((heading) => heading.level === 2).map((heading) => heading.text),
      x: plainText(page.body).slice(0, 6000),
    })

    const isHome = page.url === '/'
    page.schema = buildSchema(page, isHome, page.body)
    const output = shell({ page, pages, content: html, isHome, internalBuild: SURFACE === 'internal' })
    const targetDir = page.url === '/' ? OUT_DIR : path.join(OUT_DIR, page.url.replace(/^\/|\/$/g, ''))
    await fs.mkdir(targetDir, { recursive: true })
    await fs.writeFile(path.join(targetDir, 'index.html'), output, 'utf8')
  }

  // Assets
  const REQUIRED_IMAGES = ['og-image.png', 'apple-touch-icon.png', 'logo-512.png']
  const assetFiles = await fs.readdir(path.join(__dirname, 'assets'))
  for (const file of assetFiles) {
    if (file === 'og-card.html') continue
    await fs.copyFile(path.join(__dirname, 'assets', file), path.join(OUT_DIR, 'assets', file))
  }
  if (SURFACE === 'public') {
    for (const image of REQUIRED_IMAGES) {
      if (!assetFiles.includes(image)) {
        console.error(`Missing ${image} — run: node site/make-images.mjs`)
        process.exitCode = 1
      }
    }
    await fs.writeFile(
      path.join(OUT_DIR, 'assets', 'site.webmanifest'),
      JSON.stringify(
        {
          name: `${BRAND.name} — ${BRAND.category}`,
          short_name: BRAND.name,
          description: 'Turn daily sales into a restock order, delivered to your business.',
          start_url: `${BASE}/`,
          scope: `${BASE}/`,
          display: 'standalone',
          background_color: '#FFFFFF',
          theme_color: BRAND.color,
          lang: 'en-NG',
          icons: [
            { src: `${BASE}/assets/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
            { src: `${BASE}/assets/logo-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: `${BASE}/assets/favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
          ],
        },
        null,
        2
      ),
      'utf8'
    )
  }
  await fs.writeFile(path.join(OUT_DIR, 'assets', 'favicon.svg'), FAVICON, 'utf8')
  await fs.writeFile(path.join(OUT_DIR, 'assets', 'search.json'), JSON.stringify(searchIndex), 'utf8')

  // 404
  const notFound = `<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found · ${BRAND.name}</title><link rel="stylesheet" href="${BASE}/assets/styles.css"><meta name="robots" content="noindex">
${THEME_BOOTSTRAP}</head>
<body class="layout-doc"><main id="main" class="content standalone"><h1>Page not found</h1>
<p>That page does not exist. Return to <a href="${BASE}/">the ${BRAND.name} ${SURFACE === 'internal' ? 'documentation index' : 'home page'}</a>.</p></main>
</body></html>`
  await fs.writeFile(path.join(OUT_DIR, '404.html'), notFound, 'utf8')

  // robots + sitemap
  if (SURFACE === 'internal') {
    await fs.writeFile(path.join(OUT_DIR, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8')
  } else {
    const lastmod = new Date().toISOString().slice(0, 10)
    const urls = pages
      .map(
        (page) =>
          `  <url>\n    <loc>${absoluteUrl(page.url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
          `    <changefreq>${page.url === '/' ? 'weekly' : 'monthly'}</changefreq>\n` +
          `    <priority>${page.url === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
      )
      .join('\n')
    await fs.writeFile(
      path.join(OUT_DIR, 'robots.txt'),
      `User-agent: *\nAllow: /\nSitemap: https://${BRAND.domain}/sitemap.xml\n`,
      'utf8'
    )
    await fs.writeFile(
      path.join(OUT_DIR, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      'utf8'
    )
  }

  const tables = (await Promise.all(pages.map((page) => page.html.split('<table>').length - 1))).reduce((a, b) => a + b, 0)
  console.log(`surface=${SURFACE} pages=${pages.length} tables=${tables} diagrams=${pages.reduce((a, p) => a + (p.html.split('data-mermaid').length - 1), 0)}`)
  console.log(`output=${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
