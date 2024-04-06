import { getCharacterList, getJson, saveJson } from "../GUI/File System.mjs";
import { charFinder } from "../GUI/Finder/Char Finder.mjs";
import { inside, current, stPath, realPath } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { players } from "../GUI/Player/Players.mjs";
import { settings } from "../GUI/Settings.mjs";
import { guiSection } from "./EasyGUISection.mjs";
import { vodRename } from "./VodRename.mjs"

const updateDiv = document.getElementById('updateRegion');

// const settingElectronDiv = document.getElementById("settingsElectron");
const scoreBoardDiv = document.getElementsByClassName("settingsTitle")[0];

const newToggles = [{
    id: "gameSelector",
    title: "Select a game",
    innerText: "Game",
    type: "select",
    disabled: false,
    className: "textInput",
    options: []
},
{
	id: "gameSelectUseAbbr",
	title: "If checked, the names displayed will be the abbreviations.",
	innerText: "Use Abbreviations",
	type: "checkbox",
	disabled: false,
	className: "settingsCheck"
}
]

const divs = guiSection.genGuiSection('Game Select', 'top', newToggles, 0, false);

class GameSelect {
    #altArtCheck = document.getElementById("forceAlt");
    #gameSelectorInput = document.getElementById('gameSelector');
    #abbrCheck = document.getElementById('gameSelectUseAbbr');
    #gamesList = [];
    #sectionsList = [];

    #toggleList = [
        {
            id: 'workshopToggle',
            games: ['']
        },
        {
            id: 'forceAlt',
            games: ['Rivals Workshop']
        },
        {
            id: 'forceHD',
            games: ['Rivals of Aether', 'Rivals 2']
        },
        {
            id: 'noLoAHD',
            games: ['Rivals of Aether']
        }
    ]


    constructor() {
        this.#gamesList = this.getGameList();
        this.setGamesList();

        this.#gameSelectorInput.addEventListener("change", () => this.setGame(this.#gameSelectorInput.value));
        this.#abbrCheck.addEventListener('click', () => this.setGamesList());
        this.showHideSettings();


    }

    getGameList() {
        if (inside.electron) {
            const fs = require('fs');
            const gamesListNames = fs.readdirSync(stPath.gamesDir, {
                withFileTypes: true
            })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)
                .filter((name) => {
                    // if the folder name contains '_Workshop' or 'Random', exclude it
                    if (name != "Default") {
                        return true;
                    }
                })

            const gamesList = [];

            for (let i = 0; i < gamesListNames.length; i++) {
                var game = {
                    name: gamesListNames[i],
                    abbr: this.getGameAbbr(gamesListNames[i])
                }

                gamesList.push(game);
            }

            // save the data for the remote gui
            saveJson(`/Games List`, gamesList);

            return gamesList;
        } else {
            return getJson(`${stPath.text}/Games List`);
        }
    }

    getGameAbbr(game) {
        let abbr = "RoA";
        if (game == 'Rivals Workshop') {
            return "RoAWS";
        }
        let exp = /\b[a-zA-Z\d]|[A-Z]/g; //gets the first letter of each and capital letters

        let abbrArr = game.match(exp);


        if (abbrArr.length > 0) {
            abbr = abbrArr.toString().replaceAll(',', '');
        }

        return abbr;
    }

    getGameListItem(game) {
        if (!game) {
            return false;
        }

        for (let i = 0; i < this.#gamesList.length; i++) {
            if (this.#gamesList[i].name == game) {
                return this.#gamesList[i];
            }
        }

        return false;
    }

    setGamesList() {
        if (this.#gamesList.length > 0) {
            let curSelection = this.#gameSelectorInput.value;
            this.#gameSelectorInput.innerHTML = '';
            for (let i = 0; i < this.#gamesList.length; i++) {
                const option = document.createElement('option');
                const game = this.#gamesList[i];
                option.value = game.name;
                if (this.#abbrCheck.checked) {
                    option.innerHTML = game.abbr;
                } else {
                    option.innerHTML = game.name;
                }
                
                if (curSelection == game.name) {
                    option.selected = true;
                } else if (curSelection == '' && game.name == 'Rivals of Aether') {
                    option.selected = true;
                }  
                
                option.style.backgroundColor = "var(--bg5)";
                this.#gameSelectorInput.appendChild(option);
            }
        }
        
    }

    async setGame(game) {
        const gameListItem = this.getGameListItem(game);
        if (gameListItem == false) {
            return;
        }
        this.#gameSelectorInput.value = game;
        vodRename.updateGameName(gameListItem.name);
        stPath.char = realPath + '/Games/' + gameListItem.name;
        current.game = gameListItem.name;
        current.gameAbbr = gameListItem.abbr;

        guiSection.showHideRivalsSections((current.game == 'Rivals of Aether' || current.game == 'Rivals Workshop'));

        await this.showHideSettings();

        await charFinder.loadCharacters();

        for (let i = 0; i < players.length; i++) {
            await players[i].charChange("Random");
        }
    }

    async showHideSettings() {

        let ws = (current.game == 'Rivals Workshop');

        const wsToggleInput = document.getElementById('workshopToggle');
        wsToggleInput.checked = ws;

        this.#altArtCheck.disabled = !ws;
        if (this.#altArtCheck.disabled) {
            this.#altArtCheck.checked = false;
            await settings.save("forceAlt", false);
        }

        // save current checkbox value to the settings file
        await settings.save("workshop", wsToggleInput.checked);

        for (let i = 0; i < this.#toggleList.length; i++) {
            this.showHideInputAndLabel(this.#toggleList[i].id, (this.#toggleList[i].games.indexOf(current.game) != -1));
        }
    }

    showHideInputAndLabel(inputId, show) {
        const inputEl = document.getElementById(inputId);
        const labelEl = document.querySelectorAll('label[for="' + inputId + '"]');
        
        if (show) {
            inputEl.style = '';
            labelEl[0].style = '';
        } else {
            inputEl.style = 'display: none';
            labelEl[0].style = 'display: none';
        }  
    }
}
export const gameSelector = new GameSelect;