/*jshint multistr: true */
function Main() {}
//Variable initialization
Main.isReleased = false;
Main.Hide = '';
Main.Go = 1;
Main.Before = 1;
Main.BeforeSearch = 1;
Main.cursorY = -1;
Main.newImg = new Image();

Main.Live = 1;
Main.AddUser = 2;
Main.Games = 3;
Main.AGame = 4;
Main.UserLive = 5;
Main.UserHost = 6;
Main.UserGames = 7;
Main.UserAGames = 8;
Main.UserVod = 9;
Main.UserAVod = 10;
Main.Search = 11;
Main.SGames = 12;
Main.SLive = 13;
Main.SChannelContent = 14;
Main.Svod = 15;
Main.Sclip = 16;
Main.Users = 17;
Main.UserChannels = 18;
Main.SChannels = 19;
Main.AddCode = 20;
Main.selectedChannel = '';
Main.selectedChannelDisplayname = '';
Main.selectedChannelLogo = '';
Main.selectedChannelViews = '';
Main.selectedChannelFallower = '';
Main.listenerID = null;
Main.ExitDialogID = null;
Main.selectedGame = '';
Main.selectedGameDisplayname = '';
Main.gameSelected = '';
Main.OldgameSelected = null;
Main.OldUserName = '';
Main.SmartHubId = null;
Main.UserName = '';
Main.ScrollbarBlack = true;
Main.NetworkStateOK = true;
Main.NetworkRefresh = false;
Main.td = '';

Main.ScrollOffSetVideo = 275;
Main.ScrollOffSetGame = 523;

Main.ScrollOffSetMinusVideo = 0.345;
Main.ScrollOffSetMinusChannels = 0.430;
Main.ScrollOffSetMinusGame = 0.525;

Main.ReloadLimitOffsetGames = 1.35;
Main.ReloadLimitOffsetVideos = 1.5;

Main.ItemsLimitVideo = 99;
Main.ColoumnsCountVideo = 3;
Main.ItemsReloadLimitVideo = Math.floor((Main.ItemsLimitVideo / Main.ColoumnsCountVideo) / Main.ReloadLimitOffsetVideos);

Main.ItemsLimitGame = 95;
Main.ColoumnsCountGame = 5;
Main.ItemsReloadLimitGame = Math.floor((Main.ItemsLimitGame / Main.ColoumnsCountGame) / Main.ReloadLimitOffsetGames);

Main.ItemsLimitChannel = 96;
Main.ColoumnsCountChannel = 6;
Main.ItemsReloadLimitChannel = Math.floor((Main.ItemsLimitChannel / Main.ColoumnsCountChannel) / Main.ReloadLimitOffsetVideos);

Main.ItemsLimitReload = 6;

Main.TopSpacingDefault = 30;
Main.TopSpacingCleanTop = 34.5;
Main.TopSpacingSearchLable = 40.5;
Main.TopSpacingSearchUnder = 21.5;

Main.TopAgameDefault = 49;
Main.TopAgameDefaultCleanTop = 42.2;
Main.TopAgameDefaultUser = 43;

Main.clientId = "ypvnuqrh98wqz1sr0ov3fgfu4jh1yx";
Main.VideoSize = "528x297"; // default size 640x360
Main.GameSize = "340x475"; // default size 272x380

Main.classThumb = 'stream_thumbnail_focused';
Main.classText = 'stream_text_focused';
Main.classInfo = 'stream_info_focused';

tizen.tvinputdevice.registerKey("ChannelUp");
tizen.tvinputdevice.registerKey("ChannelDown");
tizen.tvinputdevice.registerKey("MediaPlayPause");
tizen.tvinputdevice.registerKey("MediaPlay");
tizen.tvinputdevice.registerKey("MediaPause");
tizen.tvinputdevice.registerKey("ColorF0Red");
tizen.tvinputdevice.registerKey("ColorF1Green");
tizen.tvinputdevice.registerKey("ColorF2Yellow");
tizen.tvinputdevice.registerKey("ColorF3Blue");
tizen.tvinputdevice.registerKey("Guide");
tizen.tvinputdevice.registerKey("Info");

