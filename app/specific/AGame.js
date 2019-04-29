//Variable initialization
var AGame_cursorY = 0;
var AGame_cursorX = 0;
var AGame_dataEnded = false;
var AGame_itemsCount = 0;
var AGame_idObject = {};
var AGame_emptyCellVector = [];
var AGame_loadingData = false;
var AGame_loadingDataTry = 0;
var AGame_loadingDataTryMax = 5;
var AGame_loadingDataTimeout = 3500;
var AGame_itemsCountOffset = 0;
var AGame_MaxOffset = 0;
var AGame_emptyContent = false;

var AGame_ids = ['ag_thumbdiv', 'ag_img', 'ag_infodiv', 'ag_displayname', 'ag_streamtitle', 'ag_streamgame', 'ag_viwers', 'ag_quality', 'ag_cell', 'agempty_', 'a_games_scroll'];
var AGame_status = false;
var AGame_itemsCountCheck = false;
var AGame_fallowing = false;
var AGame_UserGames = false;
var AGame_TopRowCreated = false;
//Variable initialization end

function AGame_init() {
    Main_values.Main_CenterLablesVectorPos = 3;
    Main_values.Main_Go = Main_aGame;
    document.body.addEventListener("keydown", AGame_handleKeyDown, false);
    Main_AddClass('top_bar_game', 'icon_center_focus');
    Main_IconLoad('label_side_panel', 'icon-arrow-circle-left', STR_GOBACK);

    if (Main_values.Search_isSearching) { //Reset label as the app may be restoring from background
        Main_cleanTopLabel();
        Main_innerHTML('top_bar_user', STR_SEARCH + Main_UnderCenter(STR_GAMES + ' ' + "'" + Main_values.Search_data + "'"));
    }

    Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter(STR_LIVE +
        ': ' + Main_values.Main_gameSelected));
    if ((Main_values.Main_OldgameSelected === Main_values.Main_gameSelected) && AGame_status) {
        Main_YRst(AGame_cursorY);
        Main_ShowElement(AGame_ids[10]);
        AGame_addFocus();
        Main_SaveValues();
    } else AGame_StartLoad();
}

function AGame_exit() {
    if (AGame_status && AGame_cursorY === -1) {
        AGame_removeFocusFallow();
        AGame_cursorY = 0;
        AGame_cursorX = 0;
        Main_AddClass(AGame_ids[0] + '0_' + AGame_cursorX, Main_classThumb);
    }
    Main_IconLoad('label_side_panel', 'icon-ellipsis', STR_SIDE_PANEL);
    Main_innerHTML('top_bar_game', STR_GAMES);
    document.body.removeEventListener("keydown", AGame_handleKeyDown);
    Main_RemoveClass('top_bar_game', 'icon_center_focus');
    Main_HideElement(AGame_ids[10]);
}

function AGame_StartLoad() {
    if (Main_values.Main_OldgameSelected === null) Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
    Main_empty('stream_table_a_game');
    Main_HideElement(AGame_ids[10]);
    Main_showLoadDialog();
    Main_HideWarningDialog();
    AGame_status = false;
    AGame_TopRowCreated = false;
    AGame_itemsCountOffset = 0;
    AGame_MaxOffset = 0;
    AGame_idObject = {};
    AGame_emptyCellVector = [];
    AGame_itemsCountCheck = false;
    AGame_itemsCount = 0;
    Main_FirstLoad = true;
    AGame_cursorX = 0;
    AGame_cursorY = 0;
    AGame_dataEnded = false;
    Main_CounterDialogRst();
    AGame_loadDataPrepare();
    AGame_loadDataRequest();
}

function AGame_loadDataPrepare() {
    Main_imgVectorRst();
    AGame_loadingData = true;
    AGame_loadingDataTry = 0;
    AGame_loadingDataTimeout = 3500;
}

