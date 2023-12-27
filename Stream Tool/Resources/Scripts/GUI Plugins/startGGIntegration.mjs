

/**
 * TODO:
 * Setup API to do the following:
 * Find current Event by Event ID (this is the only thing it should require entry for)
 * Get all entrants for event. Generate a list of Entrants for later use. Auto update pronouns (if not blank)
 * Get all characters. Cross check our current characters to ensure values didn't change.
 * For getting fast setup, have a dropdown that lets us select a player (or just select one as if you are starting the next set) and have it grab the current set for that player (along with their opponent).
 * During the set, save all set information (game 1 game 2 etc, characters)
 * After set is finished (need multiple ways to trigger this, such as: from automation, when update is clicked and player has boX wins, button click to send data)
 * Clear current data. Move onto next set.
 */


import { clear } from "../GUI/Clear.mjs"
import { getCharacterList, getJson, saveJson, getPresetList} from "../GUI/File System.mjs";
import { inside, current, stPath, realPath } from "../GUI/Globals.mjs";
import { displayNotif } from "../GUI/Notifications.mjs";
import { players, clearPlayers, bracketPlayers } from "../GUI/Player/Players.mjs";
import { clearScores, scores } from "../GUI/Score/Scores.mjs";
import { clearTeams } from "../GUI/Team/Teams.mjs";
import { settings } from "../GUI/Settings.mjs";
import { genGuiSection } from "./EasyGUISection.mjs";
import { vodRename } from "./VodRename.mjs"
import { tournament } from "../GUI/Tournament.mjs";
import { round } from "../GUI/Round.mjs";
import { gameSelector } from "./GameSelect.mjs";
import { updateBracket, bracketData } from "../GUI/Bracket.mjs";
import { bestOf } from "../GUI/BestOf.mjs";


const updateDiv = document.getElementById('updateRegion');

const connectInformation = await getJson(stPath.text + "/startGGAuth");

const settingElectronDiv = document.getElementById("settingsElectron");
const scoreBoardDiv = document.getElementsByClassName("settingsTitle")[0];

const newToggles = [{
    id: "startGGEventId",
    title: "You can use one of two values:\n1. Pass in the URL of the tournament like this: 'https://www.start.gg/tournament/genesis-x/event/rivals-2-singles'\n2. Event ID. This can be found by viewing a bracket from an admin view, then looking at the URL for a number.",
    innerText: "Event (URL or ID)",
    type: "text",
    disabled: false,
    className: "textInput"
},
{
    id: "startGGGetParticipants", //We call it participants, cuz the main focus is the entrants. The additional information isn't as important.
    title: "Gets event information.",
    innerText: "Get Event Information",
    type: "button",
    disabled: false,
    className: "settingsButton"
},
{
    id: "startGGPopulateTournamentName",
    title: "Sets the Tournament Name to name of the tournament.",
    innerText: "Populate Tournament Name",
    type: "button",
    disabled: false,
    className: "settingsButton"
},
{
    id: "startGGSetGame",
    title: "Sets the Game to game used in the event.",
    innerText: "Populate Game from Event",
    type: "button",
    disabled: false,
    className: "settingsButton"
},
{
    id: "startGGGetTop8",
    title: "Gets the top 8 set information and fill the bracket. Only works if the top 8 bracket is entirely in the last phase.",
    innerText: "Populate top 8 bracket",
    type: "button",
    disabled: false,
    className: "settingsButton"
},
{
    id: "startGGPlayerSelect",
    title: "Select a player",
    innerText: "Select a player",
    type: "select",
    disabled: false,
    className: "textInput",
	settingsBoxOverride: "settingsBoxBlockOverride", //adds another class
    options: []
},
{
	id: "startGGPrioritizeStartGGData",
	title: "If checked, the Player Profile will be set with StartGG data (sponsor/pronouns/socials).",
	innerText: "Prioritize StartGG Data",
	type: "checkbox",
	disabled: false,
	className: "settingsCheck"
},
{
	id: "startGGPrioritizeNonEmptyData",
	title: "If checked, the Player Profile will fill in Empty spots from StartGG/Playerinfo.json if a value exists.\nExample: Pronouns are set on StartGG but not on player profile, it will use the StartGG Pronouns even if you have Prioritize StartGG Data unchecked.",
	innerText: "Prioritize Non Empty Values",
	type: "checkbox",
	disabled: false,
	className: "settingsCheck"
},
{
	id: "startGGPopulateRoundName",
	title: "If checked, the round name will populate based upon the name provided in StartGG",
	innerText: "Populate Round Name",
	type: "checkbox",
	disabled: false,
	className: "settingsCheck"
},
// {
// 	id: "startGGPopulateTournamentName",
// 	title: "If checked, the tournament name will populate based upon the name provided in StartGG.",
// 	innerText: "Populate Tournament Name",
// 	type: "checkbox",
// 	disabled: false,
// 	className: "settingsCheck"
// },
// {
// 	id: "startGGSetGame",
// 	title: "If checked, the game will be set to the same one used for the event (requires the folder system to be setup with that game being available).",
// 	innerText: "Set Game Based on Event",
// 	type: "checkbox",
// 	disabled: false,
// 	className: "settingsCheck"
// },
{
    id: "startGGGetSetData",
    title: "Gets the set information based upon player. Will populate both players, along with their profiles.",
    innerText: "Populate current match info from Player",
    type: "button",
    disabled: false,
    className: "settingsButton"
},
{
    id: "startGGUpdateSetData",
    title: "Reports the set information based upon the current match information.",
    innerText: "Update StartGG Set",
    type: "button",
    disabled: false,
    className: "settingsButton"
}
]


