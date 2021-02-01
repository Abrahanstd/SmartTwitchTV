/*
 * Copyright (c) 2017-2020 Felipe de Leon <fglfgl27@gmail.com>
 *
 * This file is part of SmartTwitchTV <https://github.com/fgl27/SmartTwitchTV>
 *
 * SmartTwitchTV is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SmartTwitchTV is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SmartTwitchTV.  If not, see <https://github.com/fgl27/SmartTwitchTV/blob/master/LICENSE>.
 *
 */

//Variable initialization
var ScreenObj = {};
var Screens_clear = false;
var Screens_KeyEnterID;
var Screens_DialogHideTimout = 10000;
var Screens_KeyUptimeout = 250;
var Screens_ScrollAnimationTimeout = 300; //Same time as animate_height_transition
var Screens_ChangeFocusAnimationFinished = true;
var Screens_ChangeFocusAnimationFast = false;
var Screens_SettingDoAnimations = true;
var Screens_Some_Screen_Is_Refreshing = false;
//Start the app in async mode by default

//FireBase support
var firebaseConfig = {
    apiKey: "AIzaSyAr2tuLGB5lvredaqU2KWW4p8Yg7sudbzI",
    authDomain: "smarttv-twitch-web-android.firebaseapp.com",
    databaseURL: "https://smarttv-twitch-web-android.firebaseio.com",
    projectId: "smarttv-twitch-web-android",
    storageBucket: "smarttv-twitch-web-android.appspot.com",
    messagingSenderId: "871032203366",
    appId: "1:871032203366:web:922c0cf93432bbe1e7a5a7",
    measurementId: "G-8YQ2JGNYDP"
};

//Initiate all Secondary screens obj and they properties
function Screens_InitScreens() {
    ScreensObj_StartAllVars();

    //Live screens
    ScreensObj_InitLive();
    ScreensObj_InitFeatured();
    ScreensObj_InitAGame();
    //Live user screens
    ScreensObj_InitUserLive();

    //Clips screens
    ScreensObj_InitClip();
    ScreensObj_InitChannelClip();
    ScreensObj_InitAGameClip();

    //Games screens
    ScreensObj_InitGame();
    //Games user screen
    ScreensObj_InitUserGames();

    //Vod screens
    ScreensObj_InitVod();
    ScreensObj_InitAGameVod();
    ScreensObj_InitChannelVod();
    //Vod user screen
    ScreensObj_InitUserVod();

    //Channels screens
    ScreensObj_InitUserChannels();

    //Search screen
    ScreensObj_InitSearchGames();
    ScreensObj_InitSearchLive();
    ScreensObj_InitSearchChannels();

    //History screen
    ScreensObj_HistoryLive();
    ScreensObj_HistoryVod();
    ScreensObj_HistoryClip();

    Main_addEventListener("keyup", Screens_handleKeyUpAnimationFast);

    for (var property in ScreenObj) {
        ScreenObj[property].key_fun = Screens_handleKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_up = Screens_handleKeyUp.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_thumb = Screens_ThumbOptionhandleKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_hist = Screens_histhandleKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_histdelet = Screens_histDeleteKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_offset = Screens_OffSethandleKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_period = Screens_PeriodhandleKeyDown.bind(null, ScreenObj[property].screen);
        ScreenObj[property].key_controls = Screens_handleKeyControls.bind(null, ScreenObj[property].screen);
    }

    //Etc screen that makes in and out a screen to work
    ScreenObj[Main_Users] = {
        start_fun: Users_StartLoad,
        init_fun: Users_init,
        key_fun: Users_handleKeyDown,
        exit_fun: Users_exit
    };
    ScreenObj[Main_Users].key_controls = Screens_handleKeyControls.bind(null, Main_Users);

    ScreenObj[Main_ChannelContent] = {
        start_fun: ChannelContent_StartLoad,
        init_fun: ChannelContent_init,
        key_fun: ChannelContent_handleKeyDown,
        exit_fun: ChannelContent_exit
    };
    ScreenObj[Main_ChannelContent].key_controls = Screens_handleKeyControls.bind(null, Main_ChannelContent);

    Main_Startfirebase();
    Screens_first_init();
}

//TODO cleanup not used when finished migrate all
function Screens_ScreenIds(base) {
    return [
        base + '_thumbdiv',//0
        base + '_img',//1
        base + '_title',//2
        base + '_data',//3
        base + '_scroll',//4
        base + '_animated',//5
        base + '_row',//6
        base + '_watched'//7
    ];
}

function Screens_assign() {
    var ret = {},
        i = 0,
        j,
        arguments_length = arguments.length;

    for (i; i < arguments_length; i++) {

        var obj = arguments[i],
            keys = Object.keys(obj),
            keys_length = keys.length;

        for (j = 0; j < keys_length; j++)
            ret[keys[j]] = obj[keys[j]];

    }
    return ret;
}

//Variable initialization end

function Screens_first_init() {

    var Last_obj = OSInterface_GetLastIntentObj(),
        obj,
        live_channel_call,
        game_channel_call,
        screen_channel_call,
        tempGame;

    if (Last_obj) {
        obj = JSON.parse(Last_obj);
        live_channel_call = Main_A_equals_B(obj.type, "LIVE");

        if (!live_channel_call) {
            game_channel_call = Main_A_equals_B(obj.type, "GAME");

            if (!game_channel_call) {
                screen_channel_call = Main_A_equals_B(obj.type, "SCREEN");

                if (!screen_channel_call) OSInterface_mCheckRefreshToast(parseInt(obj));

            }

        }

        if (obj.type && obj.screen) Main_EventChannel(obj);

    }

    var StartUser = Settings_value.start_user_screen.defaultValue;
    var restore_playback = Settings_value.restor_playback.defaultValue;

    if (live_channel_call) {

        Main_values.Play_WasPlaying = 1;

        Play_data = JSON.parse(JSON.stringify(Play_data_base));
        Play_data.data = ScreensObj_LiveCellArray(obj.obj);

        StartUser = false;
        restore_playback = true;

    } else if (game_channel_call) {

        Main_values.Play_WasPlaying = 0;
        Main_GoBefore = Main_aGame;
        Play_data = JSON.parse(JSON.stringify(Play_data_base));
        Play_data.data[3] = obj.obj.name;
        StartUser = false;
        Main_values.Main_gameSelected = Play_data.data[3];

    } else if (screen_channel_call) {

        Main_GoBefore = Main_onNewIntentGetScreen(obj);
        Main_values.Play_WasPlaying = 0;
        StartUser = false;

    }

    if (Main_values.Play_WasPlaying !== 1 || StartUser) {

        tempGame = Play_data.data[3];
        Play_data = JSON.parse(JSON.stringify(Play_data_base));

    }

    if (StartUser) {

        Users_beforeUser = Main_GoBefore;
        Main_values.Main_Before = Users_beforeUser;
        Main_values.Play_WasPlaying = 0;
        ScreenObj[Main_Users].init_fun();

    } else if (restore_playback && Main_values.Play_WasPlaying) {

        Main_values.Main_Go = Main_GoBefore;
        if (!live_channel_call) Play_showWarningDialog(STR_RESTORE_PLAYBACK_WARN, 5000);

        if (Main_values.Play_WasPlaying === 1) {

            if (Play_data.data.length > 0) {

                Main_openStream();

            } else ScreenObj[Main_values.Main_Go].init_fun();

        } else {

            Play_data.data[3] = tempGame;
            Main_vodOffset = Main_getItemInt('Main_vodOffset', 0);
            if (!Main_vodOffset) Main_vodOffset = 1;

            Play_DurationSeconds = 0;
            Main_openVod();

        }

    } else if (Main_GoBefore !== Main_Live && Main_GoBefore !== Main_addUser && Main_GoBefore !== Main_Search) {

        if (Main_newUsercode) Main_HideLoadDialog();
        ScreenObj[Main_GoBefore].init_fun();

    } else {

        //Values that need to be reset to prevent app odd behavier
        Main_values.Search_isSearching = false;
        Main_values.Main_BeforeChannelisSet = false;
        Main_values.Main_BeforeAgameisSet = false;

        ScreenObj[Main_Live].init_fun();
    }
}

function Screens_init(key, preventRefresh) {
    //Main_Log('Screens_init ' + ScreenObj[key].screen);
    Main_addFocusVideoOffset = -1;
    Main_values.Main_Go = key;//Sidepannel, playclip, Main_updateclock Screens_Isfocused Main_CheckStop use this var
    ScreenObj[key].label_init();

    if (Main_isScene1DocVisible() &&
        !Sidepannel_isShowing() &&
        !Sidepannel_MainisShowing()) {
        Main_addEventListener("keydown", ScreenObj[key].key_fun);
    }

    Main_ShowElementWithEle(ScreenObj[key].ScrollDoc);

    if (Main_CheckAccessibilityVisible()) Main_CheckAccessibilitySet();
    else if (!ScreenObj[key].status || (!preventRefresh && Screens_RefreshTimeout(key)) || !ScreenObj[key].offsettop ||
        ScreenObj[key].offsettopFontsize !== Settings_Obj_default('global_font_offset')) {

        if (!ScreenObj[key].isRefreshing) Screens_StartLoad(key);
        else Main_showLoadDialog();// the isRefreshing is running so just show the loading dialog prevent reload the screen

    } else {
        ScreenObj[key].SetPreviewEnable();
        Main_YRst(ScreenObj[key].posY);
        Screens_addFocus(true, key);
        Screens_SetLastRefresh(key);
        Main_HideLoadDialog();
        Main_SaveValues();
        ScreenObj[key].screen_view();
    }
}

function Screens_exit(key) {
    //Main_Log('Screens_exit ' + ScreenObj[key].screen);

    Main_addFocusVideoOffset = 0;
    if (ScreenObj[key].label_exit) ScreenObj[key].label_exit();
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElementWithEle(ScreenObj[key].ScrollDoc);
    Main_HideWarningDialog();
    Screens_ClearAnimation(key);
}

function Screens_StartLoad(key) {
    if (key === Main_values.Main_Go && Main_isScene1DocVisible()) {

        Screens_RemoveFocus(key);
        Main_showLoadDialog();
        if (!Main_FirstRun) ScreenObj[key].screen_view();

    }

    Main_date_Ms = new Date().getTime();
    Main_empty(ScreenObj[key].table);
    ScreenObj[key].ScrollDoc.style.transform = '';
    ScreenObj[key].lastRefresh = new Date().getTime();
    Screens_SetLastRefresh(key);
    Play_PreviewVideoEnded = false;
    Main_HideWarningDialog();

    ScreenObj[key].tempHtml = '';
    ScreenObj[key].DataObj = {};
    ScreenObj[key].SetPreviewEnable();
    ScreenObj[key].cursor = null;
    ScreenObj[key].after = '';
    ScreenObj[key].status = false;
    ScreenObj[key].FirstRunEnd = false;
    ScreenObj[key].TopRowCreated = false;
    ScreenObj[key].offset = 0;
    ScreenObj[key].offsettop = 0;
    ScreenObj[key].emptyContent = true;
    ScreenObj[key].idObject = {};
    ScreenObj[key].Cells = [];
    ScreenObj[key].isRefreshing = true;
    Screens_Some_Screen_Is_Refreshing = true;
    ScreenObj[key].itemsCount = 0;
    ScreenObj[key].posX = 0;
    ScreenObj[key].posY = 0;
    ScreenObj[key].row_id = 0;
    ScreenObj[key].currY = 0;
    ScreenObj[key].loadChannelOffsset = 0;
    ScreenObj[key].followerChannels = [];
    ScreenObj[key].followerChannelsDone = false;
    ScreenObj[key].coloumn_id = 0;
    ScreenObj[key].data = null;
    ScreenObj[key].data_cursor = 0;
    ScreenObj[key].dataEnded = false;
    Main_CounterDialogRst();
    Screens_loadDataRequestStart(key);
}

function Screens_loadDataRequestStart(key) {
    ScreenObj[key].loadingData = true;
    Screens_loadDataRequest(key);
}

function Screens_loadDataRequest(key) {

    ScreenObj[key].set_url();

    if (ScreenObj[key].isHistory) {

        ScreenObj[key].history_concatenate();

    } else {

        Screens_BasexmlHttpGet(
            (ScreenObj[key].url + Main_TwithcV5Flag),
            ScreenObj[key].HeaderQuatity,
            ScreenObj[key].token,
            ScreenObj[key].Headers,
            key
        );

    }

}

function Screens_BasexmlHttpGet(theUrl, HeaderQuatity, access_token, HeaderArray, key) {

    if (Main_IsOn_OSInterface) {

        OSInterface_GetMethodUrlHeadersAsync(
            theUrl,
            (DefaultHttpGetTimeout * 2),//timeout
            null,//postMessage, null for get
            null,//Method, null for get
            ScreenObj[key].HeadersString,//JsonHeadersArray
            'Screens_CheckGetResult',//callback
            key,//checkResult
            key,//key
            key//thread
        );

    } else {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", theUrl, true);
        xmlHttp.timeout = (DefaultHttpGetTimeout * 2);

        HeaderArray[2][1] = access_token;

        for (var i = 0; i < HeaderQuatity; i++)
            xmlHttp.setRequestHeader(HeaderArray[i][0], HeaderArray[i][1]);

        xmlHttp.onreadystatechange = function() {

            if (this.readyState === 4) {

                Screens_HttpResultStatus(this, key);

            }

        };

        xmlHttp.send(null);

    }
}


function Screens_CheckGetResult(result, key) {
    Screens_HttpResultStatus(JSON.parse(result), key);
}

