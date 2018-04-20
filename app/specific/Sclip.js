/*jshint multistr: true */
//Variable initialization
function Sclip() {}
Sclip.cursorY = 0;
Sclip.cursorX = 0;
Sclip.dataEnded = false;
Sclip.itemsCount = 0;
Sclip.nameMatrix = [];
Sclip.blankCellVector = [];
Sclip.loadingData = false;
Sclip.loadingDataTry = 0;
Sclip.loadingDataTryMax = 10;
Sclip.loadingDataTimeout = 3500;
Sclip.isDialogOn = false;
Sclip.blankCellCount = 0;
Sclip.LastClickFinish = true;
Sclip.keyClickDelayTime = 25;
Sclip.ReplacedataEnded = false;
Sclip.MaxOffset = 0;
Sclip.DurationSeconds = 0;
Sclip.emptyContent = false;

Sclip.ids = ['sc_thumbdiv', 'sc_img', 'sc_infodiv', 'sc_title', 'sc_createdon', 'sc_game', 'sc_viwers', 'sc_duration', 'sc_cell', 'scempty_'];
Sclip.status = false;
Sclip.highlight = false;
Sclip.cursor = null;
Sclip.periodNumber = 1;
Sclip.period = 'week';
Sclip.Duration = 0;
Sclip.game = '';
Sclip.views = '';
Sclip.title = '';
Sclip.lastselectedChannel = '';
Sclip.playUrl = '';
Sclip.itemsCountCheck = false;

//Variable initialization end

Sclip.init = function() {
    Main.Go = Main.Sclip;
    Main.SetStreamTitle(true);
    if (Main.selectedChannel !== Sclip.lastselectedChannel) Sclip.status = false;
    Main.cleanTopLabel();
    Sclip.SetPeriod();
    document.getElementById('top_bar_user').innerHTML = Main.selectedChannelDisplayname;
    document.getElementById("top_bar_spacing").style.paddingLeft = Main.TopSpacingSearchUnder + "%";
    Main.IconLoad('label_switch', 'icon-switch', STR_SWITCH_CLIP);
    document.body.addEventListener("keydown", Sclip.handleKeyDown, false);
    Main.YRst(Sclip.cursorY);
    if (Sclip.status) {
        Main.ScrollHelper.scrollVerticalToElementById(Sclip.ids[0], Sclip.cursorY, Sclip.cursorX, Main.Sclip, Main.ScrollOffSetMinusVideo,
            Main.ScrollOffSetVideo, false);
        Main.CounterDialog(Sclip.cursorX, Sclip.cursorY, Main.ColoumnsCountVideo, Sclip.itemsCount);
    } else Sclip.StartLoad();
};

Sclip.exit = function() {
    Main.RestoreTopLabel();
    document.body.removeEventListener("keydown", Sclip.handleKeyDown);
    Main.SetStreamTitle(false);
};

Sclip.StartLoad = function() {
    Main.HideWarningDialog();
    Main.ScrollHelperBlank.scrollVerticalToElementById('blank_focus');
    Main.showLoadDialog();
    Sclip.lastselectedChannel = Main.selectedChannel;
    Sclip.cursor = null;
    Sclip.status = false;
    var table = document.getElementById('stream_table_search_clip');
    while (table.firstChild) table.removeChild(table.firstChild);
    Sclip.loadingMore = false;
    Sclip.blankCellCount = 0;
    Sclip.ReplacedataEnded = false;
    Sclip.MaxOffset = 0;
    Sclip.nameMatrix = [];
    Sclip.blankCellVector = [];
    Sclip.itemsCountCheck = false;
    Sclip.itemsCount = 0;
    Sclip.cursorX = 0;
    Sclip.cursorY = 0;
    Sclip.dataEnded = false;
    Main.CounterDialogRst();
    Sclip.loadDataPrepare();
    Sclip.loadDataRequest();
};

Sclip.loadDataPrepare = function() {
    Sclip.loadingData = true;
    Sclip.loadingDataTry = 0;
    Sclip.loadingDataTimeout = 3500;
};

