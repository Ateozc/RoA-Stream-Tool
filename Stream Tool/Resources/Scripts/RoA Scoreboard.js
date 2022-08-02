'use strict';

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
	async connectedCallback(
		shadowRoot = this.shadowRoot || this.attachShadow({
			mode: "open"
		})
	) {
		shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
	}
})

//animation stuff
const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const introSize = "85px";
const nameSize = "24px";
const tagSize = "17px";
const nameSizeDubs = "22px";
const tagSizeDubs = "15px";
const teamSize = "22px"
const roundSize = "19px";

//to store the current character info
const pCharInfo = [];

//the characters image file path will change depending if they're workshop or not
let charPath;
const charPathBase = "Resources/Characters/";
const charPathWork = "Resources/Characters/_Workshop/";

let player = [];
let teamName = [];
let color = [];
let score = [];
let wl = [];
let bestOf = "Bo3";
let gamemode = "Singles";
let round = "";
let workshop = false;
let mainMenu = false;


//color list will be stored here on startup
let colorList;

//to avoid the code constantly running the same method over and over
let pCharPrev = [], pSkinPrev = ["",""], scorePrev = ["",""], colorPrev = [
	{
		name: 'Blank',
		hex: ""
	},
	{
		name: 'Blank',
		hex: ""
	}
], wlPrev = ["",""];
let bestOfPrev, workshopPrev, mainMenuPrev, gamemodePrev;

let usePips = true;
let prevUsePip = usePips;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;

let startup = true;


//next, global variables for the html elements
const scoreboard = document.getElementsByClassName("scoreboard");
const teamNames = document.getElementsByClassName("teamName");
const colorImg = document.getElementsByClassName("colors");
const wlGroup = document.getElementsByClassName("wlGroup");
const wlText = document.getElementsByClassName("wlText");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreAnim = document.getElementsByClassName("scoreVid");
const scoreNumbers = document.getElementsByClassName("scoreNumbers");
const tLogoImg = document.getElementsByClassName("tLogos");
const overlayRound = document.getElementById("overlayRound");
const textRound = document.getElementById('round');
const borderImg = document.getElementsByClassName('border');

// we want the correct order, we cant use getClassName here
const pWrapper = [], pTag = [], pName = [], pTwitter = [], pPronouns = [], charImg = [];
function pushArrayInOrder(array, string) {
    for (let i = 0; i < 4; i++) {
        array.push(document.getElementById("p"+(i+1)+string));
    }
}
pushArrayInOrder(pWrapper, "Wrapper");
pushArrayInOrder(pTag, "Tag");
pushArrayInOrder(pName, "Name");
pushArrayInOrder(pTwitter, "Twitter");
pushArrayInOrder(pPronouns, "Pronouns");
pushArrayInOrder(charImg, "Character");


//This is for the player's name to change to their twitter at for a period of time
const twitterLoopMax = 15; // time in seconds = x / 2
const nameLoopMax = 30;
let showNameOrTwitter = "name";
let loops = 0;

let gettingScene = false;

/* script begin */
async function mainLoop() {
	loops++;
	if (showNameOrTwitter == "name") {
		if (loops >= nameLoopMax) {
			loops = 0;
			showNameOrTwitter = "twitter";
		}
	} else if (showNameOrTwitter == "twitter") {
		if (loops >= twitterLoopMax) {
			loops = 0;
			showNameOrTwitter = "name";
		}
	}

	const scInfo = await getInfo();
	// const guiInfo = await getGuiInfo();
	getData(scInfo);
}
mainLoop();
setInterval( () => { mainLoop(); }, 500); //update interval

