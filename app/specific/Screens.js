//Variable initialization
var inUseObj = {};
inUseObj.FirstLoad = false;

//Initiate all Main screens obj and they properties
function Screens_InitScreens() {
    console.log('InitScreens place holder');
}

//Initiate all Secondary screens obj and they properties
function Screens_InitSecondaryScreens() {
    //Live screens
    ScreensObj_InitLive();
    ScreensObj_InitFeatured();

    //Clips screens
    ScreensObj_InitClip();
    ScreensObj_InitChannelClip();
    ScreensObj_InitAGameClip();

    //Games screens
    ScreensObj_InitGame();
    ScreensObj_InitUserGames();
}

//TODO cleanup not used when finished migrate all
function Screens_ScreenIds(base) {
    return [base + '_thumbdiv', base + '_img', base + '_infodiv', base + '_title', base + '_createdon', base + '_game', base + '_viwers', base + '_duration', base + '_cell', 'cpempty_', base + '_scroll', base + '_lang'];
}

function Screens_assign() {
    var ret = {},
        i = 0,
        j;
    for (i; i < arguments.length; i += 1) {

        var obj = arguments[i],
            keys = Object.keys(obj);

        for (j = 0; j < keys.length; j += 1)
            ret[keys[j]] = obj[keys[j]];

    }
    return ret;
}

//Variable initialization end

function Screens_init() {
    Main_addFocusVideoOffset = -1;
    Main_values.Main_Go = inUseObj.screen;
    inUseObj.label_init();

    document.body.addEventListener("keydown", Screens_handleKeyDown, false);
    if (inUseObj.status) {
        Main_ShowElement(inUseObj.ids[10]);
        Main_YRst(inUseObj.posY);
        Screens_addFocus();
        Main_SaveValues();
    } else Screens_StartLoad();
}

function Screens_exit() {
    Main_addFocusVideoOffset = 0;
    inUseObj.label_exit();
    document.body.removeEventListener("keydown", Screens_handleKeyDown);
    Main_HideElement(inUseObj.ids[10]);
}

function Screens_StartLoad() {
    Main_empty(inUseObj.table);
    Main_HideElement(inUseObj.ids[10]);
    Main_HideWarningDialog();
    Main_showLoadDialog();
    inUseObj.cursor = null;
    inUseObj.status = false;
    inUseObj.row = document.createElement('div');
    inUseObj.MaxOffset = 0;
    inUseObj.TopRowCreated = false;
    inUseObj.offset = 0;
    inUseObj.idObject = {};
    inUseObj.FirstLoad = true;
    inUseObj.itemsCount = 0;
    inUseObj.posX = 0;
    inUseObj.posY = 0;
    inUseObj.row_id = 0;
    inUseObj.coloumn_id = 0;
    inUseObj.data = null;
    inUseObj.data_cursor = 0;
    inUseObj.dataEnded = false;
    Main_CounterDialogRst();
    Screens_loadDataPrepare();
    Screens_loadDataRequest();
}

function Screens_loadDataPrepare() {
    inUseObj.loadingData = true;
    inUseObj.loadingDataTry = 0;
    inUseObj.loadingDataTimeout = 3500;
}

function Screens_loadDataRequest() {
    inUseObj.set_url();
    var xmlHttp;
    if (Main_Android) {

        xmlHttp = Android.mreadUrl(inUseObj.url, inUseObj.loadingDataTimeout, 2, null);

        if (xmlHttp) xmlHttp = JSON.parse(xmlHttp);
        else {
            Screens_loadDataError();
            return;
        }

        if (xmlHttp.status === 200) {
            inUseObj.concatenate(xmlHttp.responseText);
        } else {
            Screens_loadDataError();
        }


    } else {
        xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", inUseObj.url, true);

        xmlHttp.timeout = inUseObj.loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) inUseObj.concatenate(xmlHttp.responseText);
                else Screens_loadDataError();
            }
        };

        xmlHttp.send(null);
    }
}

function Screens_loadDataError() {
    inUseObj.loadingDataTry++;
    if (inUseObj.loadingDataTry < inUseObj.loadingDataTryMax) {
        inUseObj.loadingDataTimeout += 500;
        Screens_loadDataRequest();
    } else {
        inUseObj.loadingData = false;
        if (!inUseObj.itemsCount) {
            inUseObj.FirstLoad = false;
            Main_HideLoadDialog();
            Main_showWarningDialog(STR_REFRESH_PROBLEM);
            Main_ShowElement('topbar');
        } else inUseObj.dataEnded = true;
    }
}

