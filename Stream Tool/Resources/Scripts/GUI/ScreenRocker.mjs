import { stPath } from './Globals.mjs';
import { settings } from './Settings.mjs';
import { getJson, getPresetList } from './File System.mjs';
import { players } from './Player/Players.mjs';
import { bestOf } from "./BestOf.mjs";
import { scores } from './Score/Scores.mjs';
import { currentColors } from './Colors.mjs';

const colorList = await getJson(stPath.text + "/Color Slots");

class ScreenRocker {

    playerPresets;
    data = "";
    enabled = false;

    constructor() {
        
    }

    toggle() {
        if (this.canToggleOn()) {
            this.enabled = !this.enabled;
        } else {
            this.enabled = false;
        }
        return this.enabled;
    }

    checkValues() {
        return this.data;
    }

    async getData() {
        this.playerPresets = await getPresetList("Player Info");
        this.data = await getJson(stPath.text + "/RoAState");
        
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

    setData() {
        

        /*
        Fix the set data to only work based upon the active slots (so if p1 fights p4, its still 1v1. Apply correctly)
        Ensure score works
        ensure best of swaps correctly
        */

        let playerCount = 0;
        for (let i = 0; i < this.data.Characters.length; i++) {
            if (this.data.Characters[i].SlotState != 'OFF') {
                playerCount++;
            }
        }


        //Player Characters
        let playerIndex = 0;
        for (let i = 0; i < this.data.Characters.length; i++) {
            let slot = this.data.Characters[i].SlotNumber;
            let char = capitalizeWords(this.data.Characters[i].Character);
            let state = this.data.Characters[i].SlotState;
            let gameCount = this.data.Characters[i].GameCount;

            if (playerCount > 2 || state != 'OFF') {
                if(true) { // update characters
//TODO: Need to find a way to populate with the skin of the player (if possible). Current issue is that the async of charChange means we cannot set a skin at this point in time.

                    players[playerIndex].charChange(char)
                    // players[playerIndex].charChange(char).then((value) =>
                    // {

                    //     console.log(players[playerIndex].findSkin('Grey'));
                    //     console.log(players[playerIndex].getSkinEntries());
                    // });
                    
                    if (playerIndex == 0) {
                        // players[playerIndex].skinChange(players[playerIndex].findSkin('Grey'));
                    }
                }

                if (true) { //Update team colors
                    // if (playerIndex == 0) {
                    //     if (playerCount > 2) { //force red on teams
                    //         currentColors.updateColor(0, getColorBasedOnSlot(1, 'HMN'));
                    //     } else {
                    //         currentColors.updateColor(0, getColorBasedOnSlot(slot, state));
                    //     }
                    // } else if (playerIndex == 1 && playerCount < 3) {
                    //     currentColors.updateColor(1, getColorBasedOnSlot(slot, state));
                    // } else if (playerIndex == 2 && playerCount > 2) {
                    //     currentColors.updateColor(1, getColorBasedOnSlot(2, 'HMN'));
                    // }
                }

                if (true) { //Update Score
                    if (playerIndex == 0) {
                        scores[0].setScore(gameCount); 
                    } else if (playerIndex == 1 && playerCount < 3) {
                        scores[1].setScore(gameCount); 
                    } else if (playerIndex == 2 && playerCount == 4) {
                        scores[1].setScore(gameCount); 
                    }
                }

                playerIndex++; 
            }

            if (bestOf.getBo() == 3 && (scores[0].getScore() >=2 || scores[1].getScore() >=2)) {
                settings.toggleScreenRocker();
            }

            if (bestOf.getBo() == 5 && (scores[0].getScore() >=3 || scores[1].getScore() >=3)) {
                settings.toggleScreenRocker();
            }
        }

        //Best of
        if (this.data.TourneySet.TourneyModeBestOf == 3 || this.data.TourneySet.TourneyModeBestOf == 5) {
            bestOf.setBo(this.data.TourneySet.TourneyModeBestOf );
        }
    }
}



// Call init after 2 sec and repeat calling it every 2. sec
setInterval(init, 1000);

function init() {
    if (screenRocker.enabled) {
        screenRocker.getData();
        if (screenRocker.data && screenRocker.playerPresets) {
            screenRocker.setData();
        }
    }
}

function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

function getColorBasedOnSlot(slot, state) {
    // if (state == 'CPU') {
    //     return currentColors;
    // }
    // if (slot == 1) {

    // }
}

export const screenRocker = new ScreenRocker;
