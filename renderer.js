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

function onCloseSaveDialog(event, fileName) {
  const fields = ['artist', 'title', 'album']
  const csv = json2csv({data: id3Data, fields})
  fs.writeFile(fileName, csv, (err) => {
    if(err) throw err;
  })
}

ipcRenderer.on('openDirectoryDialog', onCloseDirectoryDialog)
ipcRenderer.on('openSaveDialog', onCloseSaveDialog)

const clickHandlers = {
  OpenDirectorySelection: (() => ipcRenderer.send('openDirectoryDialog')),
  StopReading: (() => interruptReading = true),
  SaveToCSV: (() => ipcRenderer.send('openSaveDialog'))
}

document.addEventListener('click', (evt) => {
  if(evt.target.id in clickHandlers) clickHandlers[evt.target.id]()
})
