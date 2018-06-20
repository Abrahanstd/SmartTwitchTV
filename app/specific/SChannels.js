//Variable initialization
var SChannels_cursorY = 0;
var SChannels_cursorX = 0;
var SChannels_dataEnded = false;
var SChannels_itemsCount = 0;
var SChannels_idObject = {};
var SChannels_emptyCellVector = [];
var SChannels_loadingData = false;
var SChannels_loadingDataTry = 0;
var SChannels_loadingDataTryMax = 5;
var SChannels_loadingDataTimeout = 3500;
var SChannels_itemsCountOffset = 0;
var SChannels_ReplacedataEnded = false;
var SChannels_MaxOffset = 0;
var SChannels_emptyContent = false;
var SChannels_Status = false;
var SChannels_lastData = '';
var SChannels_itemsCountCheck = false;
var SChannels_isLastSChannels = false;

var SChannels_ids = ['sc_thumbdiv', 'sc_img', 'sc_infodiv', 'sc_displayname', 'sc_cell', 'scempty_'];
//Variable initialization end

function SChannels_init() {
    Main_Go = Main_SChannels;
    SChannels_isLastSChannels = true;
    Search_isSearching = true;
    if (SChannels_lastData !== Search_data) SChannels_Status = false;
    Main_cleanTopLabel();
    Main_innerHTML('top_bar_user', STR_SEARCH + Main_UnderCenter(STR_CHANNELS + ' ' + "'" + Search_data + "'"));
    document.body.addEventListener("keydown", SChannels_handleKeyDown, false);
    Main_YRst(SChannels_cursorY);
    if (SChannels_Status) {
        Main_ScrollHelperChannel(SChannels_ids[0], SChannels_cursorY, SChannels_cursorX);
        Main_CounterDialog(SChannels_cursorX, SChannels_cursorY, Main_ColoumnsCountChannel, SChannels_itemsCount);
    } else SChannels_StartLoad();
}

function SChannels_exit() {
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", SChannels_handleKeyDown);
}

function SChannels_Postexit() {
    Main_SwitchScreen();
}

function SChannels_StartLoad() {
    SChannels_lastData = Search_data;
    Main_HideWarningDialog();
    SChannels_Status = false;
    Main_ScrollHelperBlank('blank_focus');
    Main_showLoadDialog();
    Main_empty('stream_table_search_channel');
    SChannels_itemsCountOffset = 0;
    SChannels_ReplacedataEnded = false;
    SChannels_MaxOffset = 0;
    SChannels_idObject = {};
    SChannels_emptyCellVector = [];
    SChannels_itemsCountCheck = false;
    SChannels_itemsCount = 0;
    SChannels_cursorX = 0;
    SChannels_cursorY = 0;
    SChannels_dataEnded = false;
    Main_CounterDialogRst();
    SChannels_loadDataPrepare();
    SChannels_loadDataRequest();
}

function SChannels_loadDataPrepare() {
    SChannels_loadingData = true;
    SChannels_loadingDataTry = 0;
    SChannels_loadingDataTimeout = 3500;
}

function SChannels_loadDataRequest() {
    try {

        var xmlHttp = new XMLHttpRequest();

        var offset = SChannels_itemsCount + SChannels_itemsCountOffset;
        if (offset && offset > (SChannels_MaxOffset - 1)) {
            offset = SChannels_MaxOffset - Main_ItemsLimitChannel;
            SChannels_dataEnded = true;
            SChannels_ReplacedataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/search/channels?query=' + encodeURIComponent(Search_data) +
            '&limit=' + Main_ItemsLimitChannel + '&offset=' + offset + '&' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = SChannels_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    SChannels_loadDataSuccess(xmlHttp.responseText);
                    return;
                } else {
                    SChannels_loadDataError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        SChannels_loadDataError();
    }
}

function SChannels_loadDataError() {
    SChannels_loadingDataTry++;
    if (SChannels_loadingDataTry < SChannels_loadingDataTryMax) {
        SChannels_loadingDataTimeout += (SChannels_loadingDataTry < 5) ? 250 : 3500;
        SChannels_loadDataRequest();
    } else {
        SChannels_loadingData = false;
        Main_HideLoadDialog();
        Main_showWarningDialog(STR_REFRESH_PROBLEM);
    }
}

function SChannels_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.channels.length;
    SChannels_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitChannel) SChannels_dataEnded = true;

    var offset_itemsCount = SChannels_itemsCount;
    SChannels_itemsCount += response_items;

    SChannels_emptyContent = !SChannels_itemsCount;

    var response_rows = response_items / Main_ColoumnsCountChannel;
    if (response_items % Main_ColoumnsCountChannel > 0) response_rows++;

    var coloumn_id, row_id, row, channels, id,
        cursor = 0;

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main_ColoumnsCountChannel + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main_ColoumnsCountChannel && cursor < response_items; coloumn_id++, cursor++) {
            channels = response.channels[cursor];
            id = channels._id;
            if (SChannels_idObject[id]) coloumn_id--;
            else {
                SChannels_idObject[id] = 1;
                row.appendChild(SChannels_createCell(row_id, row_id + '_' + coloumn_id, [channels.name, id, channels.logo, channels.display_name]));
            }

        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountChannel; coloumn_id++) {
            if (SChannels_dataEnded && !SChannels_itemsCountCheck) {
                SChannels_itemsCountCheck = true;
                SChannels_itemsCount = (row_id * Main_ColoumnsCountChannel) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(SChannels_ids[5] + row_id + '_' + coloumn_id));
            SChannels_emptyCellVector.push(SChannels_ids[5] + row_id + '_' + coloumn_id);
        }
        document.getElementById('stream_table_search_channel').appendChild(row);
    }

    SChannels_loadDataSuccessFinish();
}


