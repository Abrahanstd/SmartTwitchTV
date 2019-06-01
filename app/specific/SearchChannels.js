//Variable initialization
var SearchChannels_cursorY = 0;
var SearchChannels_cursorX = 0;
var SearchChannels_dataEnded = false;
var SearchChannels_itemsCount = 0;
var SearchChannels_idObject = {};
var SearchChannels_emptyCellVector = [];
var SearchChannels_loadingData = false;
var SearchChannels_loadingDataTry = 0;
var SearchChannels_loadingDataTryMax = 5;
var SearchChannels_loadingDataTimeout = 3500;
var SearchChannels_itemsCountOffset = 0;
var SearchChannels_MaxOffset = 0;
var SearchChannels_emptyContent = false;
var SearchChannels_Status = false;
var SearchChannels_lastData = '';
var SearchChannels_itemsCountCheck = false;

var SearchChannels_ids = ['sc_thumbdiv', 'sc_img', 'sc_infodiv', 'sc_displayname', 'sc_cell', 'scempty_', 'search_channel_scroll'];
//Variable initialization end

function SearchChannels_init() {
    Main_values.Main_CenterLablesVectorPos = 1;
    Main_values.Main_Go = Main_SearchChannels;
    Main_values.isLastSChannels = true;
    Main_values.Search_isSearching = true;
    if (SearchChannels_lastData !== Main_values.Search_data) SearchChannels_Status = false;
    Main_cleanTopLabel();
    Main_innerHTML('top_bar_user', STR_SEARCH + Main_UnderCenter(STR_CHANNELS + ' ' + "'" + Main_values.Search_data + "'"));
    document.body.addEventListener("keydown", SearchChannels_handleKeyDown, false);
    if (SearchChannels_Status) {
        Main_YRst(SearchChannels_cursorY);
        Main_ShowElement(SearchChannels_ids[6]);
        SearchChannels_addFocus();
        Main_SaveValues();
    } else SearchChannels_StartLoad();
}

function SearchChannels_exit() {
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", SearchChannels_handleKeyDown);
    Main_HideElement(SearchChannels_ids[6]);
}

function SearchChannels_StartLoad() {
    Main_empty('stream_table_search_channel');
    Main_HideElement(SearchChannels_ids[6]);
    Main_showLoadDialog();
    Main_HideWarningDialog();
    SearchChannels_lastData = Main_values.Search_data;
    SearchChannels_Status = false;
    SearchChannels_itemsCountOffset = 0;
    SearchChannels_MaxOffset = 0;
    SearchChannels_idObject = {};
    SearchChannels_emptyCellVector = [];
    SearchChannels_itemsCountCheck = false;
    SearchChannels_itemsCount = 0;
    Main_FirstLoad = true;
    SearchChannels_cursorX = 0;
    SearchChannels_cursorY = 0;
    SearchChannels_dataEnded = false;
    Main_CounterDialogRst();
    SearchChannels_loadDataPrepare();
    SearchChannels_loadDataRequest();
}

function SearchChannels_loadDataPrepare() {
    SearchChannels_loadingData = true;
    SearchChannels_loadingDataTry = 0;
    SearchChannels_loadingDataTimeout = 3500;
}

function SearchChannels_loadDataRequest() {

    var offset = SearchChannels_itemsCount + SearchChannels_itemsCountOffset;
    if (offset && offset > (SearchChannels_MaxOffset - 1)) {
        offset = SearchChannels_MaxOffset - Main_ItemsLimitChannel;
        SearchChannels_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/search/channels?query=' + encodeURIComponent(Main_values.Search_data) +
        '&limit=' + Main_ItemsLimitChannel + '&offset=' + offset;

    if (Main_Android && !SearchChannels_itemsCount)
        BaseAndroidhttpGet(theUrl, SearchChannels_loadingDataTimeout, 2, null, SearchChannels_loadDataSuccess, SearchChannels_loadDataError);
    else
        BasexmlHttpGet(theUrl, SearchChannels_loadingDataTimeout, 2, null, SearchChannels_loadDataSuccess, SearchChannels_loadDataError, false);
}

function SearchChannels_loadDataError() {
    SearchChannels_loadingDataTry++;
    if (SearchChannels_loadingDataTry < SearchChannels_loadingDataTryMax) {
        SearchChannels_loadingDataTimeout += 500;
        SearchChannels_loadDataRequest();
    } else {
        SearchChannels_loadingData = false;
        if (!SearchChannels_itemsCount) {
            Main_FirstLoad = false;
            Main_HideLoadDialog();
            Main_showWarningDialog(STR_REFRESH_PROBLEM);
        } else {
            SearchChannels_dataEnded = true;
            SearchChannels_loadDataSuccessFinish();
        }
    }
}

function SearchChannels_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.channels.length;
    SearchChannels_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitChannel) SearchChannels_dataEnded = true;

    var offset_itemsCount = SearchChannels_itemsCount;
    SearchChannels_itemsCount += response_items;

    SearchChannels_emptyContent = !SearchChannels_itemsCount;

    var response_rows = response_items / Main_ColoumnsCountChannel;
    if (response_items % Main_ColoumnsCountChannel > 0) response_rows++;

    var coloumn_id, row_id, row, channels, id,
        cursor = 0,
        doc = document.getElementById('stream_table_search_channel');

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main_ColoumnsCountChannel + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main_ColoumnsCountChannel && cursor < response_items; coloumn_id++, cursor++) {
            channels = response.channels[cursor];
            id = channels._id;
            if (SearchChannels_idObject[id]) coloumn_id--;
            else {
                SearchChannels_idObject[id] = 1;
                row.appendChild(SearchChannels_createCell(row_id, row_id + '_' + coloumn_id, [channels.name, id, channels.logo, channels.display_name]));
            }

        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountChannel; coloumn_id++) {
            if (SearchChannels_dataEnded && !SearchChannels_itemsCountCheck) {
                SearchChannels_itemsCountCheck = true;
                SearchChannels_itemsCount = (row_id * Main_ColoumnsCountChannel) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(SearchChannels_ids[5] + row_id + '_' + coloumn_id));
            SearchChannels_emptyCellVector.push(SearchChannels_ids[5] + row_id + '_' + coloumn_id);
        }
        doc.appendChild(row);
    }

    SearchChannels_loadDataSuccessFinish();
}


