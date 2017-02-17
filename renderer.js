const {ipcRenderer} = require('electron')
const recursive = require('recursive-readdir')
const path = require('path')
const fs = require('fs')
const mm = require('musicmetadata')
const json2csv = require('json2csv')

let interruptReading = false
let tracks = []

ipcRenderer.on('openDirectoryDialog', (event, rootDir) => {
  const outputNode = document.getElementById('Output')
  outputNode.innerHTML = 'Starting the search for files...'
  recursive(rootDir, (err, files) => {
    interruptReading = false
    tracks = []
    outputNode.innerHTML += `${files.length} total files found. `
    const filteredFileList = filterFileList(files)
    outputNode.innerHTML += `<br>${filteredFileList.length} files matching music extensions.`
    outputNode.innerHTML += `<br>Starting ID3 tag reading.`
    outputNode.innerHTML += `<button id="StopReading">Stop</button>`

    const progressPercentage = document.createElement('div')
    progressPercentage.innerText = '0% complete'
    outputNode.appendChild(progressPercentage)

    filteredFileList.forEach((file, i) => {
      if(interruptReading) return;
      const readableStream = fs.createReadStream(file)
      mm(readableStream, (err, metadata) => {
        if(err) throw err;
        readableStream.close()
        const data = {
          artist: (metadata.artist && metadata.artist.length) ? metadata.artist[0] : '',
          title: metadata.title ? metadata.title : '',
          album: metadata.album ? metadata.album : '',
        }
        tracks.push(data)
        progressPercentage.innerText = `${Math.floor((i+1) / filteredFileList.length * 100)}% complete`
        if(i+1 == filteredFileList.length) {
          onProcessingComplete()
        }
      })
    })
  })
})

ipcRenderer.on('openSaveDialog', (event, fileName) => {
  const fields = ['artist', 'title', 'album']
  const csv = json2csv({data: tracks, fields})
  fs.writeFile(fileName, csv, (err) => {
    if(err) throw err;
    console.log('file saved')
  })
})

function onProcessingComplete() {
  const button = document.getElementById('StopReading')
  button.innerText = 'Save list to CSV'
  button.id = 'SaveToCSV'
}

function filterFileList(files) {
  const acceptableExtensions = ['mp3', 'm4a', 'mp4', 'ogg', 'flac', 'wma', 'asf', 'wmv']
  return files.filter((file) => {
    const segments = file.split('.')
    return !!~acceptableExtensions.indexOf(segments[segments.length-1])
  })
}


const clickHandlers = {
  OpenDirectorySelection: (() => ipcRenderer.send('openDirectoryDialog')),
  StopReading: (() => interruptReading = true),
  SaveToCSV: (() => ipcRenderer.send('openSaveDialog'))
}

document.addEventListener('click', (evt) => {
  if(evt.target.id in clickHandlers) clickHandlers[evt.target.id]()
})
