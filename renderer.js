// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron');
const fse = require('fs-extra');
const openExplorer = require('open-file-explorer');

const tekkenPath = process.env.LOCALAPPDATA + '\\TekkenGame\\Saved\\SaveGames\\TEKKEN7';
const backupPath = process.env.HOMEPATH + '\\Saved Games\\TEKKEN7';


function openBackupDir() {
	openExplorer(backupPath, (error) => {
		if (error)
			snack(error, "error");
	});
}


function openTekkenDir() {
	openExplorer(tekkenPath, (error) => {
		if (error)
			snack(error, "error");
	});
}


function backupSave() {
	try {
		fse.copySync(tekkenPath, backupPath);
		snack("Success!");
	} catch (error) {
		snack(error, "error");
	}
}


function importSave() {
	try {
		fse.copySync(backupPath, tekkenPath);
		snack("Success!");
	} catch (error) {
		snack(error, "error");
	}
}


function snack(message, messageType = "") {
	if (!message)
		return;

	switch (messageType.toLowerCase()) {
		case "error":
			console.error(message);
			break;

		case "info":
			console.info(message);
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
	setTimeout(function () {
		snack.className = snack.className.replace("show", "");
	}, 3000);
}