async function getData(scInfo) {

	// let obsSettings = scInfo['obsSettings'];
	// 	let addressRockerSettings = scInfo['addressRockerSettings'];
	
	// 	if (obsSettings.useObsAutomation && addressRockerSettings.useAddressRocker && obsSettings.autoChangeScenes != 'manualFromOBS' && obsSettings.currentScene && !gettingScene) {
	// 		window.obsstudio.getCurrentScene(function(scene) {
	// 			if (scene.name != obsSettings.currentScene) {
	// 				gettingScene = true;
	// 				window.obsstudio.setCurrentScene(obsSettings.currentScene);
	// 				return;
	// 			}
	// 		});
	// 	}
	// 	if (gettingScene) {
	// 		return;
	// 	}

	prevUsePip = usePips;
	usePips = scInfo['usePips'];
	gamemode = scInfo['gamemode'];

	let tempPlayers = scInfo['player']
	if (gamemode == 'Teams') { // this is a very hacky way to do this. Do not do this in the future. Please.
		player[0] = tempPlayers[0];
		player[1] = tempPlayers[2];
		player[2] = tempPlayers[1];
		player[3] = tempPlayers[3];
	} else {
		player = tempPlayers;
	}

	teamName = scInfo['teamName'];

	color = scInfo['color'];
	const score = scInfo['score'];
	wl = scInfo['wl'];

	bestOf = scInfo['bestOf'];
	

	round = scInfo['round'];

	workshop = scInfo['workshop'];

	mainMenu = scInfo['forceMM'];


	// first of all, things that will always happen on each cycle
	
	// set the current char path
	if (workshopPrev != workshop) {
		charPath = workshop ? charPathWork : charPathBase;
		// save the current workshop status so we know when it changes next time
		workshopPrev = workshop;
	}

	// set the max players depending on singles or doubles
	maxPlayers = gamemode == 'Singles' ? 2 : 4;

	// change border depending of the Best Of status
	if (bestOfPrev != bestOf) {
		updateBorder(bestOf, gamemode); // update the border
		// update the score ticks so they fit the bestOf border
		updateScore(score[0], bestOf, color[0], 0, gamemode, false);
		updateScore(score[1], bestOf, color[1], 1, gamemode, false);
	}

	if (prevUsePip != usePips) {
		updateBorder(bestOf, gamemode); // update the border
	}

	// now, things that will happen for each player
	for (let i = 0; i < maxPlayers; i++) {

		// get the character lists now before we do anything else
		// if (pCharPrev[i] != player[i].character) {
		// 	// gets us the character positions to be used when updating the char image
		// 	pCharInfo[i] = await getCharInfo(player[i].character);
		// }

	}

	// and lastly, things that will happen for each side
	for (let i = 0; i < maxSides; i++) {

		// if there is no team name, just display "[Color] Team"
		if (!teamName[i]) teamName[i] = color[i].name + " Team";

		// change the player background colors
		if (colorPrev[i].hex != color[i].hex) {
			updateColor(colorImg[i], color[i], gamemode);
			colorPrev[i] = color[i];
		}

	}


	// now, things that will happen only once, when the html loads
	if (startup) {

		//first things first, initialize the colors list
		colorList = await getColorInfo();		

		//of course, we have to start with the cool intro stuff
		if (scInfo['allowIntro']) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			const introVid = document.getElementById('introVid');
			introVid.src = 'Resources/Overlay/Scoreboard/Intro.webm';
			introVid.play();

			if (score[0] + score[1] == 0) { //if this is the first game, introduce players

				for (let i = 0; i < maxSides; i++) {
					const pIntroEL = document.getElementById('p'+(i+1)+'Intro');

					//update players intro text
					if (gamemode == 'Singles') { //if singles, show player 1 and 2 names
						pIntroEL.textContent = player[i].name;
					} else { //if doubles
						if (teamName[i] == color[i] + " Team") { //if theres no team name, show player names
							pIntroEL.textContent = player[i].name + " & " + player[i+2].name;
						} else { //else, show the team name
							pIntroEL.textContent = teamName[i];
						}
					}

					pIntroEL.style.fontSize = introSize; //resize the font to its max size
					resizeText(pIntroEL); //resize the text if its too large

					//change the color of the player text shadows
					pIntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(color[i]);
					
				};

				//player name fade in
				fadeInMove(document.getElementById("p1Intro"), introDelay, null, true);
				fadeInMove(document.getElementById("p2Intro"), introDelay, null, false);


			} else { //if its not the first game, show game count
				const midTextEL = document.getElementById('midTextIntro');
				if ((score[0] + score[1]) != 4 || !usePips) { //if its not the last game of a bo5

					//just show the game count in the intro
					midTextEL.textContent = "Game " + (score[0] + score[1] + 1);

				} else { //if game 5

					if ((round.toUpperCase() == "TRUE FINALS")) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "GRAND FINALS - RESET" && !(wl[0] == "L" && wl[1] == "L")) {
							fadeIn(document.getElementById("superCoolInterrogation"), introDelay+.5, 1.5);
						}

					}
				}
			}

			document.getElementById('roundIntro').textContent = round;
			document.getElementById('tNameIntro').textContent = scInfo['tournamentName'];
			
			//round, tournament and VS/GameX text fade in
			document.querySelectorAll(".textIntro").forEach(el => {
				fadeIn(el, introDelay-.2, fadeInTime);
			});

			//aaaaand fade out everything
			fadeOut(document.getElementById("overlayIntro"), fadeInTime+.2, introDelay+1.8)

			//lets delay everything that comes after this so it shows after the intro
			introDelay = 2.5;
		}


		//if this isnt a singles match, rearrange stuff
		if (gamemode != 'Singles') {
			changeGM(gamemode);
		}
		gamemodePrev = gamemode;


		// this will be used later to sync the animations for all character images
		const charsLoaded = [];

		// now for the actual initialization of players
		for (let i = 0; i < maxPlayers; i++) {
			
			//lets start with the player names and tags
			updatePlayerName(i, player[i].name, player[i].tag, player[i].pronouns, player[i].twitter, gamemode);
			if (gamemode == 'Singles') { //if this is singles, fade the names in with a sick motion
				const side = (i % 2 == 0) ? true : false; //to know direction
				fadeInMove(pWrapper[i], introDelay, null, side); // fade it in with some movement
			} else { //if doubles, just fade them in
				fadeIn(pWrapper[i], introDelay+.15)
			}
			

			//set the character image for the player
			charsLoaded.push(updateChar(player[i].character, player[i].scoreboardSkin, i, pCharInfo[i], mainMenu));
			//the animation will be fired below, when the image finishes loading

			//save the character/skin so we run the character change code only when this doesnt equal to the next
			pCharPrev[i] = player[i].character;
			pSkinPrev[i] = player[i].scoreboardSkin;

		}

		// now we use that array from earlier to animate all characters at the same time
		Promise.all(charsLoaded).then( (value) => { // when all images are loaded
			for (let i = 0; i < value.length; i++) { // for every character loaded
				fadeInMove(value[i], introDelay+.2, true); // fade it in
			}
		})

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			// to know animation direction
			const side = (i % 2 == 0) ? true : false;

			//set the team names if not singles
			if (gamemode != 'Singles') {
				updateText(teamNames[i], teamName[i], teamSize);
				fadeInMove(teamNames[i], introDelay, null, side);
			}

			scoreboard[i].style.display = "";

			// fade in move the scoreboards
			fadeInMove(scoreboard[i].parentElement, introDelay-.1, null, side);
			
			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(wl[i], i);
			fadeInWL(wlGroup[i], introDelay+.6);
			
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

			//set the current score
			updateScore(score[i], bestOf, color[i], i, gamemode, false);
			scorePrev[i] = score[i];

			//check if we have a logo we can place on the overlay
			if (gamemode == 'Singles') { //if this is singles, check the player tag
				updateLogo(tLogoImg[i], player[i].tag);
			} else { //if doubles, check the team name
				updateLogo(tLogoImg[i], teamName[i]);
			}
			
		}


		//update the round text	and fade it in
		updateText(textRound, round, roundSize);
		fadeIn(overlayRound, introDelay);


		//set this for later
		mainMenuPrev = mainMenu;


		startup = false; //next time we run this function, it will skip all we just did
	}

	// now things that will happen on all the other cycles
	else {

		//of course, check if the gamemode has changed
		if (gamemodePrev != gamemode) {
			changeGM(gamemode);
			// we need to update some things
			updateBorder(bestOf, gamemode);
			for (let i = 0; i < maxSides; i++) {
				updateColor(colorImg[i], color[i], gamemode);
				updateScore(score[i], bestOf, color[i], i, gamemode, false);
			}
			gamemodePrev = gamemode;
		}
		

		// this will be used later to sync the animations for all character images
		const charsLoaded = [], animsEnded = [];

		// //get the character lists now before we do anything else
		// for (let i = 0; i < maxPlayers; i++) {
		// 	//if the character has changed, update the info
		// 	// if (pCharPrev[i] != player[i].character) {
		// 	// 	pCharInfo[i] = await getCharInfo(player[i].character);
		// 	// }
		// }
		
		
		//lets check each player
		for (let i = 0; i < maxPlayers; i++) {
			let playerName = player[i].name;
			let playerTag = player[i].tag;
			let playerPronouns = player[i].pronouns;
			if (showNameOrTwitter == "twitter" && (player[i].twitter || player[i].pronouns)) {
				playerName = player[i].twitter; //change the actual text
				playerTag = "";
				
				if (i < 2) {
					tLogoImg[i].style.display = "none";
				}
				
			} else {
				playerPronouns = "";
				if (i < 2) {
					tLogoImg[i].style.display = "block";
				}
				
			}


			//player names and tags
			if (pName[i].textContent != playerName || pTag[i].textContent != playerTag || pPronouns[i].textContent != playerPronouns) {

				//check the player's side so we know the direction of the movement
				const side = (i % 2 == 0) ? true : false;

				//if this is singles, move the texts while updating
				if (gamemode == 'Singles') {
					//move and fade out the player 1's text
					fadeOutMove(pWrapper[i], null, side).then( () => {
						//now that nobody is seeing it, quick, change the text's content!
						updatePlayerName(i, playerName, playerTag, playerPronouns, player[i].twitter, gamemode);
						//fade the name back in with a sick movement
						fadeInMove(pWrapper[i], 0, null, side);
					});
				} else { //if not singles, dont move the texts
					fadeOut(pWrapper[i]).then( () => {
						updatePlayerName(i, playerName, playerTag, playerPronouns, player[i].twitter, gamemode);
						fadeIn(pWrapper[i]);
					}); 
				}
				
			}

			//player characters and skins
			if (pCharPrev[i] != player[i].character || pSkinPrev[i] != player[i].scoreboardSkin || mainMenuPrev != mainMenu) {

				//fade out the image while also moving it because that always looks cool
				animsEnded.push(fadeOutMove(charImg[i], true, null).then( () => {
					//now that nobody can see it, lets change the image!
					charsLoaded.push(updateChar(player[i].character, player[i].scoreboardSkin, i, pCharInfo[i], mainMenu));
					//will fade in when image finishes loading
				}));
				pCharPrev[i] = player[i].character;
				pSkinPrev[i] = player[i].scoreboardSkin;
			}
		}
		// now we use that array from earlier to animate all characters at the same time
		Promise.all(animsEnded).then( () => { // need to sync somehow
			Promise.all(charsLoaded).then( (value) => { // when all images are loaded
				for (let i = 0; i < value.length; i++) { // for every character loaded
					fadeInMove(value[i], .1, true); // fade it in
				}
			})
		})


		//now let's check stuff from each side
		for (let i = 0; i < maxSides; i++) {

			//check if the team names changed
			if (gamemode != 'Singles') {

				const side = (i % 2 == 0) ? true : false;

				if (teamNames[i].textContent != teamName[i]) {
					fadeOutMove(teamNames[i], null, side).then( () => {
						updateText(teamNames[i], teamName[i], teamSize);
						fadeInMove(teamNames[i], 0, null, side);
					});
				}
			}
			
			//the [W] and [L] status for grand finals
			if (wlPrev[i] != wl[i]) {
				//move it away!
				fadeOutWL(wlGroup[i]).then( () => {
					//change the thing!
					updateWL(wl[i], i);
					//move it back!
					fadeInWL(wlGroup[i])
				});
				wlPrev[i] = wl[i];
			}

			//score check
			if (scorePrev[i] != score[i]) {
				updateScore(score[i], bestOf, color[i], i, gamemode, true); //if true, animation will play
				scorePrev[i] = score[i];
			}

			//check if we have a logo we can place on the overlay
			if (gamemode == 'Singles') { //if this is singles, check the player tag
				if (pTag[i].textContent != player[i].tag) {
					fadeOut(tLogoImg[i]).then( () => {
						updateLogo(tLogoImg[i], player[i].tag);
						fadeIn(tLogoImg[i]);
					});
				}
			} else { //if doubles, check the team name
				if (teamNames[i].textContent != teamName[i]) {
					fadeOut(tLogoImg[i]).then( () => {
						updateLogo(tLogoImg[i], teamName[i]);
						fadeIn(tLogoImg[i]);
					});
				}
			}


		}


		//we place this one here so both characters can be updated in one go
		mainMenuPrev = mainMenu;

		
		//and finally, update the round text
		if (textRound.textContent != round){
			fadeOut(textRound).then( () => {
				updateText(textRound, round, roundSize);
				fadeIn(textRound);
			});
		}

	}
}


