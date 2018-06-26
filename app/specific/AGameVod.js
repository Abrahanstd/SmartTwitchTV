//Variable initialization
var AGameVod_cursorY = 0;
var AGameVod_cursorX = 0;
var AGameVod_dataEnded = false;
var AGameVod_itemsCount = 0;
var AGameVod_idObject = {};
var AGameVod_emptyCellVector = [];
var AGameVod_loadingData = false;
var AGameVod_loadingDataTry = 0;
var AGameVod_loadingDataTryMax = 5;
var AGameVod_loadingDataTimeout = 3500;
var AGameVod_itemsCountOffset = 0;
var AGameVod_MaxOffset = 0;
var AGameVod_emptyContent = false;
var AGameVod_itemsCountCheck = false;
var AGameVod_period = 'week';
var AGameVod_periodNumber = 2;
var AGameVod_FirstLoad = false;

var AGameVod_ids = ['agv_thumbdiv', 'agv_img', 'agv_infodiv', 'agv_title', 'agv_streamon', 'agv_duration', 'agv_viwers', 'agv_quality', 'agv_cell', 'gsvempty_', 'a_games_vod_scroll', 'agv_game'];
var AGameVod_status = false;
var AGameVod_highlight = false;
var AGameVod_OldgameSelected = '';
//Variable initialization end

function AGameVod_init() {
    Main_Go = Main_AGameVod;
    Main_AddClass('top_bar_game', 'icon_center_focus');
    document.body.addEventListener("keydown", AGameVod_handleKeyDown, false);

    Main_IconLoad('label_controls', 'icon-arrow-circle-left', STR_GOBACK);
    Main_IconLoad('label_refresh', 'icon-refresh', STR_SWITCH_VOD + STR_GUIDE);
    Main_IconLoad('label_switch', 'icon-calendar', STR_SWITCH_CLIP + STR_KEY_UP_DOWN);

    if ((AGameVod_OldgameSelected === Main_gameSelected) && AGameVod_status) {
        Main_YRst(AGameVod_cursorY);
        Main_ShowElement(AGameVod_ids[10]);
        Main_CounterDialog(AGameVod_cursorX, AGameVod_cursorY, Main_ColoumnsCountVideo, AGameVod_itemsCount);
        AGameVod_SetPeriod();
    } else AGameVod_StartLoad();
}

function AGameVod_exit() {
    document.body.removeEventListener("keydown", AGameVod_handleKeyDown);
    Main_RemoveClass('top_bar_game', 'icon_center_focus');
    Main_innerHTML('top_bar_game', STR_GAMES);

    Main_IconLoad('label_controls', 'icon-question-circle', STR_CONTROL_KEY);
    Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
    Main_IconLoad('label_switch', 'icon-switch', STR_SWITCH);
    Main_HideElement(AGameVod_ids[10]);
}

function AGameVod_StartLoad() {
    Main_HideElement(AGameVod_ids[10]);
    Main_showLoadDialog();
    AGameVod_SetPeriod();
    AGameVod_OldgameSelected = Main_gameSelected;
    Main_HideWarningDialog();
    AGameVod_status = false;
    Main_empty('stream_table_a_game_vod');
    AGameVod_itemsCountOffset = 0;
    AGameVod_MaxOffset = 0;
    AGameVod_idObject = {};
    AGameVod_emptyCellVector = [];
    AGameVod_itemsCountCheck = false;
    AGameVod_FirstLoad = true;
    AGameVod_itemsCount = 0;
    AGameVod_cursorX = 0;
    AGameVod_cursorY = 0;
    AGameVod_dataEnded = false;
    Main_CounterDialogRst();
    AGameVod_loadDataPrepare();
    AGameVod_loadDataRequest();
}

function AGameVod_loadDataPrepare() {
    Main_imgVectorRst();
    AGameVod_loadingData = true;
    AGameVod_loadingDataTry = 0;
    AGameVod_loadingDataTimeout = 3500;
}

function AGameVod_loadDataRequest() {
    try {

        var xmlHttp = new XMLHttpRequest();

        var offset = AGameVod_itemsCount + AGameVod_itemsCountOffset;
        if (offset && offset > (AGameVod_MaxOffset - 1)) {
            offset = AGameVod_MaxOffset - Main_ItemsLimitVideo;
            AGameVod_dataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/videos/top?game=' +
            encodeURIComponent(Main_gameSelected) + '&limit=' + Main_ItemsLimitVideo +
            '&broadcast_type=' + (AGameVod_highlight ? 'highlight' : 'archive') + '&sort=views&offset=' + offset +
            '&period=' + AGameVod_period + '&' + Math.round(Math.random() * 1e7), true);

        xmlHttp.timeout = AGameVod_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    AGameVod_loadDataSuccess(xmlHttp.responseText);
                    return;
                } else {
                    AGameVod_loadDataError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AGameVod_loadDataError();
    }
}

