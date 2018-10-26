var Main_ItemsLimitMax = 100;
var Main_ThumbPading = 7.5;
var Main_ThumbWidth = 1881; // window.innerWidth = 1920px - 2%  = 1881)
var ChannelClip_game = '';
var ChannelClip_views = '';
var ChannelClip_title = '';
var ChannelClip_playUrl = '';
var ChannelClip_createdAt = '';
var ChannelClip_language = '';

//Screens
var Clip;
var ChannelClip;
var AGameClip;
var Game;

var Base_obj = {
    posX: 0,
    posY: 0,
    row_id: 0,
    coloumn_id: 0,
    dataEnded: false,
    idObject: {},
    loadingData: false,
    itemsCount: 0,
    loadingDataTryMax: 5,
    loadingDataTimeout: 3500,
    MaxOffset: 0,
    offset: 0,
    emptyContent: false,
    itemsCountCheck: false,
    FirstLoad: false,
    row: 0,
    data: null,
    data_cursor: 0,
    ThumbPading: Main_ThumbPading,
    key_blue: function() {
        if (!Search_isSearching) Main_BeforeSearch = inUseObj.screen;
        Main_Go = Main_Search;
        Screens_exit();
        Main_SwitchScreen();
    },
    set_ThumbSize: function() {
        // on a 1881px screen size - 2%, ColoumnsCount = 3 and ThumbPading = 7.5, Main_ThumbWidth must result in 612px
        this.ThumbCssText = 'width: ' + parseInt((Main_ThumbWidth / this.ColoumnsCount) - (this.ThumbPading * 2)) + 'px; display: inline-block; padding: ' + this.ThumbPading + 'px;';
    }
};

var Base_Clip_obj = {
    ItemsLimit: Main_ItemsLimitVideo,
    ItemsReloadLimit: Main_ItemsReloadLimitVideo,
    ColoumnsCount: Main_ColoumnsCountVideo,
    addFocus: Main_addFocusVideo,
    cursor: null,
    periodPos: 2,
    period: ['day', 'week', 'month', 'all']
};

var Base_Game_obj = {
    ItemsLimit: Main_ItemsLimitGame,
    ItemsReloadLimit: Main_ItemsReloadLimitGame,
    ColoumnsCount: Main_ColoumnsCountGame,
    addFocus: Main_addFocusGame
};

