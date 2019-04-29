//Variable initialization
var Vod_cursorY = 0;
var Vod_cursorX = 0;
var Vod_dataEnded = false;
var Vod_itemsCount = 0;
var Vod_idObject = {};
var Vod_emptyCellVector = [];
var Vod_loadingData = false;
var Vod_loadingDataTry = 0;
var Vod_loadingDataTryMax = 5;
var Vod_loadingDataTimeout = 3500;
var Vod_itemsCountOffset = 0;
var Vod_MaxOffset = 0;
var Vod_emptyContent = false;
var Vod_itemsCountCheck = false;
var Vod_period = 'week';
var Vod_periodNumber = 2;
var Vod_TopRowCreated = false;

var Vod_ids = ['v_thumbdiv', 'v_img', 'v_infodiv', 'v_title', 'v_streamon', 'v_duration', 'v_viwers', 'v_quality', 'v_cell', 'vempty_', 'vod_scroll', 'v_game'];
var Vod_status = false;
var Vod_highlight = false;
var Vod_AnimateThumbId;
var Vod_DoAnimateThumb = 1;
var Vod_newImg = new Image();
//Variable initialization end

function Vod_init() {
    Main_values.Main_CenterLablesVectorPos = 4;
    Main_values.Main_Go = Main_Vod;
    Main_AddClass('top_bar_vod', 'icon_center_focus');
    document.body.addEventListener("keydown", Vod_handleKeyDown, false);

    if (Vod_status) {
        Main_YRst(Vod_cursorY);
        Main_ShowElement(Vod_ids[10]);
        Vod_SetPeriod();
        Vod_addFocus();
        Main_SaveValues();
    } else Vod_StartLoad();
}

function Vod_exit() {
    if (Vod_status) Vod_removeFocus();
    Main_RestoreTopLabel();
    document.body.removeEventListener("keydown", Vod_handleKeyDown);
    Main_RemoveClass('top_bar_vod', 'icon_center_focus');
    Main_textContent('top_bar_vod', STR_VIDEOS);
    Main_HideElement(Vod_ids[10]);
}

function Vod_StartLoad() {
    if (Vod_status) Vod_removeFocus();
    Main_empty('stream_table_vod');
    Main_HideElement(Vod_ids[10]);
    Main_showLoadDialog();
    Vod_SetPeriod();
    Main_HideWarningDialog();
    Vod_status = false;
    Vod_itemsCountOffset = 0;
    Vod_TopRowCreated = false;
    Vod_MaxOffset = 0;
    Vod_idObject = {};
    Vod_emptyCellVector = [];
    Vod_itemsCountCheck = false;
    Main_FirstLoad = true;
    Vod_itemsCount = 0;
    Vod_cursorX = 0;
    Vod_cursorY = 0;
    Vod_dataEnded = false;
    Main_CounterDialogRst();
    Vod_loadDataPrepare();
    Vod_loadDataRequest();
}

function Vod_loadDataPrepare() {
    Main_imgVectorRst();
    Vod_loadingData = true;
    Vod_loadingDataTry = 0;
    Vod_loadingDataTimeout = 3500;
}