function Screens_HttpResultStatus(resultObj, key) {

    if (resultObj.status === 200) {

        //console.log(resultObj.responseText);
        Screens_concatenate(
            JSON.parse(resultObj.responseText),
            key
        );

        //If the scroll position is at the end of the list after a loading success focus
        if (ScreenObj[key].itemsCount && Main_ThumbOpenIsNull((ScreenObj[key].posY + 1) + '_0', ScreenObj[key].ids[0])) {
            Screens_addFocus(true, key);

        }
    } else if (ScreenObj[key].HeaderQuatity > 2 && (resultObj.status === 401 || resultObj.status === 403)) { //token expired

        if (AddUser_UserIsSet() && AddUser_UsernameArray[0].access_token) AddCode_refreshTokens(0, Screens_loadDataRequestStart, Screens_loadDatafail, key);
        else Screens_loadDataRequest(key);

    } else {

        Screens_loadDataRequest(key);

    }

}

function Screens_loadDatafail(key) {

    ScreenObj[key].loadingData = false;
    ScreenObj[key].FirstRunEnd = true;

    if (!ScreenObj[key].itemsCount) {

        ScreenObj[key].isRefreshing = false;
        Screens_Some_Screen_Is_Refreshing = false;

        if (Screens_IsInUse(key)) {
            Main_showWarningDialog(STR_REFRESH_PROBLEM);
            ScreenObj[key].key_exit();
            if (!Main_FirstRun) Main_HideLoadDialog();
        }//else the user has already exit the screen

        if (Main_FirstRun) Screens_loadDataSuccessFinishEnd();

    } else ScreenObj[key].dataEnded = true;

}

function Screens_concatenate(responseObj, key) {
    ScreenObj[key].concatenate(responseObj);
}

function Screens_loadDataSuccess(key) {
    var data_length = ScreenObj[key].data.length,
        response_items = data_length - ScreenObj[key].data_cursor;

    //Use appendDiv only if is the intention to add on it run of loadDataSuccess to the row less content then ColoumnsCount,
    //with will make the row not be full, intentionally to add more in a new run of loadDataSuccess to that same row

    //If the intention is to load less then ColoumnsCount for it row consistently (have multiple not full rows), this function needs to be reworked appendDiv will not solve it, and that doesn't make sense for most screens.

    //appendDiv doesn't applies if the content end and we have less then ColoumnsCount to add for the last row

    //var appendDiv = !ScreenObj[key].coloumn_id;
    if (response_items > ScreenObj[key].ItemsLimit) response_items = ScreenObj[key].ItemsLimit;
    else if (!ScreenObj[key].loadingData) ScreenObj[key].dataEnded = true;

    if (ScreenObj[key].HasSwitches && !ScreenObj[key].TopRowCreated) ScreenObj[key].addSwitches();

    if (response_items) {

        var response_rows = Math.ceil(response_items / ScreenObj[key].ColoumnsCount),
            max_row = ScreenObj[key].row_id + response_rows;

        for (ScreenObj[key].row_id; ScreenObj[key].row_id < max_row;) {

            if (ScreenObj[key].coloumn_id === ScreenObj[key].ColoumnsCount) {

                ScreenObj[key].coloumn_id = 0;

            }

            for (ScreenObj[key].coloumn_id; ScreenObj[key].coloumn_id < ScreenObj[key].ColoumnsCount && ScreenObj[key].data_cursor < data_length; ScreenObj[key].data_cursor++) {

                if (ScreenObj[key].data[ScreenObj[key].data_cursor])
                    ScreenObj[key].addCell(ScreenObj[key].data[ScreenObj[key].data_cursor]);

            }

            if (ScreenObj[key].coloumn_id === ScreenObj[key].ColoumnsCount) {

                ScreenObj[key].Cells[ScreenObj[key].row_id] = Screens_createRow(key);
                ScreenObj[key].row_id++;
                ScreenObj[key].tempHtml = '';

            } else if (ScreenObj[key].data_cursor >= data_length) {

                if (ScreenObj[key].tempHtml !== '') ScreenObj[key].Cells[ScreenObj[key].row_id] = Screens_createRow(key);
                break;

            }
        }
    }
    ScreenObj[key].emptyContent = !response_items && !ScreenObj[key].status;
    Screens_loadDataSuccessFinish(key);
}


function Screens_createRow(key) {

    var div = document.createElement('div');
    if (ScreenObj[key].rowClass) div.className = ScreenObj[key].rowClass;
    div.id = ScreenObj[key].ids[6] + ScreenObj[key].row_id;
    div.innerHTML = ScreenObj[key].tempHtml;

    return div;
}

function Screens_createCellChannel(id, idArray, valuesArray, key) {
    ScreenObj[key].DataObj[id] = valuesArray;

    return '<div id="' + idArray[3] + id + '" class="' + ScreenObj[key].thumbclass + '"><div id="' + idArray[0] + id +
        '" class="stream_thumbnail_channel" ><div class="stream_thumbnail_channel_img"><img id="' + idArray[1] +
        id + '" alt="" class="stream_img_channels" src="' + valuesArray[2] +
        '" onerror="this.onerror=null;this.src=\'' + ScreenObj[key].img_404 + '\';"></div>' +
        '<div class="stream_thumbnail_channel_text_holder">' +
        '<div id="' + idArray[2] + id + '" class="stream_info_channel_name">' + valuesArray[3] +
        (valuesArray[4] ? STR_SPACE + STR_SPACE +
            '</div><div class="stream_info_channel_partner_icon"><img style="width: 2ch;" alt="" src="' +
            IMG_PARTNER + '">' : "") + '</div></div></div></div>';
}

function Screens_createCellGame(id, idArray, valuesArray, key) {

    ScreenObj[key].DataObj[id] = valuesArray;

    return '<div id="' + idArray[3] + id + '" class="' + ScreenObj[key].thumbclass +
        '"><div id="' + idArray[0] + id + '" class="stream_thumbnail_game"><div class="stream_thumbnail_live_game"><img id="' +
        idArray[1] + id + '" class="stream_img" alt="" src="' + valuesArray[0] +
        '" onerror="this.onerror=null;this.src=\'' + ScreenObj[key].img_404 +
        '\';"></div><div class="stream_thumbnail_game_text_holder"><div class="stream_text_holder"><div id="' +
        idArray[2] + id + '" class="stream_info_game_name">' + valuesArray[1] + '</div>' +
        (valuesArray[2] !== '' ? '<div class="stream_info_live" style="width: 100%; display: inline-block;">' + valuesArray[2] +
            '</div>' : '') + '</div></div></div></div>';
}

function Screens_createCellClip(id, idArray, valuesArray, key, Extra_when, Extra_until) {

    var playing = (valuesArray[3] !== "" ? STR_PLAYING + valuesArray[3] : "");
    ScreenObj[key].DataObj[id] = valuesArray;

    return '<div id="' + idArray[3] + id + '" class="' + ScreenObj[key].thumbclass +
        '"><div id="' + idArray[0] + id + '" class="stream_thumbnail_live"><div class="stream_thumbnail_live_img"><img id="' +
        idArray[1] + id + '" class="stream_img" alt="" src="' + valuesArray[15] +
        '" onerror="this.onerror=null;this.src=\'' + ScreenObj[key].img_404 +
        '\';"><div id="' + idArray[7] + id + '" class="vod_watched" style="width: ' + (Main_history_Watched_Obj[valuesArray[7]] ? Main_history_Watched_Obj[valuesArray[7]] : 0) +
        '%;"></div></div><div class="stream_thumbnail_live_text_holder"><div class="stream_text_holder"><div style="line-height: 1.6ch;"><div id="' +
        idArray[2] + id + '" class="stream_info_live_name" style="width: 72%; display: inline-block;">' +
        valuesArray[4] + '</div><div class="stream_info_live" style="width:27%; float: right; text-align: right; display: inline-block;">' +
        valuesArray[11] + '</div></div><div class="' + (Extra_when ? 'stream_info_live_title_single_line' : 'stream_info_live_title') + '">' +
        valuesArray[10] + '</div>' + '<div class="stream_info_live">' + playing + '</div>' +
        '<div style="line-height: 1.3ch;"><div class="stream_info_live" style="width: auto; display: inline-block;">' +
        (valuesArray[16] ? valuesArray[16] : valuesArray[12]) + ',' + STR_SPACE + //Old sorting fix
        valuesArray[14] + '</div><div class="stream_info_live" style="width: 6ch; display: inline-block; float: right; text-align: right;">' +
        Play_timeS(valuesArray[1]) + '</div></div>' +
        (Extra_when ? ('<div class="stream_info_live">' + STR_WATCHED + Main_videoCreatedAtWithHM(Extra_when) + STR_SPACE +
            STR_UNTIL + Play_timeS(Extra_until < valuesArray[1] ? Extra_until : valuesArray[1]) + '</div>') : '') +
        '</div></div></div></div></div>';
}

function Screens_createCellVod(id, idArray, valuesArray, key, Extra_when, Extra_until) {

    ScreenObj[key].DataObj[id] = valuesArray;

    return '<div id="' + idArray[3] + id + '" class="' + ScreenObj[key].thumbclass +
        '"><div id="' + idArray[0] + id + '" class="stream_thumbnail_live"><div id="' + idArray[5] + id + '" class="stream_thumbnail_live_img" ' +
        (valuesArray[8] ? ' style="width: 100%; padding-bottom: 56.25%; background-size: 0 0; background-image: url(' + valuesArray[8] + ');"' : '') +
        '><img id="' + idArray[1] + id + '" class="stream_img" alt="" src="' + valuesArray[0] +
        '" onerror="this.onerror=null;this.src=\'' + ScreenObj[key].img_404 +
        '\';"><div id="' + idArray[7] + id + '" class="vod_watched" style="width: ' + (Main_history_Watched_Obj[valuesArray[7]] ? Main_history_Watched_Obj[valuesArray[7]] : 0) +
        '%;"></div></div><div class="stream_thumbnail_live_text_holder"><div class="stream_text_holder"><div style="line-height: 1.6ch;"><div id="' +
        idArray[2] + id + '" class="stream_info_live_name" style="width: 72%; display: inline-block;">' +
        valuesArray[1] + '</div><div class="stream_info_live" style="width:27%; float: right; text-align: right; display: inline-block;">' +
        valuesArray[5] + '</div></div><div class="' + (Extra_when ? 'stream_info_live_title_single_line' : 'stream_info_live_title') +
        '">' + valuesArray[10] + '</div>' + '<div class="stream_info_live">' +
        (valuesArray[3] !== "" && valuesArray[3] !== null ? STR_STARTED + STR_PLAYING + valuesArray[3] : "") + '</div>' +
        '<div style="line-height: 1.3ch;"><div class="stream_info_live" style="width: auto; display: inline-block;">' +
        valuesArray[2] + ',' + STR_SPACE + valuesArray[4] + '</div><div class="stream_info_live" style="width: 9ch; display: inline-block; float: right; text-align: right;">' +
        Play_timeS(valuesArray[11]) + '</div></div>' +
        (Extra_when ? ('<div class="stream_info_live">' + STR_WATCHED + Main_videoCreatedAtWithHM(Extra_when) + STR_SPACE +
            STR_UNTIL + Play_timeS(Extra_until) + '</div>') : '') +
        '</div></div></div></div>';
}

//TODO uncomplicate this ifs
function Screens_createCellLive(id, idArray, valuesArray, key, Extra_when, Extra_vodimg, force_VOD) {

    if (!valuesArray[1]) valuesArray[1] = valuesArray[6];

    var ishosting = valuesArray[16],
        image = (force_VOD ? Extra_vodimg : (valuesArray[0].replace("{width}x{height}", Main_VideoSize) + Main_randomimg));

    ScreenObj[key].DataObj[id] = valuesArray;

    return '<div id="' + idArray[3] + id + '" class="' + ScreenObj[key].thumbclass + '"><div id="' + idArray[0] + id + '" class="stream_thumbnail_live"><div class="stream_thumbnail_live_img"><img id="' +
        idArray[1] + id + '" class="stream_img" alt="" src="' + image + '" onerror="this.onerror=null;this.src=\'' + ScreenObj[key].img_404 +
        '\';" ></div><div class="stream_thumbnail_live_text_holder"><div class="stream_text_holder"><div style="line-height: 1.6ch;"><div id="' +
        idArray[2] + id + '" class="stream_info_live_name" style="width:' + (ishosting ? 99 : 66) + '%; display: inline-block;">' +
        '<i class="icon-' + (valuesArray[8] ? 'refresh' : 'circle') + ' live_icon strokedeline' + (force_VOD ? ' hideimp' : '') + '" style="color: ' +
        (valuesArray[8] ? '#FFFFFF' : ishosting ? '#FED000' : 'red') + ';"></i> ' +
        (Extra_vodimg || force_VOD ?
            ('<div class="vodicon_text ' + (force_VOD ? '' : 'hideimp') + '" style="background: #00a94b;">&nbsp;&nbsp;VOD&nbsp;&nbsp;</div>&nbsp;') :
            '<div style="display: none;"></div>') + //empty div to prevent error when childNodes[2].classList.remove
        valuesArray[1] + '</div><div class="stream_info_live" style="width:' + (ishosting ? 0 : 33) + '%; float: right; text-align: right; display: inline-block;">' +
        valuesArray[5] + '</div></div><div class="' +
        (Extra_when ? 'stream_info_live_title_single_line' : 'stream_info_live_title') + '">' + Main_ReplaceLargeFont(twemoji.parse(valuesArray[2])) + '</div>' +
        '<div class="stream_info_live">' + (valuesArray[3] !== "" ? STR_PLAYING + valuesArray[3] : "") +
        '</div><div class="stream_info_live">' + valuesArray[11] + valuesArray[4] + '</div>' +
        (Extra_when ? ('<div class="stream_info_live">' + STR_WATCHED + Main_videoCreatedAtWithHM(Extra_when) + STR_SPACE +
            STR_UNTIL + Play_timeMs(Extra_when - (new Date(valuesArray[12]).getTime())) + '</div>') : '') +
        '</div></div></div></div>';
}

