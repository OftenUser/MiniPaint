import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';
import FileOpenClass from './open.js';

/** 
 * Manages files/quick-load
 * 
 * @author ViliusL
 */
class FileQuickloadClass {

	constructor() {
		this.BaseLayers = new BaseLayersClass();
		this.FileOpen = new FileOpenClass();

		this.setEvents();
	}

	setEvents() {
		var _this = this;

		document.addEventListener('keydown', function(event) {
			var code = event.keyCode;

			if (code == 121) {
				// F10
				_this.quickload();
				event.preventDefault();
			}
		}, false);
	}

	quickload() {
		// Load image data
		var json = localStorage.getItem('quicksave_data');
		if (json == '' || json == null) {
			// Nothing was found
			return false;
		}

		this.FileOpen.loadJSON(json);
	}

}

export default FileQuickloadClass;