function Screens_loadDataSuccess() {
    var response_items = (inUseObj.data.length - inUseObj.data_cursor);

    //Use appendDiv only if is the intention to add on it run of loadDataSuccess to the row less content then ColoumnsCount,
    //with will make the row not be full, intentionally to add more in a new run of loadDataSuccess to that same row

    //If the intention is to load less then ColoumnsCount for it row consistently (have multiple not full rows), this function needs to be reworked appendDiv will not solve it, and that doesn't make sense for most screens.

    //appendDiv doesn't applies if the content end and we have less then ColoumnsCount to add for the last row

    //var appendDiv = !inUseObj.coloumn_id;
    if (response_items > inUseObj.ItemsLimit) response_items = inUseObj.ItemsLimit;
    else if (!inUseObj.loadingData) inUseObj.dataEnded = true;

    if (response_items) {
        var response_rows = Math.ceil(response_items / inUseObj.ColoumnsCount);

        var max_row = inUseObj.row_id + response_rows;

        var doc = document.getElementById(inUseObj.table);

        if (inUseObj.HasSwitches && !inUseObj.TopRowCreated) {
            inUseObj.TopRowCreated = true;
            inUseObj.row = document.createElement('div');
            var thumbfallow = '<i class="icon-history stream_channel_fallow_icon"></i>' + STR_SPACE + STR_SPACE + STR_SWITCH_CLIP;
            Main_td = document.createElement('div');
            Main_td.setAttribute('id', inUseObj.ids[8] + 'y_0');
            Main_td.className = 'stream_cell_period';
            Main_td.innerHTML = '<div id="' + inUseObj.ids[0] +
                'y_0" class="stream_thumbnail_channel_vod" ><div id="' + inUseObj.ids[3] +
                'y_0" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
            inUseObj.row.appendChild(Main_td);
            doc.appendChild(inUseObj.row);
        }

        for (inUseObj.row_id; inUseObj.row_id < max_row;) {

            if (inUseObj.coloumn_id === inUseObj.ColoumnsCount) {
                inUseObj.row = document.createElement('div');
                inUseObj.coloumn_id = 0;
                //appendDiv = true;
            }

            for (inUseObj.coloumn_id; inUseObj.coloumn_id < inUseObj.ColoumnsCount && inUseObj.data_cursor < inUseObj.data.length; inUseObj.data_cursor++) {
                //TODO understand and fix before the code reaches this point way a cell is undefined some times
                if (inUseObj.data[inUseObj.data_cursor]) inUseObj.addCell(inUseObj.data[inUseObj.data_cursor]);
            }

            //if (appendDiv)
            doc.appendChild(inUseObj.row);
            if (inUseObj.coloumn_id === inUseObj.ColoumnsCount) inUseObj.row_id++;
            else if (inUseObj.data_cursor >= inUseObj.data.length) break;
        }
    }

    Screens_loadDataSuccessFinish(!response_items && !inUseObj.status);
}

function Screens_createCellBase(row_id, coloumn_id, idArray, thumbnail) {

    var id = row_id + '_' + coloumn_id;
    Main_imgVectorPush(idArray[1] + id, thumbnail);
    if (row_id < inUseObj.ColoumnsCount) Main_CacheImage(thumbnail); //try to pre cache first 3 rows

    Main_td = document.createElement('div');
    Main_td.style.cssText = inUseObj.ThumbCssText;

    return id;
}

function Screens_createCellGame(row_id, coloumn_id, idArray, thumbnail, game_name, views) {

    var id = Screens_createCellBase(row_id, coloumn_id, idArray, thumbnail);

    Main_td.setAttribute('id', idArray[5] + id);
    Main_td.setAttribute(Main_DataAttribute, game_name);

    Main_td.innerHTML = '<div id="' + idArray[0] + id + '" class="stream_thumbnail_game"><div><img id="' +
        idArray[1] + id + '" class="stream_img"></div><div id="' +
        idArray[2] + id + '" class="stream_text2"><div id="<div id="' +
        idArray[3] + id + '" class="stream_channel">' + game_name + '</div>' +
        (views !== '' ? '<div id="' + idArray[4] + id + '"class="stream_info_games" style="width: 100%; display: inline-block;">' + views + '</div>' : '') +
        '</div></div>';

    return Main_td;
}

