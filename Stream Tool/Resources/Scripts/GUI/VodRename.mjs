import { stPath } from './Globals.mjs';
import { players } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Score/Scores.mjs';
import { teams } from './Team/Teams.mjs';
import { tournament } from './Tournament.mjs';
import { gamemode } from './Gamemode Change.mjs';
import { settings } from './Settings.mjs';

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
        className: "settingsText"
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

let vodRenameTitleDiv = document.createElement("div");
vodRenameTitleDiv.className = "settingsTitle";
vodRenameTitleDiv.innerHTML = "Vod Rename";
settingElectronDiv.before(vodRenameTitleDiv);

let prevDiv = vodRenameTitleDiv;

for (let t = 0; t < newToggles.length; t++) {
    let toggle = newToggles[t];
    let toggleDiv = document.createElement("div");
    toggleDiv.className = "settingBox";
    

    let toggleInput = "";
    if (toggle.type == 'button') {
        toggleInput = document.createElement("button");
        toggleInput.innerHTML = toggle.innerText;
        toggleInput.title = toggle.title;
    } else {
        toggleInput = document.createElement("input");
        toggleInput.type = toggle.type;
        toggleDiv.title = toggle.title;
    } 
    
    toggleInput.id = toggle.id;
    toggleInput.className = toggle.className;    
    toggleInput.tabIndex = "-1";
    toggleInput.disabled = toggle.disabled;

    let inputLabel = document.createElement("label");
    inputLabel.htmlFor = toggle.id;
    inputLabel.className = "settingsText";
    inputLabel.innerHTML = toggle.innerText;

    if (toggle.type == 'text') {
        toggleDiv.appendChild(inputLabel);
        toggleDiv.appendChild(toggleInput);
    } else if (toggle.type == 'button') {
        toggleDiv.appendChild(toggleInput);
    } else {
        toggleDiv.appendChild(toggleInput);
        toggleDiv.appendChild(inputLabel);
    }
    
    prevDiv.after(toggleDiv);
    prevDiv = toggleDiv;
}



/**
 * Things to do for this piece
 * - Find a way to get previous characters and such. Maybe just keep the object alive, but if only player character changes we dont count things as "changed"
 * - maybe make a class constructor that can be called elsewhere?
 * - Save the Location of their Recordings (may want to save this into a file for future use).
 * - A toggle to enable this to auto rename recordings (or attempt to) on the clearing of data from the tool
 * - A button to force rename files
 * - a way to be integrated with the OBS Control in the future (so after the recording is done, it can automatically grab the files and move them). FUTURE STUFF
 * 
  */



class VodRename {
    #vodDirInput = document.getElementById('vodRenameDir');
    #recordingDir = "";
    #vodRenameBtn = document.getElementById('vodRenameButton');
    #oldCopyMatchBtn = document.getElementById('copyMatch');
    #copyMatchBtn = this.#oldCopyMatchBtn.cloneNode(true);
    #recordingDirSettings = stPath.text+ "\\RecordingDir.txt";
    
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
        updateRegion.addEventListener("click", () => {this.#updateMatchInfo()});
        this.#vodRenameBtn.addEventListener("click", () => this.renameAndMoveFiles());
        this.#copyMatchBtn.addEventListener("click", () => {this.copyMatchInfo();});
        this.#getDirSettings();
        
    }

    #getDirSettings() {
        this.#recordingDir = fs.readFileSync(this.#recordingDirSettings);
        this.#vodDirInput.value = this.#recordingDir;
    }

    #updateRecordingDir() {
        try {
            if(!fs.lstatSync(this.#vodDirInput.value).isDirectory() ) {
                throw 'Invalid Path.';
            }
        } catch (e) {
            this.#vodDirInput.value = "INVALID PATH";
            return;
        }
        console.log('hit');
        this.#recordingDir = this.#vodDirInput.value;
        
        let settingsFile = stPath.text+ '\\' + this.#recordingDirSettings;
        console.log(settingsFile)
        fs.writeFile(settingsFile, this.#recordingDir, err => {
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
        this.#matchInfo.game = (settings.isWsChecked() ? 'Rivals Workshop' : 'Rivals of Aether');
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

    getLatestFileName() {
        return this.#matchString;
    }

    renameAndMoveFiles() {

        let tournament = this.#matchInfo.tournament;
        let game = this.#matchInfo.game;
        let newFileName = this.getLatestFileName();


        if (!tournament || !game || !this.#recordingDir && this.#recordingDir != 'INVALID PATH' || !newFileName) {
            return;
        }

        this.#vodRenameBtn.removeEventListener("click", () => this.renameAndMoveFiles());
        this.#vodRenameBtn.title = 'Processing...';


        let tournamentPath = this.#recordingDir + '\\' + tournament;
        let gamePath = tournamentPath + '\\' + game;

        let counts = {
            ".png": 0,
            ".flv": 0,
            ".mp4": 0
        }
        try {
            fs.readdir(this.#recordingDir, (err, files) => {
                fs.mkdirSync(gamePath, {recursive: true}); //This will create the folders.
                files.forEach(file=> {
                    if (file.endsWith('.png') || file.endsWith('.mp4') || file.endsWith('.flv')) {
                        let ext = path.parse(file).ext;
                        let newFile = gamePath + '\\' + newFileName;
                        let oldPath = this.#recordingDir + "\\" + file;
                        
                        if ( counts[ext] > 0) {
                            newFile += '(' + counts[ext] + ')'
                        }

                        let newFilePath = newFile + ext;
        
                        fs.renameSync(oldPath, newFilePath);

                        counts[ext] ++;
                        // fs.rename(oldPath, newFilePath, (error) => {
                        //     if (error) {
                        //         console.log(error);
                        //     } else {
                        //         console.log("\nFile Renamed\n");
                        //     }
                        // });
                    }
                })
            });
        } catch (e) {
            console.log(e);
        }

        this.#vodRenameBtn.addEventListener("click", () => this.renameAndMoveFiles());
        this.#vodRenameBtn.title = 'Rename Vod Files';
    }


    
}



// setInterval(init, 1000);

// function init() {
//     // console.log(inside.electron);
//     // console.log(__dirname);
//     // setCurData();
// }

export const vodRename = new VodRename;