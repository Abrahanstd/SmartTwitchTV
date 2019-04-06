//Variable initialization
var ChannelContent_cursorY = 0;
var ChannelContent_cursorX = 0;
var ChannelContent_dataEnded = false;
var ChannelContent_itemsCount = 0;
var ChannelContent_loadingDataTry = 0;
var ChannelContent_loadingDataTryMax = 5;
var ChannelContent_loadingDataTimeout = 3500;
var ChannelContent_itemsCountOffset = 0;
var ChannelContent_skipImg = false;
var ChannelContent_UserChannels = false;
var ChannelContent_TargetId;
var ChannelContent_ids = ['cc_thumbdiv', 'cc_img', 'cc_infodiv', 'cc_name', 'cc_createdon', 'cc_game', 'cc_viwers', 'cc_duration', 'cc_cell', 'sccempty_', 'channel_content_scroll'];
var ChannelContent_status = false;
var ChannelContent_lastselectedChannel = '';
var ChannelContent_responseText = null;
var ChannelContent_selectedChannelViews = '';
var ChannelContent_selectedChannelFallower = '';
var ChannelContent_description = '';
var ChannelContent_thumbnail = '';
var ChannelContent_thumbnail_fallow = '';
var ChannelContent_ChannelValue = {};
var ChannelContent_ChannelValueIsset;
//Variable initialization end

function ChannelContent_init() {
    Main_values.Main_CenterLablesVectorPos = 1;
    Main_values.Main_Go = Main_ChannelContent;
    if (ChannelContent_ChannelValueIsset && !Main_values.Search_isSearching && Main_values.Main_selectedChannel_id) ChannelContent_RestoreChannelValue();
    if (ChannelContent_lastselectedChannel !== Main_values.Main_selectedChannel) ChannelContent_status = false;
    Main_cleanTopLabel();
    Main_values.Main_selectedChannelDisplayname = Main_values.Main_selectedChannelDisplayname.replace(STR_NOT_LIVE, '');
    Main_textContent('top_bar_user', Main_values.Main_selectedChannelDisplayname);
    Main_textContent('top_bar_game', STR_CHANNEL_CONT);
    document.body.addEventListener("keydown", ChannelContent_handleKeyDown, false);
    AddCode_PlayRequest = false;
    if (ChannelContent_status) {
        Main_YRst(ChannelContent_cursorY);
        Main_ShowElement(ChannelContent_ids[10]);
        ChannelContent_checkUser();
        ChannelContent_addFocus();
        Main_SaveValues();
    } else ChannelContent_StartLoad();
}

function ChannelContent_exit() {
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", ChannelContent_handleKeyDown);
    Main_HideElement(ChannelContent_ids[10]);
}

function ChannelContent_StartLoad() {
    Main_empty('stream_table_channel_content');
    Main_HideElement(ChannelContent_ids[10]);
    Main_showLoadDialog();
    Main_HideWarningDialog();
    ChannelContent_lastselectedChannel = Main_values.Main_selectedChannel;
    ChannelContent_status = false;
    ChannelContent_skipImg = false;
    ChannelContent_thumbnail = '';
    ChannelContent_itemsCountOffset = 0;
    ChannelContent_itemsCount = 0;
    ChannelContent_cursorX = 0;
    ChannelContent_cursorY = 0;
    ChannelContent_dataEnded = false;
    ChannelContent_TargetId = undefined;
    ChannelContent_loadDataPrepare();
    ChannelContent_loadDataRequest();
}

function ChannelContent_loadDataPrepare() {
    Main_FirstLoad = true;
    ChannelContent_loadingDataTry = 0;
    ChannelContent_loadingDataTimeout = 3500;
}

function ChannelContent_loadDataRequest() {
    var theUrl = 'https://api.twitch.tv/kraken/streams/' + encodeURIComponent(ChannelContent_TargetId !== undefined ? ChannelContent_TargetId : Main_values.Main_selectedChannel_id);

    BasehttpGet(theUrl, ChannelContent_loadingDataTimeout, 2, null, ChannelContent_loadDataRequestSuccess, ChannelContent_loadDataError);
}

function ChannelContent_loadDataRequestSuccess(response) {
    if (JSON.parse(response).stream !== null) {
        ChannelContent_responseText = response;
        ChannelContent_loadDataPrepare();
        ChannelContent_GetStreamerInfo();
    } else if (!ChannelContent_TargetId) {
        ChannelContent_loadDataPrepare();
        ChannelContent_loadDataCheckHost();
    } else {
        ChannelContent_responseText = null;
        ChannelContent_loadDataPrepare();
        ChannelContent_GetStreamerInfo();
    }
}

