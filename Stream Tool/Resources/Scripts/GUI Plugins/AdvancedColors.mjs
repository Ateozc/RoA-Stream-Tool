import { currentColors, updateColor } from "../GUI/Colors.mjs";
import { getJson, saveJson } from "../GUI/File System.mjs";
import { stPath } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { settings } from "../GUI/Settings.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { ntc } from "./NameThatColor.mjs";

const colorList = await getJson(stPath.text + "/Color Slots");
const colorContainerL = document.getElementById('lColor');
const colorContainerR = document.getElementById('rColor');
const dropdownColorL = document.getElementById('dropdownColorL');
const dropdownColorR = document.getElementById('dropdownColorR');

const colorInputL = document.createElement('input');
colorInputL.type = "color";
colorInputL.style.opacity = 0;
colorInputL.style.height = 0;
colorInputL.style.width = 0;
colorInputL.style.top = "13px";
colorInputL.style.left = "12px";
colorInputL.style.position = "absolute";
colorInputL.style.cursor = "pointer";
colorInputL.value = currentColors[0].hex;
colorInputL.disabled = true;

const colorInputR = colorInputL.cloneNode(true);
colorInputR.value = currentColors[1].hex;
dropdownColorL.after(colorInputL);
dropdownColorR.after(colorInputR);

const savePresetNameInputL = document.createElement('input');//<input type="text" id="teamName1" class="teamName textInput elGm2 mousetrap" tabindex="1" placeholder="Team 1 name" spellcheck="false" contenteditable="true"></input>
savePresetNameInputL.type = 'text';
savePresetNameInputL.className = "textInput";
savePresetNameInputL.tabIndex = 1;
savePresetNameInputL.placeholder = "Color Name";
savePresetNameInputL.disabled = true;
savePresetNameInputL.spellcheck = false;
savePresetNameInputL.style.display = 'none';
savePresetNameInputL.style.width = '50%';
savePresetNameInputL.value = currentColors[0].name;
const savePresetNameInputR = savePresetNameInputL.cloneNode(true);
savePresetNameInputR.value = currentColors[1].name;

const savePresetContainerL = document.createElement('button');
savePresetContainerL.id = "savePresetColorL";
savePresetContainerL.className = "pColor";
savePresetContainerL.tabIndex = -1;
savePresetContainerL.style.display = 'none';
savePresetContainerL.title = "Save color as a preset."
const savePresetDiv = document.createElement('div');
savePresetDiv.className = "pInfoIconContColorSave";
savePresetDiv.innerHTML = '<load-svg src="SVGs/Save.svg" class="saveCasterIcon"></load-svg>';

savePresetContainerL.appendChild(savePresetDiv);
const savePresetContainerR = savePresetContainerL.cloneNode(true);
savePresetContainerR.id = "savePresetColorR";

colorContainerL.after(savePresetNameInputL);
savePresetNameInputL.after(savePresetContainerL)

colorContainerR.after(savePresetNameInputR);
savePresetNameInputR.after(savePresetContainerR)

const updateDiv = document.getElementById('updateRegion');

const guiSettingsDiv = document.getElementById("settingsButtonSection");
const newToggles = [
    {
        id: "advancedColorsTeams",
        title: "Allows you to use any color you want via a color picker for teams.",
        innerText: "Color Picker for teams",
        type: "checkbox",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "advancedColorsShowNames",
        title: "Shows the name of the colors",
        innerText: "Show Color Names",
        type: "checkbox",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "advancedColorsAllowRename",
        title: "Enables/Disables the text field to update the name of the preset. (You cannot rename the base presets)",
        innerText: "Allow Rename of Presets?",
        type: "checkbox",
        disabled: false,
        className: "settingsButton"
    }
]

const divs = genGuiSection('Advanced Color Settings', guiSettingsDiv, true, newToggles);

class AdvancedColors {
    #toggleDivsOBS = divs.toggleDivs;
    #lastOBSElement = divs.prevDiv;

