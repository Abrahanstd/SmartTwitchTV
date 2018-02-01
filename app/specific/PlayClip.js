/*jshint multistr: true */
function PlayClip() {

}
//Variable initialization

PlayClip.PlayerTime = 0;
PlayClip.streamCheck = null;
PlayClip.PlayerCheckCount = 0;
PlayClip.Canjump = false;
PlayClip.IsJumping = false;
PlayClip.jumpCount = 0;
PlayClip.JumpID = null;
PlayClip.TimeToJump = 0;
PlayClip.jumpCountMin = -12;
PlayClip.jumpCountMax = 12;

//Variable initialization end

PlayClip.Start = function() {
    webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
    Play.showBufferDialog();
    $("#scene2_quality").hide();
    Play.hideChat();
    $("#stream_info_icon").attr("src", Main.selectedChannelChannelLogo);
    $('#stream_info_name').text(Sclip.title);
    $("#stream_info_title").text(Main.selectedChannelDisplayname + ' ' + STR_PLAYING + Sclip.game);
    $("#stream_info_game").text(Sclip.views);
    $("#stream_live").text(Sclip.createdAt);
    $("#stream_info_livetime").text(Sclip.Duration);
    document.getElementById("stream_info_currentime").innerHTML = STR_WATCHING + Play.timeS(0);

    document.addEventListener('visibilitychange', PlayClip.Resume, false);
    PlayClip.streamCheck = window.setInterval(PlayClip.PlayerCheck, 500);
    PlayClip.Canjump = false;
    PlayClip.IsJumping = false;
    PlayClip.jumpCount = 0;
    PlayClip.TimeToJump = 0;
    PlayClip.jumpCountMin = -12;
    PlayClip.jumpCountMax = 12;

    window.setTimeout(function() {
        Play.videojs.src({
            type: "video/mp4",
            src: Sclip.playUrl
        });

        Play.videojs.ready(function() {
            this.isFullscreen(true);
            this.requestFullscreen();
            this.autoplay(true);

            this.on('ended', function() {
                PlayClip.shutdownStream();
            });

            this.on('timeupdate', function() {
                PlayClip.updateCurrentTime(this.currentTime());
            });

            this.on('error', function() {
                Play.HideBufferDialog();
                Play.showWarningDialog(STR_IS_OFFLINE);
                window.setTimeout(PlayClip.shutdownStream, 1500);
            });

            this.on('loadedmetadata', function() {
                PlayClip.Canjump = true;
            });

        });
    }, 1000);

};

PlayClip.Resume = function() {
    if (document.hidden) {
        PlayClip.shutdownStream();
        Play.offPlayer();
    }
};

PlayClip.PlayerCheck = function() {
    if (PlayClip.PlayerTime == Play.videojs.currentTime() && !Play.videojs.paused()) {
        PlayClip.PlayerCheckCount++;
        Play.showBufferDialog();
        if (PlayClip.PlayerCheckCount > 90) {
            PlayClip.PlayerCheckCount = 0;
            Play.HideBufferDialog();
            Play.showWarningDialog(STR_PLAYER_PROBLEM);
            window.setTimeout(PlayClip.shutdownStream, 1500);
        }
    }
    if (!Play.videojs.paused()) Play.videojs.play();
    PlayClip.PlayerTime = Play.videojs.currentTime();
};

PlayClip.shutdownStream = function() {
    Play.ClearPlayer();

    document.body.removeEventListener("keydown", PlayClip.handleKeyDown);
    document.removeEventListener('visibilitychange', PlayClip.Resume);
    $("#scene2_quality").show();
    PlayClip.hidePanel();

    Play.exitMain();

    window.clearInterval(PlayClip.streamCheck);
};

PlayClip.updateCurrentTime = function(currentTime) {
    if (Play.WarningDialogVisible() && !PlayClip.IsJumping) Play.HideWarningDialog();
    if (Play.BufferDialogVisible()) Play.HideBufferDialog();
    PlayClip.PlayerCheckCount = 0;
    PlayClip.Canjump = true;

    document.getElementById("stream_info_currentime").innerHTML = STR_WATCHING + Play.timeS(currentTime);
};

PlayClip.hidePanel = function() {
    PlayClip.clearHidePanel();
    $("#scene_channel_panel").hide();
};

PlayClip.showPanel = function() {
    Play.clock();
    $("#scene2_quality").hide();
    $("#scene_channel_panel").show();
    PlayClip.setHidePanel();
};

PlayClip.clearHidePanel = function() {
    window.clearTimeout(PlayClip.PanelHideID);
};

PlayClip.setHidePanel = function() {
    PlayClip.PanelHideID = window.setTimeout(PlayClip.hidePanel, 5000); // time in ms
};

PlayClip.jump = function() {
    if (!Play.videojs.paused()) Play.videojs.pause();
    Play.videojs.currentTime(PlayClip.TimeToJump);
    PlayClip.jumpCount = 0;
    PlayClip.jumpCountMin = -12;
    PlayClip.jumpCountMax = 12;
    PlayClip.IsJumping = false;
    PlayClip.Canjump = false;
    Play.videojs.play();
};