function Screens_loadDataSuccessFinish(key) {
    //Main_Log('Screens_loadDataSuccessFinish ' + ScreenObj[key].screen);
    ScreenObj[key].FirstRunEnd = true;
    if (!ScreenObj[key].status) {

        if (ScreenObj[key].emptyContent) {
            if (Screens_IsInUse(key)) Main_showWarningDialog(ScreenObj[key].empty_str());
        } else {

            ScreenObj[key].status = true;
            var i, Cells_length = ScreenObj[key].Cells.length;

            for (i = 0; i < (Cells_length < ScreenObj[key].visiblerows ? Cells_length : ScreenObj[key].visiblerows); i++) {
                if (ScreenObj[key].Cells[i]) {
                    ScreenObj[key].tableDoc.appendChild(ScreenObj[key].Cells[i]);
                    ScreenObj[key].Cells[i].style.position = '';
                    ScreenObj[key].Cells[i].style.transition = 'none';
                }
            }

            //Show screen to calculated Screens_setOffset as display none doesn't allow calculation
            //var SceneNotShowing = !Main_isScene1DocVisible();
            var ScrollDocNotShowing = !Main_isElementShowingWithEle(ScreenObj[key].ScrollDoc);

            //if (SceneNotShowing || ScrollDocNotShowing) {
            if (ScrollDocNotShowing) {
                // if (SceneNotShowing) {
                //     Main_AddClassWitEle(Main_Scene1Doc, 'opacity_zero');
                //     Main_showScene1Doc();
                // }
                //if (ScrollDocNotShowing) {
                Main_AddClassWitEle(ScreenObj[key].ScrollDoc, 'opacity_zero');
                Main_ShowElementWithEle(ScreenObj[key].ScrollDoc);
                //}

                Screens_setOffset(1, 0, key);

                //if (ScrollDocNotShowing) {
                Main_HideElementWithEle(ScreenObj[key].ScrollDoc);
                //}
                Main_RemoveClassWithEle(ScreenObj[key].ScrollDoc, 'opacity_zero');

                // if (SceneNotShowing) {
                //     Main_hideScene1Doc();
                // }
                // Main_RemoveClassWithEle(Main_Scene1Doc, 'opacity_zero');
            } else Screens_setOffset(1, 0, key);

            for (i = 0; i < (Cells_length < ScreenObj[key].visiblerows ? Cells_length : ScreenObj[key].visiblerows); i++) {
                if (ScreenObj[key].Cells[i]) {
                    ScreenObj[key].Cells[i].style.transform = 'translateY(' + (i * ScreenObj[key].offsettop) + 'em)';
                }
            }

        }
        ScreenObj[key].isRefreshing = false;
        Screens_Some_Screen_Is_Refreshing = false;
        Screens_SetAutoRefresh(key);

        if (Main_FirstRun) {
            //Main_Log('Main_FirstRun ' + Main_FirstRun);

            if (Main_values.Never_run_new)
                Main_showControlsDialog(ScreenObj[key].key_fun, ScreenObj[key].key_controls);

            if (Main_values.Never_run_phone && !Main_isTV) {
                Main_showphoneDialog(Main_values.Never_run_new ?
                    ScreenObj[key].key_controls : ScreenObj[key].key_fun, ScreenObj[key].key_controls);
            }

            if (!Main_values.Never_run_new) Screens_addFocus(true, key);

            Main_values.Never_run_new = false;
            Main_values.Never_run_phone = false;

            Main_SaveValues();
            Screens_loadDataSuccessFinishEnd();

        } else {

            Screens_addFocus(true, key);
            Main_SaveValues();
            if (Screens_IsInUse(key)) Main_HideLoadDialog();

        }

    } else if (Main_isElementShowingWithEle(ScreenObj[key].ScrollDoc)) {

        Main_CounterDialog(ScreenObj[key].posX, ScreenObj[key].posY, ScreenObj[key].ColoumnsCount, ScreenObj[key].itemsCount);

    }
}

function Screens_SetAutoRefresh(key) {

    if (Settings_Obj_default("auto_refresh_screen") && Settings_Obj_default("auto_refresh_background") &&
        (key !== Main_SearchGames && key !== Main_SearchLive && ScreenObj[key].screenType !== 4)) {

        Screens_CheckAutoRefresh(key, Settings_GetAutoRefreshTimeout());

    } else Main_clearTimeout(ScreenObj[key].AutoRefreshId);

}

function Screens_CheckAutoRefresh(key, timeout) {

    ScreenObj[key].AutoRefreshId = Main_setTimeout(
        function() {
            if (!ScreenObj[key].isRefreshing) {//the screen is not refreshing

                if (Main_isStoped ||
                    ((!Main_isScene1DocVisible() && (ScreenObj[key].screenType !== 2 || (!PlayClip_isOn && !PlayClip_OpenAVod))) || //The screen is not showing and is not a clip screen and clip is not playing as clip has the featuring play next that only works if no refresh happens
                        (key !== Main_values.Main_Go))) {//the screen is not selected

                    if (!Screens_Some_Screen_Is_Refreshing) {
                        Screens_StartLoad(key);
                    } else Screens_CheckAutoRefresh(key, 5000);

                } else Screens_SetAutoRefresh(key);

            }
        },
        timeout,
        ScreenObj[key].AutoRefreshId
    );

}

var Screens_CheckRefreshAfterResumeId;
function Screens_CheckRefreshAfterResume() {

    if (Settings_Obj_default("auto_refresh_screen") && Settings_Obj_default("auto_refresh_background")) {

        var i = 0, run = 1, len = Main_HistoryClip + 1, date = new Date().getTime(), UserIsSet = AddUser_UserIsSet();

        for (i; i < len; i++) {

            if (ScreenObj[i] && ScreenObj[i].lastRefresh &&
                (i !== Main_SearchGames && i !== Main_SearchLive && ScreenObj[i].screenType !== 4) &&
                (UserIsSet || !ScreenObj[i].IsUser) && //prevent check a user screen in case all users have be deleted
                date > (ScreenObj[i].lastRefresh + Settings_GetAutoRefreshTimeout())) {

                Screens_CheckAutoRefresh(i, run * 5000);
                run++;

            }

        }

    }

}

var CheckAccessibilityWasVisible = false;

function Screens_handleKeyControls(key, event) {
    //Main_Log('Screens_handleKeyControls ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_ENTER:
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            if (Main_CheckAccessibilityVisible()) {
                CheckAccessibilityWasVisible = true;
                Main_removeEventListener("keydown", Main_CheckAccessibilityKey);
                Main_HideElement('dialog_accessibility');
            } else CheckAccessibilityWasVisible = false;

            if (Main_isphoneDialogVisible()) {
                Main_HidephoneDialog();
                break;
            }

            Main_HideControlsDialog();
            Main_HideAboutDialog();
            Main_removeEventListener("keydown", ScreenObj[key].key_controls);

            if (CheckAccessibilityWasVisible) Main_CheckAccessibilitySet();
            else {

                Main_addEventListener("keydown", ScreenObj[key].key_fun);
                if (ScreenObj[key].addFocus) Screens_addFocus(true, key);
                else ScreenObj[key].init_fun();

            }

            break;
        default:
            break;
    }
}

function Screens_loadDataSuccessFinishEnd(SkipHidedialog) {
    Main_FirstRun = false;
    if (!SkipHidedialog) Main_HideLoadDialog();
    Main_ShowElement('topbar');
    Main_ShowElement('clock_holder');
    Main_ShowElement('side_panel_new_holder');
    AddUser_UpdateSidepanelAfterShow();

    if (Main_values.Sidepannel_IsUser) Sidepannel_SetUserLables();
    else Sidepannel_SetDefaultLables();

    Sidepannel_SetTopOpacity(Main_values.Main_Go);
    Main_CheckAccessibility(true);
    //Make sure the service is stop
    //Main_Log('Screens_loadDataSuccessFinishEnd');
}

function Screens_addFocus(forceScroll, key) {

    if (ScreenObj[key].emptyContent) {
        if (ScreenObj[key].HasSwitches) ScreenObj[key].posY = -1;
        else {
            ScreenObj[key].key_exit(ScreenObj[key].emptyContent);
            return;
        }
    }

    if (ScreenObj[key].posY < 0) {
        Screens_addFocusFollow(key);

        if (!ScreenObj[key].emptyContent && key === Main_values.Main_Go && !Settings_isVisible())
            Main_CounterDialog(ScreenObj[key].posX, ScreenObj[key].posY + 1, ScreenObj[key].ColoumnsCount, ScreenObj[key].itemsCount);

        return;
    }

    //Load more as the data is getting used
    if (ScreenObj[key].data) {
        if ((ScreenObj[key].posY > 2) && (ScreenObj[key].data_cursor + Main_ItemsLimitMax) > ScreenObj[key].data.length && !ScreenObj[key].dataEnded && !ScreenObj[key].loadingData) {

            Screens_loadDataRequestStart(key);

        } else if ((ScreenObj[key].posY + ScreenObj[key].ItemsReloadLimit) > (ScreenObj[key].itemsCount / ScreenObj[key].ColoumnsCount) && ScreenObj[key].data_cursor < ScreenObj[key].data.length) {

            ScreenObj[key].loadDataSuccess();

        }
    }

    ScreenObj[key].addrow(forceScroll, ScreenObj[key].posY, key);

}

function Screens_LoadPreviewSTop(PreventCleanQualities) {
    Main_clearTimeout(Screens_LoadPreviewId);

    if (Main_IsOn_OSInterface && Play_PreviewId && !PreventCleanQualities) {

        OSInterface_ClearSidePanelPlayer();
        Play_CheckIfIsLiveCleanEnd();

    }
}

function Screens_GetObj(key) {
    return Main_Slice(ScreenObj[key].DataObj[ScreenObj[key].posY + '_' + ScreenObj[key].posX]);
}

function Screens_ObjNotNull(key) {
    return Boolean(ScreenObj[key].DataObj[ScreenObj[key].posY + '_' + ScreenObj[key].posX]);
}

var Screens_LoadPreviewId;
//Clips load too fast, so only call this function after animations have ended
//Also help to prevent lag on animation
function Screens_LoadPreview(key) {

    if (ScreenObj[key].PreviewEnable && !Main_isStoped && Screens_IsInUse(key) &&
        !Main_ThumbOpenIsNull(ScreenObj[key].posY + '_' + ScreenObj[key].posX, ScreenObj[key].ids[0])) {

        if (Screens_ObjNotNull(key)) {
            var id = 0,//Clip
                obj = Screens_GetObj(key);

            if (ScreenObj[key].screenType === 0) id = 14;//live
            else if (ScreenObj[key].screenType === 1) id = 7;//vod

            var ThumbId = obj[id];//streamer id

            if (ScreenObj[key].screen === Main_HistoryLive) {

                var index = AddUser_UserIsSet() ? Main_history_Exist('live', obj[7]) : -1;

                if (index > -1 && Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

                    ThumbId = Main_values_History_data[AddUser_UsernameArray[0].id].live[index].vodid;

                }
            }

            if ((!Play_PreviewId || !Main_A_equals_B(ThumbId, Play_PreviewId)) && !Play_PreviewVideoEnded) {

                Screens_LoadPreviewId = Main_setTimeout(
                    function() {

                        Screens_LoadPreviewStart(key, obj);

                    },
                    DefaultPreviewDelay + Settings_Obj_values('show_feed_player_delay'),
                    Screens_LoadPreviewId
                );

            } else if (Play_PreviewId) {

                Screens_LoadPreviewRestore(key);

            }

            Play_PreviewVideoEnded = false;
        }

    }
}

function Screens_LoadPreviewRestore(key) {
    if (Main_values.Main_Go === Main_ChannelContent) {
        ChannelContent_LoadPreviewRestore();
        return;
    }

    var img = Main_getElementById(ScreenObj[key].ids[1] + ScreenObj[key].posY + '_' + ScreenObj[key].posX);
    var Rect = img.parentElement.getBoundingClientRect();

    OSInterface_ScreenPlayerRestore(
        Rect.bottom,
        Rect.right,
        Rect.left,
        window.innerHeight,
        ScreenObj[key].screenType + 1
    );

    Screens_ClearAnimation(key);
    Main_AddClassWitEle(img, 'opacity_zero');
}

function Screens_LoadPreviewStart(key, obj) {
    Play_CheckIfIsLiveCleanEnd();

    if (!Main_IsOn_OSInterface) {
        return;
    }

    var id, token, link, isVod;

    if (ScreenObj[key].screenType === 2) {//clip

        OSInterface_GetMethodUrlHeadersAsync(
            PlayClip_BaseUrl,//urlString
            DefaultHttpGetTimeout,//timeout
            PlayClip_postMessage.replace('%x', obj[0]),//postMessage, null for get
            'POST',//Method, null for get
            Play_base_backup_headers,//JsonString
            'Screens_LoadPreviewResult',//callback
            (((ScreenObj[key].posY * ScreenObj[key].ColoumnsCount) + ScreenObj[key].posX) % 100),//checkResult
            key,//key
            51//thread
        );

        return;
    } else if (ScreenObj[key].screenType === 1) {//vod

        isVod = true;
        id = obj[7];
        token = Play_vod_token;
        link = Play_vod_links;

    } else {//live

        if (ScreenObj[key].screen === Main_HistoryLive) {

            var index = AddUser_UserIsSet() ? Main_history_Exist('live', obj[7]) : -1;

            if (index > -1) {

                if (Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

                    isVod = true;
                    id = Main_values_History_data[AddUser_UsernameArray[0].id].live[index].vodid;
                    token = Play_vod_token;
                    link = Play_vod_links;

                } else {

                    id = obj[6];
                    token = Play_live_token;
                    link = Play_live_links;
                }

            } else {

                id = obj[6];
                token = Play_live_token;
                link = Play_live_links;
            }


        } else {

            id = obj[6];
            token = Play_live_token;
            link = Play_live_links;

        }
    }

    OSInterface_CheckIfIsLiveFeed(
        PlayClip_BaseUrl,
        link.replace('%x', id),
        "Screens_LoadPreviewResult",
        key,
        (((ScreenObj[key].posY * ScreenObj[key].ColoumnsCount) + ScreenObj[key].posX) % 100),
        DefaultHttpGetTimeout,
        isVod,
        token.replace('%x', id)
    );

}