function ChannelContent_loadDataError() {
    ChannelContent_loadingDataTry++;
    if (ChannelContent_loadingDataTry < ChannelContent_loadingDataTryMax) {
        ChannelContent_loadingDataTimeout += 500;
        ChannelContent_loadDataRequest();
    } else {
        ChannelContent_responseText = null;
        ChannelContent_loadDataPrepare();
        ChannelContent_GetStreamerInfo();
    }
}

function ChannelContent_loadDataCheckHost() {
    var theUrl = 'https://tmi.twitch.tv/hosts?include_logins=1&host=' + encodeURIComponent(Main_values.Main_selectedChannel_id);
    var xmlHttp;
    if (Main_Android) {

        xmlHttp = Android.mreadUrl(theUrl, ChannelContent_loadingDataTimeout, 1, null);

        if (xmlHttp) xmlHttp = JSON.parse(xmlHttp);
        else {
            ChannelContent_loadDataCheckHostError();
            return;
        }

        if (xmlHttp.status === 200) {
            ChannelContent_CheckHost(xmlHttp.responseText);
        } else {
            ChannelContent_loadDataCheckHostError();
        }


    } else {

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", proxyurl + theUrl, true);
        xmlHttp.timeout = ChannelContent_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    ChannelContent_CheckHost(xmlHttp.responseText);
                    return;
                } else ChannelContent_loadDataCheckHostError();
            }
        };

        xmlHttp.send(null);
    }
}

function ChannelContent_loadDataCheckHostError() {
    ChannelContent_loadingDataTry++;
    if (ChannelContent_loadingDataTry < ChannelContent_loadingDataTryMax) {
        ChannelContent_loadingDataTimeout += 500;
        ChannelContent_loadDataCheckHost();
    } else {
        ChannelContent_responseText = null;
        ChannelContent_loadDataPrepare();
        ChannelContent_GetStreamerInfo();
    }
}

function ChannelContent_CheckHost(responseText) {
    var response = JSON.parse(responseText);
    ChannelContent_TargetId = response.hosts[0].target_id;
    if (ChannelContent_TargetId !== undefined) {
        ChannelContent_loadDataPrepare();
        ChannelContent_loadDataRequest();
    } else {
        ChannelContent_responseText = null;
        ChannelContent_loadDataPrepare();
        ChannelContent_GetStreamerInfo();
    }
}

function ChannelContent_GetStreamerInfo() {
    var theUrl = 'https://api.twitch.tv/kraken/channels/' + Main_values.Main_selectedChannel_id;

    BasehttpGet(theUrl, PlayVod_loadingInfoDataTimeout, 2, null, ChannelContent_GetStreamerInfoSuccess, ChannelContent_GetStreamerInfoError);
}

function ChannelContent_GetStreamerInfoSuccess(responseText) {
    var channel = JSON.parse(responseText);
    ChannelContent_selectedChannelViews = channel.views;
    ChannelContent_selectedChannelFallower = channel.followers;
    ChannelContent_description = channel.description;
    Main_values.Main_selectedChannelLogo = channel.logo;
    ChannelContent_loadDataSuccess();
    return;
}

function ChannelContent_GetStreamerInfoError() {
    ChannelContent_loadingDataTry++;
    if (ChannelContent_loadingDataTry < ChannelContent_loadingDataTryMax) {
        ChannelContent_loadingDataTimeout += 500;
        ChannelContent_GetStreamerInfo();
    } else {
        ChannelContent_selectedChannelViews = '';
        ChannelContent_selectedChannelFallower = '';
        ChannelContent_description = '';
        Main_values.Main_selectedChannelLogo = IMG_404_LOGO;
        ChannelContent_loadDataSuccess();
    }
}