function Vod_loadDataRequest() {

    var offset = Vod_itemsCount + Vod_itemsCountOffset;
    if (offset && offset > (Vod_MaxOffset - 1)) {
        offset = Vod_MaxOffset - Main_ItemsLimitVideo;
        Vod_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/videos/top?limit=' + Main_ItemsLimitVideo +
        '&broadcast_type=' + (Vod_highlight ? 'highlight' : 'archive') + '&sort=views&offset=' + offset +
        '&period=' + Vod_period +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');

    BasehttpGet(theUrl, Vod_loadingDataTimeout, 2, null, Vod_loadDataSuccess, Vod_loadDataError);
}

function Vod_loadDataError() {
    Vod_loadingDataTry++;
    if (Vod_loadingDataTry < Vod_loadingDataTryMax) {
        Vod_loadingDataTimeout += 500;
        Vod_loadDataRequest();
    } else {
        Vod_loadingData = false;
        if (!Vod_itemsCount) {
            Main_FirstLoad = false;
            Main_HideLoadDialog();
            Main_showWarningDialog(STR_REFRESH_PROBLEM);
        } else {
            Vod_dataEnded = true;
            Vod_loadDataSuccessFinish();
        }
    }
}

function Vod_loadDataSuccess(responseText) {
    var response = JSON.parse(responseText);
    var response_items = response.vods.length;
    Vod_MaxOffset = parseInt(response._total);

    if (response_items < Main_ItemsLimitVideo) Vod_dataEnded = true;

    var offset_itemsCount = Vod_itemsCount;
    Vod_itemsCount += response_items;

    Vod_emptyContent = !Vod_itemsCount;

    var response_rows = response_items / Main_ColoumnsCountVideo;
    if (response_items % Main_ColoumnsCountVideo > 0) response_rows++;

    var coloumn_id, row_id, row, video, id,
        cursor = 0,
        doc = document.getElementById("stream_table_vod");

    // Make the game video/clip/fallowing cell
    if (!Vod_TopRowCreated) {
        Vod_TopRowCreated = true;
        row = document.createElement('tr');
        var thumbfallow;
        for (i = 0; i < 2; i++) {
            if (!i) thumbfallow = '<i class="icon-movie-play stream_channel_fallow_icon"></i>' + STR_SPACE + STR_SPACE + STR_SWITCH_VOD;
            else thumbfallow = '<i class="icon-history stream_channel_fallow_icon"></i>' + STR_SPACE + STR_SPACE + STR_SWITCH_CLIP;
            Main_td = document.createElement('td');
            Main_td.setAttribute('id', Vod_ids[8] + 'y_' + i);
            Main_td.className = 'stream_cell';
            Main_td.innerHTML = '<div id="' + Vod_ids[0] +
                'y_' + i + '" class="stream_thumbnail_channel_vod" ><div id="' + Vod_ids[3] +
                'y_' + i + '" class="stream_channel_fallow_game">' + thumbfallow + '</div></div>';
            row.appendChild(Main_td);
        }
        doc.appendChild(row);
    }

    for (var i = 0; i < response_rows; i++) {
        row_id = offset_itemsCount / Main_ColoumnsCountVideo + i;
        row = document.createElement('tr');

        for (coloumn_id = 0; coloumn_id < Main_ColoumnsCountVideo && cursor < response_items; coloumn_id++, cursor++) {
            video = response.vods[cursor];
            id = video._id;
            //video content can be null sometimes the preview will 404
            if ((video.preview.template + '').indexOf('404_processing') !== -1 || Vod_idObject[id]) coloumn_id--;
            else {
                Vod_idObject[id] = 1;
                row.appendChild(Vod_createCell(row_id, row_id + '_' + coloumn_id,
                    [id, video.length, video.channel.broadcaster_language, video.game, video.channel.name, video.increment_view_count_url],
                    [video.preview.template.replace("{width}x{height}", Main_VideoSize),
                        video.channel.display_name, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                        twemoji.parse(video.title) + STR_BR + STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) + STR_VIEWS,
                        Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.channel.broadcaster_language),
                        STR_DURATION + Play_timeS(video.length), video.animated_preview_url
                    ], Vod_ids));
            }
        }

        for (coloumn_id; coloumn_id < Main_ColoumnsCountVideo; coloumn_id++) {
            if (Vod_dataEnded && !Vod_itemsCountCheck) {
                Vod_itemsCountCheck = true;
                Vod_itemsCount = (row_id * Main_ColoumnsCountVideo) + coloumn_id;
            }
            row.appendChild(Main_createEmptyCell(Vod_ids[9] + row_id + '_' + coloumn_id));
            Vod_emptyCellVector.push(Vod_ids[9] + row_id + '_' + coloumn_id);
        }
        doc.appendChild(row);
    }

    Vod_loadDataSuccessFinish();
}

function Vod_createCell(row_id, id, vod_data, valuesArray, idArray) {
    if (row_id < Main_ColoumnsCountVideo) Main_CacheImage(valuesArray[0]); //try to pre cache first 3 rows
    return Vod_createCellVideo(vod_data, id, valuesArray, idArray);
}

function Vod_createCellVideo(vod_data, id, valuesArray, idArray) {
    Main_td = document.createElement('td');
    Main_td.setAttribute('id', idArray[8] + id);
    Main_td.setAttribute(Main_DataAttribute, JSON.stringify(vod_data));
    Main_td.className = 'stream_cell';
    Main_td.innerHTML = Vod_VideoHtml(id, valuesArray, idArray);

    return Main_td;
}

