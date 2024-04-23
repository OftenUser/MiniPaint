import config from './../../config.js';
import FileSaveClass from './save.js';
import DialogClass from './../../libs/popup.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

/** 
 * Manages files/quick-save
 * 
 * @author ViliusL
 */
class FileQuicksaveClass {

	constructor() {
		this.POP = new DialogClass();
		this.FileSave = new FileSaveClass();

		this.setEvents();
	}

	setEvents() {
		var _this = this;

		document.addEventListener('keydown', function(event) {
			var code = event.keyCode;

			if (code == 120) {
				// F9
				_this.quicksave();
			}
		}, false);
	}

	quicksave() {
		// Save image data
		var dataJSON = this.FileSave.exportAsJSON();
		
		if (dataJSON.length > 5000000) {
			alertify.error('Sorry, image is too big, max 5 MB.');
			return false;
		}
		
		localStorage.setItem('quicksave_data', dataJSON);
	}

}

export default FileQuicksaveClass;