function ChannelContent_loadDataSuccess() {
    var row = document.createElement('tr'),
        tbody = document.createElement('tbody'),
        coloumn_id = 0;

    Main_td = document.createElement('tr');
    Main_td.className = 'follower_header';
    Main_td.innerHTML = '<div class="follower_header">' + twemoji.parse(ChannelContent_description) + '</div>';

    document.getElementById("stream_table_channel_content").appendChild(tbody);
    document.getElementById("stream_table_channel_content").appendChild(Main_td);

    if (ChannelContent_responseText !== null) {
        var response = JSON.parse(ChannelContent_responseText);
        if (response.stream !== null) {
            var hosting = ChannelContent_TargetId !== undefined ? Main_values.Main_selectedChannelDisplayname +
                STR_USER_HOSTING : '';
            var stream = response.stream;
            row.appendChild(ChannelContent_createCell('0_' + coloumn_id, stream.channel.name, stream.preview.template,
                twemoji.parse(stream.channel.status), stream.game,
                Main_is_playlist(JSON.stringify(stream.stream_type)) +
                hosting + stream.channel.display_name,
                STR_SINCE + Play_streamLiveAt(stream.created_at) + STR_AGO + ', ' + STR_FOR +
                Main_addCommas(stream.viewers) + STR_VIEWER,
                Main_videoqualitylang(stream.video_height, stream.average_fps, stream.channel.language)));
            coloumn_id++;
        } else ChannelContent_skipImg = true;
    } else ChannelContent_skipImg = true;

    row.appendChild(ChannelContent_createChannelCell('0_' + coloumn_id,
        Main_values.Main_selectedChannelDisplayname, Main_values.Main_selectedChannelDisplayname + STR_PAST_BROA, 'movie-play'));
    coloumn_id++;
    row.appendChild(ChannelContent_createChannelCell('0_' + coloumn_id,
        Main_values.Main_selectedChannelDisplayname, Main_values.Main_selectedChannelDisplayname + STR_CLIPS, 'movie'));

    if (coloumn_id < 2) {
        coloumn_id++;
        row.appendChild(Main_createEmptyCell(ChannelContent_ids[9] + '0_' + coloumn_id));
    }

    document.getElementById("stream_table_channel_content").appendChild(row);

    row = document.createElement('tr');
    row.appendChild(ChannelContent_createFallow('1_0',
        Main_values.Main_selectedChannelDisplayname, Main_values.Main_selectedChannelDisplayname, Main_values.Main_selectedChannelLogo));
    document.getElementById("stream_table_channel_content").appendChild(row);

    ChannelContent_loadDataSuccessFinish();
}

