/*jshint multistr: true */
//Variable initialization
function Live() {}
Live.Status = false;
Live.Thumbnail = 'thumbnail_live';
Live.EmptyCell = 'live_empty_';
Live.cursorY = 0;
Live.cursorX = 0;
Live.dataEnded = false;
Live.itemsCount = 0;
Live.imgMatrix = [];
Live.imgMatrixId = [];
Live.imgMatrixCount = 0;
Live.nameMatrix = [];
Live.nameMatrixCount = 0;
Live.loadingData = false;
Live.loadingDataTry = 1;
Live.loadingDataTryMax = 10;
Live.loadingDataTimeout = 1500;
Live.isDialogOn = false;
Live.ItemsLimit = 99;
Live.ColoumnsCount = 3;
Live.ItemsReloadLimit = Math.floor((Live.ItemsLimit / Live.ColoumnsCount) / 2);
Live.newImg = new Image();
Live.blankCellCount = 0;
Live.itemsCountOffset = 0;
Live.LastClickFinish = true;
Live.keyClickDelayTime = 25;

//Variable initialization end


Live.init = function() {
    document.body.addEventListener("keydown", Live.handleKeyDown, false);
    $('#top_bar_live').removeClass('icon_center_label');
    //    document.getElementById("top_bar_spacing").style.paddingLeft = "30%";
    $('#top_bar_live').addClass('icon_center_focus');
    if (Live.Status) Live.ScrollHelper.scrollVerticalToElementById(Live.Thumbnail + Live.cursorY + '_' + Live.cursorX);
    else Live.StartLoad();

};

Live.exit = function() {
    document.body.removeEventListener("keydown", Live.handleKeyDown);
    $('#top_bar_live').removeClass('icon_center_focus');
    $('#top_bar_live').addClass('icon_center_label');
    Main.SwitchScreen();
};

Live.StartLoad = function() {
    Live.Status = false;
    Main.HideAllScreen();
    $('#stream_table_live').empty();
    Main.showLoadDialog();
    Live.loadingMore = false;
    Live.blankCellCount = 0;
    Live.nameMatrix = [];
    Live.nameMatrixCount = 0;
    Live.itemsCount = 0;
    Live.cursorX = 0;
    Live.cursorY = 0;
    Live.dataEnded = false;
    Live.loadData();
};

Live.loadData = function() {
    Live.imgMatrix = [];
    Live.imgMatrixId = [];
    Live.imgMatrixCount = 0;
    Live.loadingData = true;
    Live.loadingDataTry = 0;
    Live.loadingDataTimeout = 1500;
    Live.loadDataRequest();
};

Live.loadDataRequest = function() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/streams?limit=' + Live.ItemsLimit + '&offset=' + Live.itemsCount, true);
        xmlHttp.timeout = Live.loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', 'anwtqukxvrtwxb4flazs2lqlabe3hqv');
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    try {
                        Live.loadDataSuccess(xmlHttp.responseText);
                        return;
                    } catch (e) {}
                } else {
                    Live.loadDataError("HTTP Status " + xmlHttp.status + " Message: " + xmlHttp.statusText, xmlHttp.responseText);
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Live.loadDataError(e.message, null);
    }
};

Live.loadDataError = function(reason, responseText) {
    Live.loadingDataTry++;
    if (Live.loadingDataTry < Live.loadingDataTryMax) {
        Live.loadingDataTimeout += (Live.loadingDataTry < 5) ? 250 : 3500;
        Live.loadDataRequest();
    } else {
        Main.showWarningDialog("Unable to load Live " + " Reason: " + reason + '<br>Hit Refresh to retry');
    }
};

