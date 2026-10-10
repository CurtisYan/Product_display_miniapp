const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const staging = path.join(root, '.build-weapp')
const output = path.join(root, 'dist')

if (path.dirname(staging) !== root || path.dirname(output) !== root) throw new Error('构建目录不在项目内')
fs.rmSync(staging, { recursive: true, force: true })

function copyFiles(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })
  entries.sort((a, b) => Number(a.name === 'app.json') - Number(b.name === 'app.json'))
  for (const entry of entries) {
    const source = path.join(sourceDir, entry.name)
    const target = path.join(targetDir, entry.name)
    if (entry.isDirectory()) {
      copyFiles(source, target)
    } else if (entry.isFile()) {
      const temporary = path.join(targetDir, `.${entry.name}.${process.pid}.tmp`)
      fs.copyFileSync(source, temporary)
      fs.renameSync(temporary, target)
    } else {
      throw new Error(`不支持的构建产物：${source}`)
    }
  }
}

function removeStaleFiles(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name)
    const target = path.join(targetDir, entry.name)
    if (!fs.existsSync(source)) {
      fs.rmSync(target, { recursive: true, force: true })
    } else if (entry.isDirectory()) {
      removeStaleFiles(source, target)
    }
  }
}

function publish() {
  if (!fs.existsSync(path.join(staging, 'app.json'))) throw new Error('构建成功但缺少 app.json')
  if (fs.existsSync(output) && !fs.lstatSync(output).isDirectory()) throw new Error('dist 不是项目目录')
  copyFiles(staging, output)
  removeStaleFiles(staging, output)
}

const watch = process.argv.includes('--watch')
const args = [require.resolve('@tarojs/cli/bin/taro'), 'build', '--type', 'weapp', ...(watch ? ['--watch'] : [])]
const options = { cwd: root, env: { ...process.env, MEISU_BUILD_OUTPUT_ROOT: '.build-weapp' } }

if (watch) {
  const child = spawn(process.execPath, args, { ...options, stdio: ['inherit', 'pipe', 'pipe'] })
  let tail = ''
  child.stdout.on('data', chunk => {
    process.stdout.write(chunk)
    const message = tail + chunk.toString()
    for (const match of message.matchAll(/Compiled successfully/g)) {
      try { publish() } catch (error) { console.error(error) }
    }
    tail = message.slice(-20)
  })
  child.stderr.pipe(process.stderr)
  child.on('error', error => { console.error(error); process.exitCode = 1 })
  child.on('exit', code => {
    fs.rmSync(staging, { recursive: true, force: true })
    process.exitCode = code || 0
  })
  process.on('SIGINT', () => child.kill('SIGINT'))
  process.on('SIGTERM', () => child.kill('SIGTERM'))
} else {
  const result = spawnSync(process.execPath, args, { ...options, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
  publish()
  fs.rmSync(staging, { recursive: true, force: true })
}
