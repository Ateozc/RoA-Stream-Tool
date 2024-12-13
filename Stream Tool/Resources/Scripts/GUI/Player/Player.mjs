import { fileExists, getJson, getSkinColorList } from "../File System.mjs";
import { charFinder } from "../Finder/Char Finder.mjs";
import { playerFinder } from "../Finder/Player Finder.mjs";
import { skinFinder } from "../Finder/Skin Finder.mjs";
import { skinColorFinder } from "../Finder/Skin Color Finder.mjs";
import { getRecolorImage } from "../GetImage.mjs";
import { inside, stPath, current } from "../Globals.mjs";
import { RoaRecolor } from "../RoA WebGL Shader.mjs";
import { settings } from "../Settings.mjs";
import { readyToUpdate } from "../Write Scoreboard.mjs";


export class Player {

    nameInp;
    tagInp;
    charSel;
    skinSel;
    skinColorSel;

    char = "";
    skin = "";
    skinColor = "";
    colorList = [];
    charInfo;
    iconSrc;

    skinEntries = [];
    skinColorEntries = [];
    #skinsLoaded;
    #skinsColorsLoaded;

    #readyToUpdate;

    constructor(id) {

        this.pNum = id;
        // will generate all images for the character
        this.shader = new RoaRecolor;

    }

    /** Sets up listeners for all finders */
    setFinderListeners() {

        // check if theres a player preset every time we type or click in the player box
        this.nameInp.addEventListener("input", async () => {
            const skinImgs = await playerFinder.fillFinderPresets(this);
            playerFinder.positionFinder();
            playerFinder.loadFinderImgs(skinImgs, this);
        });
        this.nameInp.addEventListener("focusin", async () => {
            const skinImgs = await playerFinder.fillFinderPresets(this);
            playerFinder.open(this.nameInp.parentElement);
            playerFinder.positionFinder();
            playerFinder.loadFinderImgs(skinImgs, this);
        });

        // hide the player presets menu if text input loses focus
        this.nameInp.addEventListener("focusout", () => {
            if (!inside.finder) { //but not if the mouse is hovering a finder
                playerFinder.hide();
            }
        });

        // set listeners that will trigger when character or skin changes
        this.charSel.addEventListener("click", () => {
            charFinder.open(this.charSel);
            charFinder.setCurrentPlayer(this);
            charFinder.focusFilter();
        });
        this.skinSel.addEventListener("click", () => {
            skinFinder.open(this.skinSel);
            skinFinder.fillSkinList(this);
            skinFinder.focusFilter();
            
        });

        this.skinColorSel.addEventListener("click", () => {
            skinColorFinder.open(this.skinColorSel);
            skinColorFinder.fillSkinColorList(this);
            skinColorFinder.focusFilter();
        });

    }

    /**
     * Updates the character for this player
     * @param {String} character - Name of the character to update to
     * @param {Boolean} notDefault - Determines if we skinChange to the default skin
     */
    async charChange(character, notDefault) {

        // notify the user that we are not ready to update
        this.setReady(false);
        this.#skinsLoaded = false;
        this.#skinsColorsLoaded = false;

        this.char = character;

        // update character selector text
        this.charSel.children[1].innerHTML = character;

        // set the skin list for this character
        this.charInfo = await getJson(`${stPath.char}/${character}/_Info`);

        // if the character doesnt exist, write in a placeholder
        if (this.charInfo === null) {
            this.charInfo = {
                skinList : [{name: "Default"}],
                colorData : {Default : {}},
                gui : [],
                scoreboard : [],
            }
        }

        // set the skin variable from the skin list
        this.skin = this.charInfo.skinList[0];
        this.skinColor = 'Default';

        // if there's only 1 skin, dont bother displaying skin selector
        if (this.charInfo.skinList.length > 1) {
            this.skinSel.style.display = "flex";
        } else {
            this.skinSel.style.display = "none";
        }

        

        // if we are changing both char and skin, dont show default skin
        if (!notDefault) {
            this.skinChange(this.skin);
        }

        // if we get a skin list to choose from, generate them entries
        if (this.charInfo.skinList.length > 1) {
            this.generateSkinEntries();
        }
        
        if (this.skin.name) {
            await this.generateSkinColorEntries();
        }

    }

