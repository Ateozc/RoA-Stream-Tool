// import { getJson } from "../GUI/File System.mjs";
// import { stPath } from "../GUI/Globals.mjs";
// import { displayNotif } from "../GUI/Notifications.mjs";
// import { genGuiSection } from "./EasyGUISection.mjs";
// import { obsControl } from "./OBSWebsocketControl.mjs";
// import { ScreenRocker, screenRocker } from "./ScreenRocker.mjs";
// const fs = require('fs');
// const stateFile = stPath.text + "/RoAState"


// // const settingElectronDiv = document.getElementById("settingsElectron");
// const newToggles = [
//     {
//         id: "screenRockerOBSToggle",
//         title: "Enable Screen Rocker to control OBS.",
//         innerText: "Enable Auto OBS Control",
//         type: "checkbox",
//         disabled: false,
//         className: "settingsCheck"
//     },
//     {
//         id: "screenRockerSceneInfo",
//         title: "Scene selectors",
//         innerText: "Scene selectors <br>1 - Start Scene<br>2 - Transition Scene<br>3 - In Game Scene<br>4 - End Scene",
//         type: "div",
//         disabled: false,
//         className: "settingsText"
//     },
//     {
//         id: "screenRockerGetLatestScenes",
//         title: "Get Latest Scenes",
//         innerText: "Get Latest Scenes",
//         type: "button",
//         disabled: false,
//         className: "settingsButton"
//     },
//     {
//         id: "screenRockerStartScene",
//         title: "The Scene that shows up when a set starts. Typically, this should be the 'Vs Screen' that shows the player information and characters.",
//         innerText: "1",
//         type: "select",
//         disabled: false,
//         className: "textInput"
//     },
//     {
//         id: "screenRockerTransitionScene",
//         title: "OPTIONAL: The Scene that shows after the Start scene, before loading the In Game scene. (Used when players are picking characters/stages)",
//         innerText: "2",
//         type: "select",
//         disabled: false,
//         className: "textInput"
//     },
//     {
//         id: "screenRockerInGameScene",
//         title: "The Scene that shows when players are playing.",
//         innerText: "3",
//         type: "select",
//         disabled: false,
//         className: "textInput"
//     },
//     {
//         id: "screenRockerEndScene",
//         title: "OPTIONAL: The Scene that will show after the set ends.",
//         innerText: "4",
//         type: "select",
//         disabled: false,
//         className: "textInput"
//     }
// ]

// class ScreenRockerOBS extends ScreenRocker {
//     #toggleDivs = [];
//     #lastElement = '';
//     #getScenesBtn = '';
//     #data = {};
    

//     constructor() {
//         super();
        
//         const divs = genGuiSection('Screen Rocker OBS', screenRocker.getLastGUIElement(), true, newToggles);
//         this.#lastElement = divs.prevDiv;
//         this.#toggleDivs = divs.toggleDivs;

//         this.#getScenesBtn = document.getElementById('screenRockerGetLatestScenes');
//         this.#getScenesBtn.addEventListener("click", () => this.#setupSelectBoxes());
//         // this.getData();
//         // this.watchFile();
//     }

//     getLastGUIElement() {
//         return this.#lastElement;
//     }

//     sceneLogic() {

//     }

//     // async getData() {
//     //     this.#data = await getJson(stPath.text + "/RoAState");  
//     //     this.sceneLogic();
//     // }
    

//     // async watchFile() {
//     //     try {
//     //         let fsWait = false;
//     //         fs.watch(stateFile + '.json', (event, filename) => {
//     //             if (screenRocker.enabled() && filename) {
//     //                 if (fsWait) return;
//     //                 fsWait = setTimeout(() => {
//     //                     fsWait = false;
//     //                 }, 150);
//     //                 console.log('hit');
//     //                 this.getData();
//     //             }
//     //         });
//     //     } catch (err) {

//     //     }
        
//     // }

//     async #setupSelectBoxes() {

//         if (!obsControl.connected()) {
//             displayNotif('Cant retrieve scenes list: Not connected to OBS.')
//         }
//         const scenes = obsControl.getSceneList();
//         if (scenes.length <= 0) {
//             return;
//         }
//         for (let i = 0; i < this.#toggleDivs.length; i++) {
//             let childDiv = this.#toggleDivs[i].lastChild;
//             if (childDiv.nodeName == 'SELECT') {
//                 for (let j = 0; j < scenes.length; j++) {
//                     const option = document.createElement('option');
//                     option.value = scenes[j].sceneName;
//                     option.innerHTML = scenes[j].sceneName;

//                     // add colors to the list
//                     option.style.backgroundColor = "var(--bg5)";

//                     childDiv.appendChild(option);
//                 }
//             }
//         }
//     }

// }


// export const screenRockerOBS = new ScreenRockerOBS;