const divs = genGuiSection('StartGG', scoreBoardDiv, false, newToggles);

class StartGG {
    #eventIdInput = document.getElementById('startGGEventId');
    #participantsBtn = document.getElementById('startGGGetParticipants');
    #startGGPlayerSelect = document.getElementById('startGGPlayerSelect');
    #startGGPrioritizeStartGGDataCheck = document.getElementById('startGGPrioritizeStartGGData');
	#startGGPrioritizeNonEmptyDataCheck = document.getElementById('startGGPrioritizeNonEmptyData');
	#startGGPopulateRoundNameCheck = document.getElementById('startGGPopulateRoundName');
	#useCustomRoundCheck = document.getElementById('customRound');
	// #startGGPopulateTournamentNameCheck = document.getElementById('startGGPopulateTournamentName');
	// #startGGSetGameCheck = document.getElementById('startGGSetGame');
	

	#startGGGetSetDataBtn = document.getElementById('startGGGetSetData');
	#startGGUpdateSetDataBtn = document.getElementById('startGGUpdateSetData');
	#startGGGetTop8Btn = document.getElementById('startGGGetTop8');
	#startGGPopulateTournamentNameBtn = document.getElementById('startGGPopulateTournamentName');
	#startGGSetGameBtn = document.getElementById('startGGSetGame');


    #players = [];
	#playerPresets = [];
    #currentSetInfo = {};
	#top8Sets = [];
	#top8PhaseId = '';

	#previousScores = [0, 0];

	#gameForEvent = "";
	#eventId = "";
	#tournamentName = "";

	#characterList = [];

