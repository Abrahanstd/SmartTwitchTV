//Variable initialization
var AddCode_loadingDataTry = 0;
var AddCode_loadingDataTryMax = 5;
var AddCode_loadingDataTimeout = 10000;
var AddCode_Code = 0;
var AddCode_loadingData = false;
var AddCode_keyBoardOn = false;
var AddCode_IsFallowing = false;
var AddCode_IsSub = false;
var AddCode_PlayRequest = false;
var AddCode_input = '';
var AddCode_Channel_id = '';

var AddCode_redirect_uri = 'https://bhb27.github.io/smarttv-twitch/release/githubio/login/twitch.html';
var AddCode_client_secret = "zhd1wr8lxyz9snzo48rfb70r7vtod6";
var AddCode_UrlToken = 'https://id.twitch.tv/oauth2/token?';
//Variable initialization end

function AddCode_init() {
    Main_Go = Main_addCode;
    Main_AddClass('top_bar_user', 'icon_center_focus');
    Main_HideWarningDialog();
    AddCode_input = document.querySelector('#oauth_input');
    Main_AddCodeInput.placeholder = STR_PLACEHOLDER_OAUTH;
    Main_ShowElement('oauth_scroll');
    Main_innerHTML("oauth_text", STR_OAUTH_IN + AddUser_UsernameArray[Users_Position].name + STR_OAUTH_EXPLAIN);
    AddCode_inputFocus();
}

function AddCode_exit() {
    AddCode_RemoveinputFocus();
    document.body.removeEventListener("keydown", AddCode_handleKeyDown);
    Main_RemoveClass('top_bar_user', 'icon_center_focus');
    Main_HideElement('oauth_scroll');
}

function AddCode_handleKeyDown(event) {
    if (AddCode_loadingData || AddCode_keyBoardOn) return;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                Main_Go = Main_Users;
                AddCode_exit();
                Main_SwitchScreen();
            }
            break;
        case KEY_CHANNELUP:
            Main_Go = Main_games;
            AddCode_exit();
            Main_SwitchScreen();
            break;
        case KEY_CHANNELDOWN:
            Main_Go = Main_Live;
            AddCode_exit();
            Main_SwitchScreen();
            break;
        case KEY_PLAY:
        case KEY_PAUSE:
        case KEY_PLAYPAUSE:
        case KEY_ENTER:
            AddCode_inputFocus();
            break;
        case KEY_RED:
            Main_showSettings();
            break;
        case KEY_GREEN:
            AddCode_exit();
            Main_GoLive();
            break;
        case KEY_YELLOW:
            Main_showControlsDialog();
            break;
        case KEY_BLUE:
            Main_BeforeSearch = Main_Go;
            Main_Go = Main_Search;
            AddCode_exit();
            Main_SwitchScreen();
            break;
        default:
            break;
    }
}

function AddCode_inputFocus() {
    document.body.removeEventListener("keydown", AddCode_handleKeyDown);
    document.body.addEventListener("keydown", AddCode_KeyboardEvent, false);
    AddCode_input.addEventListener('input');
    AddCode_input.addEventListener('compositionend');
    Main_AddCodeInput.placeholder = STR_PLACEHOLDER_OAUTH;
    AddCode_input.focus();
    AddCode_keyBoardOn = true;
}

function AddCode_RemoveinputFocus() {
    AddCode_input.blur();
    document.body.removeEventListener("keydown", AddCode_KeyboardEvent);
    document.body.addEventListener("keydown", AddCode_handleKeyDown, false);
    Main_AddCodeInput.placeholder = STR_PLACEHOLDER_PRESS + STR_PLACEHOLDER_OAUTH;
    window.setTimeout(function() {
        AddCode_keyBoardOn = false;
    }, 250);
}

