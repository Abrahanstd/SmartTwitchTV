//Variable initialization
var ChannelVod_cursorY = 0;
var ChannelVod_cursorX = 0;
var ChannelVod_dataEnded = false;
var ChannelVod_itemsCount = 0;
var ChannelVod_idObject = {};
var ChannelVod_emptyCellVector = [];
var ChannelVod_loadingData = false;
var ChannelVod_loadingDataTry = 0;
var ChannelVod_loadingDataTryMax = 5;
var ChannelVod_loadingDataTimeout = 3500;
var ChannelVod_itemsCountOffset = 0;
var ChannelVod_ReplacedataEnded = false;
var ChannelVod_MaxOffset = 0;
var ChannelVod_DurationSeconds = 0;
var ChannelVod_emptyContent = false;
var ChannelVod_itemsCountCheck = false;
var ChannelVod_language = '';

var ChannelVod_ids = ['cv_thumbdiv', 'cv_img', 'cv_infodiv', 'cv_title', 'cv_streamon', 'cv_duration', 'cv_viwers', 'cv_quality', 'cv_cell', 'svempty_', 'cvod_scroll', 'cv_game'];
var ChannelVod_status = false;
var ChannelVod_highlight = false;
var ChannelVod_lastselectedChannel = '';
var ChannelVod_vodId = '';
var ChannelVod_title = '';
var ChannelVod_views = '';
var ChannelVod_createdAt = '';
var ChannelVod_Duration = '';
var ChannelVod_vodOffset = 0;
var ChannelVod_FirstLoad = false;
//Variable initialization end

function ChannelVod_init() {
    Main_Go = Main_ChannelVod;
    if (Main_selectedChannel !== ChannelVod_lastselectedChannel) ChannelVod_status = false;
    Main_cleanTopLabel();
    Main_IconLoad('label_switch', 'icon-switch', STR_SWITCH_VOD + STR_KEY_UP_DOWN);
    Main_textContent('top_bar_user', Main_selectedChannelDisplayname);
    document.body.addEventListener("keydown", ChannelVod_handleKeyDown, false);
    Main_YRst(ChannelVod_cursorY);
    if (ChannelVod_status) {
        Main_textContent('top_bar_game', ChannelVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA);
        Main_ShowElement(ChannelVod_ids[10]);
        Main_CounterDialog(ChannelVod_cursorX, ChannelVod_cursorY, Main_ColoumnsCountVideo, ChannelVod_itemsCount);
    } else ChannelVod_StartLoad();
}

function ChannelVod_exit() {
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", ChannelVod_handleKeyDown);
    Main_HideElement(ChannelVod_ids[10]);
}

function ChannelVod_StartLoad() {
    Main_textContent('top_bar_game', ChannelVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA);
    Main_HideElement(ChannelVod_ids[10]);
    Main_showLoadDialog();
    Main_HideWarningDialog();
    ChannelVod_lastselectedChannel = Main_selectedChannel;
    ChannelVod_status = false;
    Main_empty('stream_table_channel_vod');
    ChannelVod_itemsCountOffset = 0;
    ChannelVod_ReplacedataEnded = false;
    ChannelVod_MaxOffset = 0;
    ChannelVod_idObject = {};
    ChannelVod_emptyCellVector = [];
    ChannelVod_itemsCountCheck = false;
    ChannelVod_FirstLoad = true;
    ChannelVod_itemsCount = 0;
    ChannelVod_cursorX = 0;
    ChannelVod_cursorY = 0;
    ChannelVod_dataEnded = false;
    Main_CounterDialogRst();
    ChannelVod_loadDataPrepare();
    ChannelVod_loadDataRequest();
}

function ChannelVod_loadDataPrepare() {
    Main_imgVectorRst();
    ChannelVod_loadingData = true;
    ChannelVod_loadingDataTry = 0;
    ChannelVod_loadingDataTimeout = 3500;
}