function AGame_loadDataRequest() {
    var offset = AGame_itemsCount + AGame_itemsCountOffset;
    if (offset && offset > (AGame_MaxOffset - 1)) {
        offset = AGame_MaxOffset - Main_ItemsLimitVideo;
        AGame_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/streams?game=' + encodeURIComponent(Main_values.Main_gameSelected) +
        '&limit=' + Main_ItemsLimitVideo + '&offset=' + offset +
        (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '');

    BasehttpGet(theUrl, AGame_loadingDataTimeout, 2, null, AGame_loadDataSuccess, AGame_loadDataError);
}

function AGame_loadDataError() {
    AGame_loadingDataTry++;
    if (AGame_loadingDataTry < AGame_loadingDataTryMax) {
        AGame_loadingDataTimeout += 500;
        AGame_loadDataRequest();
    } else {
        AGame_loadingData = false;
        if (!AGame_itemsCount) {
            Main_FirstLoad = false;
            Main_HideLoadDialog();
            Main_showWarningDialog(STR_REFRESH_PROBLEM);
        } else {
            AGame_dataEnded = true;
            AGame_loadDataSuccessFinish();
        }
    }
}

function AGame_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.streams.length;
    AGame_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) AGame_dataEnded = true;

    var offset_itemsCount = AGame_itemsCount;
    AGame_itemsCount += response_items;

    AGame_emptyContent = !AGame_itemsCount;

    var response_rows = response_items / Main_ColoumnsCountVideo;
    if (response_items % Main_ColoumnsCountVideo > 0) response_rows++;

    var coloumn_id, row_id, row, i, stream, id,
        cursor = 0,
        doc = document.getElementById("stream_table_a_game");

    // Make the game video/clip/fallowing cell
    if (!AGame_TopRowCreated) {
        AGame_TopRowCreated = true;
        row = document.createElement('tr');
        var thumbfallow;
        for (i = 0; i < 3; i++) {
            if (!i) thumbfallow = '<i class="icon-movie-play stream_channel_fallow_icon"></i>' + STR_SPACE + STR_SPACE + STR_VIDEOS;
            else if (i === 1) thumbfallow = '<i class="icon-movie stream_channel_fallow_icon"></i>' + STR_SPACE + STR_CLIPS;
            else thumbfallow = '';
            Main_td = document.createElement('td');
            Main_td.setAttribute('id', AGame_ids[8] + 'y_' + i);
            Main_td.className = 'stream_cell';
            Main_td.innerHTML = '<div id="' + AGame_ids[0] +
                'y_' + i + '" class="stream_thumbnail_fallow_game" ><div id="' + AGame_ids[3] +
                'y_' + i + '" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
            row.appendChild(Main_td);
        }
        doc.appendChild(row);
    }

    for (i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main_ColoumnsCountVideo + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main_ColoumnsCountVideo && cursor < response_items; coloumn_id++, cursor++) {
            stream = response.streams[cursor];
            id = stream.channel._id;
            if (AGame_idObject[id]) coloumn_id--;
            else {
                AGame_idObject[id] = 1;
                row.appendChild(Main_createCellVideo(row_id, row_id + '_' + coloumn_id,
                    [stream.channel.name, id], AGame_ids,
                    [stream.preview.template.replace("{width}x{height}", Main_VideoSize),
                        Main_is_playlist(JSON.stringify(stream.stream_type)) + stream.channel.display_name,
                        stream.channel.status, stream.game,
                        STR_SINCE + Play_streamLiveAt(stream.created_at) + STR_AGO + ', ' + STR_FOR +
                        Main_addCommas(stream.viewers) + STR_VIEWER,
                        Main_videoqualitylang(stream.video_height, stream.average_fps, stream.channel.broadcaster_language)
                    ]));
            }
        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountVideo; coloumn_id++) {
            if (AGame_dataEnded && !AGame_itemsCountCheck) {
                AGame_itemsCountCheck = true;
                AGame_itemsCount = (row_id * Main_ColoumnsCountVideo) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(AGame_ids[9] + row_id + '_' + coloumn_id));
            AGame_emptyCellVector.push(AGame_ids[9] + row_id + '_' + coloumn_id);
        }
        doc.appendChild(row);
    }

    AGame_loadDataSuccessFinish();
}

function AGame_loadDataSuccessFinish() {
    if (!AGame_status) {
        AGame_Checkfallow();
        if (AGame_emptyContent) {
            Main_showWarningDialog(STR_NO + STR_LIVE_GAMES);
            AGame_cursorY = -1;
            AGame_addFocusFallow();
        } else {
            AGame_status = true;
            Main_imgVectorLoad(IMG_404_VIDEO);
            AGame_addFocus();
            Main_SaveValues();
        }
        Main_ShowElement(AGame_ids[10]);
        Main_FirstLoad = false;
        Main_HideLoadDialog();
    } else {
        Main_imgVectorLoad(IMG_404_VIDEO);
        if (AGame_emptyCellVector.length > 0 && !AGame_dataEnded) {
            AGame_loadDataPrepare();
            AGame_loadDataReplace();
            return;
        } else {
            Main_CounterDialog(AGame_cursorX, AGame_cursorY, Main_ColoumnsCountVideo, AGame_itemsCount);
            AGame_emptyCellVector = [];
        }
    }
    AGame_loadingData = false;
}

function AGame_Checkfallow() {
    if (AGame_UserGames) {
        AGame_fallowing = true;
        AGame_setFallow();
    } else if (AddUser_UserIsSet()) AddCode_CheckFallowGame();
    else {
        AGame_fallowing = false;
        AGame_setFallow();
    }
}

