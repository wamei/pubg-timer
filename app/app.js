const {ipcRenderer} = require('electron');
window.addEventListener('startTimer', () => {
    ipcRenderer.send('startTimer', '');
});
window.addEventListener('stopTimer', () => {
    ipcRenderer.send('stopTimer', '');
});