function AGameVod_loadDataError() {
    AGameVod_loadingDataTry++;
    if (AGameVod_loadingDataTry < AGameVod_loadingDataTryMax) {
        AGameVod_loadingDataTimeout += 500;
        AGameVod_loadDataRequest();
    } else {
        AGameVod_loadingData = false;
        Main_HideLoadDialog();
        Main_showWarningDialog(STR_REFRESH_PROBLEM);
    }
}

function AGameVod_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.videos.length;
    AGameVod_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) AGameVod_dataEnded = true;

    var offset_itemsCount = AGameVod_itemsCount;
    AGameVod_itemsCount += response_items;

    AGameVod_emptyContent = !AGameVod_itemsCount;

    var response_rows = response_items / Main_ColoumnsCountVideo;
    if (response_items % Main_ColoumnsCountVideo > 0) response_rows++;

    var coloumn_id, row_id, row, video, id,
        cursor = 0;

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main_ColoumnsCountVideo + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main_ColoumnsCountVideo && cursor < response_items; coloumn_id++, cursor++) {
            video = response.videos[cursor];
            id = video._id;
            //video content can be null sometimes the preview will 404_processing
            if ((JSON.stringify(video.preview) + '').indexOf('404_processing') !== -1 || AGameVod_idObject[id]) coloumn_id--;
            else {
                AGameVod_idObject[id] = 1;
                row.appendChild(Vod_createCell(row_id, row_id + '_' + coloumn_id,
                    id + ',' + video.length + ',' + video.language + ',' +
                    video.game + ',' + video.channel.name, [video.preview.replace("320x240", Main_VideoSize),
                        video.channel.display_name, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                        video.title + STR_BR + STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) + STR_VIEWS,
                        Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.language),
                        STR_DURATION + Play_timeS(video.length)
                    ], AGameVod_ids));
            }
        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountVideo; coloumn_id++) {
            if (AGameVod_dataEnded && !AGameVod_itemsCountCheck) {
                AGameVod_itemsCountCheck = true;
                AGameVod_itemsCount = (row_id * Main_ColoumnsCountVideo) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(AGameVod_ids[9] + row_id + '_' + coloumn_id));
            AGameVod_emptyCellVector.push(AGameVod_ids[9] + row_id + '_' + coloumn_id);
        }
        document.getElementById("stream_table_a_game_vod").appendChild(row);
    }

    AGameVod_loadDataSuccessFinish();
}

function AGameVod_loadDataSuccessFinish() {
    Main_ready(function() {
        if (!AGameVod_status) {
            Main_HideLoadDialog();
            if (AGameVod_emptyContent) Main_showWarningDialog(STR_NO + (AGameVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_FOR_THIS + STR_CHANNEL);
            else {
                AGameVod_status = true;
                Main_imgVectorLoad(IMG_404_VIDEO);
                AGameVod_addFocus();
            }
            Main_ShowElement(AGameVod_ids[10]);
            AGameVod_FirstLoad = false;
        } else {
            Main_imgVectorLoad(IMG_404_VIDEO);
            if (AGameVod_emptyCellVector.length > 0 && !AGameVod_dataEnded) {
                AGameVod_loadDataPrepare();
                AGameVod_loadDataReplace();
                return;
            } else AGameVod_emptyCellVector = [];
        }
        AGameVod_loadingData = false;
    });
}

function AGameVod_loadDataReplace() {
    try {

        var xmlHttp = new XMLHttpRequest();

        Main_SetItemsLimitReplace(AGameVod_emptyCellVector.length);

        var offset = AGameVod_itemsCount + AGameVod_itemsCountOffset;
        if (offset && offset > (AGameVod_MaxOffset - 1)) {
            offset = AGameVod_MaxOffset - Main_ItemsLimitReplace;
            AGameVod_dataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/videos/top?game=' +
            encodeURIComponent(Main_gameSelected) + '&limit=' + Main_ItemsLimitReplace +
            '&broadcast_type=' + (AGameVod_highlight ? 'highlight' : 'archive') + '&sort=views&offset=' + offset +
            '&period=' + AGameVod_period + '&' + Math.round(Math.random() * 1e7), true);

        xmlHttp.timeout = AGameVod_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    AGameVod_loadDataSuccessReplace(xmlHttp.responseText);
                    return;
                } else AGameVod_loadDataErrorReplace();
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AGameVod_loadDataErrorReplace();
    }
}

