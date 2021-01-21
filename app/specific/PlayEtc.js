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

//Etc player fun and controls
var Play_MultiChatBeffore;
var Play_isFullScreenold = true;
var Play_FullScreenSize = 3;
var Play_FullScreenPosition = 1;

function Play_PreviewUpDown(key, obj, adder) {

    obj.defaultValue += adder;

    if (obj.defaultValue < 0) obj.defaultValue = 0;
    else if (obj.defaultValue > (obj.values.length - 1)) obj.defaultValue = (obj.values.length - 1);

    obj.bottomArrows();

    Settings_value[key].defaultValue = obj.defaultValue;
    Main_setItem(key, obj.defaultValue + 1);

}

function Play_AudioCheckCloseMulti() {

    if ((!Play_audio_enable[0] && Play_audio_enable[1]) ||
        (!Play_volumes[0] && Play_volumes[1])) Play_AudioReset(0);
}

function Play_AudioReset(pos) {
    Play_audio_enable[pos] = 1;
    Play_volumes[pos] = 100;

    OSInterface_SetVolumes();
    OSInterface_SetAudioEnabled();
    OSInterface_ApplyAudio();

}

function Play_controlsAudioUpdateicons() {

    var i, len;

    if (Play_MultiEnable) {

        for (i = Play_controlsAudioEna0, len = Play_controlsAudioVol3 + 1; i < len; i++) {

            Play_controls[i].bottomArrows();
            Play_controls[i].setLable();

        }

        Play_SetControlsVisibility('ShowInAudioMulti');

        //Disable icons that the stream is not set
        for (i = 0; i < 4; i++) {

            if (!Play_MultiArray[i].data.length) {

                Play_BottomHide((i * 2) + Play_controlsAudioEna0);
                Play_BottomHide((i * 2) + Play_controlsAudioVol0);

            }

        }

    } else if (PlayExtra_PicturePicture) {

        for (i = Play_controlsAudioEna0, len = Play_controlsAudioVol1 + 1; i < len; i++) {

            Play_controls[i].bottomArrows();
            Play_controls[i].setLable();

        }

        Play_SetControlsVisibility('ShowInAudioPP');

    }

}

function Play_controlsAudioEnaupdown(pos, adder, obj) {

    if ((adder > 0 && Play_audio_enable[pos]) || (adder < 0 && !Play_audio_enable[pos])) return;

    Play_audio_enable[pos] = Play_audio_enable[pos] ^ 1;
    obj.defaultValue = Play_audio_enable[pos];

    obj.bottomArrows();
    obj.setLable();

    OSInterface_SetAudioEnabled();
    OSInterface_ApplyAudio();

    Play_SetAudioIcon();

}

function Play_controlsAudioEnasetLable(pos, data, obj) {

    obj.defaultValue = Play_audio_enable[pos];

    Main_textContentWithEle(
        obj.doc_title,
        STR_AUDIO + data
    );

    Main_textContentWithEle(
        obj.doc_name,
        obj.values[obj.defaultValue]
    );

    Main_innerHTML(
        'controls_icon_' + obj.position,
        '<i class="pause_button3d icon-' + (Play_audio_enable[pos] ? 'volume' : 'mute') + '" ></i > '
    );

}

function Play_controlsAudioVolupdown(pos, adder, obj) {
    Play_volumes[pos] += adder;

    if (Play_volumes[pos] < 0) {

        Play_volumes[pos] = 0;
        return;

    } else if (Play_volumes[pos] > 100) {

        Play_volumes[pos] = 100;
        return;

    }

    obj.defaultValue = Play_volumes[pos];

    obj.bottomArrows();
    obj.setLable();

    OSInterface_SetVolumes();
    OSInterface_ApplyAudio();

    Play_SetAudioIcon();
}

function Play_controlsAudioVolupsetLable(pos, data, obj) {

    obj.defaultValue = Play_volumes[pos];

    Main_textContentWithEle(
        Play_controls[obj.position].doc_title,
        STR_VOLUME + data
    );

    Main_textContentWithEle(
        obj.doc_name,
        (Play_volumes[pos] + ' %')
    );

    Main_innerHTML(
        'controls_icon_' + obj.position,
        '<i class="pause_button3d icon-' + Play_GetVolLevel(pos) + '" ></i > '
    );
}

function Play_GetVolLevel(pos) {

    var icon = 'vol-level-4';// 100%

    if (!Play_volumes[pos]) icon = 'vol-level-0';// 0%
    else if (Play_volumes[pos] && Play_volumes[pos] < 30) icon = 'vol-level-1'; // 0% - 29%
    else if (Play_volumes[pos] && Play_volumes[pos] < 60) icon = 'vol-level-2'; // 30% - 59%
    else if (Play_volumes[pos] && Play_volumes[pos] < 100) icon = 'vol-level-3'; // 60% - 99%

    return icon;
}

function Play_ResetLowlatency() {
    Play_A_Control(Play_LowLatency, Play_controlsLowLatency);
    Main_textContentWithEle(
        Play_controls[Play_controlsLowLatency].doc_title,
        STR_LOWLATENCY_ENABLE_ARRAY[Play_controls[Play_controlsLowLatency].defaultValue]
    );
}

function Play_ResetSpeed() {
    Play_A_Control(Play_CurrentSpeed, Play_controlsSpeed);
    Main_textContentWithEle(
        Play_controls[Play_controlsSpeed].doc_title,
        STR_SPEED + ' - ' + Play_controls[Play_controlsSpeed].values[Play_controls[Play_controlsSpeed].defaultValue] + 'x'
    );
}

function Play_ResetQualityControls() {
    if (Play_MultiEnable) {

        Play_A_Control(0, Play_controlsQualityMulti);

    } else {

        Play_A_Control(2, Play_controlsQualityMini);

    }
}

function Play_A_Control(value, control) {
    //After setting we only reset this if the app is close/re opened
    Play_controls[control].defaultValue = value;
    if (Play_controls[control].bottomArrows) Play_controls[control].bottomArrows();
    Play_controls[control].setLable();
}

function Play_SetFullScreen(isfull) {
    var changed = Play_isFullScreenold !== Play_isFullScreen;
    Play_isFullScreenold = Play_isFullScreen;

    if (isfull) {
        if (changed) Play_ResStoreChatFullScreen();
    } else {
        if (changed) Play_StoreChatFullScreen();
        Play_SetChatSideBySide();
    }

    if (Main_IsOn_OSInterface) {
        if (PlayExtra_PicturePicture) OSInterface_mupdatesizePP(Play_isFullScreen);
        else OSInterface_mupdatesize(Play_isFullScreen);
    }

    Main_setItem('Play_isFullScreen', Play_isFullScreen);
}

var Play_ChatFullScreenSizes = [
    [//video on the left
        {
            width: '9.7%',
            left: '0.2%'
        },
        {
            width: '14.7%',
            left: '0.2%'
        },
        {
            width: '19.7%',
            left: '0.2%'
        },
        {
            width: '24.7%',
            left: '0.2%'
        },
        {
            width: '29.7%',
            left: '0.2%'
        },
        {
            width: '34.7%',
            left: '0.2%'
        },
        {
            width: '39.7%',
            left: '0.2%'
        },
    ],
    [//video on the right
        {
            width: '9.7%',
            left: '90.1%'
        },
        {
            width: '14.7%',
            left: '85.1%'
        },
        {
            width: '19.7%',
            left: '80.1%'
        },
        {
            width: '24.7%',
            left: '75.1%'
        },
        {
            width: '29.7%',
            left: '70.1%'
        },
        {
            width: '34.7%',
            left: '65.1%'
        },
        {
            width: '39.7%',
            left: '60.1%'
        },
    ]
];

function Play_SetChatSideBySide() {

    if (PlayExtra_PicturePicture) {

        Play_chat_container.style.width = Play_ChatFullScreenSizes[1][3].width;
        Play_chat_container.style.left = Play_ChatFullScreenSizes[1][3].left;

        //Default values
        Play_chat_container.style.height = '99.6%';
        Main_getElementById("play_chat_dialog").style.marginTop = Play_ChatSizeVal[3].dialogTop + '%';
        Play_chat_container.style.top = '0.2%';

    } else {

        Play_chat_container.style.width = Play_ChatFullScreenSizes[Play_FullScreenPosition][Play_FullScreenSize].width;
        Play_chat_container.style.left = Play_ChatFullScreenSizes[Play_FullScreenPosition][Play_FullScreenSize].left;

        //Default values
        Play_chat_container.style.height = '99.6%';
        Main_getElementById("play_chat_dialog").style.marginTop = Play_ChatSizeVal[3].dialogTop + '%';
        Play_chat_container.style.top = '0.2%';

        if (Main_IsOn_OSInterface) OSInterface_mupdatesize(Play_isFullScreen);

        Play_controls[Play_controlsChatPos].values = STR_CHAT_SIDE_ARRAY;
        Play_controls[Play_controlsChatSize].values = ["10%", "15%", "20%", "25%", "30%", "35%", "40%"];
        Play_controls[Play_controlsChatPos].defaultValue = Play_FullScreenPosition;
        Play_controls[Play_controlsChatSize].defaultValue = Play_FullScreenSize;

        Play_controls[Play_controlsChatPos].setLable();
        Play_controls[Play_controlsChatPos].bottomArrows();
        Play_controls[Play_controlsChatSize].setLable();
        Play_BottomArrows(Play_controlsChatSize);
    }

    Play_ChatEnable = true;
    Play_chat_container.classList.remove('hide');

}

var Play_ChatFullScreenObj = {
    height: '',
    marginTop: '',
    top: '',
    left: '',
    WasEnable: false,
    controlsPos: [],
    controlsPosDefault: 0,
    controlsSizeDefault: 0,
};

function Play_StoreChatFullScreen() {
    Play_ChatFullScreenObj.controlsPos = Play_controls[Play_controlsChatSize].values;
    Play_ChatFullScreenObj.controlsPosDefault = Play_controls[Play_controlsChatSize].defaultValue;
    Play_ChatFullScreenObj.controlsSizeDefault = Play_controls[Play_controlsChatPos].defaultValue;

    Play_ChatFullScreenObj.WasEnable = Play_ChatEnable;
    Play_ChatFullScreenObj.height = Play_chat_container.style.height;
    Play_ChatFullScreenObj.marginTop = Main_getElementById("play_chat_dialog").style.marginTop;
    Play_ChatFullScreenObj.top = Play_chat_container.style.top;
    Play_ChatFullScreenObj.left = Play_chat_container.style.left;

    Play_ResetQualityControls();
}

function Play_ResStoreChatFullScreen() {
    Play_controls[Play_controlsChatSize].values = Play_ChatFullScreenObj.controlsPos;
    Play_controls[Play_controlsChatSize].defaultValue = Play_ChatFullScreenObj.controlsPosDefault;
    Play_SetChatPosString();
    Play_controls[Play_controlsChatPos].defaultValue = Play_ChatFullScreenObj.controlsSizeDefault;
    Play_controls[Play_controlsChatPos].setLable();
    Play_controls[Play_controlsChatPos].bottomArrows();
    Play_controls[Play_controlsChatSize].setLable();
    Play_BottomArrows(Play_controlsChatSize);

    Play_ChatEnable = Play_ChatFullScreenObj.WasEnable;
    Play_chat_container.style.width = '';
    if (!Play_ChatEnable) Play_hideChat();
    else Play_showChat();
    Play_chat_container.style.height = Play_ChatFullScreenObj.height;
    Main_getElementById("play_chat_dialog").style.marginTop = Play_ChatFullScreenObj.marginTop;
    Play_chat_container.style.top = Play_ChatFullScreenObj.top;
    Play_chat_container.style.left = Play_ChatFullScreenObj.left;

    Play_ResetQualityControls();
}

function Play_ChatFullScreenKeyLeft() {
    Play_FullScreenSize++;
    if (Play_FullScreenSize > 6) Play_FullScreenSize = 0;

    Play_SetChatFullScreenKeyLeft();
}

function Play_SetChatFullScreenKeyLeft() {
    OSInterface_SetFullScreenSize(Play_FullScreenSize);

    Play_SetChatSideBySide();

    Main_setItem('Play_FullScreenSize', Play_FullScreenSize);
}

function Play_ChatFullScreenKeyRight() {
    Play_FullScreenPosition = Play_FullScreenPosition ^ 1;

    Play_SetChatFullScreenKeyRight();
}

function Play_SetChatFullScreenKeyRight() {
    OSInterface_SetFullScreenPosition(Play_FullScreenPosition);
    Play_SetChatSideBySide();

    Main_setItem('Play_FullScreenPosition', Play_FullScreenPosition);
}

function Play_SetChatFont() {
    Main_getElementById('chat_inner_container').style.fontSize = (Play_ChatFontObj[Main_values.Chat_font_size_new] * 0.76) + '%';
    Main_getElementById('chat_inner_container2').style.fontSize = (Play_ChatFontObj[Main_values.Chat_font_size_new] * 0.76) + '%';
}


function Play_partnerIcon(name, partner, live_vod_clip, lang, rerun) {
    var div = '<div class="partnericon_div"> ' + name + STR_SPACE + STR_SPACE + '</div>' +
        (partner ? ('<img class="partnericon_img" alt="" src="' +
            IMG_PARTNER + '">') : "");

    if (!live_vod_clip) {
        var isStay = Play_StayDialogVisible();
        var text = STR_LIVE;

        if (rerun) text = STR_NOT_LIVE;
        else if (isStay) text = STR_CH_IS_OFFLINE;

        div += STR_SPACE + STR_SPACE + '<div class="partnericon_text" style="background: #' +
            (rerun || isStay ? 'FFFFFF; color: #000000;' : 'E21212;') + '">' +
            STR_SPACE + STR_SPACE + text + STR_SPACE + STR_SPACE + '</div>';
    } else if (live_vod_clip === 1) {
        div += STR_SPACE + STR_SPACE + '<div class="partnericon_text" style="background: #00a94b">&nbsp;&nbsp;VOD&nbsp;&nbsp;</div>';
    } else div += STR_SPACE + STR_SPACE + '<div class="partnericon_text" style="background: #F05700">&nbsp;&nbsp;CLIP&nbsp;&nbsp;</div>';

    return div + '<div class="lang_text">' + STR_SPACE + STR_SPACE + lang + '</div>';
}

function Play_IconsResetFocus() {
    Play_IconsRemoveFocus();
    Play_Panelcounter = Play_controlsDefault;
    if (Play_isPanelShowing() && PlayVod_PanelY === 2) Play_IconsAddFocus();
}

function Play_updownquality(adder, PlayVodClip, Play_controls_Pos) {

    var total;

    if (PlayVodClip === 1) {
        //TODO fix this reversed logic
        Play_data.qualityIndex += adder * -1;
        total = Play_getQualitiesCount() - 1;
        Play_data.qualityIndex = Play_updownqualityCheckTotal(Play_data.qualityIndex, total);

        Play_qualityDisplay(Play_getQualitiesCount, Play_data.qualityIndex, Play_SetHtmlQuality, Play_controls[Play_controls_Pos]);
    } else if (PlayVodClip === 2) {
        //TODO fix this reversed logic
        PlayVod_qualityIndex += adder * -1;
        total = PlayVod_getQualitiesCount() - 1;
        PlayVod_qualityIndex = Play_updownqualityCheckTotal(PlayVod_qualityIndex, total);

        Play_qualityDisplay(PlayVod_getQualitiesCount, PlayVod_qualityIndex, PlayVod_SetHtmlQuality, Play_controls[Play_controls_Pos]);
    } else if (PlayVodClip === 3) {
        //TODO fix this reversed logic
        PlayClip_qualityIndex += adder * -1;
        total = PlayClip_getQualitiesCount() - 1;
        PlayClip_qualityIndex = Play_updownqualityCheckTotal(PlayClip_qualityIndex, total);

        Play_qualityDisplay(PlayClip_getQualitiesCount, PlayClip_qualityIndex, PlayClip_SetHtmlQuality, Play_controls[Play_controls_Pos]);
    }

}

