import config from './../../config.js';
import HelperClass from './../../libs/helpers.js';
import BaseGUIClass from './../../core/base-gui.js';

var instance = null;

class ViewGridClass {
	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.GUI = new BaseGUIClass();
		this.Helper = new HelperClass();

		this.setEvents();
	}

	set_events() {
		document.addEventListener('keydown', (event) => {
			var code = event.keyCode;
			
			if (this.Helper.isInput(event.target))
				return;

			if (code == 71 && event.ctrlKey != true && event.metaKey != true) {
				// G - Grid
				this.grid({visible: !this.GUI.grid});
				event.preventDefault();
			}
		}, false);
	}

	grid() {
		if (this.GUI.grid == false) {
			this.GUI.grid = true;
		} else {
			this.GUI.grid = false;
		}
		
		config.needRender = true;
	}
}

export default ViewGridClass;
