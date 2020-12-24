import electron, { BrowserWindow } from 'electron';

let window: BrowserWindow = null;

function createWindow() {
    window = new BrowserWindow({
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
        },
        resizable: true,
    });

    window.setMenu(null);
    window.loadFile('www/index.html');
    window.webContents.openDevTools();

    window.on('closed', () => {
        window = null;
    });
}

electron.app.on('ready', createWindow);

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});

electron.app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});

process
    .on('unhandledRejection', (exception: Error, promise) => {
        console.log('Unhandled rejection at Promise');
        console.log(exception.toString());
        console.log(exception.stack);
        console.log(promise);
    })
    .on('uncaughtException', (exception: Error) => {
        console.log('Unhandled exception thrown');
        console.log(exception.toString());
        console.log(exception.stack);
    });