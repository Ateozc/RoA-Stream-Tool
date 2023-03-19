import { currentColors, updateColor } from "../GUI/Colors.mjs";
import { getJson } from "../GUI/File System.mjs";
import { stPath } from "../GUI/Globals.mjs";
import { settings } from "../GUI/Settings.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { ntc } from "./NameThatColor.mjs";

const colorList = await getJson(stPath.text + "/Color Slots");
const baseHsl = {
    h: 37,
    s: 32,
    l: 61
}

/*
example: h: 38,
    s: 24.5,
    l: 60
new: {h: -6, s: 92.5, l: 70}

*/

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
    }
]

const divs = genGuiSection('Advanced Color Settings', guiSettingsDiv, true, newToggles);

class AdvancedColors {
    #toggleDivsOBS = divs.toggleDivs;
    #lastOBSElement = divs.prevDiv;

    #colorInputs = [colorInputL, colorInputR]
    #settings = {
        teamPicker: false
    }
    #colorPickerTeamsCheck = document.getElementById('advancedColorsTeams');
    

    constructor() {
        this.#colorInputs[0].addEventListener('change', ()=> this.#updateColor(0));
        this.#colorInputs[1].addEventListener('change', ()=> this.#updateColor(1));
        this.#colorPickerTeamsCheck.addEventListener('click', ()=> this.#toggleColorPickerForTeams());
        colorContainerL.addEventListener('click', ()=> this.#clickColorInput(0));
        colorContainerR.addEventListener('click', ()=> this.#clickColorInput(1));
    }

    #toggleColorPickerForTeams() {
        this.#settings.teamPicker = !this.#settings.teamPicker;
        if (this.#settings.teamPicker) {
            dropdownColorL.style.display = 'none';
            dropdownColorR.style.display = 'none';
        } else {
            dropdownColorL.style.display = '';
            dropdownColorR.style.display = '';
        }

        this.#colorInputs[0].disabled = !this.#settings.teamPicker;
        this.#colorInputs[1].disabled = !this.#settings.teamPicker;
        this.#colorPickerTeamsCheck.checked = this.#settings.teamPicker;
    }

    #clickColorInput(side) {
        if (this.#settings.teamPicker) {
            this.#colorInputs[side].value = currentColors[side].hex;
            this.#colorInputs[side].click();
        }
    }

    async #updateColor(side) {
        let hex = this.#colorInputs[side].value;
        let name = this.#getColorPresetName(hex); 
        if (!name) {
            // name = ntc.name(this.#colorInputs[side].value)[1]
            name = 'Cpu';
        }
        let color = {
            name: name,
            hex: hex,
            filter: this.getColorFilter(hex)
        }
        
        await updateColor(side, color);
    }

    #getColorPresetName(hex) {
        for (let i = 0; i < colorList.length; i++) {
            if (colorList[i].hex == hex) {
                return colorList[i].name;
            }
        }
    }

    getColorFilter(hex) {
        let rgb = ntc.hexToRgb(hex);
        const id = hex.split('#')[1];
        const target = {
            r: rgb.r / 255,
            g: rgb.g / 255,
            b: rgb.b / 255
        };
        let filter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${target.r} 0 0 0 0 ${target.g} 0 0 0 0 ${target.b} 0 0 0 1 0"/></filter></defs></svg>${hex}')`;
        return filter;
    }
}

export const advancedColors = new AdvancedColors;
