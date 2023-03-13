import { current } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { OBSWebSocket } from "./obs-websocket-js.mjs";

const obs = new OBSWebSocket();

const updateDiv = document.getElementById('updateRegion');

const settingElectronDiv = document.getElementById("settingsElectron");
const newToggles = [
    {
        id: "obsConnect",
        title: "Attempt to connect to OBS",
        innerText: "Connect",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    {
        id: "obsDisconnect",
        title: "Disconnect from OBS",
        innerText: "Disconnect",
        type: "button",
        disabled: false,
        className: "settingsButton"
    },
    // {
    //     id: "obsChangeScene",
    //     title: "Directory where all Vod items are stored.",
    //     innerText: "Scene",
    //     type: "text",
    //     disabled: false,
    //     className: "settingsText"
    // },
    // {
    //     id: "obsScreenshot",
    //     title: "When clicked, will save a screenshot of the current Scene on the Screen to your Vod Directory folder (Check Vod Rename section)",
    //     innerText: "Screenshot",
    //     type: "button",
    //     disabled: false,
    //     className: "settingsButton"
    // },
    {
        id: "obsRecording",
        title: "Start/Stop recording",
        innerText: "Start Recording",
        type: "button",
        disabled: false,
        className: "settingsButton"
    }
]


const divs = genGuiSection('OBS Control', settingElectronDiv, false, newToggles);

class OBSControl {
    #connected = false;
    #recording = false;
    #obsConnectBtn = document.getElementById('obsConnect');
    #obsDisconnectBtn = document.getElementById('obsDisconnect');
    // #obsSceneInput = document.getElementById('obsChangeScene');
    // #obsScreenshotBtn = document.getElementById('obsScreenshot');
    #obsRecordingBtn = document.getElementById('obsRecording');
    #sceneList = [];

    #lastElement = divs.prevDiv;
    #titleElement = divs.titleDiv;
    #toggleDivs = divs.toggleDivs;
    

    constructor() {
        this.#obsConnectBtn.addEventListener("click", () => this.connect());
        this.#obsDisconnectBtn.addEventListener("click", () => this.disconnect());
        // this.#obsSceneInput.addEventListener("change", () => this.changeScene());
        // this.#obsScreenshotBtn.addEventListener("click", () => this.screenShot());
        this.#obsRecordingBtn.addEventListener("click", () => this.toggleRecording());
        this.#toggleOBSConnectionFields();
    }

    connected() {
        return this.#connected;
    }

    getLastGUIElement() {
        return this.#lastElement;
    }
    getTitleGUIElement() {
        return this.#titleElement;
    }

    async connect() {
        this.#obsConnectBtn.innerText = 'Connecting...';
        try {
            
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect('ws://127.0.0.1:4455', 'i9X2QknoYQAuP6Cv', {
              rpcVersion: 1
            });
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            displayNotif('Connected to OBS');
            this.#toggleConnected();
            this.#getScenes();
          } catch (error) {
            console.error('Failed to connect', error.code, error.message);
            displayNotif('Failed to connect to OBS');
          }

          this.#obsConnectBtn.innerText = 'Connect';
    }

    async disconnect() {
        this.#obsDisconnectBtn.innerText = 'Disconnecting...';
        try {
            await obs.disconnect();
            displayNotif('Disconnected from OBS');
            this.#toggleConnected();
        } catch (error) {
            console.error('Failed to connect', error.code, error.message);
            displayNotif('Failed to connect to OBS');
        }
        this.#obsDisconnectBtn.innerText = 'Disconnect';
    }
    
    #toggleConnected() {
        this.#connected = !this.#connected;
        this.#toggleOBSConnectionFields();
    }

    #toggleOBSConnectionFields() {
        for (let i = 0; i < this.#toggleDivs.length; i++) {
            let toggleDiv = this.#toggleDivs[i];
            if (toggleDiv.contains(this.#obsConnectBtn) ) {
                if (this.#connected) {
                    toggleDiv.style.display = 'none';
                } else {
                    toggleDiv.style.display = '';
                }
            } else if (toggleDiv.contains(this.#obsDisconnectBtn)){
                if (!this.#connected) {
                    toggleDiv.style.display = 'none';
                } else {
                    toggleDiv.style.display = '';
                }
            } else {
                if (this.#connected) {
                    toggleDiv.style.display = '';
                } else {
                    toggleDiv.style.display = 'none';
                }
            }
        }
    }


    async changeScene(newScene, previewChange) {
        if (!this.connected() && newScene) {
            return;
        }

        if (previewChange) {
            await obs.call('SetCurrentPreviewScene', {sceneName: newScene});
        } else {
            await obs.call('SetCurrentProgramScene', {sceneName: newScene});
        }
        
    }

    async toggleRecording() {
        if (!this.connected()) {
            return;
        }

        let response = await obs.call('ToggleRecord');
        this.#recording = response.outputActive;

        if (this.#recording) {
            this.#obsRecordingBtn.innerText = 'Recording... Press to stop';
        } else {
            this.#obsRecordingBtn.innerText = 'Start Recording';
        }
    }

    async startRecord() {
        if (!this.connected()) {
            return;
        }
        obs.call('StartRecord');
    }

    async stopRecord() {
        if (!this.connected()) {
            return;
        }
        obs.call('StopRecord');
    }

    async screenShot(sourceName, savePath) {
        if (!this.connected() || !sourceName || savePath) {
            return;
        }

        await obs.call('SaveSourceScreenshot', {
            "sourceName": sourceName,
            "imageFormat": "png",
            "imageFilePath": savePath,
            "imageWidth": 1920,
            "imageHeight": 1080,
            "imageCompressionQuality": 100
          });
    }

    async vsScreenScreenshot(savePath) {
        if (!this.connected() || !savePath) {
            return;
        }

        try {
            await obs.call('SaveSourceScreenshot', {
                "sourceName": "VS Screen.html",
                "imageFormat": "png",
                "imageFilePath": savePath,
                "imageWidth": 1920,
                "imageHeight": 1080,
                "imageCompressionQuality": 100
            });


        } catch (err) {
            console.log(err);
        }
    }

    async #getScenes() {
        if (!this.connected()) {
            return;
        }
        let response = await obs.call('GetSceneList');
        this.#sceneList = response.scenes;
    }

    getSceneList() {
        return this.#sceneList;
    }
}
export const obsControl = new OBSControl;