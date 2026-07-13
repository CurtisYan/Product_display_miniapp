const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const target = path.resolve(root, 'dist')
if (path.dirname(target) !== root || path.basename(target) !== 'dist') throw new Error('拒绝清理非项目 dist 目录')
try {
  fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 })
} catch (error) {
  if (error.code !== 'EBUSY' && error.code !== 'EPERM') throw error
  console.warn('dist 正被微信开发者工具占用，跳过删除并继续覆盖构建。')
}