//TODO Reduce the number of vars here please
function Screens_createCellClip(row_id, coloumn_id, idArray, thumbnail, display_name, created_at, title_game, views, language, duration, video_id, name, logo, streamer_id, vod_id, vod_offset) {

    var id = Screens_createCellBase(row_id, coloumn_id, idArray, thumbnail);

    Main_td.setAttribute('id', idArray[8] + id);
    Main_td.setAttribute(Main_DataAttribute, JSON.stringify([video_id,
        duration,
        title_game[2],
        name,
        display_name,
        logo,
        streamer_id,
        vod_id,
        vod_offset,
        title_game[0],
        language,
        title_game[1] + title_game[2]
    ]));

    Main_td.innerHTML = '<div id="' + idArray[0] + id + '" class="stream_thumbnail_clip"><div><img id="' +
        idArray[1] + id + '" class="stream_img"></div><div id="' +
        idArray[2] + id + '" class="stream_text2"><div id="' +
        idArray[3] + id + '" class="stream_info" style="width: 72%; display: inline-block; font-size: 85%;">' +
        display_name + '</div><div id="' + idArray[7] + id +
        '"class="stream_info" style="width:27%; float: right; text-align: right; display: inline-block;">' + language +
        '</div><div  style="line-height: 12px;"><div id="' + idArray[4] + id + '"class="stream_info" style="width: 59%; display: inline-block;">' +
        created_at[0] + created_at[1] + '</div><div id="' + idArray[5] + id +
        '"class="stream_info" style="width: 39%; display: inline-block; float: right; text-align: right;">' +
        STR_DURATION + Play_timeS(duration) + '</div></div><div id="' + idArray[11] + id + '"class="stream_info">' +
        title_game[0] + STR_BR + title_game[1] + title_game[2] + '</div><div id="' + idArray[6] + id +
        '"class="stream_info">' + views + STR_VIEWS + '</div></div></div>';

    return Main_td;
}

function Screens_createCellLive(row_id, coloumn_id, data, idArray, valuesArray) {

    var id = Screens_createCellBase(row_id, coloumn_id, idArray, valuesArray[0]);

    Main_td.setAttribute('id', idArray[8] + id);
    Main_td.setAttribute(Main_DataAttribute, JSON.stringify(data));

    Main_td.innerHTML = '<div id="' + idArray[0] + id + '" class="stream_thumbnail_clip"><div><img id="' +
        idArray[1] + id + '" class="stream_img"></div><div id="' +
        idArray[2] + id + '" class="stream_text2"><div id="' +
        idArray[3] + id + '" class="stream_channel" style="width: 66%; display: inline-block;">' +
        valuesArray[1] + '</div><div id="' + idArray[7] + id +
        '"class="stream_info" style="width:33%; float: right; text-align: right; display: inline-block;">' +
        valuesArray[5] + '</div>' +
        '<div id="' + idArray[4] + id + '"class="stream_info">' + twemoji.parse(valuesArray[2]) + '</div>' +
        '<div id="' + idArray[5] + id + '"class="stream_info">' + STR_PLAYING + valuesArray[3] + '</div>' +
        '<div id="' + idArray[6] + id + '"class="stream_info">' + valuesArray[4] + '</div></div></div>';

    return Main_td;
}

function Screens_loadDataSuccessFinish(emptyContent) {
    if (!inUseObj.status) {
        Main_ShowElement('topbar');
        inUseObj.emptyContent = emptyContent;
        if (emptyContent) Main_showWarningDialog(inUseObj.empty_str());
        else {
            inUseObj.status = true;
            Main_imgVectorLoad(inUseObj.img_404);
        }
        //TODO improve this check
        if (Main_FirstRun && inUseObj.status && Settings_value.restor_playback.defaultValue) {
            if (Main_values.Play_WasPlaying) {

                Main_ExitCurrent(Main_values.Main_Go);
                Main_values.Main_Go = Main_GoBefore;
                if (!Main_values.vodOffset) Main_values.vodOffset = 1;
                ChannelVod_DurationSeconds = Main_values.vodOffset + 1;

                Play_showWarningDialog(STR_RESTORE_PLAYBACK_WARN);

                if (Main_values.Play_WasPlaying === 1) Main_openStream();
                else Main_openVod();

                Main_SwitchScreen(true);
                window.setTimeout(function() {
                    Play_HideWarningDialog();
                }, 2000);
            } else if (Main_GoBefore !== 1) {
                Main_ExitCurrent(Main_values.Main_Go);
                Main_values.Main_Go = Main_GoBefore;
                Main_removeFocus(inUseObj.posY + '_' + inUseObj.posX, inUseObj.ids);
                Main_SwitchScreen();
            } else {
                Main_ShowElement(inUseObj.ids[10]);
                if (Main_values.Never_run) Main_showControlsDialog();
                Main_values.Never_run = false;
                Main_SaveValues();
                Screens_addFocus();
            }
        } else {
            Main_ShowElement(inUseObj.ids[10]);
            Main_SaveValues();
            Screens_addFocus();
        }
        Main_FirstRun = false;
        inUseObj.FirstLoad = false;
        Main_HideLoadDialog();
    } else {
        Main_imgVectorLoad(inUseObj.img_404);
        Main_CounterDialog(inUseObj.posX, inUseObj.posY, inUseObj.ColoumnsCount, inUseObj.itemsCount);
    }
}

