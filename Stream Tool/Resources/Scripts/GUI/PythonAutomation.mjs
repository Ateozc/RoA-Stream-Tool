import { casters } from './Caster/Casters.mjs';
import { inside, stPath } from './Globals.mjs';
import { players } from './Player/Players.mjs';
import { round } from './Round.mjs';
import { scores } from './Score/Scores.mjs';
import { teams } from './Team/Teams.mjs';
import { tournament } from './Tournament.mjs';
import { getJson, getPresetList, saveJson, saveSimpleTexts } from "./File System.mjs";
import { gamemode } from './Gamemode Change.mjs';


export async function runPythonUpdate() {
}

let curDataJson = {
    players: [], //needs characters played as.
    round: "",
    tournament:"",
    teams: ["",""]
}

let curMatchString = "";

let prevDataJson = {
    players: [],
    round: "",
    tournament: "",
    teams: ["",""]
}

let prevMatchString = "";



// init();
// setInterval(init, 1000);

// function init() {
//     setCurData();
// }

function setCurData() {
    curDataJson = {
        players: [], //needs characters played as.
        round: "",
        tournament:"",
        teams: ["",""]
    }

    let dubs = (gamemode.getGm() == 2);

    
    for (let i = 0; i < players.length; i++) {
        let playerTag = players[i].getTag();
        let playerName = players[i].getName();
        let playerCharacter = players[i].char;

        let playerObj = {
            tag: playerTag,
            name: playerName,
            characters: [playerCharacter]
        };
        curDataJson.players.push(playerObj);
    }
    
    curDataJson.round = round.getText();
    curDataJson.tournament = tournament.getText();
    curDataJson.teams[0] = teams[0].getName();
    curDataJson.teams[1] = teams[1].getName();
}

function genFile() {

}

function isSame(item1, item2) {
    if(typeof item1 == Object) {
        for (let i in item1) {
            if(isSame(item1[i], item2[i])) {
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