// the gamemode manager
function changeGM(gm) {
			
	if (gm == 'Teams') {

		// move the scoreboard to the new positions
		const r = document.querySelector(':root');
		r.style.setProperty("--scoreboardX", "15px");
		r.style.setProperty("--scoreboardY", "13px");

		// add new positions for the character images
		charImg[0].parentElement.parentElement.classList.add("charTop");
		charImg[1].parentElement.parentElement.classList.add("charTop");

		//change the positions for the player texts
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersSingles");
			pWrapper[i].classList.add("wrappersDubs");
			//update the text size and resize it if it overflows
			pName[i].style.fontSize = nameSizeDubs;
			pTag[i].style.fontSize = tagSizeDubs;
			pPronouns[i].style.fontSize = tagSizeDubs;
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "257px";
		pWrapper[1].style.right = "257px";

		// move the [W]/[L] indicators
		wlGroup[0].parentElement.style.left = "192px";
		wlGroup[1].parentElement.style.left = "192px";

		// move the team logos
		tLogoImg[0].style.left = "352px";
		tLogoImg[0].style.top = "65px";
		tLogoImg[1].style.right = "352px";
		tLogoImg[1].style.top = "65px";

		//show all hidden elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "block";
		}

	} else {

		const r = document.querySelector(':root');
		r.style.setProperty("--scoreboardX", "470px");
		r.style.setProperty("--scoreboardY", "25px");

		charImg[0].parentElement.parentElement.classList.remove("charTop");
		charImg[1].parentElement.parentElement.classList.remove("charTop");

		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersDubs");
			pWrapper[i].classList.add("wrappersSingles");
			pName[i].style.fontSize = nameSize;
			pTag[i].style.fontSize = tagSize;
			pPronouns[i].style.fontSize = tagSize;
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "38px";
		pWrapper[1].style.right = "38px";

		wlGroup[0].parentElement.style.left = "0px";
		wlGroup[1].parentElement.style.left = "0px";

		tLogoImg[0].style.left = "248px";
		tLogoImg[0].style.top = "33px";
		tLogoImg[1].style.right = "248px";
		tLogoImg[1].style.top = "33px";

		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}
		
	}

	// update the background images
	document.getElementById("bgL").src = `Resources/Overlay/Scoreboard/Name BG ${gm}.png`;
	document.getElementById("bgR").src = `Resources/Overlay/Scoreboard/Name BG ${gm}.png`;

}


