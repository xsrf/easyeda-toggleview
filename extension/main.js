const extensionId = 'extension-toggleview-id'.split('-')[1]; // this format is needed to set the Extension ID during install
const manifest = easyeda.extension.instances[extensionId].manifest;
const instance = easyeda.extension.instances[extensionId];


/*
	Self-Contained Update-Notification.
	Relies on "instance" pointing to easyeda.extension.instances[extensionId]
	"updatebaseurl" being set in the manifest
	"homepage" being set in the manifest
*/
(async ()=>{
	try {
		var skipVersion = localStorage.getItem(`extension-${instance.id}-update-skip`) || instance.manifest.version;
		var cmds = {};
		cmds[`extension-${instance.id}-update-page`] = ()=>{ window.open(instance.manifest.homepage,'_blank') };
		cmds[`extension-${instance.id}-update-skip`] = ()=>{ localStorage.setItem(`extension-${instance.id}-update-skip`,skipVersion) };
		api('createCommand', cmds);
		var response = await fetch(instance.manifest.updatebaseurl + 'manifest.json');
		var onlineManifest = await response.json();
		if(onlineManifest.version != instance.manifest.version && onlineManifest.version != skipVersion) {
			skipVersion = onlineManifest.version;
			$.messager.show({
				title: `Update Available for <b>${instance.manifest.name}</b>`,
				msg: `<table>
						<tr><td>Installed:</td><td>${instance.manifest.name} ${instance.manifest.version}</td></tr>
						<tr><td>Available:</td><td>${onlineManifest.name} ${onlineManifest.version}</td></tr>
					</table>
					<div class="dialog-button">
						<a tabindex="0" cmd="extension-${instance.id}-update-page;dialog-close" class="l-btn"><span class="l-btn-left"><span class="l-btn-text i18n">Download</span></span></a>
						<a tabindex="0" cmd="extension-${instance.id}-update-skip;dialog-close" class="l-btn"><span class="l-btn-left"><span class="l-btn-text i18n">Skip Version</span></span></a>
					</div>
					`,
				height: 'auto',
				timeout: 30e3,
				showType: "slide"
			});
		}			
	} catch (error) {
		console.log('Update check failed: '+error);
	}
})();

api('createToolbarButton', {
	icon: api('getRes', { file: 'icon.svg' }),
	title: 'Toggle PCB view',
	fordoctype: 'pcb',
	menu:[
		{
			text: "Toggle View", 
			cmd: createCommand(()=>{toggle();}), 
			title: 'Toggle PCB View between Top and Bottom',
			icon: api('getRes', { file: 'icon.svg' })
		},
		{
			text: 'Flip on Layer',
			submenu: [
				{
					text: 'Bottom Copper',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-2`,
					cmd: createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Silk',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-4`,
					cmd: createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Paste',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-6`,
					cmd: createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Mask',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-8`,
					cmd: createCommand(()=>{saveConfig()})
				}
			]
		},
		{},
		{
			text: "Visit GitHub Page",
			cmd: createCommand(()=>{ window.open(manifest.homepage,'_blank'); }),
			icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFxSURBVHjajNPNK0RhFMfxe2dI04y8NExNNmzJ2igRWwtlRRllryz8DVhYiKLZaHbyWv4ALyHCgvwBQyEW5GVhphDfU7+rJ0n31Gfufe4959w7z3MfP1VX7/2KLgygHQ26doNDLGHXTfadBjWYxoj3fyxiHE82iDjFGyGKPeVsqMaLJuJxOy6gD0eYQhJVuMIjKnCOSdSiAylslvHTiWF1v8C8XrMaz7oenJfQioxq8tYga3OhxJJzvHde2z0PcqwmG1E3izfkQsxBTrkWGWuQ1uABhRANCsq1SFuDLw0SiIVoEFOuxZc1uNbAZrcnRIPuYAmt1hocaPCKGS2R/0ehr3vTzv19a5DXYBlb2MMx2pxim+ht7KBR1z6CZTzBHEbRi0s049Zp8KI94obVnAZ7wSZmBS0YU/EZPpWc1OxXaryOIRSDvVBEP9awqr+QdJ4WVbHlTWBQ5z97wdPTbKveaWnXna+uHE167Vm8B0XfAgwAj8RQQEL6HPwAAAAASUVORK5CYII="
		},
		{
			text: "About", 
			cmd: createCommand(()=>{ aboutdlg.dialog('open') })
		},
	]
});

var aboutdlg = api('createDialog', {
	title: `${manifest.name} - About`,
    content : `
    <div style="padding: 8px; text-align: center">
        <h1>${manifest.name}</h1>
        <h2>Version: ${manifest.version}</h2>
        <p>Icons by <a target="_blank" href="https://www.flaticon.com/de/autoren/freepik" title="freepik">freepik</a> from <a target="_blank" href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
        <p>Visit <a href="${manifest.homepage}" target="_blank">${manifest.homepage}</a> for updates</p>
    </div>
`,
	width : 320,
	modal : true,
	collapsible: false,
	resizable: false,
	buttons : [{
			text : 'Close',
			cmd : 'dialog-close'
		}
	]
});

