const recursive = require('recursive-readdir')
const renderTemplate = require('./render-template')

module.exports = function createFileList(rootDirectory, oldState) {
  return new Promise((resolve, reject) => {
    const state = Object.assign({}, oldState)
    state.route = 'fileSearch'
    renderTemplate(state)

    recursive(rootDirectory, (err, files) => {
      state.totalFileCount = files.length
      state.filteredFiles = filterFileList(files)
      state.filteredFileCount = state.filteredFiles.length
      resolve(state)
    })
  })
}

function filterFileList(files) {
  const acceptableExtensions = ['mp3', 'm4a', 'mp4', 'ogg', 'flac', 'wma', 'asf', 'wmv']
  return files.filter((file) => {
    const segments = file.split('.')
    return !!~acceptableExtensions.indexOf(segments[segments.length-1])
  })
}