function ScreensObj_InitClip() {
    Clip = Screens_assign({
        ids: Screens_ScreenIds('Clip'),
        table: 'stream_table_clip',
        screen: Main_Clip,
        base_url: 'https://api.twitch.tv/kraken/clips/top?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            this.url = this.base_url + '&period=' + this.period[this.periodPos - 1] +
                (this.cursor ? '&cursor=' + this.cursor : '') +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        concatenate: function(responseText) {
            if (this.data) {
                var tempObj = JSON.parse(responseText);
                this.cursor = tempObj._cursor;
                if (this.cursor === '') this.dataEnded = true;
                this.data = this.data.concat(tempObj.clips);
                inUseObj.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);
                this.cursor = this.data._cursor;
                if (this.cursor === '') this.dataEnded = true;

                this.data = this.data.clips;
                this.loadDataSuccess();
                inUseObj.loadingData = false;
            }
        },
        loadDataSuccess: Screens_loadDataSuccessClip,
        SetPeriod: function() {
            Main_innerHTML('top_bar_clip', STR_CLIPS + Main_UnderCenter(Main_Periods[this.periodPos - 1]));
            localStorage.setItem('Clip_periodPos', this.periodPos);
        },
        label_init: function() {
            this.SetPeriod();
            Main_AddClass('top_bar_clip', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
            Main_IconLoad('label_extra', 'icon-history', STR_SWITCH_CLIP + ' (C)');
            Main_ShowElement('label_extra');
        },
        label_exit: function() {
            Main_RestoreTopLabel();
            Main_RemoveClass('top_bar_clip', 'icon_center_focus');
            Main_IconLoad('label_refresh', 'icon-refresh', STR_REFRESH + STR_GUIDE);
            Main_HideElement('label_extra');
        },
        key_exit: function() {
            Screens_BasicExit(Main_Before);
        },
        key_channelup: function() {
            Main_Before = this.screen;
            Main_Go = Main_Live;
            Screens_exit();
            Main_SwitchScreen();
        },
        key_channeldown: function() {
            Main_Before = this.screen;
            Main_Go = Main_Vod;
            Screens_exit();
            Main_SwitchScreen();
        },
        key_play: function() {
            Main_OpenClip(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
        },
        key_yellow: function() {
            if (!this.loadingData) {
                this.periodPos++;
                if (this.periodPos > 4) this.periodPos = 1;
                this.SetPeriod();
                Screens_StartLoad();
            }
        },
        key_green: function() {
            Screens_exit();
            Main_GoLive();
        }
    }, Base_obj);

    Clip = Screens_assign(Clip, Base_Clip_obj);
    Clip.set_ThumbSize();
}

function ScreensObj_InitChannelClip() {
    ChannelClip = Screens_assign({
        ids: Screens_ScreenIds('ChannelClip'),
        table: 'stream_table_channel_clip',
        screen: Main_ChannelClip,
        base_url: 'https://api.twitch.tv/kraken/clips/top?channel=',
        set_url: function() {
            this.url = this.base_url + encodeURIComponent(Main_selectedChannel) +
                '&limit=' + Main_ItemsLimitMax + '&period=' +
                this.period[this.periodPos - 1] + (this.cursor ? '&cursor=' + this.cursor : '');
        },
        concatenate: function(responseText) {
            if (this.data) {
                var tempObj = JSON.parse(responseText);
                this.cursor = tempObj._cursor;
                if (this.cursor === '') this.dataEnded = true;

                this.data = this.data.concat(tempObj.clips);
                inUseObj.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);
                this.cursor = this.data._cursor;
                if (this.cursor === '') this.dataEnded = true;

                this.data = this.data.clips;
                this.loadDataSuccess();
                inUseObj.loadingData = false;
            }
        },
        loadDataSuccess: Screens_loadDataSuccessClip,
        SetPeriod: function() {
            Main_innerHTML('top_bar_game', STR_CLIPS + Main_Periods[this.periodPos - 1]);
            localStorage.setItem('ChannelClip_periodPos', this.periodPos);
        },
        label_init: function() {
            if (!Search_isSearching && ChannelContent_ChannelValue.Main_selectedChannel_id)
                ChannelContent_RestoreChannelValue();
            if (Main_selectedChannel !== this.lastselectedChannel) this.status = false;
            Main_cleanTopLabel();
            this.SetPeriod();
            Main_textContent('top_bar_user', Main_selectedChannelDisplayname);
            Main_IconLoad('label_switch', 'icon-history', STR_SWITCH_CLIP + STR_KEY_UP_DOWN);
            this.lastselectedChannel = Main_selectedChannel;
        },
        label_exit: Main_RestoreTopLabel,
        key_exit: function() {
            Screens_BasicExit(Main_ChannelContent);
        },
        key_channelup: function() {
            if (!this.loadingData) {
                this.periodPos++;
                if (this.periodPos > 4) this.periodPos = 1;
                this.SetPeriod();
                Screens_StartLoad();
            }
        },
        key_channeldown: function() {
            if (!this.loadingData) {
                this.periodPos--;
                if (this.periodPos < 1) this.periodPos = 4;
                this.SetPeriod();
                Screens_StartLoad();
            }
        },
        key_play: function() {
            Main_OpenClip(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
        },
        key_yellow: Main_showControlsDialog,
        key_green: function() {
            Screens_exit();
            Main_GoLive();
        },
        key_blue: function() {
            if (!Search_isSearching) {
                ChannelContent_SetChannelValue();
                Main_BeforeSearch = inUseObj.screen;
            }
            Main_Go = Main_Search;
            Screens_exit();
            Main_SwitchScreen();
        }
    }, Base_obj);

    ChannelClip = Screens_assign(ChannelClip, Base_Clip_obj);
    ChannelClip.set_ThumbSize();
}

function ScreensObj_InitAGameClip() {
    AGameClip = Screens_assign({
        ids: Screens_ScreenIds('AGameClip'),
        table: 'stream_table_a_game_clip',
        screen: Main_AGameClip,
        base_url: 'https://api.twitch.tv/kraken/clips/top?game=',
        set_url: function() {
            this.url = this.base_url + encodeURIComponent(Main_gameSelected) + '&limit=' + Main_ItemsLimitMax +
                '&period=' + this.period[this.periodPos - 1] + (this.cursor ? '&cursor=' + this.cursor : '') +
                (Main_ContentLang !== "" ? ('&language=' + Main_ContentLang) : '');
        },
        concatenate: function(responseText) {
            if (this.data) {
                var tempObj = JSON.parse(responseText);
                this.cursor = tempObj._cursor;
                if (this.cursor === '') this.dataEnded = true;
                this.data = this.data.concat(tempObj.clips);
                inUseObj.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);
                this.cursor = this.data._cursor;
                if (this.cursor === '') this.dataEnded = true;

                this.data = this.data.clips;
                this.loadDataSuccess();
                inUseObj.loadingData = false;
            }
        },
        loadDataSuccess: Screens_loadDataSuccessClip,
        SetPeriod: function() {
            Main_innerHTML('top_bar_game', STR_AGAME + Main_UnderCenter(STR_CLIPS +
                Main_Periods[this.periodPos - 1] + ': ' + Main_gameSelected));
            localStorage.setItem('AGameClip_periodPos', this.periodPos);
        },
        label_init: function() {
            this.SetPeriod();
            Main_AddClass('top_bar_game', 'icon_center_focus');
            Main_IconLoad('label_extra', 'icon-arrow-circle-left', STR_GOBACK);
            Main_IconLoad('label_switch', 'icon-history', STR_SWITCH_CLIP + STR_KEY_UP_DOWN);
            Main_ShowElement('label_extra');
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
            Main_innerHTML('top_bar_game', STR_GAMES);
            Main_IconLoad('label_switch', 'icon-switch', STR_SWITCH);
            Main_HideElement('label_extra');
        },
        key_exit: function() {
            Screens_BasicExit(Main_aGame);
        },
        key_channelup: function() {
            if (!this.loadingData) {
                this.periodPos++;
                if (this.periodPos > 4) this.periodPos = 1;
                this.SetPeriod();
                Screens_StartLoad();
            }
        },
        key_channeldown: function() {
            if (!this.loadingData) {
                this.periodPos--;
                if (this.periodPos < 1) this.periodPos = 4;
                this.SetPeriod();
                Screens_StartLoad();
            }
        },
        key_play: function() {
            Main_OpenClip(this.posY + '_' + this.posX, this.ids, Screens_handleKeyDown);
        },
        key_yellow: Main_showControlsDialog,
        key_green: function() {
            Screens_exit();
            Main_GoLive();
        }
    }, Base_obj);

    AGameClip = Screens_assign(AGameClip, Base_Clip_obj);
    AGameClip.set_ThumbSize();
}