function Screens_LoadPreviewResult(StreamData, x, y) {//Called by Java

    if (!Main_isStoped && Screens_IsInUse(x) && !Main_isElementShowing('dialog_thumb_opt') &&
        y === (((ScreenObj[x].posY * ScreenObj[x].ColoumnsCount) + ScreenObj[x].posX) % 100) &&
        (ScreenObj[x].posY + '_' + ScreenObj[x].posX) === ScreenObj[x].focusPos) {

        if (StreamData && Screens_ObjNotNull(x)) {

            var StreamDataObj = JSON.parse(StreamData),
                StreamInfo = Screens_GetObj(x),
                index,
                UserIsSet = AddUser_UserIsSet();

            if (StreamDataObj.status === 200) {

                Play_PreviewURL = StreamDataObj.url;
                Play_PreviewResponseText = StreamDataObj.responseText;

                var offset = 0,
                    PreviewResponseText = Play_PreviewResponseText,
                    lang,
                    who_called;

                if (ScreenObj[x].screenType === 2) {//clip

                    Play_PreviewId = StreamInfo[0];
                    Play_PreviewResponseText = PlayClip_QualityGenerate(PreviewResponseText);

                    if (Play_PreviewResponseText.length) {

                        var clipID = PlayClip_SetQuality(Play_PreviewResponseText);
                        PlayClip_quality = Play_PreviewResponseText[clipID].id;
                        PlayClip_qualityPlaying = PlayClip_quality;

                        Play_PreviewURL = Play_PreviewResponseText[clipID].url;
                        lang = StreamInfo[17];
                        who_called = 3;

                    } else {

                        Screens_LoadPreviewResultError(UserIsSet, StreamInfo, StreamDataObj, x);
                        return;

                    }

                } else if (ScreenObj[x].screenType === 1) {//vod
                    Play_PreviewId = StreamInfo[7];

                    if (Settings_Obj_default('vod_dialog') < 2) {

                        //Check if the vod exist in the history
                        var VodIdex = UserIsSet ? Main_history_Exist('vod', Play_PreviewId) : -1;
                        offset = (VodIdex > -1) ?
                            Main_values_History_data[AddUser_UsernameArray[0].id].vod[VodIdex].watched : 0;

                        //Check if the vod saved position is bigger then 0 means thisvod was already watched
                        if (!offset) {

                            VodIdex = UserIsSet ? Main_history_Find_Vod_In_Live(Play_PreviewId) : -1;

                            if (VodIdex > -1) {

                                offset =
                                    ((Main_values_History_data[AddUser_UsernameArray[0].id].live[VodIdex].date - (new Date(StreamInfo[12]).getTime())) / 1000);
                            }

                        }
                    }

                    lang = StreamInfo[9];
                    who_called = 2;

                } else {//live
                    who_called = 1;

                    if (ScreenObj[x].screen === Main_HistoryLive) {
                        index = UserIsSet ? Main_history_Exist('live', StreamInfo[7]) : -1;

                        if (index > -1) {

                            //Live that is now a vod
                            if (Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

                                Play_PreviewId = Main_values_History_data[AddUser_UsernameArray[0].id].live[index].vodid;

                                offset =
                                    ((Main_values_History_data[AddUser_UsernameArray[0].id].live[index].date - (new Date(StreamInfo[12]).getTime())) / 1000);

                                who_called = 2;
                            } else {//Live

                                Play_PreviewId = StreamInfo[14];

                            }

                        }

                    } else {
                        Play_PreviewId = StreamInfo[14];

                    }

                    lang = StreamInfo[16] ? 'HOSTING' : StreamInfo[15];
                }

                var img = Main_getElementById(ScreenObj[x].ids[1] + ScreenObj[x].posY + '_' + ScreenObj[x].posX);
                var Rect = img.parentElement.getBoundingClientRect();

                OSInterface_StartScreensPlayer(
                    Play_PreviewURL,
                    PreviewResponseText,
                    offset * 1000,
                    Rect.bottom,
                    Rect.right,
                    Rect.left,
                    window.innerHeight,
                    who_called
                );

                Screens_ClearAnimation(x);
                Main_AddClassWitEle(img, 'opacity_zero');

                if (offset) {
                    Main_showWarningDialog(
                        STR_SHOW_VOD_PLAYER_WARNING + STR_SPACE + Play_timeMs(offset * 1000),
                        2000,
                        !ScreenObj[x].Cells[ScreenObj[x].posY + 1]
                    );
                }

                Main_EventPreview(
                    'Preview_screen',
                    StreamInfo[6],
                    StreamInfo[3],
                    lang,
                    ScreenObj[x].ScreenName
                );

            } else {

                Screens_LoadPreviewResultError(UserIsSet, StreamInfo, StreamDataObj, x);
            }

        }
    }

}

function Screens_LoadPreviewResultError(UserIsSet, StreamInfo, StreamDataObj, x) {

    var error = StreamInfo[6] + STR_SPACE;

    if (ScreenObj[x].screenType === 2) {

        error += 'CLIP' + STR_PREVIEW_ERROR_LINK;

    } else if (ScreenObj[x].screen === Main_HistoryLive && StreamDataObj.status !== 1 && StreamDataObj.status !== 403) {

        var index = UserIsSet ? Main_history_Exist('live', StreamInfo[7]) : -1;

        if (index > -1) {

            if (Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

                error = STR_PREVIEW_ERROR_LOAD + STR_SPACE + 'VOD' + STR_PREVIEW_ERROR_LINK + STR_PREVIEW_VOD_DELETED;

            }

        }

    } else {

        error += Play_CheckIfIsLiveGetEror(StreamDataObj, ScreenObj[x].screenType === 1);

    }

    Screens_LoadPreviewWarn(
        error,
        x,
        4000
    );

}

function Screens_LoadPreviewWarn(ErrorText, x, time) {
    Play_CheckIfIsLiveCleanEnd();
    Main_RemoveClass(ScreenObj[x].ids[1] + ScreenObj[x].posY + '_' + ScreenObj[x].posX, 'opacity_zero');
    Main_showWarningDialog(
        ErrorText,
        time
    );
}

function Screens_addrowAnimated(y, y_plus, y_plus_offset, for_in, for_out, for_offset, eleRemovePos, down, key) {
    Screens_ChangeFocusAnimationFinished = false;
    Screens_ChangeFocusAnimationFast = true;

    ScreenObj[key].Cells[y + y_plus].style.transform = 'translateY(' + (y_plus_offset * ScreenObj[key].offsettop) + 'em)';

    if (down) ScreenObj[key].tableDoc.appendChild(ScreenObj[key].Cells[y + y_plus]);
    else ScreenObj[key].tableDoc.insertBefore(ScreenObj[key].Cells[y + y_plus], ScreenObj[key].tableDoc.childNodes[ScreenObj[key].HasSwitches ? 1 : 0]);

    //Delay to make sure ScreenObj[key].Cells[y + y_plus] is added and it's position is ready
    Main_ready(function() {

        //First calculate the changes then set it
        var array = [],
            i = for_in,
            pos;

        for (i; i < for_out; i++) {

            pos = y + i;

            if (ScreenObj[key].Cells[pos]) {

                ScreenObj[key].Cells[pos].style.transition = '';

                array.push(
                    {
                        transform: 'translateY(' + (ScreenObj[key].offsettop * (for_offset + i)) + 'em)',
                        pos: pos
                    }
                );

            }
        }

        var len = array.length;
        i = 0;

        for (i; i < len; i++) {

            ScreenObj[key].Cells[array[i].pos].style.transform = array[i].transform;

        }

        Main_setTimeout(
            function() {

                UserLiveFeed_RemoveElement(ScreenObj[key].Cells[y + eleRemovePos]);
                Screens_ChangeFocusAnimationFinished = true;

                //Delay to make sure it happen after animation has ended
                Main_setTimeout(
                    function() {
                        Screens_LoadPreview(key);

                    },
                    25
                );

            },
            Screens_ScrollAnimationTimeout
        );
    });
}

function Screens_addrowNotAnimated(y, y_plus, for_in, for_out, for_offset, eleRemovePos, down, key) {

    if (down) ScreenObj[key].tableDoc.appendChild(ScreenObj[key].Cells[y + y_plus]);
    else ScreenObj[key].tableDoc.insertBefore(ScreenObj[key].Cells[y + y_plus], ScreenObj[key].tableDoc.childNodes[ScreenObj[key].HasSwitches ? 1 : 0]);

    for (var i = for_in; i < for_out; i++) {
        if (ScreenObj[key].Cells[y + i]) {
            ScreenObj[key].Cells[y + i].style.transition = 'none';
            ScreenObj[key].Cells[y + i].style.transform = 'translateY(' + ((for_offset + i) * ScreenObj[key].offsettop) + 'em)';
        }
    }

    UserLiveFeed_RemoveElement(ScreenObj[key].Cells[y + eleRemovePos]);

    Screens_LoadPreview(key);
}

function Screens_addrowChannel(forceScroll, y, key) {
    if (ScreenObj[key].currY < y) { // down

        if (y > 2) Screens_addrowChannelDown(y, key);

    } else if (ScreenObj[key].currY > y) { // Up


        if (y > 1 && (ScreenObj[key].Cells.length) > (y + 3)) {

            if (Screens_ChangeFocusAnimationFinished && Screens_SettingDoAnimations &&
                !Screens_ChangeFocusAnimationFast) { //If with animation

                Screens_addrowAnimated(
                    y,
                    -2, //y_plus
                    -2,  //y_plus_offset
                    -2, //for_in
                    6,  //for_out
                    2,  //for_offset
                    3,  //eleRemovePos
                    0,  //down?
                    key
                );

            } else {

                Screens_addrowNotAnimated(
                    y,
                    -2, //y_plus
                    -2, //for_in
                    6,  //for_out
                    2,  //for_offset
                    3,   //eleRemovePos
                    0,  //down?
                    key
                );

            }
        }
    }

    ScreenObj[key].currY = ScreenObj[key].posY;
    Screens_addrowEnd(forceScroll, key);
}

function Screens_addrowChannelDown(y, key) {
    if (ScreenObj[key].Cells[y + 2]) {

        if (Screens_ChangeFocusAnimationFinished && Screens_SettingDoAnimations &&
            !Screens_ChangeFocusAnimationFast) { //If with animation

            Screens_addrowAnimated(
                y,
                2,  //y_plus
                4,  //y_plus_offset
                -2, //for_in
                5,  //for_out
                2,  //for_offset
                -3, //eleRemovePos
                1,  //down?
                key
            );

        } else {

            Screens_addrowNotAnimated(
                y,
                2,  //y_plus
                -2, //for_in
                5,  //for_out
                2,  //for_offset
                -3,  //eleRemovePos
                1,  //down?
                key
            );
        }

    } else if (ScreenObj[key].loadingData) {
        //Technically we will not get here because
        //Key down or right (ScreenObj[key].Cells.length - 1) >= (ScreenObj[key].posY + 3) will hold the screen
        //but this works, the issue is related to slow to load more content
        //Only happens if scroll too fast
        Main_setTimeout(
            function() {
                Screens_addrowChannelDown(y, key);
            },
            10
        );
    }
}

function Screens_addrow(forceScroll, y, key) {
    if (ScreenObj[key].currY < y) { // down
        Screens_addrowDown(y, key);
    } else if (ScreenObj[key].currY > y) { // Up

        if (y && (ScreenObj[key].Cells.length) > (y + 1) && ScreenObj[key].Cells[y + 2]) {

            if (Screens_ChangeFocusAnimationFinished && Screens_SettingDoAnimations &&
                !Screens_ChangeFocusAnimationFast) { //If with animation

                Screens_addrowAnimated(
                    y,
                    -1, //y_plus
                    -1, //y_plus_offset
                    -1, //for_in
                    3,  //for_out
                    1,  //for_offset
                    2,  //eleRemovePos
                    0,  //down?
                    key
                );

            } else {

                Screens_addrowNotAnimated(
                    y,
                    -1, //y_plus
                    -1, //for_in
                    3,  //for_out
                    1,  //for_offset
                    2,  //eleRemovePos
                    0,  //down?
                    key
                );
            }

        } else {

            Main_setTimeout(
                function() {
                    Screens_LoadPreview(key);
                },
                y ? 0 : Screens_ScrollAnimationTimeout
            );
        }

    } else Screens_LoadPreview(key);

    ScreenObj[key].currY = ScreenObj[key].posY;
    Screens_addrowEnd(forceScroll, key);
}

function Screens_addrowDown(y, key) {
    if (y > 1 && ScreenObj[key].Cells[y + 1]) {

        if (Screens_ChangeFocusAnimationFinished && Screens_SettingDoAnimations &&
            !Screens_ChangeFocusAnimationFast) { //If with animation

            Screens_addrowAnimated(
                y,
                1,  //y_plus
                3,  //y_plus_offset
                -1, //for_in
                2,  //for_out
                1,  //for_offset
                -2, //eleRemovePos
                1,  //down?
                key
            );

        } else {

            Screens_addrowNotAnimated(
                y,
                1,  //y_plus
                -1, //for_in
                2,  //for_out
                1,  //for_offset
                -2, //eleRemovePos
                1,   //down?
                key
            );

        }

    } else if (ScreenObj[key].loadingData) {
        //Technically we will not get here because
        //Key down or right (ScreenObj[key].Cells.length - 1) >= (ScreenObj[key].posY + 3) will hold the screen
        //but this works, the issue is related to slow to load more content
        //Only happens if scroll too fast
        Main_setTimeout(
            function() {
                Screens_addrowDown(y, key);
            },
            10
        );
    } else {
        Main_setTimeout(
            function() {
                Screens_LoadPreview(key);
            },
            y ? Screens_ScrollAnimationTimeout : 0
        );
    }
}

