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
    //mainWindow.loadURL('file://' + __dirname + '/../index.html');

    var defaultShortcuts = {
        StartAndStop: 'F5',
        ToggleWindowMoveMode: 'F6',
        ForwardTime: 'F7',
        BackwordTime: 'F8',
        VolumeUp: 'Ctrl+F7',
        VolumeDown: 'Ctrl+F8'
    };
    var shortcuts = storage.get("shortcuts", defaultShortcuts);

    mainWindow.on('close', () => {
        storage.set("windowPosition", mainWindow.getPosition());
        storage.set("shortcuts", shortcuts);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    var setClickThrough = function(flag) {
        mainWindow.setIgnoreMouseEvents(flag);
        mainWindow.webContents.executeJavaScript('setWindowBorder('+!flag+')');
    };

    var methods = {
        StartAndStop: () => {
            mainWindow.webContents.executeJavaScript('timer.toggle();');
        },
        ToggleWindowMoveMode: () => {
            isClickThrough = !isClickThrough;
            setClickThrough(isClickThrough);
            if (!isClickThrough) {
                mainWindow.focus();
            }
        },
        ForwardTime: () => {
            mainWindow.webContents.executeJavaScript('timer.forwardTime();');
        },
        BackwordTime: () => {
            mainWindow.webContents.executeJavaScript('timer.backwardTime();');
        },
        VolumeUp: () => {
            mainWindow.webContents.executeJavaScript('$volume.value = $volume.value - 1; $volume.dispatchEvent(new Event("change"));');
            mainWindow.setSize(MaxWidth, MaxHeight);
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                mainWindow.setSize(MinWidth, MinHeight);
            }, 500);
        },
        VolumeDown: () => {
            mainWindow.webContents.executeJavaScript('$volume.value = $volume.value - 0 + 1; $volume.dispatchEvent(new Event("change"));');
            mainWindow.setSize(MaxWidth, MaxHeight);
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                mainWindow.setSize(MinWidth, MinHeight);
            }, 500);
        }
    };

    var registerShortcut = (accelorator, functionName) => {
        if (!methods[functionName]) {
            return;
        }
        globalShortcut.register(accelorator, methods[functionName]);
    };

    for (var key in shortcuts) {
        if (!shortcuts.hasOwnProperty(key)) {
            continue;
        }
        registerShortcut(shortcuts[key], key);
    }

    ipcMain.on('startTimer', (event, arg) => {
        isClickThrough = true;
        setClickThrough(isClickThrough);
    });
    ipcMain.on('stopTimer', (event, arg) => {
        isClickThrough = false;
        setClickThrough(isClickThrough);
    });
});