    /** Checks if an icon for the current skin exists, recolors the icon if it doesnt */
    async setIconImg() {
        const promises = [];
        promises.push(getRecolorImage(
            this.shader,
            this.char,
            this.skin,
            this.skinColor,
            this.charInfo.colorData,
            "Icons",
            "Icon"
        ));
        promises.push(this.getBrowserSrc(this.char, this.skin, "Icons", "Icons"));
        await Promise.all(promises).then( (value) => {
            this.iconSrc = value[0];
            this.iconBrowserSrc = value[1];
            this.charSel.children[0].src = this.iconSrc;
        })
    }

    /** Creates list entries so the Skin Finder can get them when called */
    async generateSkinEntries() {

        const skinImgs = [];
        this.skinEntries = [];

        // for every skin on the skin list, add an entry
        for (let i = 0; i < this.charInfo.skinList.length; i++) {
            
            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {
                this.skinColor = "Default";
                this.skinChange(this.charInfo.skinList[i])
                this.generateSkinColorEntries(this.char, this.charInfo.skinList[i].name);
            });
            
            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = this.charInfo.skinList[i].name;
            spanName.className = "pfName";

            // add them to the div we created before
            newDiv.appendChild(spanName);

            // now for the character image, this is the mask/mirror div
            const charImgBox = document.createElement("div");
            charImgBox.className = "pfCharImgBox";

            // store for later
            skinImgs.push(charImgBox);

            // add it to the main div
            newDiv.appendChild(charImgBox);

            // and now add the div to the entry list
            this.skinEntries.push(newDiv);

        }

