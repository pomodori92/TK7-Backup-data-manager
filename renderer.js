// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

import { shell } from 'electron';
import { readdirSync, statSync, unlinkSync, rmdirSync, copySync } from 'fs-extra';

const tekkenPath = `${process.env.LOCALAPPDATA}\\TekkenGame\\Saved\\SaveGames\\TEKKEN7`;
const backupPath = `${process.env.USERPROFILE}\\Saved Games\\TEKKEN7`;
const logPath = `${process.env.LOCALAPPDATA}\\TekkenGame\\Saved\\Logs`;


function openTekken7LocalDir() {
	snack('Not developed yet!');
}


function openSteamApiDir() {
	const wdl = require('windows-drive-letters');
	const letters = wdl.usedSync();

	letters.forEach((letter) => {
		searchPath(`${letter}:\\`);
	});
}


function searchPath(drive = '') {
	const creamApiInstallDir = '\\steamapps\\common\\TEKKEN 7\\Engine\\Binaries\\ThirdParty\\Steamworks\\Steamv132\\Win64';
	var finder = require('findit2')(drive);
	var path = require('path');
	var dirToCheck = '';

	finder.on('directory', function (dir, stat, stop, linkPath) {
		if (path.basename(dir) === 'Steam') {
			dirToCheck = `${dir}${creamApiInstallDir}`;
			if (fse.existsSync(dirToCheck)) {
				shell.openPath(dirToCheck).then(() => {
					snack('Folder opened successfully!');
					stop();
				})
			}
		}
	});
}


function cleanReplay() {
	try {
		let replayPath = readdirSync(tekkenPath).filter((dir) =>
			statSync(`${tekkenPath}\\${dir}`).isDirectory()
		);

		if (replayPath?.length !== 1)
			throw new RangeError('Too many Steam ID folders found!');

		replayPath = `${tekkenPath}\\${replayPath[0]}`
		readdirSync(replayPath)
			.filter((file) => file.indexOf('replay') >= 0)
			.forEach((file) => {
				unlinkSync(`${replayPath}\\${file}`);
			});
		snack('Replays deleted successfully!', 'info');
	} catch (error) {
		snack(error, 'error');
	}
}


function cleanLogs() {
	try {
		readdirSync(logPath)
			.filter((dir) => statSync(`${logPath}\\${dir}`).isDirectory())
			.forEach((dir) => {
				rmdirSync(`${logPath}\\${dir}`, { recursive: true }, (error) => {
					if (error)
						throw error;
				});
			});
		snack('Logs deleted successfully!', 'info');
	} catch (error) {
		snack(error, 'error');
	}
}


function openBackupDir() {
	shell.openPath(backupPath).then((error) => {
		if (error)
			snack(error, 'error');
	});
}


function openTekkenDir() {
	shell.openPath(tekkenPath).then((error) => {
		if (error)
			snack(error, 'error');
	});
}


function backupSave() {
	try {
		copySync(tekkenPath, backupPath);
		snack('Backupped successfully!');
	} catch (error) {
		snack(error, 'error');
	}
}


function importSave() {
	try {
		copySync(backupPath, tekkenPath);
		snack('Saves imported!');
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

		case 'info':
			console.info(message);
			break;

		default:
			console.log(message);
	}

	// Get the snackbar DIV
	let snack = document.getElementById('snackbar');
	snack.innerText = message;
	// Add the 'show' class to DIV
	snack.className = 'show';
	// After 3 seconds, remove the show class from DIV
	setTimeout(function () {
		snack.className = snack.className.replace('show', '');
	}, 1000);
}