function AGameVod_loadDataErrorReplace() {
    AGameVod_loadingDataTry++;
    if (AGameVod_loadingDataTry < AGameVod_loadingDataTryMax) {
        AGameVod_loadingDataTimeout += 500;
        AGameVod_loadDataReplace();
    } else {
        AGameVod_dataEnded = true;
        AGameVod_emptyCellVector = [];
        AGameVod_loadDataSuccessFinish();
    }
}


function AGameVod_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText),
        response_items = response.videos.length,
        video, id, i = 0,
        cursor = 0,
        tempVector = [];

    AGameVod_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitReplace) AGameVod_dataEnded = true;

    for (i; i < AGameVod_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        video = response.videos[cursor];
        id = video._id;
        if ((JSON.stringify(video.preview) + '').indexOf('404_processing') !== -1 || AGameVod_idObject[id]) i--;
        else {
            AGameVod_idObject[id] = 1;
            Vod_replaceVideo(AGameVod_emptyCellVector[i],
                id + ',' + video.length + ',' + video.language + ',' +
                video.game + ',' + video.channel.name, [video.preview.replace("320x240", Main_VideoSize),
                    video.channel.display_name, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                    video.title + STR_BR + STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) + STR_VIEWS,
                    Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.language),
                    STR_DURATION + Play_timeS(video.length)
                ], AGameVod_ids);

            tempVector.push(i);
        }
    }

    for (i = tempVector.length - 1; i > -1; i--) AGameVod_emptyCellVector.splice(tempVector[i], 1);

    AGameVod_itemsCountOffset += cursor;
    if (AGameVod_dataEnded) {
        AGameVod_itemsCount -= AGameVod_emptyCellVector.length;
        AGameVod_emptyCellVector = [];
    }

    AGameVod_loadDataSuccessFinish();
}

function AGameVod_addFocus() {
    Main_addFocusVideo(AGameVod_cursorY, AGameVod_cursorX, AGameVod_ids, Main_ColoumnsCountVideo, AGameVod_itemsCount);

    if (((AGameVod_cursorY + Main_ItemsReloadLimitVideo) > (AGameVod_itemsCount / Main_ColoumnsCountVideo)) &&
        !AGameVod_dataEnded && !AGameVod_loadingData) {
        AGameVod_loadDataPrepare();
        AGameVod_loadDataRequest();
    }
}

function AGameVod_removeFocus() {
    Main_removeFocus(AGameVod_cursorY + '_' + AGameVod_cursorX, AGameVod_ids);
}