    #colorInputs = [colorInputL, colorInputR]
    #colorTexts = [savePresetNameInputL, savePresetNameInputR];
    #settings = {
        teamPicker: false,
        showNames: false,
        rename: false
    }
    #colorPickerTeamsCheck = document.getElementById('advancedColorsTeams');
    #colorNamesCheck = document.getElementById('advancedColorsShowNames');
    #colorRenameCheck = document.getElementById('advancedColorsAllowRename');
    

    constructor() {
        this.#colorNamesCheck.addEventListener('click', ()=> this.#toggleNameShow());
        this.#colorRenameCheck.addEventListener('click', ()=> this.#toggleNameDisabled());
        this.#colorInputs[0].addEventListener('change', ()=> this.#updateColor(0));
        this.#colorInputs[1].addEventListener('change', ()=> this.#updateColor(1));
        this.#colorPickerTeamsCheck.addEventListener('click', ()=> this.#toggleColorPickerForTeams());
        colorContainerL.addEventListener('click', ()=> this.#clickColorInput(0));
        colorContainerR.addEventListener('click', ()=> this.#clickColorInput(1));
        savePresetContainerL.addEventListener('click', ()=> this.#savePreset(0));
        savePresetContainerR.addEventListener('click', ()=> this.#savePreset(1));
    }

    #toggleNameShow() {
        this.#settings.showNames = !this.#settings.showNames;
        this.#colorTexts[0].disabled = !this.#settings.rename;
        this.#colorTexts[1].disabled = !this.#settings.rename;
        this.#colorNamesCheck.checked = this.#settings.showNames;
        this.#showHideNames();
    }

    #showHideNames() {
        if (this.#settings.showNames && this.#settings.teamPicker) {
            savePresetNameInputL.style.display = '';
            savePresetNameInputR.style.display = '';
        } else {
            savePresetNameInputL.style.display = 'none';
            savePresetNameInputR.style.display = 'none';
        }
        savePresetNameInputL.value = currentColors[0].name;
        savePresetNameInputR.value = currentColors[1].name;
    }

    #toggleNameDisabled() {
        this.#settings.rename = !this.#settings.rename;
        this.#colorTexts[0].disabled = !this.#settings.rename;
        this.#colorTexts[1].disabled = !this.#settings.rename;
        this.#colorRenameCheck.checked = this.#settings.rename;
        
    }

    #toggleColorPickerForTeams() {
        this.#settings.teamPicker = !this.#settings.teamPicker;
        this.#showHideNames();
        if (this.#settings.teamPicker) {
            dropdownColorL.style.display = 'none';
            dropdownColorR.style.display = 'none';
            savePresetContainerL.style.display = '';
            savePresetContainerR.style.display = '';
            savePresetNameInputL.value = currentColors[0].name;
            savePresetNameInputR.value = currentColors[1].name;
        } else {
            dropdownColorL.style.display = '';
            dropdownColorR.style.display = '';
            savePresetContainerL.style.display = 'none';
            savePresetContainerR.style.display = 'none';
        }

        this.#colorInputs[0].disabled = !this.#settings.teamPicker;
        this.#colorInputs[1].disabled = !this.#settings.teamPicker;
        this.#colorPickerTeamsCheck.checked = this.#settings.teamPicker;
    }

    #clickColorInput(side) {
        this.#colorInputs[side].value = currentColors[side].hex;
        if (this.#settings.teamPicker) {
            this.#colorInputs[side].click();
        }
    }

    async #updateColor(side) {
        let hex = this.#colorInputs[side].value;
        let presetColor = this.#getColorPreset(hex); 
        let name = presetColor.name;
        let filter = presetColor.filter;
        if (!name) {
            name = ntc.name(this.#colorInputs[side].value)[1]
            // name = 'Cpu';
            filter = this.getColorFilter(hex);
        }

        let color = {
            name: name,
            hex: hex,
            filter: filter
        }

        await updateColor(side, color);
        this.#colorTexts[side].value = color.name;
        return color;
    }

    #getColorPreset(hex) {
        for (let i = 0; i < colorList.length; i++) {
            if (colorList[i].hex == hex) {
                return colorList[i];
            }
        }
        return {};
    }

    getColorFilter(hex) {
        let rgb = ntc.hexToRgb(hex);
        const id = hex.split('#')[1];
        const target = {
            r: rgb.r / 255,
            g: rgb.g / 255,
            b: rgb.b / 255
        };
        // let filter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${target.r} 0 0 0 0 ${target.g} 0 0 0 0 ${target.b} 0 0 0 1 0"/></filter></defs></svg>${hex}')`;
        let filter = `brightness(175%) url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${target.r} 0 0 0 0 0 ${target.g} 0 0 0 0 0 ${target.b} 0 0 0 0 0 1 0"/></filter></defs></svg>${hex}')`;
        return filter;
    }

    async #savePreset(side) {
        let newColor = true;
        let updateName = false;
        let name = this.#colorTexts[side].value;
        let color = await this.#updateColor(side);
        let prevName = "";
        
        if (this.#colorInputs[side].value == color.hex) {
            this.#colorTexts[side].value = name;
            color.name = name;
        }
        

        for (let i = 0; i < colorList.length; i++) {
            const existingColor = colorList[i];

            if (existingColor.hex == color.hex ) {
                if (existingColor.name != color.name) {
                    prevName = existingColor.name;
                    colorList[i].name = color.name;
                    updateName = true;
                    break;
                } else {
                    newColor = false;
                    break;
                }    
            }
        }

        if (newColor && !updateName) {
            colorList.push(color);
            await saveJson("/Color Slots", colorList);
            displayNotif('New Color preset added.');
            this.#createColorOptionInList(color);
        } else if (updateName) {
            await saveJson("/Color Slots", colorList);
            displayNotif('Updated custom preset color name.');
            this.#updateColorOptionInList(color);
        } else {
            displayNotif('Color preset already exists, cannot add it to the list.');
        }
        
    }

    #updateColorOptionInList(color) {
        const colorEntryDivs = document.getElementsByClassName('colorEntry');
        for (let i = 0; i < colorEntryDivs.length; i++) {
            let title = colorEntryDivs[i].title;
            if (title.indexOf(color.hex) != -1) {
                colorEntryDivs[i].remove();
                break;
            }
        }
        this.#createColorOptionInList(color);
    }

    #createColorOptionInList(color) {
        const newDiv = document.createElement('div');
        newDiv.title = "Also known as " + color.hex;
        newDiv.className = "colorEntry";

        // create the color's name
        const newText = document.createElement('div');
        newText.innerHTML = color.name;

        // create the color's rectangle
        const newRect = document.createElement('div');
        newRect.className = "colorInList";
        newRect.style.backgroundColor = color.hex;

        // add them to the div we created before
        newDiv.appendChild(newRect);
        newDiv.appendChild(newText);

        // now add them to the actual interface
        dropdownColorL.appendChild(newDiv);

        // copy the div we just created to add it to the right side
        const newDivR = newDiv.cloneNode(true);
        dropdownColorR.appendChild(newDivR);

        // if the divs get clicked, update the colors
        newDiv.addEventListener("click", () => { updateColor(0, color)});
        newDivR.addEventListener("click", () => {updateColor(1, color)});

    }
}

export const advancedColors = new AdvancedColors;