function ScreensObj_InitGame() {
    Game = Screens_assign({
        ids: Screens_ScreenIds('Game'),
        table: 'stream_table_games',
        screen: Main_games,
        base_url: 'https://api.twitch.tv/kraken/games/top?limit=' + Main_ItemsLimitMax,
        set_url: function() {
            this.url = this.base_url + '&offset=' + this.offset;
        },
        concatenate: function(responseText) {
            if (this.data) {
                var tempObj = JSON.parse(responseText);

                this.MaxOffset = this.data._total;
                this.offset += 100;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.data = this.data.concat(tempObj.top);
                inUseObj.loadingData = false;
            } else {
                this.data = JSON.parse(responseText);

                this.MaxOffset = this.data._total;
                this.offset += 100;
                if (this.offset > this.MaxOffset) this.dataEnded = true;

                this.data = this.data.top;
                this.loadDataSuccess();
                inUseObj.loadingData = false;
            }
        },
        loadDataSuccess: Screens_loadDataSuccessGame,
        label_init: function() {
            Main_AddClass('top_bar_game', 'icon_center_focus');
        },
        label_exit: function() {
            Main_RemoveClass('top_bar_game', 'icon_center_focus');
        },
        key_exit: function() {
            if (Main_Go === Main_Before || Main_Before === Main_aGame || Main_Before === Main_Search) Screens_BasicExit(Main_Live);
            else Screens_BasicExit(Main_Before);
        },
        key_channelup: function() {
            Main_Before = this.screen;
            Main_Go = Main_Vod;
            Screens_exit();
            Main_SwitchScreen();
        },
        key_channeldown: function() {
            Main_Before = this.screen;
            Main_Go = Main_Featured;
            Screens_exit();
            Main_SwitchScreen();
        },
        key_play: function() {
            Main_gameSelected = document.getElementById(this.ids[5] + this.posY + '_' + this.posX).getAttribute(Main_DataAttribute);
            document.body.removeEventListener("keydown", Screens_handleKeyDown);
            Main_BeforeAgame = this.screen;
            Main_Go = Main_aGame;
            Main_BeforeAgameisSet = true;
            AGame_UserGames = false;
            Screens_exit();
            Main_SwitchScreen();
        },
        key_yellow: Main_showControlsDialog,
        key_green: function() {
            Screens_exit();
            Main_GoLive();
        }
    }, Base_obj);

    Game = Screens_assign(Game, Base_Game_obj);
    Game.set_ThumbSize();
}