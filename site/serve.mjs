#!/usr/bin/env node
// Minimal static file server for local verification of the built site.
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const dirArg = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'dist'
const portArg = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : 4321
const SERVE_ROOT = path.isAbsolute(dirArg) ? dirArg : path.join(ROOT, dirArg)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function safeJoin(base, target) {
  const resolved = path.resolve(base, '.' + path.posix.normalize('/' + target))
  return resolved.startsWith(base) ? resolved : null
}

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const candidates = []
  const direct = safeJoin(SERVE_ROOT, decoded)
  if (!direct) return null
  candidates.push(direct)
  if (decoded.endsWith('/') || decoded === '/') candidates.push(path.join(direct, 'index.html'))
  else candidates.push(direct + '.html', path.join(direct, 'index.html'))

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isFile()) return candidate
    } catch {
      // keep looking
    }
  }
  return null
}

const server = http.createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url || '/')
    if (!file) {
      const notFound = path.join(SERVE_ROOT, '404.html')
      try {
        const body = await fs.readFile(notFound)
        res.writeHead(404, { 'Content-Type': TYPES['.html'] })
        res.end(body)
        return
      } catch {
        res.writeHead(404, { 'Content-Type': TYPES['.txt'] })
        res.end('404 Not Found')
        return
      }
    }
    const ext = path.extname(file).toLowerCase()
    const body = await fs.readFile(file)
    res.writeHead(200, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(body)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': TYPES['.txt'] })
    res.end('500 ' + error.message)
  }
})

server.listen(portArg, () => {
  console.log(`Serving ${SERVE_ROOT}`)
  console.log(`http://localhost:${portArg}/`)
})
