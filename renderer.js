const {ipcRenderer} = require('electron')
const fs = require('fs')
const json2csv = require('json2csv')
const renderTemplate = require('./render-template')
const createFileList = require('./create-file-list')
const processFiles = require('./process-files')

let id3Data = []
let state = {
  route: 'start'
}
renderTemplate(state)

function onCloseDirectoryDialog(event, rootDir) {
  createFileList(rootDir, state)
    .then((newState) => {
      state = newState
      state.route = 'fileProcess'
      state.percentComplete = 0
      renderTemplate(state)
      return Promise.resolve()
    })
    .then(() => {
      return processFiles(state)
    })
    .then((data) => {
      id3Data = data
      state.route = 'processingComplete'
      renderTemplate(state)
    })
}

function onCloseSaveDialog(event, filename, type) {
  switch(type) {
    case 'm3u':
      saveToM3U(filename)
      break;
    case 'csv':
      saveToCSV(filename)
      break;
  }
}

function saveToCSV(filename) {
  const fields = ['artist', 'title', 'album']
  const csv = json2csv({data: id3Data, fields})
  writeToFile(filename, csv)
}

function saveToM3U(filename) {
  let m3uLineArray = ['#EXTM3U']
  id3Data.forEach((track) => {
    m3uLineArray.push(`#EXTINF:-1,${track.artist} - ${track.title}
fakepath.mp3`)
  })
  writeToFile(filename, m3uLineArray.join("\n"))
}

function writeToFile(filename, contents) {
  fs.writeFile(filename, contents, (err) => {
    if(err) alert(err)
  })
}

ipcRenderer.on('openDirectoryDialog', onCloseDirectoryDialog)
ipcRenderer.on('openSaveDialog', onCloseSaveDialog)

const clickHandlers = {
  OpenDirectorySelection: (() => ipcRenderer.send('openDirectoryDialog')),
  StopReading: (() => interruptReading = true),
  SaveToCSV: (() => ipcRenderer.send('openSaveDialog', 'csv')),
  SaveToM3U: (() => ipcRenderer.send('openSaveDialog', 'm3u'))
}

document.addEventListener('click', (evt) => {
  if(evt.target.id in clickHandlers) clickHandlers[evt.target.id]()
})
