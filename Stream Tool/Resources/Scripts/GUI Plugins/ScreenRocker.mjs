import { stPath } from "../GUI/Globals.mjs";
import { settings } from "../GUI/Settings.mjs";
import { getJson, getPresetList, saveJson } from "../GUI/File System.mjs";
import { players, playersReady } from "../GUI/Player/Players.mjs";
import { bestOf } from "../GUI/BestOf.mjs";
import { scores } from "../GUI/Score/Scores.mjs";
import { currentColors, updateColor } from "../GUI/Colors.mjs";
import { writeScoreboard } from "../GUI/Write Scoreboard.mjs";
import { customChange, setCurrentPlayer } from "../GUI/Custom Skin.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { obsControl } from "./OBSWebsocketControl.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { vodRename } from "./VodRename.mjs";

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
        id: "screenRockerInMatchOverrideToggle",
        title: "Allows you to override whether or not players are in match or not. If enabled, screen rocker will not auto update the In Match checkbox.",
        innerText: "Enable 'In Match' Override",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerInMatchToggle",
        title: "This determines if the players are fighting. If not checked, this means players are in character/stage select.",
        innerText: "In Match",
        type: "checkbox",
        disabled: true,
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
        title: "When enabled, all changes from the Screen Rocker immediately get applied to stream. If disabled, you will need to press 'Update' to apply changes. Update must be pressed for anything that is being handled manually.",
        innerText: "Auto Apply Update",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    }
]

const divs = genGuiSection('Screen Rocker', settingElectronDiv, false, newToggles);

const newTogglesOBS = [
    {
        id: "screenRockerOBSInfo",
        title: "Screen Rocker OBS Information",
        innerText: "All of the Screen Rocker OBS items require an active connection with OBS. These items will attempt to reconnect when possible.",
        type: "div",
        disabled: false,
        className: "settingsText"
    },
    {
        id: "screenRockerOBSToggle",
        title: "When active, this will allow the Stream Tool to control OBS using the provided scenes. Requires OBS connection and enabling Screen Rocker. (*Recommended to use 'Auto Apply Update' under Screen Rocker settings)",
        innerText: "Start Auto OBS Control",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "screenRockerSceneControl",
        title: "Enables Screen Rocker to control which scene shows.",
        innerText: "Scene Control",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
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
        innerText: "Scene selectors <br>1 - Start Scene (REQUIRED)<br>2 - Transition Scene (Optional)<br>3 - In Game Scene (REQUIRED)<br>4 - End Scene (Optional)",
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
        className: "textInput",
        options:[]
    },
    {
        id: "screenRockerTransitionScene",
        title: "OPTIONAL: The Scene that shows after the Start scene, before loading the In Game scene. (Used when players are picking characters/stages)",
        innerText: "2",
        type: "select",
        disabled: false,
        className: "textInput",
        options:[]
    },
    {
        id: "screenRockerInGameScene",
        title: "The Scene that shows when players are playing.",
        innerText: "3",
        type: "select",
        disabled: false,
        className: "textInput",
        options:[]
    },
    {
        id: "screenRockerEndScene",
        title: "OPTIONAL: The Scene that will show after the set ends.",
        innerText: "4",
        type: "select",
        disabled: false,
        className: "textInput",
        options:[]
    }
]


const obsDivs = genGuiSection('Screen Rocker OBS', divs.prevDiv, true, newTogglesOBS);

export class ScreenRocker {

    //Base items
    #screenRockerCheck = document.getElementById("screenRockerToggle");
    #screenRockerInMatchOverrideCheck = document.getElementById("screenRockerInMatchOverrideToggle");
    #screenRockerInMatchCheck = document.getElementById("screenRockerInMatchToggle");
    #screenRockerCharCheck = document.getElementById("screenRockerCharToggle");
    #screenRockerSkinCheck = document.getElementById("screenRockerSkinToggle");
    #screenRockerColorCheck = document.getElementById("screenRockerColorToggle");
    #screenRockerScoreCheck = document.getElementById("screenRockerScoreToggle");
    #screenRockerBestOfCheck = document.getElementById("screenRockerBestOfToggle");
    #screenRockerAutoApplyCheck = document.getElementById("screenRockerAutoApplyToggle");
    #lastElement = divs.prevDiv;
    #titleElement = divs.titleDiv;

