import { getCharacterList, getJson, saveJson } from "../GUI/File System.mjs";
import { charFinder } from "../GUI/Finder/Char Finder.mjs";
import { inside, current, stPath, realPath } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { players } from "../GUI/Player/Players.mjs";
import { settings } from "../GUI/Settings.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { vodRename } from "./VodRename.mjs"

const updateDiv = document.getElementById('updateRegion');


/* Divs for other things like Workshop and LoA */
const wsToggleInput = document.getElementById('workshopToggle');
wsToggleInput.style = 'display: none';

const wsToggleLabel = document.querySelectorAll('label[for="workshopToggle"]');
wsToggleLabel[0].style = 'display: none';


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
}]


const divs = genGuiSection('Game Select', scoreBoardDiv, false, newToggles);

class GameSelect {
    #altArtCheck = document.getElementById("forceAlt");
    #gameSelectorInput = document.getElementById('gameSelector');
    #gamesList = [];


    constructor() {
        this.#gamesList = this.getGameList();
        this.setGamesList();

        this.#gameSelectorInput.addEventListener("change", () => this.setGame());


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

    setGamesList() {
        this.#gameSelectorInput.innerHTML = '';
        for (let i = 0; i < this.#gamesList.length; i++) {
            const option = document.createElement('option');
            const game = this.#gamesList[i];
            option.value = game.name;
            option.innerHTML = game.name;

            if (game.name == 'Rivals of Aether') {
                option.selected = true;
            }

            option.style.backgroundColor = "var(--bg5)";
            this.#gameSelectorInput.appendChild(option);
        }
    }

    async setGame() {
        vodRename.updateGameName(this.#gameSelectorInput.value);
        stPath.gamePath = 'Games\\'  + this.#gameSelectorInput.value;
        stPath.char = realPath + '\\Games\\' + this.#gameSelectorInput.value;
        stPath.browserCharPath = 'Resources\\Games\\' + this.#gameSelectorInput.value;
        

        let ws = (this.#gameSelectorInput.value == 'Rivals Workshop');

        wsToggleInput.checked = ws;

        this.#altArtCheck.disabled = !ws;
        if (this.#altArtCheck.disabled) {
            this.#altArtCheck.checked = false;
            await settings.save("forceAlt", false);
        }

        await charFinder.loadCharacters();

        for (let i = 0; i < players.length; i++) {
            await players[i].charChange("Random");
        }
    }

}
export const gameSelector = new GameSelect;