function Screens_addrowEnd(forceScroll, key) {
    Main_ready(function() {

        if (!ScreenObj[key].Cells[ScreenObj[key].posY]) return;

        var id = ScreenObj[key].posY + '_' + ScreenObj[key].posX;

        Main_AddClass(ScreenObj[key].ids[0] + id, Main_classThumb);
        ScreenObj[key].focusPos = id;

        if (ScreenObj[key].screenType === 1 || ScreenObj[key].screenType === 2) {

            if (Screens_ObjNotNull(key)) {

                var data = Screens_GetObj(key);

                if (Main_history_Watched_Obj[data[7]])
                    Main_getElementById(ScreenObj[key].ids[7] + id).style.width = Main_history_Watched_Obj[data[7]] + '%';

            }

        }

        ScreenObj[key].addFocus(forceScroll, key);

        if (key === Main_values.Main_Go && !Settings_isVisible())
            Main_CounterDialog(ScreenObj[key].posX, ScreenObj[key].posY, ScreenObj[key].ColoumnsCount, ScreenObj[key].itemsCount);

    });
}

function Screens_setOffset(pos, y, key) {
    if (!ScreenObj[key].offsettop || ScreenObj[key].offsettopFontsize !== Settings_Obj_default('global_font_offset')) {
        pos = !y ? (y + pos) : y;
        if (ScreenObj[key].Cells[pos]) {

            ScreenObj[key].offsettop =
                (Main_getElementById(ScreenObj[key].ids[6] + pos).offsetHeight + Main_getElementById(ScreenObj[key].ids[0] + pos + '_0').offsetTop) / BodyfontSize;

        } else ScreenObj[key].offsettop = 1;

        ScreenObj[key].offsettopFontsize = Settings_Obj_default('global_font_offset');
    }
}

function Screens_addFocusChannel(forceScroll, key) {
    var y = ScreenObj[key].posY;

    if (Main_YchangeAddFocus(y) || forceScroll) {

        if (y > 1) {

            //Channels is a odd screen as thumb are small it need a minor workaround to get all working
            //TODO revise this for a simple implementation
            if (ScreenObj[key].Cells.length < 6) {
                if (ScreenObj[key].Cells[y + 1] && (y + 2) < ScreenObj[key].Cells.length || ScreenObj[key].Cells.length === 4)
                    ScreenObj[key].ScrollDoc.style.transform = 'translateY(-' + ScreenObj[key].offsettop + 'em)';
                else if (ScreenObj[key].Cells.length > 3)
                    ScreenObj[key].ScrollDoc.style.transform = 'translateY(-' + (ScreenObj[key].offsettop * 2) + 'em)';
            } else {
                if (ScreenObj[key].Cells[y + 2])
                    ScreenObj[key].ScrollDoc.style.transform = 'translateY(-' + ScreenObj[key].offsettop + 'em)';
                else
                    ScreenObj[key].ScrollDoc.style.transform = 'translateY(-' + (ScreenObj[key].offsettop * 2) + 'em)';
            }

        } else ScreenObj[key].ScrollDoc.style.transform = '';

    }
}

function Screens_addFocusVideo(forceScroll, key) {
    var y = ScreenObj[key].posY;

    if (Main_YchangeAddFocus(y) || forceScroll) {

        if (!y) ScreenObj[key].ScrollDoc.style.transform = '';
        else if (y === 1) {

            if (ScreenObj[key].Cells[y + 1]) //We didn't reach the bottom yet
                ScreenObj[key].ScrollDoc.style.transform = 'translateY(-' + ScreenObj[key].offsettop + 'em)';

        }
    }
}

function Screens_ChangeFocus(y, x, key) {
    Screens_RemoveFocus(key);

    Screens_ClearAnimation(key);
    ScreenObj[key].posY += y;
    ScreenObj[key].posX = x;

    Screens_addFocus(false, key);
}

function Screens_RemoveFocus(key) {
    if (!ScreenObj[key].itemsCount) return;

    if (ScreenObj[key].posY > -1) Main_removeFocus(ScreenObj[key].posY + '_' + ScreenObj[key].posX, ScreenObj[key].ids);
    else if (ScreenObj[key].HasSwitches) Screens_removeFocusFollow(key);
}

function Screens_addFocusFollow(key) {

    if (!ScreenObj[key].FirstRunEnd) return;

    if (ScreenObj[key].posX > ScreenObj[key].SwitchesIcons.length - 1) ScreenObj[key].posX = 0;
    else if (ScreenObj[key].posX < 0) ScreenObj[key].posX = ScreenObj[key].SwitchesIcons.length - 1;

    Main_AddClass(ScreenObj[key].ids[0] + 'y_' + ScreenObj[key].posX, 'stream_switch_focused');
    ScreenObj[key].focusPos = -1;

}

function Screens_removeFocusFollow(key) {
    if (ScreenObj[key].posX > ScreenObj[key].SwitchesIcons.length - 1) ScreenObj[key].posX = 0;
    else if (ScreenObj[key].posX < 0) ScreenObj[key].posX = ScreenObj[key].SwitchesIcons.length - 1;

    Main_RemoveClass(ScreenObj[key].ids[0] + 'y_' + ScreenObj[key].posX, 'stream_switch_focused');
}

function Screens_BasicExit(before, key) {
    if (Main_isControlsDialogVisible()) Main_HideControlsDialog();
    else if (Main_isAboutDialogVisible()) Main_HideAboutDialog();
    else {
        if (before === ScreenObj[key].screen) Main_values.Main_Go = Main_Live;
        else Main_values.Main_Go = before;
        Screens_exit(key);
    }
}

function Screens_KeyUpDown(y, key) {
    if (!ScreenObj[key].FirstRunEnd) return;

    //TODO improve this
    if (ScreenObj[key].HasSwitches && !ScreenObj[key].posY && y === -1 && !ScreenObj[key].emptyContent) {

        Main_removeFocus(ScreenObj[key].posY + '_' + ScreenObj[key].posX, ScreenObj[key].ids);
        Screens_ClearAnimation(key);
        ScreenObj[key].posY = -1;
        if (ScreenObj[key].posX > ScreenObj[key].SwitchesIcons.length - 1) ScreenObj[key].posX = 1;
        Screens_addFocusFollow(key);

    } else if (ScreenObj[key].HasSwitches && (ScreenObj[key].posY) === -1 &&
        ScreenObj[key].DataObj['0_' + ScreenObj[key].posX]) {

        ScreenObj[key].posY = 0;
        Screens_addFocus(false, key);
        Screens_removeFocusFollow(key);

    } else {

        for (var i = 0; i < ScreenObj[key].ColoumnsCount; i++) {
            if (ScreenObj[key].DataObj[(ScreenObj[key].posY + y) + '_' + (ScreenObj[key].posX - i)]) {

                Screens_ChangeFocus(y, ScreenObj[key].posX - i, key);
                return;

            }
        }

    }
}

function Screens_ClearAnimation(key) {
    if (ScreenObj[key].HasAnimateThumb) {

        Main_clearInterval(ScreenObj[key].AnimateThumbId);

        if (Screens_ObjNotNull(key) && ScreenObj[key].FirstRunEnd) {

            Main_getElementById(ScreenObj[key].ids[5] + ScreenObj[key].posY + '_' + ScreenObj[key].posX).style.backgroundSize = 0;

            Main_RemoveClass(ScreenObj[key].ids[1] + ScreenObj[key].posY + '_' + ScreenObj[key].posX, 'opacity_zero');

        }

    }
}

function Screens_KeyLeftRight(y, x, key) {
    if (!ScreenObj[key].FirstRunEnd) return;

    if (ScreenObj[key].HasSwitches && ScreenObj[key].posY === -1) {

        ScreenObj[key].posY = -1;
        Screens_removeFocusFollow(key);
        ScreenObj[key].posX += (!x ? 1 : -1);
        Screens_addFocusFollow(key);

    } else if (ScreenObj[key].DataObj[ScreenObj[key].posY + '_' + (ScreenObj[key].posX + y)]) {

        Screens_ChangeFocus(0, (ScreenObj[key].posX + y), key);

    } else if (ScreenObj[key].DataObj[(ScreenObj[key].posY + y) + '_' + x]) {

        Screens_ChangeFocus(y, x, key);

    }
}

function Screens_OpenSidePanel(forceFeed, key) {
    Screens_RemoveAllFocus(key);
    if (Main_values.Main_Go === Main_aGame) Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
    Screens_ClearAnimation(key);
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideLoadDialog();
    Sidepannel_Start(ScreenObj[key].key_fun, forceFeed);
}

function Screens_RemoveAllFocus(key) {
    if (Screens_ObjNotNull(key) && ScreenObj[key].FirstRunEnd) {

        Main_removeFocus(ScreenObj[key].posY + '_' + ScreenObj[key].posX, ScreenObj[key].ids);

    } else if (ScreenObj[key].posY < 0) {

        Screens_removeFocusFollow(key);
        ScreenObj[key].posY = 0;
        ScreenObj[key].posX = 0;

    }
}

var Screens_handleKeyUpIsClear = false;

function Screens_handleKeyUp(key, e) {
    //Main_Log('Screens_handleKeyUp e.keyCode ' + e.keyCode + ' key ' + key);

    if (e.keyCode === KEY_ENTER) {

        Screens_handleKeyUpClear(key);
        if (!Screens_clear) ScreenObj[key].key_play();

    } else if (e.keyCode === KEY_LEFT) {

        Main_clearTimeout(Screens_KeyEnterID);
        Main_removeEventListener("keyup", ScreenObj[key].key_up);

        if (!Screens_clear) {

            if (!ScreenObj[key].posX) Screens_OpenSidePanel(false, key);
            else {

                Screens_KeyLeftRight(-1, ScreenObj[key].ColoumnsCount - 1, key);
                Main_addEventListener("keydown", ScreenObj[key].key_fun);

            }

        }
    }
    Screens_handleKeyUpIsClear = true;
}

function Screens_handleKeyUpClear(key) {
    Main_clearTimeout(Screens_KeyEnterID);
    Main_removeEventListener("keyup", ScreenObj[key].key_up);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
}

function Screens_handleKeyUpAnimationFast() {
    Screens_ChangeFocusAnimationFast = false;
    Sidepannel_ChangeFocusAnimationFast = false;
    UserLiveFeed_ChangeFocusAnimationFast = false;
}

function Screens_keyRight(key) {
    if (!ScreenObj[key].FirstRunEnd) return;

    //Prevent scroll too fast out of ScreenObj[key].Cells.length
    //here (ScreenObj[key].posY + 3) the 3 is 1 bigger then the 2 in Screens_addrow*Down (ScreenObj[key].Cells[y + 2])
    if (ScreenObj[key].dataEnded ||
        ScreenObj[key].posX < (ScreenObj[key].ColoumnsCount - 1) ||
        (ScreenObj[key].Cells.length - 1) >= (ScreenObj[key].posY + 1)) {

        if (ScreenObj[key].posX === (ScreenObj[key].ColoumnsCount - 1)) {

            if (Screens_ChangeFocusAnimationFinished) Screens_KeyLeftRight(1, 0, key);

        } else Screens_KeyLeftRight(1, 0, key);

    } else Screens_addFocus(true, key);
}