var GIT_IO = "https://bhb27.github.io/smarttv-twitch/release/githubio/images/";
var IMG_404_GAME = GIT_IO + "404_game.png";
var IMG_404_LOGO = GIT_IO + "404_logo.png";
var IMG_404_VIDEO = GIT_IO + "404_video.png";
var IMG_BLUR_GAME = GIT_IO + "blur_game.png";
var IMG_BLUR_VIDEO1 = GIT_IO + "blur_video_1.png";
var IMG_BLUR_VIDEO2 = GIT_IO + "blur_video_2.png";
var IMG_BLUR_VIDEO1_16 = GIT_IO + "blur_video_1_16.png";
var IMG_BLUR_VIDEO2_16 = GIT_IO + "blur_video_2_16.png";
var IMG_BLUR_VOD = GIT_IO + "blur_vod.png";
var IMG_USER_MINUS = GIT_IO + "user_minus.png";
var IMG_USER_PLUS = GIT_IO + "user_plus.png";
var IMG_USER_UP = GIT_IO + "user_up.png";
var IMG_USER_CODE = GIT_IO + "user_code.png";
var IMG_LOD_LOGO = GIT_IO + "ch_logo.png";
var TEMP_MP4 = GIT_IO + "temp.mp4";
var IMG_SMART_LIVE = GIT_IO + "smart_live.png";
var IMG_SMART_GAME = GIT_IO + "smart_games.png";
var IMG_SMART_USER = GIT_IO + "smart_add_user.png";

Main.version = 400;
Main.stringVersion = '4.0.0';
Main.currentVersion = '';
Main.minversion = '042018';
Main.versonTag = '';
//Variable initialization end

// this function will be called only once the first time the app opens
document.addEventListener("DOMContentLoaded", function() {
    tizen.systeminfo.getPropertyValue('LOCALE', Main.loadTranslations);
});

//TODO the day there is a translation add on if if the new values
Main.loadTranslations = function(device) {

    // Language is set as (LANGUAGE)_(REGION) in (ISO 639-1)_(ISO 3166-1 alpha-2) eg.; pt_BR Brazil, en_US USA
    // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

    var lang = device.language.split(".")[0];

    if (lang.indexOf('pt_') !== -1) {
        pt_BRLang();
        Main.TopSpacingDefault = 25;
        Main.TopSpacingSearchLable = 38.5;
        Main.TopAgameDefault = 54;
        Main.TopSpacingCleanTop = 32.5;
    } else console.log("language is " + lang);
    DefaultLang();

    if (Main.isReleased) document.body.innerHTML = STR_BODY;
    else STR_CONTROLS_MAIN_0 = STR_CONTROLS_MAIN_0 + STR_BR + Main.CheckMp4Html5();
    document.getElementById("top_bar_spacing").style.paddingLeft = Main.TopSpacingDefault + "%";
    document.getElementById("id_agame_name").style.paddingLeft = Main.TopAgameDefault + "%";
    Main.initWindows();
    Live.init();
    Play.PreStart();
    UserGames.live = (localStorage.getItem('user_games_live') || 'true') === 'true' ? true : false;
    AddUser.RestoreUsers();
    // pre load All img
    Main.PreLoadAImage(IMG_404_VIDEO);
    Main.PreLoadAImage(IMG_404_GAME);
    Main.PreLoadAImage(IMG_404_LOGO);
    Main.PreLoadAImage(IMG_BLUR_GAME);
    Main.PreLoadAImage(IMG_BLUR_VIDEO1);
    Main.PreLoadAImage(IMG_BLUR_VIDEO2);
    Main.PreLoadAImage(IMG_BLUR_VIDEO1_16);
    Main.PreLoadAImage(IMG_BLUR_VIDEO2_16);
    Main.PreLoadAImage(IMG_BLUR_VOD);
    Main.PreLoadAImage(IMG_USER_MINUS);
    Main.PreLoadAImage(IMG_USER_PLUS);
    Main.PreLoadAImage(IMG_USER_UP);
    Main.PreLoadAImage(IMG_USER_CODE);
};

Main.initWindows = function() {
    //set top bar labels
    Main.IconLoad('label_refresh', 'icon-refresh', STR_REFRESH);
    Main.IconLoad('label_search', 'icon-search', STR_SEARCH_KEY);
    Main.IconLoad('label_switch', 'icon-switch', STR_SWITCH);
    Main.IconLoad('label_controls', 'icon-question-circle', STR_CONTROL_KEY);
    Main.IconLoad('label_about', 'icon-info-circle', STR_ABOUT_KEY);
    document.getElementById('top_bar_live').innerHTML = STR_LIVE;
    document.getElementById('top_bar_user').innerHTML = STR_USER;
    document.getElementById('top_bar_game').innerHTML = STR_GAMES;
    document.getElementById('id_agame_name').innerHTML = '';
    document.getElementById('chanel_button').innerHTML = STR_CHANNELS;
    document.getElementById('game_button').innerHTML = STR_GAMES;
    document.getElementById('live_button').innerHTML = STR_LIVE;
    document.getElementById('exit_app_cancel').innerHTML = STR_CANCEL;
    document.getElementById('exit_app_close').innerHTML = STR_CLOSE;
    document.getElementById('remove_cancel').innerHTML = STR_CANCEL;
    document.getElementById('remove_yes').innerHTML = STR_YES;
    document.getElementById('exit_app_minimize').innerHTML = STR_MINIMIZE;
    document.getElementById("main_dialog_exit_text").innerHTML = STR_EXIT_MESSAGE;
    document.getElementById("dialog_about_text").innerHTML = STR_ABOUT_INFO_HEADER + STR_ABOUT_INFO_0;
    document.getElementById("dialog_controls_text").innerHTML = STR_CONTROLS_MAIN_0;
    Main.NetworkStateChangeListenerStart();
};

