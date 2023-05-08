// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { shell } = require('electron');
const { existsSync, readdir, stat, copy, unlink, statSync, rmdirSync } = require('fs-extra');
const { join } = require('path');

const tekken7SavePath = join(process.env.LOCALAPPDATA, 'TekkenGame', 'Saved', 'SaveGames', 'TEKKEN7');
const backupPath = join(process.env.USERPROFILE, 'Saved Games', 'TEKKEN7');


function changeImage(elem, newImage) {
	if (!newImage || !elem?.hasChildNodes())
		snack('Error! Element not found!', 'error');

	const imgEl = elem.querySelector('img[src]');
	if (!imgEl?.src)
		return imgEl.src = newImage;
}


function openTekken7LocalDir() {
	const tekken7LocalDir = join('steamapps', 'common', 'TEKKEN 7');

	searchSteamPath(tekken7LocalDir);
}


function openSteamApiDir() {
	const steamApiInstallDir = join('steamapps', 'common', 'TEKKEN 7', 'Engine', 'Binaries', 'ThirdParty', 'Steamworks', 'Steamv132', 'Win64');

	searchSteamPath(steamApiInstallDir);
}


function searchSteamPath(pathToJoin = '') {
	const { usedSync } = require('windows-drive-letters');

	if (!pathToJoin)
		return snack('Error! Path to join not specified!', 'error');

	const letters = usedSync();

	for (const letter of letters)
		finder(`${letter}:\\`, pathToJoin);
}


function finder(drive = '', pathToJoin = '') {
	if (!drive || drive === ':\\')
		return snack('Error! Drive not specified!', 'error');

	if (!pathToJoin)
		return snack('Error! Path to join not specified!', 'error');

	const finder = require('findit2')(drive);
	finder.on('directory', async function (dir, stat, stop, linkPath) {
		if (path.basename(dir) !== 'Steam')
			return;

		try {
			const dirToCheck = join(dir, pathToJoin);
			if (!existsSync(dirToCheck))
				return;
			await shell.openPath(dirToCheck);
			snack('Folder opened successfully!');
			stop();
		} catch (error) {
			snack(`Error opening folder: ${error.message}`, 'error');
		}
	});
}


async function deleteReplays() {
	try {
		const replayPath = await readdir(tekken7SavePath);
		const subdirectories = replayPath.filter(async (dir) => {
			const stats = await stat(join(tekken7SavePath, dir));
			return stats.isDirectory();
		});

		if (subdirectories.length !== 1) {
			throw new RangeError('Too many Steam ID folders found!');
		}

		const replayFiles = await readdir(join(tekken7SavePath, subdirectories[0]));
		const replayFilesToDelete = replayFiles.filter((file) => file.indexOf('replay') >= 0);
		await Promise.all(replayFilesToDelete.map((file) => unlink(join(tekken7SavePath, subdirectories[0], file))));

		snack('Replays deleted successfully!', 'info');
	} catch (error) {
		snack(error, 'error');
	}
}


function cleanLogs() {
	const logPath = join(process.env.LOCALAPPDATA, 'TekkenGame', 'Saved', 'Logs');

	try {
		readdirSync(logPath)
			.filter((dir) => statSync(join(logPath, dir)).isDirectory())
			.forEach((dir) => {
				rmdirSync(join(logPath, dir), { recursive: true });
			});
		snack('Logs deleted successfully!', 'info');
	} catch (error) {
		snack(error, 'error');
	}
}


async function openDir(folderPath) {
	try {
		await shell.openPath(folderPath);
		snack('Folder opened!');
	} catch (error) {
		snack(error, 'error');
	}
}


async function openBackupDir() {
	await openDir(backupPath);
}


async function openTekkenDir() {
	await openDir(tekken7SavePath);
}


async function backupOrImportSave(source, destination, successMsg) {
	try {
		await copy(source, destination);
		snack(successMsg);
	} catch (error) {
		snack(error, 'error');
	}
}


async function backupSave() {
	await backupOrImportSave(tekken7SavePath, backupPath, 'Backup successfully!');
}


async function importSave() {
	await backupOrImportSave(backupPath, tekken7SavePath, 'Saves imported!');
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