const flipmousevent = (e) => {
	if(e.isTrusted) { 
		e.stopImmediatePropagation(); 
		w = e.target.clientWidth;
		f = new MouseEvent(e.type, {
			x: w-e.x, 
			y: e.y,
			clientX: w-e.clientX, 
			clientY: e.clientY,
			movementX: e.movementX*-1,
			movementY: e.movementY,
			button: e.button,
			buttons: e.buttons,
			screenX: e.screenX,
			screenY: e.screenY,
			bubbles: e.bubbles,
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			metaKey: e.metaKey,
			shiftKey: e.shiftKey
		}); 
		e.target.dispatchEvent(f);
	}	
}

function createCommand(callback) {
	id = 'extension-'+extensionId+'-' + Math.round(Math.random()*1e9);
	cmd=[];
	cmd[id] = callback;
	api('createCommand', cmd);
	return id;
}

// listen to layer change
/*
const classObserver = new MutationObserver((mutations) => {
	mutations.forEach(mu => {
		if (mu.type !== "attributes" && mu.attributeName !== "class") return;
		active = mu.target.classList.contains('active');
		if(active) layerChanged();
	});
});

const initObserverX = () => {
	let elements = document.querySelectorAll('#toolbar-pcblayer-tbl tr[layer_id]');
	elements.forEach((el)=>{
		classObserver.observe(el, {attributes: true});
	});
}
*/

const initObserver = () => {
	setInterval(()=>{
		instance.activeLayer = instance.activeLayer || -1;
		activeLayer = getActiveLayerId();
		if(activeLayer && activeLayer != instance.activeLayer) {
			instance.activeLayer = activeLayer;
			layerChanged();
		}
	},1e2);
}

const layerChanged = () => {
	layerId = getActiveLayerId();
	setFlipped(isAutoToggleOnLayer(layerId));
}

const setAutoToggleOnLayer = (layerId,checked) => {
	let selector = `#${extensionId}-layer-${layerId}`;
	$(selector).menu('setChecked',{target:$(selector),checked: !!checked});
}

const isAutoToggleOnLayer = (layerId) => {
	let selector = `#${extensionId}-layer-${layerId}`;
	return $(selector).menu('isChecked');
}

const setFlipped = (flipped) => {
	if(getFlipped() == flipped) return;
	tab = document.querySelectorAll('#tabbar_bodies div[uuid]').filter(e=>e.style.display=='block')[0]; // get active tab
	if(!tab) return;
	editor = tab.querySelector('iframe');
	ruler = tab.querySelector('.rulerh');
	rulerc = tab.querySelector('.rulerhc');
	if(!editor) return;
	if(!flipped) {
		editor.removeEventListener ('mousemove',flipmousevent,{capture: true});
		editor.removeEventListener('mouseup',flipmousevent,{capture: true});
		editor.removeEventListener('mousedown',flipmousevent,{capture: true});
		editor.style.transform = '';
		ruler.style.transform = '';
	} else {
		editor.addEventListener('mousemove',flipmousevent,{capture: true});
		editor.addEventListener('mouseup',flipmousevent,{capture: true});
		editor.addEventListener('mousedown',flipmousevent,{capture: true});
		editor.style.transform = 'scaleX(-1)';
		ruler.style.transform = 'scaleX(-1)';
	}
}

const getFlipped = () => {
	obj = document.querySelectorAll('#tabbar_bodies div[uuid]').filter(e=>e.style.display=='block')[0]; // get active tab
	if(!obj) return;
	obj = obj.querySelector('iframe');
	if(!obj) return;
	return obj.style.transform == 'scaleX(-1)';
}

const toggle = () => {
	setFlipped(!getFlipped());
}

const getActiveLayerId = () => {
	return $('#toolbar-pcblayer-tbl tr.active').attr('layer_id');
}

function setConfig(key,value) {
	var conf = {};
	try {
		conf = localStorage.getItem(`extension.${extensionId}.config`) || '{}';
		conf = JSON.parse(conf);			
	} catch (error) {
		conf = {};
	}
	conf[key] = value;
	if(value === null) delete conf[value];
	localStorage.setItem(`extension.${extensionId}.config`,JSON.stringify(conf));
}

function getConfig(key,defaultValue) {
	try {
		var conf = localStorage.getItem(`extension.${extensionId}.config`) || '{}';
		conf = JSON.parse(conf);
		if(!(key in conf)) return defaultValue;
		return conf[key];
	} catch (error) {
		return defaultValue;
	}
}

function saveConfig() {
	setConfig('layer-2',isAutoToggleOnLayer(2));
	setConfig('layer-4',isAutoToggleOnLayer(4));
	setConfig('layer-6',isAutoToggleOnLayer(6));
	setConfig('layer-8',isAutoToggleOnLayer(8));
}

function init() {
	setAutoToggleOnLayer(2,getConfig('layer-2',false));
	setAutoToggleOnLayer(4,getConfig('layer-4',false));
	setAutoToggleOnLayer(6,getConfig('layer-6',false));
	setAutoToggleOnLayer(8,getConfig('layer-8',false));
	initObserver();
	layerChanged();
}

init();