function Play_updownqualityCheckTotal(index, total) {
    if (index > total)
        return total;
    else if (index < 0)
        return 0;

    return index;
}

function Play_PrepareshowEndDialog(PlayVodClip) {
    Play_state = -1;
    PlayVod_state = -1;
    PlayClip_state = -1;
    Play_hideChat();

    if (PlayVodClip === 1) Play_hidePanel();
    else if (PlayVodClip === 2) PlayVod_hidePanel();
    else if (PlayVodClip === 3) PlayClip_hidePanel();

    if (!Play_IsWarning) Play_HideWarningDialog();

    Play_HideBufferDialog();
    Play_CleanHideExit();

    if (PlayVodClip === 3 && PlayClip_HasNext && (PlayClip_All || Settings_Obj_default("clip_auto_play_next"))) {
        Play_EndIconsRemoveFocus();
        Play_Endcounter = -1;
    }

    Play_EndIconsAddFocus();
}

function Play_EndCheckPreview(PlayVodClip) {
    //Check if the video that ends is the same focused
    if (PlayVodClip === 1) {//live

        Play_PreviewVideoEnded = Play_CheckPreviewLive(true);

    } else if (PlayVodClip === 2) {//vod

        Play_PreviewVideoEnded = PlayVod_CheckPreviewVod();

    } else if (PlayVodClip === 3) {

        Play_PreviewVideoEnded = PlayClip_CheckPreviewClip();

    }
}

function Play_showEndDialog(PlayVodClip) {
    Play_EndCheckPreview(PlayVodClip);

    Main_ShowElementWithEle(Play_EndDialogElem);
    UserLiveFeed_SetHoldUp();
    Play_EndFocus = true;
    UserLiveFeed_PreventHide = true;
    UserLiveFeed_clearHideFeed();
    //Skip transitions when showing end dialog
    UserLiveFeed_FeedHolderDocId.style.transition = 'none';
    UserLiveFeed_ShowFeed();
    if (Settings_Obj_default("app_animations")) {
        Main_ready(function() {
            UserLiveFeed_FeedHolderDocId.style.transition = '';
        });
    }
    Main_values.Play_WasPlaying = 0;
    UserLiveFeed_FeedRemoveFocus(UserLiveFeed_FeedPosX);
    Main_SaveValues();
}

function Play_HideEndDialog() {
    Main_HideElementWithEle(Play_EndDialogElem);
    Play_EndTextClear();
    Play_EndIconsResetFocus();
}

function Play_isEndDialogVisible() {
    return Main_isElementShowingWithEle(Play_EndDialogElem);
}

function Play_EndIconsResetFocus() {
    Play_EndIconsRemoveFocus();
    Play_Endcounter = 0;
    Play_EndIconsAddFocus();
}

function Play_EndIconsAddFocus() {
    Main_AddClass('dialog_end_' + Play_Endcounter, 'dialog_end_icons_focus');
}

function Play_EndIconsRemoveFocus() {
    Main_RemoveClass('dialog_end_' + Play_Endcounter, 'dialog_end_icons_focus');
}

function Play_EndText(PlayVodClip) {
    if (PlayVodClip === 1) Play_DialogEndText = Play_data.data[1] + ' ' + STR_LIVE;
    else if (PlayVodClip === 2) Play_DialogEndText = Main_values.Main_selectedChannelDisplayname + ' VOD';
    else if (PlayVodClip === 3) Play_DialogEndText = Main_values.Main_selectedChannelDisplayname + STR_CLIP;

    Play_DialogEndText = Main_ReplaceLargeFont(Play_DialogEndText);

    if (Play_EndTextCounter === -2) { //disable
        Play_state = Play_STATE_PLAYING;
        PlayVod_state = Play_STATE_PLAYING;
        PlayClip_state = Play_STATE_PLAYING;
        Play_EndTextClear();
        return;
    }

    Main_innerHTML("dialog_end_stream_text", Play_DialogEndText + STR_IS_OFFLINE + STR_BR +
        ((PlayVodClip === 3 && PlayClip_HasNext && (PlayClip_All || Settings_Obj_default("clip_auto_play_next"))) ? STR_PLAY_NEXT_IN : STR_STREAM_END) + Play_EndTextCounter + '...');

    if (Play_isEndDialogVisible()) {
        Play_EndTextCounter--;
        Play_state = Play_STATE_PLAYING;
        PlayVod_state = Play_STATE_PLAYING;
        PlayClip_state = Play_STATE_PLAYING;

        if (Play_EndTextCounter === -1) {
            Main_innerHTML("dialog_end_stream_text", Play_DialogEndText + STR_IS_OFFLINE + STR_BR + STR_STREAM_END +
                '0...');
            Play_CleanHideExit();
            Play_hideChat();
            //The content may have refreshed so re-check
            if (Play_PreviewVideoEnded) Play_EndCheckPreview(PlayVodClip);

            if (PlayVodClip === 1) {
                PlayExtra_PicturePicture = false;
                PlayExtra_data = JSON.parse(JSON.stringify(Play_data_base));
                Play_shutdownStream();
            } else if (PlayVodClip === 2) PlayVod_shutdownStream();
            else if (PlayVodClip === 3) {

                if (PlayClip_HasNext && (PlayClip_All || Settings_Obj_default("clip_auto_play_next"))) PlayClip_PlayNext();
                else PlayClip_shutdownStream();

            }

        } else {
            Play_EndTextID = Main_setTimeout(
                function() {
                    Play_EndText(PlayVodClip);
                },
                1000,
                Play_EndTextID
            );
        }
    } else {
        //wait to show to start the counter
        Play_EndTextID = Main_setTimeout(
            function() {
                Play_EndText(PlayVodClip);
            },
            50,
            Play_EndTextID
        );
    }
}

function Play_EndTextClear() {
    Main_clearTimeout(Play_EndTextID);
    Main_innerHTML("dialog_end_stream_text", Play_DialogEndText + STR_IS_OFFLINE + STR_BR + STR_STREAM_END_EXIT);
}

function Play_EndDialogPressed(PlayVodClip) {
    var canhide = true;
    if (Play_Endcounter === -1 && PlayClip_HasNext) PlayClip_PlayNext();
    else if (!Play_Endcounter) {
        if (PlayVodClip === 2) {
            if (!PlayVod_qualities.length) {
                canhide = false;
                Play_showWarningDialog(STR_CLIP_FAIL, 2000);
            } else {
                PlayVod_replay = true;
                PlayVod_Start();
                PlayVod_currentTime = 0;
                Chat_offset = 0;
                Chat_Init();
            }
        } else if (PlayVodClip === 3) {
            if (!PlayClip_qualities.length) {
                canhide = false;
                Play_showWarningDialog(STR_CLIP_FAIL, 2000);
            } else {
                PlayClip_replayOrNext = true;
                PlayClip_replay = true;
                PlayClip_Start();
            }
        }
    } else if (Play_Endcounter === 1) {
        if (Main_values.Play_isHost) Play_OpenHost();
        else if (PlayVodClip === 1) Play_StartStay();
        else if (PlayVodClip === 3) {
            PlayClip_OpenVod();
            if (!PlayClip_HasVOD) canhide = false;
        }
    } else if (Play_Endcounter === 2) Play_OpenChannel(PlayVodClip);
    else if (Play_Endcounter === 3) {
        Play_OpenGame(PlayVodClip);
        if (Play_data.data[3] === '') canhide = false;
    }

    if (canhide) {
        Play_HideEndDialog();
        UserLiveFeed_Hide();
        UserLiveFeed_PreventHide = false;
    }
    Play_EndDialogEnter = 0;
}

function Play_EndSet(PlayVodClip) {
    if (!PlayVodClip) { // Play is hosting
        Play_EndIconsRemoveFocus();
        Play_Endcounter = 1;
        Play_EndIconsAddFocus();
        Main_getElementById('dialog_end_-1').style.display = 'none';
        Main_getElementById('dialog_end_0').style.display = 'none';
        Main_getElementById('dialog_end_1').style.display = 'inline-block';
        Main_textContent("dialog_end_vod_text", STR_OPEN_HOST);

        Play_EndTextsReset();
        Main_innerHTML("end_channel_name_text", Play_data.data[1]);
        Main_innerHTML("end_vod_title_text", Main_ReplaceLargeFont(Play_data.data[1] + STR_IS_NOW + STR_USER_HOSTING + Play_TargetHost.target_display_name));
    } else if (PlayVodClip === 1) { // play
        Play_EndIconsRemoveFocus();
        Play_Endcounter = 1;
        Play_EndIconsAddFocus();
        Main_getElementById('dialog_end_-1').style.display = 'none';
        Main_getElementById('dialog_end_0').style.display = 'none';
        Main_getElementById('dialog_end_1').style.display = 'inline-block';

        Play_EndTextsReset();
        Main_innerHTML("end_channel_name_text", Play_data.data[1]);
        Main_textContent("dialog_end_vod_text", STR_STAY_OPEN);
        Main_innerHTML("end_vod_title_text", STR_STAY_OPEN_SUMMARY);
    } else if (PlayVodClip === 2) { // vod
        Play_EndIconsResetFocus();
        Main_getElementById('dialog_end_-1').style.display = 'none';
        Main_getElementById('dialog_end_0').style.display = 'inline-block';
        Main_getElementById('dialog_end_1').style.display = 'none';

        Main_innerHTML("end_replay_name_text", Main_values.Main_selectedChannelDisplayname);
        Main_innerHTML("end_replay_title_text", ChannelVod_title);

        Main_textContent("end_vod_name_text", '');
        Main_textContent("end_vod_title_text", '');

        Main_innerHTML("end_channel_name_text", Main_values.Main_selectedChannelDisplayname);
    } else if (PlayVodClip === 3) { // clip
        Play_EndIconsResetFocus();
        Main_getElementById('dialog_end_-1').style.display = PlayClip_HasNext ? 'inline-block' : 'none';
        Main_getElementById('dialog_end_0').style.display = 'inline-block';
        Main_getElementById('dialog_end_1').style.display = 'inline-block';
        Main_textContent("dialog_end_vod_text", PlayClip_HasVOD ? STR_OPEN_BROADCAST : STR_NO_BROADCAST);

        Main_innerHTML("end_replay_name_text", Main_values.Main_selectedChannelDisplayname);
        Main_innerHTML("end_replay_title_text", ChannelClip_title);

        Main_innerHTML("end_vod_name_text", Main_values.Main_selectedChannelDisplayname);

        Main_innerHTML("end_channel_name_text", Main_values.Main_selectedChannelDisplayname);
    }
    Main_textContent("end_game_name_text", Play_data.data[3]);
}

function Play_EndTextsReset() {
    Main_textContent("end_replay_name_text", '');
    Main_textContent("end_replay_title_text", '');
    Main_textContent("end_vod_name_text", '');
    Main_textContent("end_vod_title_text", '');
}

function Play_OpenHost() {
    Play_data.DisplaynameHost = Play_data.data[1] + STR_USER_HOSTING + Play_TargetHost.target_display_name;
    Play_data.data[6] = Play_TargetHost.target_login;
    Play_data.data[1] = Play_TargetHost.target_display_name;
    Play_PreshutdownStream(false);

    Main_addEventListener("keydown", Play_handleKeyDown);

    Play_data.data[14] = Play_TargetHost.target_id;
    Play_Start();
}

var Play_StartStayTryedResult = '';
var Play_StartStayTryId;

function Play_StayDialogVisible() {
    return Main_isElementShowing('play_dialog_retry');
}

function Play_StopStay() {
    Main_clearTimeout(Play_StartStayTryId);
    Main_HideElement('play_dialog_retry');
}

function Play_StartStayHidebottom() {
    Play_SetControlsVisibility('ShowInStay');
    Main_HideElementWithEle(Play_BottonIcons_Progress_PauseHolder);
}

function Play_StartStayShowBottom() {
    Main_ShowElementWithEle(Play_BottonIcons_Progress_PauseHolder);
}

function Play_StartStay() {
    if (!ChatLive_loaded[0]) ChatLive_Init(0);
    Play_CheckFollow(Play_data.data[14]);
    Play_ChatEnable = true;
    Play_HideBufferDialog();
    if (Main_IsOn_OSInterface) OSInterface_stopVideo();
    OSInterface_mKeepScreenOn(true);
    Play_StartStayHidebottom();
    ChatLive_Latency[0] = 0;
    ChatLive_Latency[1] = 0;
    Play_showChat();
    Play_data.watching_time = new Date().getTime();
    Play_state = Play_STATE_PLAYING;
    Play_StayCheckHostId = 0;

    Main_innerHTML("play_dialog_retry_text", STR_STAY_CHECK + STR_BR + 10);
    Main_ShowElement('play_dialog_retry');

    Play_StartStayTryId = Main_setTimeout(
        function() {
            Play_StartStayCheck(10);
        },
        1000,
        Play_StartStayTryId
    );

    //Reset play data and info panel
    Play_data.data[2] = STR_SPACE;
    Play_data.data[3] = '';
    Play_data.data[4] = '';
    Play_data.data[5] = '';
    Play_data.data[7] = '';
    Play_data.data[11] = '';
    Play_data.data[12] = 0;
    Play_data.data[13] = 0;
    Play_UpdateMainStreamDiv();
}

function Play_StartStayCheck(time) {
    time--;
    Main_innerHTML(
        "play_dialog_retry_text",
        (Play_StartStayTryedResult !== '' ? (STR_STAY_CHECK_LAST + STR_BR + Play_StartStayTryedResult + STR_BR + STR_BR) : '') + STR_STAY_CHECK + STR_BR + time
    );

    Play_StartStayTryId = Main_setTimeout(
        function() {
            if (!time) Play_StartStayStartCheck();
            else Play_StartStayCheck(time);
        },
        1000,
        Play_StartStayTryId
    );
}

function Play_StartStayStartCheck() {
    Main_innerHTML("play_dialog_retry_text", STR_STAY_CHECKING);
    if (Main_IsOn_OSInterface) Play_StayCheckHost();
    else Play_StayCheckLiveErrorFinish();
}

var Play_StayCheckHostId;
function Play_StayCheckHost() {
    var theUrl = ChatLive_Base_chat_url + 'hosts?include_logins=1&host=' + encodeURIComponent(Play_data.data[14]);
    Play_StayCheckHostId = new Date().getTime();

    BasexmlHttpGet(
        theUrl,//urlString
        DefaultHttpGetTimeout,
        0,
        null,
        Play_StayCheckHostSuccess,
        Play_StayCheckLive,
        0,
        Play_StayCheckHostId
    );
}

function Play_StayCheckHostSuccess(responseText, key, id) {

    if (Play_StayCheckHostId === id) {

        Play_TargetHost = JSON.parse(responseText).hosts[0];
        Play_state = Play_STATE_PLAYING;

        if (Play_TargetHost.target_login !== undefined) {

            Play_IsWarning = true;
            var warning_text = Play_data.data[1] + STR_IS_NOW + STR_USER_HOSTING + Play_TargetHost.target_display_name;

            Main_values.Play_isHost = true;

            if (Settings_value.open_host.defaultValue) {

                Play_OpenHost();
                Play_showWarningDialog(warning_text, 4000);
                return;

            } else Play_EndSet(0);

            Play_showWarningDialog(warning_text, 4000);
            Play_PlayEndStart(1);

        } else {

            Play_StayCheckLive();

        }

    }

}

function Play_StayCheckLive() {

    Play_loadDataId = new Date().getTime();

    OSInterface_getStreamDataAsync(
        PlayClip_BaseUrl,
        Play_live_links.replace('%x', Play_data.data[6]),
        'Play_StayCheckLiveResult',
        Play_loadDataId,
        0,
        DefaultHttpGetTimeout,
        false,
        Play_live_token.replace('%x', Play_data.data[6])
    );

}