function Screens_handleKeyDown(key, event) {
    //Main_Log('Screens_handleKeyDown ' + event.keyCode + ' key ' + key);
    if (Main_CantClick()) return;

    Main_keyClickDelayStart();

    switch (event.keyCode) {
        case KEY_MEDIA_REWIND:
        case KEY_PG_UP:
            //TODO improve this pg up and down so many unnecessary ifs
            if (ScreenObj[key].key_pgUp) {

                Screens_RemoveAllFocus(key);

                if (ScreenObj[key].screen === Main_UserChannels) {

                    Sidepannel_Go(!AddUser_UsernameArray[0].access_token ? ScreenObj[key].key_pgUpNext : ScreenObj[key].key_pgUp);

                } else if (ScreenObj[key].screen === Main_UserLive) {

                    Sidepannel_Go(Main_History[Main_HistoryPos]);

                } else if (ScreenObj[key].screen === Main_aGame) {

                    if (Main_values.Main_BeforeAgame === Main_usergames) Sidepannel_Go(Main_usergames);
                    else Sidepannel_Go(Main_Featured);

                } else Sidepannel_Go(ScreenObj[key].key_pgUp);
            }
            break;
        case KEY_MEDIA_FAST_FORWARD:
        case KEY_PG_DOWN:
            if (ScreenObj[key].key_pgDown) {

                Screens_RemoveAllFocus(key);

                if (ScreenObj[key].screen === Main_usergames) {

                    Sidepannel_Go(!AddUser_UsernameArray[0].access_token ? ScreenObj[key].key_pgDownNext : ScreenObj[key].key_pgDown);

                } else if (ScreenObj[key].screen === Main_UserChannels) {

                    Sidepannel_Go(Main_History[Main_HistoryPos]);

                } else if (ScreenObj[key].screen === Main_aGame) {

                    if (Main_values.Main_BeforeAgame === Main_usergames) Sidepannel_Go(Main_UserVod);
                    else Sidepannel_Go(Main_Vod);

                } else Sidepannel_Go(ScreenObj[key].key_pgDown);
            }
            break;
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            ScreenObj[key].key_exit();
            break;
        case KEY_LEFT:
            Screens_ThumbOptionSpecial = ScreenObj[key].histPosXName ? false : true;
            Screens_handleKeyUpIsClear = false;

            Main_removeEventListener("keydown", ScreenObj[key].key_fun);
            Main_addEventListener("keyup", ScreenObj[key].key_up);
            Screens_clear = false;

            Screens_KeyEnterID = Main_setTimeout(
                function() {
                    Screens_ThumbOptionStart(key);
                },
                Screens_KeyUptimeout,
                Screens_KeyEnterID
            );
            break;
        case KEY_RIGHT:
            Screens_keyRight(key);
            break;
        case KEY_UP:
            if (Screens_ChangeFocusAnimationFinished) Screens_KeyUpDown(-1, key);
            break;
        case KEY_DOWN:
            //Prevent scroll too fast out of ScreenObj[key].Cells.length
            //here (ScreenObj[key].posY + 3) the 3 is 1 bigger then the 2 in Screens_addrow*Down (ScreenObj[key].Cells[y + 2])
            if (ScreenObj[key].dataEnded ||
                (ScreenObj[key].Cells.length - 1) >= (ScreenObj[key].posY + 1)) {
                if (Screens_ChangeFocusAnimationFinished) Screens_KeyUpDown(1, key);
            } else {
                Screens_addFocus(true, key);
            }
            break;
        case KEY_1:
        case KEY_PLAY:
        case KEY_PLAYPAUSE:
        case KEY_KEYBOARD_SPACE:
        case KEY_MEDIA_PREVIOUS:
            ScreenObj[key].key_play();
            break;
        case KEY_ENTER:
            Main_removeEventListener("keydown", ScreenObj[key].key_fun);
            Main_addEventListener("keyup", ScreenObj[key].key_up);
            Screens_clear = false;
            Screens_KeyEnterID = Main_setTimeout(Main_ReloadScreen, Screens_KeyUptimeout, Screens_KeyEnterID);
            break;
        case KEY_MEDIA_NEXT:
        case KEY_REFRESH:
            Main_ReloadScreen();
            break;
        case KEY_PAUSE://key s
        case KEY_6:
            Screens_RemoveFocus(key);
            Main_showSettings();
            break;
        case KEY_A:
        case KEY_7:
            Screens_RemoveFocus(key);
            Main_showAboutDialog(ScreenObj[key].key_fun, ScreenObj[key].key_controls);
            break;
        case KEY_C:
        case KEY_8:
            Screens_RemoveFocus(key);
            Main_showControlsDialog(ScreenObj[key].key_fun, ScreenObj[key].key_controls);
            break;
        case KEY_E:
        case KEY_9:
            Screens_RemoveFocus(key);
            Main_removeEventListener("keydown", ScreenObj[key].key_fun);
            Main_showExitDialog();
            break;
        case KEY_U:
            Screens_RemoveFocus(key);
            Main_UpdateDialogShowCheck();
            break;
        case KEY_CHAT:
            var UserIsSet = AddUser_UserIsSet();
            Screens_OpenSidePanel(UserIsSet, key);
            if (!UserIsSet) {
                Main_showWarningDialog(STR_NOKUSER_WARN, 2000);
            }
            break;
        default:
            break;
    }
}

function AGame_headerOptions(key) {
    if (!ScreenObj[key].posX) {
        Main_values.Main_Go = Main_AGameVod;
        Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
        AGame_headerOptionsExit(key);
        Main_SwitchScreen();
    } else {
        Main_values.Main_Go = Main_AGameClip;
        Main_values.Main_OldgameSelected = Main_values.Main_gameSelected;
        AGame_headerOptionsExit(key);
        Main_SwitchScreen();
    }
}

function AGame_headerOptionsExit(key) {

    if (ScreenObj[key].status && ScreenObj[key].posY === -1) {

        Screens_removeFocusFollow(key);
        ScreenObj[key].posY = 0;
        ScreenObj[key].posX = 0;
        Main_AddClass(ScreenObj[key].ids[0] + '0_' + ScreenObj[key].posX, Main_classThumb);

    }

    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElementWithEle(ScreenObj[key].ScrollDoc);
}

var Screens_PeriodDialogID;
var Screens_PeriodDialogPos = 0;

function Screens_PeriodStart(key) {
    Screens_setPeriodDialog(key);
    Main_ShowElement('dialog_period');
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_addEventListener("keydown", ScreenObj[key].key_period);
}

function Screens_SetPeriodDialogId(key) {
    Screens_PeriodDialogID = Main_setTimeout(
        function() {
            Screens_PeriodDialogHide(key);
        },
        Screens_DialogHideTimout,
        Screens_PeriodDialogID
    );
}

function Screens_setPeriodDialog(key) {
    Screens_PeriodDialogPos = ScreenObj[key].periodPos;
    Screens_PeriodAddFocus(Screens_PeriodDialogPos);
    Screens_SetPeriodDialogId(key);
}

function Screens_PeriodDialogHide(key) {
    Main_clearTimeout(Screens_PeriodDialogID);
    Screens_PeriodRemoveFocus(Screens_PeriodDialogPos);
    Main_removeEventListener("keydown", ScreenObj[key].key_period);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElement('dialog_period');
}

function Screens_PeriodAddFocus(pos) {
    Main_AddClass('dialog_period_' + pos, 'button_dialog_focused');
}

function Screens_PeriodRemoveFocus(pos) {
    Main_RemoveClass('dialog_period_' + pos, 'button_dialog_focused');
}

function Screens_PeriodhandleKeyDown(key, event) {
    //Main_Log('ScreenObj[key].key_period ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            Screens_PeriodRemoveFocus(Screens_PeriodDialogPos);
            Screens_PeriodDialogHide(key);
            break;
        case KEY_LEFT:
            Screens_SetPeriodDialogId(key);
            Screens_PeriodRemoveFocus(Screens_PeriodDialogPos);
            Screens_PeriodDialogPos--;
            if (Screens_PeriodDialogPos < 1) Screens_PeriodDialogPos = 4;
            Screens_PeriodAddFocus(Screens_PeriodDialogPos);
            break;
        case KEY_RIGHT:
            Screens_SetPeriodDialogId(key);
            Screens_PeriodRemoveFocus(Screens_PeriodDialogPos);
            Screens_PeriodDialogPos++;
            if (Screens_PeriodDialogPos > 4) Screens_PeriodDialogPos = 1;
            Screens_PeriodAddFocus(Screens_PeriodDialogPos);
            break;
        case KEY_PLAY:
        case KEY_PLAYPAUSE:
        case KEY_KEYBOARD_SPACE:
        case KEY_ENTER:
            Screens_PeriodDialogHide(key);
            if (ScreenObj[key].periodPos !== Screens_PeriodDialogPos) {
                ScreenObj[key].periodPos = Screens_PeriodDialogPos;
                ScreenObj[key].SetPeriod();
                Screens_StartLoad(key);
            }
            break;
        default:
            break;
    }
}

var Screens_OffSetDialogID;
var Screens_ThumbOptionSpecial;

function Screens_OffSetStart(key) {
    ScreenObj[key].OffSetPos = ScreenObj[key].extraoffset / 100;
    Screens_setOffSetDialog(key);
    Main_ShowElement('dialog_OffSet');
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_addEventListener("keydown", ScreenObj[key].key_offset);
}

function Screens_SetOffSetDialogId(key) {
    Screens_OffSetDialogID = Main_setTimeout(
        function() {
            Screens_OffSetDialogHide(key);
        },
        Screens_DialogHideTimout,
        Screens_OffSetDialogID
    );
}

function Screens_setOffSetDialog(key) {
    Screens_OffSetAddFocus(ScreenObj[key].OffSetPos * 100);
    Screens_SetOffSetDialogId(key);
}

function Screens_OffSetDialogHide(key) {
    Main_clearTimeout(Screens_OffSetDialogID);
    Main_removeEventListener("keydown", ScreenObj[key].key_offset);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElement('dialog_OffSet');
}

function Screens_OffSetAddFocus(pos) {
    Main_textContent("dialog_OffSet_val", pos);
    var maxValue = 5000;

    if (pos > 0 && pos < maxValue) {

        Main_getElementById("dialog_OffSet_left").style.opacity = "1";
        Main_getElementById("dialog_OffSet_right").style.opacity = "1";

    } else if (pos === maxValue) {

        Main_getElementById("dialog_OffSet_left").style.opacity = "1";
        Main_getElementById("dialog_OffSet_right").style.opacity = "0.2";

    } else {

        Main_getElementById("dialog_OffSet_left").style.opacity = "0.2";
        Main_getElementById("dialog_OffSet_right").style.opacity = "1";

    }
}

function Screens_OffSethandleKeyDown(key, event) {
    //Main_Log('ScreenObj[key].key_offset ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            Screens_OffSetDialogHide(key);
            break;
        case KEY_LEFT:
            Screens_SetOffSetDialogId(key);
            ScreenObj[key].OffSetPos--;
            if (ScreenObj[key].OffSetPos < 0) ScreenObj[key].OffSetPos = 0;
            Screens_OffSetAddFocus(ScreenObj[key].OffSetPos * 100);
            break;
        case KEY_RIGHT:
            Screens_SetOffSetDialogId(key);
            ScreenObj[key].OffSetPos++;
            if (ScreenObj[key].OffSetPos > 50) ScreenObj[key].OffSetPos = 50;
            Screens_OffSetAddFocus(ScreenObj[key].OffSetPos * 100);
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_KEYBOARD_SPACE:
        case KEY_ENTER:
            Screens_OffSetDialogHide(key);
            if (ScreenObj[key].extraoffset !== ScreenObj[key].OffSetPos) {
                ScreenObj[key].extraoffset = ScreenObj[key].OffSetPos * 100;
                ScreenObj[key].SetPeriod();
                Screens_StartLoad(key);
            }
            break;
        default:
            break;
    }
}

var Screens_histDialogID;

function Screens_histStart(key) {
    ScreenObj[key].sethistDialog();
    Main_ShowElement('dialog_hist_setting');
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_addEventListener("keydown", ScreenObj[key].key_hist);
}

function Screens_SethistDialogId(key) {
    Screens_histDialogID = Main_setTimeout(
        function() {
            Screens_histDialogHide(false, key);
        },
        Screens_DialogHideTimout,
        Screens_histDialogID
    );
}

var Screens_DeleteDialogAll = true;

function Screens_histDialogHide(Update, key) {
    Screens_histRemoveFocus(ScreenObj[key].histPosY, 'hist');

    Main_clearTimeout(Screens_histDialogID);
    Main_removeEventListener("keydown", ScreenObj[key].key_hist);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElement('dialog_hist_setting');

    if (Update) {
        if (ScreenObj[key].histPosY === 2) {
            Screens_DeleteDialogAll = true;
            Screens_showDeleteDialog(
                STR_DELETE_SURE + ScreenObj[key].history_Type() + STR_SPACE + STR_HISTORY + '?',
                key
            );
        } else if (ScreenObj[key].histPosX[0] !== ScreenObj[key].histPosXTemp[0]) {
            ScreenObj[key].label_init();
            Main_ReloadScreen();
        }
    } else {
        ScreenObj[key].histPosX = Main_Slice(ScreenObj[key].histPosXTemp);
        Main_setItem(ScreenObj[key].histPosXName, JSON.stringify(ScreenObj[key].histPosX));
    }
    ScreenObj[key].histPosY = 0;
    Screens_histAddFocus(0, key);
}

function Screens_showDeleteDialog(text, key) {
    Main_innerHTML("main_dialog_remove", text);
    Main_ShowElement('main_yes_no_dialog');
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_addEventListener("keydown", ScreenObj[key].key_histdelet);
    Screens_setRemoveDialog(key);
}

function Screens_setRemoveDialog(key) {
    Users_RemoveDialogID = Main_setTimeout(
        function() {
            Screens_HideRemoveDialog(key);
        },
        Screens_DialogHideTimout,
        Users_RemoveDialogID
    );
}

function Screens_HideRemoveDialog(key) {
    Users_clearRemoveDialog();
    Main_removeEventListener("keydown", ScreenObj[key].key_histdelet);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElement('main_yes_no_dialog');
    Users_RemoveCursor = 0;
    Users_UserCursorSet();
    Users_RemoveCursorSet();
    Screens_LoadPreview(key);
}

function Screens_histDeleteKeyDown(key, event) {
    //Main_Log('ScreenObj[key].key_histdelet ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_LEFT:
            Users_RemoveCursor--;
            if (Users_RemoveCursor < 0) Users_RemoveCursor = 1;
            Users_RemoveCursorSet();
            Users_clearRemoveDialog();
            Screens_setRemoveDialog(key);
            break;
        case KEY_RIGHT:
            Users_RemoveCursor++;
            if (Users_RemoveCursor > 1) Users_RemoveCursor = 0;
            Users_RemoveCursorSet();
            Users_clearRemoveDialog();
            Screens_setRemoveDialog(key);
            break;
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            Users_RemoveCursor = 0;
        /* falls through */
        case KEY_ENTER:
            var temp = Users_RemoveCursor;
            Screens_HideRemoveDialog(key);
            if (temp) Screens_histDelete(key);
            break;
        default:
            break;
    }
}

function Screens_histDelete(key) {

    if (Screens_DeleteDialogAll) {

        Main_values_History_data[AddUser_UsernameArray[0].id][ScreenObj[key].Type] = [];
        Main_setHistoryItem();
        Main_ReloadScreen();

    } else {

        var type = 'live';

        if (ScreenObj[key].screen === Main_HistoryVod) type = 'vod';
        else if (ScreenObj[key].screen === Main_HistoryClip) type = 'clip';

        var index = Main_history_Exist(type, Screens_values_Play_data[7]);
        if (index > -1) {
            Main_values_History_data[AddUser_UsernameArray[0].id][type].splice(index, 1);
            Main_setHistoryItem();
        }

    }

}

function Screens_histAddFocus(divPos, key) {
    Main_AddClass('dialog_hist_setting_' + divPos, 'settings_div_focus');
    Main_AddClass('dialog_hist_val_' + divPos, 'settings_value_focus');
    Screens_histSetArrow(key);
}

