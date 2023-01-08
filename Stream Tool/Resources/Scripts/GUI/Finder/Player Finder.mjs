import { Finder } from "./Finder.mjs";
import { getJson, getPresetList } from '../File System.mjs';
import { getRecolorImage } from "../GetImage.mjs";
import { customChange, setCurrentPlayer } from "../Custom Skin.mjs";
import { current, stPath } from "../Globals.mjs";

class PlayerFinder extends Finder {

    #playerPresets;
    #presName; // to break playerpreset cycle


    constructor() {
        super(document.getElementById("playerFinder"));
        this.setPlayerPresets();
    }


    /** Sets a new player preset list from the presets folder */
    async setPlayerPresets() {
        this.#playerPresets = await getPresetList("Player Info");
    }

    /**
     * Fills the player preset finder depending on current player name
     * @param {Player} player - Player to find presets for
     */
    async fillFinderPresets(player) {

        //remove the "focus" for the player presets list
        current.focus = -1;

        // clear the current list each time we type
        this._clearList();

        // check for later
        let skinImgs = [];

        let currentPresName;

        // if we typed at least 3 letters
        if (player.getName().length >= 3) {

            // check the files in that folder
            skinImgs = await this.#generatePresetList(player);

        }

        // if we got some presets, show up finder
        if (skinImgs.length) {
            this._finderEl.style.display = "block";
        } else {
            this._finderEl.style.display = "none";
        }

        // now lets add those images to each entry
        currentPresName = this.#presName;
        for (let i = 0; i < skinImgs.length; i++) {

            // if the list isnt being shown, break the cycle
            if (this.#presName != currentPresName || !this.isVisible()) {
                break;
            }

            let skin;
            if (skinImgs[i].charJson) {
                if (skinImgs[i].skin == "Custom") {
                    skin = {name: "Custom", hex: skinImgs[i].hex}
                } else {
                    for (let j = 0; j < skinImgs[i].charJson.skinList.length; j++) {
                        if (skinImgs[i].charJson.skinList[j].name == skinImgs[i].skin) {
                            skin = skinImgs[i].charJson.skinList[j];
                        }
                    }
                }
            } else {
                skin = {name: skinImgs[i].skin}
            }
            
            let finalColIn = null;
            let finalColRan = null;
            if (skinImgs[i].charJson) {
                finalColIn = skinImgs[i].charJson.ogColor;
                finalColRan = skinImgs[i].charJson.colorRange;
            }
            const finalSrc = await getRecolorImage(
                skinImgs[i].char,
                skin,
                finalColIn,
                finalColRan,
                "Skins",
                "P2"
            );
            skinImgs[i].el.setAttribute('src', finalSrc);

        }

    }

    async #generatePresetList(player) {

        const skinImgs = [];

        const files = this.#playerPresets;
        for (let i = 0; i < files.length; i++) {

            // removes ".json" from the file name
            const file = files[i].substring(0, files[i].length - 5);

            // if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(player.getName().toLocaleLowerCase())) {

                // go inside that file to get the player info
                const playerInfo = await getJson(`${stPath.text}/Player Info/${file}`);
                // for each character that player plays
                playerInfo.characters.forEach(async char => {

                    // this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (playerInfo.tag != "") {
                        spanTag.innerHTML = playerInfo.tag;
                        spanTag.className = "pfTag";
                    }

                    // player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = file;
                    spanName.className = "pfName";

                    // plapDatayer character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = char.character;
                    spanChar.className = "pfChar";

                    // data to be accessed when clicked
                    const pData = {
                        name : file,
                        tag : playerInfo.tag,
                        pronouns : playerInfo.pronouns,
                        twitter : playerInfo.twitter,
                        twitch : playerInfo.twitch,
                        yt : playerInfo.yt,
                        char : char.character,
                        skin : char.skin,
                        hex : char.hex
                    }

                    // add them to the div we created before
                    newDiv.appendChild(spanTag);
                    newDiv.appendChild(spanName);
                    newDiv.appendChild(spanChar);

                    // now for the character image, this is the mask/mirror div
                    const charImgBox = document.createElement("div");
                    charImgBox.className = "pfCharImgBox";

                    // actual image
                    const charImg = document.createElement('img');
                    charImg.className = "pfCharImg";
                    const charJson = await getJson(`${stPath.char}/${char.character}/_Info`);
                    // we will store this for later
                    skinImgs.push({
                        el : charImg,
                        charJson : charJson,
                        char : char.character,
                        skin : char.skin,
                        hex : char.hex
                    });
                    // we have to position it
                    this._positionCharImg(char.skin, charImg, charJson);
                    // and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    // before we go, add a click listener
                    newDiv.addEventListener("click", () => {
                        this.#entryClick(pData, player)
                    });

                    //and now add the div to the actual interface
                    this.addEntry(newDiv);

                    // we need this to know which cycle we're in
                    this.#presName = player.getName();

                });

            }

        }

        return skinImgs;
    }

    /**
     * Updates a player with the data stored on the list's entry
     * @param {Object} pData - Data to be added to the player
     * @param {Player} player - Player to be updated
     */
    async #entryClick(pData, player) {

        // all them player data
        player.setName(pData.name);
        player.setTag(pData.tag);
        player.pronouns = pData.pronouns;
        player.twitter = pData.twitter;
        player.twitch = pData.twitch;
        player.yt = pData.yt;

        // character change
        await player.charChange(pData.char, true);
        if (pData.skin == "Custom") {
            setCurrentPlayer(player);
            customChange(pData.hex);
        } else { // search for all skins for name matches
            for (let i = 0; i < player.charInfo.skinList.length; i++) {
                if (player.charInfo.skinList[i].name == pData.skin) {
                    player.skinChange(player.charInfo.skinList[i]);
                    break;
                }
            }
        }

        // and hide the finder of course
        this.hide();

    }

}

export const playerFinder = new PlayerFinder;