Live.loadDataSuccess = function(responseText) {
    var response = $.parseJSON(responseText);
    var response_items = response.streams.length;

    if (response_items < Live.ItemsLimit) Live.dataEnded = true;

    var offset_itemsCount = Live.itemsCount;
    Live.itemsCount += response_items;


    var response_rows = response_items / Live.ColoumnsCount;
    if (response_items % Live.ColoumnsCount > 0) response_rows++;

    var coloumn_id, row_id, row, cell, stream, mReplace,
        cursor = 0;

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Live.ColoumnsCount + i;
        row = $('<tr></tr>');

        for (coloumn_id = 0; coloumn_id < Live.ColoumnsCount && cursor < response_items; coloumn_id++, cursor++) {
            mReplace = false;
            stream = response.streams[cursor];
            if (Live.CellExists(stream.channel.name)) coloumn_id--;
            else {
                cell = Live.createCell(row_id, coloumn_id, stream.channel.name, stream.preview.template,
                    stream.channel.status, stream.game, Main.is_playlist(JSON.stringify(stream.stream_type)) +
                    stream.channel.display_name, Main.addCommas(stream.viewers) + STR_VIEWER,
                    Main.videoqualitylang(stream.video_height, stream.average_fps, stream.channel.language));
                row.append(cell);
            }
        }

        for (coloumn_id; coloumn_id < Live.ColoumnsCount; coloumn_id++) {
            row.append(Live.createCellEmpty(row_id, coloumn_id));
        }
        $('#stream_table_live').append(row);
    }

    Live.loadDataSuccessFinish();
};

Live.createCellEmpty = function(row_id, coloumn_id) {
    // id here can't be cell_ or it will conflict when loading anything below row 0 in MODE_FOLLOWER
    return $('<td id="' + Live.EmptyCell + row_id + '_' + coloumn_id + '" class="stream_cell" data-channelname=""></td>').html('');
};

Live.createCell = function(row_id, coloumn_id, channel_name, preview_thumbnail, stream_title, stream_game, channel_display_name, viwers, quality) {
    preview_thumbnail = preview_thumbnail.replace("{width}x{height}", "640x360");

    Live.imgMatrix[Live.imgMatrixCount] = preview_thumbnail;
    Live.imgMatrixId[Live.imgMatrixCount] = Live.Thumbnail + row_id + '_' + coloumn_id;
    Live.imgMatrixCount++;

    if (Live.imgMatrixCount <= (Live.ColoumnsCount * 3)) Live.newImg.src = preview_thumbnail; //try to pre cache first 4 rows

    Live.nameMatrix[Live.nameMatrixCount] = channel_name;
    Live.nameMatrixCount++;

    return $('<td id="cell_' + row_id + '_' + coloumn_id + '" class="stream_cell" data-channelname="' + channel_name + '"></td>').html(
        '<img id="' + Live.Thumbnail + row_id + '_' + coloumn_id + '" class="stream_thumbnail" src="images/video.png"/> \
            <div id="thumbnail_div_' + row_id + '_' + coloumn_id + '" class="stream_text"> \
            <div id="display_name_' + row_id + '_' + coloumn_id + '" class="stream_channel">' + channel_display_name + '</div> \
            <div id="stream_title_' + row_id + '_' + coloumn_id + '"class="stream_info">' + stream_title + '</div> \
            <div id="stream_game_' + row_id + '_' + coloumn_id + '"class="stream_info">' + stream_game + '</div> \
            <div id="viwers_' + row_id + '_' + coloumn_id + '"class="stream_info" style="width: 64%; display: inline-block;">' + viwers + '</div> \
            <div id="quality_' + row_id + '_' + coloumn_id +
        '"class="stream_info" style="width:35%; text-align: right; float: right; display: inline-block;">' + quality + '</div> \
            </div>');
};

Live.CellExists = function(display_name) {
    for (var i = 0; i <= Live.nameMatrixCount; i++) {
        if (display_name == Live.nameMatrix[i]) {
            Live.blankCellCount++;
            return true;
        }
    }
    return false;
};