function ChannelVod_loadDataRequest() {
    try {

        var xmlHttp = new XMLHttpRequest();

        var offset = ChannelVod_itemsCount + ChannelVod_itemsCountOffset;
        if (offset && offset > (ChannelVod_MaxOffset - 1)) {
            offset = ChannelVod_MaxOffset - Main_ItemsLimitVideo;
            ChannelVod_dataEnded = true;
            ChannelVod_ReplacedataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/channels/' +
            encodeURIComponent(Main_selectedChannel) + '/videos?limit=' + Main_ItemsLimitVideo +
            '&broadcast_type=' + (ChannelVod_highlight ? 'highlight' : 'archive') + '&sort=time&offset=' + offset + '&' +
            Math.round(Math.random() * 1e7), true);

        xmlHttp.timeout = ChannelVod_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    ChannelVod_loadDataSuccess(xmlHttp.responseText);
                    return;
                } else {
                    ChannelVod_loadDataError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        ChannelVod_loadDataError();
    }
}

function ChannelVod_loadDataError() {
    ChannelVod_loadingDataTry++;
    if (ChannelVod_loadingDataTry < ChannelVod_loadingDataTryMax) {
        ChannelVod_loadingDataTimeout += 500;
        ChannelVod_loadDataRequest();
    } else {
        ChannelVod_loadingData = false;
        Main_HideLoadDialog();
        Main_showWarningDialog(STR_REFRESH_PROBLEM);
    }
}

function ChannelVod_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.videos.length;
    ChannelVod_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) ChannelVod_dataEnded = true;

    var offset_itemsCount = ChannelVod_itemsCount;
    ChannelVod_itemsCount += response_items;

    ChannelVod_emptyContent = !ChannelVod_itemsCount;

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
            //video content can be null sometimes the preview will 404
            if ((JSON.stringify(video.preview) + '').indexOf('404_processing') !== -1 || ChannelVod_idObject[id]) coloumn_id--;
            else {
                ChannelVod_idObject[id] = 1;
                row.appendChild(Vod_createCell(row_id, row_id + '_' + coloumn_id,
                    id + ',' + video.length + ',' + video.language + ',' + video.game, [video.preview.replace("320x240", Main_VideoSize),
                        video.title, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                        STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) + STR_VIEWS,
                        Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.language),
                        STR_DURATION + Play_timeS(video.length)
                    ], ChannelVod_ids));
            }
        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountVideo; coloumn_id++) {
            if (ChannelVod_dataEnded && !ChannelVod_itemsCountCheck) {
                ChannelVod_itemsCountCheck = true;
                ChannelVod_itemsCount = (row_id * Main_ColoumnsCountVideo) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(ChannelVod_ids[9] + row_id + '_' + coloumn_id));
            ChannelVod_emptyCellVector.push(ChannelVod_ids[9] + row_id + '_' + coloumn_id);
        }
        document.getElementById("stream_table_channel_vod").appendChild(row);
    }

    ChannelVod_loadDataSuccessFinish();
}

