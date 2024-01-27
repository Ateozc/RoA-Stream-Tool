import { stPath } from '../GUI/Globals.mjs';
import { players } from '../GUI/Player/Players.mjs';
import { round } from '../GUI/Round.mjs';
import { scores } from '../GUI/Score/Scores.mjs';
import { teams } from '../GUI/Team/Teams.mjs';
import { tournament } from '../GUI/Tournament.mjs';
import { gamemode } from '../GUI/Gamemode Change.mjs';
import { settings } from '../GUI/Settings.mjs';
import { displayNotif } from '../GUI/Notifications.mjs';
import { genGuiSection } from './EasyGUISection.mjs';
import { vodRename } from './VodRename.mjs';
import { bestOf } from '../GUI/BestOf.mjs';

const fs = require('fs');
const path = require ('path');
// const archiver = require('archiver');

const updateDiv = document.getElementById('updateRegion');


const settingElectronDiv = document.getElementById("settingsElectron");
const newToggles = [
    {
        id: "roaReplayDir",
        title: "Directory where the Rivals of Aether replays are stored\n\nTypically, this is found in 'AppData/Local/RivalsofAether/replays'. \nYou can quickly get to the appdata folder by typing in %appdata% in the search bar on window explorer",
        innerText: "Replay Directory",
        type: "text",
        disabled: false,
        className: "textInput"
    },
    // {
    //     id: "roaReplayZipFiles",
    //     title: "When enabled, Zips the files into a single folder.",
    //     innerText: "Zip files on move",
    //     type: "checkbox",
    //     disabled: false,
    //     className: "settingsCheck"
    // },
    {
        id: "roaReplayDeleteOriginal",
        title: "When enabled, deletes the original .roa files after moving them.",
        innerText: "Delete original files",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "roaReplayGameCountOverride",
        title: "When enabled, allows you to modify the 'Number of replays to move'.",
        innerText: "Game Count Override",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "roaReplayGameCount",
        title: "Number of replays to move, which is based on game count. This is set automatically.",
        innerText: "Game Count",
        type: "number",
        disabled: true,
        className: "textInput numberInput"
    },
    {
        id: "roaReplayMoveButton",
        title: "When clicked, will rename the .roa files in the specified directory (depending on how many games have been played) and move them to the Vod Directory/{tournament}/{game}/",
        innerText: "Move RoA Replays",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "roaReplayAutomaticOnSetEnd",
        title: "When enabled, automatically copies/moves/renames the files when a set is completed.",
        innerText: "Automatically move replays",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
]

const divs = genGuiSection('RoA Replay Mover', settingElectronDiv, false, newToggles);

class RoaReplayMover {
    #roaReplayDirInput = document.getElementById('roaReplayDir');
    // #roaReplayZipCheck = document.getElementById('roaReplayZipFiles');
    #roaReplayDeleteCheck = document.getElementById('roaReplayDeleteOriginal');
    #roaReplayCountOverrideCheck = document.getElementById('roaReplayGameCountOverride');
    #roaReplayCountInput = document.getElementById('roaReplayGameCount');
    #roaReplayMoveBtn = document.getElementById('roaReplayMoveButton');
    #roaReplayAutomaticCheck = document.getElementById('roaReplayAutomaticOnSetEnd');


    #replayDir = "";
    #replayDirSettings = stPath.text+ "/RoAReplayDir.txt";
    #lastElement = divs.prevDiv;
    #titleElement = divs.titleDiv;

    #previousReplaySaves = [];
    
    constructor () {
        this.#roaReplayCountInput.value = 0;
        this.#roaReplayDirInput.addEventListener("change", () => this.#updateReplayDir());
        updateDiv.addEventListener("click", () => {this.#autoMoveFiles()});
        this.#roaReplayMoveBtn.addEventListener("click", () => this.renameAndMoveFiles());
        this.#roaReplayCountOverrideCheck.addEventListener("click", () => this.#toggleCountOverride());
        this.#getDirSettings();
    }

    getLastGUIElement() {
        return this.#lastElement;
    }
    getTitleGUIElement() {
        return this.#titleElement;
    }

    #getDirSettings() {
        this.#replayDir = fs.readFileSync(this.#replayDirSettings, 'utf8');
        this.#roaReplayDirInput.value = this.#replayDir;
    }

    #toggleCountOverride() {
        this.#roaReplayCountInput.disabled = !this.#roaReplayCountOverrideCheck.checked;
    }

    getRecordingDir() {
        return vodRename.getRecordingDir();
    }

    canRename() {
        if (vodRename.canRename() && this.#replayDir) {
            return true;
        } else {
            return false;
        }
    }

    #updateReplayDir() {
        try {
            if(!fs.lstatSync(this.#roaReplayDirInput.value).isDirectory() ) {
                throw 'Invalid Path.';
            }
        } catch (e) {
            displayNotif('Invalid Path. Please enter a valid path.')
            this.#roaReplayDirInput.value = "";
            return;
        }
        this.#replayDir = this.#roaReplayDirInput.value;

        fs.writeFile(this.#replayDirSettings, this.#replayDir, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    #autoMoveFiles() {
        if (this.#roaReplayAutomaticCheck.checked && this.#isSetOver()) {
            this.renameAndMoveFiles()
        }
    }

    #isSetOver() {
        if (!this.#roaReplayCountOverrideCheck.checked) {
            
            let p1Score = scores[0].getScore();
            let p2Score = scores[1].getScore();
            this.#roaReplayCountInput.value = p1Score + p2Score;

            if (bestOf.getBo() == 3 && (p1Score >=2 || p2Score >= 2)) {
                return true;
            }

            if (bestOf.getBo() == 5 && (p1Score >= 3 || p2Score >= 3)) {
                return true;
            }
        }
            
        return false;
    }

    getGameCount() {
        if (this.#roaReplayCountInput.value > 0 && this.#roaReplayCountOverrideCheck.checked) {
            return this.#roaReplayCountInput.value;
        }

        let gameCountBasedOnScore = scores[0].getScore() + scores[1].getScore();
        if (gameCountBasedOnScore > 0) {
            return gameCountBasedOnScore;
        }
        

        return 0;
    }

    #deleteOriginalFile() {
        return this.#roaReplayDeleteCheck.checked;
    }

    // #zipFiles() {
    //     return this.#roaReplayZipCheck.checked;
    // }

    getLatestFileName() {
        return vodRename.getLatestFileName();
    }

    async renameAndMoveFiles() {

        let newFileName = this.getLatestFileName();

        if (this.#previousReplaySaves.indexOf(newFileName) != -1) {
            displayNotif('Replays already renamed/moved for this set.');
            return;
        }

        if (!this.canRename()) {
            displayNotif('Failed to Rename and move Vods. Ensure Tournament, Round, Player Information, and Vod Directory are filled in, then hit "Update" and try again.')
            return;
        }

        if (this.#roaReplayMoveBtn.title == 'Processing...') {
            displayNotif('Please wait for the rename to finish processing.')
            return;
        }

        this.#roaReplayMoveBtn.title = 'Processing...';

        let gamePath = vodRename.getSavePath();
        gamePath += '/' + newFileName + ' - Replays';
        let maxCount = this.getGameCount();

        try {
            const getSortedFiles = async (dir) => {
                const files = await fs.promises.readdir(dir);
              
                return files
                .map(fileName => ({
                    name: fileName,
                    time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
                }))
                .sort((a, b) => b.time - a.time)
                .map(file => file.name);
            }
            
            const files = await getSortedFiles(this.#replayDir)

            let setFiles = [];

            for (let i = 0; i < files.length && i < maxCount; i++) {
                if (files[i].endsWith('.roa')) {
                    setFiles.push(files[i]);
                } else {
                    maxCount++;
                }
            }

            setFiles.reverse();

            fs.mkdirSync(gamePath, {recursive: true});

            /* Need archiver npm */
            // let output = '';
            // let archive = '';
            // if (this.#zipFiles() && setFiles.length > 0) {
            //     output = fs.createWriteStream(gamePath + '/' + newFileName + '.zip')
            //     archive = archiver('zip', {
            //         gzip: true,
            //         zlib: { level: 9 } // Sets the compression level.
            //     });

            //     archive.on('error', function(err) {
            //         throw err;
            //       });

            //     archive.pipe(output);
            // }


            for (let i = 0; i < setFiles.length; i++) {
                const file = setFiles[i];
                let ext = path.parse(file).ext;
                let newFile = gamePath + '/' + newFileName + '_game_' + (i+1);
                let oldPath = this.#replayDir + "/" + file;
                let newFilePath = newFile + ext;

                /* if (this.#zipFiles()) {
                    archive.file(oldPath, {name: newFileName + '_game_' + (i+1)});
                    if (this.#deleteOriginalFile()) {
                        // fs.unlink(oldPath);
                    }
                }*/
                if (this.#deleteOriginalFile()) {
                    fs.renameSync(oldPath, newFilePath);
                } else {
                    fs.copyFile(oldPath, newFilePath, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }

            this.#previousReplaySaves.push(newFileName);
        } catch (e) {
            console.log(e);
        }

        this.#roaReplayMoveBtn.title = 'Rename Vod Files';
        displayNotif('Replays have been renamed and moved.');
    }
    
    
}


export const roaReplayMover = new RoaReplayMover;