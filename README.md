smarttv-twitch
==============

This is an application for Samsung SmartTV's designed to watch Twitch.tv broadcasts, A official Twitch.TV app is not availably for most TV, that is way this project exist.

The application is tested and fully support 4k and 1080p Samsung TV released on 2016 and up, if yours Smart Hub menu is different from the one below yours TV is probably not supported as it doesn't run Tizen version supported by the application.
![Live](https://bhb27.github.io/smarttv-twitch/screenshot/smarthub.jpeg)

Full support for all 2015 TV is under work, but there is a know bug from some TV FW running Tizen 2.3 that prevent the app from work, Samsung is revising the problems, once the proper support is available a new application will be added on the release page (https://github.com/bhb27/smarttv-twitch/releases/) informing the support.

In doubt [open a issue](https://github.com/bhb27/smarttv-twitch/issues/new) inform yours TV model, computer OS and problem, if is a installation problem share the fail LOG

## [How the application looks](https://github.com/bhb27/smarttv-twitch/tree/master/screenshot)
![Live](https://bhb27.github.io/smarttv-twitch/screenshot/animated.gif)

Twitch.TV authentication key
===============

![Add_key](https://bhb27.github.io/smarttv-twitch/screenshot/Add_key.png)

After setting up a user on the application you can add a Twitch.TV authentication key, to be able to fallow and access subscribed only past broadcast as described on the above screen shot. The key is generated on the bellow link through Twitch.TV web site, the link bellow is the same showed on the application screen.

## [Twitch.TV app for Samsung TV authorization page](http://tiny.cc/twitchkey)

About this fork
===============

I fork this from https://github.com/CazuzaCzz/smarttv-twitch/commits/tizen
The original fork is https://github.com/nikitakatchik/smarttv-twitch

I have started this project because the above repo of the app did not fully support my TV model, it had many bugs and the app did not had the main Twitch.TV featuring like a more complete users interface (For VOD, cips, Channel off line content etc), did not fully support the latest smart remote, the looks of the app was a little old-fashioned, etc...

So I work alone writing a new application from scratch focusing on performance and needed featuring, with the help of some users reporting bugs and featuring request, I add the many featuring and work all the bugs, today the application is very complete, can be easily used to watch all available Twitch content and give the user a lot of options, but is know that the application can be improve new featuring and improves are in works to give a better experience and more options to the user, but as today there is only one main developer working on the project the process is slow.

Project Dependencies
==============
* [imagesLoaded - JavaScript is all like "You images done yet or what?" by desandro](https://github.com/desandro/imagesloaded)
* [Font Awesome - The iconic font and CSS toolkit by FortAwesome](https://github.com/FortAwesome/Font-Awesome)
* [Video.js - HTML5 Video Player](https://github.com/videojs/video.js)
* [jQuery - fast, small, and feature-rich JavaScript library](https://code.jquery.com/jquery/)
* [UglifyJS is a JavaScript parser, minifier, compressor and beautifier toolkit](https://github.com/mishoo/UglifyJS2)
* [Samsung WebApi API - this module defines the functionalities that are provides as the Samsung TV for Tizen Platform Product API](http://developer.samsung.com/tv/develop/api-references/samsung-product-api-references/webapi-api)

Controls
==============
![control](https://bhb27.github.io/smarttv-twitch/screenshot/controler.png)

The Application is tested with the above remotes (Any Samsung remote that has those same key/function must control the app even if the remote looks is a little different)

The key **INFO** is also map on the app with the same functions as the **GUIDE** key, as some remotes may not have the **GUIDE** one.

## Bellow are the on screens controls
### To access the controls from any screen press key C or on smart remote press the 4 color buttons (color) after Directional pad down for yellow C


## Main controls
![Main](https://bhb27.github.io/smarttv-twitch/screenshot/controls_main_simple.png)
==============
## Player controls
![Players](https://bhb27.github.io/smarttv-twitch/screenshot/controls_play_simple.png)


Installation guide Tizen studio (tested on Linux ubuntu 16.04 and windows 10 64 bits)
==============

* Create a Samsung account if you don't have one and set it up as a developer account [SAMSUNG DEVELOPERS](http://developer.samsung.com/home.do)
* Log in with the developer account on the TV, open the application "APPS", hit number button (smart remote) and press the key sequence 12345, a new window will pop, enter your computer LAN IP address and make sure you click "On" to enable the developer mode, after pressing OK, reboot the TV by unplugging from power and plug back on. [Click here to read SAMSUNG Guide Connecting the TV and SDK](http://developer.samsung.com/tv/develop/getting-started/using-sdk/tv-device)
* [Download and install Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
* I used the **Tizen Studio 2.2 with IDE installer** (Any version above that must work well), download the 32/64 bit according to yours CPU architecture, on linux the file is a executable binary 480Mb size, give the file permission to execute, properties >  permission > Execute... mark, then just drag the file to a terminal window and click enter, **it may ask you to use apt-get to install missing dependencies**, on windows it is a .exe file around 480MB
* Install Java SDK, I install this app with **Oracle JDK java 8** on linux terminal commands below, on windows go to [Java SE Development Kit 8 Downloads
](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) download the latest version of jdk when this was tested it was "jdk-8u152-windows-x64.exe" for 64bit windows or "jdk-8u152-windows-i586.exe 32bits
"
#

	sudo add-apt-repository ppa:webupd8team/java
	sudo apt-get update
	sudo apt-get install oracle-java8-installer

#
* Press enter and Click OK/YES and accept all the requests from java installer on the terminal
* Open the tizen Package manager (on linux it may request you to use apt-get to install missing dependencies)
* Main page (Main SDK) Install Tizen SDK tools and all the etc under it (on linux it may request you to use apt-get to install missing dependencies)
* Extension SDK page Install everything (TV extensions-X.0 and all under, TV extensions Tools) (on linux it may request you to use apt-get to install missing dependencies)
* After everything finish installing close the package manager it will ask if you wanna to open the Tizen studio YES click open, if on windows it may request to add firewall permission for tizen give.
* Setting up the build environment...
* On the Tizen studio start the device manager by clicking on drop down menu that has a option by default "No target" and select "Launch remote device manager" if you don't find the device manager on the studio just open it as a separated app it must be installed just like the studio
* on device manager click + and add your TV IP address don't change the **Port**, to get the address go to main menu > network > Network status... wait a moment extra options will be loaded, click on **IP Settings** read yours TV IP Address
* Generate a certificate, back to Tizen studio > Tools > Certificate Manager > + > select/click **Tizen** > create a new author.. next > setup name password etc... next > Use the default Tizen... Finish > **Sucess** click OK
* Select the certificate it must have a **"V"** on the front of it (that means yo have select it) close the Certificate Manager
* Making the app, Top menu > File > New > Tizen Project > click twice in **Template** > click twice in **TV** > click twice in **Web Application** > click twice in **Basic Project** > chose a project name any name ....click finish
* Wait for it to load
* **[Download and extract the release_4_0_0.zip file Click here, this is the application recipe file](https://github.com/bhb27/smarttv-twitch/releases/download/4.0.0/release_4_0_0.zip)**
* Back on tizen studio, Left click on the folder symbol with **BasicProject-tv-samsung-X.0** on the left corner under project explorer just to select the folder(**BasicProject-tv-samsung-X.0** is the default name give when you created a project on the past step, if you change the name click on that)
* Top menu > **File** > Import > General > File System ... next > Browser to find the extracted folder from the release_X_X_X.zip ... > click Select All, mark Overwrite existing ... > Finish
* Wait for it to load
* The name of the folder **BasicProject-tv-samsung-X.0** changes to **BasicProject-tv-samsung-public-2.4**
* Click on that folder **BasicProject-tv-samsung-public-2.4** left click, then right click > Run as > **1 Tizen wen Application**, the installation will start
* If everything goes OK the app must automatic open in a few seconds on the TV and work
* If it fail during the instantiation make shore you don't have any other Twitch application installed on the TV, to uninstall the app manually, just open the **"apps"** application find all twitch app you have install in **"my app"** tab hold down the enter/select key on the top of the app and choose delete, after you have delete all twitch apps, try to install again.
* This app can update it self on 99% of the update cases, so this installation process will only be needed to be redone on a major update were the change are not possible to be done by the app it self, the app will warn the user the day there is a need to update manually and then will be necessary to redo the installation process.

## In doubt or a featuring request [open a issue](https://github.com/bhb27/smarttv-twitch/issues/new)

* If is a installation problem share the fail LOG and inform yours TV model, computer OS and detailed description of the problem.
* If is a featuring request try to detailed it a much as possible if is something you can screen shot share the pic.