function AddCode_KeyboardEvent(event) {
    if (AddCode_loadingData) return;

    switch (event.keyCode) {
        case KEY_RETURN:
            if (Main_isAboutDialogShown()) Main_HideAboutDialog();
            else if (Main_isControlsDialogShown()) Main_HideControlsDialog();
            else {
                Main_Go = Main_Users;
                AddCode_exit();
                Main_SwitchScreen();
            }
            break;
        case KEY_KEYBOARD_DELETE_ALL:
            Main_AddCodeInput.value = '';
            event.preventDefault();
            break;
        case KEY_KEYBOARD_DONE:
        case KEY_KEYBOARD_CANCEL:
            if (Main_AddCodeInput.value !== '' && Main_AddCodeInput.value !== null) {

                AddCode_Code = Main_AddCodeInput.value;

                AddCode_TimeoutReset10();
                Main_HideElement('oauth_scroll');
                Main_showLoadDialog();
                AddCode_requestTokens();
            }
            AddCode_RemoveinputFocus();
            break;
        case KEY_KEYBOARD_BACKSPACE:
            Main_AddCodeInput.value = Main_AddCodeInput.value.slice(0, -1);
            event.preventDefault();
            break;
        case KEY_KEYBOARD_SPACE:
            Main_AddCodeInput.value += ' ';
            event.preventDefault();
            break;
        default:
            break;
    }
}

function AddCode_refreshTokens(position, tryes, callbackFunc) {
    console.log("refreshTokens");
    try {

        var xmlHttp = new XMLHttpRequest();

        var url = AddCode_UrlToken + 'grant_type=refresh_token&client_id=' +
            encodeURIComponent(Main_clientId) + '&client_secret=' + encodeURIComponent(AddCode_client_secret) +
            '&refresh_token=' + encodeURIComponent(AddUser_UsernameArray[position].refresh_token) +
            '&redirect_uri=' + AddCode_redirect_uri;

        xmlHttp.open("POST", url, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log(xmlHttp.responseText);
                if (xmlHttp.status === 200) {
                    AddCode_refreshTokensSucess(xmlHttp.responseText, position, callbackFunc);
                } else AddCode_refreshTokensError(position, tryes, callbackFunc);
                return;
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_refreshTokensError(position, tryes, callbackFunc);
    }
}

function AddCode_refreshTokensError(position, tryes, callbackFunc) {
    tryes++;
    if (tryes < AddCode_loadingDataTryMax) AddCode_refreshTokens(position, tryes, callbackFunc);
    else console.log("refreshTokensError error");
}

function AddCode_refreshTokensSucess(responseText, position, callbackFunc) {
    console.log("refreshTokensSucess");
    console.log(responseText);

    var response = JSON.parse(responseText);
    AddUser_UsernameArray[position].access_token = response.access_token;
    AddUser_UsernameArray[position].refresh_token = response.refresh_token;

    console.log("access_token = " + AddUser_UsernameArray[Users_Position].access_token);
    console.log("refresh_token = " + AddUser_UsernameArray[Users_Position].refresh_token);

    AddUser_SaveUserArray();
    if (callbackFunc) callbackFunc();
}

function AddCode_requestTokens() {
    console.log("requestTokens");
    try {

        var xmlHttp = new XMLHttpRequest();
        var url = AddCode_UrlToken + 'grant_type=authorization_code&client_id=' +
            encodeURIComponent(Main_clientId) + '&client_secret=' + encodeURIComponent(AddCode_client_secret) +
            '&code=' + encodeURIComponent(AddCode_Code) + '&redirect_uri=' + AddCode_redirect_uri;

        xmlHttp.open("POST", url, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log(xmlHttp.responseText);
                if (xmlHttp.status === 200) {
                    AddCode_requestTokensSucess(xmlHttp.responseText);
                } else AddCode_requestTokensError();
                return;
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_requestTokensError();
    }
}

function AddCode_requestTokensError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_requestTokens();
    } else console.log("requestTokensError error");
}

