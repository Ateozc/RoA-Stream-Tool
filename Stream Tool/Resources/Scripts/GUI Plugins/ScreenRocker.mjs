import { stPath } from "../GUI/Globals.mjs";
import { settings } from "../GUI/Settings.mjs";
import { getJson, getPresetList } from "../GUI/File System.mjs";
import { players, playersReady } from "../GUI/Player/Players.mjs";
import { bestOf } from "../GUI/BestOf.mjs";
import { scores } from "../GUI/Score/Scores.mjs";
import { currentColors, updateColor } from "../GUI/Colors.mjs";
import { writeScoreboard } from "../GUI/Write Scoreboard.mjs";
import { customChange, setCurrentPlayer } from "../GUI/Custom Skin.mjs";
import { genGuiSection, showHideAllElements } from "./EasyGUISection.mjs";
import { obsControl } from "./OBSWebsocketControl.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { vodRename } from "./VodRename.mjs";

/*
TODO:
- Fix Hex skin not loading for Readek.
- Store previously selected scenes. When getting latest, use previously selected if available.
- On new selection, save them.
- Fix toggle for Recording when starting Screen Rocker OBS
*/
const fs = require('fs');
const stateFile = stPath.text + "/RoAState"

const colorList = await getJson(stPath.text + "/Color Slots");

const settingElectronDiv = document.getElementById("settingsElectron");
const updateDiv = document.getElementById('updateRegion');