function SChannels_createCell(row_id, id, valuesArray) {
    if (row_id < 4) Main_PreLoadAImage(valuesArray[2]); //try to pre cache first 4 rows
    return Main_createCellChannel(id, SChannels_ids, valuesArray);
}

function SChannels_loadDataSuccessFinish() {
    Main_ready(function() {
        if (!SChannels_Status) {
            Main_HideLoadDialog();
            if (SChannels_emptyContent) Main_showWarningDialog(STR_SEARCH_RESULT_EMPTY);
            else {
                SChannels_Status = true;
                SChannels_addFocus();
                Main_LazyImgStart(SChannels_ids[1], 7, IMG_404_LOGO, Main_ColoumnsCountChannel);
            }
        } else {
            if (SChannels_emptyCellVector.length > 0 && !SChannels_dataEnded) {
                SChannels_loadDataPrepare();
                SChannels_loadDataReplace();
                return;
            } else SChannels_emptyCellVector = [];
        }
        SChannels_loadingData = false;
    });
}

function SChannels_loadDataReplace() {
    try {

        var xmlHttp = new XMLHttpRequest();

        Main_SetItemsLimitReplace(SChannels_emptyCellVector.length);

        var offset = SChannels_itemsCount + SChannels_itemsCountOffset;
        if (offset && offset > (SChannels_MaxOffset - 1)) {
            offset = SChannels_MaxOffset - Main_ItemsLimitReplace;
            SChannels_ReplacedataEnded = true;
        }

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/search/channels?query=' + encodeURIComponent(Search_data) +
            '&limit=' + Main_ItemsLimitReplace + '&offset=' + offset + '&' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = SChannels_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    SChannels_loadDataSuccessReplace(xmlHttp.responseText);
                    return;
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        SChannels_loadDataErrorReplace();
    }
}

function SChannels_loadDataErrorReplace() {
    SChannels_loadingDataTry++;
    if (SChannels_loadingDataTry < SChannels_loadingDataTryMax) {
        SChannels_loadingDataTimeout += (SChannels_loadingDataTry < 5) ? 250 : 3500;
        SChannels_loadDataReplace();
    } else {
        SChannels_ReplacedataEnded = true;
        SChannels_emptyCellVector = [];
        SChannels_loadDataSuccessFinish();
    }
}

function SChannels_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.channels.length;
    var channels, index, id, cursor = 0;
    var tempVector = SChannels_emptyCellVector.slice();

    SChannels_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) SChannels_ReplacedataEnded = true;

    for (var i = 0; i < SChannels_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        channels = response.channels[cursor];
        id = channels._id;
        if (SChannels_idObject[id]) i--;
        else {
            SChannels_idObject[id] = 1;
            Main_replaceChannel(SChannels_emptyCellVector[i], [channels.name, id, channels.logo, channels.display_name], SChannels_ids);

            index = tempVector.indexOf(tempVector[i]);
            if (index > -1) {
                tempVector.splice(index, 1);
            }
        }
    }

    SChannels_itemsCountOffset += cursor;
    if (SChannels_ReplacedataEnded) SChannels_emptyCellVector = [];
    else SChannels_emptyCellVector = tempVector;

    SChannels_loadDataSuccessFinish();
}