function ChannelVod_loadDataSuccessFinish() {
    Main_ready(function() {
        if (!ChannelVod_status) {
            Main_HideLoadDialog();
            if (ChannelVod_emptyContent) Main_showWarningDialog(STR_NO + (ChannelVod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_FOR_THIS + STR_CHANNEL);
            else {
                ChannelVod_status = true;
                Main_imgVectorLoad(IMG_404_VIDEO);
                ChannelVod_addFocus();
            }
            Main_ShowElement(ChannelVod_ids[10]);
            ChannelVod_FirstLoad = false;
        } else {
            Main_imgVectorLoad(IMG_404_VIDEO);
            if (ChannelVod_emptyCellVector.length > 0 && !ChannelVod_dataEnded) {
                ChannelVod_loadDataPrepare();
                ChannelVod_loadDataReplace();
                return;
            } else ChannelVod_emptyCellVector = [];
        }
        ChannelVod_loadingData = false;
    });
}

function ChannelVod_loadDataReplace() {
    try {

        var xmlHttp = new XMLHttpRequest();

        Main_SetItemsLimitReplace(ChannelVod_emptyCellVector.length);

        var offset = ChannelVod_itemsCount + ChannelVod_itemsCountOffset;

        if (offset && offset > (ChannelVod_MaxOffset - 1)) {
            offset = ChannelVod_MaxOffset - Main_ItemsLimitReplace;
            ChannelVod_ReplacedataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/channels/' +
            encodeURIComponent(Main_selectedChannel) + '/videos?limit=' + Main_ItemsLimitReplace + '&broadcast_type=' +
            (ChannelVod_highlight ? 'highlight' : 'archive') + '&sort=time&offset=' + offset + '&' +
            Math.round(Math.random() * 1e7), true);

        xmlHttp.timeout = ChannelVod_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    ChannelVod_loadDataSuccessReplace(xmlHttp.responseText);
                    return;
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        ChannelVod_loadDataErrorReplace();
    }
}

function ChannelVod_loadDataErrorReplace() {
    ChannelVod_loadingDataTry++;
    if (ChannelVod_loadingDataTry < ChannelVod_loadingDataTryMax) {
        ChannelVod_loadingDataTimeout += 500;
        ChannelVod_loadDataReplace();
    } else {
        ChannelVod_ReplacedataEnded = true;
        ChannelVod_emptyCellVector = [];
        ChannelVod_loadDataSuccessFinish();
    }
}


function ChannelVod_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.videos.length;
    var video, index, id, cursor = 0;
    var tempVector = ChannelVod_emptyCellVector.slice();

    ChannelVod_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) ChannelVod_ReplacedataEnded = true;

    for (var i = 0; i < ChannelVod_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        video = response.videos[cursor];
        id = video._id;
        if ((JSON.stringify(video.preview) + '').indexOf('404_processing') !== -1 || ChannelVod_idObject[id]) i--;
        else {
            ChannelVod_idObject[id] = 1;
            Vod_replaceVideo(ChannelVod_emptyCellVector[i], id + ',' + video.length + ',' + video.language + ',' + video.game, [video.preview.replace("320x240", Main_VideoSize),
                video.title, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) + STR_VIEWS,
                Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.language),
                STR_DURATION + Play_timeS(video.length)
            ], ChannelVod_ids);

            index = tempVector.indexOf(tempVector[i]);
            if (index > -1) tempVector.splice(index, 1);
        }
    }

    ChannelVod_itemsCountOffset += cursor;
    if (ChannelVod_ReplacedataEnded) ChannelVod_emptyCellVector = [];
    else ChannelVod_emptyCellVector = tempVector;

    ChannelVod_loadDataSuccessFinish();
}

function ChannelVod_addFocus() {
    Main_addFocusVideo(ChannelVod_cursorY, ChannelVod_cursorX, ChannelVod_ids, Main_ColoumnsCountVideo, ChannelVod_itemsCount);

    if (((ChannelVod_cursorY + Main_ItemsReloadLimitVideo) > (ChannelVod_itemsCount / Main_ColoumnsCountVideo)) &&
        !ChannelVod_dataEnded && !ChannelVod_loadingData) {
        ChannelVod_loadDataPrepare();
        ChannelVod_loadDataRequest();
    }
}

function ChannelVod_removeFocus() {
    Main_removeFocus(ChannelVod_cursorY + '_' + ChannelVod_cursorX, ChannelVod_ids);
}