function AGame_setFallow() {
    if (AGame_fallowing) Main_innerHTML(AGame_ids[3] + "y_2", '<i class="icon-heart" style="color: #00b300; font-size: 100%; text-shadow: #FFFFFF 0 0 10px, #FFFFFF 0 0 10px, #FFFFFF 0 0 8px;"></i>' + STR_SPACE + STR_SPACE + STR_FALLOWING);
    else Main_innerHTML(AGame_ids[3] + "y_2", '<i class="icon-heart-o" style="color: #FFFFFF; font-size: 100%; text-shadow: #000000 0 0 10px, #000000 0 0 10px, #000000 0 0 8px;"></i>' + STR_SPACE + STR_SPACE + (AddUser_UserIsSet() ? STR_FALLOW : STR_NOKEY));
}

function AGame_fallow() {
    if (AddUser_UserIsSet() && AddUser_UsernameArray[Main_values.Users_Position].access_token) {
        if (AGame_fallowing) AddCode_UnFallowGame();
        else AddCode_FallowGame();
    } else {
        Main_showWarningDialog(STR_NOKEY_WARN);
        window.setTimeout(function() {
            if (AGame_emptyContent && Main_values.Main_Go === Main_aGame) Main_showWarningDialog(STR_NO + STR_LIVE_GAMES);
            else Main_HideWarningDialog();
        }, 2000);
    }
}

function AGame_headerOptions() {
    if (!AGame_cursorX) {
        Main_values.Main_Go = Main_AGameVod;
        Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
        AGame_headerOptionsExit();
        Main_SwitchScreenAction();
    } else if (AGame_cursorX === 1) {
        Main_values.Main_Go = Main_AGameClip;
        Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
        AGame_headerOptionsExit();
        Main_SwitchScreenAction();
    } else AGame_fallow();
}

function AGame_headerOptionsExit() {
    if (AGame_status && AGame_cursorY === -1) {
        AGame_removeFocusFallow();
        AGame_cursorY = 0;
        AGame_cursorX = 0;
        Main_AddClass(AGame_ids[0] + '0_' + AGame_cursorX, Main_classThumb);
    }
    document.body.removeEventListener("keydown", AGame_handleKeyDown);
    Main_HideElement(AGame_ids[10]);
}

function AGame_loadDataReplace() {
    Main_SetItemsLimitReplace(AGame_emptyCellVector.length);

    var offset = AGame_itemsCount + AGame_itemsCountOffset;
    if (offset && offset > (AGame_MaxOffset - 1)) {
        offset = AGame_MaxOffset - Main_ItemsLimitReplace;
        AGame_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/streams?game=' + encodeURIComponent(Main_values.Main_gameSelected) +
        '&limit=' + Main_ItemsLimitReplace + '&offset=' + offset +
        (Main_ContentLang !== "" ? ('&broadcaster_language=' + Main_ContentLang) : '');

    BasehttpGet(theUrl, AGame_loadingDataTimeout, 2, null, AGame_loadDataSuccessReplace, AGame_loadDataErrorReplace);
}

function AGame_loadDataErrorReplace() {
    AGame_loadingDataTry++;
    if (AGame_loadingDataTry < AGame_loadingDataTryMax) {
        AGame_loadingDataTimeout += 500;
        AGame_loadDataReplace();
    } else {
        AGame_dataEnded = true;
        AGame_itemsCount -= AGame_emptyCellVector.length;
        AGame_emptyCellVector = [];
        AGame_loadDataSuccessFinish();
    }
}

function AGame_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText),
        response_items = response.streams.length,
        stream, id, i = 0,
        cursor = 0,
        tempVector = [];

    AGame_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitReplace) AGame_dataEnded = true;

    for (i; i < AGame_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        stream = response.streams[cursor];
        id = stream.channel._id;
        if (AGame_idObject[id]) i--;
        else {
            AGame_idObject[id] = 1;
            Main_replaceVideo(AGame_emptyCellVector[i], [stream.channel.name, id],
                [stream.preview.template.replace("{width}x{height}", Main_VideoSize),
                    Main_is_playlist(JSON.stringify(stream.stream_type)) + stream.channel.display_name,
                    stream.channel.status, stream.game,
                    STR_SINCE + Play_streamLiveAt(stream.created_at) + STR_AGO + ', ' + STR_FOR +
                    Main_addCommas(stream.viewers) + STR_VIEWER,
                    Main_videoqualitylang(stream.video_height, stream.average_fps, stream.channel.broadcaster_language)
                ], AGame_ids);

            tempVector.push(i);
        }
    }

    for (i = tempVector.length - 1; i > -1; i--) AGame_emptyCellVector.splice(tempVector[i], 1);

    AGame_itemsCountOffset += cursor;
    if (AGame_dataEnded) {
        AGame_itemsCount -= AGame_emptyCellVector.length;
        AGame_emptyCellVector = [];
    }

    AGame_loadDataSuccessFinish();
}