function AddCode_requestTokensSucess(responseText) {
    console.log("requestTokensSucess");
    console.log(responseText);

    var response = JSON.parse(responseText);
    AddUser_UsernameArray[Users_Position].access_token = response.access_token;
    AddUser_UsernameArray[Users_Position].refresh_token = response.refresh_token;

    console.log("access_token = " + AddUser_UsernameArray[Users_Position].access_token);
    console.log("refresh_token = " + AddUser_UsernameArray[Users_Position].refresh_token);

    AddUser_SaveUserArray();

    Main_HideLoadDialog();
    AddCode_exit();
    Users_init();
    AddCode_loadingData = false;
}

function AddCode_CheckFallow() {
    AddCode_TimeoutReset10();
    AddCode_IsFallowing = false;
    AddCode_RequestCheckFallow();
}

function AddCode_RequestCheckFallow() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/users/' + AddUser_UsernameArray[Users_Position].id + '/follows/channels/' + AddCode_Channel_id, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log(xmlHttp.responseText);
                if (xmlHttp.status === 200) { //yes
                    AddCode_IsFallowing = true;
                    AddCode_loadingData = false;
                    if (AddCode_PlayRequest) Play_setFallow();
                    else ChannelContent_setFallow();
                    return;
                } else if (xmlHttp.status === 404) { //no
                    if ((JSON.parse(xmlHttp.responseText).error + '').indexOf('Not Found') !== -1) {
                        AddCode_IsFallowing = false;
                        AddCode_loadingData = false;
                        if (AddCode_PlayRequest) Play_setFallow();
                        else ChannelContent_setFallow();
                        return;
                    } else AddCode_RequestCheckFallowError();
                } else { // internet error
                    AddCode_RequestCheckFallowError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_RequestCheckFallowError();
    }
}

function AddCode_RequestCheckFallowError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_RequestCheckFallow();
    } else {
        console.log('AddCode_RequestCheckFallowError else');
        AddCode_loadingData = false;
        if (AddCode_PlayRequest) Play_setFallow();
        else ChannelContent_setFallow();
    }
}

function AddCode_Fallow() {
    AddCode_TimeoutReset10();
    AddCode_FallowRequest();
}

function AddCode_FallowRequest() {
    console.log('AddCode_FallowRequest');
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("PUT", 'https://api.twitch.tv/kraken/users/' + AddUser_UsernameArray[Users_Position].id + '/follows/channels/' + AddCode_Channel_id, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        xmlHttp.setRequestHeader('Authorization', 'OAuth ' + AddUser_UsernameArray[Users_Position].access_token);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log('AddCode_FallowRequest responseText ' + xmlHttp.responseText);
                if (xmlHttp.status === 200) { //success user now is fallowing the channel
                    AddCode_loadingData = false;
                    AddCode_IsFallowing = true;
                    if (AddCode_PlayRequest) Play_setFallow();
                    else ChannelContent_setFallow();
                    return;
                } else if (xmlHttp.status === 401 || xmlHttp.status === 403) { //token expired
                    AddCode_refreshTokens(Users_Position, 0, AddCode_Fallow);
                    console.log('AddCode_FallowRequest bad token');
                } else {
                    AddCode_FallowRequestError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_FallowRequestError();
    }
}

function AddCode_FallowRequestError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_FallowRequest();
    }
}

function AddCode_UnFallow() {
    AddCode_TimeoutReset10();
    AddCode_UnFallowRequest();
}