function Screens_histRemoveFocus(divPos, dialog) {

    Main_RemoveClass('dialog_' + dialog + '_setting_' + divPos, 'settings_div_focus');
    Main_RemoveClass('dialog_' + dialog + '_val_' + divPos, 'settings_value_focus');
    Main_getElementById('dialog_' + dialog + '_left_' + divPos).style.opacity = "0";
    Main_getElementById('dialog_' + dialog + '_right_' + divPos).style.opacity = "0";

}

function Screens_histSetArrow(key) {
    Screens_histArrow(
        'hist',
        ScreenObj[key].histPosX[ScreenObj[key].histPosY],
        ScreenObj[key].histArrays[ScreenObj[key].histPosY].length,
        ScreenObj[key].histArrays[ScreenObj[key].histPosY][ScreenObj[key].histPosX[ScreenObj[key].histPosY]],
        ScreenObj[key].histPosY
    );

    Main_setItem(ScreenObj[key].histPosXName, JSON.stringify(ScreenObj[key].histPosX));
}

function Screens_histArrow(dialog, pos, maxValue, text, divPos) {

    Main_innerHTML('dialog_' + dialog + '_val_' + divPos, text);

    if (maxValue === 1) {

        Main_getElementById('dialog_' + dialog + '_left_' + divPos).style.opacity = "0";
        Main_getElementById('dialog_' + dialog + '_right_' + divPos).style.opacity = "0";

    } else if (!pos) {

        Main_getElementById('dialog_' + dialog + '_left_' + divPos).style.opacity = "0.2";
        Main_getElementById('dialog_' + dialog + '_right_' + divPos).style.opacity = "1";

    } else if (pos === (maxValue - 1)) {

        Main_getElementById('dialog_' + dialog + '_left_' + divPos).style.opacity = "1";
        Main_getElementById('dialog_' + dialog + '_right_' + divPos).style.opacity = "0.2";

    } else {

        Main_getElementById('dialog_' + dialog + '_left_' + divPos).style.opacity = "1";
        Main_getElementById('dialog_' + dialog + '_right_' + divPos).style.opacity = "1";

    }

}

function Screens_histhandleKeyDown(key, event) {
    //Main_Log('ScreenObj[key].key_hist ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            Screens_histDialogHide(false, key);
            break;
        case KEY_LEFT:
            Screens_SethistDialogId(key);
            ScreenObj[key].histPosX[ScreenObj[key].histPosY]--;
            if (ScreenObj[key].histPosX[ScreenObj[key].histPosY] < 0) ScreenObj[key].histPosX[ScreenObj[key].histPosY] = 0;
            else Screens_histSetArrow(key);
            break;
        case KEY_RIGHT:
            Screens_SethistDialogId(key);
            ScreenObj[key].histPosX[ScreenObj[key].histPosY]++;
            if (ScreenObj[key].histPosX[ScreenObj[key].histPosY] > (ScreenObj[key].histArrays[ScreenObj[key].histPosY].length - 1))
                ScreenObj[key].histPosX[ScreenObj[key].histPosY] = ScreenObj[key].histArrays[ScreenObj[key].histPosY].length - 1;
            else Screens_histSetArrow(key);
            break;
        case KEY_UP:
            Screens_SethistDialogId(key);
            ScreenObj[key].histPosY--;
            if (ScreenObj[key].histPosY < 0) ScreenObj[key].histPosY = 0;
            else {
                Screens_histRemoveFocus(ScreenObj[key].histPosY + 1, 'hist');
                Screens_histAddFocus(ScreenObj[key].histPosY, key);
            }
            break;
        case KEY_DOWN:
            Screens_SethistDialogId(key);
            ScreenObj[key].histPosY++;
            if (ScreenObj[key].histPosY > (ScreenObj[key].histArrays.length - 1))
                ScreenObj[key].histPosY = ScreenObj[key].histArrays.length - 1;
            else {
                Screens_histRemoveFocus(ScreenObj[key].histPosY - 1, 'hist');
                Screens_histAddFocus(ScreenObj[key].histPosY, key);
            }
            break;
        case KEY_ENTER:
            Screens_histDialogHide(true, key);
            break;
        default:
            break;
    }
}

var Screens_ThumbOptionPosY = 0;

function Screens_ThumbOptionStart(key) {
    Screens_LoadPreviewSTop();
    Main_RemoveClass(ScreenObj[key].ids[1] + ScreenObj[key].posY + '_' + ScreenObj[key].posX, 'opacity_zero');

    Screens_clear = true;

    Screens_ThumbOptionSetArrowArray(key);

    if (Screens_ThumbOptionSpecial) {
        Screens_ThumbOptionPosY = 5;
        Main_textContent('dialog_thumb_opt_val_5', Screens_ThumbOptionScreens[0]);
        Screens_ThumbOptionAddFocus(Screens_ThumbOptionPosY);
    } else {
        Screens_ThumbOptionShowSpecial();

        Screens_ThumbOptionStringSet(key);
        Screens_ThumbOptionPosY = 0;
    }

    ScreenObj[key].setTODialog();
    Screens_SeTODialogId(key);
    Main_removeEventListener("keydown", ScreenObj[key].key_fun);
    Main_addEventListener("keydown", ScreenObj[key].key_thumb);

    Main_ShowElement('dialog_thumb_opt');
}

function Screens_ThumbOptionShowSpecial() {
    for (var i = 0; i < 5; i++)
        Main_RemoveClass('dialog_thumb_opt_setting_' + i, 'hideimp');
}

function Screens_ThumbOptionHideSpecial() {
    for (var i = -1; i < 5; i++)
        Main_AddClass('dialog_thumb_opt_setting_' + i, 'hideimp');
}

var Screens_values_Play_data;
var Screens_canFollow = false;
var Screens_isFollowing = false;

function Screens_ThumbOptionStringSet(key) {
    Screens_canFollow = false;
    Screens_values_Play_data = Screens_GetObj(key);
    Screens_ThumbOption_CheckFollow_ID = 0;
    Screens_ThumbOption_Follow_ID = 0;

    if (AddUser_UserIsSet()) {
        Screens_ThumbOption_CheckFollow(Screens_values_Play_data, key);
        Main_textContent('dialog_thumb_opt_setting_name_2', STR_CHECK_HISTORY);
    } else Main_textContent('dialog_thumb_opt_setting_name_2', STR_NOKEY + STR_CANT_FOLLOW);

    Main_textContent('dialog_thumb_opt_val_2', '...');

    if (ScreenObj[key].screenType < 2) {
        Main_values.Play_isHost = Main_A_includes_B(Screens_values_Play_data[1], STR_USER_HOSTING);

        if (Main_values.Play_isHost) {
            Main_textContent('dialog_thumb_opt_val_0', Screens_values_Play_data[1].split(STR_USER_HOSTING)[1]);
        } else Main_textContent('dialog_thumb_opt_val_0', Screens_values_Play_data[1]);

    } else if (ScreenObj[key].screenType === 2) {
        Main_textContent('dialog_thumb_opt_val_0', Screens_values_Play_data[4]);
    }

    Main_innerHTML('dialog_thumb_opt_val_1', (Screens_values_Play_data[3] !== "" ? Screens_values_Play_data[3] : STR_EMPTY));

    var index = ScreenObj[key].screen === Main_HistoryLive && AddUser_UserIsSet() ? Main_history_Exist('live', Screens_values_Play_data[7]) : -1;

    if (index > -1 && Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

        Main_textContent('dialog_thumb_opt_val_3', Screens_YesNo[Main_getItemJson(ScreenObj[Main_HistoryVod].histPosXName, [0, 0, 0])[1]]);

    } else Main_textContent('dialog_thumb_opt_val_3', Screens_YesNo[Screens_ThumbOptionStringGetHistory(key)]);

    Main_textContent('dialog_thumb_opt_val_4', Main_ContentLang === "" ? STR_LANG_ALL : Screens_ThumbOptionLanguagesTitles[Screens_ThumbOptionPosXArrays[4]]);
    Main_textContent('dialog_thumb_opt_val_5', Screens_ThumbOptionScreens[0]);
}

var Screens_ThumbOption_CheckFollow_ID;

function Screens_ThumbOption_CheckFollow(data, key) {

    var channel_id = 0;

    Screens_ThumbOption_CheckFollow_ID = (new Date()).getTime();

    if (ScreenObj[key].screenType < 2) {

        channel_id = data[14];

    } else {

        channel_id = data[2];

    }

    Screens_ThumbOption_RequestCheckFollow(
        channel_id,
        Screens_ThumbOption_CheckFollow_ID,
        key
    );
}

function Screens_ThumbOption_RequestCheckFollow(channel_id, ID, key) {

    var theUrl = Main_kraken_api + 'users/' + AddUser_UsernameArray[0].id + '/follows/channels/' + channel_id + Main_TwithcV5Flag_I;

    BasexmlHttpGet(
        theUrl,
        DefaultHttpGetTimeout * 2,
        2,
        null,
        Screens_ThumbOption_RequestCheckFollowSuccess,
        Screens_ThumbOption_RequestCheckFollowFail,
        key,
        ID
    );
}

function Screens_ThumbOption_RequestCheckFollowSuccess(obj, key, ID) {

    if (Screens_ThumbOption_CheckFollow_ID === ID)
        Screens_ThumbOption_RequestCheckFollowEnd(key, true);

}

function Screens_ThumbOption_RequestCheckFollowFail(key, ID) {

    if (Screens_ThumbOption_CheckFollow_ID === ID)
        Screens_ThumbOption_RequestCheckFollowEnd(key, false);

}

function Screens_ThumbOption_RequestCheckFollowEnd(key, FollowState) {

    Screens_canFollow = true;
    Screens_ThumbOption_UpdateFollow(key, FollowState);
    Screens_ThumbOption_CheckFollow_ID = 0;

}

function Screens_ThumbOption_UpdateFollow(key, FollowState) {

    Screens_isFollowing = FollowState;
    Main_textContent('dialog_thumb_opt_setting_name_2', (FollowState ? STR_FOLLOWING : STR_FOLLOW) + ' - ' + (ScreenObj[key].screenType === 2 ? Screens_values_Play_data[4] : Screens_values_Play_data[1]));
    Main_textContent('dialog_thumb_opt_val_2', (FollowState ? STR_CLICK_UNFOLLOW : STR_CLICK_FOLLOW).replace('(', '').replace(')', ''));

}

function Screens_ThumbOptionStringGetHistory(key) {
    return Main_getItemJson(ScreenObj[key].histPosXName, [0, 0, 0])[1];
}

function Screens_ThumbOptionhandleKeyDown(key, event) {
    //Main_Log('Screens_ThumbOptionhandleKeyDown ' + event.keyCode);

    switch (event.keyCode) {
        case KEY_KEYBOARD_BACKSPACE:
        case KEY_RETURN:
            Screens_ThumbOptionDialogHide(false, key);
            break;
        case KEY_LEFT:
            Screens_SeTODialogId(key);
            if (Screens_ThumbOptionPosY > 2) {
                Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY]--;
                if (Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY] < 0)
                    Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY] = 0;
                else
                    Screens_ThumbOptionSetArrow(Screens_ThumbOptionArrays[Screens_ThumbOptionPosY]);
            }
            break;
        case KEY_RIGHT:
            Screens_SeTODialogId(key);
            if (!Screens_handleKeyUpIsClear) break;
            if (Screens_ThumbOptionPosY > 2) {
                Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY]++;

                if (Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY] > (Screens_ThumbOptionArrays[Screens_ThumbOptionPosY].length - 1))
                    Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY] = Screens_ThumbOptionArrays[Screens_ThumbOptionPosY].length - 1;
                else
                    Screens_ThumbOptionSetArrow(Screens_ThumbOptionArrays[Screens_ThumbOptionPosY]);
            }
            break;
        case KEY_UP:
            if (Screens_ThumbOptionSpecial) break;
            var lower = !Main_A_includes_B(Main_getElementById('dialog_thumb_opt_setting_-1').className, 'hideimp') ? -1 : 0;
            Screens_SeTODialogId(key);
            Screens_ThumbOptionPosY--;
            if (Screens_ThumbOptionPosY < lower) Screens_ThumbOptionPosY = lower;
            else {
                Screens_histRemoveFocus(Screens_ThumbOptionPosY + 1, 'thumb_opt');
                Screens_ThumbOptionAddFocus(Screens_ThumbOptionPosY);
            }
            break;
        case KEY_DOWN:
            if (Screens_ThumbOptionSpecial) break;
            Screens_SeTODialogId(key);
            Screens_ThumbOptionPosY++;
            if (Screens_ThumbOptionPosY > 5)
                Screens_ThumbOptionPosY = 5;
            else {
                Screens_histRemoveFocus(Screens_ThumbOptionPosY - 1, 'thumb_opt');
                Screens_ThumbOptionAddFocus(Screens_ThumbOptionPosY);
            }
            break;
        case KEY_ENTER:
            if (Screens_ThumbOptionPosY === 2) {
                Screens_SeTODialogId(key);
                Screens_FollowUnfollow(key);
            } else Screens_ThumbOptionDialogHide(true, key);
            break;
        default:
            break;
    }
}

var Screens_ThumbOptionDialogID;
function Screens_SeTODialogId(key) {

    Screens_ThumbOptionDialogID = Main_setTimeout(
        function() {
            Screens_ThumbOptionDialogHide(false, key);
        },
        Screens_DialogHideTimout,
        Screens_ThumbOptionDialogID
    );

}