function SearchChannels_createCell(row_id, id, valuesArray) {
    if (row_id < 4) Main_CacheImage(valuesArray[2]); //try to pre cache first 4 rows
    return Main_createCellChannel(id, SearchChannels_ids, valuesArray);
}

function SearchChannels_loadDataSuccessFinish() {
    if (!SearchChannels_Status) {
        if (SearchChannels_emptyContent) Main_showWarningDialog(STR_SEARCH_RESULT_EMPTY);
        else {
            SearchChannels_Status = true;
            SearchChannels_addFocus();
            Main_SaveValues();
        }
        Main_ShowElement(SearchChannels_ids[6]);
        Main_FirstLoad = false;
        Main_HideLoadDialog();
    } else {
        if (SearchChannels_emptyCellVector.length > 0 && !SearchChannels_dataEnded) {
            SearchChannels_loadDataPrepare();
            SearchChannels_loadDataReplace();
            return;
        } else {
            SearchChannels_addFocus(true);
            SearchChannels_emptyCellVector = [];
        }
    }
    SearchChannels_loadingData = false;
}

function SearchChannels_loadDataReplace() {
    Main_SetItemsLimitReplace(SearchChannels_emptyCellVector.length);

    var offset = SearchChannels_itemsCount + SearchChannels_itemsCountOffset;
    if (offset && offset > (SearchChannels_MaxOffset - 1)) {
        offset = SearchChannels_MaxOffset - Main_ItemsLimitReplace;
        SearchChannels_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/search/channels?query=' + encodeURIComponent(Main_values.Search_data) +
        '&limit=' + Main_ItemsLimitReplace + '&offset=' + offset;

    BasehttpGet(theUrl, SearchChannels_loadingDataTimeout, 2, null, SearchChannels_loadDataSuccessReplace, SearchChannels_loadDataErrorReplace);
}

function SearchChannels_loadDataErrorReplace() {
    SearchChannels_loadingDataTry++;
    if (SearchChannels_loadingDataTry < SearchChannels_loadingDataTryMax) {
        SearchChannels_loadingDataTimeout += 500;
        SearchChannels_loadDataReplace();
    } else {
        SearchChannels_dataEnded = true;
        SearchChannels_itemsCount -= SearchChannels_emptyCellVector.length;
        SearchChannels_emptyCellVector = [];
        SearchChannels_loadDataSuccessFinish();
    }
}

function SearchChannels_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText),
        response_items = response.channels.length,
        channels, id, i = 0,
        cursor = 0,
        tempVector = [];

    SearchChannels_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitReplace) SearchChannels_dataEnded = true;

    for (i; i < SearchChannels_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        channels = response.channels[cursor];
        id = channels._id;
        if (SearchChannels_idObject[id]) i--;
        else {
            SearchChannels_idObject[id] = 1;
            Main_replaceChannel(SearchChannels_emptyCellVector[i], [channels.name, id, channels.logo, channels.display_name], SearchChannels_ids);

            tempVector.push(i);
        }
    }

    for (i = tempVector.length - 1; i > -1; i--) SearchChannels_emptyCellVector.splice(tempVector[i], 1);

    SearchChannels_itemsCountOffset += cursor;
    if (SearchChannels_dataEnded) {
        SearchChannels_itemsCount -= SearchChannels_emptyCellVector.length;
        SearchChannels_emptyCellVector = [];
    }

    SearchChannels_loadDataSuccessFinish();
}