function ChannelVod_handleKeyDown(event) {
    if (ChannelVod_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                Main_Go = Main_ChannelContent;
                ChannelVod_exit();
                Main_SwitchScreen();
            }
            break;
        case KEY_LEFT:
            if (Main_ThumbNull((ChannelVod_cursorY), (ChannelVod_cursorX - 1), ChannelVod_ids[0])) {
                ChannelVod_removeFocus();
                ChannelVod_cursorX--;
                ChannelVod_addFocus();
            } else {
                for (i = (Main_ColoumnsCountVideo - 1); i > -1; i--) {
                    if (Main_ThumbNull((ChannelVod_cursorY - 1), i, ChannelVod_ids[0])) {
                        ChannelVod_removeFocus();
                        ChannelVod_cursorY--;
                        ChannelVod_cursorX = i;
                        ChannelVod_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (Main_ThumbNull((ChannelVod_cursorY), (ChannelVod_cursorX + 1), ChannelVod_ids[0])) {
                ChannelVod_removeFocus();
                ChannelVod_cursorX++;
                ChannelVod_addFocus();
            } else if (Main_ThumbNull((ChannelVod_cursorY + 1), 0, ChannelVod_ids[0])) {
                ChannelVod_removeFocus();
                ChannelVod_cursorY++;
                ChannelVod_cursorX = 0;
                ChannelVod_addFocus();
            }
            break;
        case KEY_UP:
            for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                if (Main_ThumbNull((ChannelVod_cursorY - 1), (ChannelVod_cursorX - i), ChannelVod_ids[0])) {
                    ChannelVod_removeFocus();
                    ChannelVod_cursorY--;
                    ChannelVod_cursorX = ChannelVod_cursorX - i;
                    ChannelVod_addFocus();
                    break;
                }
            }
            break;
        case KEY_DOWN:
            for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                if (Main_ThumbNull((ChannelVod_cursorY + 1), (ChannelVod_cursorX - i), ChannelVod_ids[0])) {
                    ChannelVod_removeFocus();
                    ChannelVod_cursorY++;
                    ChannelVod_cursorX = ChannelVod_cursorX - i;
                    ChannelVod_addFocus();
                    break;
                }
            }
            break;
        case KEY_CHANNELUP:
        case KEY_CHANNELDOWN:
            ChannelVod_highlight = !ChannelVod_highlight;
            localStorage.setItem('ChannelVod_highlight', ChannelVod_highlight ? 'true' : 'false');
            ChannelVod_StartLoad();
            break;
        case KEY_INFO:
        case KEY_CHANNELGUIDE:
            ChannelVod_StartLoad();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            ChannelVod_vodId = document.getElementById(ChannelVod_ids[8] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).getAttribute(Main_DataAttribute).split(',');
            ChannelVod_DurationSeconds = parseInt(ChannelVod_vodId[1]);
            ChannelVod_language = ChannelVod_vodId[2];
            Play_gameSelected = ChannelVod_vodId[3];
            ChannelVod_vodId = ChannelVod_vodId[0].substr(1);

            ChannelVod_title = document.getElementById(ChannelVod_ids[3] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).textContent;
            ChannelVod_createdAt = document.getElementById(ChannelVod_ids[4] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).textContent;
            ChannelVod_Duration = document.getElementById(ChannelVod_ids[5] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).textContent;
            ChannelVod_views = document.getElementById(ChannelVod_ids[11] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).textContent +
                ', ' + document.getElementById(ChannelVod_ids[6] + ChannelVod_cursorY + '_' + ChannelVod_cursorX).textContent;
            ChannelVod_openStream();
            break;
        case KEY_RED:
            Main_showAboutDialog();
            break;
        case KEY_GREEN:
            ChannelVod_exit();
            Main_GoLive();
            break;
        case KEY_YELLOW:
            Main_showControlsDialog();
            break;
        case KEY_BLUE:
            if (!Search_isSearching) Main_BeforeSearch = Main_ChannelVod;
            Main_Go = Main_Search;
            ChannelVod_exit();
            Main_SwitchScreen();
            break;
        default:
            break;
    }
}

function ChannelVod_openStream() {
    document.body.addEventListener("keydown", PlayVod_handleKeyDown, false);
    document.body.removeEventListener("keydown", ChannelVod_handleKeyDown);
    Main_ShowElement('scene2');
    PlayVod_hidePanel();
    Play_hideChat();
    Play_clearPause();
    Play_HideWarningDialog();
    Play_CleanHideExit();
    Main_HideElement('scene1');
    PlayVod_Start();
}