function SChannels_addFocus() {
    Main_addFocusChannel(SChannels_cursorY, SChannels_cursorX, SChannels_ids, Main_ColoumnsCountChannel, SChannels_itemsCount);

    if (SChannels_cursorY > 2) Main_LazyImg(SChannels_ids[1], SChannels_cursorY, IMG_404_LOGO, Main_ColoumnsCountChannel, 3);

    if (((SChannels_cursorY + Main_ItemsReloadLimitChannel) > (SChannels_itemsCount / Main_ColoumnsCountChannel)) &&
        !SChannels_dataEnded && !SChannels_loadingData) {
        SChannels_loadDataPrepare();
        SChannels_loadDataRequest();
    }
}

function SChannels_removeFocus() {
    Main_removeFocus(SChannels_cursorY + '_' + SChannels_cursorX, SChannels_ids);
}

function SChannels_handleKeyDown(event) {
    if (SChannels_loadingData || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                if (Main_Go === Main_BeforeSearch) Main_Go = Main_Live;
                else Main_Go = Main_BeforeSearch;
                SChannels_exit();
                Search_isSearching = false;
                SChannels_Postexit();
            }
            break;
        case KEY_LEFT:
            if (Main_ThumbNull((SChannels_cursorY), (SChannels_cursorX - 1), SChannels_ids[0])) {
                SChannels_removeFocus();
                SChannels_cursorX--;
                SChannels_addFocus();
            } else {
                for (i = (Main_ColoumnsCountChannel - 1); i > -1; i--) {
                    if (Main_ThumbNull((SChannels_cursorY - 1), i, SChannels_ids[0])) {
                        SChannels_removeFocus();
                        SChannels_cursorY--;
                        SChannels_cursorX = i;
                        SChannels_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (Main_ThumbNull((SChannels_cursorY), (SChannels_cursorX + 1), SChannels_ids[0])) {
                SChannels_removeFocus();
                SChannels_cursorX++;
                SChannels_addFocus();
            } else if (Main_ThumbNull((SChannels_cursorY + 1), 0, SChannels_ids[0])) {
                SChannels_removeFocus();
                SChannels_cursorY++;
                SChannels_cursorX = 0;
                SChannels_addFocus();
            }
            break;
        case KEY_UP:
            for (i = 0; i < Main_ColoumnsCountChannel; i++) {
                if (Main_ThumbNull((SChannels_cursorY - 1), (SChannels_cursorX - i), SChannels_ids[0])) {
                    SChannels_removeFocus();
                    SChannels_cursorY--;
                    SChannels_cursorX = SChannels_cursorX - i;
                    SChannels_addFocus();
                    break;
                }
            }
            break;
        case KEY_DOWN:
            for (i = 0; i < Main_ColoumnsCountChannel; i++) {
                if (Main_ThumbNull((SChannels_cursorY + 1), (SChannels_cursorX - i), SChannels_ids[0])) {
                    SChannels_removeFocus();
                    SChannels_cursorY++;
                    SChannels_cursorX = SChannels_cursorX - i;
                    SChannels_addFocus();
                    break;
                }
            }
            break;
        case KEY_INFO:
        case KEY_CHANNELGUIDE:
            SChannels_StartLoad();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            Main_selectedChannel = document.getElementById(SChannels_ids[4] + SChannels_cursorY + '_' + SChannels_cursorX).getAttribute(Main_DataAttribute);
            Main_selectedChannel_id = document.getElementById(SChannels_ids[4] + SChannels_cursorY + '_' + SChannels_cursorX).getAttribute('data-id');
            Main_selectedChannelDisplayname = document.getElementById(SChannels_ids[3] + SChannels_cursorY + '_' + SChannels_cursorX).textContent;
            Main_selectedChannelLogo = document.getElementById(SChannels_ids[1] + SChannels_cursorY + '_' + SChannels_cursorX).src;
            document.body.removeEventListener("keydown", SChannels_handleKeyDown);
            Main_BeforeChannel = Main_SChannels;
            Main_Go = Main_SChannelContent;
            Main_BeforeChannelisSet = true;
            AddCode_IsFallowing = false;
            SChannelContent_UserChannels = false;
            Main_SwitchScreen();
            break;
        case KEY_RED:
            Main_showAboutDialog();
            break;
        case KEY_GREEN:
            SChannels_exit();
            Search_isSearching = false;
            Main_GoLive();
            break;
        case KEY_YELLOW:
            Main_showControlsDialog();
            break;
        case KEY_BLUE:
            Main_Go = Main_Search;
            SChannels_exit();
            SChannels_Postexit();
            break;
        default:
            break;
    }
}