import { getJson } from "../GUI/File System.mjs";
import { current, stPath } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { guiSection } from "./EasyGUISection.mjs";
import { OBSWebSocket } from "./obs-websocket-js.mjs";

const obs = new OBSWebSocket();

const updateDiv = document.getElementById('updateRegion');
const connectInformation = await getJson(stPath.text + "/OBSConnection")


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

const divs = guiSection.genGuiSection('OBS Control', 'guiSettings', newToggles, 0, false);


class OBSControl {

    #autoConnect = true;

    #reconnectAttemptsMax = 10;
    #reconnectAttempts = 0;
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

    async connected() {
        if (this.#autoConnect && !this.#connected) { //attempt to autoConnect
            await this.connect();
        }
        return this.#connected;
    }

    getLastGUIElement() {
        return this.#lastElement;
    }
    getTitleGUIElement() {
        return this.#titleElement;
    }

    async connect(reconnectAttempt) {
        if (reconnectAttempt) {
            this.#obsConnectBtn.innerText = 'Attempting reconnect...';
        } else {
            this.#obsConnectBtn.innerText = 'Connecting...';
        }
        
        try {
            const {
              obsWebSocketVersion,
              negotiatedRpcVersion
            } = await obs.connect('ws://127.0.0.1:' + connectInformation.port, connectInformation.password, {
              rpcVersion: 1
            });
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
            displayNotif('Connected to OBS');
            this.#reconnectAttempts = 0;
            this.#toggleConnected();
            this.#getScenes();
          } catch (error) {
            console.error('Failed to connect', error.code, error.message);
            
            if (reconnectAttempt) {
                throw error;
            } else {
                displayNotif('Failed to connect to OBS');
            }
          }

          this.#obsConnectBtn.innerText = 'Connect';
    }

    async #reconnect() {
        if (this.#reconnectAttempts >= this.#reconnectAttemptsMax) {
            displayNotif('Failed to reconnect to OBS after ' + this.#reconnectAttemptsMax + ' attempts.');
            this.#obsConnectBtn.innerText = 'Connect';
            return;
        }
        this.#reconnectAttempts++;
        try {
            await this.connect(true);
        } catch (err) {
            console.log('Failed to reconnect on attempt ' + this.#reconnectAttempts, err.code, err.message);
            await this.#reconnect();
        }
    }

    async disconnect() {
        this.#obsDisconnectBtn.innerText = 'Disconnecting...';
        try {
            await obs.disconnect();
            displayNotif('Disconnected from OBS');
            this.#toggleConnected();
        } catch (error) {
            console.error('Failed to disconnect', error.code, error.message);
            displayNotif('Failed to disconnect from OBS');
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
                    toggleDiv.disabled = true;
                } else {
                    toggleDiv.style.display = 'flex';
                    toggleDiv.disabled = false;
                }
            } else if (toggleDiv.contains(this.#obsDisconnectBtn)){
                if (!this.#connected) {
                    toggleDiv.style.display = 'none';
                    toggleDiv.disabled = true;
                } else {
                    toggleDiv.style.display = 'flex';
                    toggleDiv.disabled = false;
                }
            } else {
                if (this.#connected) {
                    toggleDiv.style.display = 'flex';
                    toggleDiv.disabled = false;
                } else {
                    toggleDiv.style.display = 'none';
                    toggleDiv.disabled = true;
                }
            }
        }
    }

    async changeScene(newScene, previewChange) {
        if (!await this.connected() && newScene) {
            return;
        }

        try {
            if (previewChange) {
                await obs.call('SetCurrentPreviewScene', {sceneName: newScene});
            } else {
                await obs.call('SetCurrentProgramScene', {sceneName: newScene});
            }
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.changeScene(newScene, previewChange);
            }
        }
        
    }

    async checkIfRecording() {
        if (!await this.connected()) {
            return;
        }

        try {
            let response = await obs.call('GetRecordStatus');
            this.#recording = response.outputActive;
            this.#changeRecordingBtnText();
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.startRecord();
            }
        }
    }

    async toggleRecording() {
        if (!await this.connected()) {
            return;
        }

        try {
            let response = await obs.call('ToggleRecord');
            this.#recording = response.outputActive;
    
            this.#changeRecordingBtnText();
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.toggleRecording();
            }
        }
    }

    async startRecord() {
        if (!await this.connected()) {
            return;
        }
        await this.checkIfRecording();

        if (this.#recording) {
            return;
        }
        try {
            await obs.call('StartRecord');
            this.#recording = true;
            this.#changeRecordingBtnText();
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.startRecord();
            }
        }
        
    }

    async stopRecord() {
        if (!await this.connected()) {
            return;
        }

        await this.checkIfRecording();

        if (!this.#recording) {
            return;
        }
        try {
            
            await obs.call('StopRecord');
            this.#recording = false;
            this.#changeRecordingBtnText();
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.stopRecord();
            }
        }
        
    }

    async #wasConnectionLost(err) {
        if (err.message == 'Not connected') {
            displayNotif('Lost connection to OBS. Attempting to reconnect...');
            this.#toggleConnected();
            try {
                await this.#reconnect();
            } catch (err)  {
                console.log('connection lost error', err.code, err.message);
            }
            return true;
        }
    }

    #changeRecordingBtnText() {
        if (this.#recording) {
            this.#obsRecordingBtn.innerText = 'Recording... Press to stop';
        } else {
            this.#obsRecordingBtn.innerText = 'Start Recording';
        }
    }
    
    async screenShot(sourceName, savePath) {
        if (!await this.connected() || !sourceName || savePath) {
            return;
        }

        try {
            await obs.call('SaveSourceScreenshot', {
                "sourceName": sourceName,
                "imageFormat": "png",
                "imageFilePath": savePath,
                "imageWidth": 1920,
                "imageHeight": 1080,
                "imageCompressionQuality": 15
            });
        } catch (err) {
            this.#wasConnectionLost(err);
        }
    }

    async vsScreenScreenshot(savePath) {
        if (!await this.connected() || !savePath) {
            return;
        }

        try {
            await obs.call('SaveSourceScreenshot', {
                "sourceName": "VS Screen.html",
                "imageFormat": "png",
                "imageFilePath": savePath,
                "imageWidth": 1920,
                "imageHeight": 1080,
                "imageCompressionQuality": 15
            });


        } catch (err) {
            this.#wasConnectionLost(err);
        }
    }

    async #getScenes() {
        if (!await this.connected()) {
            return;
        }
        try {
            let response = await obs.call('GetSceneList');
            this.#sceneList = response.scenes;
        } catch (err) {
            if (this.#wasConnectionLost(err) && this.connected()) {
                await this.stopRecord();
            }
        }
        
    }

    getSceneList() {
        return this.#sceneList;
    }
}
export const obsControl = new OBSControl;