function SearchChannels_addFocus(forceScroll) {
    Main_addFocusChannel(SearchChannels_cursorY, SearchChannels_cursorX, SearchChannels_ids, Main_ColoumnsCountChannel, SearchChannels_itemsCount, forceScroll);

    if (((SearchChannels_cursorY + Main_ItemsReloadLimitChannel) > (SearchChannels_itemsCount / Main_ColoumnsCountChannel)) &&
        !SearchChannels_dataEnded && !SearchChannels_loadingData) {
        SearchChannels_loadDataPrepare();
        SearchChannels_loadDataRequest();
    }
    if (Main_CenterLablesInUse) SearchChannels_removeFocus();
}

function SearchChannels_removeFocus() {
    if (SearchChannels_itemsCount) Main_removeFocus(SearchChannels_cursorY + '_' + SearchChannels_cursorX, SearchChannels_ids);
}

function SearchChannels_handleKeyDown(event) {
    if (Main_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else {
                SearchChannels_removeFocus();
                Main_CenterLablesStart(SearchChannels_handleKeyDown);
            }
            Sidepannel_RestoreScreen();
            break;
        case KEY_LEFT:
            if (!SearchChannels_cursorX) {
                SearchChannels_removeFocus();
                Sidepannel_Start(SearchChannels_handleKeyDown, true);
            } else if (Main_ThumbNull((SearchChannels_cursorY), (SearchChannels_cursorX - 1), SearchChannels_ids[0])) {
                SearchChannels_removeFocus();
                SearchChannels_cursorX--;
                SearchChannels_addFocus();
            } else {
                for (i = (Main_ColoumnsCountChannel - 1); i > -1; i--) {
                    if (Main_ThumbNull((SearchChannels_cursorY - 1), i, SearchChannels_ids[0])) {
                        SearchChannels_removeFocus();
                        SearchChannels_cursorY--;
                        SearchChannels_cursorX = i;
                        SearchChannels_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (Main_ThumbNull((SearchChannels_cursorY), (SearchChannels_cursorX + 1), SearchChannels_ids[0])) {
                SearchChannels_removeFocus();
                SearchChannels_cursorX++;
                SearchChannels_addFocus();
            } else if (Main_ThumbNull((SearchChannels_cursorY + 1), 0, SearchChannels_ids[0])) {
                SearchChannels_removeFocus();
                SearchChannels_cursorY++;
                SearchChannels_cursorX = 0;
                SearchChannels_addFocus();
            }
            break;
        case KEY_UP:
            if (!SearchChannels_cursorY) {
                SearchChannels_removeFocus();
                Main_CenterLablesStart(SearchChannels_handleKeyDown);
            } else {
                for (i = 0; i < Main_ColoumnsCountChannel; i++) {
                    if (Main_ThumbNull((SearchChannels_cursorY - 1), (SearchChannels_cursorX - i), SearchChannels_ids[0])) {
                        SearchChannels_removeFocus();
                        SearchChannels_cursorY--;
                        SearchChannels_cursorX = SearchChannels_cursorX - i;
                        SearchChannels_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_DOWN:
            for (i = 0; i < Main_ColoumnsCountChannel; i++) {
                if (Main_ThumbNull((SearchChannels_cursorY + 1), (SearchChannels_cursorX - i), SearchChannels_ids[0])) {
                    SearchChannels_removeFocus();
                    SearchChannels_cursorY++;
                    SearchChannels_cursorX = SearchChannels_cursorX - i;
                    SearchChannels_addFocus();
                    break;
                }
            }
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            Main_values.Main_selectedChannel = document.getElementById(SearchChannels_ids[4] + SearchChannels_cursorY + '_' + SearchChannels_cursorX).getAttribute(Main_DataAttribute);
            Main_values.Main_selectedChannel_id = document.getElementById(SearchChannels_ids[4] + SearchChannels_cursorY + '_' + SearchChannels_cursorX).getAttribute('data-id');
            Main_values.Main_selectedChannelDisplayname = document.getElementById(SearchChannels_ids[3] + SearchChannels_cursorY + '_' + SearchChannels_cursorX).textContent;
            document.body.removeEventListener("keydown", SearchChannels_handleKeyDown);
            Main_values.Main_BeforeChannel = Main_SearchChannels;
            Main_values.Main_Go = Main_ChannelContent;
            Main_values.Main_BeforeChannelisSet = true;
            AddCode_IsFallowing = false;
            ChannelContent_UserChannels = false;
            Main_HideElement(SearchChannels_ids[6]);
            Main_SwitchScreen();
            break;
        default:
            break;
    }
}