function AGame_addFocus() {
    if (AGame_cursorY < 0) {
        AGame_addFocusFallow();
        return;
    }
    Main_addFocusVideo(AGame_cursorY, AGame_cursorX, AGame_ids, Main_ColoumnsCountVideo, AGame_itemsCount);

    if (((AGame_cursorY + Main_ItemsReloadLimitVideo) > (AGame_itemsCount / Main_ColoumnsCountVideo)) &&
        !AGame_dataEnded && !AGame_loadingData) {
        AGame_loadDataPrepare();
        AGame_loadDataRequest();
    }
    if (Main_CenterLablesInUse) AGame_removeFocus();
}

function AGame_removeFocus() {
    if (AGame_cursorY > -1 && AGame_itemsCount) Main_removeFocus(AGame_cursorY + '_' + AGame_cursorX, AGame_ids);
    else AGame_removeFocusFallow();
}

function AGame_addFocusFallow() {
    Main_AddClass(AGame_ids[0] + 'y_' + AGame_cursorX, Main_classThumb);
}

function AGame_removeFocusFallow() {
    Main_RemoveClass(AGame_ids[0] + 'y_' + AGame_cursorX, Main_classThumb);
}

function AGame_handleKeyDown(event) {
    if (Main_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else {
                Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
                AGame_removeFocus();
                AGame_removeFocusFallow();
                Main_CenterLablesStart(AGame_handleKeyDown);
            }
            break;
        case KEY_LEFT:
            if (AGame_cursorY === -1) {
                AGame_removeFocusFallow();
                AGame_cursorX--;
                if (AGame_cursorX < 0) AGame_cursorX = 2;
                AGame_addFocusFallow();
            } else if (!AGame_cursorY && !AGame_cursorX) {
                AGame_removeFocus();
                AGame_removeFocusFallow();
                AGame_cursorY = -1;
                AGame_cursorX = 2;
                AGame_addFocusFallow();
            } else if (Main_ThumbNull((AGame_cursorY), (AGame_cursorX - 1), AGame_ids[0])) {
                AGame_removeFocus();
                AGame_cursorX--;
                AGame_addFocus();
            } else {
                for (i = (Main_ColoumnsCountVideo - 1); i > -1; i--) {
                    if (Main_ThumbNull((AGame_cursorY - 1), i, AGame_ids[0])) {
                        AGame_removeFocus();
                        AGame_cursorY--;
                        AGame_cursorX = i;
                        AGame_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (AGame_cursorY === -1) {
                AGame_removeFocusFallow();
                AGame_cursorX++;
                if (AGame_cursorX > 2) {
                    AGame_cursorX = 0;
                    if (!AGame_emptyContent) {
                        AGame_cursorY = 0;
                        AGame_addFocus();
                    } else AGame_addFocusFallow();
                } else AGame_addFocusFallow();
            } else if (Main_ThumbNull((AGame_cursorY), (AGame_cursorX + 1), AGame_ids[0])) {
                AGame_removeFocus();
                AGame_cursorX++;
                AGame_addFocus();
            } else if (Main_ThumbNull((AGame_cursorY + 1), 0, AGame_ids[0])) {
                AGame_removeFocus();
                AGame_cursorY++;
                AGame_cursorX = 0;
                AGame_addFocus();
            }
            break;
        case KEY_UP:
            if (AGame_cursorY === -1 && !AGame_emptyContent) {
                AGame_cursorY = 0;
                AGame_removeFocusFallow();
                AGame_addFocus();
            } else if (!AGame_cursorY) {
                AGame_removeFocus();
                AGame_cursorY = -1;
                AGame_addFocusFallow();
            } else {
                for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                    if (Main_ThumbNull((AGame_cursorY - 1), (AGame_cursorX - i), AGame_ids[0])) {
                        AGame_removeFocus();
                        AGame_cursorY--;
                        AGame_cursorX = AGame_cursorX - i;
                        AGame_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_DOWN:
            if (AGame_cursorY === -1 && !AGame_emptyContent) {
                AGame_cursorY = 0;
                AGame_removeFocusFallow();
                AGame_addFocus();
            } else {
                for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                    if (Main_ThumbNull((AGame_cursorY + 1), (AGame_cursorX - i), AGame_ids[0])) {
                        AGame_removeFocus();
                        AGame_cursorY++;
                        AGame_cursorX = AGame_cursorX - i;
                        AGame_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            if (AGame_cursorY !== -1) {
                Main_OpenLiveStream(AGame_cursorY + '_' + AGame_cursorX, AGame_ids, AGame_handleKeyDown);
            } else AGame_headerOptions();
            break;
        default:
            break;
    }
}