function Screens_addFocus() {
    if (inUseObj.posY < 0) {
        Screens_addFocusFallow();
        return;
    }
    if (Main_CenterLablesInUse) return;

    inUseObj.addFocus(inUseObj.posY, inUseObj.posX, inUseObj.ids, inUseObj.ColoumnsCount, inUseObj.itemsCount);

    //Load more as the data is getting used
    if ((inUseObj.data_cursor + Main_ItemsLimitMax) > inUseObj.data.length && !inUseObj.dataEnded && !inUseObj.loadingData) {
        Screens_loadDataPrepare();
        Screens_loadDataRequest();
    }

    if ((inUseObj.posY + inUseObj.ItemsReloadLimit) > (inUseObj.itemsCount / inUseObj.ColoumnsCount) && inUseObj.data_cursor < inUseObj.data.length) {
        Main_imgVectorRst();
        inUseObj.loadDataSuccess();
    }
}

function Screens_ChangeFocus(y, x) {
    Main_removeFocus(inUseObj.posY + '_' + inUseObj.posX, inUseObj.ids);
    inUseObj.posY += y;
    inUseObj.posX = x;
    Screens_addFocus();
}

function Screens_addFocusFallow() {
    Main_AddClass(inUseObj.ids[0] + 'y_0', Main_classThumb);
}

function Screens_removeFocusFallow() {
    Main_RemoveClass(inUseObj.ids[0] + 'y_0', Main_classThumb);
}

function Screens_BasicExit(before) {
    if (Main_isControlsDialogShown()) Main_HideControlsDialog();
    else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
    else {
        if (before === inUseObj.screen) Main_values.Main_Go = Main_Live;
        else Main_values.Main_Go = before;
        Screens_exit();
    }
}

function Screens_KeyUpDown(y) {
    //TODO improve this
    if (inUseObj.HasSwitches && !inUseObj.posY && y === -1 && !inUseObj.emptyContent) {
        Main_removeFocus(inUseObj.posY + '_' + inUseObj.posX, inUseObj.ids);
        inUseObj.posY = -1;
        Screens_addFocusFallow();
    } else if (inUseObj.HasSwitches && (inUseObj.posY) === -1) {
        inUseObj.posY = 0;
        Screens_addFocus();
        Screens_removeFocusFallow();
    } else {
        for (var i = 0; i < inUseObj.ColoumnsCount; i++) {
            if (Main_ThumbNull((inUseObj.posY + y), (inUseObj.posX - i), inUseObj.ids[0])) {
                Screens_ChangeFocus(y, inUseObj.posX - i);
                return;
            }
        }
    }
}

function Screens_KeyLeftRight(y, x) {
    if (Main_ThumbNull((inUseObj.posY), (inUseObj.posX + y), inUseObj.ids[0]))
        Screens_ChangeFocus(0, (inUseObj.posX + y));
    else if (Main_ThumbNull((inUseObj.posY + y), x, inUseObj.ids[0]))
        Screens_ChangeFocus(y, x);
}

function Screens_handleKeyDown(event) {
    if (inUseObj.FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    switch (event.keyCode) {
        case KEY_RETURN:
            inUseObj.key_exit();
            break;
        case KEY_LEFT:
            Screens_KeyLeftRight(-1, inUseObj.ColoumnsCount - 1);
            break;
        case KEY_RIGHT:
            Screens_KeyLeftRight(1, 0);
            break;
        case KEY_UP:
            Screens_KeyUpDown(-1);
            break;
        case KEY_DOWN:
            Screens_KeyUpDown(1);
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            inUseObj.key_play();
            break;
        default:
            break;
    }
}