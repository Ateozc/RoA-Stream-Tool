import { stPath } from "../GUI/Globals.mjs";
import { settings } from "../GUI/Settings.mjs";
import { getJson, getPresetList, saveJson } from "../GUI/File System.mjs";
import { players, playersReady } from "../GUI/Player/Players.mjs";
import { bestOf } from "../GUI/BestOf.mjs";
import { scores } from "../GUI/Score/Scores.mjs";
import { currentColors, updateColor } from "../GUI/Colors.mjs";
import { writeScoreboard } from "../GUI/Write Scoreboard.mjs";
import { customChange, setCurrentPlayer } from "../GUI/Custom Skin.mjs";
import { guiSection } from "./EasyGUISection.mjs";
import { obsControl } from "./OBSWebsocketControl.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { vodRename } from "./VodRename.mjs";
import { startGG } from "./startGGIntegration.mjs";

const fs = require('fs');
const stateFile = stPath.text + "/RoAState"

const colorList = await getJson(stPath.text + "/Color Slots");

const settingElectronDiv = document.getElementById("settingsElectron");
const updateDiv = document.getElementById('updateRegion');

const newToggles = [
    {
        id: "screenRockerToggle",
        title: "Enable Screen Rocker automated check. Requires Screen Rocker to be updating RoAState.json (use the ScreenRocker.exe file).\nNOTES:\n- Ensure the game is set to Tourney mode.\n- Always ensure to reset back to CSS before re-enabling.\n- Automatically disables if the score is set 'finished'.\n\nExamples: \nBo3: Player 1 has a score of 2. \nBo5: Player 1 has a score of 3",
        innerText: "Enable Screen Rocker",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
	{
        id: "screenRockerBestOfToggle",
        title: "When enabled, tracks when the Best Of is changed.",
        innerText: "Track BestOf changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
	{
        id: "screenRockerTrackInMatchToggle",
        title: "When enabled, checks if the players are in CSS/SSS or have already selected a stage.",
        innerText: "Track 'In Match'",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerInMatchOverrideToggle",
        title: "Allows you to override whether or not players are in match or not. If enabled, screen rocker will not auto update the 'In Match' checkbox. \n\nUse this to manually decide if players are in CSS/SSS or have selected a stage",
        innerText: "'In Match' Override",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerInMatchToggle",
        title: "This determines if the players are fighting.\n\nIf checked, players have selected a stage and begun fighting.\n\nIf not checked, this means players are in character/stage select.",
        innerText: "In Match",
        type: "checkbox",
        disabled: true,
        className: "settingsCheck"
    },
    {
        id: "screenRockerTrackCharToggle",
        title: "When enabled, tracks character changes.",
        innerText: "Track Character changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerUsePlayerProfileSkinToggle",
        title: "When enabled, this will utilize the player's profile from the Stream Tool and use their skin preset.\n\nIf not set checked it will use the default skin for the character.\n\nNOTE: Requires 'Track Character changes' to be checked, otherwise this does nothing.",
        innerText: "Use Player Profile Skin",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerTrackTeamColorToggle",
        title: "When enabled, tracks the Team Color changes in game. \n\nThis is based on the if the slot is HMN, CPU, or OFF. \n- If CPU/OFF the color will be gray.\n- If HMN, it will be the following:\n\tSlot 1: Red\n\tSlot 2: Blue\n\tSlot 3: Pink\n\tSlot 4: Green",
        innerText: "Track Team Color changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
	{
        id: "screenRockerTrackPercentsToggle",
        title: "When enabled, tracks player percents. (Currently not used for anything).",
        innerText: "Track Percent changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerTrackScoreToggle",
        title: "When enabled, tracks the score changes.",
        innerText: "Track Score changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    },
    {
        id: "screenRockerAutoApplyChangesToggle",
        title: "When enabled, all changes from the Screen Rocker immediately get applied to stream.\n\nIf disabled, you will need to press 'Update' to apply changes. Update must be pressed for anything that is being handled manually.",
        innerText: "Auto Apply Changes",
        type: "checkbox",
        disabled: false,
        className: "settingsCheck"
    }
]

const divs = guiSection.genGuiSection('Screen Rocker', 'guiSettings', newToggles, 3, true);


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

const obsDivs = guiSection.genGuiSection('Screen Rocker OBS', 'guiSettings', newTogglesOBS, 4, true);


export class ScreenRocker {

	/*Base Settings items*/
	#screenRockerCheck = document.getElementById("screenRockerToggle");
	#screenRockerAutoApplyChangesCheck = document.getElementById("screenRockerAutoApplyChangesToggle");
	//Match Checks:
	#screenRockerTrackBestOfCheck = document.getElementById("screenRockerBestOfToggle");
	#screenRockerTrackInMatchCheck = document.getElementById("screenRockerTrackInMatchToggle");
	#screenRockerInMatchOverrideCheck = document.getElementById("screenRockerInMatchOverrideToggle");
	#screenRockerInMatchCheck = document.getElementById("screenRockerInMatchToggle");
	//Player Checks:
	#screenRockerTrackCharCheck = document.getElementById("screenRockerTrackCharToggle");
	#screenRockerTrackUsePresetSkinCheck = document.getElementById("screenRockerUsePlayerProfileSkinToggle");
	#screenRockerTrackTeamColorCheck = document.getElementById("screenRockerTrackTeamColorToggle");
	#screenRockerTrackPercentCheck = document.getElementById("screenRockerTrackPercentsToggle");
	#screenRockerTrackScoreCheck = document.getElementById("screenRockerTrackScoreToggle");

	
	#lastElement = divs.prevDiv;
	#titleElement = divs.titleDiv;

	//RoAState.json items
	#playerPresets = {};
    #roaStateData = {};
	#prevRoaStateData = {};

	//Settings
	#settings = {
        trackingEnabled: false,
		trackBestOfChange: false,
		trackInMatchChange: false,
        inMatchOverride: false,
        trackCharChange: false,
        usePlayerSkinFromProfile: false,
        trackTeamColorChange: false,
		trackPercentChanges: false,
        trackScoreChange: false,
        autoApplyChanges: false,
		showDebugInfo: false
    }

    #setInformation = {
        inMatch: false,
        inSet: false
    }

    //OBS Items
    #screenRockerOBSBtn = document.getElementById('screenRockerOBSToggle');
    #getScenesBtn = document.getElementById('screenRockerGetLatestScenes');

    //OBS Settings
    #screenRockerSceneControlCheck = document.getElementById('screenRockerSceneControl');
    #screenRockerAutoThumbnailCheck = document.getElementById('screenRockerAutoThumbnail');
    #screenRockerAutoRecordCheck = document.getElementById('screenRockerAutoRecord');
    #screenRockerAutoRenameCheck = document.getElementById('screenRockerAutoRename');

    //OBS Scene Selectors
    #screenRockerStartSceneSelect = document.getElementById('screenRockerStartScene');
    #screenRockerTransitionSceneSelect = document.getElementById('screenRockerTransitionScene');
    #screenRockerInGameSceneSelect = document.getElementById('screenRockerInGameScene');
    #screenRockerEndSceneSelect = document.getElementById('screenRockerEndScene');

    //OBS variables
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
		/*Base Settings items*/
		this.#screenRockerCheck.addEventListener("click", () => this.toggleScreenRocker(true));
		this.#screenRockerAutoApplyChangesCheck.addEventListener("click", () => this.toggleAutoApplyUpdate());
        updateDiv.addEventListener("click", ()=> this.getSetData());
		//Match Checks:
		this.#screenRockerTrackBestOfCheck.addEventListener("click", () => this.toggleBestOfUpdate());
		this.#screenRockerTrackInMatchCheck.addEventListener("click", () => this.toggleTrackInMatchUpdate());
		this.#screenRockerInMatchOverrideCheck.addEventListener("click", () => this.toggleInMatchOverride());
        this.#screenRockerInMatchCheck.addEventListener("click", () => this.#toggleInMatch());
		//Player Checks:
	    this.#screenRockerTrackCharCheck.addEventListener("click", () => this.toggleCharUpdate());
        this.#screenRockerTrackUsePresetSkinCheck.addEventListener("click", () => this.toggleSkinUpdate());
        this.#screenRockerTrackTeamColorCheck.addEventListener("click", () => this.toggleColorUpdate());
		this.#screenRockerTrackPercentCheck.addEventListener("click", () => this.togglePercentUpdate());
        this.#screenRockerTrackScoreCheck.addEventListener("click", () => this.toggleScoreUpdate());
        
		

        /* OBS Section */
        this.#screenRockerOBSBtn.addEventListener("click", () => this.toggleAutoOBSControl());
        this.#getScenesBtn.addEventListener("click", () => this.#setupSelectBoxes());

        /* OBS Scenes */
        this.#screenRockerStartSceneSelect.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerTransitionSceneSelect.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerInGameSceneSelect.addEventListener('change', () => this.#setSelectedScenes(true));
        this.#screenRockerEndSceneSelect.addEventListener('change', () => this.#setSelectedScenes(true));

        /* OBS Settings */
        this.#screenRockerSceneControlCheck.addEventListener("click", () => this.toggleSceneControl());
        this.#screenRockerAutoThumbnailCheck.addEventListener("click", () => this.toggleAutoThumbnail());
        this.#screenRockerAutoRecordCheck.addEventListener("click", () => this.toggleAutoRecording());
        this.#screenRockerAutoRenameCheck.addEventListener("click", () => this.toggleAutoRename());

		//Run these after setting up: 
		this.#loadSettings();
		this.watchFile();
	}

	/* ----- Settings Functions ----- */
	async #loadSettings() {
        this.#settings = await getJson(stPath.text + "/ScreenRockerSettings");
		//General Settings
        this.#settings.trackingEnabled = false;
		this.#screenRockerAutoApplyChangesCheck.checked = this.#settings.autoApplyChanges;
        //Match settings
		this.#screenRockerTrackBestOfCheck.checked = this.#settings.trackBestOfChange;
		this.#screenRockerTrackInMatchCheck.checked = this.#settings.trackInMatchChange;
        this.#screenRockerInMatchOverrideCheck.checked = this.#settings.inMatchOverride;
        this.#screenRockerInMatchCheck.disabled = !this.#settings.inMatchOverride;
		//Player settings
        this.#screenRockerTrackCharCheck.checked = this.#settings.trackCharChange;
        this.#screenRockerTrackUsePresetSkinCheck.disabled = !this.#settings.trackCharChange;
        this.#screenRockerTrackUsePresetSkinCheck.checked = this.#settings.usePlayerSkinFromProfile;
        this.#screenRockerTrackTeamColorCheck.checked = this.#settings.trackTeamColorChange;
		this.#screenRockerTrackPercentCheck.checked = this.#settings.trackPercentChanges;
        this.#screenRockerTrackScoreCheck.checked = this.#settings.trackScoreChange;
        
    }

	async #saveSettings() {
        await saveJson("/ScreenRockerSettings", this.#settings);
    }

	
	/* Toggles 
	NOTE: They set the settings, then the checkboxes based on the settings. This is for if we want to use external controls.
	*/

	//General toggles
	canToggleOn(showMsg) {
        if (bestOf.getBo() == 3 && (scores[0].getScore() >=2 || scores[1].getScore() >=2)) {
			return cantToggleOn(showMsg);
        }

        if (bestOf.getBo() == 5 && (scores[0].getScore() >=3 || scores[1].getScore() >=3)) {
			return cantToggleOn(showMsg);
        }

        return true;

		function cantToggleOn(showMsg) {
			if (showMsg) {
				displayNotif('Cannot toggle Screen Rocker on.\n\nScores need to be reset on Stream Tool.')
			}

			return false;
		}
    }

	toggleScreenRocker(showMsg) {
        if (this.canToggleOn(showMsg)) {
            this.#settings.trackingEnabled = !this.#settings.trackingEnabled;            
        } else {
            this.#settings.trackingEnabled = false;
        }
        this.#screenRockerCheck.checked = this.#settings.trackingEnabled;
		this.#saveSettings();

        if (this.#settings.trackingEnabled) {
            this.getSetData();
        }
        return this.#settings.trackingEnabled;
    }

	async toggleAutoApplyUpdate() {       
        this.#settings.autoApplyChanges = !this.#settings.autoApplyChanges;
        this.#screenRockerAutoApplyChangesCheck.checked = this.#settings.autoApplyChanges;
		this.#saveSettings();
    }

	//Match toggles
	async toggleBestOfUpdate() {
        this.#settings.trackBestOfChange = !this.#settings.trackBestOfChange;
        this.#screenRockerTrackBestOfCheck.checked = this.#settings.trackBestOfChange;
		this.#saveSettings();
    }

	async toggleTrackInMatchUpdate() {
        this.#settings.trackInMatchChange = !this.#settings.trackInMatchChange;
        this.#screenRockerTrackInMatchCheck.checked = this.#settings.trackInMatchChange;
		this.#saveSettings();
    }

    async toggleInMatchOverride() {
		this.#settings.inMatchOverride = !this.#settings.inMatchOverride;
		this.#screenRockerInMatchOverrideCheck.checked = this.#settings.inMatchOverride;
        this.#screenRockerInMatchCheck.disabled = !this.#settings.inMatchOverride;
		this.#saveSettings();        
    }

    async #toggleInMatch(bool) {
        if (bool != undefined) {
            this.#setInformation.inMatch = bool;
        } else {
            this.#setInformation.inMatch = !this.#setInformation.inMatch;
        }

        this.#screenRockerInMatchCheck.checked = this.#setInformation.inMatch;
        this.#saveSettings();
    }

    toggleSet() {
        this.#setInformation.inSet = this.#autoOBSControl;
        if (this.#setInformation.inSet) {
            this.#startOfSet = true;
        }
    }

	//The toggles for players.
    async toggleCharUpdate() {
        this.#settings.trackCharChange = !this.#settings.trackCharChange;
        this.#screenRockerTrackCharCheck.checked = this.#settings.trackCharChange;
		this.#saveSettings();
    }

	async toggleSkinUpdate() {
		this.#settings.usePlayerSkinFromProfile = !this.#settings.usePlayerSkinFromProfile;
        this.#screenRockerTrackUsePresetSkinCheck.checked = this.#settings.usePlayerSkinFromProfile;
		this.#saveSettings();
        
    }

	async toggleColorUpdate() {
        this.#settings.trackTeamColorChange = !this.#settings.trackTeamColorChange;
        this.#screenRockerTrackTeamColorCheck.checked = this.#settings.trackTeamColorChange;
		this.#saveSettings();
    }

	async togglePercentUpdate() {
        this.#settings.trackPercentChanges = !this.#settings.trackPercentChanges;
        this.#screenRockerTrackPercentCheck.checked = this.#settings.trackPercentChanges;
		this.#saveSettings();
    }


    async toggleScoreUpdate() {
        this.#settings.trackScoreChange = !this.#settings.trackScoreChange;
        this.#screenRockerTrackScoreCheck.checked = this.#settings.trackScoreChange;
		this.#saveSettings();
    }


	/* ----- Get values information */
    trackPlayerUpdate() {
        return (this.#settings.trackCharChange || this.#settings.trackPercentChanges || this.#settings.trackScoreChange || this.#settings.trackTeamColorChange);
    }
    
    inMatch() {
        return this.#setInformation.inMatch;
    }

    inSet() {
        return this.#setInformation.inSet;
    }

    getScreenName() {
        return this.#roaStateData.ScreenName;
    }

    getDataReturn() {
        return this.#roaStateData;
    }

	enabled() {
        return this.#settings.trackingEnabled;
    }

	/* ----- RoAState.json related functions ----- */
	async getData() {
        this.#playerPresets = await getPresetList("Player Info");
		this.#prevRoaStateData = JSON.parse(JSON.stringify(this.#roaStateData));
        this.#roaStateData = await getJson(stPath.text + "/RoAState");  
    }

	hasData() {
        return (this.#roaStateData != "" && this.#playerPresets != "")
    }

	changesFound() {
		//No previous set data yet, which means it is technically new stuff.
        if (this.#isEmptyObject(this.#prevRoaStateData)) {
            return true;
        }

        //In match change.
		if (this.#settings.trackInMatchChange) {
			if (this.#roaStateData.TourneySet.InMatch != this.#prevRoaStateData.TourneySet.InMatch) {
				return true;
			}
		}

		//Best Of Change
		if (this.#settings.trackBestOfChange) {
			if (this.#roaStateData.TourneySet.TourneyModeBestOf != this.#prevRoaStateData.TourneySet.TourneyModeBestOf) {
				return true;
			}
		}

		//Check for slot changes.
		for (let i = 0; i < this.#roaStateData.Characters.length; i++) {
			let prevSlot = this.#prevRoaStateData.Characters[i];
			let curSlot = this.#roaStateData.Characters[i];

			//Check for character changes
			if (this.#settings.trackCharChange || this.#settings.trackTeamColorChange) {
				if (curSlot.Character != prevSlot.Character) {
					return true;
				}
			}

			if (this.#settings.trackScoreChange) {
				if (curSlot.GameCount != prevSlot.GameCount) {
					return true;
				}
			}

			//Tracks if Player switches from Hmn/CPU/Off
			if (this.#settings.trackTeamColorChange) {
				if (curSlot.SlotState != prevSlot.SlotState) {
					return true;
				}
			}

            //Commenting this out until I know how I want to utilize percent changes.
			//Track percent changes
			// if (this.#settings.trackPercentChanges) {
			// 	if (curSlot.Damage != prevSlot.Damage) {
			// 		return true;
			// 	}
			// }
			
		}

		return false;
	}

    #isEmpty(obj) {
        for (const prop in obj) {
          if (Object.hasOwn(obj, prop)) {
            return false;
          }
        }
      
        return true;
      }


    #isEmptyObject(value) {
        if (value == null) {
          // null or undefined
          return false;
        }
      
        if (typeof value !== 'object') {
          // boolean, number, string, function, etc.
          return false;
        }
      
        const proto = Object.getPrototypeOf(value);
      
        // consider `Object.create(null)`, commonly used as a safe map
        // before `Map` support, an empty object as well as `{}`
        if (proto !== null && proto !== Object.prototype) {
          return false;
        }
      
        return this.#isEmpty(value);
      }

	async getSetData() {
		await this.#saveSettings();
		if (this.enabled()) {
			screenRocker.getData().then(() => {
				if (screenRocker.hasData() && screenRocker.changesFound()) {
					screenRocker.setData();
				}
			});
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
					screenRocker.getSetData();
				}
			});
		} catch (err) {

		}
	}

	async #writeData() {
        if (this.#settings.autoApplyChanges && playersReady()) {
            // updateDiv.click();
            try {
                if (await startGG.updateSetInfo() && startGG.isAutoReportSetEnabled()) {
                    await startGG.reportSet();
                }
            } catch (e) {

            }
            writeScoreboard();
            // document.getElementById("botBar").style.backgroundColor = "var(--bg3)";   
        }
    }

	/* ----- Data Manipulation functions (Modifies the ST) -----*/

    async setData() {
        let playerCount = 0;
        for (let i = 0; i < this.#roaStateData.Characters.length; i++) {
            if (this.#roaStateData.Characters[i].SlotState != "OFF") {
                playerCount++;
            }
        }
        
        //Player Characters

        if (this.trackPlayerUpdate()) {
            let playerIndex = 0;
            for (let i = 0; i < this.#roaStateData.Characters.length; i++) {
                let slot = this.#roaStateData.Characters[i].SlotNumber;
                let char = capitalizeWords(this.#roaStateData.Characters[i].Character);
                let state = this.#roaStateData.Characters[i].SlotState;
                let gameCount = this.#roaStateData.Characters[i].GameCount;
    
                if (playerCount > 2 || state != "OFF") {
                    await this.#setCharAndSkinData(playerIndex, char);
                    await this.#setTeamColorData(playerIndex, playerCount, slot, state);
                    await this.#setScoreData(playerIndex, playerCount, gameCount);
                    playerIndex++; 
                }            
            }
        }
       

        if (this.#settings.trackInMatchChange && !this.#settings.inMatchOverride) {
            this.#toggleInMatch(this.#roaStateData.TourneySet.InMatch);
        }
        
        this.#setBoData(this.#roaStateData.TourneySet.TourneyModeBestOf);
        this.#writeData();
        await this.handleScenes();

        if(!this.canToggleOn()) {
            this.#setInformation.inSet = false;
            await this.handleScenes();
            this.toggleScreenRocker();
        }
    }


    #isSame(item1, item2) {
        if(typeof item1 == Object) {
            for (let i in item1) {
                if(!this.#isSame(item1[i], item2[i])) {
                    return false;
                }
            }
            return true;
        } else {
            if (item1 == item2) {
                return true;
            }
            return false;
        }
    }

    async #setBoData(newBo) {
        if (this.#settings.trackBestOfChange) {
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

    async #setCharAndSkinData(playerIndex, char) {
        if(this.#settings.trackCharChange && !this.inMatch()) { // update characters
            let playerPresetSkin = {};
            playerPresetSkin = this.#getSkinPreset(players[playerIndex].getName(), char);
            
            if (players[playerIndex].char != char || players[playerIndex].skin.name != playerPresetSkin.name || (playerPresetSkin.hex != '' && players[playerIndex].skinHex != playerPresetSkin.hex)) {
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
        if (this.#settings.usePlayerSkinFromProfile) {
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


	findColorPreset(name) {
		for (let i = 0; i < colorList.length; i++) {
			if (name == colorList[i].name) {
				return colorList[i];
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

    async #setTeamColorData(playerIndex, playerCount, slot, state) {
        if (this.#settings.trackTeamColorChange) { //Update team colors
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


    async #setScoreData(playerIndex, playerCount, gameCount) {
        if (this.#settings.trackScoreChange) { //Update Score
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

    /* --- OBS Section --- */
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
        if (!this.#settings.autoApplyChanges) {
            displayNotif('WARNING: Auto Apply Update is off, you must update the data on the Stream Tool manually to allow it on the Stream');
        }
        if (!this.#settings.trackScoreChange) {
            displayNotif('WARNING: Score Update is off. You must manually update the Score. OBS Control stops when a player wins (based upon Score and Best Of');
        }
        
        this.#autoOBSControl = !this.#autoOBSControl;
        this.toggleSet();

        if (this.#autoOBSControl) {
            displayNotif('Enabling OBS Control...')
            this.#toggleDisableSceneSelects();
            this.#screenRockerOBSBtn.innerText = 'Stop Auto OBS Control'
            this.#writeData()
            this.handleScenes();
            
        } else {
            displayNotif('Disabling OBS Control...')
            this.#toggleDisableSceneSelects();
            this.#screenRockerOBSBtn.innerText = 'Start Auto OBS Control'
            if (this.#autoRecording) {
                obsControl.stopRecord();
            }
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
                    displayNotif('Finalizing OBS Control... Do not change anything');
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

    #setSelectedScenes(saveScenes) {
        //These 2 are mandatory.
        this.#sceneData.startScene = this.#screenRockerStartSceneSelect.value;
        this.#sceneData.inGameScene = this.#screenRockerInGameSceneSelect.value;

        //These 2 are optional.
        this.#sceneData.transitionScene = (this.#screenRockerTransitionSceneSelect.value) ? this.#screenRockerTransitionSceneSelect.value : this.#sceneData.startScene;
        this.#sceneData.endScene = (this.#screenRockerEndSceneSelect.value) ? this.#screenRockerEndSceneSelect.value : this.#sceneData.inGameScene;

        if (saveScenes) {
            this.#saveScenes();
        } 
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

    async toggleAutoThumbnail() {
        this.#autoThumbnail = !this.#autoThumbnail;
        if (this.#autoOBSControl && !this.#autoThumbnail) {
            displayNotif('Cannot toggle Auto create Thumbnail On. Auto OBS Control is already running.');
            this.#autoThumbnail = false;
        }
        if (!vodRename.getRecordingDir()) {
            displayNotif('Cannot activate Auto create Thumbnail. Missing Vod Directory.');
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

}


function capitalizeWords(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => (word != "and") ? word.charAt(0).toUpperCase() + word.slice(1) : word)
		.join(" ");
}

export const screenRocker = new ScreenRocker;