// update functions
async function updateScore(pScore, bestOf, pColor, pNum, gamemode, playAnim) {
	if (playAnim) { //do we want to play the score up animation?
		// depending on the color, change the clip
		scoreAnim[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/CPU.webm`;
		scoreAnim[pNum].play();
	} 
	scoreNumbers[pNum].textContent = pScore;
	// change the score image with the new values
	if (usePips) {
		scoreImg[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/${bestOf} ${pScore}.png`;
		// scoreImg[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/${bestOf} ${pScore} - cb.png`; //cb version
	} else {
		scoreImg[pNum].src = ``;
	}
	

}

function updateColor(colorEL, pColor, gamemode) {

	colorEL.children[0].style.fill = pColor.hex;
	colorEL.children[1].style.fill = pColor.hex;

	if (gamemode == 'Singles') {
		colorEL.children[0].style.display = 'block';
		colorEL.children[1].style.display = 'none';
	} else {
		colorEL.children[0].style.display = 'none';
		colorEL.children[1].style.display = 'block';
	}
	// colorEL.src = `Resources/Overlay/Scoreboard/Colors/${gamemode}/${pColor.name}.png`;
}

function updateBorder(bestOf, gamemode) {
	for (let i = 0; i < borderImg.length; i++) {
		if (usePips) {
			borderImg[i].src = `Resources/Overlay/Scoreboard/Borders/Border ${gamemode} ${bestOf}.png`;
			borderImg[i].style.left = 0;
			scoreNumbers[i].style.display = "none";
		} else {
			borderImg[i].src = `Resources/Overlay/Scoreboard/Borders/Border 1 Numbers.png`;
			borderImg[i].style.left = '-60px';
			scoreNumbers[i].style.display = "block";
		}
		
	}
	bestOfPrev = bestOf
}

function updateLogo(logoEL, nameLogo) {
	logoEL.src = `Resources/Logos/${nameLogo}.png`;
}

function updatePlayerName(pNum, name, tag, pronouns, twitter, gamemode) {
	if (gamemode == 'Teams') {
		pName[pNum].style.fontSize = nameSizeDubs; //set original text size
		pTag[pNum].style.fontSize = tagSizeDubs;
		pPronouns[pNum].style.fontSize = tagSizeDubs;
	} else {
		pName[pNum].style.fontSize = nameSize;
		pTag[pNum].style.fontSize = tagSize;
		pPronouns[pNum].style.fontSize = tagSize;			
		// pTwitter[pNum].style.fontSize = tagSize;
	}
	// if (showNameOrTwitter == "name") {
		pName[pNum].textContent = name; //change the actual text
	// } else if (showNameOrTwitter == "twitter") {
	// 	pName[pNum].textContent = twitter; //change the actual text
	// }
	pTag[pNum].textContent = tag;
	// pTwitter[pNum].textContent = twitter;

	pPronouns[pNum].textContent = pronouns;
	resizeText(pWrapper[pNum]); //resize if it overflows
}

//generic text changer
function updateText(textEL, textToType, maxSize) {
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
}

function updateWL(pWL, pNum) {
	//check if winning or losing in a GF, then change image
	if (pWL == "W") {
		wlText[pNum].textContent = "WINNERS";
		wlText[pNum].style.color = "#76a276";
		wlGroup[pNum].style.display = "block";
	} else if (pWL == "L") {
		wlText[pNum].textContent = "LOSERS";
		wlText[pNum].style.color = "#a27677";
		wlGroup[pNum].style.display = "block";
	} else {
		wlText[pNum].textContent = ' ';
		wlGroup[pNum].style.display = "none";
	}
}


//fade out
async function fadeOut(itemID, dur = fadeOutTime, delay = 0) {
	// actual animation
	itemID.style.animation = `fadeOut ${dur}s ${delay}s both`;
	// this function will return a promise when the animation ends
	await new Promise(resolve => setTimeout(resolve, dur * 1000)); // translate to miliseconds
}

//fade out but with movement
async function fadeOutMove(itemID, chara, side) {

	if (chara) {
		// we need to target a different element since chromium
		// does not support idependent transforms on css yet
		itemID.parentElement.style.animation = `charaMoveOut ${fadeOutTime}s both
			,fadeOut ${fadeOutTime}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveOutLeft ${fadeOutTime}s both
				,fadeOut ${fadeOutTime}s both`
			;
		} else {
			itemID.style.animation = `moveOutRight ${fadeOutTime}s both
				,fadeOut ${fadeOutTime}s both`
			;
		}
		
	}
	
	await new Promise(resolve => setTimeout(resolve, fadeOutTime * 1000));

}