	#top8RoundNamesMatrix = [ //these are top 6, to find top 8 we have to get the farthest in losers round.
		{'ggName':'Grand Final Reset', 'stName': 'True Finals'},
		{'ggName':'Grand Final', 'stName': 'Grand Finals'},
		{'ggName':'Winners Final', 'stName': 'Winners Finals'},
		{'ggName':'Winners Semi-Final', 'stName': 'Winners Semis'},
		{'ggName':'Losers Final', 'stName': 'Losers Finals'},
		{'ggName':'Losers Semi-Final', 'stName': 'Losers Semis'},
		{'ggName':'Losers Quarter-Final', 'stName': 'Losers Quarters'}
	];

    constructor() {
		this.setPlayerPresets();
        this.#participantsBtn.addEventListener("click", () => this.getEntrantsForEvent(this.#eventIdInput.value));
        this.#startGGGetSetDataBtn.addEventListener("click", () => this.getPlayerSetInfo(this.#startGGPlayerSelect.value,this.#eventId));
		this.#startGGUpdateSetDataBtn.addEventListener("click", () => this.reportSet());
		this.#startGGGetTop8Btn.addEventListener("click", () => this.getTop8(this.#eventId, this.#top8PhaseId));


		this.#startGGPopulateRoundNameCheck.addEventListener('click', () => this.populateRoundClicked());
		this.#useCustomRoundCheck.addEventListener('click', () => this.customRoundClicked());
		this.#startGGPopulateTournamentNameBtn.addEventListener('click', () => this.setTournamentName());
		this.#startGGSetGameBtn.addEventListener('click', ()=> this.setGame());

		updateDiv.addEventListener('click', ()=> this.updateSetInfo() );
		this.showElems(false);
    }

	showElems (showElems) {
		for (let i = 2; i < divs.toggleDivs.length; i++) { //skip first 2, as those are fine.
			if (divs.toggleDivs[i].classList.contains('hidden') ) {
				if (showElems) {
					divs.toggleDivs[i].classList.remove('hidden');
				}
			} else {
				if (!showElems) {
					divs.toggleDivs[i].classList.add('hidden');
				}
				
			}
		}
	}

    /**
     * states:
     * - 1 - Not Started
     * - 2 - In Progress
     * - 3 - Complete
     * - 6 - Check-in
     * 
     * Currently, this only gets items that are In Progress. So first, set your people to play and put their set to In Progress. It will then find that set and pull the data automatically for it into the tool.
     * Since this is based upon a player and event, it should only ever return 1 game. 
     * NOTE: Round Robin may cause issues
     */

	customRoundClicked() {
		if (!this.#useCustomRoundCheck.checked) {
			this.#startGGPopulateRoundNameCheck.checked = false
		}
	}

	populateRoundClicked() {
		if (this.#startGGPopulateRoundNameCheck.checked) {
			if (!this.#useCustomRoundCheck.checked) {
				this.#useCustomRoundCheck.click();
			}
		}		
	}

	validEventId() {
		if (this.#eventId) {
			return true;
		}
		displayNotif('Missing event information.');
		return false;
	}

	setTournamentName() {
		if (this.validEventId()) {
			tournament.setText(this.#tournamentName);
		}
		
	}

	async setGame() {
		if (this.validEventId()) {
			await gameSelector.setGame(this.#gameForEvent.name);
		}
	}

	async getTop8(eventId, top8PhaseId) {
		if (!this.validEventId()) {
			return;
		}
		if (!top8PhaseId) {
			displayNotif('Unable to find top 8 information.'); //This should never hit. Only hits if there are no phases (which means the event wasn't setup)
			return;
		}
		let query = `
		query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
			event(id: $eventId) {
			  id
			  name
			  sets(
				page: $page
				perPage: $perPage
				sortType: STANDARD,
				filters: {
					phaseIds: ${top8PhaseId}
				}
			  ) {
				pageInfo {
					total
					totalPages
				}
				
				nodes {
				  round
				  fullRoundText
				  id
				  slots {
					prereqId
					standing {
					  entrant {
						id
						name
					  }
					  stats {
						score {
						  value
						}
					  }
					}
				  }
				}
			  }
			}
		  }
		`;

		let variables = {
			"eventId": eventId,
			"page": 1,
			"perPage": 25
		}

		displayNotif('Retreiving top 8 bracket information...');
		let json = await this.generalApiCall(query, variables, 'data.event.sets');
		this.#top8Sets = this.getTop8SetsData(json);

		this.saveToBracket();
	}

	async saveToBracket() {
		let setsCounts = {};	
		let bracketRoundSelect = document.getElementById('bracketRoundSelect');
		let newBracketData = JSON.parse(JSON.stringify(bracketData));
		
		for (let i in this.#top8Sets) {
			let stRoundName = "";
			try {
				stRoundName = this.getStRoundName(this.#top8Sets[i].fullRoundText).replaceAll(' ', '');
			} catch (e) {
				stRoundName = 'LosersTop8';
			}
			
			let curSetNum = 0;

			for (let p in this.#top8Sets[i].slots) { //Player 1 and 2 slots
				
				if (!setsCounts[stRoundName] && setsCounts[stRoundName] != 0) {//each index count is the player, since its done by an array of players.
					setsCounts[stRoundName] = 0;
				} else {
					setsCounts[stRoundName] += 1;
				}

				curSetNum = setsCounts[stRoundName];


				const slot = this.#top8Sets[i].slots[p];

				let setScore = '-';
				let playerInfo = {
					name: '-',
					tag: '',
					character: "None",
					skin: "-",
					iconSrc: ""
				}

				let defaultSkin = {
					character: "None",
					skin: "-",
					iconSrc: ""
				}

				/*TODO: 
					eventually, get character information (if possible)
					clear character data when populating a blank set (to ensure if something changed we dont represent the wrong characters)


					code used to update char/skin on bracket.mjs
					    await bracketPlayers[num+i].charChange(players[i].char, true);
						bracketPlayers[num+i].skinChange(players[i].skin);

					Defaults:
						character: "None",
						skin: "-",
						iconSrc: "",

					Bare minimum: Add checkbox to prevent overwriting character data when set doesn't have new player data (ie, player names didn't change)
				*/

				if (slot.standing) {
					setScore = slot.standing.stats.score.value;
					const entrant = slot.standing.entrant.id;
					playerInfo = JSON.parse(JSON.stringify(this.getCombinedPlayerDataFromEntrantId(entrant)));
				}
				if (bracketRoundSelect.value == stRoundName) {
					let newPlayer = (bracketPlayers[curSetNum].nameInp.value != playerInfo.name);

					//Updates the GUI version because... reasons.
					bracketPlayers[curSetNum].setName(playerInfo.name);
					bracketPlayers[curSetNum].setTag(playerInfo.tag);
					bracketPlayers[curSetNum].setScore(setScore);

					if (newPlayer) { //reset skins
						await bracketPlayers[curSetNum].charChange(defaultSkin.character, true);
						bracketPlayers[curSetNum].skinChange(defaultSkin.skin);
					}					
				} else {
					let newPlayer = (newBracketData[stRoundName][curSetNum].name != playerInfo.name);

					//This updates the bracket data itself.
					newBracketData[stRoundName][curSetNum].name = playerInfo.name;
					newBracketData[stRoundName][curSetNum].tag = playerInfo.tag;
					newBracketData[stRoundName][curSetNum].score = setScore;
					if (newPlayer) {
						newBracketData[stRoundName][curSetNum].character = defaultSkin.character;
						newBracketData[stRoundName][curSetNum].skin = defaultSkin.skin;
						newBracketData[stRoundName][curSetNum].iconSrc= defaultSkin.iconSrc;
						// newBracketData[stRoundName][curSetNum].character = playerInfo.character;
						// newBracketData[stRoundName][curSetNum].skin = playerInfo.skin;
						// newBracketData[stRoundName][curSetNum].iconSrc= playerInfo.iconSrc;
					}
					
				}

			}
		}

		for (let i in newBracketData) {
			if (i == 'id' || i == 'message') {
				continue;
			}
			for (let j in newBracketData[i]) {
				bracketData[i][j] = newBracketData[i][j]
			}
		}

		await updateBracket();
		
	}

	getTop8SetsData (json) {
		let prereqIds = [];
		let top8Only = [];
		for (let i in json.data.event.sets.nodes) {
			let set = json.data.event.sets.nodes[i];
			set.id = "" + set.id; //Convert to string for items that are not int.
			if (this.getStRoundName(set.fullRoundText)) {
				top8Only.push(JSON.parse(JSON.stringify(set)));
				if(set.fullRoundText == 'Losers Quarter-Final') {
					prereqIds.push("" + set.slots[0].prereqId);
					prereqIds.push("" + set.slots[1].prereqId);
				}
			}
		}

		top8Only = top8Only.concat(this.getLosersTop8SetsData(json, prereqIds));
		return top8Only;
	}

	getLosersTop8SetsData (json, prereqIds) {
		let top8Only = [];
		for (let i in json.data.event.sets.nodes) {
			let set = json.data.event.sets.nodes[i];
			set.id = "" + set.id; //Convert to string for items that are not int.
			if (prereqIds.includes(set.id) && set.fullRoundText.indexOf('Winners') == -1) { //ensures we only grab losers sets.
				 
				top8Only.push(JSON.parse(JSON.stringify(set)));
			}
		}
		return top8Only;
	}

	getStRoundName(roundName) {
		for (let i in this.#top8RoundNamesMatrix) {
			if (this.#top8RoundNamesMatrix[i].ggName == roundName) {
				return this.#top8RoundNamesMatrix[i].stName;
			}
		}
		return false;
	}

	resetPreviousScore() {
		this.#previousScores = [0,0];
	}

    async getPlayerSetInfo(playerName, eventId) {
		try {
			if (!this.validEventId()) {
				return;
			}
	
			if (!playerName) {
				displayNotif('Must select a valid player');
				return;
			}
	
			let playerId = "";
	
			let player = JSON.parse(this.getPlayerFromPlayerList("tag", playerName));
	
			if (player.playerId) {
				playerId = player.playerId;
			}
	
			if (!playerId) {
			  displayNotif('Must select a valid player');
			  return;
			}

			
			let query = `
			query EventSets($eventId: ID!) {
				event(id: $eventId) {
				  id
				  name
				  sets(filters: {
					playerIds: ${playerId}
					state: 2
				  }) {      
					nodes {
					  state
					  id
					  fullRoundText
					  slots {
						id
						entrant{
						  id
						  participants {
							id
							player {
							  id
							}
						  }
						}
					  }
					}
				  }
				}
			  }		  
			`;
	
			let variables = {
				"eventId": eventId
			}
	
			let json = await this.generalApiCall(query, variables);
			this.#currentSetInfo = {};

			this.#currentSetInfo = json.data.event.sets.nodes[0];
			this.#currentSetInfo.useDetailedReportType = true;
			this.#currentSetInfo.setDataSimple = {};
			this.#currentSetInfo.setDataDetailed = {};
			
			await this.setPlayersInTool();

		} catch (e) {
			console.log(e);
		}
	}

	async setPlayersInTool () {
		// clear();
		clearTeams();
		clearPlayers();
		clearScores();
		this.resetPreviousScore();

		/* TODO 

		Edit the playerInfo.json to include the playerId value (this will be used in future situations.)
			- Only update the PlayerInfo.json if the file is missing data. Do not update if data already exists.
			- If toggled on for auto-overwrite, allow it to overwrite data. Toggle for each?
			- Update the tool to use random, but dont add that to the player Json.
		*/

		if (!this.#currentSetInfo || this.#currentSetInfo.slots.length <= 0) {
			displayNotif('No match in progress for selected player');
			return;
		}

		for (let i = 0; i < 2; i++) {
			
			let playerCombinedJson = this.getCombinedPlayerDataFromEntrantId(this.#currentSetInfo.slots[i].entrant.id);
			players[i].setName(playerCombinedJson.name);
			players[i].setTag(playerCombinedJson.tag);
			players[i].setPronouns(playerCombinedJson.pronouns);
			players[i].setSocials(JSON.parse(JSON.stringify(playerCombinedJson.socials)));
		}
		if (this.#startGGPopulateRoundNameCheck.checked) {
			round.setText(this.getCorrectedRoundName(this.#currentSetInfo.fullRoundText));
		}

		// if (this.#startGGPopulateTournamentNameCheck.checked) {
		// 	tournament.setText(this.#tournamentName);
		// }

		// if (this.#startGGSetGameCheck.checked) {
		// 	await gameSelector.setGame(this.#gameForEvent.name);
		// }

		displayNotif('Successfully populated match information.')
	}

	getCombinedPlayerDataFromEntrantId(entrantId) {
		if (!entrantId) {
			return;
		}
		const useStartGGData = this.#startGGPrioritizeStartGGDataCheck.checked;
		const useNonEmptyData = this.#startGGPrioritizeNonEmptyDataCheck.checked;

		let playerData = (JSON.parse(this.getPlayerFromPlayerList('entrantId', entrantId)));

		let playerReturnObj = {
			name: playerData.tag,
			tag: playerData.sponsor,
			pronouns: (playerData.user && playerData.user.genderPronoun) ? playerData.user.genderPronoun : '',
			socials: (playerData.user && playerData.user.authorizations) ? this.getSocialsInCorrectFormat(playerData.user.authorizations) : ''
		}

		for (let p in this.#playerPresets) {
			const preset = this.#playerPresets[p];

			if (preset.playerId == playerData.playerId || preset.name == playerReturnObj.name) {
				playerReturnObj.tag = this.getPlayerFieldValue(playerReturnObj.tag, preset.tag, useStartGGData, useNonEmptyData);
				playerReturnObj.pronouns = this.getPlayerFieldValue(playerReturnObj.pronouns, preset.pronouns, useStartGGData, useNonEmptyData);
				playerReturnObj.socials = this.getPlayerFieldValue(playerReturnObj.socials, preset.socials, useStartGGData, useNonEmptyData);
				break;
			}
		}

		return JSON.parse(JSON.stringify(playerReturnObj));

	}

	getPlayerFieldValue(startGGValue, presetValue, useStartGGValues, prioritizeNonEmpty) {
		let value = '';

		if (typeof startGGValue == 'object' && typeof presetValue == 'object') { //objects
			value = {};
			for (let i in startGGValue) {
				if (useStartGGValues) {
					if (prioritizeNonEmpty) {
						value[i] = (startGGValue[i]) ? startGGValue[i] : presetValue[i];
					} else {
						value[i] = startGGValue[i];
					}
				} else {
					if (prioritizeNonEmpty) {
						value[i] = (presetValue[i]) ? presetValue[i] : startGGValue[i];
					} else {
						value[i] = presetValue[i];
					}
				}
			}
	
			for (let i in presetValue) {
				if (useStartGGValues) {
					if (prioritizeNonEmpty) {
						value[i] = (startGGValue[i]) ? startGGValue[i] : presetValue[i];
					} else {
						value[i] = startGGValue[i];
					}
				} else {
					if (prioritizeNonEmpty) {
						value[i] = (presetValue[i]) ? presetValue[i] : startGGValue[i];
					} else {
						value[i] = presetValue[i];
					}				
				}
			}
		} else { //Simple
			if (useStartGGValues) {
				if (prioritizeNonEmpty) {
					value = (startGGValue) ? startGGValue : presetValue;
				} else {
					value = startGGValue;
				}	
			} else {
				if (prioritizeNonEmpty) {
					value = (presetValue) ? presetValue : startGGValue;
				} else {
					value = presetValue;
				}	
			}
		}
		
		return value;
	}

	getCorrectedRoundName (roundName) {
		if (roundName.indexOf('-Final') != -1) { //Convert Quarter-Final and Semi-Final to look like Quarters and Semis.
			roundName = roundName.replace('-Final', 's');
		}

		if (roundName.indexOf(' Final') != -1) { //Convert Losers/Winners/Grand Final to Finals
			roundName = roundName.replace(' Final', ' Finals');
		}
		return roundName;
	}

	getSocialsInCorrectFormat(startGGAuthorizationJson) {
		let socialJson = {};

		for (let i in startGGAuthorizationJson) {
			const type = startGGAuthorizationJson[i].type.toLowerCase();
			switch (type) {
				case "twitter":
					socialJson.twitter = startGGAuthorizationJson[i].externalUsername;
					break;
				case "twitch":
					socialJson.twitch = startGGAuthorizationJson[i].externalUsername;
					break;
				case "discord":
					//Currently not supported.
					break;
				default:
					break;
			}
		}

		return socialJson;
	}

	getGameStats(previousScores, curScores) {
		let winnerNum = null;
		if (previousScores[0] < curScores[0] && previousScores[1] == curScores[1]) {
			winnerNum = 0;
		} else if (previousScores[1] < curScores[1] && previousScores[0] == curScores[0]) {
			winnerNum = 1;
		} else {
			return '';
		}

		let loserNum = (winnerNum == 0) ? 1 : 0;

		let gameStatObj = {
			winnerId: this.getEntrantIdFromPlayerName(players[winnerNum].nameInp.value),
			winnnerChar: this.getCharacterIdFromCharacterName(players[winnerNum].char),
			loserId: this.getEntrantIdFromPlayerName(players[loserNum].nameInp.value),
			loserChar: this.getCharacterIdFromCharacterName(players[loserNum].char)
		}

		return gameStatObj;
	}

	getCharacterIdFromCharacterName(charName) {
		let charId = 0;
		if (!charName) {
			return charId
		}
		for (let i in this.#gameForEvent.characters) {
			let char =  this.#gameForEvent.characters[i];
			if (char.name.indexOf(charName) != -1 || charName.indexOf(char.name) != -1) {
				charId = char.id;
				break;
			}
		}
		return charId;
	}

	getSetWinner(curScores) {
		let playerNum = null;
		
		if (curScores[0] > curScores[1]) {
			playerNum = 0;
		} else {
			playerNum = 1;
		}

		if ((bestOf.getBo() == 5 && curScores[playerNum] == 3) || (bestOf.getBo() == 3 && curScores[playerNum] == 2)) {
			return this.getEntrantIdFromPlayerName(players[playerNum].nameInp.value);
		} else if (bestOf.getBo() == 'X') {
			displayNotif("Can't determine winner in BoX");
			return '';
		} else {
			return '';
		}
	}

	getEntrantIdFromPlayerName(playerName) {
		for (let i in this.#players) {
			if (this.#players[i].tag == playerName) {
				return this.#players[i].entrantId;
			}
		}

		return '';
	}

	async updateSetInfo() {
		if (!this.#currentSetInfo.id) {
			return;
		}

		const curScores = [scores[0].getScore(), scores[1].getScore()];

		this.#currentSetInfo.setDataSimple = { //NOTE: Simple sucks. It doesn't let us choose set count, just the winner.
			setId: this.#currentSetInfo.id,
			winnerId: this.getSetWinner(curScores)
		};

		if (!this.#currentSetInfo.useDetailedReportType ) {
			return;
		}
		
		let gameInfo = {};
		let gameNum = 0;
		let gameStats = {};

		if (this.#previousScores[0] != curScores[0] || this.#previousScores[1] != curScores[1]) { //Score has updated.
			gameNum = curScores[0] + curScores[1];
			gameStats = this.getGameStats(this.#previousScores, curScores);
			if (!gameStats) {
				gameInfo = {
					"winnerId": gameStats.winnerId,
					"gameNum": gameNum,
					// "entrant1Score": 0, //Stock counts
					// "entrant2Score": 0, //Stock counts
					// "stageId": 3,
					"selections": [{
						/**
						 * It does not care which order it is in. It does a cross-check on entrantID and associates correctly on their end.
						 */
							"entrantId": gameStats.winnerId,
							"characterId": gameStats.winnnerChar
						},
						{
							"entrantId": gameStats.loserId,
							"characterId": gameStats.loserChar
						}
					]
				};
			} else {
				//value increase by more than 1, which messes up our data.
				//use simple score reporting
				this.#currentSetInfo.useDetailedReportType = false;
			}
		}

		this.#previousScores = JSON.parse(JSON.stringify(curScores));

		if (gameNum == 0) {
			return;
		}

		if (!this.#currentSetInfo.setDataDetailed.gameData) {
			this.#currentSetInfo.setDataDetailed.gameData = [];
		}

		this.#currentSetInfo.setDataDetailed.setId = this.#currentSetInfo.id;
		this.#currentSetInfo.setDataDetailed.winnerId = this.getSetWinner(curScores);
		this.#currentSetInfo.setDataDetailed.gameData[gameNum-1] = gameInfo;
	}

	async reportSet() {
		//1045037 //this is the event we are testing with

		if (!this.#currentSetInfo.id) {
			displayNotif('Need to pull Match Info from StartGG first.');
			return;
		}

		let query = `
		mutation reportSet($setId: ID!, $winnerId: ID!, $gameData: [BracketSetGameDataInput]) {
			reportBracketSet(setId: $setId, winnerId: $winnerId, gameData: $gameData) {
			  id
			  state
			}
		}`;

		let variables = {};

		if (this.#currentSetInfo.useDetailedReportType) {
			variables = this.#currentSetInfo.setDataDetailed;
		} else {
			variables = this.#currentSetInfo.setDataSimple;
			if (!variables.winnerId) {
				return; //No winner yet. Fine on multiple game sets.
			}
		}

		if (!variables.setId) {
			displayNotif('Must have set data to report');
			return;
		}

		let json = await this.generalApiCall(query, variables, '');
	}

	async updatePlayerProfiles() {

	}

	getPlayerFromPlayerList(field, value) {
		let player = {
			playerId: null
		};
		for (let i in this.#players) {
			if (this.#players[i][field] == value) {
				player = this.#players[i];
				break;
			}
		}
		return JSON.stringify(player);
	}

	async getEntrantsForEvent(eventId) {
		if (!eventId) {
			displayNotif('Must provide a valid event (either eventID or URL).');
			this.showElems(false);
			return;
		}

		let eventInputType = 'ID';
		let eventInputType2 = eventInputType.toLocaleLowerCase();
		if (eventId.indexOf('tournament/') != -1) {
			eventInputType = 'String';
			eventInputType2 = 'slug';

			let tempVar = eventId.split('tournament/');
			eventId = 'tournament/' + tempVar[1];
		}


		let query = `
        query EventEntrants($eventId: ${eventInputType}!, $page: Int!, $perPage: Int!) {
            event(${eventInputType2}: $eventId) {
              id
              name
			  phases {
				id
				name
				numSeeds
				phaseOrder
			  }
			  videogame {
				name
				id
			  }
			  tournament {
				name
			  }
              entrants(query: {
                page: $page
                perPage: $perPage
              }) {
                pageInfo {
                  total
                  totalPages
                }
                nodes {
                  id
                  participants {
                    id
                    gamerTag
                    player {
                      id
					  prefix
                      user {
                        id
                        genderPronoun
                        authorizations {
                          externalUsername
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

		let variables = {
			"eventId": eventId,
			"page": 1,
			"perPage": 100
		}

		try {
			displayNotif('Loading event information...');
			const data = await this.generalApiCall(query, variables, 'data.event.entrants');
			if (data.data.event == null) {
				this.#eventIdInput.value = '';
				displayNotif('Invalid Event ID');
				this.showElems(false);
			} else {
				this.#gameForEvent = data.data.event.videogame;
				this.#eventId = data.data.event.id;
				this.#tournamentName = data.data.event.tournament.name;
				let prevPhaseOrder = 0;
				for (let i in data.data.event.phases) {
					let curPhaseOrder = data.data.event.phases[i].phaseOrder
					if (curPhaseOrder > prevPhaseOrder) {
						this.#top8PhaseId = data.data.event.phases[i].id;
					}

					prevPhaseOrder = curPhaseOrder;
				}
				
				
				this.#players = [];

				for (let e in data.data.event.entrants.nodes) {
					let node = data.data.event.entrants.nodes[e];
					let playerObj = {
						entrantId: node.id,
						tag: node.participants[0].gamerTag,
						sponsor: node.participants[0].player.prefix,
						participantId: node.participants[0].id,
						playerId: node.participants[0].player.id,
						user: node.participants[0].player.user
					}

					this.#players.push(playerObj);
				}

				this.#players.sort(this.dynamicSort('tag'));

				this.#startGGPlayerSelect.innerHTML = '';
				for (let i = 0; i < this.#players.length; i++) {
					const option = document.createElement('option');
					const player = this.#players[i];
					option.value = player.tag;
					option.innerHTML = player.tag;

					option.style.backgroundColor = "var(--bg5)";
					this.#startGGPlayerSelect.appendChild(option);
				}

				
				displayNotif('Event found');
				this.showElems(true);

				await this.getVideogameInfo(this.#gameForEvent.id);
			}
		} catch (e) {
			console.log(e);
		}
	}

	dynamicSort(property) {
		var sortOrder = 1;
		if (property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a, b) {
			/* next line works with strings and numbers, 
			 * and you may want to customize it to your needs
			 */
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	}
	async setPlayerPresets() {
		this.#playerPresets = await getPresetList("Player Info");
	}

	async getVideogameInfo(id) {
		let query = `
        query VideogameQuery {
            videogames(query: { filter: { id: "${id}" }, perPage: 2 }) {
                nodes {
                    id
                    name
                    displayName
                    characters {
                        id
                        name
                    }
					stages {
						id
						name
					}
                }
            }
        }
        `;

		let json = await this.generalApiCall(query, {});

		this.#gameForEvent = JSON.parse(JSON.stringify(json.data.videogames.nodes[0]));
	}

	async generalApiCall(query, variables, pagination) {
		const response = await fetch('https://api.start.gg/gql/alpha', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "appplication/json",
				"Authorization": "Bearer " + connectInformation.key
			},
			body: JSON.stringify({
				"query": query,
				"variables": variables
			})
		});
		const json = await response.json();
		try {
			if (json.errors) {
				throw json.errors;
			}
		} catch (e) {
			throw e;
		}

		if (pagination && variables.page) {
			let originalPage = false;
			if (variables.page == 1) {
				originalPage = true;
			}

			const paginationObj = getPaginationObjFromJson(json, pagination);
			if (variables.page < paginationObj.pageInfo.totalPages) {
				variables.page += 1;
				paginationObj.nodes = paginationObj.nodes.concat(await this.generalApiCall(query, variables, pagination));
			}
			
			if (originalPage) {
				//do nothing.
			} else {
				return paginationObj.nodes;//always return the Nodes of a paginated object.
			}
		}

		return json;

		function getPaginationObjFromJson (json, pagination) {
			if (pagination.indexOf('.') != -1) {
				let paginationArr = pagination.split('.');
				let firstEl = paginationArr.shift();
				let newPagination = paginationArr.toString().replaceAll(',', '.');
				return getPaginationObjFromJson(json[firstEl], newPagination);
			} else {
				return json[pagination];
			}
		}
	}

	/* //Scrapping this idea for now... Standard save/apply preset would overwrite this. It would be better to just handle things entirely within this plugin.
	async savePlayerPresets(onlyPlayerId) {

		for (let i = 0; i < 2; i++) {
			const preset = {
				name: players[i].nameInp.value,
				tag: players[i].tag,
				pronouns: players[i].pronouns,
				socials: players[i].socials,
			}

			// if a player preset for this player exists, add already existing characters
			const existingPreset = await getJson(`${stPath.text}/Player Info/${players[i].nameInp.value}`)
			if (existingPreset) {
	
				// add existing characters to the new json, but not if the character is the same
				for (let i = 0; i < existingPreset.characters.length; i++) {
					preset.characters.push(existingPreset.characters[i]);
				}
	
			}
	
			saveJson(`/Player Info/${players[i].nameInp.value}`, preset);
			displayNotif("Player preset has been saved");
			playerFinder.setPlayerPresets();
		}
	}
	*/
}
export const startGG = new StartGG;

