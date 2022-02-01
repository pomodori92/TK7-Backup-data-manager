// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron');
const fs = require('fs-extra');

let username = require("os").userInfo().username;
const openExplorer = require('open-file-explorer');
const backupPath = '%LOCALAPPDATA%\\TekkenGame\\Saved\\SaveGames\\BackupTEKKEN7';
const tekkenPath = '%LOCALAPPDATA%\\TekkenGame\\Saved\\SaveGames\\TEKKEN7';
const tekkenPath2 = '/Users/'+username+'/AppData/Local/TekkenGame/Saved/SaveGames/TEKKEN7/';
const backupPath2 = '/Users/'+username+'/AppData/Local/TekkenGame/Saved/SaveGames/TekkenSaveBackup';

function openBackupDir() {
    openExplorer(backupPath, error => {
        if (error)
            snack(error, 'error');
    });
}

function openTekkenDir() {
    openExplorer(tekkenPath, error => {
        if (error)
            snack(error, 'error');
    });
}

function backupSave() {
    try {
        fs.copySync(tekkenPath, backupPath);
        snack('Success!');
    } catch (error) {
        snack(error, 'error');
    }
}

function importSave() {
    try {
        fs.copySync(backupPath, tekkenPath);
        snack('Success!');
    } catch (error) {
        snack(error, 'error');
    }
}

function snack(message, messageType = '') {
    if (!message)
        return;

    switch (messageType.toLowerCase()) {
        case 'error':
            console.error(message);
            break;
        default:
            console.log(message);
    }
    // Get the snackbar DIV
    let snack = document.getElementById("snackbar");
    snack.innerText = message;
    // Add the "show" class to DIV
    snack.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function() {
        snack.className = snack.className.replace("show", "");
    }, 3000);
}