Main.IconLoad = function(lable, icon, string) {
    document.getElementById(lable).innerHTML = '<div style="vertical-align: middle; display: inline-block;"><i class="' + icon +
        '" style="color: #FFFFFF; font-size: 115%; "></i></div><div style="vertical-align: middle; display: inline-block">' + STR_SPACE + string + '</div>';
};

Main.ChangeBorder = function(div, value) {
    document.getElementById(div).style.border = value;
};

Main.ChangebackgroundColor = function(div, value) {
    document.getElementById(div).style.backgroundColor = value;
};

Main.showLoadDialog = function() {
    Main.HideExitDialog();
    document.getElementById('dialog_loading').classList.remove('hide');
};

Main.HideLoadDialog = function() {
    document.getElementById('dialog_loading').classList.add('hide');
};

Main.clearExitDialog = function() {
    window.clearTimeout(Main.ExitDialogID);
};

Main.setExitDialog = function() {
    Main.ExitDialogID = window.setTimeout(Main.HideExitDialog, 6000);
};

Main.showExitDialog = function() {
    Main.setExitDialog();
    document.getElementById('main_dialog_exit').classList.remove('hide');
};

Main.HideExitDialog = function() {
    Main.clearExitDialog();
    document.getElementById('main_dialog_exit').classList.add('hide');
    Live.ExitCursor = 0;
    Live.ExitCursorSet();
};

Main.isExitDialogShown = function() {
    return document.getElementById('main_dialog_exit').className.indexOf('hide') === -1;
};

Main.CounterDialogRst = function() {
    document.getElementById('dialog_counter_text').innerHTML = '';
    Main.Scrollbar(0, 0, 0);
};

Main.CounterDialog = function(x, y, coloumns, total) {
    if (total > 0) {
        document.getElementById('dialog_counter_text').innerHTML = (y * coloumns) + (x + 1) + '/' + (total);
        Main.Scrollbar(y, coloumns, total);
    } else Main.CounterDialogRst();
};

Main.Scrollbar = function(y, coloumns, total) {
    // min 100 max 1000 or the 900 + 100 below
    if ((coloumns === 3 && (total > 9)) || (coloumns === 5 && (total > 10)) || (coloumns === 6 && (total > 12))) {
        var nextPositon = Math.ceil(900 / (Math.ceil(total / coloumns) - 1) * y + 100);
        var currentPositon = document.getElementById('scrollbar').offsetTop;

        //If position are different it means previously animation did't ended, stop it and force set the value
        if (currentPositon !== Main.nextScrollPositon) {
            $('#scrollbar').stop();
            document.getElementById("scrollbar").style.top = Main.nextScrollPositon + "px";
        }
        Main.nextScrollPositon = nextPositon;

        $('#scrollbar').animate({
            top: nextPositon + 'px'
        }, 400);

        if (Main.ScrollbarBlack) {
            Main.ScrollbarBlack = false;
            window.setTimeout(function() {
                document.getElementById("scrollbar").style.backgroundColor = "#777777";
            }, (nextPositon === 100 ? 0 : 800));
        }
    } else {
        $('#scrollbar').stop();
        document.getElementById("scrollbar").style.backgroundColor = "#000000";
        Main.nextScrollPositon = 100;
        Main.ScrollbarBlack = true;
        document.getElementById("scrollbar").style.top = "100px";
    }
};

Main.SetItemsLimitReload = function(blankCellCount) {
    Main.ItemsLimitReload = 12;
    if (blankCellCount > (Main.ItemsLimitReload / 3)) Main.ItemsLimitReload = blankCellCount * 3;
    if (Main.ItemsLimitReload > 99) Main.ItemsLimitReload = 99;
};

Main.showWarningDialog = function(text) {
    if (!Main.NetworkStateOK && text === STR_REFRESH_PROBLEM) Main.NetworkRefresh = true;
    document.getElementById('dialog_warning_text').innerHTML = !Main.NetworkStateOK ? STR_NET_DOWN : text;
    document.getElementById('dialog_warning').classList.remove('hide');
};

Main.HideWarningDialog = function() {
    document.getElementById('dialog_warning').classList.add('hide');
};

Main.isWarningDialogShown = function() {
    return document.getElementById('dialog_warning').className.indexOf('hide') === -1;
};

Main.showAboutDialog = function() {
    Main.HideExitDialog();
    Main.HideControlsDialog();
    Main.HideUpdateDialog();
    document.getElementById('dialog_about').classList.remove('hide');
};