Sclip.SetPeriod = function() {
    if (!Sclip.periodNumber) {
        document.getElementById('top_bar_game').innerHTML = STR_CLIPS + STR_CLIP_DAY;
        Sclip.period = 'day';
    } else if (Sclip.periodNumber === 1) {
        document.getElementById('top_bar_game').innerHTML = STR_CLIPS + STR_CLIP_WEEK;
        Sclip.period = 'week';
    } else if (Sclip.periodNumber === 2) {
        document.getElementById('top_bar_game').innerHTML = STR_CLIPS + STR_CLIP_MONTH;
        Sclip.period = 'month';
    } else if (Sclip.periodNumber === 3) {
        document.getElementById('top_bar_game').innerHTML = STR_CLIPS + STR_CLIP_ALL;
        Sclip.period = 'all';
    }
};

Sclip.loadDataRequest = function() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/clips/top?channel=' + encodeURIComponent(Main.selectedChannel) + '&limit=' +
            Main.ItemsLimitVideo + '&period=' + encodeURIComponent(Sclip.period) +
            (Sclip.cursor === null ? '' : '&cursor=' + encodeURIComponent(Sclip.cursor)) + '&' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = Sclip.loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', Main.clientId);
        xmlHttp.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Sclip.loadDataSuccess(xmlHttp.responseText);
                    return;
                } else {
                    Sclip.loadDataError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Sclip.loadDataError();
    }
};

Sclip.loadDataError = function() {
    Sclip.loadingDataTry++;
    if (Sclip.loadingDataTry < Sclip.loadingDataTryMax) {
        Sclip.loadingDataTimeout += (Sclip.loadingDataTry < 5) ? 250 : 3500;
        Sclip.loadDataRequest();
    } else {
        Sclip.loadingData = false;
        Sclip.loadingMore = false;
        Main.HideLoadDialog();
        Main.showWarningDialog(STR_REFRESH_PROBLEM);
    }
};

Sclip.loadDataSuccess = function(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.clips.length;
    Sclip.cursor = response._cursor;

    if (response_items < Main.ItemsLimitVideo) Sclip.dataEnded = true;

    var offset_itemsCount = Sclip.itemsCount;
    Sclip.itemsCount += response_items;

    Sclip.emptyContent = !Sclip.itemsCount;

    var response_rows = response_items / Main.ColoumnsCountVideo;
    if (response_items % Main.ColoumnsCountVideo > 0) response_rows++;

    var coloumn_id, row_id, row, video,
        cursor = 0;

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main.ColoumnsCountVideo + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main.ColoumnsCountVideo && cursor < response_items; coloumn_id++, cursor++) {
            video = response.clips[cursor];
            if (Sclip.CellExists(video.tracking_id)) coloumn_id--;
            else {
                row.appendChild(Sclip.createCell(row_id, row_id + '_' + coloumn_id,
                    video.thumbnails.medium.split('-preview')[0] + '.mp4' + video.duration, [video.thumbnails.medium,
                    video.title, video.game, STR_STREAM_ON + Main.videoCreatedAt(video.created_at),
                    Main.addCommas(video.views) + STR_VIEWER, STR_DURATION + Play.timeS(video.duration)
                ]));
            }
        }

        for (coloumn_id; coloumn_id < Main.ColoumnsCountVideo; coloumn_id++) {
            if (Sclip.dataEnded && !Sclip.itemsCountCheck) {
                Sclip.itemsCountCheck = true;
                Sclip.itemsCount = (row_id * Main.ColoumnsCountVideo) + coloumn_id;
            }
            row.appendChild(Main.createEmptyCell(Sclip.ids[9] + row_id + '_' + coloumn_id));
            Sclip.blankCellVector.push(Sclip.ids[9] + row_id + '_' + coloumn_id);
        }
        document.getElementById("stream_table_search_clip").appendChild(row);
    }

    Sclip.loadDataSuccessFinish();
};

