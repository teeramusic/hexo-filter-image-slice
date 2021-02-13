const path = require('path')
const config = require('./lib/config')
function getNewPath(oldPath, options) {
  const name = path.basename(oldPath,path.extname(oldPath))
  const dir = path.dirname(oldPath)
  const base = name+'.webp'
  if (dir === '.') {
    return options.prefix + '_' + base
  }

  return dir + '/' + options.prefix + '_' + base
}

module.exports = getNewPath
