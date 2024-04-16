import DialogClass from './../../libs/popup.js';

class HelpShortcutsClass {

	constructor() {
		this.POP = new DialogClass();
	}

	// Shortcuts
	shortcuts() {
		var settings = {
			title: 'Keyboard Shortcuts',
			className: 'shortcuts',
			params: [
				{title: "F", value: 'Auto Adjust Colors'},
				{title: "F3 / &#8984; + F", value: 'Search'},
				{title: "Ctrl + C", value: 'Copy to Clipboard'},
				{title: "D", value: 'Duplicate'},
				{title: "S", value: 'Export'},
				{title: "G", value: 'Grid On/Off'},
				{title: "I", value: 'Information'},
				{title: "N", value: 'New Layer'},
				{title: "O", value: 'Open'},
				{title: "CTRL + V", value: 'Paste'},
				{title: "F10", value: 'Quick Load'},
				{title: "F9", value: 'Quick Save'},
				{title: "R", value: 'Resize'},
				{title: "L", value: 'Rotate Left'},
				{title: "U", value: 'Ruler'},
				{title: "Shift + S", value: 'Save As'},
				{title: "CTRL + A", value: 'Select All'},
				{title: "H", value: 'Shapes'},
				{title: "T", value: 'Trim'},
				{title: "CTRL + Z", value: 'Undo'},
				{title: "Scroll up", value: 'Zoom In'},
				{title: "Scroll down", value: 'Zoom Out'},
			],
		};
		
		this.POP.show(settings);
	}

}

export default HelpShortcutsClass;