Sclip.createCell = function(row_id, id, clip_id, valuesArray) {
    Sclip.nameMatrix.push(clip_id);
    if (row_id < Main.ColoumnsCountVideo) Main.PreLoadAImage(valuesArray[0]); //try to pre cache first 3 rows
    return Main.createCellVideo(clip_id, id, Sclip.ids, valuesArray);
};

Sclip.CellExists = function(display_name) {
    if (Sclip.nameMatrix.indexOf(display_name) > -1) {
        Sclip.blankCellCount++;
        return true;
    }
    return false;
};

Sclip.loadDataSuccessFinish = function() {
    $(document).ready(function() {
        if (!Sclip.status) {
            Main.HideLoadDialog();
            if (Sclip.emptyContent) Main.showWarningDialog(STR_NO + STR_CLIPS);
            else {
                Sclip.status = true;
                Sclip.addFocus();
                Main.LazyImgStart(Sclip.ids[1], 9, IMG_404_VIDEO, Main.ColoumnsCountVideo);
            }
            Sclip.loadingData = false;
        } else {
            if (Sclip.blankCellCount > 0 && !Sclip.dataEnded) {
                Sclip.loadingMore = true;
                Sclip.loadDataPrepare();
                Sclip.loadDataReplace();
                return;
            } else {
                Sclip.blankCellCount = 0;
                Sclip.blankCellVector = [];
            }

            Sclip.loadingData = false;
            Sclip.loadingMore = false;
        }
    });
};

Sclip.loadDataReplace = function() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/clips/top?channel=' + encodeURIComponent(Main.selectedChannel) + '&limit=' +
            Sclip.blankCellCount + '&period=' + Sclip.period + (Sclip.cursor === null ? '' : '&cursor=' + encodeURIComponent(Sclip.cursor)) +
            '&' + Math.round(Math.random() * 1e7), true);
        xmlHttp.timeout = Sclip.loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', Main.clientId);
        xmlHttp.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    Sclip.loadDataSuccessReplace(xmlHttp.responseText);
                    return;
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Sclip.loadDataErrorReplace();
    }
};

Sclip.loadDataErrorReplace = function() {
    Sclip.loadingDataTry++;
    if (Sclip.loadingDataTry < Sclip.loadingDataTryMax) {
        Sclip.loadingDataTimeout += (Sclip.loadingDataTry < 5) ? 250 : 3500;
        Sclip.loadDataReplace();
    } else {
        Sclip.ReplacedataEnded = true;
        Sclip.blankCellCount = 0;
        Sclip.blankCellVector = [];
        Sclip.loadDataSuccessFinish();
    }
};

Sclip.loadDataSuccessReplace = function(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.clips.length;
    var video, index, cursor = 0;
    var tempVector = Sclip.blankCellVector.slice();

    Sclip.cursor = response._cursor;

    if (response_items < Sclip.blankCellCount) Sclip.ReplacedataEnded = true;

    for (var i = 0; i < Sclip.blankCellVector.length && cursor < response_items; i++, cursor++) {
        video = response.clips[cursor];
        if (Sclip.CellExists(video.tracking_id)) {
            Sclip.blankCellCount--;
            i--;
        } else {
            Main.replaceVideo(Svod.blankCellVector[i], video.thumbnails.medium.split('-preview')[0] + '.mp4', [video.thumbnails.medium,
                    video.title, video.game, STR_STREAM_ON + Main.videoCreatedAt(video.created_at),
                    Main.addCommas(video.views) + STR_VIEWER, STR_DURATION + Play.timeS(video.duration)
                ]);

            Sclip.blankCellCount--;

            index = tempVector.indexOf(tempVector[i]);
            if (index > -1) tempVector.splice(index, 1);
        }
    }

    Sclip.itemsCountOffset += cursor;
    if (Sclip.ReplacedataEnded) {
        Sclip.blankCellCount = 0;
        Sclip.blankCellVector = [];
    } else Sclip.blankCellVector = tempVector;

    Sclip.loadDataSuccessFinish();
};

