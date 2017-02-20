const fs = require('fs')
const metadata = require('musicmetadata')
const promiseWhile = require('./promise-while')
const renderTemplate = require('./render-template')

module.exports = function processFiles(state) {
  return new Promise((resolve, reject) => {
    const paths = state.filteredFiles
    let id3DataArray = []
    let i = 0

    promiseWhile(() => {
      return i < paths.length
    }, () => {
      return new Promise((res, rej) => {
        const path = paths[i]
        i++
        getFileMetadata(path).then((data) => {
          id3DataArray.push(data)
          state.percentComplete = ~~(i / paths.length * 100)
          renderTemplate(state)
          res(data)
        }).catch((err) => {
          res({})
        })
      })
    }).then(() => {
      resolve(id3DataArray)
    })
  })
}

function getFileMetadata(path) {
  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(path)
    metadata(readableStream, (err, id3) => {
      if(err) reject(err)
      readableStream.close()
      resolve({
        artist: (id3.artist && id3.artist.length) ? id3.artist[0] : '',
        title: id3.title ? id3.title : '',
        album: id3.album ? id3.album : '',
      })
    })
  })
}