//prevent stream_text/title/info from load before the thumbnail and display a odd stream_table squashed only with names source
//https://imagesloaded.desandro.com/
Live.loadDataSuccessFinish = function() {
    $('#stream_table_live').imagesLoaded()
        .always({
            background: false
        }, function() { //all images successfully loaded at least one is broken not a problem as the for "imgMatrix.length" will fix it all
            if (!Live.Status) {
                Main.ShowAllScreen();
                Main.HideLoadDialog();
                Live.Status = true;
                Live.addFocus();
            }
            Live.loadingData = false;

            for (var i = 0; i < Live.imgMatrix.length; i++) {
                var tumbImg = document.getElementById(Live.imgMatrixId[i]);
                tumbImg.onerror = function() {
                    this.src = 'images/404_video.png'; //img fail to load use predefined
                };

                tumbImg.src = Live.imgMatrix[i];
            }

            if (Live.blankCellCount > 0) {
                if (Live.blankCellCount > (Live.ItemsLimit / 2)) Live.itemsCountOffset += (Live.blankCellCount * 2);
                else Live.itemsCountOffset = 0;
                Live.loadingMore = true;
                Live.loadDataReplace();
                return;
            } else {
                Live.itemsCountOffset = 0;
            }
            //if (!Live.loadingMore) Live.previewDataStart();
        });
};

Live.loadDataReplace = function() {
    Live.imgMatrix = [];
    Live.imgMatrixId = [];
    Live.imgMatrixCount = 0;
    Live.loadingData = true;
    Live.loadingDataTry = 0;
    Live.loadingDataTimeout = 1500;
    Live.loadDataRequestReplace();
};

Live.loadDataRequestReplace = function() {
    try {

        var xmlHttp = new XMLHttpRequest();

        var offset = Live.itemsCount + Live.itemsCountOffset;
        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/streams?limit=' + Live.ItemsLimit + '&offset=' + offset, true);
        xmlHttp.timeout = Live.loadingDataTimeout;
        xmlHttp.setRequestHeader('Client-ID', 'anwtqukxvrtwxb4flazs2lqlabe3hqv');
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    try {
                        Live.loadDataSuccessReplace(xmlHttp.responseText);
                        return;
                    } catch (e) {}
                } else {}
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        Live.loadDataErrorReplace(e.message, null);
    }
};

Live.loadDataErrorReplace = function(reason, responseText) {
    Live.loadingDataTry++;
    if (Live.loadingDataTry < Live.loadingDataTryMax) {
        Live.loadingDataTimeout += (Live.loadingDataTry < 5) ? 250 : 3500;
        Live.loadDataRequestReplace();
    } else {}
};

Live.loadDataSuccessReplace = function(responseText) {
    var response = $.parseJSON(responseText);
    var response_items = response.streams.length;

    var row_id = Live.itemsCount / Live.ColoumnsCount;

    var coloumn_id, stream, mReplace = false;

    for (var cursor = 0; cursor < response_items; cursor++) {
        stream = response.streams[cursor];
        if (Live.CellExists(stream.channel.name)) Games.blankCellCount--;
        else {
            mReplace = Live.replaceCellEmpty(row_id, coloumn_id, stream.channel.name, stream.preview.template,
                stream.channel.status, stream.game, Main.is_playlist(JSON.stringify(stream.stream_type)) +
                stream.channel.display_name, Main.addCommas(stream.viewers) + STR_VIEWER,
                Main.videoqualitylang(stream.video_height, stream.average_fps, stream.channel.language));
            if (mReplace) Live.blankCellCount--;
            if (Live.blankCellCount === 0) break;
        }
    }
    if (response_items < Live.ItemsLimit) {
        Live.blankCellCount = 0;
    }
    Live.loadDataSuccessFinish();
};

