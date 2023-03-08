from pathlib import Path


root_dir = Path(__file__).resolve().parents[5].__str__() + "/"
recordings_dir = root_dir + "Recordings/"
stream_tool_dir = root_dir + "RoA-Stream-Tool/Stream Tool/"
resources_dir = stream_tool_dir + "Resources/"
script_dir = resources_dir + "Scripts/Python"
scoreboard_loc = resources_dir + "Texts/ScoreboardInfo.json"
player_info_dir = resources_dir + "Texts/Player Info/"
set_data_filename = "SetDataInfo.json"
set_data_loc = resources_dir + "Texts/" + set_data_filename

round_file_name = 'Round.txt'
tourney_file_name = 'Tournament Name.txt'

round_info_dir = resources_dir + "Texts/Simple Texts/" + round_file_name 
tourney_info_dir = resources_dir + "Texts/Simple Texts/" + tourney_file_name 


# print(root_dir)
# print(recordings_dir)
# print(stream_tool_dir)
# print(resources_dir)
# print(script_dir)
# print(scoreboard_loc)
# print(player_info_dir)
# print(set_data_filename)
# print(set_data_loc)