//fade in
function fadeIn(itemID, delay = 0, dur = fadeInTime) {
	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;
}

//fade in but with movement
function fadeInMove(itemID, delay = 0, chara, side) {
	if (chara) {
		itemID.parentElement.style.animation = `charaMoveIn ${fadeOutTime}s ${delay}s both
			, fadeIn ${fadeOutTime}s ${delay}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveInLeft ${fadeInTime}s ${delay}s both
				, fadeIn ${fadeInTime}s ${delay}s both`
			;
		} else {
			itemID.style.animation = `moveInRight ${fadeInTime}s ${delay}s both
				, fadeIn ${fadeInTime}s ${delay}s both`
			;
		}
	}
}

//movement for the [W]/[L] images
async function fadeOutWL(wlEL) {
	wlEL.style.animation = `wlMoveOut .4s both`;
	await new Promise(resolve => setTimeout(resolve, 400));
}
function fadeInWL(wlEL, delay = 0) {
	wlEL.style.animation = `wlMoveIn .4s ${delay}s both`;
}


//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
		if (childrens.length > 0) { //for tag+player texts
			Array.from(childrens).forEach(function (child) {
				child.style.fontSize = getFontSize(child);
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL);
		}
	}
}

//returns a smaller fontSize for the given element
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
}

//so we can get the exact color used by the game!
function getHexColor(color) {
	return color.hex;
	// for (let i = 0; i < colorList.length; i++) {
	// 	if (colorList[i].name == color.name) {
	// 		return colorList[i].hex;
	// 	}
	// }
}

