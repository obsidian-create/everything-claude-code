const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 3000;
let mainWindow;
let serverProcess;

// Start the Express backend
function startServer() {
  const isPackaged = app.isPackaged;
  const backendPath = isPackaged
    ? path.join(process.resourcesPath, 'backend', 'server.js')
    : path.join(__dirname, '../backend/server.js');

  const nodeExe = process.execPath;

  serverProcess = spawn(nodeExe, [backendPath], {
    env: { ...process.env, PORT: String(PORT), ELECTRON: '1' },
    stdio: 'pipe',
  });

  serverProcess.stdout.on('data', d => console.log('[backend]', d.toString()));
  serverProcess.stderr.on('data', d => console.error('[backend]', d.toString()));
  serverProcess.on('exit', code => console.log('[backend] exited with code', code));
}

// Wait until backend is ready, then open window
function waitForServer(callback, retries = 20) {
  http.get(`http://localhost:${PORT}/api/health`, (res) => {
    if (res.statusCode === 200) callback();
    else retry();
  }).on('error', retry);

  function retry() {
    if (retries <= 0) { callback(); return; }
    setTimeout(() => waitForServer(callback, retries - 1), 500);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Rechnungstool',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../frontend/public/icon.png'),
    show: false,
    backgroundColor: '#f9fafb',
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', () => {
  startServer();
  waitForServer(createWindow);
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    waitForServer(createWindow);
  }
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
