const PLAYSTR 		= "Play";
const STOPSTR 		= "Stop";
const PINSTR 		= "Pin";
const UNPINSTR 		= "Unpin";
const MUTESTR		= "Mute";
const UNMUTESTR		= "Unmute";
const CLOSESTR 		= "Close";
const RELOADSTR		= "Reload";

async function getActivePlaying(){
	let playing = await browser.tabs.query({audible: true});
	if (playing.length == 1){
		return playing[0];
	}
	let tabs = await browser.tabs.query({url: "*://*.youtube.com/watch*"});
	for (let tab of tabs) {
		return tab;
	}
}

function simulatePlay(){
	getActivePlaying().then(function(tab){
		browser.tabs.executeScript(tab.id, {
			code: `document.getElementsByClassName("video-stream")[0].click()`
		}).then(function(){
			if (document.getElementById('play').innerHTML == STOPSTR)
				document.getElementById('play').innerHTML = PLAYSTR;
			else
				document.getElementById('play').innerHTML = STOPSTR;
		});
	});
}

function pinTab(){
	getActivePlaying().then(function(tab){
		browser.tabs.update(tab.id, {pinned:!tab.pinned})
		.then(function(){
			if (tab.pinned)
				document.getElementById('pin').innerHTML = PINSTR;
			else
				document.getElementById('pin').innerHTML = UNPINSTR;
		});
	});
}

function reloadTab(){ getActivePlaying().then(function(tab){ browser.tabs.reload(tab.id, {bypassCache: true}); }); }

function muteTab(){
	getActivePlaying().then(function(tab){
		browser.tabs.update(tab.id, {muted:!tab.mutedInfo.muted})
		.then(function(){
			if (tab.mutedInfo.muted) document.getElementById('mute').innerHTML = MUTESTR;
			else document.getElementById('mute').innerHTML = UNMUTESTR;
		});
	});
}

function closeTab(){ getActivePlaying().then(function(tab){ browser.tabs.remove(tab.id); }); }

/*function pip(){
	getActivePlaying().then(function(tab){
		browser.tabs.executeScript(tab.id, {
			code: `document.getElementsByClassName("video-stream")[0].requestPictureInPicture()`
		});
	});
}*/
function closeTab(){ getActivePlaying().then(function(tab){ browser.tabs.remove(tab.id); }); }

(function setupDisplay() {
	getActivePlaying().then(function(tab){
		document.getElementById('myHeading').style.color = 'red';
		if (tab == undefined){
			document.getElementById('body').innerHTML = "No supported tab found...";
			document.getElementById('myHeading').innerHTML = "Media Controller";
			return;
		}
		var title = tab.title.replace(" - YouTube", "").replace(/\(([^)]+)\)/, "");
		var videoId = tab.url;
		if (videoId.includes("&")) videoId = videoId.split("&")[0];
		videoId = videoId.split("=")[1];

		var thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

		browser.theme.getCurrent().then(function(theme){
			document.body.style.backgroundImage = `linear-gradient(
    		  ${theme.colors.popup}, rgba(0, 0, 0, 0.7)
   			 ),url('${thumbnailUrl}')`;
			
			document.getElementById('myHeading').style.color = theme.colors.popup_text;
			document.getElementById('body').style.color = theme.colors.popup_text;
			var buttons = document.getElementsByTagName('button');
			for (var button in buttons){
				button.color = theme.colors.popup_text;
				button.backgroundColor = theme.colors.popup;
			}
		});

		
		document.getElementById('body').innerHTML = videoId;
		document.getElementById('myHeading').innerHTML = title;
		if (tab.audible)document.getElementById('play').innerHTML = STOPSTR;
		else document.getElementById('play').innerHTML = PLAYSTR;

		if (tab.pinned)	document.getElementById('pin').innerHTML = UNPINSTR;
		else document.getElementById('pin').innerHTML = PINSTR;

		if (tab.muted) document.getElementById('mute').innerHTML = UNMUTESTR;
		else document.getElementById('mute').innerHTML = MUTESTR;

		document.getElementById('reload').innerHTML = RELOADSTR;
		document.getElementById('close').innerHTML = CLOSESTR;
		
	});

	
	document.getElementById('play').addEventListener("click", simulatePlay);
	document.getElementById('pin').addEventListener("click", pinTab);
	document.getElementById('mute').addEventListener("click", muteTab);
	document.getElementById('reload').addEventListener("click", reloadTab);
	document.getElementById('close').addEventListener("click", closeTab);
	//document.getElementById('pip').addEventListener("click", pip);

	/*browser.menus.create({
		id: "play",
		title: "Toggle Play",
		contexts: ["all"],
		command: "simulatePlay();"
	});*/
	
})();
