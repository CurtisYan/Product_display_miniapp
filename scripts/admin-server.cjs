const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const root = path.resolve(__dirname, '..')
const adminDir = path.join(root, 'admin')
const catalogFile = path.join(root, 'src', 'data', 'catalog.json')
const port = 4177

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' }
const send = (res, status, body, type = 'application/json; charset=utf-8') => { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body) }

http.createServer((req, res) => {
  if (req.url === '/api/catalog' && req.method === 'GET') return send(res, 200, fs.readFileSync(catalogFile, 'utf8'))
  if (req.url === '/api/catalog' && req.method === 'PUT') {
    let body = ''
    req.on('data', chunk => { body += chunk; if (body.length > 2_000_000) req.destroy() })
    req.on('end', () => {
      try {
        const value = JSON.parse(body)
        if (!value.settings || !Array.isArray(value.categories) || !Array.isArray(value.products) || !Array.isArray(value.companyShowcase)) throw new Error('配置结构不完整')
        fs.writeFileSync(catalogFile, JSON.stringify(value, null, 2) + '\n', 'utf8')
        exec(process.platform === 'win32' ? 'npm.cmd run build:weapp' : 'npm run build:weapp', { cwd: root, timeout: 120000 }, (buildError) => {
          if (buildError) return send(res, 500, JSON.stringify({ ok: false, message: '配置已保存，但小程序构建失败，请查看终端。' }))
          send(res, 200, JSON.stringify({ ok: true, built: true }))
        })
      } catch (error) { send(res, 400, JSON.stringify({ ok: false, message: error.message })) }
    })
    return
  }
  const requested = req.url === '/' ? 'index.html' : req.url.slice(1)
  const file = path.resolve(adminDir, requested)
  if (!file.startsWith(adminDir) || !fs.existsSync(file)) return send(res, 404, 'Not found', 'text/plain')
  send(res, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream')
}).listen(port, '127.0.0.1', () => console.log(`美塑商品管理：http://127.0.0.1:${port}`))