function AddCode_UnFallowRequest() {
    console.log('AddCode_UnFallowRequest');
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("DELETE", 'https://api.twitch.tv/kraken/users/' + AddUser_UsernameArray[Users_Position].id + '/follows/channels/' + AddCode_Channel_id, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        xmlHttp.setRequestHeader('Authorization', 'OAuth ' + AddUser_UsernameArray[Users_Position].access_token);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log('AddCode_UnFallowRequest responseText ' + xmlHttp.responseText);
                if (xmlHttp.status === 204) { //success user is now not fallowing the channel
                    AddCode_IsFallowing = false;
                    AddCode_loadingData = false;
                    if (AddCode_PlayRequest) Play_setFallow();
                    else ChannelContent_setFallow();
                    return;
                } else if (xmlHttp.status === 401 || xmlHttp.status === 403) { //token expired
                    AddCode_refreshTokens(Users_Position, 0, AddCode_UnFallow);
                    console.log('AddCode_FallowRequest bad token');
                } else {
                    AddCode_UnFallowRequestError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_UnFallowRequestError();
    }
}

function AddCode_UnFallowRequestError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_UnFallowRequest();
    }
}

function AddCode_CheckSub() {
    AddCode_TimeoutReset10();
    AddCode_IsSub = false;
    AddCode_RequestCheckSub();
}

function AddCode_TimeoutReset10() {
    AddCode_loadingDataTry = 0;
    AddCode_loadingDataTimeout = 10000;
    AddCode_loadingData = true;
}

function AddCode_RequestCheckSub() {
    console.log('AddCode_RequestCheckSub');
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken/users/' + AddUser_UsernameArray[Users_Position].id + '/subscriptions/' + AddCode_Channel_id, true);
        xmlHttp.timeout = AddCode_loadingDataTimeout;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.setRequestHeader(Main_AcceptHeader, Main_TwithcV5Json);
        xmlHttp.setRequestHeader('Authorization', 'OAuth ' + AddUser_UsernameArray[Users_Position].access_token);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log('AddCode_RequestCheckSub responseText ' + xmlHttp.responseText);
                if (xmlHttp.status === 200) { //success yes user is a SUB
                    AddCode_IsSub = true;
                    AddCode_loadingData = false;
                    PlayVod_isSub();
                    return;
                } else if (xmlHttp.status === 422) { //channel does not have a subscription program
                    console.log('channel does not have a subscription program');
                    AddCode_IsSub = false;
                    AddCode_loadingData = false;
                    PlayVod_NotSub();
                } else if (xmlHttp.status === 404) { //success no user is not a sub
                    if ((JSON.parse(xmlHttp.responseText).error + '').indexOf('Not Found') !== -1) {
                        AddCode_IsSub = false;
                        AddCode_loadingData = false;
                        PlayVod_NotSub();
                        return;
                    } else AddCode_RequestCheckSubError();
                } else if (xmlHttp.status === 401 || xmlHttp.status === 403) { //token expired
                    AddCode_refreshTokens(Users_Position, 0, AddCode_CheckSub);
                    console.log('AddCode_FallowRequest bad token');
                } else { // internet error
                    AddCode_RequestCheckSubError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_RequestCheckSubError();
    }
}

function AddCode_RequestCheckSubError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_RequestCheckSub();
    } else {
        AddCode_IsSub = false;
        AddCode_loadingData = false;
        PlayVod_NotSub();
    }
}

function AddCode_CheckTokenStart(position) {
    AddCode_TimeoutReset10();
    AddCode_CheckToken(position, 0);
}

function AddCode_CheckToken(position, tryes) {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/kraken?oauth_token=' + AddUser_UsernameArray[position].access_token, true);
        xmlHttp.timeout = 10000;
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (!JSON.parse(xmlHttp.responseText).token.valid) {
                        AddCode_TimeoutReset10();
                        AddCode_refreshTokens(position, 0, null);
                    }
                    return;
                } else if (xmlHttp.status === 400) {
                    AddCode_TimeoutReset10();
                    AddCode_refreshTokens(position, 0, null);
                } else AddCode_CheckTokenError(position, tryes);
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_CheckTokenError(position, tryes);
    }
}

function AddCode_CheckTokenError(position, tryes) {
    tryes++;
    if (tryes < AddCode_loadingDataTryMax) AddCode_CheckToken(position, tryes);
    else console.log('AddCode_CheckTokenError error');
}

