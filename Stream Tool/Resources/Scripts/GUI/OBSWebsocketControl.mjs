import { current } from "./Globals.mjs";
import { OBSWebSocket } from "./obs-websocket-js.mjs";


const obs = new OBSWebSocket();

const updateDiv = document.getElementById('updateRegion');

const settingElectronDiv = document.getElementById("settingsElectron");
const newToggles = [
    {
        id: "obsChangeScene",
        title: "Directory where all Vod items are stored.",
        innerText: "Scene",
        type: "text",
        disabled: false,
        className: "settingsText"
    },
    {
        id: "obsScreenshot",
        title: "When clicked, will rename all .flv, .mp4, and .png in the specified directory and move them to directory/{tournament}/{game}/",
        innerText: "screenshot",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "obsStartRecord",
        title: "When clicked, will rename all .flv, .mp4, and .png in the specified directory and move them to directory/{tournament}/{game}/",
        innerText: "Start Recording",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "obsStopRecord",
        title: "When clicked, will rename all .flv, .mp4, and .png in the specified directory and move them to directory/{tournament}/{game}/",
        innerText: "Stop Recording",
        type: "button",
        disabled: false,
        className: "settingsButton"
    }
]

let obsTitleDiv = document.createElement("div");
obsTitleDiv.className = "settingsTitle";
obsTitleDiv.innerHTML = "OBS Control";
settingElectronDiv.before(obsTitleDiv);

let prevDiv = obsTitleDiv;

for (let t = 0; t < newToggles.length; t++) {
    let toggle = newToggles[t];
    let toggleDiv = document.createElement("div");
    toggleDiv.className = "settingBox";
    

    let toggleInput = "";
    if (toggle.type == 'button') {
        toggleInput = document.createElement("button");
        toggleInput.innerHTML = toggle.innerText;
        toggleInput.title = toggle.title;
    } else {
        toggleInput = document.createElement("input");
        toggleInput.type = toggle.type;
        toggleDiv.title = toggle.title;
    } 
    
    toggleInput.id = toggle.id;
    toggleInput.className = toggle.className;    
    toggleInput.tabIndex = "-1";
    toggleInput.disabled = toggle.disabled;

    let inputLabel = document.createElement("label");
    inputLabel.htmlFor = toggle.id;
    inputLabel.className = "settingsText";
    inputLabel.innerHTML = toggle.innerText;

    if (toggle.type == 'text') {
        toggleDiv.appendChild(inputLabel);
        toggleDiv.appendChild(toggleInput);
    } else if (toggle.type == 'button') {
        toggleDiv.appendChild(toggleInput);
    } else {
        toggleDiv.appendChild(toggleInput);
        toggleDiv.appendChild(inputLabel);
    }
    
    prevDiv.after(toggleDiv);
    prevDiv = toggleDiv;
}


class OBSControl {
    #connected = false;
    #obsSceneInput = document.getElementById('obsChangeScene');
    #obsScreenshotBtn = document.getElementById('obsScreenshot');
    #obsStartRecordBtn = document.getElementById('obsStartRecord');
    #obsStopRecordBtn = document.getElementById('obsStopRecord');


    

    constructor() {
        this.#obsSceneInput.addEventListener("change", () => this.changeScene());
        this.#obsScreenshotBtn.addEventListener("click", () => this.screenShot());
        this.#obsStartRecordBtn.addEventListener("click", () => this.startRecord());
        this.#obsStopRecordBtn.addEventListener("click", () => this.stopRecord());

        this.connect();
    }

    async connect() {
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect('ws://127.0.0.1:4455', 'i9X2QknoYQAuP6Cv', {
              rpcVersion: 1
            });
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            this.#connected = true;
          } catch (error) {
            console.error('Failed to connect', error.code, error.message);
          }
    }

    async changeScene() {
        if (!this.#connected) {
            return;
        }

        await obs.call('SetCurrentProgramScene', {sceneName: this.#obsSceneInput.value});
    }

    // async changeToEndStream() {
    //     if (!this.#connected) {
    //         return;
    //     }

    //     await obs.call('SetCurrentProgramScene', {sceneName: 'End  Stream'});
    // }

    async startRecord() {
        if (!this.#connected) {
            return;
        }
        obs.call('StartRecord');
    }

    async stopRecord() {
        if (!this.#connected) {
            return;
        }
        obs.call('StopRecord');
    }

    async screenShot() {
        if (!this.#connected) {
            return;
        }

        await obs.call('SaveSourceScreenshot', {
            "sourceName": "VS Screen.html",
            "imageFormat": "png",
            "imageFilePath": "X:\\OBS\\Recordings\\screenshot.png",
            "imageWidth": 1920,
            "imageHeight": 1080,
            "imageCompressionQuality": 100
          });
    }
}
export const obsControl = new OBSControl;



// // connect to obs-websocket running on localhost with same port
// await obs.connect();

// // Connect to obs-ws running on 192.168.0.4
// await obs.connect('ws://192.168.0.4:4455');

// // Connect to localhost with password
// await obs.connect('ws://127.0.0.1:4455', '85Phkcv7EHdPpCgZ');

// // Connect expecting RPC version 1
// await obs.connect('ws://127.0.0.1:4455', undefined, {rpcVersion: 1});

// // Connect with request for high-volume event
// await obs.connect('ws://127.0.0.1:4455', undefined, {
//   eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters,
//   rpcVersion: 1
// });

// A complete example
// try {
//   const {
//     obsWebSocketVersion,
//     negotiatedRpcVersion
//   } = await obs.connect('ws://127.0.0.1:4455', 'i9X2QknoYQAuP6Cv', {
//     rpcVersion: 1
//   });
//   console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)

// } catch (error) {
//   console.error('Failed to connect', error.code, error.message);
// }



// //   await obs.call('GetCurrentProgramScene');
// //   await obs.call('SetCurrentProgramScene', {sceneName: 'Main Screen with overlay'});

// const results = await obs.callBatch([
//     {
//       requestType: 'GetVersion',
//     },
//     {
//       requestType: 'SetCurrentPreviewScene',
//       requestData: {sceneName: 'Main Screen with overlay'},
//     },
//     {
//       requestType: 'SetCurrentSceneTransition',
//       requestData: {transitionName: 'Fade'},
//     },
//     {
//       requestType: 'Sleep',
//       requestData: {sleepMillis: 100},
//     },
//     {
//       requestType: 'TriggerStudioModeTransition',
//     }
//   ])