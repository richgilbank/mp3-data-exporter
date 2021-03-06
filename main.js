const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
} = require('electron')

const path = require('path')
const url = require('url')

let mainWindow
let musicPath = ''

function createWindow () {
  mainWindow = new BrowserWindow({width: 320, height: 520, titleBarStyle: 'hidden-inset'})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  ipcMain.on('openDirectoryDialog', (event, arg) => {
    const dialogOptions = {
      title: 'Choose a music directory',
      properties: ['openDirectory']
    }
    dialog.showOpenDialog(mainWindow, dialogOptions, (filePaths) => {
      if(filePaths) {
        event.sender.send('openDirectoryDialog', filePaths[0])
        musicPath = filePaths[0]
      }
    })
  })

  ipcMain.on('openSaveDialog', (event, arg) => {
    const dialogOptions = {
      title: 'Save file as...',
      defaultPath: path.join(musicPath, `Tracks.${arg}`)
    }
    dialog.showSaveDialog(mainWindow, dialogOptions, (filePath) => {
      if(filePath) event.sender.send('openSaveDialog', filePath, arg)
    })
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