function AddCode_FallowGame() {
    AddCode_TimeoutReset10();
    AddCode_RequestFallowGame();
}

function AddCode_RequestFallowGame() {
    console.log('AddCode_RequestFallowGame');
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("PUT", 'https://api.twitch.tv/api/users/' + AddUser_UsernameArray[Users_Position].name + '/follows/games/' + encodeURIComponent(Main_gameSelected) +
            '?oauth_token=' + AddUser_UsernameArray[Users_Position].access_token, true);
        xmlHttp.timeout = 10000;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                console.log('AddCode_RequestFallowGame xmlHttp.readyState ' + xmlHttp.responseText);
                if (xmlHttp.status === 200) { //success we now fallow the game
                    AGame_fallowing = true;
                    AGame_setFallow();
                    return;
                } else if (xmlHttp.status === 401 || xmlHttp.status === 403) { //token expired
                    AddCode_refreshTokens(Users_Position, 0, AddCode_FallowGame);
                    console.log('AddCode_FallowRequest bad token');
                } else { // internet error
                    AddCode_FallowGameRequestError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_FallowGameRequestError();
    }
}

function AddCode_FallowGameRequestError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_RequestFallowGame();
    }
}

function AddCode_UnFallowGame() {
    AddCode_TimeoutReset10();
    AddCode_RequestUnFallowGame();
}

function AddCode_RequestUnFallowGame() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("DELETE", 'https://api.twitch.tv/api/users/' + AddUser_UsernameArray[Users_Position].name +
            '/follows/games/' + encodeURIComponent(Main_gameSelected) + '?oauth_token=' +
            AddUser_UsernameArray[Users_Position].access_token, true);
        xmlHttp.timeout = 10000;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            console.log('AddCode_RequestUnFallowGame xmlHttp.readyState ' + xmlHttp.responseText);
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 204) { // success we now unfallow the game
                    AGame_fallowing = false;
                    AGame_setFallow();
                    return;
                } else if (xmlHttp.status === 401 || xmlHttp.status === 403) { //token expired
                    AddCode_refreshTokens(Users_Position, 0, AddCode_UnFallowGame);
                    console.log('AddCode_FallowRequest bad token');
                } else { // internet error
                    AddCode_UnFallowGameRequestError();
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_UnFallowGameRequestError();
    }
}

function AddCode_UnFallowGameRequestError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_RequestUnFallowGame();
    }
}

function AddCode_CheckFallowGame() {
    AddCode_TimeoutReset10();
    AddCode_RequestCheckFallowGame();
}

function AddCode_RequestCheckFallowGame() {
    try {

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", 'https://api.twitch.tv/api/users/' + AddUser_UsernameArray[Users_Position].name + '/follows/games/' + encodeURIComponent(Main_gameSelected), true);
        xmlHttp.timeout = 10000;
        xmlHttp.setRequestHeader(Main_clientIdHeader, Main_clientId);
        xmlHttp.ontimeout = function() {};

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) { //success yes user fallows
                    AGame_fallowing = true;
                    AGame_setFallow();
                    return;
                } else if (xmlHttp.status === 404) { //success no user doesnot fallows
                    AGame_fallowing = false;
                    AGame_setFallow();
                    return;
                } else { // internet error
                    AddCode_CheckFallowGameError();
                    return;
                }
            }
        };

        xmlHttp.send(null);
    } catch (e) {
        AddCode_CheckFallowGameError();
    }
}

function AddCode_CheckFallowGameError() {
    AddCode_loadingDataTry++;
    if (AddCode_loadingDataTry < AddCode_loadingDataTryMax) {
        AddCode_loadingDataTimeout += 500;
        AddCode_RequestCheckFallowGame();
    } else {
        AGame_fallowing = false;
        AGame_setFallow();
    }
}