        this.skinImgs = skinImgs;

    }
    getSkinEntries() {
        return this.skinEntries;
    }

    /** Creates list entries so the Skin Finder can get them when called */
    async generateSkinColorEntries() {

        const skinColorImgs = [];
        this.skinColorEntries = [];

        this.skinColorList = await getSkinColorList(this.char, this.skin.name);


        // for every skin on the skin list, add an entry
        for (let i = 0; i < this.skinColorList.length; i++) {
            
            // this will be the div to click
            const newDiv = document.createElement('div');
            newDiv.className = "finderEntry";
            newDiv.addEventListener("click", () => {
                this.skinColor = this.skinColorList[i];
                this.skinChange(this.skin)
                
            });
            
            // character name
            const spanName = document.createElement('span');
            spanName.innerHTML = this.skinColorList[i];
            spanName.className = "pfName";

            // add them to the div we created before
            newDiv.appendChild(spanName);

            // now for the character image, this is the mask/mirror div
            const charImgBox = document.createElement("div");
            charImgBox.className = "pfCharImgBox";

            // store for later
            skinColorImgs.push(charImgBox);

            // add it to the main div
            newDiv.appendChild(charImgBox);

            // and now add the div to the entry list
            this.skinColorEntries.push(newDiv);
        }

        this.skinColorImgs = skinColorImgs;

         // if there's only 1 skin, dont bother displaying skin selector
         if (this.charInfo.skinList.length > 1 && this.skinColorEntries.length > 0) {
            this.skinColorSel.style.display = "flex";
        } else {
            this.skinColorSel.style.display = "none";
        }

    }
    getSkinColorEntries() {
        return this.skinColorEntries;
    }

    /** Loads skin images next to each skin entry on the skin list */
    async loadSkinImages() {

        this.#skinsColorsLoaded = false;

        if (!this.#skinsLoaded) { // only first time skin finder is opened            
            this.#skinsLoaded = true;

            const currentChar = this.char;
    
            // add them images to each entry and recolor them if needed
            for (let i = 0; i < this.skinImgs.length; i++) {
    
                // if we changed character in the middle of img loading, discard next ones
                if (currentChar == this.char) {
    
                    // get the final image
                    const finalImg = new Image();
                    finalImg.className = "pfCharImg";
                    finalImg.src = await getRecolorImage(
                        this.shaderFinder,
                        this.char,
                        this.charInfo.skinList[i],
                        this.skinColor,
                        this.charInfo.colorData,
                        "Skins",
                        "P2"
                    );
                    // preload it so the gui doesnt implode when loading 30 images at once
                    finalImg.decode().then(() => {
                        // we have to position it
                        skinFinder.positionCharImg(
                            this.charInfo.skinList[i].name,
                            finalImg,
                            {gui: this.charInfo.gui}
                        );
                        // attach it
                        this.skinImgs[i].appendChild(finalImg);
                    })
    
                } else {
                    break;
                }
                
            }
        }
    }

    async loadSkinColorImages() {
        if (!this.#skinsColorsLoaded) { // only first time skin finder is opened
            
            this.#skinsColorsLoaded = true;

            const currentChar = this.char;
            for (let i = 0; i < this.skinColorImgs.length; i++) {              
        
                // if we changed character in the middle of img loading, discard next ones
                if (currentChar == this.char) {

                    // get the final image
                    const finalImg = new Image();
                    finalImg.className = "pfCharImg";
                    finalImg.src = await getRecolorImage(
                        this.shaderFinder,
                        this.char,
                        this.skin,
                        this.skinColorList[i],
                        this.charInfo.colorData,
                        "Skins",
                        "P2"
                    );
                    // preload it so the gui doesnt implode when loading 30 images at once
                    finalImg.decode().then(() => {
                        // we have to position it
                        skinColorFinder.positionCharImg(
                            this.skin.name,
                            finalImg,
                            {gui: this.charInfo.gui},
                            this.skinColorList[i]
                        );
                        // attach it
                        this.skinColorImgs[i].appendChild(finalImg);
                    })

                } else {
                    break;
                }
                
            }
        }
    }

    /** Returns a valid src for browser sources */
    async getBrowserSrc(char, skin, skinColor, extraPath, failPath) {
        if (await fileExists(`${stPath.char}/${char}/${extraPath}/${skin.name}/${skinColor}.png`) && !skin.force) {
            return `Resources/Games/${current.game}/${char}/${extraPath}/${skin.name}/${skinColor}.png`;
        } else if (await fileExists(`${stPath.char}/${char}/${extraPath}/${skin.name}.png`) && !skin.force) {
            return `Resources/Games/${current.game}/${char}/${extraPath}/${skin.name}.png`;
        } else if (await fileExists(`${stPath.char}/${char}/${extraPath}/Default.png`)) {
            if (skin.hex) {
                return null;
            } else {
                return `Resources/Games/${current.game}/${char}/${extraPath}/Default.png`;
            }
        } else {
            if (await fileExists(`${stPath.char}/Random/${failPath}.png`)) { //Use the random for the game if we can
                return `Resources/Games/${current.game}/Random/${failPath}.png`
            } else {
                return `Resources/Games/Default/Random/${failPath}.png`;
            }
        }
        
    }

    /**
     * Searches for skin data on the player's skin list
     * @param {String} name - Just the name of the skin
     * @returns Skin data object
     */
    findSkin(name) {
        for (let i = 0; i < this.charInfo.skinList.length; i++) {
            if (this.charInfo.skinList[i].name == name) {
                
                return this.charInfo.skinList[i];
            }
        }
        // if nothing was found just return random placeholder
        return {name: "Random"}
    }

    /**
     * Sends a signal to the updater to notify if the player is busy
     * @param {Boolean} state - True if ready, false if not
     */
    setReady(state) {
        this.#readyToUpdate = state;
        readyToUpdate(state);
    }
    getReadyState() {
        return this.#readyToUpdate;
    }

}