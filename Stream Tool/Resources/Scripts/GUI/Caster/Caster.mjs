import { commFinder } from "../Finder/Comm Finder.mjs";
import { inside } from "../Globals.mjs";
import { profileInfo } from "../Profile Info.mjs";

export class Caster {

    profileType = "commentator"

    tag = "";
    pronouns = "";
    socials = {
        twitter: "",
        twitch: "",
        yt: ""
    };

    #nameEl;

    constructor() {

        const el = this.#createElements();

        this.#nameEl = el.getElementsByClassName(`cName`)[0];

        // every time we type on name
        this.#nameEl.addEventListener("input", () => {

            // check if theres an existing caster preset
            commFinder.fillFinderPresets(this);

            // position the finder dropdown depending on contents
            commFinder.positionFinder();

        });

        // if we click on the name text input
        this.#nameEl.addEventListener("focusin", () => {
            commFinder.fillFinderPresets(this);
            commFinder.open(this.#nameEl.parentElement);
        });
        // hide the presets dropdown if text input loses focus
        this.#nameEl.addEventListener("focusout", () => {
            if (!inside.finder) {
                commFinder.hide();
            }
        });

        // open player info menu if clicking on the icon
        el.getElementsByClassName("pInfoButt")[0].addEventListener("click", () => {
            profileInfo.show(this);
        });

    }

    
    getName() {
        return this.#nameEl.value;
    }
    setName(text) {
        this.#nameEl.value = text;
    }
    getPronouns() {
        return this.pronouns;
    }
    setPronouns(text) {
        this.pronouns = text;
    }
    getTag() {
        return this.tag;
    }
    setTag(text) {
        this.tag = text;
    }
    getSocials() {
        return this.socials;
    }
    setSocials(socials) {
        this.socials = socials;
    }


    /** Creates the HTML elements on the GUI */
    #createElements() {

        const newDiv = document.createElement("div");
        newDiv.innerHTML = `
            <div class="caster">

            <button class="pInfoButt" title="Edit commentator info" tabindex="-1">
            <load-svg src="SVGs/Mic.svg" class="casterIcon"></load-svg>
            </button>

            <div class="finderPosition cFinderPosition">
            <input type="text" class="cName textInput mousetrap" placeholder="Caster name" spellcheck="false">
            </div>

            <button class="cDeleteButt" title="Remove commentator">-</button>

            </div>
        `

        document.getElementById("casterDiv").appendChild(newDiv);
        return newDiv;

    }

}