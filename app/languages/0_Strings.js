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

// Keep this file named as (zero)*** so it loads first in release_maker
var STR_REFRESH;
var STR_SEARCH;
var STR_SETTINGS;
var STR_CONTROLS;
var STR_ABOUT;
var STR_HIDE;
var STR_SEARCH_EMPTY;
var STR_SEARCH_RESULT_EMPTY;
var STR_SWITCH;
var STR_SWITCH_USER;
var STR_SWITCH_VOD;
var STR_SWITCH_CLIP;
var STR_GO_TO;
var STR_USER;
var STR_LIVE;
var STR_GAMES;
var STR_PLAYING;
var STR_FOR;
var STR_WATCHING;
var STR_SINCE;
var STR_AGAME;
var STR_PLACEHOLDER_SEARCH;
var STR_PLACEHOLDER_OAUTH;
var STR_PLACEHOLDER_USER;
var STR_PLACEHOLDER_PRESS;
var STR_CHANNELS;
var STR_CHANNEL;
var STR_GOBACK;
var STR_IS_OFFLINE;
var STR_IS_SUB_ONLY;
var STR_REFRESH_PROBLEM;
var STR_NO;
var STR_FOR_THIS;
var STR_PLAYER_PROBLEM;
var STR_PAST_BROA;
var STR_PAST_HIGHL;
var STR_CLIPS;
var STR_CONTENT;
var STR_STREAM_ON;
var STR_DURATION;
var STR_VIEWS;
var STR_VIEWER;
var STR_EXIT_AGAIN;
var STR_EXIT_MESSAGE;
var STR_EXIT;
var STR_CLOSE;
var STR_MINIMIZE;
var STR_CANCEL;
var STR_NOT_LIVE;
var STR_LIVE_CHANNELS;
var STR_LIVE_HOSTS;
var STR_LIVE_GAMES;
var STR_USER_CHANNEL;
var STR_USER_ADD;
var STR_USER_REMOVE;
var STR_USER_ERROR;
var STR_USER_HOSTING;
var STR_USER_SET;
var STR_USER_MAKE_ONE;
var STR_USER_NUMBER_ONE;
var STR_ADD_USER_SH;
var STR_CLIP_DAY;
var STR_CLIP_WEEK;
var STR_CLIP_MONTH;
var STR_CLIP_ALL;
var STR_JUMP_TIME;
var STR_JUMP_T0;
var STR_JUMP_CANCEL;
var STR_JUMP_TIME_BIG;
var STR_SEC;
var STR_MIN;
var STR_HR;
var STR_SOURCE;
var STR_TWITCH_TV;
var STR_CLOSE_THIS;
var STR_CLOSE_THIS2;
var STR_CLOSE_THIS3;
var STR_PLAYER;
var STR_CHAT;
var STR_CURRENT_VERSION;
var STR_LATEST_VERSION;
var STR_CONTROLS_MAIN_2;
var STR_CONTROLS_MAIN_3;
var STR_CONTROLS_MAIN_4;
var STR_CONTROLS_MAIN_6;
var STR_CONTROLS_MAIN_10;
var STR_CONTROLS_MAIN_14;
var STR_ABOUT_INFO_1;
var STR_ABOUT_INFO_3;
var STR_ABOUT_INFO_4;
var STR_ABOUT_INFO_5;
var STR_ABOUT_INFO_6;
var STR_ABOUT_INFO_7;
var STR_ABOUT_INFO_8;
var STR_ABOUT_INFO_9;
var STR_ABOUT_INFO_10;
var STR_ABOUT_INFO_12;
var STR_ABOUT_INFO_13;
var STR_ABOUT_INFO_14;
var STR_ABOUT_INFO_15;
var STR_ABOUT_INFO_16;
var STR_ABOUT_INFO_17;
var STR_ABOUT_INFO_18;
var STR_ABOUT_INFO_19;
var STR_ABOUT_INFO_20;
var STR_CONTROLS_PLAY_1;
var STR_CONTROLS_PLAY_2;
var STR_CONTROLS_PLAY_3;
var STR_CONTROLS_PLAY_4;
var STR_CONTROLS_PLAY_5;
var STR_CONTROLS_PLAY_6;
var STR_CONTROLS_PLAY_7;
var STR_CONTROLS_PLAY_8;
var STR_CONTROLS_PLAY_9;
var STR_CONTROLS_PLAY_10;
var STR_CONTROLS_PLAY_11;
var STR_CONTROLS_PLAY_12;
var STR_CONTROLS_PLAY_14;
var STR_OAUTH_IN;
var STR_USER_CODE;
var STR_USER_CODE_OK;
var STR_KEY_BAD;
var STR_OAUTH_WRONG;
var STR_OAUTH_WRONG2;
var STR_FOLLOWING;
var STR_FOLLOW;
var STR_IS_SUB_NOOAUTH;
var STR_IS_SUB_NOT_SUB;
var STR_IS_SUB_IS_SUB;
var STR_OAUTH_FAIL;
var STR_NOKEY;
var STR_NOKEY_WARN;
var STR_RESET;
var STR_CLIP;
var STR_CHANNEL_CONT;
var STR_NET_DOWN;
var STR_NET_UP;
var STR_FOLLOWERS;
var STR_CANT_FOLLOW;
var STR_GAME_CONT;
var STR_YES;
var STR_REMOVE_USER;
var STR_PLACEHOLDER_PRESS_UP;
var STR_FOLLOW_GAMES;
var STR_USER_GAMES_CHANGE;
var STR_GUIDE;
var STR_MONTHS;
var STR_DAYS;
var STR_STARTED;
var STR_KEY_UP_DOWN;
var STR_VIDEOS;
var STR_REPLAY;
var STR_STREAM_END;
var STR_STREAM_END_EXIT;
var STR_FEATURED;
var STR_CREATED_AT;
var STR_OPEN_BROADCAST;
var STR_NO_BROADCAST;
var STR_NO_BROADCAST_WARNING;
var STR_NO_CHAT;
var STR_IS_NOW;
var STR_OPEN_HOST;
var STR_SETTINGS_PLAYER;
var STR_SETTINGS_BUFFER_SIZE;
var STR_SETTINGS_BUFFER_SIZE_SUMMARY;
var STR_SETTINGS_BUFFER_LIVE;
var STR_SETTINGS_BUFFER_VOD;
var STR_SETTINGS_BUFFER_CLIP;
var STR_SETTINGS_LANG;
var STR_LOADING_CHAT;
var STR_VOD_HISTORY;
var STR_FROM;
var STR_FROM_START;
var STR_CHAT_END;
var STR_RECENT;
var STR_VIWES;
var STR_NOKEY_VIDEO_WARN;
var STR_SWITCH_TYPE;
var STR_ENABLED;
var STR_DISABLED;
var STR_RESTORE_PLAYBACK;
var STR_RESTORE_PLAYBACK_SUMMARY;
var STR_CHAT_FONT;
var STR_OAUTH_FAIL_USER;
var STR_VIDEOS_ANIMATION;
var STR_SIDE_PANEL;
var STR_SIZE;
var STR_BRIGHTNESS;
var STR_FORBIDDEN;
var STR_JUMPING_STEP;
var STR_SECONDS;
var STR_MINUTE;
var STR_MINUTES;
var STR_RESTORE_PLAYBACK_WARN;
var STR_CLOCK_OFFSET;
var STR_APP_LANG;
var STR_CONTENT_LANG;
var STR_CONTENT_LANG_SUMMARY;
var STR_LANG_ALL;
var STR_NO_GAME;
var STR_ABOUT_INFO_2_SOURCE;
var STR_JUMP_BUFFER_WARNING;
var STR_CHAT_DISABLE;
var STR_CLIP_FAIL;
var STR_F_DISABLE_CHAT;
var STR_CHAT_BRIGHTNESS;
var STR_GOBACK_START;
var STR_PLAY_NEXT;
var STR_PLAY_ALL;
var STR_PLAY_NEXT_IN;
var STR_AUTO_PLAY_NEXT;
var STR_CONTROLS_MAIN_5;
var STR_SIDE_PANEL_SETTINGS;
var STR_UP;
var STR_LIVE_FEED;
var STR_NOKUSER_WARN;
var STR_END_DIALOG_SETTINGS;
var STR_END_DIALOG_SETTINGS_SUMMARY;
var STR_END_DIALOG_DISABLE;
var STR_CHAT_SIZE;
var STR_CHAT_POS;
var STR_CHAT_SIDE_FULL;
var STR_CHAT_SIDE;
var STR_SPEED;
var STR_QUALITY;
var STR_CHAT_VIDEO_MODE;
var STR_NORMAL;
var STR_AUTO;
var STR_DEF_QUALITY;
var STR_DEF_QUALITY_SUMMARY;
var STR_VERY_LOW;
var STR_LOW;
var STR_HIGH;
var STR_VERY_HIGH;
var STR_THUMB_RESOLUTION;
var STR_THUMB_RESOLUTION_SUMMARY;
var STR_PAYPAL_SUMMARY;
var STR_CHAT_DELAY;
var STR_SECOND;
var STR_GUIDE_EXTRA;
var STR_PLAYER_PROBLEM_2;
var STR_EXIT_AGAIN_PICTURE;
var STR_PLAYER_RESYNC;
var STR_PLAYER_BITRATE;
var STR_PLAYER_BITRATE_SUMMARY;
var STR_PLAYER_BITRATE_MAIN;
var STR_PLAYER_BITRATE_SMALL;
var STR_PLAYER_BITRATE_SUMMARY_ETC;
var STR_PLAYER_BITRATE_UNLIMITED;
var STR_PICTURE_LIVE_FEED;
var STR_AUDIO_SOURCE;
var STR_PICTURE_PICTURE;
var STR_PICTURE_CONTROLS1;
var STR_PICTURE_CONTROLS2;
var STR_PICTURE_CONTROLS3;
var STR_PICTURE_CONTROLS4;
var STR_PICTURE_CONTROLS5;
var STR_PICTURE_CONTROLS6;
var STR_PICTURE_CONTROLS7;
var STR_PICTURE_CONTROLS8;
var STR_PICTURE_CONTROLS9;
var STR_PICTURE_CONTROLS10;
var STR_PICTURE_CONTROLS11;
var STR_CHAT_5050;
var STR_CHAT_PP_SIDE_FULL;
var STR_PICTURE_CONTROLS12;
var STR_SINGLE_EXIT;
var STR_SINGLE_EXIT_SUMMARY;
var STR_USER_MY_CHANNEL;
var STR_NOW_LIVE_SHOW;
var STR_GLOBAL_FONT;
var STR_GLOBAL_FONT_SUMMARY;
var STR_MAIN_MENU;
var STR_USER_MENU;
var STR_CH_IS_OFFLINE;
var STR_SCREEN_COUNTER;
var STR_ROUND_IMAGES;
var STR_ROUND_IMAGES_SUMMARY;
var STR_SWITCH_POS;
var STR_SWITCH_POS_SUMMARY;
var STR_MAIN_USER;
var STR_USER_OPTION;
var STR_USER_TOP_LABLE;
var STR_USER_EXTRAS;
var STR_LOW_LATENCY;
var STR_LIVE_FEED_SORT;
var STR_LIVE_FEED_SORT_SUMMARY;
var STR_A_Z;
var STR_Z_A;
var STR_APP_ANIMATIONS;
var STR_LOW_LATENCY_SUMMARY;
var STR_CONTROLS_PLAY_13;
var STR_RUNNINGTIME;
var STR_410_ERROR;
var STR_410_FEATURING;
var STR_CLICK_UNFOLLOW;
var STR_CLICK_FOLLOW;
var STR_HOLD_UP;
var STR_TODAY;
var STR_DROOPED_FRAMES;
var STR_BUFFER_HEALT;
var STR_AVGMB;
var STR_NET_SPEED;
var STR_NET_ACT;
var STR_LATENCY;
var STR_WARNING;
var STR_ABOUT_PHONE;
var STR_CHAT_SHOW;
var STR_DPAD_POSTION;
var STR_DPAD_OPACITY;
var STR_BLOCKED_CODEC;
var STR_BLOCKED_CODEC_SUMMARY;
var STR_CODEC_DIALOG_TITLE;
var STR_SUPPORTED_CODEC;
var STR_MAX_RES;
var STR_MAX_BIT;
var STR_MAX_LEVEL;
var STR_MAX_FPS;
var STR_ONE_CODEC_ENA;
var STR_USER_LIVE;
var STR_PP_WORKAROUND;
var STR_PP_WORKAROUND_SUMMARY;
var STR_HISTORY;
var STR_WATCHED;
var STR_UNTIL;
var STR_SORTING;
var STR_DELETE_HISTORY;
var STR_NAME_A_Z;
var STR_NAME_Z_A;
var STR_GAME_A_Z;
var STR_GAME_Z_A;
var STR_VIWES_MOST;
var STR_VIWES_LOWEST;
var STR_NEWEST;
var STR_OLDEST;
var STR_PRESS_ENTER_D;
var STR_PRESS_ENTER_APPLY;
var STR_LIVE_VOD;
var STR_BACKUP;
var STR_DELETE_SURE;
var STR_CREATED_NEWEST;
var STR_CREATED_OLDEST;
var STR_THUMB_OPTIONS;
var STR_HISTORY_LIVE_DIS;
var STR_HISTORY_VOD_DIS;
var STR_HISTORY_CLIP_DIS;
var STR_OPEN_GAME;
var STR_OPEN_CHANNEL;
var STR_THUMB_OPTIONS_KEY;
var STR_CHECK_HISTORY;
var STR_DELETE_FROM_HISTORY;
var STR_REFRESH_DELETE;
var STR_THUMB_OPTIONS_TOP;
var STR_MAX_INSTANCES;
var STR_UNKNOWN;
var STR_PLAYER_MULTI_ALL;
var STR_REPLACE_MULTI;
var STR_REPLACE_MULTI_ENTER;
var STR_ALREDY_PLAYING;
var STR_STREAM_ERROR;
var STR_EXIT_AGAIN_MULTI;
var STR_MULTI_EMPTY;
var STR_4_WAY_MULTI;
var STR_CONTROLS_MULTI;
var STR_CONTROLS_MULTI_0;
var STR_CONTROLS_MULTI_1;
var STR_CONTROLS_MULTI_2;
var STR_CONTROLS_MULTI_3;
var STR_CONTROLS_MULTI_4;
var STR_CONTROLS_MULTI_5;
var STR_CONTROLS_MULTI_6;
var STR_FEED_END_DIALOG;
var STR_MULTI_TITLE;
var STR_BACK_USER_GAMES;
var STR_NO_LIVE_CONTENT;
var STR_BITCOIN_SUMMARY;
var STR_SHOW_FEED_PLAYER;
var STR_DISABLED_FEED_PLAYER_MULTI;
var STR_SIDE_PANEL_PLAYER_DELAY;
var STR_SIDE_PANEL_PLAYER_DELAY_SUMMARY;
var STR_START_AT_USER;
var STR_LAST_REFRESH;
var STR_PP_VOD;
var STR_SETTINGS_ACCESSIBILITY;
var STR_ACCESSIBILITY_WARN;
var STR_ACCESSIBILITY_WARN_EXTRA;
var STR_ACCESSIBILITY_WARN_EXTRA2;
var STR_AUTO_REFRESH;
var STR_PICTURE_CONTROLS13;
var STR_GUIDE_EXTRA2;
var STR_KEY_MEDIA_FF;
var STR_ENABLED_MAIN_MULTI;
var STR_MAIN_MULTI_BIG;
var STR_MAIN_WINDOW;
var STR_LOADING_FAIL;
var STR_CHAT_CONNECTED;
var STR_MULTI_MAIN_WINDOW;
var STR_PLAYER_LAG;
var STR_STREAM_ERROR_SMALL;
var STR_TOO_ERRORS;
var STR_PING;
var STR_PLAYER_SOURCE;
var STR_CONTROLS_MEDIA_FF;
var STR_VOD_MUTED;
var STR_NOW_BACKGROUND;
var STR_ABOUT_INFO_21;
var STR_ABOUT_INFO_22;
var STR_GIFT_SUB;
var STR_GIFT_ANONYMOUS;
var STR_CHAT_BANNED;
var STR_CHAT_WRITE;
var STR_PLACEHOLDER_CHAT;
var STR_CHAT_ROOMSTATE;
var STR_CHAT_NO_RESTRICTIONS;
var STR_CHAT_OPTIONS;
var STR_CHAT_DELL_ALL;
var STR_CHAT_TW_EMOTES;
var STR_CHAT_BTTV_GLOBAL;
var STR_CHAT_BTTV_STREAM;
var STR_CHAT_FFZ_GLOBAL;
var STR_CHAT_FFZ_STREAM;
var STR_CHAT_AT_STREAM;
var STR_CHAT_RESULT;
var STR_CHAT_SEND;
var STR_CHAT_EMOTE_EMPTY;
var STR_CHAT_FOLLOWER_ONLY;
var STR_CHAT_FOLLOWER_ONLY_USER_TIME;
var STR_CHAT_EMOTE_ONLY;
var STR_CHAT_CHOOSE;
var STR_CHAT_UNICODE_EMOJI;
var STR_CHAT_OPTIONS_TITLE;
var STR_CHAT_OPTIONS_KEYBOARD;
var STR_CHAT_OPTIONS_KEYBOARD_SUMMARY;
var STR_CHAT_OPTIONS_KEYBOARD_1;
var STR_CHAT_OPTIONS_KEYBOARD_2;
var STR_CHAT_OPTIONS_KEYBOARD_3;
var STR_CHAT_OPTIONS_EMOTE_SORT;
var STR_NOKEY_CHAT_WARN;
var STR_CHAT_OPTIONS_EMOTE_SORT_SUMMARY;
var STR_CHAT_OPTIONS_FORCE_SHOW;
var STR_CHAT_OPTIONS_FORCE_SHOW_SUMMARY;
var STR_CHAT_NOT_READY;
var STR_CHAT_REDEEMED_MESSAGE_HIGH;
var STR_CHAT_REDEEMED_MESSAGE_SUB;
var STR_SIDE_PANEL_PLAYER;
var STR_NOTIFICATION_OPT;
var STR_DPAD_OPT;
var STR_UI_SETTINGS;
var STR_APP_ANIMATIONS_SUMMARY;
var STR_VIDEOS_ANIMATION_SUMMARY;
var STR_SETTINGS_ACCESSIBILITY_SUMMARY;
var STR_START_AT_USER_SUMMARY;
var STR_AUTO_REFRESH_SUMMARY;
var STR_OPTIONS;
var STR_CHAT_HIGHLIGHT_STREAMER;
var STR_CHAT_HIGHLIGHT_USER;
var STR_CHAT_HIGHLIGHT_USER_SEND;
var STR_CHAT_SHOW_SUB;
var STR_CHAT_HIGHLIGHT_BIT;
var STR_CHAT_HIGHLIGHT_ACTIONS;
var STR_CHAT_HIGHLIGHT_ACTIONS_SUMMARY;
var STR_CHAT_INDIVIDUAL_BACKGROUND;
var STR_CHAT_INDIVIDUAL_BACKGROUND_SUMMARY;
var STR_CHAT_LOGGING;
var STR_CHAT_LOGGING_SUMMARY;
var STR_CHAT_HIGHLIGHT_REDEEMED;
var STR_CHAT_INDIVIDUAL_LINE;
var STR_BRIGHT_MODE;
var STR_DARK_MODE;
var STR_CHAT_NICK_COLOR;
var STR_CHAT_NICK_COLOR_SUMMARY;
var STR_OPEN_HOST_SETTINGS;
var STR_PING_WARNING;
var STR_PING_WARNING_SUMMARY;
var STR_SHOW_FEED_PLAYER_SUMMARY;
var STR_DISABLED_FEED_PLAYER_MULTI_SUMMARY;
var STR_CHECK_HOST;
var STR_ANONYMOUS_USER;
var STR_SCREEN_COUNTER_SUMMARY;
var STR_WARNINGS;
var STR_KEY_UP_TIMEOUT;
var STR_KEY_UP_TIMEOUT_SUMMARY;
var STR_CURRENT_THUMB_STYLE;
var STR_NEW_THUMB_STYLE;
var STR_COLOR_STYLE_TEXT;
var STR_SHADOWS;
var STR_COLORS;
var STR_RESULT;
var STR_SHADOWS_NONE;
var STR_SHADOWS_WHITE;
var STR_SHADOWS_GRAY;
var STR_SHADOWS_BLACK;
var STR_APPLY;
var STR_COLOR_TYPE;
var STR_STYLES;
var STR_ENTER;
var STR_COLOR_ARRAY;
var STR_STYLES_ARRAY;
var STR_ENTER_RGB;
var STR_THUMB_STYLE;
var STR_END_DIALOG_OPT;
var STR_OPEN_EXTERNAL_PLAYER;
var STR_CHAT_CLEAR_MSG;
var STR_CHAT_CLEAR_MSG_SUMMARY;
var STR_ABOUT_INFO_23;
var STR_ABOUT_INFO_24;
var STR_CONTROLS_ETC;
var STR_SHOW_SIDE_PLAYER;
var STR_PREVIEW_OTHERS_VOLUME;
var STR_PREVIEW_OTHERS_VOLUME_SUMMARY;
var STR_PREVIEW_SIZE;
var STR_PREVIEW_SIZE_SUMMARY;
var STR_PREVIEW_SIZE_ARRAY;
var STR_PREVIEW_VOLUME;
var STR_PREVIEW_VOLUME_SUMMARY;
var STR_SHOW_LIVE_PLAYER;
var STR_SHOW_VOD_PLAYER;
var STR_SHOW_VOD_PLAYER_WARNING;
var STR_PREVIEW_END;
var STR_SHOW_CLIP_PLAYER;
var STR_PREVIEW_ERROR_LOAD;
var STR_PREVIEW_ERROR_LINK;
var STR_PLAYER_LAG_ERRO;
var STR_PLAYER_ERROR;
var STR_PLAYER_ERROR_MULTI;
var STR_PREVIEW_CLIP_NEXT;
var STR_EMPTY;
var STR_VOD_HISTORY_FORM_LIVE;
var STR_VOD_HISTORY_BASE;
var STR_PREVIEW_VOD_DELETED;
var STR_CHAT_SIDE_ARRAY;
var STR_CHAT_BASE_ARRAY;
var STR_CHAT_100_ARRAY;
var STR_VOD_DIALOG;
var STR_VOD_DIALOG_SUMMARY;
var STR_VOD_DIALOG_START;
var STR_VOD_DIALOG_LAST;
var STR_VOD_DIALOG_SHOW;
var STR_PREVIEW_SIZE_SCREEN_ARRAY;
var STR_PREVIEW_SIZE_SCREEN;
var STR_PREVIEW_SIZE_SCREEN_SUMMARY;
var STR_NOW_BACKGROUND_SUMMARY;
var STR_NOTIFICATION_POS_ARRAY;
var STR_NOTIFICATION_POS;
var STR_STAY_OPEN;
var STR_STAY_OPEN_SUMMARY;
var STR_STAY_CHECK;
var STR_STAY_CHECKING;
var STR_STAY_CHECK_LAST;
var STR_STAY_IS_OFFLINE;
var STR_ALWAYS_STAY;
var STR_NOTIFICATION_REPEAT;
var STR_NOTIFICATION_REPEAT_SUMMARY;
var STR_CHAT_TIMESTAMP;
var STR_PLAYER_INFO_VISIBILITY_ARRAY;
var STR_OPEN_CHAT;
var STR_WAITING;
var STR_SOURCE_CHECK;
var STR_SOURCE_CHECK_SUMMARY;
var STR_AUTO_REFRESH_BACKGROUND;
var STR_AUTO_REFRESH_BACKGROUND_SUMMARY;
var STR_LOWLATENCY_ARRAY;
var STR_NOTIFICATION_SINCE;
var STR_NOTIFICATION_SINCE_SUMMARY;
var STR_IS_SUB_ONLY_ERROR;
var STR_VOD_SEEK;
var STR_VOD_SEEK_SUMMARY;
var STR_VOD_SEEK_MIN;
var STR_VOD_SEEK_MAX;
var STR_VOD_SEEK_TIME;
var STR_UP_LOCKED;
var STR_LOCKED;
var STR_CHAT_MESSAGE_DELETED;
var STR_CHAT_MESSAGE_DELETED_ALL;
var STR_CHAT_MESSAGE_DELETED_TIMEOUT;
var STR_IN_CHAT;
var STR_SHOW_IN_CHAT;
var STR_PLAYED;
var STR_CHAPTERS;
var STR_FROM_SIMPLE;
var STR_GENERAL_CUSTOM;
var STR_CHANNELS_MOST;
var STR_CHANNELS_LOWEST;
var STR_GAME_SORT;
var STR_CLOCK_OFFSET_SUMMARY;
var STR_SHOW_IN_CHAT_SUMMARY;
var STR_NOW_LIVE_GAME_SHOW;
var STR_TITLE_CHANGE_SHOW;
var STR_GAME_CHANGE_SHOW;
var STR_CHANGELOG;
var STR_FULL_CHANGELOG;
var STR_CHANGELOG_SUMMARY;
var STR_UPDATE;
var STR_UPDATE_CHECK;
var STR_UPDATE_CHANGELOG;
var STR_UPDATE_LATEST;
var STR_UPDATE_FAIL;
var STR_UPDATE_FAIL_DOWNLOAD;
var STR_UPDATE_CHECKING;
var STR_UPDATE_CHECKING_FAIL;
var STR_NO_UPDATES;
var STR_UPDATE_AVAILABLE;
var STR_WEB_UPDATE_AVAILABLE;
var STR_UPDATE_LAST_CHECK;
var STR_UPDATE_CHECK_SIDE;
var STR_UPDATE_OPT;
var STR_UPDATE_CHECK_FOR;
var STR_UPDATE_SHOW;
var STR_UPDATE_SHOW_ARRAY;
var STR_UPDATE_START;
var STR_UPDATE_ERROR;
var STR_DISABLE;
var STR_ENABLE;
var STR_LOWLATENCY_ENABLE_ARRAY;
var STR_QUALITY_MULTI;
var STR_QUALITY_MULTI_BIG;
var STR_PRESS_ENTER_TO_CHANGE;
var STR_LATENCY_TO_BROADCASTER;
var STR_CHAT_DELAY_LATENCY_TO_BROADCASTER;
var STR_CHAT_SEND_DELAY;
var STR_BLOCK_RES;
var STR_BLOCK_RES_SUMMARY;
var STR_BLOCK_RES_SUMMARY_EXTRA;
var STR_BLOCKED;
var STR_BLOCKED_NOT;
var STR_PLAYER_MAIN;
var STR_PLAYER_RES_MAIN;
var STR_PLAYER_RES_SMALL;
var STR_HIDE_PLAYER_CLOCK;
var STR_HIDE_MAIN_CLOCK;
var STR_HIDE_MAIN_SCREEN_TITLE;
var STR_HIDE_ETC_HELP_INFO;
var STR_HIDE_MAIN_SCREEN_TITLE_SUMMARY;
var STR_HIDE_ETC_HELP_INFO_SUMMARY;
var STR_INACTIVE_SETTINGS;
var STR_INACTIVE_SETTINGS_SUMMARY;
var STR_INACTIVE_WARNING;
var STR_REMAINING;
var STR_CHAT_EXTRA;
var STR_AUDIO_ALL;
var STR_AUDIO_ALL_100;
var STR_VOLUME;
var STR_AUDIO;
var STR_VOLUME_CONTROLS;
var STR_AUDIO_ALL_100_SET;
var STR_AUDIO_ALL_ENA;
var STR_QUALITY_PP;
var STR_PREVIEW_SHOW;
var STR_PREVIEW_SET;
var STR_PREVIEW_SIZE_CONTROLS;
var STR_PLAYER_INFO_VISIBILITY;
var STR_SHOW_IN_CHAT_VIEWERS;
var STR_SHOW_IN_CHAT_CHATTERS;
var STR_OLED_BURN_IN;
var STR_OLED_BURN_IN_SUMMARY;
var STR_DELETE_UNREACHABLE;
var STR_DELETE_UNREACHABLE_SUMMARY;
var STR_4_WAY_MULTI_INSTANCES;
var STR_PP_MODO;