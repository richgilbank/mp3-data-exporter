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
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.openDevTools()

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
      title: 'Save CSV as...',
      defaultPath: path.join(musicPath, 'Tracks.csv')
    }
    dialog.showSaveDialog(mainWindow, dialogOptions, (filePath) => {
      if(filePath) event.sender.send('openSaveDialog', filePath)
    })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
