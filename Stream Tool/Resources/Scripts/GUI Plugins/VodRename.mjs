import { stPath } from '../GUI/Globals.mjs';
import { players } from '../GUI/Player/Players.mjs';
import { round } from '../GUI/Round.mjs';
import { scores } from '../GUI/Score/Scores.mjs';
import { teams } from '../GUI/Team/Teams.mjs';
import { tournament } from '../GUI/Tournament.mjs';
import { gamemode } from '../GUI/Gamemode Change.mjs';
import { settings } from '../GUI/Settings.mjs';
import { displayNotif } from '../GUI/Notifications.mjs';
import { guiSection } from "./EasyGUISection.mjs";

const fs = require('fs');
const path = require ('path');

const updateDiv = document.getElementById('updateRegion');

const settingElectronDiv = document.getElementById("settingsElectron");
const newToggles = [
    {
        id: "vodRenameDir",
        title: "Directory where all Vod items are stored.",
        innerText: "Vod Directory",
        type: "text",
        disabled: false,
        className: "textInput"
    },
    {
        id: "vodRenameButton",
        title: "When clicked, will rename all .flv, .mp4, and .png in the specified directory and move them to directory/{tournament}/{game}/",
        innerText: "Rename Vod Files",
        type: "button",
        disabled: false,
        className: "settingsButton"
    }
]

const divs = guiSection.genGuiSection('Vod Rename', 'guiSettings', newToggles, 1, false);

class VodRename {
    #gameName = '';
    #vodDirInput = document.getElementById('vodRenameDir');
    #recordingDir = "";
    #vodRenameBtn = document.getElementById('vodRenameButton');
    #oldCopyMatchBtn = document.getElementById('copyMatch');
    #copyMatchBtn = this.#oldCopyMatchBtn.cloneNode(true);
    #recordingDirSettings = stPath.text+ "/RecordingDir.txt";
    #lastElement = divs.prevDiv;
    #titleElement = divs.titleDiv;
    
