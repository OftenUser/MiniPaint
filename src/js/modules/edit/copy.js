import config from "../../config";
import BaseLayersClass from './../../core/base-layers.js';
import FileSaveClass from './../file/save.js';
import HelperClass from './../../libs/helpers.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

var instance = null;

class CopyClass {

	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.BaseLayers = new BaseLayersClass();
		this.Helper = new HelperClass();
		this.FileSave = new FileSaveClass();

		// Events
		document.addEventListener('keydown', (event) => {
			var code = event.key.toLowerCase();
			var ctrlDown = event.ctrlKey || event.metaKey;
			
			if (this.Helper.isInput(event.target))
				return;

			if (code == "c" && ctrlDown == true) {
				// Copy to clipboard
				this.copyToClipboard();
			}
		}, false);
	}

	async copyToClipboard() {
		var _this = this;

		const canWriteToClipboard = await this.askWritePermission();
		if (canWriteToClipboard) {

			// Get data - Current layer
			var canvas = this.BaseLayers.convertLayerToCanvas();
			var ctx = canvas.getContext("2d");

			if (config.TRANSPARENCY == false) {
				// Add white background
				ctx.globalCompositeOperation = 'destination-over';
				this.FileSave.fillCanvasBackground(ctx, '#FFFFFF');
				ctx.globalCompositeOperation = 'source-over';
			}

			// Save using lib
			canvas.toBlob(function(blob) {
				_this.setToClipboard(blob);
			});
		} else {
			alertify.error('Missing permissions to write to Clipboard.cc');
		}
	}

	async setToClipboard(blob) {
		const data = [new ClipboardItem({[blob.type]: blob})];
		await navigator.clipboard.write(data);
	}

	async askWritePermission() {
		try {
			// The clipboard-write permission is granted automatically to pages
			// when they are the active tab. So it's not required, but it's more safe.
			const {state} = await navigator.permissions.query({name: 'clipboard-write'})
			return state === 'granted';
		} catch (error) {
			// Browser compatibility / Security error (ONLY HTTPS) ...
			return false;
		}
	}
}

export default CopyClass;