function Vod_replaceVideo(id, vod_data, valuesArray, idArray) {
    var ele = document.getElementById(id);
    var splitedId = id.split(idArray[9])[1];
    ele.setAttribute(Main_DataAttribute, JSON.stringify(vod_data));
    ele.innerHTML = Vod_VideoHtml(splitedId, valuesArray, idArray);
    ele.setAttribute('id', idArray[8] + splitedId);
}

function Vod_VideoHtml(id, valuesArray, idArray) {
    Main_imgVectorPush(idArray[1] + id, valuesArray[0]);

    return '<div id="' + idArray[0] + id + '" class="stream_thumbnail_clip"' +
        (valuesArray[7] ? ' style="background-size: 0 0; background-image: url(' + valuesArray[7] + ');"' : '') +
        '><div><img id="' +
        idArray[1] + id + '" class="stream_img"></div><div id="' +
        idArray[2] + id + '" class="stream_text2"><div style="line-height: 14px;"><div id="' +
        idArray[3] + id + '" class="stream_info" style="width: 72%; display: inline-block; font-size: 85%;">' +
        valuesArray[1] + '</div><div id="' + idArray[7] + id +
        '"class="stream_info" style="width:27%; float: right; text-align: right; display: inline-block;">' + valuesArray[5] +
        '</div></div><div style="line-height: 12px;"><div id="' + idArray[4] + id + '"class="stream_info" style="width: 59%; display: inline-block;">' +
        valuesArray[2] + '</div><div id="' + idArray[5] + id +
        '"class="stream_info" style="width: 39%; display: inline-block; float: right; text-align: right;">' +
        valuesArray[6] + '</div></div><div id="' + idArray[11] + id + '"class="stream_info">' +
        valuesArray[3] + '</div><div id="' + idArray[6] + id +
        '"class="stream_info">' + valuesArray[4] + '</div></div></div>';
}

