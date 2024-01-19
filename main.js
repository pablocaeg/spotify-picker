const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'display.html'));
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('close', () => {
    app.quit()
})

ipcMain.on('minimize', () => {
    let win = BrowserWindow.getFocusedWindow()
    win.minimize()
})

ipcMain.on('expand', () => {
    let win = BrowserWindow.getFocusedWindow()
    win.maximize()
})

ipcMain.on('dev', () => {
  let win = BrowserWindow.getFocusedWindow()
  win.openDevTools()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
