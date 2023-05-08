// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { shell } = require('electron');
const fse = require('fs-extra');

const tekken7SavePath = `${process.env.LOCALAPPDATA}\\TekkenGame\\Saved\\SaveGames\\TEKKEN7`;
const backupPath = `${process.env.USERPROFILE}\\Saved Games\\TEKKEN7`;


function changeImage(elem, newImage) {
	if (!newImage || !elem || elem.childElementCount < 1)
		snack('Error! Element not found or without children!', 'error');

	elem.childNodes.forEach(child => {
		if (child.src) {
			child.src = newImage;
			return;
		}
	});
}


function openTekken7LocalDir() {
	const tekken7LocalDir = '\\steamapps\\common\\TEKKEN 7';

	searchSteamPath(tekken7LocalDir);
}


function openSteamApiDir() {
	const steamApiInstallDir = '\\steamapps\\common\\TEKKEN 7\\Engine\\Binaries\\ThirdParty\\Steamworks\\Steamv132\\Win64';

	searchSteamPath(steamApiInstallDir);
}


function searchSteamPath(pathToJoin = '') {
	if (!pathToJoin) {
		snack('Error! Path to join not specified!', 'error');
		return;
	}

	const wdl = require('windows-drive-letters');
	const letters = wdl.usedSync();

	letters.forEach((letter) => {
		finder(`${letter}:\\`, pathToJoin);
	});
}


function finder(drive = '', pathToJoin = '') {
	if (!drive || drive == ':\\') {
		snack('Error! Drive not specified!', 'error');
		return;
	}

	if (!pathToJoin) {
		snack('Error! Path to join not specified!', 'error');
		return;
	}

	var finder = require('findit2')(drive);
	var path = require('path');
	var dirToCheck = '';

	finder.on('directory', function (dir, stat, stop, linkPath) {
		if (path.basename(dir) === 'Steam') {
			dirToCheck = `${dir}${pathToJoin}`;
			if (fse.existsSync(dirToCheck)) {
				shell.openPath(dirToCheck).then(() => {
					snack('Folder opened successfully!');
					stop();
				})
			}
		}
	});
}


function deleteReplays() {
	try {
		let replayPath = fse.readdirSync(tekkenPath).filter((dir) =>
			fse.statSync(`${tekkenPath}\\${dir}`).isDirectory()
		);

		if (replayPath?.length !== 1)
			throw new RangeError('Too many Steam ID folders found!');

		replayPath = `${tekkenPath}\\${replayPath[0]}`
		fse
			.readdirSync(replayPath)
			.filter((file) => file.indexOf('replay') >= 0)
			.forEach((file) => {
				fse.unlinkSync(`${replayPath}\\${file}`);
			});
		snack('Replays deleted successfully!', 'info');
	} catch (error) {
		snack(error, 'error');
	}
}


function cleanLogs() {
	const logPath = `${process.env.LOCALAPPDATA}\\TekkenGame\\Saved\\Logs`;

	try {
		fse
			.readdirSync(logPath)
			.filter((dir) => fse.statSync(`${logPath}\\${dir}`).isDirectory())
			.forEach((dir) => {
				fse.rmdirSync(`${logPath}\\${dir}`, { recursive: true }, (error) => {
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
	snack('Folder opened!');
}


function openTekkenDir() {
	shell.openPath(tekken7SavePath).then((error) => {
		if (error)
			snack(error, 'error');
	});
	snack('Folder opened!');
}


function backupSave() {
	try {
		fse.copySync(tekken7SavePath, backupPath);
		snack('Backupped successfully!');
	} catch (error) {
		snack(error, 'error');
	}
}


function importSave() {
	try {
		fse.copySync(backupPath, tekkenPath);
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
