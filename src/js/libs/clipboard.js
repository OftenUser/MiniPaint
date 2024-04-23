import HelperClass from './helpers.js';

/**
 * Image pasting into canvas
 * 
 * @param {string} canvasID - Canvas ID
 * @param {boolean} autoresize - If canvas will be resized
 */
class ClipboardClass {

	constructor(onPaste) {
		var _self = this;

		this.Helper = new HelperClass();

		this.onPaste = onPaste;
		this.ctrlPressed = false;
		this.commandPressed = false;
		this.pasteCatcher;
		this.pasteMode;

		// Handlers
		document.addEventListener('keydown', function(e) {
			_self.onKeyboardAction(e);
		}, false); // Firefox fix
		document.addEventListener('keyup', function(e) {
			_self.onKeyboardUpAction(e);
		}, false); // Firefox fix
		document.addEventListener('paste', function(e) {
			_self.pasteAuto(e);
		}, false); // Official paste handler

		this.init();
	}

	// Constructor - Prepare
	init() {
		var _self = this;

		// If using auto
		if (window.Clipboard)
			return true;

		this.pasteCatcher = document.createElement("div");
		this.pasteCatcher.setAttribute("id", "paste_ff");
		this.pasteCatcher.setAttribute("contenteditable", "");
		this.pasteCatcher.style.cssText = 'opacity: 0; position: fixed; top: 0px; left: 0px;';
		this.pasteCatcher.style.marginLeft = "-20px";
		this.pasteCatcher.style.width = "10px";
		document.body.appendChild(this.pasteCatcher);

		// Create an observer instance
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (this.paste_mode == 'auto' || this.ctrlPressed == false || mutation.type != 'childList')
					return true;

				// If paste handle failed - Capture pasted object manually
				if (mutation.addedNodes.length == 1) {
					if (mutation.addedNodes[0].src != undefined) {
						// Image
						_self.pasteCreateImage(mutation.addedNodes[0].src);
					}
					
					// Register cleanup after some time.
					setTimeout(function() {
						this.pasteCatcher.innerHTML = '';
					}, 20);
				}
			});
		});
		
		var target = document.getElementById('paste_ff');
		var config = {attributes: true, childList: true, characterData: true};
		observer.observe(target, config);
	}

	// Default paste action
	pasteAuto(e) {
		if (this.Helper.isInput(e.target))
			return;

		this.pasteMode = '';
		
		if (!window.Clipboard) {
			this.pasteCatcher.innerHTML = '';
		}
		
		if (e.clipboardData) {
			var items = e.clipboardData.items;
			
			if (items) {
				this.pasteMode = 'auto';
				
				// Access data directly
				for (var i = 0; i < items.length; i++) {
					if (items[i].type.indexOf("image") !== -1) {
						// Image
						var blob = items[i].getAsFile();
						var URLObj = window.URL || window.webkitURL;
						var source = URLObj.createObjectURL(blob);
						this.pasteCreateImage(source);
					}
				}
				
				e.preventDefault();
			} else {
				// Wait for DOMSubtreeModified event
				// https://bugzilla.mozilla.org/show_bug.cgi?id=891247
			}
		}
	}

	// On keyboard press
	onKeyboardAction(event) {
		var k = event.keyCode;
		
		// Ctrl
		if (k == 17 || event.metaKey || event.ctrlKey) {
			if (this.ctrlPressed == false)
				this.ctrlPressed = true;
		}
		
		// V
		if (k == 86) {
			if (this.Helper.isInput(document.activeElement)) {
				return false;
			}

			if (this.ctrlPressed == true && !window.Clipboard)
				this.pasteCatcher.focus();
		}
	}

	// On keyboard release
	onKeyboardUpAction(event) {
		// Ctrl
		if (event.ctrlKey == false && this.ctrlPressed == true) {
			this.ctrlPressed = false;
		}
		// Command
		else if (event.metaKey == false && this.commandPressed == true) {
			this.commandPressed = false;
			this.ctrlPressed = false;
		}
	}

	// Draw image
	pasteCreateImage(source) {
		var pastedImage = new Image();
		var _this = this;

		pastedImage.onload = function () {
			_this.on_paste(source, pastedImage.width, pastedImage.height);
		};
		pastedImage.src = source;
	}
}

export default ClipboardClass;