Live.replaceCellEmpty = function(row_id, coloumn_id, channel_name, preview_thumbnail, stream_title, stream_game, channel_display_name, viwers, quality) {
    var my = 0,
        mx = 0;
    if (row_id < ((Live.ItemsLimit / Live.ColoumnsCount) - 1)) return false;
    for (my = row_id - (1 + Math.ceil(Live.blankCellCount / Live.ColoumnsCount)); my < row_id; my++) {
        for (mx = 0; mx < Live.ColoumnsCount; mx++) {
            if (!Main.ThumbNull(my, mx, Live.Thumbnail) && (Main.ThumbNull(my, mx, Live.EmptyCell))) {
                row_id = my;
                coloumn_id = mx;
                preview_thumbnail = preview_thumbnail.replace("{width}x{height}", "640x360");
                Live.nameMatrix[Live.nameMatrixCount] = channel_name;
                Live.nameMatrixCount++;
                document.getElementById(Live.EmptyCell + row_id + '_' + coloumn_id).setAttribute('id', 'cell_' + row_id + '_' + coloumn_id);
                document.getElementById('cell_' + row_id + '_' + coloumn_id).setAttribute('data-channelname', channel_name);
                document.getElementById('cell_' + row_id + '_' + coloumn_id).innerHTML =
                    '<img id="' + Live.Thumbnail + row_id + '_' + coloumn_id + '" class="stream_thumbnail" src="' + preview_thumbnail + '"/> \
                    <div id="thumbnail_div_' + row_id + '_' + coloumn_id + '" class="stream_text"> \
                    <div id="display_name_' + row_id + '_' + coloumn_id + '" class="stream_channel">' + channel_display_name + '</div> \
                    <div id="stream_title_' + row_id + '_' + coloumn_id + '"class="stream_info">' + stream_title + '</div> \
                    <div id="stream_game_' + row_id + '_' + coloumn_id + '"class="stream_info">' + stream_game + '</div> \
                    <div id="viwers_' + row_id + '_' + coloumn_id + '"class="stream_info" style="width: 64%; display: inline-block;">' + viwers + '</div> \
                    <div id="quality_' + row_id + '_' + coloumn_id +
                    '"class="stream_info" style="width:35%; text-align: right; float: right; display: inline-block;">' + quality + '</div> \
                    </div>';
                return true;
            }
        }
    }

    return false;
};

Live.addFocus = function() {
    if (((Live.cursorY + Live.ItemsReloadLimit) > (Live.itemsCount / Live.ColoumnsCount)) &&
        !Live.dataEnded) {
        Live.loadingMore = true;
        Live.loadData();
    }

    $('#' + Live.Thumbnail + Live.cursorY + '_' + Live.cursorX).addClass('stream_thumbnail_focused');
    $('#thumbnail_div_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_text_focused');
    $('#display_name_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_channel_focused');
    $('#stream_title_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_info_focused');
    $('#stream_game_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_info_focused');
    $('#viwers_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_info_focused');
    $('#quality_' + Live.cursorY + '_' + Live.cursorX).addClass('stream_info_focused');
    window.setTimeout(function() {
        Live.ScrollHelper.scrollVerticalToElementById(Live.Thumbnail + Live.cursorY + '_' + Live.cursorX);
    }, 10);
};

Live.removeFocus = function() {
    $('#' + Live.Thumbnail + Live.cursorY + '_' + Live.cursorX).removeClass('stream_thumbnail_focused');
    $('#thumbnail_div_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_text_focused');
    $('#display_name_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_channel_focused');
    $('#stream_title_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_info_focused');
    $('#stream_game_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_info_focused');
    $('#viwers_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_info_focused');
    $('#quality_' + Live.cursorY + '_' + Live.cursorX).removeClass('stream_info_focused');
};

Live.keyClickDelay = function() {
    Live.LastClickFinish = true;
};