const newToggles = [
    {
        id: "screenRockerToggle",
        title: "Enable Screen Rocker automated check. Requires Screen Rocker to be updating RoAState.json",
        innerText: "Enable Screen Rocker",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerCharToggle",
        title: "Enables the Skins to be updated based on the players preset skin (if available). If off or no preset found, this will set the skin to default.",
        innerText: "Character Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerSkinToggle",
        title: "Enable Screen Rocker automated check. Requires Screen Rocker to be updating RoAState.json",
        innerText: "Skin Update",
        type: "checkbox",
        disabled: true,
        className: "settingsCheck"
    },
    {
        id: "screenRockerColorToggle",
        title: "Enables the Team Color to be updated based upon the Screen Rocker. This is based on the Slot colors and Active slots (OFF/HMN/CPU)",
        innerText: "Team Color Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerScoreToggle",
        title: "Enables the Score to be updated based upon the Screen Rocker.",
        innerText: "Score Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerBestOfToggle",
        title: "Enables the Best Of to be updated based upon the Screen Rocker.",
        innerText: "BestOf Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerAutoApplyToggle",
        title: "When enabled, all changes immediately get applied to stream. If disabled, you will need to press 'Update' to apply changes.",
        innerText: "Auto Apply Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    }
]

const divs = genGuiSection('Screen Rocker', settingElectronDiv, false, newToggles);

const newTogglesOBS = [
    {
        id: "screenRockerOBSToggle",
        title: "When active, this will allow the Stream Tool to control OBS using the provided scenes. Requires OBS connection and enabling Screen Rocker. (*Recommended to use 'Auto Apply Update' under Screen Rocker settings)",
        innerText: "Start Auto OBS Control",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "screenRockerAutoRecord",
        title: "Enables the Recording to Start/Stop automatically based upon the set start/end. Saved to Vod Directory.",
        innerText: "Auto Recording",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerAutoThumbnail",
        title: "Enables the thumbnail Vod to generate automatically (this is based upon the VS Screen Scene). Saved to Vod Directory.",
        innerText: "Auto create Thumbnail",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerAutoRename",
        title: "Enables the Auto Rename of Vod files (thumbnail and recordings). Saved to Vod Directory.",
        innerText: "Auto File Rename",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerSceneInfo",
        title: "Scene selectors",
        innerText: "Scene selectors <br>1 - Start Scene<br>2 - Transition Scene<br>3 - In Game Scene<br>4 - End Scene",
        type: "div",
        disabled: false,
        className: "settingsText"
    },
    {
        id: "screenRockerGetLatestScenes",
        title: "Get Latest Scenes",
        innerText: "Get Latest Scenes",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "screenRockerStartScene",
        title: "The Scene that shows up when a set starts. Typically, this should be the 'Vs Screen' that shows the player information and characters.",
        innerText: "1",
        type: "select",
        disabled: false,
        className: "textInput"
    },
    {
        id: "screenRockerTransitionScene",
        title: "OPTIONAL: The Scene that shows after the Start scene, before loading the In Game scene. (Used when players are picking characters/stages)",
        innerText: "2",
        type: "select",
        disabled: false,
        className: "textInput"
    },
    {
        id: "screenRockerInGameScene",
        title: "The Scene that shows when players are playing.",
        innerText: "3",
        type: "select",
        disabled: false,
        className: "textInput"
    },
    {
        id: "screenRockerEndScene",
        title: "OPTIONAL: The Scene that will show after the set ends.",
        innerText: "4",
        type: "select",
        disabled: false,
        className: "textInput"
    }
]


const obsDivs = genGuiSection('Screen Rocker OBS', divs.prevDiv, true, newTogglesOBS);

export class ScreenRocker {

    //Base items
    #screenRockerCheck = document.getElementById("screenRockerToggle");
    #screenRockerCharCheck = document.getElementById("screenRockerCharToggle");
    #screenRockerSkinCheck = document.getElementById("screenRockerSkinToggle");
    #screenRockerColorCheck = document.getElementById("screenRockerColorToggle");
    #screenRockerScoreCheck = document.getElementById("screenRockerScoreToggle");
    #screenRockerBestOfCheck = document.getElementById("screenRockerBestOfToggle");
    #screenRockerAutoApplyCheck = document.getElementById("screenRockerAutoApplyToggle");
    #lastElement = divs.prevDiv;
    #titleElement = divs.titleDiv;

    #playerPresets = {};
    #data = {};
    #enabled = false;
    #diffFound = false;

    #updateChar = false;
    #updateSkin = false;
    #updateColor = false;
    #updateScore = false;
    #updateBestOf = false;
    #updateAutoApply = false;

    //OBS Items
    #screenRockerOBSBtn = document.getElementById('screenRockerOBSToggle');
    #getScenesBtn = document.getElementById('screenRockerGetLatestScenes');

    #screenRockerAutoThumbnailCheck = document.getElementById('screenRockerAutoThumbnail');
    #screenRockerAutoRecordCheck = document.getElementById('screenRockerAutoRecord');
    #screenRockerAutoRenameCheck = document.getElementById('screenRockerAutoRename');

    //scene lists
    #screenRockerStartSceneSelect = document.getElementById('screenRockerStartScene');
    #screenRockerTransitionScene = document.getElementById('screenRockerTransitionScene');
    #screenRockerInGameScene = document.getElementById('screenRockerInGameScene');
    #screenRockerEndScene = document.getElementById('screenRockerEndScene');

    #toggleDivsOBS = obsDivs.toggleDivs;
    #lastOBSElement = obsDivs.prevDiv;
    #autoOBSControl = false;
    #inSet = false;
    #startOfSet = false;
    #prevScene = "";
    #curScene = "";

    #startScene = "";
    #transitionScene ="";
    #inGameScene = "";
    #endScene = "";

    #finalizingOBS = false;

    #autoThumbnail = false;
    #autoRecording = false;
    #autoRename = false;
    #screenshotCreated = false;

    constructor() {
        //Screen Rocker Settings
        this.#screenRockerCheck.addEventListener("click", () => this.toggleScreenRocker());
        this.#screenRockerCharCheck.addEventListener("click", () => this.toggleCharUpdate());
        this.#screenRockerSkinCheck.addEventListener("click", () => this.toggleSkinUpdate());
        this.#screenRockerColorCheck.addEventListener("click", () => this.toggleColorUpdate());
        this.#screenRockerScoreCheck.addEventListener("click", () => this.toggleScoreUpdate());
        this.#screenRockerBestOfCheck.addEventListener("click", () => this.toggleBestOfUpdate());
        this.#screenRockerAutoApplyCheck.addEventListener("click", () => this.toggleAutoApplyUpdate());

        //OBS Items
        this.#screenRockerOBSBtn.addEventListener("click", () => this.toggleAutoOBSControl());
        this.#getScenesBtn.addEventListener("click", () => this.#setupSelectBoxes());

        this.#screenRockerAutoThumbnailCheck.addEventListener("click", () => this.toggleAutoThumbnail());
        this.#screenRockerAutoRecordCheck.addEventListener("click", () => this.toggleAutoRecording());
        this.#screenRockerAutoRenameCheck.addEventListener("click", () => this.toggleAutoRename());


        // showHideAllToggles(this.#toggleDivsOBS, false);

        this.watchFile();
    }

    toggleAutoOBSControl() {
        if (this.#finalizingOBS) {
            displayNotif('Finalizing OBS Control. Wait one moment...');
            return;
        }
        if (!this.enabled() && !this.#autoOBSControl) {
            displayNotif('Must enable Screen Rocker');
            return;
        }
        if (!obsControl.connected()) {
            displayNotif('Must be connected to OBS');
            return;
        }
        if (!this.#updateAutoApply) {
            displayNotif('WARNING: Auto Apply Update is off, you must update the data on the Stream Tool manually to allow it on the Stream');
        }
        if (!this.#updateScore) {
            displayNotif('WARNING: Score Update is off. You must manually update the Score. OBS Control stops when a player wins (based upon Score and Best Of');
        }
        
        this.#autoOBSControl = !this.#autoOBSControl;
        this.toggleSet();

        if (this.#autoOBSControl) {
            this.#screenRockerOBSBtn.innerText = 'Stop Auto OBS Control'
            this.#writeData()
            this.handleScenes();
        } else {
            this.#screenRockerOBSBtn.innerText = 'Start Auto OBS Control'
            if (this.#autoRecording) {
                obsControl.stopRecord();
            }
            
        }
    }
    
    inSet() {
        return this.#inSet;
    }

    toggleSet() {
        this.#inSet = this.#autoOBSControl;
        if (this.#inSet) {
            this.#startOfSet = true;
        }
    }

    #setSelectedScenes() {
        //These 2 are mandatory.
        this.#startScene = this.#screenRockerStartSceneSelect.value;
        this.#inGameScene = this.#screenRockerInGameScene.value;

        //These 2 are optional.
        this.#transitionScene = (this.#screenRockerTransitionScene.value) ? this.#screenRockerTransitionScene.value : this.#startScene;
        this.#endScene = (this.#screenRockerEndScene.value) ? this.#screenRockerEndScene.value : this.#inGameScene;
    }

    async handleScenes() {
        if (!vodRename.getRecordingDir()) {
            if (this.#autoRename) {
                this.toggleAutoRename();
            }
            if (this.#autoThumbnail) {
                this.toggleAutoThumbnail();
            }
        }
        this.#setSelectedScenes(); //Do this every time we run it to ensure we have the correct information.
        let useTimeout = this.#startOfSet;
        let endSceneHit = false;
        if (this.enabled() && this.#autoOBSControl && this.#startScene && this.#inGameScene) {
            if (this.inSet()) {
                if (this.#startOfSet) {
                    this.#screenshotCreated = false;
                    if (this.#autoRecording) {
                        await obsControl.startRecord();
                    }
                    
                    this.#curScene = this.#startScene;
                    this.#startOfSet = false;
                    
                } else {
                    if (this.inMatch()) {
                        this.#curScene = this.#inGameScene;
                    } else {
                        this.#curScene = this.#transitionScene;
                    }
                }
            } else {
                this.#curScene = this.#endScene;
                endSceneHit = true;
            }
            if (this.#curScene != this.#prevScene || endSceneHit) {
                if (!endSceneHit) {
                    await obsControl.changeScene(this.#curScene);
                    this.#prevScene = this.#curScene;
                }
                
                if (endSceneHit) {
                    this.#finalizingOBS = true;
                    this.#screenRockerOBSBtn.innerText = "Finalizing..."
                    setTimeout(async () => {
                        if (this.#autoRecording) {
                            await obsControl.stopRecord();
                        }  
                        await obsControl.changeScene(this.#curScene);
                        this.#prevScene = this.#curScene;
                        
                            setTimeout(async () => {
                                if (this.#autoRename) {
                                    vodRename.renameAndMoveFiles();
                                }
                                this.#finalizingOBS = false;
                                this.toggleAutoOBSControl();
                            }, 6000);
                        
                        
                    }, 3000) 
                }
            }

            if (useTimeout) {
                if (!this.#screenshotCreated && this.#autoThumbnail) {
                    setTimeout(async () => {
                        this.#screenshotCreated = true;
                        // await obsControl.screenShot(this.#startScene, vodRename.getRecordingDir() + '\\' + Date.now() +'.png');
                        await obsControl.vsScreenScreenshot(vodRename.getRecordingDir() + '\\' + Date.now() +'.png');
                    }, 1500)
                }
                

                setTimeout(async () => {
                    await this.handleScenes();
                }, 5000)
            }

        }
    }

    getLastGUIElement() {
        return this.#lastElement;
    }
    getTitleGUIElement() {
        return this.#titleElement;
    }

    enabled() {
        return this.#enabled;
    }

    async #setupSelectBoxes() {
        if (!obsControl.connected()) {
            displayNotif('Cant retrieve scenes list: Not connected to OBS.');
            return;
        }
        const scenes = obsControl.getSceneList();
        if (scenes.length <= 0) {
            return;
        }
        for (let i = 0; i < this.#toggleDivsOBS.length; i++) {
            let childDiv = this.#toggleDivsOBS[i].lastChild;
            if (childDiv.nodeName == 'SELECT') {
                for (let j = 0; j < scenes.length; j++) {
                    const option = document.createElement('option');
                    option.value = scenes[j].sceneName;
                    option.innerHTML = scenes[j].sceneName;

                    // add colors to the list
                    option.style.backgroundColor = "var(--bg5)";

                    childDiv.appendChild(option);
                }
            }
        }
    }

    //The toggles for each piece.
    toggleCharUpdate() {
        this.#updateChar = !this.#updateChar;
        if (!this.#updateChar && this.#updateSkin) {
            this.#screenRockerSkinCheck.click();
        }
        this.#screenRockerCharCheck.checked = this.#updateChar;
        this.#screenRockerSkinCheck.disabled = !this.#updateChar;
        this.getSetData();
    }

    toggleSkinUpdate() {
        if (!this.#updateChar && this.#screenRockerSkinCheck.checked == true) {
            this.#screenRockerSkinCheck.checked = false;
        } else {
            this.#updateSkin = !this.#updateSkin;
        }

        this.#screenRockerSkinCheck.checked = this.#updateSkin;
        this.getSetData();
        
    }

    toggleColorUpdate() {
        this.#updateColor = !this.#updateColor;
        this.#screenRockerColorCheck.checked = this.#updateColor;
        this.getSetData();
    }

    toggleScoreUpdate() {
        this.#updateScore = !this.#updateScore;
        this.#screenRockerScoreCheck.checked = this.#updateScore;
        this.getSetData();
    }

    toggleBestOfUpdate() {
        this.#updateBestOf = !this.#updateBestOf;
        this.#screenRockerBestOfCheck.checked = this.#updateBestOf;
        this.getSetData();
    }

    toggleAutoApplyUpdate() {       
        this.#updateAutoApply = !this.#updateAutoApply;
        this.#screenRockerAutoApplyCheck.checked = this.#updateAutoApply;
        this.getSetData();
    }

    toggleAutoThumbnail() {
        this.#autoThumbnail = !this.#autoThumbnail;
        if (this.#autoOBSControl && !this.#autoThumbnail) {
            displayNotif('Cannot toggle Auto create Thumbnail On. Auto OBS Control is running.');
            this.#autoThumbnail = false;
        }
        if (!vodRename.getRecordingDir()) {
            displayNotif('Cannot activate Auto create Thumbnail. Vod Directory is required.');
            this.#autoThumbnail = false;
        }
        this.#screenRockerAutoThumbnailCheck.checked = this.#autoThumbnail;
        
    }

    toggleAutoRecording() {
        this.#autoRecording = !this.#autoRecording;
        if (this.#autoOBSControl && !this.#autoRecording) {
            displayNotif('Cannot toggle Auto Recording On. Auto OBS Control is running.');
            this.#autoThumbnail = false;
        }
        this.#screenRockerAutoRecordCheck.checked = this.#autoRecording;
    }

    toggleAutoRename() {
        this.#autoRename = !this.#autoRename;
        if (!this.#autoThumbnail && !this.#autoRecording && this.#autoRename) {
            displayNotif('Cannot toggle Auto Rename On. Need at least 1 of Auto Recording or Auto create Thumbnail to be active.');
            this.#autoRename = false;
        }
        if (this.#autoOBSControl && !this.#autoRename) {
            displayNotif('Cannot toggle Auto Rename On. Auto OBS Control is running.');
            this.#autoRename = false;
        }
        if (!vodRename.canRename()) {
            displayNotif('Cannot activate Auto Rename. Missing one of the following: Vod Directory or Tournament.');
            this.#autoRename = false;
        }
        
        this.#screenRockerAutoRenameCheck.checked = this.#autoRename;
    }



    hasData() {
        return (this.#data != "" && this.#playerPresets != "")
    }

    toggleScreenRocker() {
        if (this.canToggleOn()) {
            this.#enabled = !this.#enabled;
            this.getSetData();
            
        } else {
            this.#enabled = false;
        }
        this.#screenRockerCheck.checked = this.#enabled;
        // showHideAllElements(this.#toggleDivsOBS, this.#enabled);
        return this.#enabled;
    }

    getSetData() {
        if (this.enabled()) {
            screenRocker.getData().then(() => {
                if (screenRocker.hasData()) {
                    screenRocker.setData();
                }
            });
        }
    }

    async getData() {
        this.#playerPresets = await getPresetList("Player Info");
        this.#data = await getJson(stPath.text + "/RoAState");  
    }

    canToggleOn() {
        if (bestOf.getBo() == 3 && (scores[0].getScore() >=2 || scores[1].getScore() >=2)) {
            return false
        }

        if (bestOf.getBo() == 5 && (scores[0].getScore() >=3 || scores[1].getScore() >=3)) {
            return false;
        }

        return true;
    }

    async #setCharAndSkinData(playerIndex, char) {
        if(this.#updateChar) { // update characters
            let playerPresetSkin = {};
            playerPresetSkin = this.#getSkinPreset(players[playerIndex].getName(), char);

            if (players[playerIndex].char != char || players[playerIndex].skin.name != playerPresetSkin.name) {
                this.#diffFound = true;
                await players[playerIndex].charChange(char, true);
                if (playerPresetSkin.customImg) {
                    setCurrentPlayer(players[playerIndex]);
                    await customChange(playerPresetSkin.hex, playerPresetSkin.name);
                } else {
                    await players[playerIndex].skinChange(players[playerIndex].findSkin(playerPresetSkin.name));
                }
            } 
        }
        return true;
    }

    #getSkinPreset(name, char) {
        let skinObj = {
            name: "Default",
            hex: "",
            customImg: false
        }
        if (this.#updateSkin) {
            for (let i = 0; i < this.#playerPresets.length; i++) {
                let player = this.#playerPresets[i];
                if (player.name == name) {
                    for (let j = 0; j < player.characters.length; j++) {
                        if (char == player.characters[j].character) {
    
                            skinObj = {
                                name: player.characters[j].skin,
                                hex: (player.characters[j].hex) ? player.characters[j].hex : "",
                                customImg: (player.characters[j].customImg) ? true : false
                            }
                            return skinObj;
                        }
                    }
                }
            }
        }
       
        return skinObj;
    }

    inMatch() {
        return this.#data.TourneySet.InMatch;
    }

    getScreenName() {
        return this.#data.ScreenName;
    }

    getDataReturn() {
        return this.#data;
    }

    
    async #setColorData(playerIndex, playerCount, slot, state) {
        if (this.#updateColor) { //Update team colors
            let newColor = {};
            let colorIndex = -1;
            if (playerIndex == 0) {
                if (playerCount > 2) { //force red on teams
                    newColor = this.getColorBasedOnSlot(1, "HMN");
                    colorIndex = 0;
                } else {
                    newColor = this.getColorBasedOnSlot(slot, state);
                    colorIndex = 0;
                }
            } else if (playerIndex == 1) {
                newColor = this.getColorBasedOnSlot(slot, state);
                colorIndex = 1;
            } else if (playerIndex == 1 && playerCount > 2) {
                newColor = this.getColorBasedOnSlot(2, "HMN");
                colorIndex = 1;
            }

            if (colorIndex != -1 && !this.#isSame(currentColors[colorIndex], newColor)) {
                await updateColor(colorIndex, newColor);
            }
        }
    }

    getColorBasedOnSlot(slot, state) {
        if (state == "CPU" || state == "OFF") {
            return this.findColorPreset("CPU");
        }
        if (slot == 1) {
            return this.findColorPreset("Red");
        }
    
        if (slot == 2) {
            return this.findColorPreset("Blue");
        }
    
        if (slot == 3) {
            return this.findColorPreset("Pink");
        }
    
        if (slot == 4) {
            return this.findColorPreset("Green");
        }

    }

    findColorPreset(name) {
        for (let i = 0; i < colorList.length; i++) {
            if (name == colorList[i].name) {
                return colorList[i];
            }
        }
    }

    async #setScoreData(playerIndex, playerCount, gameCount) {
        if (this.#updateScore) { //Update Score
            let scoreIndex = -1;
            if (playerIndex == 0) {
                scoreIndex = 0;
            } else if (playerIndex == 1 && playerCount < 3) {
                scoreIndex = 1;
            } else if (playerIndex == 2 && playerCount == 4) {
                scoreIndex = 1
            }
            if (scoreIndex != -1) {
                if (!this.#isSame(scores[scoreIndex].getScore(), gameCount)) {
                    scores[scoreIndex].setScore(gameCount); 
                } 
            }
        }
    }

    async #setBoData(newBo) {
        if (this.#updateBestOf) {
            if (newBo == 3 || newBo == 5) {
                if (!this.#isSame(bestOf.getBo(), newBo)){
                    bestOf.setBo(newBo);
                }
            } else {
                if (!this.#isSame(bestOf.getBo(), 'X')){
                    bestOf.setBo('X');
                }
            }
        }
    }

    #writeData() {
        if (this.#updateAutoApply && playersReady()) {
            updateDiv.click();
            // writeScoreboard();
            // document.getElementById("botBar").style.backgroundColor = "var(--bg3)";   
        }
    }

    #isSame(item1, item2) {
        if(typeof item1 == Object) {
            for (let i in item1) {
                if(!this.#isSame(item1[i], item2[i])) {
                    this.#diffFound = true;
                    return false;
                }
            }
            return true;
        } else {
            if (item1 == item2) {
                return true;
            }
            this.#diffFound = true;
            return false;
        }
    }


    async setData() {
        this.#diffFound = false;
        let playerCount = 0;
        for (let i = 0; i < this.#data.Characters.length; i++) {
            if (this.#data.Characters[i].SlotState != "OFF") {
                playerCount++;
            }
        }
        
        //Player Characters
        let playerIndex = 0;
        for (let i = 0; i < this.#data.Characters.length; i++) {
            let slot = this.#data.Characters[i].SlotNumber;
            let char = capitalizeWords(this.#data.Characters[i].Character);
            let state = this.#data.Characters[i].SlotState;
            let gameCount = this.#data.Characters[i].GameCount;

            if (playerCount > 2 || state != "OFF") {
                await this.#setCharAndSkinData(playerIndex, char);
                await this.#setColorData(playerIndex, playerCount, slot, state);
                await this.#setScoreData(playerIndex, playerCount, gameCount);
                playerIndex++; 
            }

            
        }

        this.#setBoData(this.#data.TourneySet.TourneyModeBestOf);
        this.#writeData();
        // screenRockerOBS.dataUpdate(this.#data);
        await this.handleScenes();

        if(!this.canToggleOn()) {
            this.#inSet = false;
            await this.handleScenes();
            this.toggleScreenRocker();
        }
    }

    async watchFile() {
        try {
            let fsWait = false;
            fs.watch(stateFile + '.json', (event, filename) => {
                if (screenRocker.enabled() && filename) {
                    if (fsWait) return;
                    fsWait = setTimeout(() => {
                        fsWait = false;
                    }, 100);
                    // console.log(`${filename} file Changed`);
                    screenRocker.getSetData();
                }
            });
        } catch (err) {

        }
        
    }
}


function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => (word != "and") ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      .join(" ");
  }

export const screenRocker = new ScreenRocker;