function Play_StayCheckLiveResult(response) {

    if (Play_isOn && response) {

        var responseObj = JSON.parse(response);

        if (responseObj.checkResult > 0 && responseObj.checkResult === Play_loadDataId) {

            Play_StayCheckLiveResultEnd(JSON.parse(response));

        }

    }
}

function Play_StayCheckLiveResultEnd(responseObj) {

    if (responseObj.status === 200) {
        Main_HideElement('play_dialog_retry');

        Play_StartStayShowBottom();
        Play_SetControlsVisibility('ShowInLive');
        Play_data.AutoUrl = responseObj.url;
        Play_loadDataSuccessEnd(responseObj.responseText, false, true);
        Play_ShowPanelStatus(1);
        Main_values.Play_WasPlaying = 1;
        Main_SaveValues();

        //Update stream info after 10s as the information may not be correct right after stream comes back online 
        Main_setTimeout(
            function() {

                if (Play_isOn && !Play_StayDialogVisible()) Play_updateStreamInfo();

            },
            10000
        );

        return;

    } else if (responseObj.status === 1 || responseObj.status === 403 ||
        responseObj.status === 404 || responseObj.status === 410) {

        //404 = off line
        //403 = forbidden access
        //410 = api v3 is gone use v5 bug
        Play_StayCheckLiveErrorFinish((responseObj.status === 403 || responseObj.status === 1));
        return;

    }

    Play_StayCheckLiveErrorFinish();
}

function Play_StayCheckLiveErrorFinish(Isforbiden) {

    Play_StartStayTryedResult = Isforbiden ? STR_FORBIDDEN : STR_STAY_IS_OFFLINE;

    Main_innerHTML(
        "play_dialog_retry_text",
        STR_STAY_CHECK_LAST + STR_BR + Play_StartStayTryedResult + STR_BR + STR_BR + STR_STAY_CHECK + STR_BR + 10
    );

    Play_StartStayTryId = Main_setTimeout(
        function() {
            Play_StartStayCheck(10);
        },
        1000,
        Play_StartStayTryId
    );
}

function Play_OpenChannel(PlayVodClip) {

    if (!Main_values.Main_BeforeChannelisSet && Main_values.Main_Go !== Main_ChannelVod && Main_values.Main_Go !== Main_ChannelClip) {

        Main_values.Main_BeforeChannel = (Main_values.Main_BeforeAgameisSet && Main_values.Main_Go !== Main_aGame) ? Main_values.Main_BeforeAgame : Main_values.Main_Go;
        Main_values.Main_BeforeChannelisSet = true;

    }

    if (Sidepannel_isShowingSide()) {
        Sidepannel_Hide(false);
    }

    Play_PreviewVideoEnded = false;
    Main_ExitCurrent(Main_values.Main_Go);
    Main_values.Main_Go = Main_ChannelContent;

    if (PlayVodClip === 1) {
        if (Play_MultiEnable) {
            Play_data = JSON.parse(JSON.stringify(Play_MultiArray[Play_MultiFirstAvailable()]));
        }
        Play_ClearPP();
        Main_values.Main_selectedChannel_id = Play_data.data[14];
        Main_values.Main_selectedChannel = Play_data.data[6];
        Main_values.Main_selectedChannelDisplayname = Play_data.data[1];
        ChannelContent_UserChannels = AddCode_IsFollowing;
        Play_shutdownStream();

    } else if (PlayVodClip === 2) {

        PlayVod_UpdateHistory(Main_values.Main_BeforeChannel);
        PlayVod_shutdownStream(true);

    } else if (PlayVodClip === 3) {

        PlayClip_UpdateHistory(Main_values.Main_BeforeChannel);
        PlayClip_shutdownStream();

    }
}

function Play_OpenSearch(PlayVodClip) {
    if (Sidepannel_isShowingSide()) {
        Sidepannel_Hide(false);
    }

    if (PlayVodClip === 1) {
        Play_ClearPP();
        Play_PreshutdownStream(true);
    } else if (PlayVodClip === 2) PlayVod_PreshutdownStream(true);
    else if (PlayVodClip === 3) PlayClip_PreshutdownStream(true);

    Play_PreviewVideoEnded = false;
    Main_values.Play_WasPlaying = 0;
    Main_showScene1Doc();
    Main_hideScene2Doc();
    Main_OpenSearch();
}

function Play_OpenGame(PlayVodClip) {
    if (Sidepannel_isShowingSide()) {
        Sidepannel_Hide(false);
    }

    if (Play_data.data[3] === '') {
        Play_clearHidePanel();
        Play_IsWarning = true;
        Play_showWarningDialog(STR_NO_GAME, 2000);
        return;
    }

    Play_PreviewVideoEnded = false;
    if (!Main_values.Main_BeforeAgameisSet && Main_values.Main_Go !== Main_AGameVod && Main_values.Main_Go !== Main_AGameClip) {
        Main_values.Main_BeforeAgame = (Main_values.Main_BeforeChannelisSet && Main_values.Main_Go !== Main_ChannelContent && Main_values.Main_Go !== Main_ChannelVod && Main_values.Main_Go !== Main_ChannelClip) ? Main_values.Main_BeforeChannel : Main_values.Main_Go;
        Main_values.Main_BeforeAgameisSet = true;
    }

    Main_ExitCurrent(Main_values.Main_Go);
    Main_values.Main_Go = Main_aGame;

    if (Play_MultiEnable) {
        Play_data = JSON.parse(JSON.stringify(Play_MultiArray[Play_MultiFirstAvailable()]));
    }
    Main_values.Main_gameSelected = Play_data.data[3];
    Main_values.Main_gameSelected_id = null;

    Play_hideChat();
    if (PlayVodClip === 1) {

        Play_ClearPP();
        Play_shutdownStream();

    } else if (PlayVodClip === 2) {

        PlayVod_UpdateHistory(Main_values.Main_BeforeAgame);
        PlayVod_shutdownStream(true);

    } else if (PlayVodClip === 3) {

        PlayClip_UpdateHistory(Main_values.Main_BeforeAgame);
        PlayClip_shutdownStream();

    }
}

function Play_ClearPP() {
    if (PlayExtra_PicturePicture) Play_CloseSmall();

    Play_hideChat();
}

function Play_FollowUnfollow() {
    if (AddUser_UserIsSet() && AddUser_UsernameArray[0].access_token) {
        if (AddCode_IsFollowing) AddCode_UnFollow();
        else AddCode_Follow();
    } else {
        Play_showWarningMidleDialog(STR_NOKEY_WARN, 2000);
        Play_IsWarning = true;
    }
}

function Play_CheckLiveThumb(PreventResetFeed, PreventWarn) {

    var error = STR_STREAM_ERROR;

    if (UserLiveFeed_ObjNotNull(UserLiveFeed_FeedPosX)) {
        var obj = UserLiveFeed_GetObj(UserLiveFeed_FeedPosX);

        //prevent bad saved obj
        if (!obj[14]) {

            return null;

        }

        var isVodScreen = UserLiveFeed_FeedPosX >= UserLiveFeedobj_UserVodPos;

        if ((!Play_isOn && !isVodScreen) || (!PlayVod_isOn && isVodScreen)) {

            return obj;

        }

        if (isVodScreen) {

            if (!PlayVod_isOn) return obj;
            else if (Main_values.ChannelVod_vodId !== obj[7]) return obj;

            error = STR_ALREDY_PLAYING;

        } else if (UserLiveFeed_obj[UserLiveFeed_FeedPosX].checkHistory) {

            error = STR_ALREDY_PLAYING;

            if (Main_A_includes_B(Main_getElementById(UserLiveFeed_ids[1] + UserLiveFeed_FeedPosX + '_' + UserLiveFeed_FeedPosY[UserLiveFeed_FeedPosX]).src, 's3_vods')) {

                if (Play_MultiEnable || PlayExtra_PicturePicture) error = STR_PP_VOD;
                else return obj;

            } else if (Play_MultiEnable) {

                if (!Play_MultiIsAlredyOPen(obj[14])) return obj;

            } else if (Play_data.data[14] !== obj[14] && PlayExtra_data.data[14] !== obj[14]) return obj;

        } else {

            if (Play_MultiEnable) {

                if (!Play_MultiIsAlredyOPen(obj[14])) return obj;

            } else if (Play_data.data[14] !== obj[14] && PlayExtra_data.data[14] !== obj[14]) return obj;

            error = STR_ALREDY_PLAYING;

        }
    }

    if (!PreventWarn) Play_showWarningMidleDialog(error, 1500);

    if (!PreventResetFeed) UserLiveFeed_ResetFeedId();

    return null;
}

function Play_PlayPauseChange(State, PlayVodClip) {//called by java
    if (Play_StayDialogVisible()) return;

    if (State) {
        Main_innerHTMLWithEle(Play_BottonIcons_Pause, '<div ><i class="pause_button3d icon-pause"></i></div>');

        if (PlayVodClip === 1) {

            ChatLive_Playing = true;
            ChatLive_MessagesRunAfterPause();

        } else if (PlayClip_HasVOD) {

            Chat_Play(Chat_Id[0]);

        }

        if (Play_isPanelShowing()) {
            if (PlayVodClip === 1) Play_hidePanel();
            else if (PlayVodClip === 2) PlayVod_hidePanel();
            else if (PlayVodClip === 3) PlayClip_hidePanel();
        }

    } else {
        Main_innerHTMLWithEle(Play_BottonIcons_Pause, '<div ><i class="pause_button3d icon-play-1"></i></div>');

        if (PlayVodClip > 1 && !Main_values.Play_ChatForceDisable) Chat_Pause();
        else ChatLive_Playing = false;
    }
}

function Play_KeyReturn(is_vod) {
    if (Play_isEndDialogVisible() && !Play_ExitDialogVisible()) {
        Play_EndTextClear();

        if (!Play_EndFocus) {
            if (UserLiveFeed_FeedPosX === UserLiveFeedobj_UserAGamesPos ||
                UserLiveFeed_FeedPosX === UserLiveFeedobj_AGamesPos) UserLiveFeed_KeyEnter(UserLiveFeed_FeedPosX);
            else {
                Play_EndFocus = true;
                UserLiveFeed_FeedRemoveFocus(UserLiveFeed_FeedPosX);
                Play_EndIconsAddFocus();
            }
        } else {
            UserLiveFeed_FeedRemoveFocus(UserLiveFeed_FeedPosX);
            Play_EndIconsAddFocus();
            Play_showExitDialog();
        }

    } else if (Play_MultiDialogVisible()) Play_HideMultiDialog();
    else if (UserLiveFeed_isPreviewShowing() && !Play_isEndDialogVisible()) {
        if (UserLiveFeed_FeedPosX === UserLiveFeedobj_UserAGamesPos ||
            UserLiveFeed_FeedPosX === UserLiveFeedobj_AGamesPos) UserLiveFeed_KeyEnter(UserLiveFeed_FeedPosX);
        else UserLiveFeed_Hide();
    } else if (Play_isPanelShowing() && !Play_isVodDialogVisible()) {
        if (is_vod) PlayVod_hidePanel();
        else Play_hidePanel();
    } else {
        if (Play_isVodDialogVisible() && (Play_ExitDialogVisible() || Settings_Obj_default("single_click_exit"))) {
            Play_HideVodDialog();
            PlayVod_PreshutdownStream(false);
            Play_exitMain();
        } else if (Play_ExitDialogVisible() || Settings_Obj_default("single_click_exit")) {
            if (Play_MultiEnable) Play_controls[Play_MultiStream].enterKey();
            else if (PlayExtra_PicturePicture) Play_CloseSmall();
            else {

                Play_CleanHideExit();
                Play_hideChat();

                if (is_vod) {
                    PlayVod_CheckPreview();
                    PlayVod_shutdownStream();
                } else {
                    Play_CheckPreview();
                    Play_shutdownStream();
                }
            }
        } else if (Play_WarningDialogVisible() || Play_WarningMidleDialogVisible()) {
            Main_clearTimeout(Play_showWarningMidleDialogId);
            Main_clearTimeout(Play_showWarningDialogId);
            Play_HideWarningDialog();
            Play_HideWarningMidleDialog();
            Play_KeyReturSetExit();
        } else Play_KeyReturSetExit();
    }
}

function Play_KeyReturSetExit() {
    var text = PlayExtra_PicturePicture ? STR_EXIT_AGAIN_PICTURE : STR_EXIT_AGAIN;
    text = Play_MultiEnable ? STR_EXIT_AGAIN_MULTI : text;
    Main_textContent("play_dialog_exit_text", text);
    Play_showExitDialog();
}

function Play_CheckPreview() {
    if (Play_isOn && Play_data.data.length > 0 && !Play_isEndDialogVisible() && !Play_StayDialogVisible()) {

        if (!Play_StayDialogVisible()) Main_Set_history('live', Play_data.data);

        if (Play_CheckPreviewLive()) {

            Play_PreviewURL = Play_data.AutoUrl;
            Play_PreviewResponseText = Play_data.playlist;
            Play_PreviewId = Play_data.data[14];

        }

    }
}

function Play_CheckPreviewLive(SkipSidepanelFocus) {
    var restorePreview = false;

    //Side panel
    if (Settings_Obj_default('show_side_player') && Sidepannel_isShowingSide()) {

        if (UserLiveFeed_loadingData[UserLiveFeedobj_UserLivePos]) return false;

        //if side panel is showing, try to find if current stream is on side panel to keep player open
        if (!SkipSidepanelFocus && Sidepannel_Positions.hasOwnProperty(Play_data.data[14])) {

            Main_RemoveClass(UserLiveFeed_side_ids[0] + Sidepannel_PosFeed, 'side_panel_div_focused');
            Sidepannel_PosFeed = Sidepannel_Positions[Play_data.data[14]];
            Sidepannel_AddFocusFeed(true);

        }

        restorePreview = Main_A_equals_B(
            parseInt(UserLiveFeed_DataObj[UserLiveFeedobj_UserLivePos][Sidepannel_PosFeed][14]),
            parseInt(Play_data.data[14])
        );

        //live
    } else if (Settings_Obj_default('show_live_player') && !Sidepannel_isShowing()) {

        if (Main_values.Main_Go === Main_ChannelContent) {

            restorePreview = ChannelContent_RestoreThumb(Play_data);

        } else if (ScreenObj[Main_values.Main_Go].screenType === 0 && ScreenObj[Main_values.Main_Go].posY > -1 &&
            !Main_ThumbOpenIsNull(ScreenObj[Main_values.Main_Go].posY + '_' + ScreenObj[Main_values.Main_Go].posX, ScreenObj[Main_values.Main_Go].ids[0])) {

            restorePreview = Main_A_equals_B(
                parseInt(ScreenObj[Main_values.Main_Go].DataObj[ScreenObj[Main_values.Main_Go].posY + '_' + ScreenObj[Main_values.Main_Go].posX][14]),
                parseInt(Play_data.data[14])
            );

        }
    }

    //The content may have refreshed so re-check
    if (Play_PreviewVideoEnded) Play_PreviewVideoEnded = restorePreview;

    return restorePreview;
}

function Play_GetAudioIcon(pos) {

    return STR_SPACE + '<i class="icon-' + (Play_audio_enable[pos] ? 'volume' : 'mute') + ' strokicon" ></i>' + STR_SPACE +
        '<i class="icon-' + Play_GetVolLevel(pos) + ' strokicon" ></i>';

}

function Play_SetAudioIcon() {
    var i = 0,
        icon;

    if (Play_MultiEnable) {

        var extraText = Play_Multi_MainBig ? 'big' : '';

        for (i; i < 4; i++) {

            icon = Play_GetAudioIcon(i);

            Main_innerHTML(
                "stream_info_multi_audio_" + extraText + i,
                STR_SPACE + icon
            );
        }

    } else {

        for (i; i < 2; i++) {

            icon = Play_GetAudioIcon(i);

            Main_innerHTML(
                "chat_container_sound_icon" + i,
                icon
            );

            Main_innerHTML(
                "stream_info_pp_audio_" + i,
                icon
            );

        }

    }

}