function AGameVod_handleKeyDown(event) {
    if (AGameVod_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                Main_Go = Main_aGame;
                AGameVod_exit();
                Main_SwitchScreen();
            }
            break;
        case KEY_LEFT:
            if (Main_ThumbNull((AGameVod_cursorY), (AGameVod_cursorX - 1), AGameVod_ids[0])) {
                AGameVod_removeFocus();
                AGameVod_cursorX--;
                AGameVod_addFocus();
            } else {
                for (i = (Main_ColoumnsCountVideo - 1); i > -1; i--) {
                    if (Main_ThumbNull((AGameVod_cursorY - 1), i, AGameVod_ids[0])) {
                        AGameVod_removeFocus();
                        AGameVod_cursorY--;
                        AGameVod_cursorX = i;
                        AGameVod_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (Main_ThumbNull((AGameVod_cursorY), (AGameVod_cursorX + 1), AGameVod_ids[0])) {
                AGameVod_removeFocus();
                AGameVod_cursorX++;
                AGameVod_addFocus();
            } else if (Main_ThumbNull((AGameVod_cursorY + 1), 0, AGameVod_ids[0])) {
                AGameVod_removeFocus();
                AGameVod_cursorY++;
                AGameVod_cursorX = 0;
                AGameVod_addFocus();
            }
            break;
        case KEY_UP:
            for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                if (Main_ThumbNull((AGameVod_cursorY - 1), (AGameVod_cursorX - i), AGameVod_ids[0])) {
                    AGameVod_removeFocus();
                    AGameVod_cursorY--;
                    AGameVod_cursorX = AGameVod_cursorX - i;
                    AGameVod_addFocus();
                    break;
                }
            }
            break;
        case KEY_DOWN:
            for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                if (Main_ThumbNull((AGameVod_cursorY + 1), (AGameVod_cursorX - i), AGameVod_ids[0])) {
                    AGameVod_removeFocus();
                    AGameVod_cursorY++;
                    AGameVod_cursorX = AGameVod_cursorX - i;
                    AGameVod_addFocus();
                    break;
                }
            }
            break;
        case KEY_CHANNELUP:
            AGameVod_periodNumber++;
            if (AGameVod_periodNumber > 4) AGameVod_periodNumber = 1;
            AGameVod_StartLoad();
            break;
        case KEY_CHANNELDOWN:
            AGameVod_periodNumber--;
            if (AGameVod_periodNumber < 1) AGameVod_periodNumber = 4;
            AGameVod_StartLoad();
            break;
        case KEY_INFO:
        case KEY_CHANNELGUIDE:
            AGameVod_highlight = !AGameVod_highlight;
            localStorage.setItem('AGameVod_highlight', AGameVod_highlight ? 'true' : 'false');
            AGameVod_StartLoad();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            ChannelVod_vodId = document.getElementById(AGameVod_ids[8] + AGameVod_cursorY + '_' + AGameVod_cursorX).getAttribute(Main_DataAttribute).split(',');
            ChannelVod_DurationSeconds = parseInt(ChannelVod_vodId[1]);
            ChannelVod_language = ChannelVod_vodId[2];
            Play_gameSelected = ChannelVod_vodId[3];
            Main_selectedChannel = ChannelVod_vodId[4];
            ChannelVod_vodId = ChannelVod_vodId[0].substr(1);

            ChannelVod_title = '';
            Main_selectedChannelDisplayname = document.getElementById(AGameVod_ids[3] + AGameVod_cursorY + '_' + AGameVod_cursorX).textContent;
            ChannelVod_createdAt = document.getElementById(AGameVod_ids[4] + AGameVod_cursorY + '_' + AGameVod_cursorX).textContent;
            ChannelVod_Duration = document.getElementById(AGameVod_ids[5] + AGameVod_cursorY + '_' + AGameVod_cursorX).textContent;
            ChannelVod_views = document.getElementById(AGameVod_ids[11] + AGameVod_cursorY + '_' + AGameVod_cursorX).innerHTML +
                ', ' + document.getElementById(AGameVod_ids[6] + AGameVod_cursorY + '_' + AGameVod_cursorX).textContent;
            AGameVod_openStream();
            break;
        case KEY_RED:
            Main_showAboutDialog();
            break;
        case KEY_GREEN:
            AGameVod_exit();
            Main_GoLive();
            break;
        case KEY_YELLOW:
            Main_showControlsDialog();
            break;
        case KEY_BLUE:
            if (!Search_isSearching) Main_BeforeSearch = Main_AGameVod;
            Main_Go = Main_Search;
            AGameVod_exit();
            Main_SwitchScreen();
            break;
        default:
            break;
    }
}

function AGameVod_openStream() {
    document.body.addEventListener("keydown", PlayVod_handleKeyDown, false);
    document.body.removeEventListener("keydown", AGameVod_handleKeyDown);
    Main_ShowElement('scene2');
    PlayVod_hidePanel();
    Play_hideChat();
    Play_clearPause();
    Play_HideWarningDialog();
    Play_CleanHideExit();
    Vod_isVod = true;
    Main_HideElement('scene1');
    PlayVod_Start();
}

function AGameVod_SetPeriod() {
    if (AGameVod_periodNumber === 1) {
        Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter((AGameVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_DAY + ': ' + Main_gameSelected));
        AGameVod_period = 'day';
    } else if (AGameVod_periodNumber === 2) {
        Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter((AGameVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_WEEK + ': ' + Main_gameSelected));
        AGameVod_period = 'week';
    } else if (AGameVod_periodNumber === 3) {
        Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter((AGameVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_MONTH + ': ' + Main_gameSelected));
        AGameVod_period = 'month';
    } else if (AGameVod_periodNumber === 4) {
        Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter((AGameVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_ALL + ': ' + Main_gameSelected));
        AGameVod_period = 'all';
    }
    localStorage.setItem('AGameVod_periodNumber', AGameVod_periodNumber);
}