Live.handleKeyDown = function(event) {
    if (Live.loadingData && !Live.loadingMore) {
        event.preventDefault();
        return;
    } else if (!Live.LastClickFinish) {
        event.preventDefault();
        return;
    } else {
        Live.LastClickFinish = false;
        window.setTimeout(Live.keyClickDelay, Live.keyClickDelayTime);
    }

    switch (event.keyCode) {
        case TvKeyCode.KEY_RETURN:
            if (Main.isExitDialogShown()) {
                window.clearTimeout(Main.ExitDialogID);
                Main.HideExitDialog();
                try {
                    tizen.application.getCurrentApplication().hide();
                } catch (e) {}
            } else {
                Main.showExitDialog();
            }
            break;
        case TvKeyCode.KEY_LEFT:
            if (Main.ThumbNull((Live.cursorY), (Live.cursorX - 1), Live.Thumbnail)) {
                Live.removeFocus();
                Live.cursorX--;
                Live.addFocus();
            } else {
                for (i = (Live.ColoumnsCount - 1); i > -1; i--) {
                    if (Main.ThumbNull((Live.cursorY - 1), i, Live.Thumbnail)) {
                        Live.removeFocus();
                        Live.cursorY--;
                        Live.cursorX = i;
                        Live.addFocus();
                        break;
                    }
                }
            }
            break;
        case TvKeyCode.KEY_RIGHT:
            if (Main.ThumbNull((Live.cursorY), (Live.cursorX + 1), Live.Thumbnail)) {
                Live.removeFocus();
                Live.cursorX++;
                Live.addFocus();
            } else if (Main.ThumbNull((Live.cursorY + 1), 0, Live.Thumbnail)) {
                Live.removeFocus();
                Live.cursorY++;
                Live.cursorX = 0;
                Live.addFocus();
            }
            break;
        case TvKeyCode.KEY_UP:
            for (i = 0; i < Live.ColoumnsCount; i++) {
                if (Main.ThumbNull((Live.cursorY - 1), (Live.cursorX - i), Live.Thumbnail)) {
                    Live.removeFocus();
                    Live.cursorY--;
                    Live.cursorX = Live.cursorX - i;
                    Live.addFocus();
                    break;
                }
            }
            break;
        case TvKeyCode.KEY_DOWN:
            for (i = 0; i < Live.ColoumnsCount; i++) {
                if (Main.ThumbNull((Live.cursorY + 1), (Live.cursorX - i), Live.Thumbnail)) {
                    Live.removeFocus();
                    Live.cursorY++;
                    Live.cursorX = Live.cursorX - i;
                    Live.addFocus();
                    break;
                }
            }
            break;
        case TvKeyCode.KEY_INFO:
        case TvKeyCode.KEY_CHANNELGUIDE:
            Live.StartLoad();
            break;
        case TvKeyCode.KEY_CHANNELUP:
            Main.Go = Main.Games;
            Live.exit();
            break;
        case TvKeyCode.KEY_CHANNELDOWN:
            Main.Go = Main.Games;
            Live.exit();
            break;
        case TvKeyCode.KEY_PLAY:
        case TvKeyCode.KEY_PAUSE:
        case TvKeyCode.KEY_PLAYPAUSE:
        case TvKeyCode.KEY_ENTER:
            Main.selectedChannel = $('#cell_' + Live.cursorY + '_' + Live.cursorX).attr('data-channelname');
            Main.selectedChannelDisplayname = document.getElementById('display_name_' + Live.cursorY + '_' + Live.cursorX).textContent;
            document.body.removeEventListener("keydown", Live.handleKeyDown);
            Main.openStream();
            break;
        case TvKeyCode.KEY_RED:
            $('#img_black').hide();
            break;
        case TvKeyCode.KEY_GREEN:
            $('#img_black').show();
            break;
        case TvKeyCode.KEY_YELLOW:
            break;
        case TvKeyCode.KEY_BLUE:
            break;
        case TvKeyCode.KEY_VOLUMEUP:
        case TvKeyCode.KEY_VOLUMEDOWN:
        case TvKeyCode.KEY_MUTE:
            break;
        default:
            break;
    }
};

Live.ScrollHelper = {
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
        if (document.getElementById(id) === null) {
            return;
        }
        if (Main.Go === Main.Live)
            $(window).scrollTop(this.documentVerticalScrollPosition() + this.elementVerticalClientPositionById(id) - 0.345 * this.viewportHeight());
        else return;
    }
};