function Play_AudioGetFirst() {
    var i = 0, len = 4;

    for (i; i < len; i++) {

        if (Play_audio_enable[i]) return i;

    }

    return 0;

}

function Play_IsAllAudioEnabled(len) {

    var i = 0, ret = 0;

    for (i; i < len; i++) {

        if (Play_audio_enable[i]) ret++;

    }

    return ret === len;
}


var Play_audio_enable_Before = [];
function Play_PP_Multi_KeyDownHold() {
    Play_EndUpclear = true;

    if (!Play_IsAllAudioEnabled(PlayExtra_PicturePicture ? 2 : 4)) {

        Play_audio_enable_Before = Main_Slice(Play_audio_enable);
        Play_audio_enable = [1, 1, 1, 1];

        Play_showWarningMidleDialog(
            STR_AUDIO_SOURCE + STR_SPACE + STR_PLAYER_MULTI_ALL,
            2000
        );

    } else {

        if (Play_audio_enable_Before.length) {

            Play_audio_enable = Main_Slice(Play_audio_enable_Before);
            Play_audio_enable_Before = [];

        } else Play_audio_enable = [1, 0, 0, 0];

        var text = '';

        if (PlayExtra_PicturePicture) {

            if (Play_audio_enable[0] && Play_audio_enable[1]) Play_audio_enable[1] = 0;
            else if (!Play_audio_enable[0] && !Play_audio_enable[1]) Play_audio_enable[0] = 1;

            text = Play_audio_enable[0] ? Play_data.data[1] : PlayExtra_data.data[1];

        } else {

            var i = 0, len = 4;

            for (i; i < len; i++) {

                if (Play_audio_enable[i] && Play_MultiArray[i].data.length > 0) text += Play_MultiArray[i].data[1] + ', ';

            }

            if (text === '') {

                var First = Play_MultiFirstAvailable();

                text = Play_MultiArray[First].data[1];
                Play_audio_enable[First] = 1;

            } else {

                text = text.substring(0, text.length - 2);
            }

        }

        Play_showWarningMidleDialog(
            STR_AUDIO_SOURCE + STR_SPACE + text,
            2000
        );
    }

    OSInterface_SetAudioEnabled();
    OSInterface_ApplyAudio();

    Play_SetAudioIcon();
}

function Play_AudioChangeLeftRight() {

    if (Play_audio_enable_Before.length) {

        Play_audio_enable = Main_Slice(Play_audio_enable_Before);
        Play_audio_enable_Before = [];

    }

    Play_audio_enable[0] = Play_audio_enable[0] ^ 1;
    Play_audio_enable[1] = Play_audio_enable[1] ^ 1;

    if (Play_audio_enable[0] && Play_audio_enable[1]) Play_audio_enable[1] = 0;
    else if (!Play_audio_enable[0] && !Play_audio_enable[1]) Play_audio_enable[0] = 1;

    OSInterface_SetAudioEnabled();
    OSInterface_ApplyAudio();

    Play_showWarningMidleDialog(
        STR_AUDIO_SOURCE + STR_SPACE + (Play_audio_enable[0] ? Play_data.data[1] : PlayExtra_data.data[1]),
        2000
    );

    Play_SetAudioIcon();
}

function Play_MultiKeyDown() {

    Play_Multi_MainBig = !Play_Multi_MainBig;

    if (Play_Multi_MainBig) {

        if (!Play_IsAllAudioEnabled(4)) {

            Play_audio_enable = [1, 0, 0, 0];
            OSInterface_SetAudioEnabled();
            OSInterface_ApplyAudio();
            Play_SetAudioIcon();

        }

        OSInterface_EnableMultiStream(Play_Multi_MainBig, 0);

        Play_showWarningMidleDialog(
            STR_MAIN_WINDOW + STR_SPACE + Play_MultiArray[0].data[1],
            2000
        );

        Play_MultiUpdateinfoMainBig('_big');
        Main_HideElement('stream_info_multi');
        Main_HideElement('dialog_multi_help');
        Main_ShowElement('stream_info_multi_big');
        Play_StoreChatPos();
        Play_showChat();
        Play_chat_container.style.width = '32.8%';
        Play_chat_container.style.height = '65.8%';
        Main_getElementById("play_chat_dialog").style.marginTop = Play_ChatSizeVal[3].dialogTop + '%';
        Play_chat_container.style.top = '0.2%';
        Play_chat_container.style.left = '67%';

        if (!Play_MultiArray[0].data.length) Play_MultiEnableKeyRightLeft(1);

        Play_controls[Play_controlsQualityMulti].values = STR_QUALITY_MULTI_BIG;
        Play_ResetQualityControls();

    } else {

        Play_MultiUpdateinfoMainBig('');
        Main_ShowElement('stream_info_multi');
        Main_HideElement('stream_info_multi_big');
        Play_ResStoreChatPos();
        OSInterface_EnableMultiStream(Play_Multi_MainBig, 0);

        Play_controls[Play_controlsQualityMulti].values = STR_QUALITY_MULTI;
        Play_ResetQualityControls();

    }

    Play_SetAudioIcon();

}

function Play_handleKeyUp(e) {
    //To test multi dialog
    // var mdoc = Play_CheckLiveThumb();
    // if (mdoc) Play_MultiSetUpdateDialog(mdoc);
    // return;
    if (e.keyCode === KEY_ENTER) {
        Play_handleKeyUpClear();
        if (!PlayExtra_clear) Play_OpenLiveFeedCheck();
    } else if (e.keyCode === KEY_UP) {
        Play_handleKeyUpEndClear();
        if (!Play_EndUpclear) {
            if (Play_isEndDialogVisible()) Play_EndDialogUpDown(-1);
            else UserLiveFeed_KeyUpDown(-1);
        }
    } else if (e.keyCode === KEY_DOWN) {
        Play_handleKeyUpEndClear();
        if (!Play_EndUpclear) {
            if (Play_MultiEnable) Play_MultiKeyDown();
            else {
                if (Main_IsOn_OSInterface) OSInterface_mSwitchPlayer();
                PlayExtra_SwitchPlayer();
            }
        }

    }
}

function Play_keyUpEnd() {
    Play_EndUpclear = true;
    UserLiveFeed_FeedRefresh();
}

function Play_handleKeyUpEndClear() {
    Main_clearTimeout(Play_EndUpclearID);
    Main_removeEventListener("keyup", Play_handleKeyUp);
    Main_addEventListener("keydown", Play_EndUpclearCalback);
}

function Play_handleKeyDown(e) {
    if (Play_state !== Play_STATE_PLAYING) {
        switch (e.keyCode) {
            case KEY_STOP:
                Play_Exit();
                break;
            case KEY_KEYBOARD_BACKSPACE:
            case KEY_RETURN:
                if (Play_ExitDialogVisible() || Settings_Obj_default("single_click_exit")) {
                    Play_Exit();
                } else {
                    Play_showExitDialog();
                }
                break;
            default:
                break;
        }
    } else {
        switch (e.keyCode) {
            case KEY_LEFT:
                if (Play_isPanelShowing()) {

                    if (PlayVod_PanelY === 2) Play_BottomLeftRigt(1, -1);
                    else if (!PlayVod_PanelY) {
                        PlayVod_jumpStart(-1, Play_DurationSeconds);
                        PlayVod_ProgressBaroffset = 2500;
                    }

                    Play_clearHidePanel();
                    Play_setHidePanel();
                } else if (UserLiveFeed_isPreviewShowing() && (!Play_EndFocus || !Play_isEndDialogVisible())) UserLiveFeed_KeyRightLeft(-1);
                else if (Play_MultiDialogVisible()) {
                    Play_MultiRemoveFocus();
                    Play_MultiDialogPos--;
                    if (Play_MultiDialogPos < 0) Play_MultiDialogPos = 3;
                    Play_MultiAddFocus();
                } else if (Play_MultiEnable) Play_MultiEnableKeyRightLeft(-1);
                else if (Play_isFullScreen && Play_isChatShown() &&
                    !PlayExtra_PicturePicture) {
                    Play_KeyChatPosChage();
                } else if (Play_isEndDialogVisible()) {
                    Play_EndTextClear();
                    Play_EndIconsRemoveFocus();
                    Play_Endcounter--;
                    if (Play_Endcounter < 1) Play_Endcounter = 3;
                    Play_EndIconsAddFocus();
                } else if (PlayExtra_PicturePicture && Play_isFullScreen) {
                    Play_PicturePicturePos++;
                    if (Play_PicturePicturePos > 7) Play_PicturePicturePos = 0;

                    OSInterface_mSwitchPlayerPosition(Play_PicturePicturePos);
                    Main_setItem('Play_PicturePicturePos', Play_PicturePicturePos);
                } else if (PlayExtra_PicturePicture && !Play_isFullScreen) Play_AudioChangeLeftRight();
                else if (!PlayExtra_PicturePicture && !Play_isFullScreen) Play_ChatFullScreenKeyLeft();
                else Play_FastBackForward(-1);
                break;
            case KEY_RIGHT:
                if (Play_isPanelShowing()) {

                    if (PlayVod_PanelY === 2) Play_BottomLeftRigt(1, 1);
                    else if (!PlayVod_PanelY) {
                        PlayVod_jumpStart(1, Play_DurationSeconds);
                        PlayVod_ProgressBaroffset = 2500;
                    }

                    Play_clearHidePanel();
                    Play_setHidePanel();

                } else if (UserLiveFeed_isPreviewShowing() && (!Play_EndFocus || !Play_isEndDialogVisible())) UserLiveFeed_KeyRightLeft(1);
                else if (Play_MultiDialogVisible()) {
                    Play_MultiRemoveFocus();
                    Play_MultiDialogPos++;
                    if (Play_MultiDialogPos > 3) Play_MultiDialogPos = 0;
                    Play_MultiAddFocus();
                } else if (Play_MultiEnable) Play_MultiEnableKeyRightLeft(1);
                else if (Play_isFullScreen && Play_isChatShown() && !Play_isEndDialogVisible() &&
                    (!PlayExtra_PicturePicture || Play_MultiEnable)) {
                    Play_KeyChatSizeChage();
                } else if (Play_isEndDialogVisible()) {
                    Play_EndTextClear();
                    Play_EndIconsRemoveFocus();
                    Play_Endcounter++;
                    if (Play_Endcounter > 3) Play_Endcounter = 1;
                    Play_EndIconsAddFocus();
                } else if (PlayExtra_PicturePicture && Play_isFullScreen) {
                    Play_PicturePictureSize++;
                    if (Play_PicturePictureSize > 4) Play_PicturePictureSize = 0;
                    OSInterface_mSwitchPlayerSize(Play_PicturePictureSize);
                    Main_setItem('Play_PicturePictureSize', Play_PicturePictureSize);
                } else if (PlayExtra_PicturePicture && !Play_isFullScreen) Play_AudioChangeLeftRight();
                else if (!PlayExtra_PicturePicture && !Play_isFullScreen) Play_ChatFullScreenKeyRight();
                else Play_FastBackForward(1);
                break;
            case KEY_UP:
                if (Play_isPanelShowing()) {

                    Play_clearHidePanel();

                    if (PlayVod_PanelY < 2) {
                        PlayVod_PanelY--;
                        Play_BottonIconsFocus();
                    } else Play_BottomUpDown(1, 1);

                    Play_setHidePanel();

                } else if (Play_MultiDialogVisible()) {

                    Play_MultiRemoveFocus();
                    if (Play_Multi_MainBig) {
                        Play_MultiDialogPos = Play_MultiDialogPos ? 0 : 2;
                    } else {
                        Play_MultiDialogPos -= 2;
                        if (Play_MultiDialogPos < 0) Play_MultiDialogPos += 4;
                    }
                    Play_MultiAddFocus();

                } else if (!UserLiveFeed_isPreviewShowing()) UserLiveFeed_ShowFeed();
                else if (Play_isEndDialogVisible() || UserLiveFeed_isPreviewShowing()) {
                    Play_EndTextClear();
                    Main_removeEventListener("keydown", Play_handleKeyDown);
                    Main_addEventListener("keyup", Play_handleKeyUp);
                    Play_EndUpclear = false;
                    Play_EndUpclearCalback = Play_handleKeyDown;
                    Play_EndUpclearID = Main_setTimeout(Play_keyUpEnd, Screens_KeyUptimeout, Play_EndUpclearID);
                }
                break;
            case KEY_DOWN:
                // Android.TestFun();
                // break;
                if (Play_isPanelShowing()) {

                    Play_clearHidePanel();

                    if (PlayVod_PanelY < 2) {
                        PlayVod_PanelY++;
                        Play_BottonIconsFocus(false, true);
                    } else Play_BottomUpDown(1, -1);

                    Play_setHidePanel();

                } else if (Play_MultiDialogVisible()) {
                    Play_MultiRemoveFocus();
                    if (Play_Multi_MainBig) {
                        Play_MultiDialogPos = !Play_MultiDialogPos ? 2 : 0;
                    } else {
                        Play_MultiDialogPos += 2;
                        if (Play_MultiDialogPos > 3) Play_MultiDialogPos -= 4;
                    }
                    Play_MultiAddFocus();
                } else if (Play_isEndDialogVisible()) Play_EndDialogUpDown(1);
                else if (UserLiveFeed_isPreviewShowing()) UserLiveFeed_KeyUpDown(1);
                else if (PlayExtra_PicturePicture || Play_MultiEnable) {

                    if (Play_isFullScreen || Play_MultiEnable) {
                        Main_removeEventListener("keydown", Play_handleKeyDown);
                        Main_addEventListener("keyup", Play_handleKeyUp);
                        Play_EndUpclear = false;
                        Play_EndUpclearCalback = Play_handleKeyDown;
                        Play_EndUpclearID = Main_setTimeout(Play_PP_Multi_KeyDownHold, Screens_KeyUptimeout, Play_EndUpclearID);
                    } else {
                        Play_PP_Multi_KeyDownHold();
                    }

                } else if (Play_isFullScreen) Play_controls[Play_controlsChat].enterKey(1);
                else Play_showPanel();
                break;
            case KEY_ENTER:
                //ChatLive_Playing = false;
                if (Play_isEndDialogVisible()) {
                    if (Play_EndFocus) Play_EndDialogPressed(1);
                    else {
                        if (UserLiveFeed_obj[UserLiveFeed_FeedPosX].IsGame) UserLiveFeed_KeyEnter(UserLiveFeed_FeedPosX);
                        else if (Play_PreviewId || Play_CheckLiveThumb(true)) {
                            Play_EndDialogEnter = 1;
                            Play_EndUpclearCalback = Play_handleKeyDown;
                            Play_OpenLiveFeed();
                        }
                    }
                } else if (Play_isPanelShowing()) {
                    Play_clearHidePanel();

                    if (!PlayVod_PanelY) {

                        if (PlayVod_IsJumping) PlayVod_jump();

                    } else if (PlayVod_PanelY === 1) {

                        if (Main_IsOn_OSInterface && !Play_isEndDialogVisible()) OSInterface_PlayPauseChange();

                    } else Play_BottomOptionsPressed(1);

                    Play_setHidePanel();

                } else if (Play_MultiDialogVisible()) {

                    Play_HideMultiDialog(Play_PreviewId);
                    Main_Set_history('live', Play_MultiArray[Play_MultiDialogPos].data);//save before we change
                    Play_MultiStartPrestart(Play_MultiDialogPos);

                } else if (UserLiveFeed_isPreviewShowing()) {

                    if (UserLiveFeed_obj[UserLiveFeed_FeedPosX].IsGame) UserLiveFeed_KeyEnter(UserLiveFeed_FeedPosX);
                    else if (Play_MultiEnable) {

                        if (Play_MultiIsFull()) {

                            var obj1 = Play_CheckLiveThumb();
                            if (obj1) Play_MultiSetUpdateDialog(obj1);

                        } else Play_MultiStartPrestart();

                    } else if (Play_StayDialogVisible()) {

                        Play_OpenLiveFeedCheck();

                    } else {

                        Main_removeEventListener("keydown", Play_handleKeyDown);
                        Main_addEventListener("keyup", Play_handleKeyUp);
                        PlayExtra_clear = false;
                        UserLiveFeed_ResetFeedId();
                        PlayExtra_KeyEnterID = Main_setTimeout(PlayExtra_KeyEnter, Screens_KeyUptimeout, PlayExtra_KeyEnterID);

                    }

                } else Play_showPanel();
                break;
            case KEY_KEYBOARD_BACKSPACE:
            case KEY_RETURN:
                Play_KeyReturn(false);
                break;
            case KEY_STOP:
                Play_CheckPreview();
                Play_Exit();
                break;
            case KEY_PLAY:
            case KEY_KEYBOARD_SPACE:
            case KEY_PLAYPAUSE:
                if (Main_IsOn_OSInterface && !Play_isEndDialogVisible()) OSInterface_PlayPauseChange();
                break;
            case KEY_1:
                if (UserLiveFeed_isPreviewShowing()) {
                    if (UserLiveFeed_obj[UserLiveFeed_FeedPosX].IsGame) UserLiveFeed_KeyEnter(UserLiveFeed_FeedPosX);
                    else if (Play_MultiEnable) {
                        if (Play_MultiIsFull()) {
                            var obj2 = Play_CheckLiveThumb();
                            if (obj2) Play_MultiSetUpdateDialog(obj2);
                        } else Play_MultiStartPrestart();
                    } else {
                        PlayExtra_KeyEnter();
                    }
                }
                break;
            case KEY_CHAT:
                Play_controls[Play_controlsChat].enterKey(1);
                break;
            case KEY_PG_UP:
                if (UserLiveFeed_isPreviewShowing()) UserLiveFeed_KeyUpDown(-1);
                else if (Play_isFullScreen && Play_isChatShown()) Play_KeyChatPosChage();
                else UserLiveFeed_ShowFeed();
                break;
            case KEY_PG_DOWN:
                if (UserLiveFeed_isPreviewShowing()) UserLiveFeed_KeyUpDown(1);
                else if (Play_isFullScreen && Play_isChatShown()) Play_KeyChatSizeChage();
                else UserLiveFeed_ShowFeed();
                break;
            case KEY_REFRESH:
            case KEY_MEDIA_FAST_FORWARD:
                if (Play_isEndDialogVisible() || Play_MultiDialogVisible() || Play_MultiEnable) break;

                if (UserLiveFeed_isPreviewShowing()) UserLiveFeed_FeedRefresh();
                else Play_controls[Play_controlsChatSide].enterKey(1);

                break;
            case KEY_MEDIA_REWIND:
                if (Play_isEndDialogVisible() || Play_MultiDialogVisible()) break;

                Play_controls[Play_MultiStream].enterKey();

                break;
            case KEY_MEDIA_NEXT:
                if (Play_isEndDialogVisible() || Play_MultiDialogVisible()) break;

                if (Play_MultiEnable) Play_MultiEnableKeyRightLeft(1);
                else if (PlayExtra_PicturePicture) Play_AudioChangeLeftRight();
                else PlayVod_QuickJump(5);

                break;
            case KEY_MEDIA_PREVIOUS:
                if (Play_isEndDialogVisible() || Play_MultiDialogVisible()) break;

                if (Play_MultiEnable) Play_MultiEnableKeyRightLeft(-1);
                else if (PlayExtra_PicturePicture) Play_AudioChangeLeftRight();
                else PlayVod_QuickJump(-5);

                break;
            case KEY_4:
                Play_controls[Play_controlsChatSend].enterKey();
                break;
            default:
                break;
        }
    }
}