function Vod_loadDataSuccessFinish() {
    if (!Vod_status) {
        if (Vod_emptyContent) Main_showWarningDialog(STR_NO + (Vod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_FOR_THIS + STR_CHANNEL);
        else {
            Vod_status = true;
            Vod_addFocus();
            Main_imgVectorLoad(IMG_404_VIDEO);
            Main_SaveValues();
        }
        Main_ShowElement(Vod_ids[10]);
        Main_FirstLoad = false;
        Main_HideLoadDialog();
    } else {
        Main_imgVectorLoad(IMG_404_VIDEO);
        Main_CounterDialog(Vod_cursorX, Vod_cursorY, Main_ColoumnsCountVideo, Vod_itemsCount);
    }

    if (Vod_emptyCellVector.length > 0 && !Vod_dataEnded) {
        Vod_loadDataPrepare();
        Vod_loadDataReplace();
        return;
    } else Vod_emptyCellVector = [];

    Vod_loadingData = false;
}

function Vod_loadDataReplace() {

    Main_SetItemsLimitReplace(Vod_emptyCellVector.length);

    var offset = Vod_itemsCount + Vod_itemsCountOffset;
    if (offset && offset > (Vod_MaxOffset - 1)) {
        offset = Vod_MaxOffset - Main_ItemsLimitReplace;
        Vod_dataEnded = true;
    }

    var theUrl = 'https://api.twitch.tv/kraken/videos/top?limit=' + Main_ItemsLimitReplace +
        '&broadcast_type=' + (Vod_highlight ? 'highlight' : 'archive') + '&sort=views&offset=' + offset +
        '&period=' + Vod_period +
        (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');

    BasehttpGet(theUrl, Vod_loadingDataTimeout, 2, null, Vod_loadDataSuccessReplace, Vod_loadDataErrorReplace);
}

function Vod_loadDataErrorReplace() {
    Vod_loadingDataTry++;
    if (Vod_loadingDataTry < Vod_loadingDataTryMax) {
        Vod_loadingDataTimeout += 500;
        Vod_loadDataReplace();
    } else {
        Vod_dataEnded = true;
        Vod_itemsCount -= Vod_emptyCellVector.length;
        Vod_emptyCellVector = [];
        Vod_loadDataSuccessFinish();
    }
}


function Vod_loadDataSuccessReplace(responseText) {
    var response = JSON.parse(responseText),
        response_items = response.vods.length,
        video, id, i = 0,
        cursor = 0,
        tempVector = [];

    Vod_MaxOffset = parseInt(response._total);

    for (i; i < Vod_emptyCellVector.length && cursor < response_items; i++, cursor++) {
        video = response.vods[cursor];
        id = video._id;
        if ((video.preview.template + '').indexOf('404_processing') !== -1 || Vod_idObject[id]) i--;
        else {
            Vod_idObject[id] = 1;
            Vod_replaceVideo(Vod_emptyCellVector[i],
                [id, video.length, video.channel.broadcaster_language, video.game, video.channel.name, video.increment_view_count_url],
                [video.preview.template.replace("{width}x{height}", Main_VideoSize),
                    video.channel.display_name, STR_STREAM_ON + Main_videoCreatedAt(video.created_at),
                    twemoji.parse(video.title) + STR_BR + STR_STARTED + STR_PLAYING + video.game, Main_addCommas(video.views) +
                    STR_VIEWS,
                    Main_videoqualitylang(video.resolutions.chunked.slice(-4), (parseInt(video.fps.chunked) || 0), video.channel.broadcaster_language),
                    STR_DURATION + Play_timeS(video.length), video.animated_preview_url
                ], Vod_ids);

            tempVector.push(i);
        }
    }

    for (i = tempVector.length - 1; i > -1; i--) Vod_emptyCellVector.splice(tempVector[i], 1);

    Vod_itemsCountOffset += cursor;
    if (Vod_dataEnded) {
        Vod_itemsCount -= Vod_emptyCellVector.length;
        Vod_emptyCellVector = [];
    }

    Vod_loadDataSuccessFinish();
}

function Vod_addFocus() {
    if (Vod_cursorY < 0) {
        Vod_addFocusFallow();
        return;
    }
    Main_addFocusVideo(Vod_cursorY, Vod_cursorX, Vod_ids, Main_ColoumnsCountVideo, Vod_itemsCount);
    Vod_AnimateThumb(Vod_ids, Vod_cursorY + '_' + Vod_cursorX);
    if (((Vod_cursorY + Main_ItemsReloadLimitVideo) > (Vod_itemsCount / Main_ColoumnsCountVideo)) &&
        !Vod_dataEnded && !Vod_loadingData) {
        Vod_loadDataPrepare();
        Vod_loadDataRequest();
    }
    if (Main_CenterLablesInUse) Vod_removeFocus();
}

function Vod_removeFocus() {
    window.clearInterval(Vod_AnimateThumbId);
    if (Vod_cursorY > -1 && Vod_itemsCount) {
        Main_ShowElement(Vod_ids[1] + Vod_cursorY + '_' + Vod_cursorX);
        Main_removeFocus(Vod_cursorY + '_' + Vod_cursorX, Vod_ids);
    } else Vod_removeFocusFallow();
}

function Vod_addFocusFallow() {
    var i = Vod_cursorX > 1 ? 1 : Vod_cursorX;
    Main_AddClass(Vod_ids[0] + 'y_' + i, Main_classThumb);
}

function Vod_removeFocusFallow() {
    var i = Vod_cursorX > 1 ? 1 : Vod_cursorX;
    Main_RemoveClass(Vod_ids[0] + 'y_' + i, Main_classThumb);
}

function Vod_AnimateThumb(idArray, id) {
    if (!Vod_DoAnimateThumb) return;
    var div = document.getElementById(idArray[0] + id);

    // Only load the animation if it can be loaded
    // This prevent starting animating before it has loaded or animated a empty image
    Vod_newImg.onload = function() {
        Main_HideElement(idArray[1] + id);
        // background-size: 612px from  div.offsetWidth
        div.style.backgroundSize = "612px";
        var frame = 0;
        Vod_AnimateThumbId = window.setInterval(function() {
            // 10 = quantity of frames in the preview img, 344 img height from the div.offsetHeight
            // But this img real height is 180 thus the quality is affected, higher resolution aren't available
            div.style.backgroundPosition = "0px " + ((++frame % 10) * (-344)) + "px";
        }, 650);
    };

    Vod_newImg.src = div.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
}

function Vod_handleKeyDown(event) {
    if (Main_FirstLoad || Main_CantClick()) return;
    else Main_keyClickDelayStart();

    var i;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else {
                Vod_removeFocus();
                Main_CenterLablesStart(Vod_handleKeyDown);
            }
            break;
        case KEY_LEFT:
            if (Vod_cursorY === -1) {
                Vod_removeFocusFallow();
                Vod_cursorX--;
                if (Vod_cursorX < 0) Vod_cursorX = 1;
                Vod_addFocusFallow();
            } else if (!Vod_cursorY && !Vod_cursorX) {
                Vod_removeFocus();
                Vod_removeFocusFallow();
                Vod_cursorY = -1;
                Vod_cursorX = 1;
                Vod_addFocusFallow();
            } else if (Main_ThumbNull((Vod_cursorY), (Vod_cursorX - 1), Vod_ids[0])) {
                Vod_removeFocus();
                Vod_cursorX--;
                Vod_addFocus();
            } else {
                for (i = (Main_ColoumnsCountVideo - 1); i > -1; i--) {
                    if (Main_ThumbNull((Vod_cursorY - 1), i, Vod_ids[0])) {
                        Vod_removeFocus();
                        Vod_cursorY--;
                        Vod_cursorX = i;
                        Vod_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_RIGHT:
            if (Vod_cursorY === -1) {
                Vod_removeFocusFallow();
                Vod_cursorX++;
                if (Vod_cursorX > 1) {
                    Vod_cursorX = 0;
                    if (!Vod_emptyContent) {
                        Vod_cursorY = 0;
                        Vod_addFocus();
                    } else Vod_addFocusFallow();
                } else Vod_addFocusFallow();
            } else if (Main_ThumbNull((Vod_cursorY), (Vod_cursorX + 1), Vod_ids[0])) {
                Vod_removeFocus();
                Vod_cursorX++;
                Vod_addFocus();
            } else if (Main_ThumbNull((Vod_cursorY + 1), 0, Vod_ids[0])) {
                Vod_removeFocus();
                Vod_cursorY++;
                Vod_cursorX = 0;
                Vod_addFocus();
            }
            break;
        case KEY_UP:
            if (Vod_cursorY === -1 && !Vod_emptyContent) {
                Vod_cursorY = 0;
                Vod_removeFocusFallow();
                Vod_addFocus();
            } else if (!Vod_cursorY) {
                Vod_removeFocus();
                Vod_cursorY = -1;
                Vod_addFocusFallow();
            } else {
                for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                    if (Main_ThumbNull((Vod_cursorY - 1), (Vod_cursorX - i), Vod_ids[0])) {
                        Vod_removeFocus();
                        Vod_cursorY--;
                        Vod_cursorX = Vod_cursorX - i;
                        Vod_addFocus();
                        break;
                    }
                }
            }
            break;
        case KEY_DOWN:
            if (Vod_cursorY === -1 && !Vod_emptyContent) {
                Vod_cursorY = 0;
                Vod_removeFocusFallow();
                Vod_addFocus();
            } else {
                for (i = 0; i < Main_ColoumnsCountVideo; i++) {
                    if (Main_ThumbNull((Vod_cursorY + 1), (Vod_cursorX - i), Vod_ids[0])) {
                        Vod_removeFocus();
                        Vod_cursorY++;
                        Vod_cursorX = Vod_cursorX - i;
                        Vod_addFocus();
                        break;
                    }
                }

            }
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            if (Vod_cursorY === -1) {
                if (Vod_cursorX === 0) {
                    Vod_highlight = !Vod_highlight;
                    Main_setItem('Vod_highlight', Vod_highlight ? 'true' : 'false');
                    Vod_StartLoad();
                } else {
                    Vod_periodNumber++;
                    if (Vod_periodNumber > 4) Vod_periodNumber = 1;
                    Vod_StartLoad();
                }
            } else Main_OpenVod(Vod_cursorY + '_' + Vod_cursorX, Vod_ids, Vod_handleKeyDown);
            break;
        default:
            break;
    }
}

function Vod_SetPeriod() {
    if (Vod_periodNumber === 1) {
        Main_innerHTML('top_bar_vod', STR_VIDEOS + Main_UnderCenter((Vod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_DAY));
        Vod_period = 'day';
    } else if (Vod_periodNumber === 2) {
        Main_innerHTML('top_bar_vod', STR_VIDEOS + Main_UnderCenter((Vod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_WEEK));
        Vod_period = 'week';
    } else if (Vod_periodNumber === 3) {
        Main_innerHTML('top_bar_vod', STR_VIDEOS + Main_UnderCenter((Vod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_MONTH));
        Vod_period = 'month';
    } else if (Vod_periodNumber === 4) {
        Main_innerHTML('top_bar_vod', STR_VIDEOS + Main_UnderCenter((Vod_highlight ? STR_PAST_HIGHL : STR_PAST_BROA) + STR_CLIP_ALL));
        Vod_period = 'all';
    }
    Main_setItem('vod_periodNumber', Vod_periodNumber);
}