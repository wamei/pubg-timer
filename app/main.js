const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
const {dialog} = electron;
const {globalShortcut} = electron;
const {ipcMain} = electron;
const storage = require('electron-settings');
const path = require('path');

const MinWidth = 220;
const MinHeight = 40;
const MaxWidth = 220;
const MaxHeight = 100;

let mainWindow = null;
let resizeTimer = 0;
let isClickThrough = false;

app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: MinWidth,
        height: MinHeight,
        transparent: true,
        frame: false,
        resizable: false,
        webPreferences: {
            preload: path.resolve(path.join(__dirname, 'app.js'))
        }
    });

    var pos = storage.get("windowPosition", null);
    if (pos) {
        mainWindow.setPosition(pos[0], pos[1]);
    }

    mainWindow.setAlwaysOnTop(true, "floating", 1);

    mainWindow.loadURL('https://wamei.github.io/pubg-timer/');

    mainWindow.on('close', () => {
        storage.set("windowPosition", mainWindow.getPosition());
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    var setClickThrough = function(flag) {
        mainWindow.setIgnoreMouseEvents(flag);
        mainWindow.webContents.executeJavaScript('setWindowBorder('+!flag+')');
    };

    globalShortcut.register('Ctrl+F5', () => {
        mainWindow.webContents.executeJavaScript('timer.toggle();');
    });
    globalShortcut.register('Ctrl+F6', () => {
        isClickThrough = !isClickThrough;
        setClickThrough(isClickThrough);
    });
    globalShortcut.register('Ctrl+F7', () => {
        mainWindow.webContents.executeJavaScript('timer.time += 1000;');
    });
    globalShortcut.register('Ctrl+F8', () => {
        mainWindow.webContents.executeJavaScript('timer.time -= 1000;');
    });
    globalShortcut.register('Ctrl+Shift+F7', () => {
        mainWindow.webContents.executeJavaScript('$volume.value = $volume.value - 1; $volume.dispatchEvent(new Event("change"));');
        mainWindow.setSize(MaxWidth, MaxHeight);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            mainWindow.setSize(MinWidth, MinHeight);
        }, 500);
    });
    globalShortcut.register('Ctrl+Shift+F8', () => {
        mainWindow.webContents.executeJavaScript('$volume.value = $volume.value - 0 + 1; $volume.dispatchEvent(new Event("change"));');
        mainWindow.setSize(MaxWidth, MaxHeight);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            mainWindow.setSize(MinWidth, MinHeight);
        }, 500);
    });

    ipcMain.on('startTimer', (event, arg) => {
        isClickThrough = true;
        setClickThrough(isClickThrough);
    });
    ipcMain.on('stopTimer', (event, arg) => {
        isClickThrough = false;
        setClickThrough(isClickThrough);
    });
});