    #settings = {
        enabled: false,
        inMatchOverride: false,
        inMatch: false,
        updateChar: false,
        updateSkin: false,
        updateColor: false,
        updateScore: false,
        updateBestOf: false,
        updateAutoApply: false
    }


    #playerPresets = {};
    #roaStateData = {};
    #diffFound = false;

    //OBS Items
    #screenRockerOBSBtn = document.getElementById('screenRockerOBSToggle');
    #getScenesBtn = document.getElementById('screenRockerGetLatestScenes');

    #screenRockerSceneControlCheck = document.getElementById('screenRockerSceneControl');
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
    #sceneControl = false;
    #inSet = false;
    #startOfSet = false;
    #prevScene = "";
    #curScene = "";

    #sceneData = {
        startScene: "",
        transitionScene :"",
        inGameScene : "",
        endScene : ""

    }

    #finalizingOBS = false;

    #autoThumbnail = false;
    #autoRecording = false;
    #autoRename = false;
    #screenshotCreated = false;

    constructor() {
        //Screen Rocker Settings
        this.#screenRockerCheck.addEventListener("click", () => this.toggleScreenRocker());
        this.#screenRockerInMatchOverrideCheck.addEventListener("click", () => this.toggleInMatchOverride());
        this.#screenRockerInMatchCheck.addEventListener("click", () => this.#toggleInMatch());
        this.#screenRockerCharCheck.addEventListener("click", () => this.toggleCharUpdate());
        this.#screenRockerSkinCheck.addEventListener("click", () => this.toggleSkinUpdate());
        this.#screenRockerColorCheck.addEventListener("click", () => this.toggleColorUpdate());
        this.#screenRockerScoreCheck.addEventListener("click", () => this.toggleScoreUpdate());
        this.#screenRockerBestOfCheck.addEventListener("click", () => this.toggleBestOfUpdate());
        this.#screenRockerAutoApplyCheck.addEventListener("click", () => this.toggleAutoApplyUpdate());

        //OBS Items
        this.#screenRockerOBSBtn.addEventListener("click", () => this.toggleAutoOBSControl());
        this.#getScenesBtn.addEventListener("click", () => this.#setupSelectBoxes());

        // updateDiv.removeEventListener("click", writeScoreboard);
        updateDiv.addEventListener("click", ()=> this.getSetData());
        
        
                
        //Scene Selections

        this.#screenRockerStartSceneSelect.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerTransitionScene.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerInGameScene.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerEndScene.addEventListener('change', () => this.#setSelectedScenes(true));

        this.#screenRockerSceneControlCheck.addEventListener("click", () => this.toggleSceneControl());
        this.#screenRockerAutoThumbnailCheck.addEventListener("click", () => this.toggleAutoThumbnail());
        this.#screenRockerAutoRecordCheck.addEventListener("click", () => this.toggleAutoRecording());
        this.#screenRockerAutoRenameCheck.addEventListener("click", () => this.toggleAutoRename());

        this.#loadSettings();
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

        if (this.#sceneControl && !this.#sceneData.startScene || !this.#sceneData.inGameScene) {
            displayNotif('Start Scene and In Game Scene are Required when using Scene Control.');
            return;
        }

        if (!this.#sceneControl && !this.#autoRecording && !this.#autoThumbnail && !this.#autoRename) {
            displayNotif("Must enable at least one of the following: Scene Control, Auto Recording, Auto create Thumbnail, or Auto File Rename")
            return;
        }
        if (!this.#settings.updateAutoApply) {
            displayNotif('WARNING: Auto Apply Update is off, you must update the data on the Stream Tool manually to allow it on the Stream');
        }
        if (!this.#settings.updateScore) {
            displayNotif('WARNING: Score Update is off. You must manually update the Score. OBS Control stops when a player wins (based upon Score and Best Of');
        }
        
        this.#autoOBSControl = !this.#autoOBSControl;
        this.toggleSet();

        if (this.#autoOBSControl) {
            this.#toggleDisableSceneSelects();
            this.#screenRockerOBSBtn.innerText = 'Stop Auto OBS Control'
            this.#writeData()
            this.handleScenes();
            
        } else {
            this.#toggleDisableSceneSelects();
            this.#screenRockerOBSBtn.innerText = 'Start Auto OBS Control'
            if (this.#autoRecording) {
                obsControl.stopRecord();
            }
        }
    }

    async #loadSettings() {
        this.#settings = await getJson(stPath.text + "/ScreenRockerSettings");
        this.#settings.enabled = false;
        
        this.#screenRockerInMatchOverrideCheck.checked = this.#settings.inMatchOverride;
        this.#screenRockerInMatchCheck.disabled = !this.#settings.inMatchOverride;
        this.#screenRockerInMatchCheck.checked = this.#settings.inMatch;
        this.#screenRockerCharCheck.checked = this.#settings.updateChar;
        this.#screenRockerSkinCheck.disabled = !this.#settings.updateChar;
        this.#screenRockerSkinCheck.checked = this.#settings.updateSkin;
        this.#screenRockerColorCheck.checked = this.#settings.updateColor;
        this.#screenRockerScoreCheck.checked = this.#settings.updateScore;
        this.#screenRockerBestOfCheck.checked = this.#settings.updateBestOf;
        this.#screenRockerAutoApplyCheck.checked = this.#settings.updateAutoApply;
    }

    async #saveSettings() {
        await saveJson("/ScreenRockerSettings", this.#settings);
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

    async toggleInMatchOverride() {
        this.#settings.inMatchOverride = !this.#settings.inMatchOverride;

        this.#screenRockerInMatchCheck.disabled = !this.#settings.inMatchOverride;

        this.getSetData();
        
    }

    async #toggleInMatch(bool) {
        if (bool != undefined) {
            this.#settings.inMatch = bool;
        } else {
            this.#settings.inMatch = !this.#settings.inMatch;
        }

        this.#screenRockerInMatchCheck.checked = this.#settings.inMatch;
        this.#saveSettings();
        this.getSetData();
    }

    #toggleDisableSceneSelects() {
        this.#getScenesBtn.disabled = (this.#getScenesBtn.disabled) ? false : true;
        
        for (let i = 0; i < this.#toggleDivsOBS.length; i++) {
            
            let childDiv = this.#toggleDivsOBS[i].lastChild;
            if (childDiv.nodeName == 'SELECT') {
                childDiv.disabled = (childDiv.disabled) ? false : true;
            }
        }
    }

    #setSelectedScenes(saveScenes) {
        //These 2 are mandatory.
        this.#sceneData.startScene = this.#screenRockerStartSceneSelect.value;
        this.#sceneData.inGameScene = this.#screenRockerInGameScene.value;

        //These 2 are optional.
        this.#sceneData.transitionScene = (this.#screenRockerTransitionScene.value) ? this.#screenRockerTransitionScene.value : this.#sceneData.startScene;
        this.#sceneData.endScene = (this.#screenRockerEndScene.value) ? this.#screenRockerEndScene.value : this.#sceneData.inGameScene;

        if (saveScenes) {
            this.#saveScenes();
        } 
    }

    async #saveScenes() {
        await saveJson("/SelectedScenes", this.#sceneData);  
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
        this.#setSelectedScenes(false); //Do this every time we run it to ensure we have the correct information.
        let useTimeout = this.#startOfSet;
        let endSceneHit = false;
        if (this.enabled() && this.#autoOBSControl && this.#sceneData.startScene && this.#sceneData.inGameScene) {
            if (this.inSet()) {
                if (this.#startOfSet) {
                    this.#screenshotCreated = false;
                    if (this.#autoRecording) {
                        await obsControl.startRecord();
                    }
                    
                    this.#curScene = this.#sceneData.startScene;
                    this.#startOfSet = false;
                    
                } else {
                    if (this.inMatch()) {
                        this.#curScene = this.#sceneData.inGameScene;
                    } else {
                        this.#curScene = this.#sceneData.transitionScene;
                    }
                }
            } else {
                this.#curScene = this.#sceneData.endScene;
                endSceneHit = true;
            }
            if (this.#curScene != this.#prevScene || endSceneHit) {
                if (!endSceneHit) {
                    if (this.#sceneControl) {
                        await obsControl.changeScene(this.#curScene);
                    }
                    
                    this.#prevScene = this.#curScene;
                }
                
                if (endSceneHit) {
                    this.#finalizingOBS = true;
                    this.#screenRockerOBSBtn.innerText = "Finalizing..."
                    setTimeout(async () => {
                        if (this.#autoRecording) {
                            await obsControl.stopRecord();
                        }  
                        if (this.#sceneControl) {
                            await obsControl.changeScene(this.#curScene);
                        }
                        
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
        return this.#settings.enabled;
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

        const selectedScenes = await getJson(stPath.text + '/SelectedScenes');
        const selectedScenesArr = [];
        for (let i in selectedScenes) {
            selectedScenesArr.push(selectedScenes[i]);
        }

        let selectIndex = 0;
        for (let i = 0; i < this.#toggleDivsOBS.length; i++) {
            
            let childDiv = this.#toggleDivsOBS[i].lastChild;
            if (childDiv.nodeName == 'SELECT') {
                childDiv.innerHTML = "";
                

                for (let j = -1; j < scenes.length; j++) {
                    const option = document.createElement('option');
                    if (j == -1) {
                        option.value = "";
                        option.innerHTML = "";
                    } else {
                        option.value = scenes[j].sceneName;
                        option.innerHTML = scenes[j].sceneName;
                    }
                    
                    // add colors to the list
                    option.style.backgroundColor = "var(--bg5)";
                    childDiv.appendChild(option);

                    if (j == -1) {
                        continue;
                    }

                    if (scenes[j].sceneName == selectedScenesArr[selectIndex]) {
                        childDiv.value = selectedScenesArr[selectIndex];
                    }
                }
                selectIndex++;
            }
        }
        this.#setSelectedScenes();
    }

    //The toggles for each piece.
    async toggleCharUpdate() {
        this.#settings.updateChar = !this.#settings.updateChar;
        if (!this.#settings.updateChar && this.#settings.updateSkin) {
            this.#screenRockerSkinCheck.click();
        }
        this.#screenRockerCharCheck.checked = this.#settings.updateChar;
        this.#screenRockerSkinCheck.disabled = !this.#settings.updateChar;
        this.getSetData();
    }

    async toggleSkinUpdate() {
        if (!this.#settings.updateChar && this.#screenRockerSkinCheck.checked == true) {
            this.#screenRockerSkinCheck.checked = false;
        } else {
            this.#settings.updateSkin = !this.#settings.updateSkin;
        }

        this.#screenRockerSkinCheck.checked = this.#settings.updateSkin;
        this.getSetData();
        
    }

    async toggleColorUpdate() {
        this.#settings.updateColor = !this.#settings.updateColor;
        this.#screenRockerColorCheck.checked = this.#settings.updateColor;
        this.getSetData();
    }

    async toggleScoreUpdate() {
        this.#settings.updateScore = !this.#settings.updateScore;
        this.#screenRockerScoreCheck.checked = this.#settings.updateScore;
        this.getSetData();
    }

    async toggleBestOfUpdate() {
        this.#settings.updateBestOf = !this.#settings.updateBestOf;
        this.#screenRockerBestOfCheck.checked = this.#settings.updateBestOf;
        this.getSetData();
    }

    async toggleAutoApplyUpdate() {       
        this.#settings.updateAutoApply = !this.#settings.updateAutoApply;
        this.#screenRockerAutoApplyCheck.checked = this.#settings.updateAutoApply;
        this.getSetData();
    }

    async toggleAutoThumbnail() {
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

    toggleSceneControl() {
        this.#sceneControl = !this.#sceneControl;
        this.#screenRockerSceneControlCheck.checked = this.#sceneControl;
    }



    hasData() {
        return (this.#roaStateData != "" && this.#playerPresets != "")
    }

    toggleScreenRocker() {
        if (this.canToggleOn()) {
            this.#settings.enabled = !this.#settings.enabled;
            this.getSetData();
            
        } else {
            this.#settings.enabled = false;
        }
        this.#screenRockerCheck.checked = this.#settings.enabled;
        return this.#settings.enabled;
    }

    async getSetData() {
        await this.#saveSettings();
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
        this.#roaStateData = await getJson(stPath.text + "/RoAState");  
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
        if(this.#settings.updateChar) { // update characters
            let playerPresetSkin = {};
            playerPresetSkin = this.#getSkinPreset(players[playerIndex].getName(), char);

            if (players[playerIndex].char != char || players[playerIndex].skin.name != playerPresetSkin.name || players[playerIndex].skinHex != playerPresetSkin.hex) {
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
        if (this.#settings.updateSkin) {
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
        return this.#settings.inMatch;
    }

    getScreenName() {
        return this.#roaStateData.ScreenName;
    }

    getDataReturn() {
        return this.#roaStateData;
    }

    
    async #setColorData(playerIndex, playerCount, slot, state) {
        if (this.#settings.updateColor) { //Update team colors
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
        if (this.#settings.updateScore) { //Update Score
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
        if (this.#settings.updateBestOf) {
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
        if (this.#settings.updateAutoApply && playersReady()) {
            // updateDiv.click();
            writeScoreboard();
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
        for (let i = 0; i < this.#roaStateData.Characters.length; i++) {
            if (this.#roaStateData.Characters[i].SlotState != "OFF") {
                playerCount++;
            }
        }
        
        //Player Characters
        let playerIndex = 0;
        for (let i = 0; i < this.#roaStateData.Characters.length; i++) {
            let slot = this.#roaStateData.Characters[i].SlotNumber;
            let char = capitalizeWords(this.#roaStateData.Characters[i].Character);
            let state = this.#roaStateData.Characters[i].SlotState;
            let gameCount = this.#roaStateData.Characters[i].GameCount;

            if (playerCount > 2 || state != "OFF") {
                await this.#setCharAndSkinData(playerIndex, char);
                await this.#setColorData(playerIndex, playerCount, slot, state);
                await this.#setScoreData(playerIndex, playerCount, gameCount);
                playerIndex++; 
            }            
        }

        if (!this.#settings.inMatchOverride) {
            this.#toggleInMatch(this.#roaStateData.TourneySet.InMatch);
        }
        
        this.#setBoData(this.#roaStateData.TourneySet.TourneyModeBestOf);
        this.#writeData();
        // screenRockerOBS.dataUpdate(this.#roaStateData);
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
