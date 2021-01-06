extensionId = 'extension-toggleview-id'.split('-')[1]; // this format is needed to set the Extension ID during install
manifest = easyeda.extension.instances[extensionId].manifest;

commands = new Array();
commands[`extension-${extensionId}-toggle`] = () => {
	obj = document.querySelectorAll('#tabbar_bodies div[uuid]').filter(e=>e.style.display=='block')[0]; // get active tab
	obj = obj.querySelector('iframe');
	if(!obj) return;
	if(obj.style.transform == 'scaleX(-1)') {
		obj.removeEventListener ('mousemove',flipmousevent,{capture: true});
		obj.removeEventListener('mouseup',flipmousevent,{capture: true});
		obj.removeEventListener('mousedown',flipmousevent,{capture: true});
		obj.style.transform = '';
	} else {
		obj.addEventListener('mousemove',flipmousevent,{capture: true});
		obj.addEventListener('mouseup',flipmousevent,{capture: true});
		obj.addEventListener('mousedown',flipmousevent,{capture: true});
		obj.style.transform = 'scaleX(-1)';	
	}
};
commands[`extension-${extensionId}-about`] = () => {
	aboutdlg.dialog('open');
};

api('createCommand', commands);

api('createToolbarButton', {
	icon: api('getRes', { file: 'icon.svg' }),
	title: 'Toggle PCB view',
	fordoctype: 'pcb',
	menu:[
		{
			text: "Toggle View", 
			cmd: `extension-${extensionId}-toggle`, 
			title: 'Toggle PCB View between Top and Bottom',
			icon: api('getRes', { file: 'icon.svg' })
		},
		{
			text: "About", 
			cmd: `extension-${extensionId}-about`
		}
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

flipmousevent = (e) => {
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