    #matchString = "";
    #matchInfo = {
        players: [], //needs characters played as.
        round: "",
        tournament:"",
        teams: ["",""],
        game: ""
    }

    constructor () {
        this.#oldCopyMatchBtn.parentNode.replaceChild(this.#copyMatchBtn, this.#oldCopyMatchBtn); //need to destroy the item, cuz it used an empty function. Cant remove the event listener otherwise.

        this.#vodDirInput.addEventListener("change", () => this.#updateRecordingDir());
        updateDiv.addEventListener("click", () => {this.#updateMatchInfo()});
        this.#vodRenameBtn.addEventListener("click", () => this.renameAndMoveFiles());
        this.#copyMatchBtn.addEventListener("click", () => {this.copyMatchInfo();});
        this.#getDirSettings();
        
    }

    updateGameName(game) {
        this.#gameName = game;
    }

    getLastGUIElement() {
        return this.#lastElement;
    }
    getTitleGUIElement() {
        return this.#titleElement;
    }

    #getDirSettings() {
        this.#recordingDir = fs.readFileSync(this.#recordingDirSettings, 'utf8');
        this.#vodDirInput.value = this.#recordingDir;
    }

    getRecordingDir() {
        return this.#recordingDir;
    }

    getRecordingDirWithFile() {
        return this.#recordingDir + this.getLatestFileName();
    }

    canRename() {
        if (this.getRecordingDir() && this.#matchInfo.tournament && this.#matchInfo.game && this.getLatestFileName()) {
            return true;
        } else {
            return false;
        }
    }

    #updateRecordingDir() {
        try {
            if(!fs.lstatSync(this.#vodDirInput.value).isDirectory() ) {
                throw 'Invalid Path.';
            }
        } catch (e) {
            displayNotif('Invalid Path. Please enter a valid path.')
            this.#vodDirInput.value = "";
            return;
        }
        this.#recordingDir = this.#vodDirInput.value;

        fs.writeFile(this.#recordingDirSettings, this.#recordingDir, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    #updateMatchInfo() {       
        for (let i = 0; i < players.length; i++) {
            
            let playerTag = players[i].getTag();
            let playerName = players[i].getName();
            let playerCharacter = players[i].char;
            if (!this.#matchInfo.players[i] || this.#matchInfo.players[i].name != playerName) {
                let playerObj = {
                    tag: playerTag,
                    name: playerName,
                    characters: []
                };
                playerObj.characters.push(playerCharacter);
                this.#matchInfo.players[i] = playerObj;

            } else {
                if (this.#matchInfo.players[i].tag != playerTag) {
                    this.#matchInfo.players[i].tag;
                }
                if (this.#matchInfo.players[i].characters.indexOf(playerCharacter) == -1) {
                    this.#matchInfo.players[i].characters.push(playerCharacter);
                }
            }
        }
        
        this.#matchInfo.round = round.getText();
        this.#matchInfo.tournament = tournament.getText();
        this.#matchInfo.teams[0] = teams[0].getName();
        this.#matchInfo.teams[1] = teams[1].getName();
        if (this.#gameName) {
            this.#matchInfo.game = this.#gameName
        } else {
            this.#matchInfo.game = (settings.isWsChecked() ? 'Rivals Workshop' : 'Rivals of Aether');
        }
        this.#matchString = this.#genString(this.#matchInfo);
    }

    #genString(dataObj) {
        const dubs = (gamemode.getGm() == 2);
        let str = "";
        str += dataObj.tournament + " - " + dataObj.round + ' - ';

        if (dubs) {
            let strLeft = "";
            let strRight = "";
            if (dataObj.teams[0]) {
                strLeft += dataObj.teams[0];
            } else {
                strLeft += dataObj.players[0].name + ' & ' + dataObj.players[2].name
            }
            if (dataObj.teams[1]) {
                strRight += dataObj.teams[1];
            } else {
                strRight += dataObj.players[1].name + ' & ' + dataObj.players[3].name;
            }

            str += strLeft + ' Vs. ' + strRight;
        } else {
            for (let i = 0; i < 2; i++) {
                if (i==1) {
                    str+= ' Vs. '
                }
                if (dataObj.players[i].tag) {
                    str+= dataObj.players[i].tag + ' - ';
                }
                str+= dataObj.players[i].name;
                for (let j = 0; j < dataObj.players[i].characters.length; j++) {
                    let char = dataObj.players[i].characters[j];
                    if (j == 0) {
                        str+= " (" + char
                    } else {
                        str+= char;
                    }
                    if (dataObj.players[i].characters[j+1]) {
                        str+= ", "
                    } else {
                        str+= ")";
                    }
                }
            }
        }
        return str;
    }

    copyMatchInfo() {
        navigator.clipboard.writeText(this.getLatestFileName());
    }

    getSavePath() {
        let tournament = this.#matchInfo.tournament;
        let game = this.#matchInfo.game;
        let tournamentPath = this.#recordingDir + '/' + tournament;
        let gamePath = tournamentPath + '/' + game;

        return gamePath;
    }

    getLatestFileName() {
        return this.#matchString;
    }

    renameAndMoveFiles() {
        let newFileName = this.getLatestFileName();

        if (!this.canRename()) {
            displayNotif('Failed to Rename and move Vods. Ensure Tournament, Round, Player Information, and Vod Directory are filled in, then hit "Update" and try again.')
            return;
        }

        if (this.#vodRenameBtn.title == 'Processing...') {
            displayNotif('Please wait for the rename to finish processing.')
            return;
        }

        this.#vodRenameBtn.title = 'Processing...';

        let gamePath = this.getSavePath();

        let counts = {
            ".png": 0,
            ".flv": 0,
            ".mp4": 0,
            ".mkv": 0,
        }
        try {
            fs.readdir(this.#recordingDir, (err, files) => {
                fs.mkdirSync(gamePath, {recursive: true}); //This will create the folders.
                files.forEach(file=> {
                    if (file.endsWith('.png') || file.endsWith('.mp4') || file.endsWith('.flv') || file.endsWith('.mkv')) {
                        let ext = path.parse(file).ext;
                        let newFile = gamePath + '/' + newFileName;
                        let oldPath = this.#recordingDir + "/" + file;
                        
                        if ( counts[ext] > 0) {
                            newFile += '(' + counts[ext] + ')'
                        }

                        let newFilePath = newFile + ext;
        
                        fs.renameSync(oldPath, newFilePath);
                        counts[ext] ++;
                    }
                })
            });
        } catch (e) {
            console.log(e);
        }

        this.#vodRenameBtn.title = 'Rename Vod Files';
        displayNotif('Files have been Renamed and moved');
    }


    
}


export const vodRename = new VodRename;