Main.HideAboutDialog = function() {
    document.getElementById('dialog_about').classList.add('hide');
};

Main.isAboutDialogShown = function() {
    return document.getElementById('dialog_about').className.indexOf('hide') === -1;
};

Main.showControlsDialog = function() {
    Main.HideExitDialog();
    Main.HideAboutDialog();
    Main.HideUpdateDialog();
    document.getElementById('dialog_controls').classList.remove('hide');
};

Main.HideControlsDialog = function() {
    document.getElementById('dialog_controls').classList.add('hide');
};


Main.isControlsDialogShown = function() {
    return document.getElementById('dialog_controls').className.indexOf('hide') === -1;
};

Main.showUpdateDialog = function() {
    Main.HideExitDialog();
    Main.HideAboutDialog();
    Main.HideControlsDialog();
    document.getElementById('dialog_update').classList.remove('hide');
};

Main.HideUpdateDialog = function() {
    document.getElementById('dialog_update').classList.add('hide');
};

Main.isUpdateDialogShown = function() {
    return document.getElementById('dialog_update').className.indexOf('hide') === -1;
};

Main.addCommas = function(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

Main.videoqualitylang = function(video_height, average_fps, language) {
    video_height = video_height + ''; //stringfy doesnot work 8|
    if (!video_height.indexOf('x')) video_height = video_height.slice(-3);

    if (average_fps > 58) average_fps = 60;
    else if (average_fps < 32) average_fps = 30;
    else average_fps = Math.ceil(average_fps);

    return video_height + 'p' + average_fps + ((language !== "") ? ' [' + language.toUpperCase() + ']' : '');
};

Main.is_playlist = function(content) {
    return (content.indexOf('live') !== -1) ? '' : STR_NOT_LIVE;
};

Main.ThumbNull = function(y, x, thumbnail) {
    return document.getElementById(thumbnail + y + '_' + x, 0) !== null;
};

Main.StartPlayerLive = function() {
    document.body.addEventListener("keydown", Play.handleKeyDown, false);
    Play.Start();
};

Main.ReStartScreens = function() {
    document.getElementById('play_dialog_exit').classList.add('hide');
    Main.SwitchScreen();
    webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
};

Main.SwitchScreen = function() {
    Main.ScrollHelperBlank.scrollVerticalToElementById('blank_focus');
    if (Main.NetworkStateOK) Main.HideWarningDialog();
    Main.CounterDialogRst();
    if (Main.Go === Main.Live) Live.init();
    else if (Main.Go === Main.AddUser) AddUser.init();
    else if (Main.Go === Main.Games) Games.init();
    else if (Main.Go === Main.AGame) AGame.init();
    else if (Main.Go === Main.Search) Search.init();
    else if (Main.Go === Main.SGames) SGames.init();
    else if (Main.Go === Main.SLive) SLive.init();
    else if (Main.Go === Main.SChannelContent) SChannelContent.init();
    else if (Main.Go === Main.Svod) Svod.init();
    else if (Main.Go === Main.Sclip) Sclip.init();
    else if (Main.Go === Main.Users) Users.init();
    else if (Main.Go === Main.UserLive) UserLive.init();
    else if (Main.Go === Main.UserHost) UserHost.init();
    else if (Main.Go === Main.UserGames) UserGames.init();
    else if (Main.Go === Main.UserChannels) UserChannels.init();
    else if (Main.Go === Main.SChannels) SChannels.init();
    else Live.init();
};

Main.ExitCurrent = function(ExitCurrent) {
    if (ExitCurrent === Main.Live) Live.exit();
    else if (ExitCurrent === Main.AddUser) AddUser.exit();
    else if (ExitCurrent === Main.Games) Games.exit();
    else if (ExitCurrent === Main.AGame) AGame.exit();
    else if (ExitCurrent === Main.Search) Search.exit();
    else if (ExitCurrent === Main.SGames) SGames.exit();
    else if (ExitCurrent === Main.SLive) SLive.exit();
    else if (ExitCurrent === Main.SChannelContent) SChannelContent.exit();
    else if (ExitCurrent === Main.Svod) Svod.exit();
    else if (ExitCurrent === Main.Sclip) Sclip.exit();
    else if (ExitCurrent === Main.Users) Users.exit();
    else if (ExitCurrent === Main.UserLive) UserLive.exit();
    else if (ExitCurrent === Main.UserHost) UserHost.exit();
    else if (ExitCurrent === Main.UserGames) UserGames.exit();
    else if (ExitCurrent === Main.UserChannels) UserChannels.exit();
    else if (ExitCurrent === Main.SChannels) SChannels.exit();
};

Main.openStream = function() {
    document.body.addEventListener("keydown", Play.handleKeyDown, false);
    document.getElementById('scene2').classList.remove('hide');
    Play.hidePanel();
    Play.hideChat();
    document.getElementById('scene1').classList.add('hide');
    Play.Start();
};

Main.RestoreTopLabel = function() {
    Main.IconLoad('label_refresh', 'icon-refresh', STR_REFRESH);
    Main.IconLoad('label_search', 'icon-search', STR_SEARCH_KEY);
    Main.IconLoad('label_switch', 'icon-switch', STR_SWITCH);
    document.getElementById('top_bar_user').classList.remove('icon_center_focus');
    document.getElementById("top_bar_spacing").style.paddingLeft = Main.TopSpacingDefault + "%";
    document.getElementById("id_agame_name").style.paddingLeft = Main.TopAgameDefault + "%";
    document.getElementById('top_bar_live').innerHTML = STR_LIVE;
    document.getElementById('top_bar_user').innerHTML = STR_USER;
    document.getElementById('top_bar_game').innerHTML = STR_GAMES;
    document.getElementById('id_agame_name').innerHTML = '';
};

Main.cleanTopLabel = function() {
    Main.IconLoad('label_refresh', 'icon-arrow-circle-left', STR_GOBACK);
    document.getElementById('label_switch').innerHTML = '';
    document.getElementById('top_bar_live').innerHTML = '';
    document.getElementById('top_bar_game').innerHTML = '';
    document.getElementById("top_bar_spacing").style.paddingLeft = Main.TopSpacingCleanTop + "%";
    document.getElementById('top_bar_user').classList.add('icon_center_focus');
    document.getElementById("id_agame_name").style.paddingLeft = Main.TopAgameDefaultCleanTop + "%";
};

Main.videoCreatedAt = function(time) { //time in '2017-10-27T13:27:27Z'
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    time = new Date(time);
    return monthNames[time.getMonth()] + ' ' + time.getDate() + ', ' + time.getFullYear();
};

Main.NetworkStateChangeListenerStart = function() {
    var onChange = function(data) {
        if (data === 1 || data === 4) { //network connected
            Main.NetworkStateOK = true;
            if (Main.isWarningDialogShown()) {
                Main.showWarningDialog(STR_NET_UP);
                if (Main.NetworkRefresh) Main.SwitchScreen();
                Main.NetworkRefresh = false;
            }
            if (Play.WarningDialogVisible()) Main.showWarningDialog(STR_NET_UP);
            window.setTimeout(Main.HideExitDialog, 1500);
        } else if (data === 2 || 5) { //network down
            Main.NetworkStateOK = false;
            window.setTimeout(function() {
                if (!Main.NetworkStateOK) {
                    Main.showWarningDialog('');
                    Play.showWarningDialog(STR_NET_DOWN);
                }
            }, 5000);
        }
    };
    try {
        Main.listenerID = webapis.network.addNetworkStateChangeListener(onChange);
    } catch (e) {}
};

Main.NetworkStateChangeListenerStop = function() {
    try {
        webapis.network.removeNetworkStateChangeListener(Main.listenerID);
    } catch (e) {}
};

Main.checkVersion = function() {
    var version = null,
        value = 0;
    try {
        version = (tizen.application.getAppInfo().version);
    } catch (e) {}
    if (version !== null) {
        Main.currentVersion = version;
        Main.versonTag = STR_VERSION + version + '.' + Main.minversion + STR_BR;
        version = version.split(".");
        value = parseInt(version[0] + version[1] + version[2]);
        document.getElementById("dialog_about_text").innerHTML = STR_ABOUT_INFO_HEADER + Main.versonTag + STR_ABOUT_INFO_0;
        document.getElementById("dialog_update_text").innerHTML = STR_UPDATE_MAIN_HEADER + STR_CURRENT_VERSION + Main.currentVersion + STR_LATEST_VERSION + Main.stringVersion + STR_BR + STR_UPDATE_MAIN_0;
        return value < Main.version;
    } else return false;
};

Main.GoLive = function() {
    AddCode.SetDefaultOAuth(0);
    Main.Go = Main.Live;
    Main.SwitchScreen();
};

Main.Resume = function() {
    if (document.hidden) {
        window.clearInterval(Main.SmartHubId);
        Main.NetworkStateChangeListenerStop();
    } else {
        window.setTimeout(function() {
            Main.NetworkStateChangeListenerStart();
        }, 20000);
        window.setTimeout(function() {
            if (AddUser.UsernameArray.length > 0) {
                if ((new Date().getTime() - 590000) > SmartHub.LastUpdate) SmartHub.Start();
                Main.SmartHubId = window.setInterval(SmartHub.Start, 600000);
            } else {
                window.clearInterval(Main.SmartHubId);
                document.removeEventListener('visibilitychange', Main.Resume);
            }
        }, 1500);
    }
};

Main.LoadImages = function(imgVector, idVector, img_type) {
    var loadImages = function(position, ImgObjet) {
        ImgObjet.onerror = function() {
            this.src = img_type; //img fail to load use predefined
        };
        ImgObjet.src = imgVector[position];
    };

    for (var i = 0; i < imgVector.length; i++) {
        loadImages(i, document.getElementById(idVector[i]));
    }
};

Main.LazyImgStart = function(imgId, total, img_type, coloumns) {
    var x, y = 0,
        loadImages = function(ImgObjet) {
            ImgObjet.onerror = function() {
                this.src = img_type; //img fail to load use predefined
            };
            ImgObjet.src = ImgObjet.getAttribute('data-src');
            ImgObjet.removeAttribute('data-src');
        };
    for (y; y < total; y++) {
        for (x = 0; x < coloumns; x++) {
            elem = document.getElementById(imgId + y + '_' + x);
            if (elem !== null) loadImages(elem);
        }
    }
    Main.Ychange(0);
};

Main.LazyImg = function(imgId, row_id, img_type, coloumns, offset) { //offset is one more then number if (cursorY > number)
    var change = Main.Ychange(row_id);

    if (row_id === offset && change === 1) change = 0;

    if (change) {
        var x = 0,
            y, elem, loadImages = function(ImgLoadObjet) {
                ImgLoadObjet.onerror = function() {
                    this.src = img_type; //img fail to load use predefined
                };
                ImgLoadObjet.src = ImgLoadObjet.getAttribute('data-src');
                ImgLoadObjet.removeAttribute('data-src');
            },
            resetImages = function(ImgRstObjet) {
                ImgRstObjet.setAttribute('data-src', ImgRstObjet.getAttribute('src'));
                ImgRstObjet.removeAttribute('src');
            };

        for (x; x < coloumns; x++) {
            y = change > 0 ? row_id + offset : row_id - offset;
            elem = document.getElementById(imgId + y + '_' + x);
            if (elem !== null) loadImages(elem);

            y = change > 0 ? row_id - offset - 1 : row_id + offset + 1;
            elem = document.getElementById(imgId + y + '_' + x);
            if (elem !== null) resetImages(elem);
        }
    }
};

Main.Ychange = function(y) {
    var position = 0;

    if (Main.cursorY < y) position = 1; //going down
    else if (Main.cursorY > y) position = -1; //going up

    Main.cursorY = y;
    return position;
};

Main.YRst = function(y) {
    Main.cursorY = y;
};

Main.PreLoadAImage = function(link) {
    Main.newImg.src = link;
};

Main.createCellEmpty = function(row_id, coloumn_id, cell) {
    // id here can't be equal between screen
    return $('<td id="' + cell + row_id + '_' + coloumn_id + '" class="stream_cell" data-channelname=""></td>').html('');
};

Main.createEmptyCell = function(id) {
    Main.td = document.createElement('td');
    Main.td.setAttribute('id', id);
    Main.td.className = 'stream_cell';

    return Main.td;
};

Main.createCellVideo = function(channel_name, id, idArray, valuesArray) {
    Main.td = document.createElement('td');
    Main.td.setAttribute('id', idArray[8] + id);
    Main.td.setAttribute('data-channelname', channel_name);
    Main.td.className = 'stream_cell';
    Main.td.innerHTML = Main.VideoHtml(id, idArray, valuesArray);

    return Main.td;
};

Main.replaceVideo = function(id, channel_name, valuesArray, cell, splitedId) {
    splitedId = id.split(splitedId)[1];
    id = document.getElementById(id);
    id.setAttribute('data-channelname', channel_name);
    id.innerHTML = Main.VideoHtml(splitedId, Live.ids, valuesArray);
    id.setAttribute('id', cell + splitedId);
};

Main.VideoHtml = function(id, idArray, valuesArray) {
    return '<div id="' + idArray[0] + id + '" class="stream_thumbnail_video" >' +
        '<img id="' + idArray[1] + id + '" class="stream_img" data-src="' + valuesArray[0] + '"></div>' +
        '<div id="' + idArray[2] + id + '" class="stream_text">' +
        '<div id="' + idArray[3] + id + '" class="stream_channel">' + valuesArray[1] + '</div>' +
        '<div id="' + idArray[4] + id + '"class="stream_info">' + valuesArray[2] + '</div>' +
        '<div id="' + idArray[5] + id + '"class="stream_info">' + valuesArray[3] + '</div>' +
        '<div id="' + idArray[6] + id + '"class="stream_info" style="width: 64%; display: inline-block;">' + valuesArray[4] + '</div>' +
        '<div id="' + idArray[7] + id + '"class="stream_info" style="width:35%; float: right; display: inline-block;">' + valuesArray[5] + '</div></div>';
};

Main.CheckMp4Html5 = function() {
    var result = STR_BR + 'Html5 mp4 video support:' + STR_BR + STR_DOT;
    if (!!document.createElement('video').canPlayType) {

        var VideoTest = document.createElement("video");
        var h264Test = VideoTest.canPlayType('video/mp4; codecs="avc1.42E01E"');

        if (h264Test) {
            if (h264Test === "probably") result += " Full support for avc1.";
            else result += " Some support for avc1.(" + h264Test + ")";
        } else {
            result += "No video support for avc1.";
        }

        result += STR_BR + STR_DOT;
        h264Test = VideoTest.canPlayType('video/mp4; codecs="mp4a.40.2"');

        if (h264Test) {
            if (h264Test === "probably") result += " Full support for mp4a.";
            else result += " Some support for mp4a.(" + h264Test + ")";
        } else {
            result += " No video support for mp4a.";
        }

    } else result += "No video support at all, createElement video fail.";

    return result;
};

Main.addFocusVideo = function(y, x, Thumbnail, ThumbnailDiv, DispNameDiv, StreamTitleDiv, StreamGameDiv,
    ViwersDiv, QualityDiv, screen, ColoumnsCount, itemsCount) {
    document.getElementById(Thumbnail + y + '_' + x).classList.add(Main.classThumb);
    document.getElementById(ThumbnailDiv + y + '_' + x).classList.add(Main.classText);
    document.getElementById(DispNameDiv + y + '_' + x).classList.add(Main.classInfo);
    document.getElementById(StreamTitleDiv + y + '_' + x).classList.add(Main.classInfo);
    document.getElementById(StreamGameDiv + y + '_' + x).classList.add(Main.classInfo);
    document.getElementById(ViwersDiv + y + '_' + x).classList.add(Main.classInfo);
    document.getElementById(QualityDiv + y + '_' + x).classList.add(Main.classInfo);

    window.setTimeout(function() {
        Main.ScrollHelper.scrollVerticalToElementById(Thumbnail, y, x, screen, Main.ScrollOffSetMinusVideo, Main.ScrollOffSetVideo, false);
    }, 10);

    Main.CounterDialog(x, y, ColoumnsCount, itemsCount);
};

Main.removeFocusVideo = function(y, x, Thumbnail, ThumbnailDiv, DispNameDiv, StreamTitleDiv, StreamGameDiv, ViwersDiv, QualityDiv) {
    document.getElementById(Thumbnail + y + '_' + x).classList.remove(Main.classThumb);
    document.getElementById(ThumbnailDiv + y + '_' + x).classList.remove(Main.classText);
    document.getElementById(DispNameDiv + y + '_' + x).classList.remove(Main.classInfo);
    document.getElementById(StreamTitleDiv + y + '_' + x).classList.remove(Main.classInfo);
    document.getElementById(StreamGameDiv + y + '_' + x).classList.remove(Main.classInfo);
    document.getElementById(ViwersDiv + y + '_' + x).classList.remove(Main.classInfo);
    document.getElementById(QualityDiv + y + '_' + x).classList.remove(Main.classInfo);
};

Main.addFocusVideoArray = function(y, x, idArray, screen, ColoumnsCount, itemsCount) {
    var id = y + '_' + x;
    document.getElementById(idArray[0] + id).classList.add(Main.classThumb);
    document.getElementById(idArray[2] + id).classList.add(Main.classText);
    document.getElementById(idArray[3] + id).classList.add(Main.classInfo);
    document.getElementById(idArray[4] + id).classList.add(Main.classInfo);
    document.getElementById(idArray[5] + id).classList.add(Main.classInfo);
    document.getElementById(idArray[6] + id).classList.add(Main.classInfo);
    document.getElementById(idArray[7] + id).classList.add(Main.classInfo);

    window.setTimeout(function() {
        Main.ScrollHelper.scrollVerticalToElementById(idArray[0], y, x, screen, Main.ScrollOffSetMinusVideo, Main.ScrollOffSetVideo, false);
    }, 10);

    Main.CounterDialog(x, y, ColoumnsCount, itemsCount);
};

Main.removeFocusVideoArray = function(id, idArray) {
    document.getElementById(idArray[0] + id).classList.remove(Main.classThumb);
    document.getElementById(idArray[2] + id).classList.remove(Main.classText);
    document.getElementById(idArray[3] + id).classList.remove(Main.classInfo);
    document.getElementById(idArray[4] + id).classList.remove(Main.classInfo);
    document.getElementById(idArray[5] + id).classList.remove(Main.classInfo);
    document.getElementById(idArray[6] + id).classList.remove(Main.classInfo);
    document.getElementById(idArray[7] + id).classList.remove(Main.classInfo);
};

Main.addFocusGame = function(y, x, Thumbnail, ThumbnailDiv, DispNameDiv, ViwersDiv, screen, ColoumnsCount, itemsCount) {
    document.getElementById(Thumbnail + y + '_' + x).classList.add(Main.classThumb);
    document.getElementById(ThumbnailDiv + y + '_' + x).classList.add(Main.classText);
    document.getElementById(DispNameDiv + y + '_' + x).classList.add(Main.classInfo);
    document.getElementById(ViwersDiv + y + '_' + x).classList.add(Main.classInfo);

    window.setTimeout(function() {
        Main.ScrollHelper.scrollVerticalToElementById(Thumbnail, y, x, screen, Main.ScrollOffSetMinusGame, Main.ScrollOffSetGame, false);
    }, 10);

    Main.CounterDialog(x, y, ColoumnsCount, itemsCount);
};

Main.removeFocusGame = function(y, x, Thumbnail, ThumbnailDiv, DispNameDiv, ViwersDiv) {
    document.getElementById(Thumbnail + y + '_' + x).classList.remove(Main.classThumb);
    document.getElementById(ThumbnailDiv + y + '_' + x).classList.remove(Main.classText);
    document.getElementById(DispNameDiv + y + '_' + x).classList.remove(Main.classInfo);
    document.getElementById(ViwersDiv + y + '_' + x).classList.remove(Main.classInfo);
};

Main.ScrollHelper = {
    documentVerticalScrollPosition: function() {
        if (self.pageYOffset) return self.pageYOffset; // Firefox, Chrome, Opera, Safari.
        if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop; // Internet Explorer 6 (standards mode).
        if (document.body.scrollTop) return document.body.scrollTop; // Internet Explorer 6, 7 and 8.
        return 0; // None of the above.
    },

    viewportHeight: function() {
        return (document.compatMode === "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight;
    },

    documentHeight: function() {
        return (document.height !== undefined) ? document.height : document.body.offsetHeight;
    },

    documentMaximumScrollPosition: function() {
        return this.documentHeight() - this.viewportHeight();
    },

    elementVerticalClientPositionById: function(id) {
        return document.getElementById(id).getBoundingClientRect().top;
    },

    scrollVerticalToElementById: function(Thumbnail, cursorY, cursorX, Screen, OffsetMinus, OffsetPlus, DuploYOffsetCheck) {
        var id = Thumbnail + cursorY + '_' + cursorX;

        if (document.getElementById(id) === null) {
            if (!cursorY && !cursorX) Main.ScrollHelperBlank.scrollVerticalToElementById('blank_focus');
            return;
        } else if (Screen === Main.UserChannels || Screen === Main.SChannels) {
            if (!Main.ThumbNull((cursorY + 1), 0, Thumbnail)) {
                if (cursorY > 2) id = Thumbnail + (cursorY - 1) + '_' + cursorX;
                else cursorY = 0;
            }
        } else if (cursorY > 1 && OffsetPlus !== Main.ScrollOffSetGame && !Main.ThumbNull((cursorY + 1), 0, Thumbnail)) {
            id = Thumbnail + (cursorY - 1) + '_' + cursorX;
        } else if (cursorY === 1 && OffsetPlus !== Main.ScrollOffSetGame && !Main.ThumbNull((cursorY + 1), 0, Thumbnail)) {
            id = Thumbnail + (cursorY - 1) + '_' + cursorX;
            cursorY = 0;
        }
        if (!cursorY && Screen === Main.AGame) OffsetPlus = OffsetPlus - 83;

        if (DuploYOffsetCheck) {
            DuploYOffsetCheck = (!cursorY || cursorY === 1);
            if (DuploYOffsetCheck) {
                id = Thumbnail + '0_' + cursorX;
                OffsetMinus = OffsetMinus - 0.085;
            }
        } else DuploYOffsetCheck = (!cursorY);

        if (Main.Go === Screen) {
            window.scroll(0, this.documentVerticalScrollPosition() + this.elementVerticalClientPositionById(id) -
                OffsetMinus * this.viewportHeight() + (DuploYOffsetCheck ? OffsetPlus : 0));
        } else return;
    }
};


Main.ScrollHelperBlank = {
    documentVerticalScrollPosition: function() {
        if (self.pageYOffset) return self.pageYOffset; // Firefox, Chrome, Opera, Safari.
        if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop; // Internet Explorer 6 (standards mode).
        if (document.body.scrollTop) return document.body.scrollTop; // Internet Explorer 6, 7 and 8.
        return 0; // None of the above.
    },

    viewportHeight: function() {
        return (document.compatMode === "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight;
    },

    documentHeight: function() {
        return (document.height !== undefined) ? document.height : document.body.offsetHeight;
    },

    documentMaximumScrollPosition: function() {
        return this.documentHeight() - this.viewportHeight();
    },

    elementVerticalClientPositionById: function(id) {
        return document.getElementById(id).getBoundingClientRect().top;
    },

    scrollVerticalToElementById: function(id) {
        window.scroll(0, this.documentVerticalScrollPosition() +
            this.elementVerticalClientPositionById(id) - 0.345 * this.viewportHeight());
    }
};
