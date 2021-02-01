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

//Spacing for release maker not trow errors from jshint
var version = {
    VersionBase: '3.0',
    publishVersionCode: 298,//Always update (+1 to current value) Main_version_java after update publishVersionCode or a major update of the apk is released
    ApkUrl: 'https://github.com/fgl27/SmartTwitchTV/releases/download/298/SmartTV_twitch_3_0_298.apk',
    WebVersion: 'January 30 2020',
    WebTag: 56,//567Always update (+1 to current value) Main_version_web after update Main_minversion or a major update of the web part of the app
    changelog: [
        {
            title: "Apk Version 3.0.298 and Web Version January 30 2020",
            changes: [
                "General improves and bug fixes"
            ]
        },
        {
            title: "Apk Version 3.0.297 and Web Version January 28 2020",
            changes: [
                "Prevent to show wrong value for Latency to broadcaster, may take 5 to 30 seconds for the value correct it self after the next problem happens, only happens after a stream goes offline unintentionally and to prevent closing the stream Twitch keeps the stream open until the stream comes back, on this case for internal reason the clock generated by the server became delay with makes the value of the latency way too offsetted",
                "General improves and bug fixes"
            ]
        },
        {
            title: "Web Version January 22 2020",
            changes: [
                "Add new setting options 'Use rounded channel images' (disabled by default) to settings -> Interface customization's, color style, animations and related",
                "Improve live channels side panel looks",
                "General improves and bug fixes"
            ]
        },
        {
            title: "Web Version January 21 2020",
            changes: [
                "General improves and bug fixes"
            ]
        },
        {
            title: "Apk Version 3.0.295 to 3.0.296 and Web Version January 15 2020",
            changes: [
                "Add OLED Burn in protection option to Settings -> Interface customization's, color style, animations and related",
                "General performance improves and bug fixes"
            ]
        },
        {
            title: "Web Version January 09 2020",
            changes: [
                "General performance improves and bug fixes"
            ]
        }
    ]
};