Sclip.addFocus = function() {
    document.getElementById(Sclip.ids[0] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_thumbnail_focused');
    document.getElementById(Sclip.ids[2] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_text_focused');
    document.getElementById(Sclip.ids[3] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_info_focused');
    document.getElementById(Sclip.ids[4] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_info_focused');
    document.getElementById(Sclip.ids[5] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_info_focused');
    document.getElementById(Sclip.ids[6] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_info_focused');
    document.getElementById(Sclip.ids[7] + Sclip.cursorY + '_' + Sclip.cursorX).classList.add('stream_info_focused');

    window.setTimeout(function() {
        Main.ScrollHelper.scrollVerticalToElementById(Sclip.ids[0], Sclip.cursorY, Sclip.cursorX, Main.Sclip, Main.ScrollOffSetMinusVideo, Main.ScrollOffSetVideo, false);
    }, 10);

    Main.CounterDialog(Sclip.cursorX, Sclip.cursorY, Main.ColoumnsCountVideo, Sclip.itemsCount);

    if (Sclip.cursorY > 3) Main.LazyImg(Sclip.ids[1], Sclip.cursorY, IMG_404_VIDEO, Main.ColoumnsCountVideo, 4);

    if (((Sclip.cursorY + Main.ItemsReloadLimitVideo) > (Sclip.itemsCount / Main.ColoumnsCountVideo)) &&
        !Sclip.dataEnded && !Sclip.loadingMore) {
        Sclip.loadingMore = true;
        Sclip.loadDataPrepare();
        Sclip.loadDataRequest();
    }
};

Sclip.removeFocus = function() {
    document.getElementById(Sclip.ids[0] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_thumbnail_focused');
    document.getElementById(Sclip.ids[2] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_text_focused');
    document.getElementById(Sclip.ids[3] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_info_focused');
    document.getElementById(Sclip.ids[4] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_info_focused');
    document.getElementById(Sclip.ids[5] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_info_focused');
    document.getElementById(Sclip.ids[6] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_info_focused');
    document.getElementById(Sclip.ids[7] + Sclip.cursorY + '_' + Sclip.cursorX).classList.remove('stream_info_focused');
};

Sclip.keyClickDelay = function() {
    Sclip.LastClickFinish = true;
};

Sclip.handleKeyDown = function(event) {
    if (Sclip.loadingData && !Sclip.loadingMore) {
        event.preventDefault();
        return;
    } else if (!Sclip.LastClickFinish) {
        event.preventDefault();
        return;
    } else {
        Sclip.LastClickFinish = false;
        window.setTimeout(Sclip.keyClickDelay, Sclip.keyClickDelayTime);
    }

    var i;

    switch (event.keyCode) {
        case TvKeyCode.KEY_RETURN:
            if (Main.isAboutDialogShown()) Main.HideAboutDialog();
            else if (Main.isControlsDialogShown()) Main.HideControlsDialog();
            else {
                Main.Go = Main.SChannelContent;
                Sclip.exit();
                Main.SwitchScreen();
            }
            break;
        case TvKeyCode.KEY_LEFT:
            if (Main.ThumbNull((Sclip.cursorY), (Sclip.cursorX - 1), Sclip.ids[0])) {
                Sclip.removeFocus();
                Sclip.cursorX--;
                Sclip.addFocus();
            } else {
                for (i = (Main.ColoumnsCountVideo - 1); i > -1; i--) {
                    if (Main.ThumbNull((Sclip.cursorY - 1), i, Sclip.ids[0])) {
                        Sclip.removeFocus();
                        Sclip.cursorY--;
                        Sclip.cursorX = i;
                        Sclip.addFocus();
                        break;
                    }
                }
            }
            break;
        case TvKeyCode.KEY_RIGHT:
            if (Main.ThumbNull((Sclip.cursorY), (Sclip.cursorX + 1), Sclip.ids[0])) {
                Sclip.removeFocus();
                Sclip.cursorX++;
                Sclip.addFocus();
            } else if (Main.ThumbNull((Sclip.cursorY + 1), 0, Sclip.ids[0])) {
                Sclip.removeFocus();
                Sclip.cursorY++;
                Sclip.cursorX = 0;
                Sclip.addFocus();
            }
            break;
        case TvKeyCode.KEY_UP:
            for (i = 0; i < Main.ColoumnsCountVideo; i++) {
                if (Main.ThumbNull((Sclip.cursorY - 1), (Sclip.cursorX - i), Sclip.ids[0])) {
                    Sclip.removeFocus();
                    Sclip.cursorY--;
                    Sclip.cursorX = Sclip.cursorX - i;
                    Sclip.addFocus();
                    break;
                }
            }
            break;
        case TvKeyCode.KEY_DOWN:
            for (i = 0; i < Main.ColoumnsCountVideo; i++) {
                if (Main.ThumbNull((Sclip.cursorY + 1), (Sclip.cursorX - i), Sclip.ids[0])) {
                    Sclip.removeFocus();
                    Sclip.cursorY++;
                    Sclip.cursorX = Sclip.cursorX - i;
                    Sclip.addFocus();
                    break;
                }
            }
            break;
        case TvKeyCode.KEY_INFO:
        case TvKeyCode.KEY_CHANNELGUIDE:
        case TvKeyCode.KEY_CHANNELUP:
            if (!Sclip.loadingMore) {
                Sclip.periodNumber++;
                if (Sclip.periodNumber > 3) Sclip.periodNumber = 0;
                Sclip.SetPeriod();
                Sclip.StartLoad();
            }
            break;
        case TvKeyCode.KEY_CHANNELDOWN:
            if (!Sclip.loadingMore) {
                Sclip.periodNumber--;
                if (Sclip.periodNumber < 0) Sclip.periodNumber = 3;
                Sclip.SetPeriod();
                Sclip.StartLoad();
            }
            break;
        case TvKeyCode.KEY_PLAY:
        case TvKeyCode.KEY_PAUSE:
        case TvKeyCode.KEY_PLAYPAUSE:
        case TvKeyCode.KEY_ENTER:
            Sclip.playUrl = document.getElementById(Sclip.ids[8] + Sclip.cursorY + '_' + Sclip.cursorX).getAttribute('data-channelname').split('.mp4');
            Sclip.DurationSeconds = parseInt(Sclip.playUrl[1]);
            Sclip.playUrl = Sclip.playUrl[0] + '.mp4';
            Sclip.Duration = document.getElementById(Sclip.ids[7] + Sclip.cursorY + '_' + Sclip.cursorX).textContent;
            Sclip.views = document.getElementById(Sclip.ids[6] + Sclip.cursorY + '_' + Sclip.cursorX).textContent;
            Sclip.title = document.getElementById(Sclip.ids[3] + Sclip.cursorY + '_' + Sclip.cursorX).textContent;
            Sclip.createdAt = document.getElementById(Sclip.ids[4] + Sclip.cursorY + '_' + Sclip.cursorX).textContent;
            Sclip.game = document.getElementById(Sclip.ids[5] + Sclip.cursorY + '_' + Sclip.cursorX).textContent;
            Sclip.openStream();
            break;
        case TvKeyCode.KEY_RED:
            Main.showAboutDialog();
            break;
        case TvKeyCode.KEY_GREEN:
            Sclip.exit();
            Main.GoLive();
            break;
        case TvKeyCode.KEY_YELLOW:
            Main.showControlsDialog();
            break;
        case TvKeyCode.KEY_BLUE:
            Main.BeforeSearch = Main.Sclip;
            Main.Go = Main.Search;
            Sclip.exit();
            Main.SwitchScreen();
            break;
        default:
            break;
    }
};

Sclip.openStream = function() {
    document.body.addEventListener("keydown", PlayClip.handleKeyDown, false);
    document.body.removeEventListener("keydown", Sclip.handleKeyDown);
    document.getElementById('scene2').classList.remove('hide');
    Play.hideChat();
    Play.clearPause();
    Play.HideWarningDialog();
    document.getElementById('scene_channel_panel').classList.add('hide');
    document.getElementById('play_dialog_exit').classList.add('hide');
    document.getElementById('scene1').classList.add('hide');

    PlayClip.Start();
};