PlayClip.jumpStart = function() {
    window.clearTimeout(PlayClip.JumpID);
    PlayClip.IsJumping = true;
    var time = '',
        jumpTotime = '';

    if (PlayClip.jumpCount === 0) {
        PlayClip.TimeToJump = 0;
        PlayClip.jumpCountMin = -12;
        PlayClip.jumpCountMax = 12;
        Play.showWarningDialog(STR_JUMP_CANCEL);
        window.setTimeout(function() {
            PlayClip.IsJumping = false;
        }, 1500);
        return;
    } else if (PlayClip.jumpCount < 0) {
        if (PlayClip.jumpCount == -1) PlayClip.TimeToJump = -5;
        else if (PlayClip.jumpCount == -2) PlayClip.TimeToJump = -10;
        else if (PlayClip.jumpCount == -3) PlayClip.TimeToJump = -15;
        else if (PlayClip.jumpCount == -4) PlayClip.TimeToJump = -20;
        else if (PlayClip.jumpCount == -5) PlayClip.TimeToJump = -25;
        else if (PlayClip.jumpCount == -6) PlayClip.TimeToJump = -30;
        else if (PlayClip.jumpCount == -7) PlayClip.TimeToJump = -35;
        else if (PlayClip.jumpCount == -8) PlayClip.TimeToJump = -40;
        else if (PlayClip.jumpCount == -9) PlayClip.TimeToJump = -45;
        else if (PlayClip.jumpCount == -10) PlayClip.TimeToJump = -50;
        else if (PlayClip.jumpCount == -11) PlayClip.TimeToJump = -55;
        else PlayClip.TimeToJump = -60;

        time = PlayClip.TimeToJump + STR_SEC;

        jumpTotime = Play.videojs.currentTime() + PlayClip.TimeToJump;
        if (jumpTotime < 0) {
            PlayClip.jumpCountMin = PlayClip.jumpCount;
            jumpTotime = 0;
        }
        PlayClip.TimeToJump = jumpTotime;
        jumpTotime = Play.timeS(jumpTotime);
    } else {
        if (PlayClip.jumpCount == 1) PlayClip.TimeToJump = 5;
        else if (PlayClip.jumpCount == 2) PlayClip.TimeToJump = 10;
        else if (PlayClip.jumpCount == 3) PlayClip.TimeToJump = 15;
        else if (PlayClip.jumpCount == 4) PlayClip.TimeToJump = 20;
        else if (PlayClip.jumpCount == 5) PlayClip.TimeToJump = 25;
        else if (PlayClip.jumpCount == 6) PlayClip.TimeToJump = 30;
        else if (PlayClip.jumpCount == 7) PlayClip.TimeToJump = 35;
        else if (PlayClip.jumpCount == 8) PlayClip.TimeToJump = 40;
        else if (PlayClip.jumpCount == 9) PlayClip.TimeToJump = 45;
        else if (PlayClip.jumpCount == 10) PlayClip.TimeToJump = 50;
        else if (PlayClip.jumpCount == 11) PlayClip.TimeToJump = 55;
        else PlayClip.TimeToJump = 60;

        time = PlayClip.TimeToJump + STR_SEC;

        jumpTotime = Play.videojs.currentTime() + PlayClip.TimeToJump;
        if (jumpTotime > Sclip.DurationSeconds) {
            PlayClip.TimeToJump = 0;
            PlayClip.jumpCountMax = PlayClip.jumpCount;
            Play.showWarningDialog(STR_JUMP_CANCEL + STR_JUMP_TIME_BIG);
            PlayClip.JumpID = window.setTimeout(function() {
                PlayClip.jumpCountMax = 16;
                PlayClip.jumpCount = 0;
                PlayClip.IsJumping = false;
            }, 1500);
            return;
        } else {
            PlayClip.TimeToJump = jumpTotime;
            jumpTotime = Play.timeS(jumpTotime);
        }
    }

    Play.showWarningDialog(STR_JUMP_TIME + time + STR_JUMP_T0 + jumpTotime);
    PlayClip.JumpID = window.setTimeout(PlayClip.jump, 1500);
};

PlayClip.handleKeyDown = function(e) {
    switch (e.keyCode) {
        case TvKeyCode.KEY_LEFT:
            if (PlayClip.Canjump) {
                if (PlayClip.jumpCount > PlayClip.jumpCountMin) PlayClip.jumpCount--;
                PlayClip.jumpStart();
            }
            break;
        case TvKeyCode.KEY_RIGHT:
            if (PlayClip.Canjump) {
                if (PlayClip.jumpCount < PlayClip.jumpCountMax) PlayClip.jumpCount++;
                PlayClip.jumpStart();
            }
            break;
        case TvKeyCode.KEY_UP:
            if (!Play.isPanelShown()) {
                PlayClip.showPanel();
            }
            break;
        case TvKeyCode.KEY_DOWN:
            if (!Play.isPanelShown()) {
                PlayClip.showPanel();
            }
            break;
        case TvKeyCode.KEY_ENTER:
            if (!Play.isPanelShown()) {
                PlayClip.showPanel();
            }
            break;
        case TvKeyCode.KEY_RETURN:
            if (Play.isControlsDialogShown()) Play.HideControlsDialog();
            else if (Play.isPanelShown()) {
                PlayClip.hidePanel();
            } else {
                if (Play.ExitDialogVisible()) {
                    window.clearTimeout(Play.exitID);
                    $("#play_dialog_exit").hide();
                    window.setTimeout(PlayClip.shutdownStream, 10);
                } else {
                    Play.showExitDialog();
                }
            }
            break;
        case TvKeyCode.KEY_PLAY:
        case TvKeyCode.KEY_PAUSE:
        case TvKeyCode.KEY_PLAYPAUSE:
            Play.checkPause();
            break;
        case TvKeyCode.KEY_INFO:
        case TvKeyCode.KEY_CHANNELGUIDE:
            Play.hideChat();
            Play.ChatEnable = false;
            localStorage.setItem('ChatEnable', 'false');
            break;
        case TvKeyCode.KEY_YELLOW:
            Play.showControlsDialog();
            break;
        case TvKeyCode.KEY_BLUE:
            break;
        default:
            break;
    }
};