function Screens_ThumbOptionDialogHide(Update, key) {

    Screens_histRemoveFocus(Screens_ThumbOptionPosY, 'thumb_opt');

    Main_clearTimeout(Screens_ThumbOptionDialogID);
    Main_removeEventListener("keydown", ScreenObj[key].key_thumb);
    Main_addEventListener("keydown", ScreenObj[key].key_fun);
    Main_HideElement('dialog_thumb_opt');

    if (Update) {

        if (Screens_ThumbOptionPosY === -1) {
            var streamer, title;
            if (!ScreenObj[key].screenType) {
                streamer = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[1];
                title = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[2];
            } else if (ScreenObj[key].screenType === 1) {
                streamer = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[1];
                title = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[10];
            } else if (ScreenObj[key].screenType === 2) {
                streamer = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[4];
                title = Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[10];
            }

            Screens_DeleteDialogAll = false;
            Screens_showDeleteDialog(
                STR_DELETE_SURE + ScreenObj[key].history_Type() + STR_SPACE + STR_HISTORY + STR_SPACE + STR_FOR + '?' +
                STR_BR + STR_BR + streamer + STR_BR + title + STR_BR + STR_BR +
                STR_REFRESH_DELETE,
                key
            );

        } else if (!Screens_ThumbOptionPosY) Screens_OpenChannel(key);
        else if (Screens_ThumbOptionPosY === 1) Screens_OpenGame();
        else if (Screens_ThumbOptionPosY === 3) {

            if (!ScreenObj[key].screenType) {

                var index = ScreenObj[key].screen === Main_HistoryLive && AddUser_UserIsSet() ? Main_history_Exist('live', Screens_values_Play_data[7]) : -1;

                if (index > -1 && Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

                    ScreenObj[Main_HistoryVod].histPosX[1] = Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY];
                    Main_setItem(ScreenObj[Main_HistoryVod].histPosXName, JSON.stringify(ScreenObj[Main_HistoryVod].histPosX));

                } else {

                    ScreenObj[Main_HistoryLive].histPosX[1] = Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY];
                    Main_setItem(ScreenObj[key].histPosXName, JSON.stringify(ScreenObj[Main_HistoryLive].histPosX));

                }

            } else if (ScreenObj[key].screenType === 1) {
                ScreenObj[Main_HistoryVod].histPosX[1] = Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY];
                Main_setItem(ScreenObj[key].histPosXName, JSON.stringify(ScreenObj[Main_HistoryVod].histPosX));
            } else if (ScreenObj[key].screenType === 2) {
                ScreenObj[Main_HistoryClip].histPosX[1] = Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY];
                Main_setItem(ScreenObj[key].histPosXName, JSON.stringify(ScreenObj[Main_HistoryClip].histPosX));
            }

            Screens_LoadPreview(key);
        } else if (Screens_ThumbOptionPosY === 4) Screens_SetLang();
        else if (Screens_ThumbOptionPosY === 5) Screens_OpenScreen();

    } else Screens_LoadPreview(key);

    Screens_ThumbOptionPosY = 0;
    Screens_ThumbOptionAddFocus(0);
    Screens_ThumbOption_CheckFollow_ID = 0;
    Screens_ThumbOption_Follow_ID = 0;

}

function Screens_SetLang() {

    if (Screens_ThumbOptionPosXArrays[4]) Languages_ResetAll();

    var key = Screens_ThumbOptionLanguages[Screens_ThumbOptionPosXArrays[4]];
    Languages_value[key].defaultValue = 1;
    Main_setItem(key, Languages_Obj_default(key) + 1);
    Languages_SetLang();

    if (!Main_A_equals_B(Main_ContentLang_old, Main_ContentLang)) Main_ReloadScreen();

}

var Screens_ThumbOption_Follow_ID = 0;

function Screens_FollowUnfollow(key) {

    if (Screens_canFollow && AddUser_UserIsSet() && AddUser_UsernameArray[0].access_token) {

        Screens_ThumbOption_Follow_ID = (new Date()).getTime();

        var channel_id = ScreenObj[key].screenType < 2 ? Screens_values_Play_data[14] : Screens_values_Play_data[2],
            theUrl = Main_kraken_api + 'users/' + AddUser_UsernameArray[0].id + '/follows/channels/' + channel_id + Main_TwithcV5Flag_I;

        FullxmlHttpGet(
            theUrl,
            Main_GetHeader(3, Main_OAuth + AddUser_UsernameArray[0].access_token),
            Screens_isFollowing ? Screens_UnFollowRequestReady : Screens_FollowRequestReady,
            noop_fun,
            key,
            Screens_ThumbOption_Follow_ID,
            Screens_isFollowing ? 'DELETE' : 'PUT',
            null
        );

    } else {

        Main_showWarningDialog(STR_NOKEY_WARN, 2000);

    }

}

function Screens_UnFollowRequestReady(xmlHttp, key, ID) {

    if (Screens_ThumbOption_Follow_ID === ID && xmlHttp.status === 204) { //success user is now not following the channel

        Screens_FollowRequestEnd(key, false);

    }

}

function Screens_FollowRequestReady(xmlHttp, key, ID) {

    if (Screens_ThumbOption_Follow_ID === ID && xmlHttp.status === 200) { //success user is now following the channel

        Screens_FollowRequestEnd(key, true);

    }

}

function Screens_FollowRequestEnd(key, FollowState) {

    Screens_ThumbOption_UpdateFollow(key, FollowState);
    Screens_ThumbOption_Follow_ID = 0;

}

function Screens_OpenScreen() {

    if (Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY] === 8 && AddUser_UserIsSet() && !AddUser_UsernameArray[0].access_token) {

        Main_showWarningDialog(STR_NOKEY_VIDEO_WARN, 2000);
        return;

    }

    if (!Main_values.Main_BeforeAgameisSet && Main_values.Main_Go !== Main_AGameVod && Main_values.Main_Go !== Main_AGameClip) {
        Main_values.Main_BeforeAgame = (Main_values.Main_BeforeChannelisSet && Main_values.Main_Go !== Main_ChannelContent && Main_values.Main_Go !== Main_ChannelVod && Main_values.Main_Go !== Main_ChannelClip) ? Main_values.Main_BeforeChannel : Main_values.Main_Go;
        Main_values.Main_BeforeAgameisSet = true;
    }

    Main_ExitCurrent(Main_values.Main_Go);
    Main_values.Main_Go = Screens_ThumbOptionGOTO[Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY]];

    Main_ReStartScreens();
}

function Screens_OpenGame() {
    Play_data.data[3] = (Screens_values_Play_data[3] !== "" ? Screens_values_Play_data[3] : '');
    if (Play_data.data[3] === '') {

        Main_showWarningDialog(STR_NO_GAME, 2000);
        return;
    }

    if (!Main_values.Main_BeforeAgameisSet && Main_values.Main_Go !== Main_AGameVod && Main_values.Main_Go !== Main_AGameClip) {
        Main_values.Main_BeforeAgame = (Main_values.Main_BeforeChannelisSet && Main_values.Main_Go !== Main_ChannelContent && Main_values.Main_Go !== Main_ChannelVod && Main_values.Main_Go !== Main_ChannelClip) ? Main_values.Main_BeforeChannel : Main_values.Main_Go;
        Main_values.Main_BeforeAgameisSet = true;
    }

    Main_ExitCurrent(Main_values.Main_Go);
    Main_values.Main_Go = Main_aGame;

    Main_values.Main_gameSelected = Play_data.data[3];
    Main_ReStartScreens();
}

function Screens_OpenChannel(key) {
    if (!Main_values.Main_BeforeChannelisSet && Main_values.Main_Go !== Main_ChannelVod && Main_values.Main_Go !== Main_ChannelClip) {
        Main_values.Main_BeforeChannel = (Main_values.Main_BeforeAgameisSet && Main_values.Main_Go !== Main_aGame) ? Main_values.Main_BeforeAgame : Main_values.Main_Go;
        Main_values.Main_BeforeChannelisSet = true;
    }

    if (ScreenObj[key].screenType < 2) {
        Main_values.Main_selectedChannel_id = Screens_values_Play_data[14];

        Main_values.Play_isHost = Main_A_includes_B(Screens_values_Play_data[1], STR_USER_HOSTING);

        if (Main_values.Play_isHost) {
            Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[1].split(STR_USER_HOSTING)[1];
        } else Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[1];

    } else {
        Main_values.Main_selectedChannel_id = Screens_values_Play_data[2];
        Main_values.Main_selectedChannelDisplayname = Screens_values_Play_data[4];
    }
    Main_values.Main_selectedChannel = Screens_values_Play_data[6];

    Main_ExitCurrent(Main_values.Main_Go);
    Main_values.Main_Go = Main_ChannelContent;
    Main_ReStartScreens();
}

function Screens_ThumbOptionAddFocus(divPos) {
    Main_AddClass('dialog_thumb_opt_setting_' + divPos, 'settings_div_focus');
    Main_AddClass('dialog_thumb_opt_val_' + divPos, 'settings_value_focus');
    if (Screens_ThumbOptionPosY === 3) Screens_ThumbOptionSetArrow(Screens_YesNo);
    else if (Screens_ThumbOptionPosY === 4) Screens_ThumbOptionSetArrow(Screens_ThumbOptionLanguagesTitles);
    else if (Screens_ThumbOptionPosY === 5) Screens_ThumbOptionSetArrow(Screens_ThumbOptionScreens);
}

function Screens_ThumbOptionSetArrow(array) {
    Screens_histArrow(
        'thumb_opt',
        Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY],
        array.length,
        array[Screens_ThumbOptionPosXArrays[Screens_ThumbOptionPosY]],
        Screens_ThumbOptionPosY
    );
}

var Screens_ThumbOptionScreens = [];
var Screens_YesNo = [];
var Screens_ThumbOptionArrays = [];
var Screens_ThumbOptionPosXArrays = [];
var Screens_ThumbOptionGOTO = [];
var Screens_ThumbOptionLanguages = [];
var Screens_ThumbOptionLanguagesTitles = [];
var Main_ContentLang_old = '';

function Screens_ThumbOptionSetArrowArray(key) {
    Screens_ThumbOptionScreens = [
        STR_LIVE,
        STR_FEATURED,
        STR_GAMES,
        STR_VIDEOS,
        STR_CLIP
    ];

    if (AddUser_UserIsSet()) {
        Screens_ThumbOptionScreens.push(STR_USER + STR_SPACE + STR_LIVE);
        Screens_ThumbOptionScreens.push(STR_USER + STR_SPACE + STR_GAMES);
        Screens_ThumbOptionScreens.push(STR_USER + STR_SPACE + STR_VIDEOS);
        Screens_ThumbOptionScreens.push(STR_USER + STR_SPACE + STR_CHANNELS);
        Screens_ThumbOptionScreens.push(STR_USER + STR_SPACE + STR_HISTORY);
    }

    Screens_YesNo = [
        STR_YES,
        STR_NO
    ];

    var default_lang = 0;
    var isAll = Main_ContentLang === "";
    Main_ContentLang_old = Main_ContentLang;
    Screens_ThumbOptionLanguages = [];
    Screens_ThumbOptionLanguagesTitles = [];

    for (var property in Languages_value) {
        Screens_ThumbOptionLanguages.push(property);
        Screens_ThumbOptionLanguagesTitles.push(Languages_value[property].title);
        if (!isAll && Languages_Obj_default(property)) default_lang = Screens_ThumbOptionLanguages.length - 1;
    }

    Screens_ThumbOptionArrays = ['', '', '', Screens_YesNo, Screens_ThumbOptionLanguagesTitles, Screens_ThumbOptionScreens];

    var historyType = Screens_ThumbOptionStringGetHistory(key);

    var index = ScreenObj[key].screen === Main_HistoryLive && AddUser_UserIsSet() ? Main_history_Exist('live', ScreenObj[key].DataObj[ScreenObj[key].posY + '_' + ScreenObj[key].posX][7]) : -1;

    if (index > -1 && Main_values_History_data[AddUser_UsernameArray[0].id].live[index].forceVod) {

        historyType = Main_getItemJson(ScreenObj[Main_HistoryVod].histPosXName, [0, 0, 0])[1];

    }

    Screens_ThumbOptionPosXArrays = [0, 0, 0, historyType, default_lang, 0];

    Screens_ThumbOptionGOTO = [
        Main_Live,
        Main_Featured,
        Main_games,
        Main_Vod,
        Main_Clip,
        Main_UserLive,
        Main_usergames,
        Main_UserVod,
        Main_UserChannels,
        Main_History[Main_HistoryPos]];
}

function Screens_SetLastRefresh(key) {
    if (Main_values.Main_Go === Main_Users || Main_values.Main_Go === Main_ChannelContent || Main_values.Main_Go === Main_Search ||
        Main_values.Main_Go === Main_addUser || !ScreenObj[key]) return;

    Main_innerHTML("label_last_refresh", STR_SPACE + "(" + STR_LAST_REFRESH + Play_timeDay((new Date().getTime()) - ScreenObj[key].lastRefresh) + ")");
}

function Screens_RefreshTimeout(key) {
    if (Main_values.Main_Go === Main_Users || Main_values.Main_Go === Main_ChannelContent ||
        Main_values.Main_Go === Main_Search || ScreenObj[key].screenType === 4 ||
        Main_values.Main_Go === Main_addUser || !ScreenObj || !Settings_Obj_default("auto_refresh_screen")) return false;

    return (new Date().getTime()) > (ScreenObj[key].lastRefresh + Settings_GetAutoRefreshTimeout());
}

function Screens_Isfocused() {
    return (ScreenObj[Main_values.Main_Go].posY + '_' + ScreenObj[Main_values.Main_Go].posX) === ScreenObj[Main_values.Main_Go].focusPos && Main_isScene1DocVisible();
}

//TODO add screen.isInuse prop to adress this fun use
function Screens_IsInUse(key) {
    return key === Main_values.Main_Go && Main_isScene1DocVisible() && !Sidepannel_isShowing() &&
        !Sidepannel_MainisShowing() && !Settings_isVisible() && !Main_isUpdateDialogVisible();
}