var Play_controls = {};
var Play_controlsSize = -1;

var Play_controlsBack = 0;
var Play_controlsSearch = 1;
var Play_controlsChanelCont = 2;
var Play_controlsGameCont = 3;
var Play_controlsOpenVod = 4;
var Play_controlsFollow = 5;
var Play_controlsSpeed = 6;
var Play_controlsExternal = 7;
var Play_controlsQuality = 8;
var Play_controlsQualityMini = 9;
var Play_controlsQualityMulti = 10;
var Play_controlsLowLatency = 11;
var Play_controlsChapters = 12;
var Play_MultiStream = 13;
var Play_controlsAudio = 14;
var Play_controlsChatSide = 15;
var Play_controlsChat = 16;
var Play_controlsChatSend = 17;

var Play_controlsChatSettings = 18;
var Play_controlsPlayerStatus = 19;
var Play_controlsPreview = 20;

var Play_controlsChatForceDis = 21;
var Play_controlsChatDelay = 22;
var Play_controlsChatPos = 23;
var Play_controlsChatSize = 24;
var Play_controlsChatBright = 25;
var Play_controlsChatFont = 26;

var Play_controlsAudioAll = 27;
var Play_controlsAudio_Volume_100 = 28;
var Play_controlsAudioEna0 = 29;
var Play_controlsAudioVol0 = 30;
var Play_controlsAudioEna1 = 31;
var Play_controlsAudioVol1 = 32;
var Play_controlsAudioEna2 = 33;
var Play_controlsAudioVol2 = 34;
var Play_controlsAudioEna3 = 35;
var Play_controlsAudioVol3 = 36;

var Play_controlsPreviewEnable = 37;
var Play_controlsPreviewSize = 38;
var Play_controlsPreviewVolume = 39;
var Play_controlsPreviewMainVolume = 40;

var Play_controlsDefault = Play_controlsChat;
var Play_Panelcounter = Play_controlsDefault;
var Play_PanelcounterBefore = 0;

