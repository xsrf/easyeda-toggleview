const extensionId = 'extension-toggleview-id'.split('-')[1]; // this format is needed to set the Extension ID during install
const manifest = easyeda.extension.instances[extensionId].manifest;
const instance = easyeda.extension.instances[extensionId];
const Helper = instance.Helper; // Helper class declared in easyeda-helper.js

var defaultFlipped = false;

api('createToolbarButton', {
	icon: api('getRes', { file: 'icon.svg' }),
	title: 'Toggle PCB view',
	fordoctype: 'pcb',
	menu:[
		{
			text: "Toggle View", 
			cmd: Helper.createCommand(()=>{toggle();}), 
			title: 'Toggle PCB View between Top and Bottom',
			icon: api('getRes', { file: 'icon.svg' })
		},
		{
			text: 'Flip on Layer',
			title: 'Flip view automatically for these Layers',
			submenu: [
				{
					text: 'Bottom Copper',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-2`,
					cmd: Helper.createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Silk',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-4`,
					cmd: Helper.createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Paste',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-6`,
					cmd: Helper.createCommand(()=>{saveConfig()})
				},
				{
					text: 'Bottom Mask',
					group: 'checkbox:autoToggleLayer',
					id: `${extensionId}-layer-8`,
					cmd: Helper.createCommand(()=>{saveConfig()})
				}
			]
		},
		{},
		{
			text: "Visit GitHub Page",
			cmd: Helper.createCommand(()=>{ window.open(manifest.homepage,'_blank'); }),
			icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFxSURBVHjajNPNK0RhFMfxe2dI04y8NExNNmzJ2igRWwtlRRllryz8DVhYiKLZaHbyWv4ALyHCgvwBQyEW5GVhphDfU7+rJ0n31Gfufe4959w7z3MfP1VX7/2KLgygHQ26doNDLGHXTfadBjWYxoj3fyxiHE82iDjFGyGKPeVsqMaLJuJxOy6gD0eYQhJVuMIjKnCOSdSiAylslvHTiWF1v8C8XrMaz7oenJfQioxq8tYga3OhxJJzvHde2z0PcqwmG1E3izfkQsxBTrkWGWuQ1uABhRANCsq1SFuDLw0SiIVoEFOuxZc1uNbAZrcnRIPuYAmt1hocaPCKGS2R/0ehr3vTzv19a5DXYBlb2MMx2pxim+ht7KBR1z6CZTzBHEbRi0s049Zp8KI94obVnAZ7wSZmBS0YU/EZPpWc1OxXaryOIRSDvVBEP9awqr+QdJ4WVbHlTWBQ5z97wdPTbKveaWnXna+uHE167Vm8B0XfAgwAj8RQQEL6HPwAAAAASUVORK5CYII="
		},
		{
			text: "About", 
			cmd: Helper.createCommand(()=>{ aboutdlg.dialog('open') })
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

function flipmousevent(e) {
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

function flipkeyboardevent(e) {
	if(!e.isTrusted) return;
	if(!['ArrowRight','ArrowLeft'].includes(e.key)) return;
	f = new KeyboardEvent(e.type, {
		altKey: e.altKey,
		bubbles: e.bubbles,
		cancelBubble: e.cancelBubble,
		cancelable: e.cancelable,
		charCode: e.charCode,
		code: e.code == 'ArrowRight' ? 'ArrowLeft':'ArrowRight',
		composed: e.composed,
		ctrlKey: e.ctrlKey,
		currentTarget: e.currentTarget,
		defaultPrevented: e.defaultPrevented,
		detail: e.detail,
		eventPhase: e.eventPhase,
		isComposing: e.isComposing,
		key: e.key == 'ArrowRight' ? 'ArrowLeft':'ArrowRight',
		keyCode: e.keyCode == 39 ? 37 : 39,
		location: e.location,
		metaKey: e.metaKey,
		path: e.path,
		repeat: e.repeat,
		returnValue: e.returnValue,
		shiftKey: e.shiftKey,
		sourceCapabilities: e.sourceCapabilities,
		srcElement: e.srcElement,
		target: e.target,
		view: e.view,
		which: e.which == 39 ? 37 : 39,
	})
	e.stopImmediatePropagation();
	e.target.dispatchEvent(f);	
}

function initObserver() {
	setInterval(()=>{
		instance.activeLayer = instance.activeLayer || -1;
		activeLayer = getActiveLayerId();
		if(activeLayer && activeLayer != instance.activeLayer) {
			instance.activeLayer = activeLayer;
			layerChanged();
		}
	},1e2);
}

function layerChanged() {
	layerId = getActiveLayerId();
	setFlipped(defaultFlipped || isAutoToggleOnLayer(layerId));
}

function setAutoToggleOnLayer(layerId,checked) {
	let selector = `#${extensionId}-layer-${layerId}`;
	$(selector).menu('setChecked',{target:$(selector),checked: !!checked});
}

function isAutoToggleOnLayer(layerId) {
	let selector = `#${extensionId}-layer-${layerId}`;
	return $(selector).menu('isChecked');
}

function setFlipped(flipped) {
	if(getFlipped() == flipped) return;
	tab = document.querySelectorAll('#tabbar_bodies div[uuid]').filter(e=>e.style.display=='block')[0]; // get active tab
	if(!tab) return;
	editor = tab.querySelector('iframe');
	ruler = tab.querySelector('.rulerh');
	rulerc = tab.querySelector('.rulerhc');
	if(!editor) return;
	if(!flipped) {
		editor.removeEventListener('mousemove',flipmousevent,{capture: true});
		editor.removeEventListener('mouseup',flipmousevent,{capture: true});
		editor.removeEventListener('mousedown',flipmousevent,{capture: true});
		editor.contentDocument.removeEventListener('keydown',flipkeyboardevent,{capture: true});
		editor.contentDocument.removeEventListener('keyup',flipkeyboardevent,{capture: true});
		editor.contentDocument.removeEventListener('keypress',flipkeyboardevent,{capture: true});
		editor.style.transform = '';
		ruler.style.transform = '';
	} else {
		editor.addEventListener('mousemove',flipmousevent,{capture: true});
		editor.addEventListener('mouseup',flipmousevent,{capture: true});
		editor.addEventListener('mousedown',flipmousevent,{capture: true});
		editor.contentDocument.addEventListener('keydown',flipkeyboardevent,{capture: true});
		editor.contentDocument.addEventListener('keyup',flipkeyboardevent,{capture: true});
		editor.contentDocument.addEventListener('keypress',flipkeyboardevent,{capture: true});
		editor.style.transform = 'scaleX(-1)';
		ruler.style.transform = 'scaleX(-1)';
	}
}

function getFlipped() {
	obj = document.querySelectorAll('#tabbar_bodies div[uuid]').filter(e=>e.style.display=='block')[0]; // get active tab
	if(!obj) return;
	obj = obj.querySelector('iframe');
	if(!obj) return;
	return obj.style.transform == 'scaleX(-1)';
}

function toggle() {
	defaultFlipped = !getFlipped();
	setFlipped(defaultFlipped);
}

function getActiveLayerId() {
	return $('#toolbar-pcblayer-tbl tr.active').attr('layer_id');
}

function saveConfig() {
	Helper.setConfig('layer-2',isAutoToggleOnLayer(2));
	Helper.setConfig('layer-4',isAutoToggleOnLayer(4));
	Helper.setConfig('layer-6',isAutoToggleOnLayer(6));
	Helper.setConfig('layer-8',isAutoToggleOnLayer(8));
}

function init() {
	Helper.checkUpdate();
	setAutoToggleOnLayer(2,Helper.getConfig('layer-2',false));
	setAutoToggleOnLayer(4,Helper.getConfig('layer-4',false));
	setAutoToggleOnLayer(6,Helper.getConfig('layer-6',false));
	setAutoToggleOnLayer(8,Helper.getConfig('layer-8',false));
	initObserver();
	layerChanged();
}

init();