//TODO revise this functions there is too many
function ChannelContent_createCell(id, channel_name, preview_thumbnail, stream_title, stream_game, channel_display_name, viwers, quality) {
    ChannelContent_thumbnail = preview_thumbnail.replace("{width}x{height}", Main_VideoSize);

    Main_td = document.createElement('td');
    Main_td.setAttribute('id', ChannelContent_ids[8] + id);
    Main_td.setAttribute(Main_DataAttribute, channel_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + ChannelContent_ids[0] + id + '" class="stream_thumbnail_video" >' +
        '<img id="' + ChannelContent_ids[1] + id + '" class="stream_img"></div>' +
        '<div id="' + ChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + ChannelContent_ids[3] + id + '" class="stream_channel" style="width: 66%; display: inline-block;">' +
        '<i class="icon-circle" style="color: ' +
        (ChannelContent_TargetId !== undefined ? '#FED000' : 'red') + '; font-size: 90%; aria-hidden="true"></i> ' + STR_SPACE +
        channel_display_name + '</div>' +
        '<div id="' + ChannelContent_ids[7] + id + '"class="stream_info" style="width:33%; float: right; text-align: right; display: inline-block;">' +
        quality + '</div>' +
        '<div id="' + ChannelContent_ids[4] + id + '"class="stream_info">' + stream_title + '</div>' +
        '<div id="' + ChannelContent_ids[5] + id + '"class="stream_info">' + STR_PLAYING + stream_game + '</div>' +
        '<div id="' + ChannelContent_ids[6] + id + '"class="stream_info">' + viwers + '</div>' + '</div>';

    return Main_td;
}

function ChannelContent_createChannelCell(id, user_name, stream_type, icons) {
    Main_td = document.createElement('td');
    Main_td.setAttribute('id', ChannelContent_ids[8] + id);
    Main_td.setAttribute(Main_DataAttribute, user_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + ChannelContent_ids[0] + id + '" class="stream_thumbnail_video" ><div id="' +
        ChannelContent_ids[1] + id +
        '" class="stream_channel_content_icon"><i class="icon-' + icons + '"></i></div></div>' +
        '<div id="' + ChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + ChannelContent_ids[3] + id + '" class="stream_channel" style="text-align: center">' + stream_type +
        '</div></div>';

    return Main_td;
}

function ChannelContent_createFallow(id, user_name, stream_type, preview_thumbnail) {
    ChannelContent_thumbnail_fallow = preview_thumbnail;
    Main_td = document.createElement('td');
    Main_td.setAttribute('id', ChannelContent_ids[8] + id);
    Main_td.setAttribute(Main_DataAttribute, user_name);
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = '<div id="' + ChannelContent_ids[0] + id +
        '" class="stream_thumbnail_video" ><div id="schannel_cont_heart" style="position: absolute; top: 5%; left: 6%;"></div><img id="' +
        ChannelContent_ids[1] + id + '" class="stream_img_fallow"></div>' +
        '<div id="' + ChannelContent_ids[2] + id + '" class="stream_text">' +
        '<div id="' + ChannelContent_ids[3] + id + '" class="stream_channel">' + stream_type + '</div>' +
        '<div id="' + ChannelContent_ids[5] + id + '"class="stream_info">' + Main_addCommas(ChannelContent_selectedChannelViews) +
        STR_VIEWS + '</div>' +
        '<div id="' + ChannelContent_ids[6] + id + '"class="stream_info" >' + Main_addCommas(ChannelContent_selectedChannelFallower) +
        STR_FALLOWERS + '</div></div>';

    return Main_td;
}

function ChannelContent_setFallow() {
    if (AddCode_IsFallowing) {
        Main_innerHTML("schannel_cont_heart", '<i class="icon-heart" style="color: #00b300; font-size: 600%; text-shadow: #FFFFFF 0 0 10px, #FFFFFF 0 0 10px, #FFFFFF 0 0 8px;"></i>');
        Main_textContent(ChannelContent_ids[3] + "1_0", Main_values.Main_selectedChannelDisplayname + STR_FALLOWING);
    } else {
        Main_innerHTML("schannel_cont_heart", '<i class="icon-heart-o" style="color: #FFFFFF; font-size: 600%; text-shadow: #000000 0 0 10px, #000000 0 0 10px, #000000 0 0 8px;"></i>');
        if (AddUser_UserIsSet()) Main_textContent(ChannelContent_ids[3] + "1_0", Main_values.Main_selectedChannelDisplayname + STR_FALLOW);
        else Main_textContent(ChannelContent_ids[3] + "1_0", Main_values.Main_selectedChannelDisplayname + STR_CANT_FALLOW);
    }
}

function ChannelContent_loadDataSuccessFinish() {
    Main_ready(function() {
        if (!ChannelContent_status) {
            ChannelContent_status = true;
            if (ChannelContent_thumbnail !== '')
                Main_loadImg(document.getElementById(ChannelContent_ids[1] + '0_0'),
                    ChannelContent_thumbnail, IMG_404_VIDEO);
            Main_loadImg(document.getElementById(ChannelContent_ids[1] + '1_0'), ChannelContent_thumbnail_fallow, IMG_404_LOGO);
            ChannelContent_addFocus();
            Main_SaveValues();
            Main_ShowElement(ChannelContent_ids[10]);
            Main_HideLoadDialog();
        }
        ChannelContent_checkUser();
        Main_FirstLoad = false;
    });
}

function ChannelContent_checkUser() {
    if (ChannelContent_UserChannels) ChannelContent_setFallow();
    else if (AddUser_UserIsSet()) {
        AddCode_Channel_id = Main_values.Main_selectedChannel_id;
        AddCode_PlayRequest = false;
        AddCode_CheckFallow();
    } else {
        AddCode_IsFallowing = false;
        ChannelContent_setFallow();
    }
}

function ChannelContent_addFocus() {
    Main_AddClass(ChannelContent_ids[0] +
        ChannelContent_cursorY + '_' + (!ChannelContent_cursorY ? ChannelContent_cursorX : 0), Main_classThumb);
    if (Main_CenterLablesInUse) ChannelContent_removeFocus();
    Main_handleKeyUp();
}

function ChannelContent_removeFocus() {
    Main_removeFocus(ChannelContent_cursorY + '_' + (!ChannelContent_cursorY ? ChannelContent_cursorX : 0), ChannelContent_ids);
}

function ChannelContent_keyEnter() {
    if (ChannelContent_cursorY) {
        if (AddUser_UserIsSet() && AddUser_UsernameArray[Main_values.Users_Position].access_token) {
            AddCode_PlayRequest = false;
            AddCode_Channel_id = Main_values.Main_selectedChannel_id;
            if (AddCode_IsFallowing) AddCode_UnFallow();
            else AddCode_Fallow();
        } else {
            Main_showWarningDialog(STR_NOKEY_WARN);
            window.setTimeout(Main_HideWarningDialog, 2000);
        }
    } else {
        document.body.removeEventListener("keydown", ChannelContent_handleKeyDown);
        Main_HideElement(ChannelContent_ids[10]);
        var value = (!ChannelContent_skipImg ? 0 : 1);
        if (ChannelContent_cursorX === (0 - value)) {

            Main_values.Play_selectedChannel = document.getElementById(ChannelContent_ids[8] + ChannelContent_cursorY +
                '_' + ChannelContent_cursorX).getAttribute(Main_DataAttribute);

            Main_values.Play_selectedChannelDisplayname = document.getElementById(ChannelContent_ids[3] + ChannelContent_cursorY +
                '_' + ChannelContent_cursorX).textContent;

            if (Main_values.Play_selectedChannelDisplayname.indexOf(STR_USER_HOSTING) !== -1) {
                Main_values.Play_isHost = true;
                Main_values.Play_DisplaynameHost = Main_values.Play_selectedChannelDisplayname;
                Main_values.Play_selectedChannelDisplayname = Main_values.Play_selectedChannelDisplayname.split(STR_USER_HOSTING)[1];
                Main_values.Play_selectedChannel_id = ChannelContent_TargetId;
            } else Main_values.Play_selectedChannel_id = Main_values.Main_selectedChannel_id;

            Main_values.Play_gameSelected = document.getElementById(ChannelContent_ids[5] + ChannelContent_cursorY + '_' + ChannelContent_cursorX).textContent.split(STR_PLAYING)[1];

            Main_ready(Main_openStream);
        } else if (ChannelContent_cursorX === (1 - value)) Main_ready(ChannelVod_init);
        else if (ChannelContent_cursorX === (2 - value)) {
            inUseObj = ChannelClip;
            Main_ready(Screens_init);
        }
    }
}

function ChannelContent_SetChannelValue() {
    ChannelContent_ChannelValue = {
        "Main_values.Main_selectedChannel_id": Main_values.Main_selectedChannel_id,
        "Main_values.Main_selectedChannelLogo": Main_values.Main_selectedChannelLogo,
        "Main_values.Main_selectedChannel": Main_values.Main_selectedChannel,
        "Main_values.Main_selectedChannelDisplayname": Main_values.Main_selectedChannelDisplayname,
        "ChannelContent_UserChannels": ChannelContent_UserChannels,
        "Main_values.Main_BeforeChannel": Main_values.Main_BeforeChannel
    };
}

function ChannelContent_RestoreChannelValue() {
    Main_values.Main_selectedChannel_id = Main_values.Main_selectedChannel_id;
    Main_values.Main_selectedChannelLogo = Main_values.Main_selectedChannelLogo;
    Main_values.Main_selectedChannel = Main_values.Main_selectedChannel;
    Main_values.Main_selectedChannelDisplayname = Main_values.Main_selectedChannelDisplayname;
    ChannelContent_UserChannels = ChannelContent_ChannelValue.ChannelContent_UserChannels;
    Main_values.Main_BeforeChannel = Main_values.Main_BeforeChannel;
    ChannelContent_ChannelValue = {};
    ChannelContent_ChannelValueIsset = false;
}

function ChannelContent_handleKeyDown(event) {
    if (Main_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else {
                ChannelContent_removeFocus();
                Main_CenterLablesStart(ChannelContent_handleKeyDown);
            }
            break;
        case KEY_LEFT:
            if (!ChannelContent_cursorY) {
                ChannelContent_removeFocus();
                ChannelContent_cursorX--;
                if (ChannelContent_cursorX < 0) ChannelContent_cursorX = (!ChannelContent_skipImg ? 2 : 1);
                ChannelContent_addFocus();
            }
            break;
        case KEY_RIGHT:
            if (!ChannelContent_cursorY) {
                ChannelContent_removeFocus();
                ChannelContent_cursorX++;
                if (ChannelContent_cursorX > (!ChannelContent_skipImg ? 2 : 1)) ChannelContent_cursorX = 0;
                ChannelContent_addFocus();
            }
            break;
        case KEY_UP:
        case KEY_DOWN:
            ChannelContent_removeFocus();
            ChannelContent_cursorY = !ChannelContent_cursorY ? 1 : 0;
            ChannelContent_addFocus();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            ChannelContent_keyEnter();
            break;
        default:
            break;
    }
}