//searches for the main json file
function getInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
	//i would gladly have used fetch, but OBS local files wont support that :(
}

function getGuiInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/GUI Settings.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
	//i would gladly have used fetch, but OBS local files wont support that :(
}

//searches for the colors list json file
function getColorInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/Color Slots.json');
		oReq.send();

		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
}

//searches for a json file with character data
function getCharInfo(pCharacter) {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.onerror = () => {resolve(null)}; //for obs local file browser sources
		oReq.open("GET", charPath + pCharacter + '/_Info.json');
		oReq.send();

		function reqListener () {
			try {resolve(JSON.parse(oReq.responseText))}
			catch {resolve(null)} //for live servers
		}
	})
}

//now the complicated "change character image" function!
async function updateChar(pCharacter, pSkin, pNum, charInfo, mainMenu) {

	//store so code looks cleaner
	const charEL = charImg[pNum];
	charInfo = player[pNum].info;

	//change the image path depending on the character and skin
	charEL.src = player[pNum].scoreboardSkinPath;
	// charEL.src = charPath + pCharacter + '/' + pSkin + '.png';

	let scaleX = 1;

	//               x, y, scale
	const charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	
	let skinIsRandom = (player[pNum].scoreboardSkinPath.indexOf('Random.png') != -1)

	if (!skinIsRandom && charInfo) {
		if (charInfo.scoreboard[pSkin]) { //if the skin has a specific position
			charPos[0] = charInfo.scoreboard[pSkin].x;
			charPos[1] = charInfo.scoreboard[pSkin].y;
			charPos[2] = charInfo.scoreboard[pSkin].scale;
		// } else if (mainMenu && charInfo.scoreboard.mainMenu) { //for the main menu renders, or some extras for workshop characters
		// 	charPos[0] = charInfo.scoreboard.mainMenu.x;
		// 	charPos[1] = charInfo.scoreboard.mainMenu.y;
		// 	charPos[2] = charInfo.scoreboard.mainMenu.scale;
		// 	charEL.src = charPath + pCharacter + '/MainMenu/'+pSkin+'.png';
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.scoreboard.neutral.x;
			charPos[1] = charInfo.scoreboard.neutral.y;
			charPos[2] = charInfo.scoreboard.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (pNum % 2 == 0) {
			charPos[0] = 35;
		} else {
			charPos[0] = 30;
			if (skinIsRandom) {
				scaleX = -1;
			}
		}
		charPos[1] = -10;
		charPos[2] = 1.2;
	}

	scaleX = scaleX * charPos[2];
	
	//to position the character
	charEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${scaleX} , ${charPos[2]})`;

	// this will make the thing wait till the image is fully loaded
	await charEL.decode().catch( () => {
		// if the image fails to load, we will use a placeholder
		/* for whatever reason, catch doesnt work properly on firefox */
		/* add an extra timeout before decode to fix */
		charEL.src = player[pNum].defaultSkinPath;
	});

	return charImg[pNum];

}
