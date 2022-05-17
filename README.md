![preview](https://user-images.githubusercontent.com/12535808/168495012-a58c3184-6254-42c9-bb2e-2c4edb76a2c9.png)
# RoA Stream Tool![RoAStreamTool]

*Also available for [Melee](https://github.com/Readek/Melee-Stream-Tool) and [Rushdown Revolt](https://github.com/Readek/Rushdown-Revolt-Stream-Tool)!*

So you want to do a Rivals of Aether stream, huh? Well, today is your lucky day, because I have done tons of work so you don’t have to! With this tool, you will be able to set up a RoA tournament stream in no time.

---

## Features
- [Easy and fast setup](https://gfycat.com/entireinconsequentialafricangroundhornbill) using a browser source. Drag and drop!
- [Handy interface](https://gfycat.com/thirstyripeeyra) to quickly change everything you need, like player names, characters, scores, round, casters...
- Customizable [Player Presets](https://gfycat.com/melodicwearybuzzard) to setup your match in no time!
- Every single skin the game has to offer is [supported](https://gfycat.com/sandyinsignificantdodobird) (more than 300 different skins!), including high quality renders.
- Some **Workshop** characters are also [supported](https://gfycat.com/leadingancienthumpbackwhale)!
- Now with [2v2 support](https://gfycat.com/wigglyshamelessindianpalmsquirrel)!
- [Dynamic, optional intro](https://gfycat.com/revolvingsmarteuropeanpolecat) to be played when changing to the game scene.
- A "[VS Screen](https://gfycat.com/peacefulelatedblowfish)" to be displayed when waiting for the next game.
- All the content on the GUI combo boxes can be edited at will. You can quickly change which characters or skins your tournament is going to be using.
- Easy to customize! Add your own skins, workshop characters, custom overlays or even dive into the code if you're brave enough!
- This is **not** a [Stream Control](http://farpnut.net/StreamControl) clone. It doesn't have anything to do with it, everything is custom made.

---

## How to setup
These are instructions for regular OBS Studio, but I imagine you can do the same with other streaming software:
- Get the [latest release](https://github.com/Ateozc/RoA-Stream-Tool/releases).
- Extract somewhere.
- Drag and drop `RoA Scoreboard.htlm` into OBS, or add a new browser source in OBS pointing at the local file.
- If the source looks weird, manually set the source's properties to 1920 width and 1080 height, or set your OBS canvas resolution to 1080p, or make the source fit the screen.
- In the source's properties, change *Use custom frame rate* -> `60` (if streaming at 60fps of course).
- **Also tick `Refresh browser when scene becomes active`**. Trust me, this one is important.
- Manage it all with the `RoA Stream Tool` executable.

Repeat from the 3rd step to add the `VS Screen.html`, though I recommend you to do so on another scene.

### Interface shortcuts!
- Press `Enter` to update.
- Press either `F1` or `F2` to increase P1's or P2's score.
- Press `ESC` to clear player info.

Note: The Scoreboard's intro will only play when refreshing the browser. If you tick the intro box while having the scoreboard's scene open, nothing will change until you go out and back to the scoreboard's scene.

---

## Advanced setup
Yes, the instructions above are enough, but we can do better. **All of this is optional** of course.
 
2 basic transitions are included in the `Resources/OBS Transitions` folder, intended to be used to change to the game scene and to the vs screen, if you don't have a transition yourself of course. To use them on OBS:
- Add a new stinger transition.
- Set the video file to `Game In.webm` if creating the game scene transition, and `Swoosh.webm` if creating a vs screen transition.
- Transition point -> `350 ms`.
- I recommend you to set the Audio Fade Style to crossfade, just in case.
- On the scene's right click menu, set it to Transition Override to the transition you just created.
- Also, you may want to set a hotkey to transition to the game scene so you can press enter ingame to start the replay and press the transition key at the same time. The transition is timed to do so.

It is very much recommended that you turn off the in-game top HUD. The overlay wont cover the [player's icons on the top corners](https://cdn.discordapp.com/attachments/574303886869790730/705102043102052363/game_hud_oh_no.png), and that will fix it.

Also, you may find the "3 2 1" of the game's intro a bit distracting when combined with the scoreboard intro. [These](https://drive.google.com/open?id=1NEDii3B50eHT_goADzn6t3_O8Uvok0Gs) are the sprites to remove them (using the [Modding Tool](https://github.com/jam1garner/gm_data_win/releases/latest)).

---

## Automated Stream Tool Control
Tired of having to manually select characters and skins? Tired of having to enter scores and update the Best of?

This is for PC only and for Offline only. This does not work for Online or for Replays! This also only works for players 1 and 2. Players 3 and 4 are not currently supported (youll know when it is)

Well. Look no further. For Rivals of Aether (and partial support for Workshop), there is a way to use this Stream Tool as an almost fully automated piece!

To get started, you will need a few things.
1. Download the Stream Tool
2. Download and setup the AddressRocker tool.
3. Test the AddressRocker tool
4. Set up the Stream Tool to support the Address Rocker.

First, download and install the Stream Tool from the releases page.
If this is your first time installing everything, follow the above steps, then come back to here once you are done.

## Address Rocker setup:
- You must have the latest version of Dandy's AddressRocker tool. Anytime the game has an update the tool will also need to be updated.
   - Here is a link to those releases. [Dandy's AddressRocker](https://github.com/johnlaschober/RoA-AddressRocker/releases)
- Once you have that, place the contents somewhere on the computer. It doesn't matter where.
- Open up where you extracted th contents to and then open the RoA.RockerUI.exe. (Windows will require you to allow it to run, as it is not an official app).
- There is a section called "RoAState.json Save Location". Click the three dots (...)
- Save the file where you have the Stream Tool located (it should be at this location: \Stream Tool\Resources\Texts)
- Launch the game to ensure the Address Rocker is able to pull the data. (Recommend launching the game in 1x size).
- If the tool isn't working, contact me or Dandy. Might be an issue with how things are set up. There is also a possibility a shadow update happened on Rivals that is causing the tool to no longer work.
- If it is working and you can see it showing in game data, test a few things
 - Is it correctly pulling information for Player 1?
   - Game Count?
   - Character?
   - Skin? 
 - Is it correctly pulling information for Player 2?
   - Game Count?
   - Character?
   - Skin?
 - Is it correctly pulling Best of information?
 - Is it correctly pulling whether or not you are in a game? (This should change the moment you select a stage)



## Setting up the Stream Tool for the Address Rocker
- Now that you have the Stream Tool downloaded and the Address Rocker working, it is time to have them work together.
- On the Stream Tool, click on the Settings option in the Bottom Right of the tool (its the hamburger icon).
- From there, click on "Next" to go to Page 2.
- Page 2 should be titled "Automated Stream Tool Settings"
- Enable all the checkboxes.
- When "Use Address Rocker for Tool Control" is enabled, a button should appear that says "Start Set (Enables Auto Check for Changes).
  - The "Start Set" button is what tells the tool to start pulling data from the AddressRocker.
   - After a set is started, this will take full control of the stream tool. It will auto update the information on the screen roughly every half second.
   - It is highly recommended that if you dont want extra player tags saved to enter in the Player information first before hitting start set.
  - "Stop Set" will replace "Start Set" when a set has started. If you press "Stop Set" the tool will no longer automatically pull the data.
   - After a set is complete (A player reach 2 wins in Bo3, or 3 wins in Bo5) the "Stop Set" will automatically be triggered.
- The other toggles do as they say. Each can choose which items are automatically pulled in from the tool. (Recommendations below)
   - "Toggle Address Rocker info display" is more for debug purposes. It just displays information in the tool for easier access without having the settings menu open.
   - "Toggle Automatic Character update" is great for Base Cast. If using workshop, turn this off. (This will pick the Character's Default skin if Automatic Skin update is turned off).
   - "Toggle Automatic Skin update" is great... when it works. Sometimes the data messes up. If it fails, it will default to the default skin (cannot override this). 
   - "Toggle Automatic Best Of update" will get the Best Of information. However, this only works in Tournament mode.
   - "Toggle Automatic Score update" will get the Score information. However, this only works in Tournament mode.
   - "Toggle Automatic Color update" will get the player's team color. Currently, since only Player 1 and 2 are supported it will do Red for Player 1, Blue for Player 2. If a player is a CPU it will use Gray.

If you followed everything correctly, your Stream Tool should now be auto updating without you needing to intervene too much.

But what if I told you there was more...?

---
## Automated OBS Stream Control
Yes. You read the right. Control your stream entirely through automation. Want it to Transition to the In-Game Overlay the moment the stage is selected? You got it. Want it to transition back to a different screen when it goes back to character select? No problem.

Just follow these steps and we can get that going.

You must have the OBS Studio (StreamLabs OBS may work, but that is not what this was built for)

We need to set up a few things first before this will just work and I hope I can explain this well enough.

1. Open OBS as an Administrator.
2. Navigate to each "Scene" you want the Automation to be able to control. Make sure you know which ones we will be using based upon the information below.
  - Currently, this only supports the following "Scenes"
     - Set Start Scene (This should be the screen you show at the start of a set. For example, most just use the scene where they have the "VS Screen" Overlay on.
     - VS Screen Scene (Can be the same as the Set Start Screen, but I recommend using another scene that looks like the Set Start Screen, but with either player cams or the game capture in the middle. This will be the main scene that shows when the players are selecting characters and stages.)
     - Scoreboard Scene (This is the main "RoA Scoreboard" overlay scene. This is used for when the players are facing each other and the stage is loaded).
     - Set End Scene (This is the scene you want to put up when a set is over. Can be any scene, but I recommend the VS Screen Sceen or some kind of Intermission/We will be right back" scene).
3. Drag and Drop the "OBSControl.html" onto one of the Scenes.
4. Open the "OBSControl.html" properties in OBS. Scroll to the very bottom of the page and look for "Page Permissions"
5. It is recommended to give permission of this "Full access to OBS (Start/Stop streaming without warning, etc.).
   - Don't worry, you can check the code for what it does. It literally only uses the change scenes functionality. 
   - Automated Recording control is a plan for future to help with vods, but currently is not a priority as I have python scripts that can be ran to do that for you. (Youll have to check out the automated vod section).
   - The reason for full access: When i was testing on my own computer, it would sometimes ask for access when a scene was supposed to transition. This alleviated that problem.
6. After you have given the "OBSControl.html" full permisions, click OK.
7. Copy the "OBSControl.html" onto each scene you want it to have control of.
   - *NOTE: When pasting, it should say "Paste (Reference)"
8. Navigate back to the Stream Tool.
9. Enable all the Address Rocker items except for the "Start Set"
10. Go to the "Next" page in settings (This should take you to page 3, "OBS Settings".
11. You must set the following based upon point number 2. The names must match your Scenes' name exactly. (See example below)
   - Set Start Screen
   - VS Screen Scene
   - Scoreboard Scene
   - Set End Scene
12. Once you have those set up, you can now enable the OBS Auto Control and set "OBS Scene Control" to "Auto from Address Rocker"
   - *Note: If Address Rocker is disabled on the previous page, you will be unable to select "Auto from Address Rocker".
13. You are all set to go. Now, you scenes should automatically transition for you based upon the game state! Enjoy!
14. If you are still looking for some explanations on how to effectively use scenes, follow the information under the example picture.

Example of OBS Settings and OBS Scene Names
![AutoOBS](https://user-images.githubusercontent.com/12535808/168496605-88b92e4b-3178-49ff-b101-70886275c81b.png)

Above shows my current setup.
The Scenes you see (Just Gameplay, Intermission, End Stream, etc) are my scenes.
With the automation tool, I have the OBSControl.html on Intermission, Vs Screen (Set Start), VS Screen (Between Games), Main Screen with overlay.

The reasoning for this setup is:
Intermission > "Hit 'Set Start' button" > Transitions to "Vs Screen (Set Start)" > After a delay of a few seconds, transitions to "VS Screen (Between Games) > If the game has started (IE stage selected) then it will immediately transition to "Main Screen with overlay" > Game is done it will transition back to "VS Screen (Between Games) until the game starts again > Set is over transition back to "VS Screen (Between Games)

So, basically it comes down to preference as to how you want it to transition. There will always be a slight delay between Set Start and Vs Screen. I personally do this because I take a screenshot of a clean VS Screen where it doesn't have anything extra. My "VS Screen (Between Games)" shows the gameplay as a very tiny screen in the middle between the Character images. This allows viewers to see what the players are doing for stage picks, character picks, etc.

If you need help understanding this part, reach out to me. I would be happy to help.


---


## Python Stuff...
Do you want to have vods handled a little bit more automatically?
If so, you came to the right place. The following are what can be done through the python scripts:
   - Automatically update Player Score counts
   - Automatically rename files from a folder, and place them into a new folder based upon the tournament name
   - Clear set information.

Listen. I really want to explain this, but if you dont know scripting or any python it isnt super easy for me to break this one down as you will require some basic coding knowledge. But, if you do have that knowledge, here is what youll need.

It doesn't do much in comparison to the rest of things that you have access to... but for me this is a huge piece.

On top of that, I call these python scripts from my Stream Deck. (Really nice btw, highly recommend for its flexibility). 
So, ill explain how I use it first before you go through the hassle to actually do this yourself. You may be able to do most of this without python, albeit more manually.
I use my Stream deck to call the scripts at certain timings to do different things. At the start of a set, I have a plugin for the Stream Deck that makes OBS Start Recording and makes OBS take a screenshot (as a png) of what is on the screen on OBS (this screenshot is used as a thumbnail).
At the end of a set, i have another button that will "Stop Recording" and then, after a 5 second delay, will attempt to rename all files in a folder based upon the Tournament, Round, Players, and their Characters, then move those files into a new folder titled after the Tournament.
   - Example: Tripoint 143 - Grand Finals - Foxtrot (Shovel Knight) VS UGS | Serris (Ranno)

This issentially auto starts/stops recording and renames files for me. Not much else. If that interests you, you can probably do the same with/without the python stuff.

If you are still interested after all of that, do the following:

1. Install Latest Python. It should work on Latest.
2. Make sure you can call the Python scripts located in "Stream Tool/Resources/Scripts"
  - A good test is the "Stream Tool\Resources\Scripts\RoAIncrementP1Score.py"
  - If you call that script via command line it should increment the player score automatically within the Stream Tool. If it doesn't, there may be something wrong.
3. For is to work, you will need to do one of the following:
  - Have OBS Save its screenshots and replays in the same folder as where the Stream Tool is located but call it Recordings(Example: c:/Documents/Stream Tool you want to save to c:/Documents/Recordings)
  - OR you can modify the RoADictionary.py to change where the "Recordings" is tied to. May require some coding knowledge to do that though, so dont really recommend unless you know what you are doing.
4. Once you have tested you can call the scripts and you have the folders set up correctly you are essentially done.
5. The next part is about how you want it setup. Since I use Stream Deck to control mine its a bit different. If you dont have a Stream Deck you will have to find your own solution.


*Recommendations:*
I highly recommend you have your vods as MP4 and FLV. You can set that up in OBS. Screenshots should be png regardless.
Make sure they save to the Recordings folder.

If you dont have a Stream Deck, it isn't all lost. You can do the following
   - Set up a hotkey for taking screenshots in OBS
   - Set up a hotkey for Starting and Stopping Recording in OBS.
   - You can run the "RoARenameFiles.py" after your recording is done and it should automatically rename the files for you.
     - If you do this, you either need to hit the "Trash" icon in the Stream Tool or run the "RoAClearSetData.py". This is to ensure the data used to rename files is cleaned up and ready for the next match. (This is important as it does track which characters are used. Can be buggy with the Auto stuff a player picks Random).

If you do have a Stream Deck
  - Install the OBS Tools [BarRaider] (This is important, as it is the best way I have found to control OBS with the Stream Deck. You will have to go through a bit of an installation setup since it uses Websockets)
  - Set up a Multi-Action. 
     - Add a "Record" action from the basic "OBS Studio" choices. Make sure it is set to "Start"
     - Add a "Hotkey Trigger" to trigger your hotkey for taking a screenshot.
  - Set up another Multi-Action
     - Add a "Delay" action from "Stream Deck" option. Set that delay to at least 2000ms. (This is to ensure nothing is cut off at the end of a match)
     - Add a "Record" action from the basic "OBS Studio" choices. Make sure it is set to "Stop"
     - Add a "Delay" action from "Stream Deck" option. Set that delay to at least 2000ms. (This is to ensure there is enough time for OBS to process the recording and save it.
     - Call the "RoARenameFiles.py" by using the "Open" command under "Sytem" and choosing the file.
     - Call the "RoAClearSetData.py" by using the "Open" command under "Sytem" and choosing the file.
     - Call the "RoAResetScore.py" by using the "Open" command under "Sytem" and choosing the file.
---

## Other stuff...
Hey, Ateozc speakin for the remainder of this...

Still gotta update this read me here for the stuff I added. I know. I probably should have done that ahead of time. But I am lazy and did this last minute. 

If you are looking for the OBS stuff I did using Python, I'll update this on how to use that stuff sooner or later. Dont worry. If you are python savvy, just make sure you install latest python and you should be good to go. Dont recall if i installed anything special. None of that is packaged, so feel free to edit as you need.

Other than that, yea. I messed with Readek's stuff and made my own version. If you want to message me on Twitter you can find me at https://twitter.com/ateozc.

If you want to send me a donation, feel free to use https://ko-fi.com/ateozc 

### Closing notes
I do programming for a living. This is a side hobby, along with running events here in Chicago.
If you have any questions let me know. Lots of the stuff you see here was done because I wanted it for myself lol.
