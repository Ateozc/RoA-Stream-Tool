import { stPath } from "./Globals.mjs";
import { settings } from "./Settings.mjs";
import { getJson, getPresetList } from "./File System.mjs";
import { players, playersReady } from "./Player/Players.mjs";
import { bestOf } from "./BestOf.mjs";
import { scores } from "./Score/Scores.mjs";
import { currentColors, updateColor } from "./Colors.mjs";
import { writeScoreboard } from "./Write Scoreboard.mjs";
import { customChange, setCurrentPlayer } from "./Custom Skin.mjs";
import { runPythonUpdate } from "./PythonAutomation.mjs";

const colorList = await getJson(stPath.text + "/Color Slots");

const settingElectronDiv = document.getElementById("settingsElectron");
const newToggles = [
    {
        id: "screenRockerToggle",
        title: "Enable Screen Rocker automated check. Requires Screen Rocker to be updating RoAState.json",
        innerText: "Enable Screen Rocker",
        disabled: false
    },
    {
        id: "screenRockerCharToggle",
        title: "Enables the Skins to be updated based on the players preset skin (if available). If off or no preset found, this will set the skin to default.",
        innerText: "Enable Character Update",
        disabled: false
    },
    {
        id: "screenRockerSkinToggle",
        title: "Enable Screen Rocker automated check. Requires Screen Rocker to be updating RoAState.json",
        innerText: "Enable Skin Update",
        disabled: true
    },
    {
        id: "screenRockerColorToggle",
        title: "Enables the Team Color to be updated based upon the Screen Rocker. This is based on the Slot colors and Active slots (OFF/HMN/CPU)",
        innerText: "Enable Team Color Update",
        disabled: false
    },
    {
        id: "screenRockerScoreToggle",
        title: "Enables the Score to be updated based upon the Screen Rocker.",
        innerText: "Enable Score Update",
        disabled: false
    },
    {
        id: "screenRockerBestOfToggle",
        title: "Enables the Best Of to be updated based upon the Screen Rocker.",
        innerText: "Enable BestOf Update",
        disabled: false
    },
    {
        id: "screenRockerAutoApplyToggle",
        title: "When enabled, all changes immediately get applied to stream. If disabled, you will need to press 'Update' to apply changes.",
        innerText: "Enable Auto Apply Update",
        disabled: false
    }
]

let screenRockerTitleDiv = document.createElement("div");
screenRockerTitleDiv.className = "settingsTitle";
screenRockerTitleDiv.innerHTML = "Screen Rocker";
settingElectronDiv.before(screenRockerTitleDiv);

let prevDiv = screenRockerTitleDiv;

for (let t = 0; t < newToggles.length; t++) {
    let toggle = newToggles[t];
    let toggleDiv = document.createElement("div");
    toggleDiv.className = "settingBox";
    toggleDiv.title = toggle.title;

    let toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.id = toggle.id;
    toggleInput.className = "settingsCheck";    
    toggleInput.tabIndex = "-1";
    toggleInput.disabled = toggle.disabled;

    let inputLabel = document.createElement("label");
    inputLabel.htmlFor = toggle.id;
    inputLabel.className = "settingsText";
    inputLabel.innerHTML = toggle.innerText;

    toggleDiv.appendChild(toggleInput);
    toggleDiv.appendChild(inputLabel);

    prevDiv.after(toggleDiv);
    prevDiv = toggleDiv;
}

class ScreenRocker {

    #screenRockerCheck = document.getElementById("screenRockerToggle");
    #screenRockerCharCheck = document.getElementById("screenRockerCharToggle");
    #screenRockerSkinCheck = document.getElementById("screenRockerSkinToggle");
    #screenRockerColorCheck = document.getElementById("screenRockerColorToggle");
    #screenRockerScoreCheck = document.getElementById("screenRockerScoreToggle");
    #screenRockerBestOfCheck = document.getElementById("screenRockerBestOfToggle");
    #screenRockerAutoApplyCheck = document.getElementById("screenRockerAutoApplyToggle");

    #playerPresets = "";
    #data = "";
    #enabled = false;
    #diffFound = false;

    #updateChar = false;
    #updateSkin = false;
    #updateColor = false;
    #updateScore = false;
    #updateBestOf = false;
    #updateAutoApply = false;


    constructor() {
         //Screen Rocker Settings
         this.#screenRockerCheck.addEventListener("click", () => this.toggle());
         this.#screenRockerCharCheck.addEventListener("click", () => this.toggleCharUpdate());
         this.#screenRockerSkinCheck.addEventListener("click", () => this.toggleSkinUpdate());
         this.#screenRockerColorCheck.addEventListener("click", () => this.toggleColorUpdate());
         this.#screenRockerScoreCheck.addEventListener("click", () => this.toggleScoreUpdate());
         this.#screenRockerBestOfCheck.addEventListener("click", () => this.toggleBestOfUpdate());
         this.#screenRockerAutoApplyCheck.addEventListener("click", () => this.toggleAutoApplyUpdate());
    }

    enabled() {
        return this.#enabled;
    }

    //The toggles for each piece.
    toggleCharUpdate() {
        this.#updateChar = !this.#updateChar;
        if (!this.#updateChar && this.#updateSkin) {
            this.#screenRockerSkinCheck.click();
        }
        this.#screenRockerSkinCheck.disabled = !this.#updateChar;
    }

    toggleSkinUpdate() {
        if (!this.#updateChar && this.#screenRockerSkinCheck.checked == true) {
            this.#screenRockerSkinCheck.checked = false;
        } else {
            this.#updateSkin = !this.#updateSkin;
        }
        
    }

    toggleColorUpdate() {
        this.#updateColor = !this.#updateColor;
    }

    toggleScoreUpdate() {
        this.#updateScore = !this.#updateScore;
    }

    toggleBestOfUpdate() {
        this.#updateBestOf = !this.#updateBestOf;
    }

    toggleAutoApplyUpdate() {
        this.#updateAutoApply = !this.#updateAutoApply;
    }


    hasData() {
        return (this.#data != "" && this.#playerPresets != "")
    }

    toggle() {
        if (this.canToggleOn()) {
            this.#enabled = !this.#enabled;
        } else {
            this.#enabled = false;
        }
        return this.#enabled;
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
        for (var i = 0; i < colorList.length; i++) {
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
            }
        }
    }

    #writeData() {
        if (this.#updateAutoApply && this.#diffFound && playersReady()) {
            writeScoreboard();
            document.getElementById("botBar").style.backgroundColor = "var(--bg3)";   
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

            if(!this.canToggleOn()) {
                settings.toggleScreenRocker()
            }
        }

        this.#setBoData(this.#data.TourneySet.TourneyModeBestOf);
        this.#writeData();
    }
    
}



// Call init after 2 sec and repeat calling it every 2. sec
setInterval(init, 1000);

function init() {
    if (screenRocker.enabled()) {
        screenRocker.getData().then(() => {
            if (screenRocker.hasData) {
                screenRocker.setData();
            }
        });
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
