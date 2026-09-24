/* Reorder site behaviour: theme, navigation, search, diagrams.
   Loaded as a module so import.meta.url gives a base-path-agnostic site root. */

const siteRoot = new URL('../', import.meta.url)
const root = document.documentElement

/* ---------------------------- Theme ---------------------------- */

const themeButton = document.querySelector('[data-theme-toggle]')

function applyTheme(theme) {
  root.dataset.theme = theme
  try {
    localStorage.setItem('reorder-theme', theme)
  } catch {
    /* storage unavailable — theme still applies for this page view */
  }
  if (themeButton) themeButton.setAttribute('aria-pressed', String(theme === 'dark'))
}

if (themeButton) {
  themeButton.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'))
  themeButton.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
  })
}

/* -------------------------- Mobile nav -------------------------- */

const navToggle = document.querySelector('[data-nav-toggle]')
const sidebar = document.querySelector('[data-sidebar]')

if (navToggle && sidebar) {
  navToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open')
    navToggle.setAttribute('aria-expanded', String(open))
  })
}

/* ---------------------------- Search ---------------------------- */

const searchRoot = document.querySelector('[data-search]')
const searchInput = document.querySelector('[data-search-input]')
const searchResults = document.querySelector('[data-search-results]')
let searchIndex = null

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

async function loadIndex() {
  if (searchIndex) return searchIndex
  try {
    const response = await fetch(new URL('assets/search.json', siteRoot))
    searchIndex = await response.json()
  } catch {
    searchIndex = []
  }
  return searchIndex
}

function scoreEntry(entry, terms) {
  const title = entry.t.toLowerCase()
  const headings = (entry.h || []).join(' ').toLowerCase()
  const body = (entry.x || '').toLowerCase()
  let score = 0
  for (const term of terms) {
    if (title.includes(term)) score += 12
    if (headings.includes(term)) score += 6
    const hits = body.split(term).length - 1
    if (hits) score += Math.min(hits, 6)
  }
  return score
}

function snippet(entry, terms) {
  const body = entry.x || ''
  const lower = body.toLowerCase()
  for (const term of terms) {
    const at = lower.indexOf(term)
    if (at >= 0) {
      const start = Math.max(0, at - 48)
      return (start > 0 ? '…' : '') + body.slice(start, at + 110).trim() + '…'
    }
  }
  return body.slice(0, 120) + '…'
}

async function runSearch(query) {
  if (!searchResults) return
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1)
  if (!terms.length) {
    searchResults.hidden = true
    searchResults.innerHTML = ''
    return
  }
  const index = await loadIndex()
  const matches = index
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  searchResults.hidden = false
  if (!matches.length) {
    searchResults.innerHTML = '<p class="search-empty">No matches in this documentation set.</p>'
    return
  }
  searchResults.innerHTML = matches
    .map(
      ({ entry }) =>
        `<a href="${escapeHtml(entry.u)}"><strong>${escapeHtml(entry.t)}</strong><span>${escapeHtml(snippet(entry, terms))}</span></a>`
    )
    .join('')
}

if (searchInput && searchResults) {
  let debounce
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => runSearch(searchInput.value), 110)
  })
  searchInput.addEventListener('focus', () => {
    void loadIndex()
    if (searchInput.value.trim().length > 1) void runSearch(searchInput.value)
  })
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      searchResults.hidden = true
      searchInput.blur()
    }
    if (event.key === 'Enter') {
      const first = searchResults.querySelector('a')
      if (first) first.click()
    }
  })
  document.addEventListener('click', (event) => {
    if (searchRoot && !searchRoot.contains(event.target)) searchResults.hidden = true
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== searchInput) {
      event.preventDefault()
      searchInput.focus()
    }
  })
}

/* --------------------------- Diagrams --------------------------- */

/** Turn mermaid source into a readable ordered transition list (offline fallback). */
function diagramToFlow(source) {
  const lines = source.split('\n').map((line) => line.trim())
  const titles = new Map()
  const steps = []

  const readNode = (raw) => {
    const clean = raw.replace(/\|[^|]*\|/g, '').trim()
    if (clean === '[*]') return 'Start or end'
    const match = clean.match(/^([\w-]+)\s*(?:\[([^\]]*)\]|\{([^}]*)\}|\(\(([^)]*)\)\)|\(([^)]*)\))?$/)
    if (!match) return clean.replace(/[[\]{}()]/g, '').trim() || clean
    const [, id, square, curly, double, round] = match
    const label = (square || curly || double || round || '').trim()
    if (label) titles.set(id, label)
    return label || id
  }

  for (const line of lines) {
    if (!line || /^(flowchart|graph|stateDiagram|stateDiagram-v2|classDiagram|sequenceDiagram|%%|style|classDef|class|linkStyle|direction)/i.test(line)) {
      continue
    }
    const edge = line.match(/^(.+?)\s*-->\s*(.+)$/)
    if (!edge) continue

    let target = edge[2]
    let condition = ''
    const colon = target.match(/^(.*?):\s*(.+)$/)
    if (colon) {
      target = colon[1]
      condition = colon[2]
    }
    const inlineCondition = target.match(/^\|([^|]*)\|\s*(.*)$/)
    if (inlineCondition) {
      condition = inlineCondition[1]
      target = inlineCondition[2]
    }
    steps.push({ from: readNode(edge[1]), to: readNode(target), condition })
  }

  if (!steps.length) return null
  const items = steps
    .map((step) => {
      const label = step.condition ? `<span class="flow-label">${escapeHtml(step.condition)}</span>` : ''
      return `<li>${label}${escapeHtml(step.from)} → ${escapeHtml(step.to)}</li>`
    })
    .join('')
  return `<ol class="flow">${items}</ol>`
}

function applyDiagramFallback(node) {
  const figure = node.closest('.diagram')
  const source = node.textContent || ''
  const flow = diagramToFlow(source)
  if (figure) figure.classList.add('is-fallback')
  if (flow) node.innerHTML = flow
}

async function renderDiagrams() {
  const nodes = Array.from(document.querySelectorAll('[data-mermaid]'))
  if (!nodes.length) return

  // Show a readable flow immediately so the raw diagram source is never on screen,
  // then upgrade to a rendered diagram only if the diagram renderer is reachable.
  for (const node of nodes) node.__source = node.textContent || ''
  nodes.forEach(applyDiagramFallback)

  try {
    const module = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    const mermaid = module.default ?? module
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
      fontFamily: 'inherit',
    })
    for (const node of nodes) {
      node.textContent = node.__source
      const figure = node.closest('.diagram')
      if (figure) figure.classList.remove('is-fallback')
    }
    await mermaid.run({ nodes })
  } catch {
    /* offline or blocked: the readable flow stays in place */
  }
}

void renderDiagrams()

/* ------------------- Table of contents highlight ------------------- */

const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'))
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(tocLinks.map((link) => [link.getAttribute('href').slice(1), link]))
  const observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue
        const link = byId.get(record.target.id)
        if (!link) continue
        tocLinks.forEach((candidate) => candidate.removeAttribute('aria-current'))
        link.setAttribute('aria-current', 'true')
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  for (const id of byId.keys()) {
    const heading = document.getElementById(id)
    if (heading) observer.observe(heading)
  }
}
