import { showCustomSkin } from "../Custom Skin.mjs";
import { current } from "../Globals.mjs";
import { FinderSelect } from "./Finder Select.mjs";

class SkinColorFinder extends FinderSelect {

    constructor() {
        super(document.getElementById("skinColorFinder"));
    }

    /**
     * Fills the skin finder with the player's current character's skins Colors
     * @param {Player} player - Player that clicked on the skin selector
     */
    fillSkinColorList(player) {

        // clear the list
        this._clearList();

        const entries = player.getSkinColorEntries();
        for (let i = 0; i < entries.length; i++) {
            this.addEntry(entries[i]);
        }

        // load them skin images
        player.loadSkinImages();

    }

}

export const skinColorFinder = new SkinColorFinder;