function Play_MakeControls() {

    Play_controls[Play_controlsBack] = { //Search
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: true,
        ShowInStay: false,
        icons: "key-left",
        string: STR_SIDE_PANEL_SETTINGS,
        values: null,
        defaultValue: null,
        enterKey: function(PlayVodClip, skipAddfocus) {

            if (!Play_PanelcounterBefore) return;

            Play_IconsRemoveFocus();
            Play_Panelcounter = Play_PanelcounterBefore;
            Play_PanelcounterBefore = 0;

            if (PlayVodClip === 1) {

                if (Play_MultiEnable) Play_SetControlsVisibility('ShowInMulti');
                else if (PlayExtra_PicturePicture) Play_SetControlsVisibility('ShowInPP');
                else Play_SetControlsVisibility('ShowInLive');

            } else if (PlayVodClip === 2) {

                Play_SetControlsVisibility('ShowInVod');
                if (PlayVod_ChaptersArray.length) Play_BottomShow(Play_controlsChapters);

            } else if (PlayVodClip === 3) {

                Play_SetControlsVisibility('ShowInClip');
                if (PlayClip_HasVOD) Play_BottomShow(Play_controlsOpenVod);

            }

            if (!skipAddfocus) Play_IconsAddFocus();

        },
    };

    Play_controls[Play_controlsSearch] = { //Search
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "search",
        string: STR_SEARCH,
        values: null,
        defaultValue: null,
        enterKey: function(PlayVodClip) {
            Play_ForceHidePannel();
            Play_OpenSearch(PlayVodClip);
        },
    };

    Play_controls[Play_controlsChanelCont] = { //channel content
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "filmstrip",
        string: STR_CHANNEL_CONT,
        values: '',
        defaultValue: null,
        enterKey: function(PlayVodClip) {
            Play_ForceHidePannel();
            Play_OpenChannel(PlayVodClip);
        },
        setLable: function(title) {
            Main_innerHTML('extra_button_' + this.position,
                '<div style="max-width: 27%; text-overflow: ellipsis; overflow: hidden; transform: translate(135.5%, 0);">' +
                title + '</div>');
        },
    };

    Play_controls[Play_controlsGameCont] = { //game content
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "gamepad",
        string: STR_GAME_CONT,
        values: '',
        defaultValue: null,
        enterKey: function(PlayVodClip) {
            Play_ForceHidePannel();
            Play_OpenGame(PlayVodClip);
        },
        setLable: function(title) {
            Main_innerHTML('extra_button_' + this.position,
                '<div style="max-width: 40%; text-overflow: ellipsis; overflow: hidden; transform: translate(75%, 0);">' +
                (title === "" ? STR_NO_GAME : title) + '</div>');
        },
    };

    Play_controls[Play_controlsOpenVod] = { //open vod
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "movie-play",
        string: STR_OPEN_BROADCAST,
        values: '',
        defaultValue: null,
        enterKey: function() {
            Play_ForceHidePannel();
            PlayClip_OpenVod();
        },
        setLable: function(title) {
            Main_innerHTML('extra_button_' + this.position,
                '<div style="max-width: 60%; text-overflow: ellipsis; overflow: hidden; transform: translate(33%, 0);">' +
                title + '</div>');
        },
    };


    Play_controls[Play_controlsFollow] = { //following
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "heart-o",
        string: STR_FOLLOW,
        values: '',
        defaultValue: null,
        enterKey: function(PlayVodClip) {

            AddCode_Channel_id = (PlayVodClip === 1 ? Play_data.data[14] : Main_values.Main_selectedChannel_id);
            Play_FollowUnfollow();

            Play_Resetpanel(PlayVodClip);
        },
        setLable: function(string, AddCode_IsFollowing) {
            Main_textContentWithEle(Play_controls[this.position].doc_title, string);
            this.setIcon(AddCode_IsFollowing);
            Main_textContent('extra_button_' + this.position, AddCode_IsFollowing ? STR_CLICK_UNFOLLOW : STR_CLICK_FOLLOW);
        },
        setIcon: function(AddCode_IsFollowing) {
            Main_innerHTML('controls_icon_' + this.position, '<i class="pause_button3d icon-' +
                (AddCode_IsFollowing ? "heart" : "heart-o") +
                '" style="color: #' + (AddCode_IsFollowing ? "6441a4" : "FFFFFF") + ';" ></i>');
        },
    };

    Play_controls[Play_controlsSpeed] = { //speed
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "speedometer",
        string: STR_SPEED,
        values: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        defaultValue: 3,
        enterKey: function() {
            if (Play_StayDialogVisible()) return;

            Play_CurrentSpeed = this.defaultValue;
            OSInterface_setPlaybackSpeed(this.values[this.defaultValue]);
            Play_ResetSpeed();
        },
        updown: function(adder) {
            this.defaultValue += adder;
            if (this.defaultValue < 0)
                this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1))
                this.defaultValue = (this.values.length - 1);
            this.bottomArrows();
            this.setLable();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name, this.values[this.defaultValue] +
                (this.values[this.defaultValue] === 1 ? 'x (' + STR_NORMAL + ')' : 'x'));
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsExternal] = { //External
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "external",
        string: STR_OPEN_EXTERNAL_PLAYER,
        values: ['1080p60 | Source | 10.00Mbps | avc'],
        defaultValue: 0,
        enterKey: function(PlayVodClip) {
            if (Play_StayDialogVisible()) return;

            if (PlayVodClip === 1) {
                Play_hidePanel();
            } else if (PlayVodClip === 2) {
                PlayVod_hidePanel();
            } else if (PlayVodClip === 3) {
                PlayClip_hidePanel();
            }

            OSInterface_OpenExternal(Play_ExternalUrls[Play_controls[this.position].defaultValue]);
        },
        updown: function(adder) {
            this.defaultValue += adder;
            if (this.defaultValue < 0)
                this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1))
                this.defaultValue = (this.values.length - 1);

            this.setLable();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name,
                Play_controls[this.position].values[Play_controls[this.position].defaultValue]);
            this.bottomArrows();
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsQuality] = { //quality
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "videocamera",
        string: STR_QUALITY,
        values: ['1080p60 | Source | 10.00Mbps | avc'],
        defaultValue: 0,
        enterKey: function(PlayVodClip) {
            if (Play_StayDialogVisible()) return;

            var oldQuality;
            if (PlayVodClip === 1) {

                Play_data.quality = Play_data.qualityPlaying;
                Play_data_base.quality = Play_data.quality;

                oldQuality = Play_data.quality;
                Play_SetPlayQuality(Play_data.qualities[Play_data.qualityIndex].id);
                Play_SetHtmlQuality(Play_info_quality);

                if (oldQuality !== Play_data.quality) OSInterface_SetQuality(Play_data.qualityIndex - 1);//just quality change
                else OSInterface_RestartPlayer(1, 0, 0);//restart the player

                Play_qualityIndexReset();

            } else if (PlayVodClip === 2) {

                PlayVod_quality = PlayVod_qualityPlaying;

                oldQuality = PlayVod_quality;
                PlayVod_quality = PlayVod_qualities[PlayVod_qualityIndex].id;
                PlayVod_qualityPlaying = PlayVod_quality;
                PlayVod_SetHtmlQuality(Play_info_quality);

                if (oldQuality !== PlayVod_quality) OSInterface_SetQuality(PlayVod_qualityIndex - 1);//just quality change
                else OSInterface_RestartPlayer(2, OSInterface_gettime(), 0);//resetart the player

                PlayVod_qualityIndexReset();

            } else if (PlayVodClip === 3) {

                PlayClip_quality = PlayClip_qualityPlaying;

                PlayClip_quality = PlayClip_qualities[PlayClip_qualityIndex].id;
                PlayClip_qualityPlaying = PlayClip_quality;
                PlayClip_playingUrl = PlayClip_qualities[PlayClip_qualityIndex].url;
                PlayClip_SetHtmlQuality(Play_info_quality);
                PlayClip_onPlayer();

                PlayClip_qualityIndexReset();

            }
            Play_Resetpanel(PlayVodClip);
        },
        updown: function(adder, PlayVodClip) {
            Play_updownquality(adder, PlayVodClip, Play_controlsQuality);
        },
    };

    Play_controls[Play_controlsQualityMini] = { //quality for picture in picture
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: true,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "videocamera",
        string: STR_PLAYER_RESYNC,
        values: STR_QUALITY_PP,
        defaultValue: 2,
        enterKey: function(PlayVodClip) {
            if (Play_StayDialogVisible()) return;

            if (this.defaultValue === 2) {//both
                OSInterface_RestartPlayer(1, 0, 0);
                OSInterface_RestartPlayer(1, 0, 1);
            } else if (this.defaultValue) OSInterface_RestartPlayer(1, 0, 0);//main
            else OSInterface_RestartPlayer(1, 0, 1);//small

            this.setLable();
            Play_Resetpanel(PlayVodClip);
        },
        updown: function(adder) {

            this.defaultValue += adder;
            if (this.defaultValue < 0) this.defaultValue = (this.values.length - 1);
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = 0;

            this.setLable();
        },
        setLable: function() {
            if (!PlayExtra_data.data || !Play_data.data) return;

            var text = !this.defaultValue ? PlayExtra_data.data[1] : Play_data.data[1];

            Main_textContentWithEle(this.doc_name,
                Play_controls[this.position].defaultValue < 2 ?
                    Play_controls[this.position].values[Play_controls[this.position].defaultValue] + ' - ' + text :
                    Play_controls[this.position].values[Play_controls[this.position].defaultValue]

            );
        }

    };

    Play_controls[Play_controlsQualityMulti] = { //quality for Multi
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "videocamera",
        string: STR_PLAYER_RESYNC,
        values: STR_QUALITY_MULTI,
        defaultValue: 0,
        enterKey: function(PlayVodClip) {
            if (Play_StayDialogVisible()) return;

            if (!this.defaultValue) {//restart all

                var i = 0;

                for (i; i < Play_MultiArray_length; i++) {

                    if (Play_MultiArray[i].data.length > 0) {

                        OSInterface_StartMultiStream(
                            i,
                            Play_MultiArray[i].AutoUrl,
                            Play_MultiArray[i].playlist,
                            true
                        );

                    }

                }

            } else {

                var pos = Play_controls[this.position].defaultValue - 1;

                OSInterface_StartMultiStream(
                    pos,
                    Play_MultiArray[pos].AutoUrl,
                    Play_MultiArray[pos].playlist,
                    true
                );

            }

            Play_Resetpanel(PlayVodClip);
        },
        updown: function(adder) {
            this.defaultValue += adder;

            if (this.defaultValue < 0) this.defaultValue = (this.values.length - 1);
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = 0;

            //prevent change not activi video
            if (this.defaultValue && !Play_MultiArray[Play_controls[this.position].defaultValue - 1].data.length) {

                this.updown(adder);
                return;

            }

            this.setLable();
        },
        setLable: function() {
            var pos = Play_controls[this.position].defaultValue - 1;

            if (this.defaultValue && !Play_MultiArray[pos]) return;

            Main_textContentWithEle(
                this.doc_name,
                (Play_controls[this.position].defaultValue ?
                    Play_controls[this.position].values[Play_controls[this.position].defaultValue] + ' - ' + Play_MultiArray[pos].data[1] :
                    Play_controls[this.position].values[Play_controls[this.position].defaultValue]
                )
            );
        }

    };

    Play_controls[Play_controlsLowLatency] = { //LowLatenc
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "history",
        string: STR_LOW_LATENCY,
        values: STR_LOWLATENCY_ARRAY,
        defaultValue: Play_LowLatency,
        enterKey: function(PlayVodClip) {
            if (Play_StayDialogVisible()) return;

            Play_LowLatency = this.defaultValue;

            if (Main_IsOn_OSInterface) {
                OSInterface_mSetlatency(Play_LowLatency);

                if (Play_MultiEnable) {

                    var i = 0;

                    for (i; i < Play_MultiArray_length; i++) {

                        if (Play_MultiArray[i].data.length > 0) {
                            OSInterface_StartMultiStream(i, Play_MultiArray[i].AutoUrl, Play_MultiArray[i].playlist);
                        }
                    }

                } else if (PlayExtra_PicturePicture) {
                    OSInterface_StartAuto(Play_data.AutoUrl, Play_data.playlist, 1, 0, 0);
                    OSInterface_StartAuto(PlayExtra_data.AutoUrl, PlayExtra_data.playlist, 1, 0, 1);
                } else {
                    OSInterface_StartAuto(Play_data.AutoUrl, Play_data.playlist, 1, 0, 0);
                }

            }

            if (Play_LowLatency) Play_showWarningMidleDialog(STR_LOW_LATENCY_SUMMARY, 3000);

            Main_setItem('Play_LowLatency', Play_LowLatency);
            Play_ResetLowlatency();
            Play_Resetpanel(PlayVodClip);
        },
        updown: function(adder) {

            this.defaultValue += adder;
            if (this.defaultValue < 0) this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);

            this.bottomArrows();
            this.setLable();
        },
        setLable: function() {

            Main_textContentWithEle(this.doc_name,
                Play_controls[this.position].values[Play_controls[this.position].defaultValue]);
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsChapters] = { //Chapter
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "feed",
        string: STR_CHAPTERS,
        values: [],
        defaultValue: 0,
        enterKey: function() {

            PlayVod_TimeToJump = PlayVod_ChaptersArray[this.defaultValue].posMs / 1000;
            PlayVod_jump();

        },
        updown: function(adder) {

            this.defaultValue += adder;
            if (this.defaultValue < 0) this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);

            this.bottomArrows();
            this.setLable();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name,
                Play_controls[this.position].values[Play_controls[this.position].defaultValue]);
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_MultiStream] = { //multi
        ShowInLive: true,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "multi",
        string: STR_4_WAY_MULTI,
        values: null,
        enterKey: function(shutdown) {
            if (!Main_IsOn_OSInterface || Play_StayDialogVisible()) return;

            Play_MultiEnable = !Play_MultiEnable;
            if (Play_MultiEnable) {

                Play_hidePanel();
                if (!Main_A_includes_B(Play_data.quality, 'Auto')) {
                    Play_SetPlayQuality("Auto");
                    OSInterface_SetQuality(-1);
                    Play_qualityDisplay(Play_getQualitiesCount, 0, Play_SetHtmlQuality, Play_controls[Play_controlsQuality]);
                }

                OSInterface_EnableMultiStream(Play_Multi_MainBig, 0);

                var i = 0;
                for (i; i < 4; i++) {
                    Play_MultiArray[i] = JSON.parse(JSON.stringify(Play_data_base));
                }

                Play_MultiArray[0] = JSON.parse(JSON.stringify(Play_data));
                Play_MultiSetinfo(
                    0,
                    Play_MultiArray[0].data[3],
                    Play_MultiArray[0].data[13],
                    Play_MultiArray[0].data[1],
                    Play_MultiArray[0].data[8],
                    Play_MultiArray[0].data[9],
                    twemoji.parse(Play_MultiArray[0].data[2])
                );

                if (PlayExtra_PicturePicture) {
                    Play_MultiArray[1] = JSON.parse(JSON.stringify(PlayExtra_data));
                    Play_MultiSetinfo(
                        1,
                        Play_MultiArray[1].data[3],
                        Play_MultiArray[1].data[13],
                        Play_MultiArray[1].data[1],
                        Play_MultiArray[1].data[8],
                        Play_MultiArray[1].data[9],
                        twemoji.parse(Play_MultiArray[1].data[2])
                    );

                }

                Play_Multi_SetPanel();

                for (i = PlayExtra_PicturePicture ? 2 : 1; i < 4; i++) {
                    Play_MultiInfoReset(i);
                }

                Play_MultiChatBeffore = Play_isChatShown();
                if (Play_MultiChatBeffore) Play_controls[Play_controlsChat].enterKey();
                Play_SetAudioIcon();

            } else {
                OSInterface_DisableMultiStream();
                Play_Multi_UnSetPanel(shutdown);
                Play_CleanHideExit();
                Play_getQualities(1, PlayExtra_PicturePicture);
            }
        }
    };

    Play_controls[Play_controlsAudio] = {//Audio
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "volume",
        string: STR_VOLUME_CONTROLS,
        values: null,
        defaultValue: null,
        enterKey: function() {

            Play_PanelcounterBefore = Play_controlsAudio;
            Play_IconsRemoveFocus();

            Play_Panelcounter = Play_controlsBack;
            Play_controlsAudioUpdateicons();

            Play_IconsAddFocus();

        }
    };

    Play_controls[Play_controlsChatSide] = { //chat side
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: Play_isFullScreen ? "resize-down" : "resize-up",
        string: STR_CHAT_VIDEO_MODE,
        values: null,
        defaultValue: null,
        enterKey: function(PlayVodClip) {
            Play_isFullScreen = !Play_isFullScreen;
            Play_SetFullScreen(Play_isFullScreen);

            if (PlayExtra_PicturePicture) {
                if (!Play_isFullScreen) {
                    ChatLive_Init(1);
                    PlayExtra_ShowChat();
                } else {
                    ChatLive_Clear(1);
                    PlayExtra_HideChat();
                }
            }
            this.setLable();
            this.setIcon();
            Play_Resetpanel(PlayVodClip);
        },
        setLable: function() {
            var title = Play_isFullScreen ? STR_CHAT_SIDE_FULL : STR_CHAT_SIDE;
            if (PlayExtra_PicturePicture) title = Play_isFullScreen ? STR_CHAT_PP_SIDE_FULL : STR_CHAT_5050;

            Main_textContentWithEle(
                Play_controls[this.position].doc_title,
                STR_CHAT_VIDEO_MODE + ' - ' + title
            );

            title = !Play_isFullScreen ? STR_CHAT_SIDE_FULL : STR_CHAT_SIDE;
            if (PlayExtra_PicturePicture) title = !Play_isFullScreen ? STR_CHAT_PP_SIDE_FULL : STR_CHAT_5050;

            Main_textContent('extra_button_' + this.position, STR_PRESS_ENTER_TO_CHANGE + title);

            if (Play_controls[Play_controlsChat].position) Play_controls[Play_controlsChat].setLable();
        },
        setIcon: function() {
            var icon = (Play_isFullScreen ? "resize-down" : "resize-up");
            if (PlayExtra_PicturePicture) icon = 'pp';

            Main_innerHTML('controls_icon_' + this.position, '<i class="pause_button3d icon-' +
                icon + '" ></i>');
        },
    };

    Play_controls[Play_controlsChat] = { //chat enable disable
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "chat",
        string: STR_CHAT_SHOW,
        values: null,
        defaultValue: null,
        enterKey: function() {
            if ((!Play_isFullScreen && !Play_MultiEnable) || Play_Multi_MainBig) return;

            if (!Play_isChatShown() && !Play_isEndDialogVisible()) {
                Play_showChat();
                Play_ChatEnable = true;
            } else {
                Play_hideChat();
                Play_ChatEnable = false;
            }
            Main_setItem('ChatEnable', Play_ChatEnable ? 'true' : 'false');
            this.setLable();
        },
        setLable: function() {
            var string = (Play_isChatShown() ? STR_YES : STR_NO);

            if (!Play_isFullScreen && !Play_MultiEnable) {
                string = PlayExtra_PicturePicture ? STR_CHAT_5050 : STR_CHAT_SIDE;
            } else if (Play_MultiEnable && Play_Multi_MainBig) string = STR_MULTI_MAIN_WINDOW;

            Main_textContent('extra_button_' + this.position, '(' + string + ')');
        },
    };

    Play_controls[Play_controlsChatSend] = {
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "keyboard",
        string: STR_CHAT_WRITE,
        values: null,
        defaultValue: null,
        enterKey: function() {
            if (Main_values.Play_ChatForceDisable) {
                Play_showWarningMidleDialog(STR_CHAT_DISABLE, 1500);
                return;
            } else if (!AddUser_UserIsSet() || !AddUser_UsernameArray[0].access_token) {
                Play_showWarningMidleDialog(STR_NOKEY_CHAT_WARN, 1500);
                return;
            }

            if (PlayExtra_PicturePicture && !Play_isFullScreen) ChatLiveControls_ShowChooseChat();
            else ChatLiveControls_Show();

        }
    };

    Play_controls[Play_controlsChatSettings] = {
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "chat-settings",
        string: STR_CHAT_EXTRA,
        values: null,
        defaultValue: null,
        enterKey: function() {

            Play_PanelcounterBefore = Play_controlsChatSettings;
            Play_IconsRemoveFocus();
            Play_Panelcounter = Play_controlsBack;
            Play_SetControlsVisibility('ShowInChat');
            Play_IconsAddFocus();

        }
    };

    Play_controls[Play_controlsPlayerStatus] = {
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: 'status',
        string: STR_PLAYER_INFO_VISIBILITY,
        values: STR_PLAYER_INFO_VISIBILITY_ARRAY,
        defaultValue: Play_Status_Visible,
        updown: function(adder, PlayVodClip) {
            this.defaultValue += adder;

            if (this.defaultValue < 0) this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);

            Play_Status_Visible = this.defaultValue;

            Main_setItem('Play_Status_Visible', Play_Status_Visible);
            this.bottomArrows();

            Play_ShowPanelStatus(PlayVodClip);
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsPreview] = {
        ShowInLive: true,
        ShowInVod: true,
        ShowInClip: true,
        ShowInPP: true,
        ShowInMulti: true,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: true,
        icons: "preview",
        string: STR_PREVIEW_SET,
        values: null,
        defaultValue: null,
        enterKey: function() {

            Play_PanelcounterBefore = Play_controlsPreview;
            Play_IconsRemoveFocus();
            Play_Panelcounter = Play_controlsBack;

            Play_controls[Play_controlsPreviewEnable].defaultValue = Settings_Obj_default('show_feed_player');
            Play_controls[Play_controlsPreviewEnable].bottomArrows();

            Play_controls[Play_controlsPreviewSize].defaultValue = Settings_Obj_default('preview_sizes');
            Play_controls[Play_controlsPreviewSize].bottomArrows();

            Play_controls[Play_controlsPreviewVolume].defaultValue = Settings_Obj_default('preview_volume');
            Play_controls[Play_controlsPreviewVolume].bottomArrows();

            Play_controls[Play_controlsPreviewMainVolume].defaultValue = Settings_Obj_default('preview_others_volume');
            Play_controls[Play_controlsPreviewMainVolume].bottomArrows();

            Play_SetControlsVisibility('ShowInPreview');
            Play_IconsAddFocus();

        }
    };

    Play_controls[Play_controlsChatForceDis] = { //force disable chat
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-stop",
        string: STR_F_DISABLE_CHAT,
        values: null,
        defaultValue: null,
        enterKey: function(PlayVodClip) {
            Main_values.Play_ChatForceDisable = !Main_values.Play_ChatForceDisable;

            if (PlayVodClip === 1) {
                ChatLive_Init(0);
                if (PlayExtra_PicturePicture && !Play_isFullScreen && !Play_MultiEnable) ChatLive_Init(1);
            } else Chat_Init();

            this.setLable();
            Main_SaveValues();
        },
        setLable: function() {
            Main_textContent('extra_button_' + this.position, '(' +
                (Main_values.Play_ChatForceDisable ? STR_YES : STR_NO) + ')');
        },
    };

    Play_controls[Play_controlsChatDelay] = { //chat delay
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-delay",
        string: STR_CHAT_DELAY,
        values: [STR_DISABLED, STR_CHAT_DELAY_LATENCY_TO_BROADCASTER, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            20, 25, 30, 45, 60, 90, 120, 150, 180, 240, 300
        ],
        defaultValue: Play_ChatDelayPosition,
        isChat: false,
        updown: function(adder) {
            this.defaultValue += adder;

            if (this.defaultValue < 0) this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);

            Play_ChatDelayPosition = this.defaultValue > 1 ? (this.values[this.defaultValue] * 1000) : this.defaultValue;

            ChatLive_UpdateLatency();
            Main_setItem('Play_ChatDelayPosition', Play_ChatDelayPosition);
            this.bottomArrows();
            this.setLable();
        },
        setLable: function() {
            var stringSec = '';

            if (this.defaultValue > 2) stringSec = STR_SECONDS;
            else if (this.defaultValue > 1) stringSec = STR_SECOND;

            Main_textContentWithEle(this.doc_name, this.values[this.defaultValue] + stringSec);
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsChatPos] = { //chat position
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-pos",
        string: STR_CHAT_POS,
        values: STR_CHAT_BASE_ARRAY,
        defaultValue: Play_ChatPositions,
        isChat: true,
        updown: function(adder) {
            if (!Play_isChatShown() || Play_Multi_MainBig || (!Play_isFullScreen && PlayExtra_PicturePicture)) return;

            this.defaultValue += adder;
            if (this.defaultValue < 0)
                this.defaultValue = (this.values.length - 1);
            else if (this.defaultValue > (this.values.length - 1))
                this.defaultValue = 0;

            if (Play_isFullScreen || Play_MultiEnable) {

                Play_ChatPositions += adder;
                Play_ChatPosition();
                this.defaultValue = Play_ChatPositions;

            } else {

                Play_FullScreenPosition = this.defaultValue;
                Play_SetChatFullScreenKeyRight();

            }

            this.setLable();
            this.bottomArrows();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name, this.values[this.defaultValue]);
        },
        bottomArrows: function() {

            this.doc_up.classList.remove('hide');
            this.doc_down.classList.remove('hide');

            this.doc_up.style.opacity = "1";
            this.doc_down.style.opacity = "1";
        },
    };

    Play_controls[Play_controlsChatSize] = { //chat size
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-size",
        string: STR_CHAT_SIZE,
        values: ["12.5%", "25%", "50%", "75%", "100%"],
        defaultValue: Play_ChatSizeValue,
        isChat: true,
        updown: function(adder) {
            if (!Play_isChatShown() || Play_Multi_MainBig || (!Play_isFullScreen && PlayExtra_PicturePicture)) return;

            this.defaultValue += adder;

            if (this.defaultValue < 0)
                this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) {
                this.defaultValue = (this.values.length - 1);
                return;
            }

            this.bottomArrows();

            if (Play_isFullScreen || Play_MultiEnable) {

                Play_ChatSizeValue = this.defaultValue;

                if (Play_ChatSizeValue === (Play_MaxChatSizeValue - 1) && adder === -1) {
                    Play_ChatPositionConvert(false);
                } else if (Play_ChatSizeValue === Play_MaxChatSizeValue) Play_ChatPositionConvert(true);

                Play_ChatSize(true);

                Play_controls[Play_controlsChatPos].defaultValue = Play_ChatPositions;
            } else {

                Play_FullScreenSize = this.defaultValue;
                Play_SetChatFullScreenKeyLeft();

            }

            this.setLable();
        },
        setLable: function() {
            Main_textContentWithEle(
                Play_controls[Play_controlsChatPos].doc_name,
                Play_controls[Play_controlsChatPos].values[Play_controls[Play_controlsChatPos].defaultValue]
            );

            Main_textContentWithEle(
                this.doc_name,
                this.values[this.defaultValue]
            );
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsChatBright] = { //chat_brightness
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-brig",
        string: STR_CHAT_BRIGHTNESS,
        values: ["0%", "5%", "10%", "15%", "20%",
            "25%", "30%", "35%", "40%", "45%",
            "50%", "55%", "60%", "65%", "70%",
            "75%", "80%", "85%", "90%", "95%", "100%"
        ],
        defaultValue: Main_values.ChatBackground,
        isChat: true,
        updown: function(adder) {
            if (!Play_isChatShown() || (!Play_isFullScreen && !Play_MultiEnable) || Play_Multi_MainBig) return;

            this.defaultValue += adder;
            if (this.defaultValue < 0)
                this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);
            Main_values.ChatBackground = this.defaultValue;

            Play_ChatBackground = (this.defaultValue * 0.05).toFixed(2);
            Play_ChatBackgroundChange(false);

            this.setLable();
            this.bottomArrows();
            Main_SaveValues();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name,
                this.values[this.defaultValue]);
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsChatFont] = { //Chat font size
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: true,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "chat-font",
        string: STR_CHAT_FONT,
        values: Play_ChatFontObj,
        defaultValue: Main_values.Chat_font_size_new,
        isChat: true,
        updown: function(adder) {
            if (!Play_isChatShown()) return;

            this.defaultValue += adder;
            if (this.defaultValue < 0)
                this.defaultValue = 0;
            else if (this.defaultValue > (this.values.length - 1)) this.defaultValue = (this.values.length - 1);
            Main_values.Chat_font_size_new = this.defaultValue;

            Play_SetChatFont();
            this.bottomArrows();
            this.setLable();
            Main_SaveValues();
        },
        setLable: function() {
            Main_textContentWithEle(this.doc_name, this.values[this.defaultValue] + '%');
        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsAudioAll] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "speaker",
        string: STR_AUDIO_ALL,
        values: null,
        defaultValue: null,
        enterKey: function() {

            if (!Play_audio_enable_Before.length) {

                Play_audio_enable_Before = Main_Slice(Play_audio_enable);

            }

            Play_audio_enable = [1, 1, 1, 1];
            OSInterface_SetAudioEnabled();
            OSInterface_ApplyAudio();
            Play_controlsAudioUpdateicons();

            Play_showWarningMidleDialog(STR_AUDIO_ALL_ENA, 2000);

            Play_SetAudioIcon();

        }
    };

    Play_controls[Play_controlsAudio_Volume_100] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "levels",
        string: STR_AUDIO_ALL_100,
        values: null,
        defaultValue: null,
        enterKey: function() {

            Play_volumes = [100, 100, 100, 100];
            OSInterface_SetVolumes();
            OSInterface_ApplyAudio();
            Play_controlsAudioUpdateicons();

            Play_showWarningMidleDialog(STR_AUDIO_ALL_100_SET, 2000);

            Play_SetAudioIcon();
        }
    };

    Play_controls[Play_controlsAudioEna0] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "volume",
        string: '',
        values: [STR_DISABLE, STR_ENABLED],
        defaultValue: Play_audio_enable[0],
        updown: function(adder) {

            Play_controlsAudioEnaupdown(
                0,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioEnasetLable(
                0,
                PlayExtra_PicturePicture ? Play_data.data[1] : Play_MultiArray[0].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioVol0] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: 'vol-level-4',
        string: '',
        values: new Array(101),
        defaultValue: Play_volumes[0],
        updown: function(adder) {

            Play_controlsAudioVolupdown(
                0,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioVolupsetLable(
                0,
                PlayExtra_PicturePicture ? Play_data.data[1] : Play_MultiArray[0].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioEna1] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "volume",
        string: '',
        values: [STR_DISABLE, STR_ENABLED],
        defaultValue: Play_audio_enable[1],
        updown: function(adder) {

            Play_controlsAudioEnaupdown(
                1,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioEnasetLable(
                1,
                PlayExtra_PicturePicture ? PlayExtra_data.data[1] : Play_MultiArray[1].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioVol1] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: true,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: 'vol-level-4',
        string: '',
        values: new Array(101),
        defaultValue: Play_volumes[1],
        updown: function(adder) {

            Play_controlsAudioVolupdown(
                1,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioVolupsetLable(
                1,
                PlayExtra_PicturePicture ? PlayExtra_data.data[1] : Play_MultiArray[1].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };


    Play_controls[Play_controlsAudioEna2] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "volume",
        string: '',
        values: [STR_DISABLE, STR_ENABLED],
        defaultValue: Play_audio_enable[2],
        updown: function(adder) {

            Play_controlsAudioEnaupdown(
                2,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioEnasetLable(
                2,
                Play_MultiArray[2].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioVol2] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: 'vol-level-4',
        string: '',
        values: new Array(101),
        defaultValue: Play_volumes[2],
        updown: function(adder) {

            Play_controlsAudioVolupdown(
                2,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioVolupsetLable(
                2,
                Play_MultiArray[2].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioEna3] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: "volume",
        string: '',
        values: [STR_DISABLE, STR_ENABLED],
        defaultValue: Play_audio_enable[3],
        updown: function(adder) {

            Play_controlsAudioEnaupdown(
                3,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioEnasetLable(
                3,
                Play_MultiArray[3].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsAudioVol3] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: true,
        ShowInPreview: false,
        ShowInStay: false,
        icons: 'vol-level-4',
        string: '',
        values: new Array(101),
        defaultValue: Play_volumes[3],
        updown: function(adder) {

            Play_controlsAudioVolupdown(
                3,
                adder,
                this
            );

        },
        setLable: function() {

            Play_controlsAudioVolupsetLable(
                3,
                Play_MultiArray[3].data[1],
                this
            );

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position, true);
        },
    };

    Play_controls[Play_controlsPreviewEnable] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: true,
        ShowInStay: false,
        icons: 'preview',
        string: STR_PREVIEW_SHOW,
        values: [STR_NO, STR_YES],
        defaultValue: Settings_value.show_feed_player.defaultValue,
        updown: function(adder) {

            Play_PreviewUpDown('show_feed_player', this, adder);

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsPreviewSize] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: true,
        ShowInStay: false,
        icons: 'pp',
        string: STR_PREVIEW_SIZE_CONTROLS,
        values: STR_PREVIEW_SIZE_ARRAY,
        defaultValue: Settings_value.preview_sizes.defaultValue,
        updown: function(adder) {

            Play_PreviewUpDown('preview_sizes', this, adder);
            OSInterface_SetPreviewSize(Settings_Obj_default("preview_sizes"));

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };
    Play_controls[Play_controlsPreviewVolume] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: true,
        ShowInStay: false,
        icons: 'volume',
        string: STR_PREVIEW_VOLUME,
        values: Settings_GetVolumes(),
        defaultValue: Settings_value.preview_volume.defaultValue,
        updown: function(adder) {

            Play_PreviewUpDown('preview_volume', this, adder);
            OSInterface_SetPreviewAudio(Settings_Obj_default("preview_volume"));

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    Play_controls[Play_controlsPreviewMainVolume] = { //chat enable disable
        ShowInLive: false,
        ShowInVod: false,
        ShowInClip: false,
        ShowInPP: false,
        ShowInMulti: false,
        ShowInChat: false,
        ShowInAudioPP: false,
        ShowInAudioMulti: false,
        ShowInPreview: true,
        ShowInStay: false,
        icons: 'speaker',
        string: STR_PREVIEW_OTHERS_VOLUME,
        values: Settings_GetVolumes(),
        defaultValue: Settings_value.preview_others_volume.defaultValue,
        updown: function(adder) {

            Play_PreviewUpDown('preview_others_volume', this, adder);
            OSInterface_SetPreviewOthersAudio(Settings_Obj_default("preview_others_volume"));

        },
        bottomArrows: function() {
            Play_BottomArrows(this.position);
        },
    };

    var div, doc = Main_getElementById('controls_holder');

    for (var key in Play_controls) {
        div = document.createElement('div');
        div.className = 'controls_button_holder';
        div.setAttribute('id', 'controls_' + key);

        div.innerHTML = '<div id="controls_button_' + key +
            '" class="controls_button"><div id="controls_icon_' + key +
            '"><i class="pause_button3d icon-' + Play_controls[key].icons +
            '" ></i></div></div><div id="controls_button_text_' + key +
            '" class="extra_button_title_holder" style="opacity: 0;;"><div id="extra_button_title' +
            key + '" class="extra_button_title strokedeline" >' +
            Play_controls[key].string + '</div><div id="extra_button_' + key +
            '" class="extra_button_title strokedeline" >' +
            (Play_controls[key].values ? Play_SetControlsArrows(key) : STR_SPACE) + '</div></div></div>';

        doc.appendChild(div);
        Play_controlsSize++;
        Play_controls[key].position = key;

        Play_controls[key].visible = true;
        Play_controls[key].doc = div;
        Play_controls[key].doc_title = Main_getElementById('extra_button_title' + key);
        Play_controls[key].doc_name = Main_getElementById('controls_name_' + key);
        Play_controls[key].doc_up = Main_getElementById('control_arrow_up_' + key);
        Play_controls[key].doc_down = Main_getElementById('control_arrow_down' + key);
        Play_controls[key].button = Main_getElementById('controls_button_' + key);
        Play_controls[key].button_text = Main_getElementById('controls_button_text_' + key);

        if (Play_controls[key].bottomArrows) Play_BottomArrows(key);
        if (Play_controls[key].setLable) Play_controls[key].setLable();
    }

}

function Play_SetControlsArrows(key) {
    return '<div id="controls_arrows_' + key +
        '" style="font-size: 50%; display: inline-block; vertical-align: middle;"><div style="display: inline-block;"><div id="control_arrow_up_' +
        key + '" class="up"></div><div id="control_arrow_down' + key +
        '" class="down"></div></div></div>&nbsp;<div id="controls_name_' + key +
        '" class="arrows_text">' + Play_controls[key].values[Play_controls[key].defaultValue] + '</div>';
}

function Play_SetControlsVisibility(prop) {

    for (var key in Play_controls) {

        if (Play_controls[key][prop]) Play_BottomShow(key);
        else Play_BottomHide(key);

    }

}

function Play_KeyChatSizeChage() {
    Play_ChatSizeValue++;
    if (Play_ChatSizeValue > Play_MaxChatSizeValue) {
        Play_ChatSizeValue = 0;
        Play_ChatPositionConvert(false);
    } else if (Play_ChatSizeValue === Play_MaxChatSizeValue) Play_ChatPositionConvert(true);
    Play_ChatSize(true);
    Play_controls[Play_controlsChatSize].defaultValue = Play_ChatSizeValue;
    Play_controls[Play_controlsChatSize].bottomArrows();
    Play_controls[Play_controlsChatSize].setLable();
}

function Play_KeyChatPosChage() {
    Play_ChatPositions++;
    Play_ChatPosition();
    Play_controls[Play_controlsChatPos].defaultValue = Play_ChatPositions;
    Play_controls[Play_controlsChatPos].setLable();
}

function Play_BottomOptionsPressed(PlayVodClip) {
    if (Play_controls[Play_Panelcounter].enterKey) {
        Play_controls[Play_Panelcounter].enterKey(PlayVodClip);
    } else {
        Play_Resetpanel(PlayVodClip);
    }
}

function Play_Resetpanel(PlayVodClip) {
    Play_clearHidePanel();
    if (PlayVodClip === 1) Play_setHidePanel();
    else if (PlayVodClip === 2) PlayVod_setHidePanel();
    else if (PlayVodClip === 3) PlayClip_setHidePanel();
}

function Play_BottomUpDown(PlayVodClip, adder) {

    if (Play_controls[Play_Panelcounter].updown) {

        Play_controls[Play_Panelcounter].updown(adder, PlayVodClip);

    } else if (adder === 1 && (PlayVodClip > 1 || !Play_StayDialogVisible())) {

        PlayVod_PanelY--;
        Play_BottonIconsFocus();

    }

}

function Play_IconsAddFocus() {

    Main_AddClassWitEle(
        Play_controls[Play_Panelcounter].button,
        Play_BottonIcons_Focus_Class
    );

    Play_controls[Play_Panelcounter].button_text.style.opacity = "1";

    if (Play_controls[Play_Panelcounter].isChat && (!Play_isChatShown() || !Play_isFullScreen)) {

        Play_controls[Play_controlsChat].button_text.style.opacity = "1";

    } else if (Play_Panelcounter !== Play_controlsChat && !Play_controls[Play_Panelcounter].isChat) {

        Play_controls[Play_controlsChat].button_text.style.opacity = "0";

    }
}

function Play_IconsRemoveFocus() {
    Main_RemoveClassWithEle(
        Play_controls[Play_Panelcounter].button,
        Play_BottonIcons_Focus_Class
    );
    Play_controls[Play_Panelcounter].button_text.style.opacity = "0";
    //in case chat is disable and the warning is showing because some chat option was selected
    Play_controls[Play_controlsChat].button_text.style.opacity = "0";
}

function Play_BottomLeftRigt(PlayVodClip, adder, skipRemoveFocus) {

    if (!skipRemoveFocus) Play_IconsRemoveFocus();

    Play_Panelcounter += adder;

    if (Play_Panelcounter > Play_controlsSize) Play_Panelcounter = 0;
    else if (Play_Panelcounter < 0) Play_Panelcounter = Play_controlsSize;

    if (!Play_controls[Play_Panelcounter].visible) {
        Play_BottomLeftRigt(PlayVodClip, adder, true);
        return;
    }

    Play_IconsAddFocus();

}

function Play_BottomShow(position) {
    Play_controls[position].doc.style.display = '';
    Play_controls[position].visible = true;
}

function Play_BottomHide(position) {
    Play_controls[position].doc.style.display = 'none';
    Play_controls[position].visible = false;
}

function Play_BottomArrows(position, skip_name) {
    var doc_up = Play_controls[position].doc_up,
        doc_down = Play_controls[position].doc_down;

    if (Play_controls[position].values.length === 1) {
        doc_up.classList.add('hide');
        doc_down.classList.add('hide');
    } else if (!Play_controls[position].defaultValue) {
        doc_up.classList.remove('hide');
        doc_down.classList.remove('hide');

        doc_up.style.opacity = "1";
        doc_down.style.opacity = "0.2";
    } else if (Play_controls[position].defaultValue === (Play_controls[position].values.length - 1)) {
        doc_up.classList.remove('hide');
        doc_down.classList.remove('hide');

        doc_up.style.opacity = "0.2";
        doc_down.style.opacity = "1";
    } else {
        doc_up.classList.remove('hide');
        doc_down.classList.remove('hide');

        doc_up.style.opacity = "1";
        doc_down.style.opacity = "1";
    }

    if (!skip_name) {

        Main_textContentWithEle(
            Play_controls[position].doc_name,
            Play_controls[position].values[Play_controls[position].defaultValue]
        );

    }
}

function Play_showVodDialog(isFromVod) {
    Main_clearTimeout(Play_HideVodDialogId);
    Main_textContent("dialog_vod_text", isFromVod ? STR_VOD_HISTORY : STR_VOD_HISTORY_FORM_LIVE);
    Main_HideElementWithEle(Play_Controls_Holder);
    PlayVod_showPanel(false);
    Main_textContentWithEle(Play_info_quality, '');
    Main_innerHTML("dialog_vod_saved_text", STR_FROM + Play_timeMs(PlayVod_VodOffset * 1000));
    Main_ShowElement('dialog_vod_start');
}

var Play_BottonIcons_Pause;
var Play_BottonIcons_Next;
var Play_BottonIcons_Back;
var Play_BottonIcons_Progress;
var Play_BottonIcons_Next_Img_holder;
var Play_BottonIcons_End_img_holder;
var Play_BottonIcons_Next_img;
var Play_BottonIcons_Back_img;
var Play_BottonIcons_End_img;
var Play_BottonIcons_Progress_Steps;
var Play_BottonIcons_Progress_JumpTo;
var Play_BottonIcons_Progress_CurrentTime;
var Play_BottonIcons_Progress_Duration;
var Play_BottonIcons_Progress_PauseHolder;

var Play_StreamStatus;

var Play_BottonIcons_Focus_Class = 'progress_bar_div_focus';

var Play_BottonIcons_Next_name;
var Play_BottonIcons_Next_title;

var Play_BottonIcons_Back_name;
var Play_BottonIcons_Back_title;

var Play_BottonIcons_End_name;
var Play_BottonIcons_End_title;

var Play_Controls_Holder;

var Play_infoLiveTime;
var Play_infoWatchingTime;

var Play_infoPPLiveTime = [];
var Play_infoPPWatchingTime = [];

var Play_infoMultiLiveTime = [];
var Play_infoMultiWatchingTime = [];

var Play_info_quality;
var Play_info_div;
var Play_side_info_div;
var Play_dialog_warning_play_middle;
var Play_dialog_warning_play_middle_text;
var Play_dialog_warning_play;
var Play_dialog_warning_play_text;

var Play_pause_next_div;

function Play_BottonIconsSet() {
    Play_pause_next_div = Main_getElementById('pause_next_div');

    Play_dialog_warning_play_middle_text = Main_getElementById('dialog_warning_play_middle_text');
    Play_dialog_warning_play_middle = Main_getElementById('dialog_warning_play_middle');

    Play_dialog_warning_play_text = Main_getElementById('dialog_warning_play_text');
    Play_dialog_warning_play = Main_getElementById('dialog_warning_play');

    Play_info_div = Main_getElementById('playerinfo');
    Play_side_info_div = Main_getElementById('playsideinfo');
    Play_info_quality = Main_getElementById('stream_quality');

    Play_BottonIcons_Next_img = Main_getElementById('next_button_img');
    Play_BottonIcons_Back_img = Main_getElementById('back_button_img');
    Play_BottonIcons_End_img = Main_getElementById('end_button_img');

    Play_BottonIcons_Next_name = Main_getElementById('next_button_text_name');
    Play_BottonIcons_Next_title = Main_getElementById('next_button_text_title');

    Play_BottonIcons_Back_name = Main_getElementById('back_button_text_name');
    Play_BottonIcons_Back_title = Main_getElementById('back_button_text_title');

    Play_BottonIcons_End_name = Main_getElementById('end_next_button_text_name');
    Play_BottonIcons_End_title = Main_getElementById('end_next_button_text_title');

    Play_BottonIcons_Pause = Main_getElementById('pause_button');
    Play_BottonIcons_Next = Main_getElementById('next_button');
    Play_BottonIcons_Back = Main_getElementById('back_button');
    PlayClip_HideShowNextDiv = [Play_BottonIcons_Next, Play_BottonIcons_Back];
    Play_BottonIcons_Progress = Main_getElementById('progress_bar_div');
    Play_BottonIcons_Next_Img_holder = Main_getElementById('next_button_img_holder');
    Play_BottonIcons_End_img_holder = Main_getElementById('back_button_img_holder');
    Play_BottonIcons_Progress_Steps = Main_getElementById('progress_bar_steps');
    Play_BottonIcons_Progress_JumpTo = Main_getElementById('progress_bar_jump_to');
    Play_BottonIcons_Progress_CurrentTime = Main_getElementById('progress_bar_current_time');
    Play_BottonIcons_Progress_Duration = Main_getElementById('progress_bar_duration');
    Play_BottonIcons_Progress_PauseHolder = Main_getElementById('progress_pause_holder');

    Play_Controls_Holder = Main_getElementById('controls_holder');

    Play_StreamStatus = Main_getElementById('stream_status');

    Play_infoLiveTime = Main_getElementById('stream_live_time');
    Play_infoWatchingTime = Main_getElementById('stream_watching_time');

    Play_infoPPLiveTime[0] = Main_getElementById('stream_info_pp_livetime0');
    Play_infoPPLiveTime[1] = Main_getElementById('stream_info_pp_livetime1');
    Play_infoPPWatchingTime[0] = Main_getElementById('stream_info_pp_watching_time0');
    Play_infoPPWatchingTime[1] = Main_getElementById('stream_info_pp_watching_time1');

    for (var i = 0; i < 4; i++) {

        Play_infoMultiLiveTime[i] = {};

        Play_infoMultiLiveTime[i].small = Main_getElementById('stream_info_multi_livetime' + i);
        Play_infoMultiLiveTime[i].big = Main_getElementById('stream_info_multi_livetimebig' + i);

        Play_infoMultiWatchingTime[i] = {};

        Play_infoMultiWatchingTime[i].small = Main_getElementById('stream_info_multi_watching_time' + i);
        Play_infoMultiWatchingTime[i].big = Main_getElementById('stream_info_multi_watching_timebig' + i);
    }
}

function Play_BottonIconsResetFocus(skipInfo) {
    PlayVod_PanelY = 1;
    PlayClip_EnterPos = 0;
    Play_BottonIconsFocus(skipInfo);
}

function Play_BottonIconsFocus(skipInfo, checkjump) {

    if (PlayVod_PanelY < 0) {
        PlayVod_PanelY = 0;
        return;
    }

    Main_RemoveClassWithEle(Play_BottonIcons_Pause, Play_BottonIcons_Focus_Class);
    Main_RemoveClassWithEle(Play_BottonIcons_Next, Play_BottonIcons_Focus_Class);
    Main_RemoveClassWithEle(Play_BottonIcons_Back, Play_BottonIcons_Focus_Class);
    Main_RemoveClassWithEle(Play_BottonIcons_Progress, Play_BottonIcons_Focus_Class);
    Main_HideElementWithEle(Play_BottonIcons_Next_Img_holder);
    Main_HideElementWithEle(Play_BottonIcons_End_img_holder);

    if (!PlayVod_PanelY) { //progress_bar

        if (PlayClip_EnterPos) Main_RemoveClassWithEle(Play_BottonIcons_Progress, 'opacity_zero');

        Play_BottonIconsHide(1);
        Main_AddClassWitEle(Play_BottonIcons_Progress, Play_BottonIcons_Focus_Class);
        Play_IconsRemoveFocus();

        if (PlayVod_addToJump) {

            PlayVod_jumpTime(PlayVod_TimeToJump / Play_DurationSeconds);
            Play_BottonIcons_Progress_Steps.style.display = 'inline-block';

        }

    } else if (PlayVod_PanelY === 1) { //pause/next/back buttons


        if (!PlayClip_EnterPos) { //pause

            Play_BottonIconsShow(skipInfo);
            Main_AddClassWitEle(Play_BottonIcons_Pause, Play_BottonIcons_Focus_Class);

        } else if (PlayClip_EnterPos === 1) { //next

            Main_RemoveClassWithEle(Play_pause_next_div, 'opacity_zero');
            Play_BottonIconsHide(2);
            Main_ShowElementWithEle(Play_BottonIcons_Next_Img_holder);
            Main_AddClassWitEle(Play_BottonIcons_Next, Play_BottonIcons_Focus_Class);

        } else if (PlayClip_EnterPos === -1) { //back

            Main_RemoveClassWithEle(Play_pause_next_div, 'opacity_zero');
            Play_BottonIconsHide(2);
            Main_ShowElementWithEle(Play_BottonIcons_End_img_holder);
            Main_AddClassWitEle(Play_BottonIcons_Back, Play_BottonIcons_Focus_Class);

        }

        Play_IconsRemoveFocus();

        if (PlayVod_IsJumping && checkjump) Play_BottonIconsFocusResetProgress();

        Play_BottonIcons_Progress_Steps.style.display = 'none';

    } else if (PlayVod_PanelY === 2) { //botton icons

        if (PlayClip_EnterPos) Main_RemoveClassWithEle(Play_Controls_Holder, 'opacity_zero');

        Play_BottonIconsHide(0);
        Play_IconsAddFocus();
        Play_BottonIcons_Progress_Steps.style.display = 'none';

    }
}

function Play_BottonIconsFocusResetProgress() {

    var time = (OSInterface_gettime() / 1000);

    PlayVod_ProgresBarrUpdateNoAnimation(
        time > 1.5 ? (time + 1.5) : 0,
        Play_DurationSeconds,
        true
    );

}

function Play_BottonIconsHide(hideType) {

    if (!hideType) {

        Main_AddClassWitEle(Play_pause_next_div, 'opacity_zero');
        Main_AddClassWitEle(Play_BottonIcons_Progress, 'opacity_zero');

    } else if (hideType === 1) {

        Main_AddClassWitEle(Play_pause_next_div, 'opacity_zero');
        Main_AddClassWitEle(Play_Controls_Holder, 'opacity_zero');

    } else if (hideType === 2) {

        Main_AddClassWitEle(Play_Controls_Holder, 'opacity_zero');
        Main_AddClassWitEle(Play_BottonIcons_Progress, 'opacity_zero');

    }

    if (!Play_StayDialogVisible()) {
        Main_AddClassWitEle(Play_info_div, 'opacity_zero');

        if (!Play_Status_Visible) Main_HideElementWithEle(Play_side_info_div);
        else if (Play_Status_Visible === 1) Main_AddClassWitEle(Play_side_info_div, 'playsideinfofocus');

    }

}

function Play_BottonIconsShow(skipInfo) {

    Main_RemoveClassWithEle(Play_pause_next_div, 'opacity_zero');
    Main_RemoveClassWithEle(Play_info_div, 'opacity_zero');
    Main_RemoveClassWithEle(Play_Controls_Holder, 'opacity_zero');
    Main_RemoveClassWithEle(Play_BottonIcons_Progress, 'opacity_zero');

    if (!skipInfo) {

        if (!Play_Status_Visible) Main_ShowElementWithEle(Play_side_info_div);
        else if (Play_Status_Visible === 1) Main_RemoveClassWithEle(Play_side_info_div, 'playsideinfofocus');

    }
}


var Play_data_base = {
    data: [],
    isHost: false,
    DisplaynameHost: '',
    watching_time: 0,
    qualities: [],
    playlist: null,
    qualityPlaying: "Auto",
    quality: "Auto",
    AutoUrl: '',
    resultId: 0
};

var Play_data = JSON.parse(JSON.stringify(Play_data_base));
var PlayExtra_data = JSON.parse(JSON.stringify(Play_data_base));

var Play_data_old = JSON.parse(JSON.stringify(Play_data_base));
var PlayExtra_Save_data = JSON.parse(JSON.stringify(Play_data_base));
var PlayExtra_data_old = JSON.parse(JSON.stringify(Play_data_base));
var Play_MultiArray = [];
Play_MultiArray[0] = JSON.parse(JSON.stringify(Play_data_base));
Play_MultiArray[1] = JSON.parse(JSON.stringify(Play_data_base));
Play_MultiArray[2] = JSON.parse(JSON.stringify(Play_data_base));
Play_MultiArray[3] = JSON.parse(JSON.stringify(Play_data_base));

var Play_volumes = [100, 100, 100, 100];
var Play_audio_enable = [1, 0, 0, 0];

var Play_Status_Visible = 0;

function Play_PreStart() {
    Play_seek_previews = Main_getElementById('seek_previews');
    Play_seek_previews_img = new Image();
    Play_chat_container = Main_getElementById('chat_container0');
    Play_ProgresBarrElm = Main_getElementById('inner_progress_bar');
    Play_ProgresBarrBufferElm = Main_getElementById('inner_progress_bar_buffer');
    Play_PanneInfoDoclId = Main_getElementById('scene_channel_panel');
    Play_EndDialogElem = Main_getElementById('dialog_end_stream');
    Play_MultiDialogElem = Main_getElementById('dialog_multi');

    Play_ChatPositions = Main_getItemInt('ChatPositionsValue', 0);
    Play_ChatSizeValue = Main_getItemInt('ChatSizeValue', 4);
    Play_ChatEnable = Main_getItemBool('ChatEnable', false);
    Play_isFullScreen = Main_getItemBool('Play_isFullScreen', true);
    Play_ChatBackground = (Main_values.ChatBackground * 0.05).toFixed(2);
    Play_ChatDelayPosition = Main_getItemInt('Play_ChatDelayPosition', 0);
    Play_PicturePicturePos = Main_getItemInt('Play_PicturePicturePos', 4);
    Play_PicturePictureSize = Main_getItemInt('Play_PicturePictureSize', 2);

    Play_FullScreenSize = Main_getItemInt('Play_FullScreenSize', 3);
    Play_FullScreenPosition = Main_getItemInt('Play_FullScreenPosition', 1);
    Play_Status_Visible = Main_getItemInt('Play_Status_Visible', 0);

    Play_LowLatency = Main_getItemInt('Play_LowLatency', 0);

    if (Main_IsOn_OSInterface) {
        //TODO remove this after some app updates
        if (Play_PicturePictureSize > 4) {
            Play_PicturePictureSize = 0;
            Main_setItem('Play_PicturePictureSize', Play_PicturePictureSize);
        }
        OSInterface_mSetPlayerPosition(Play_PicturePicturePos);
        OSInterface_mSetPlayerSize(Play_PicturePictureSize);
        OSInterface_mSetlatency(Play_LowLatency);
        Settings_PP_Workaround();
        OSInterface_SetFullScreenPosition(Play_FullScreenPosition);
        OSInterface_SetFullScreenSize(Play_FullScreenSize);
        //OSInterface_SetCurrentPositionTimeout(PlayVod_RefreshProgressBarrTimeout / 2);
    }

    Play_SetQuality();

    var i = 25, max = 301;
    for (i; i < max; i++) {
        Play_ChatFontObj.push(i);
    }
    if (Main_values.Chat_font_size_new > (Play_ChatFontObj.length - 1)) Main_values.Chat_font_size_new = Play_ChatFontObj.length - 1;

    Play_MultiSetpannelInfo();

    Play_MakeControls();
    Play_ChatSize(false);
    Play_SetFullScreen(Play_isFullScreen);

    Play_ChatBackgroundChange(false);
    Play_SetChatFont();
    //set base strings that don't change

    var clientIdHeader = 'Client-ID';
    var AcceptHeader = 'Accept';
    var TwitchV5Json = 'application/vnd.twitchtv.v5+json';

    Main_Headers = [
        [clientIdHeader, AddCode_clientId],
        [AcceptHeader, TwitchV5Json],
        [Main_Authorization, null]
    ];

    Main_Headers_Backup = [
        [clientIdHeader, AddCode_backup_client_id],
        [AcceptHeader, TwitchV5Json],
        [Main_Authorization, null]
    ];

    Play_base_backup_headers_Array = [
        [clientIdHeader, Main_Headers_Backup[0][1]]
    ];

    Play_base_backup_headers = JSON.stringify(Play_base_backup_headers_Array);

    Main_base_string_header = JSON.stringify(
        [
            [clientIdHeader, AddCode_clientId],
            [AcceptHeader, TwitchV5Json]
        ]
    );
}