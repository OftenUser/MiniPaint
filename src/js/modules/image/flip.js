import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

class ImageFlipClass {

	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	vertical() {
		this.flip('vertical');
	}

	horizontal() {
		this.flip('horizontal');
	}

	flip(mode) {
		if (config.layer.type != 'image') {
			alertify.error('This layer must contain an image. Please convert it to raster to apply this tool.');
			return;
		}

		// Get canvas from layer
		var canvas = this.BaseLayers.convertLayerToCanvas(null, true);
		var ctx = canvas.getContext("2d");

		// Create destination canvas
		var canvas2 = document.createElement('canvas');
		canvas2.width = canvas.width;
		canvas2.height = canvas.height;
		var ctx2 = canvas2.getContext("2d");
		canvas2.dataset.x = canvas.dataset.x;
		canvas2.dataset.y = canvas.dataset.y;

		// Flip
		if (mode == 'vertical') {
			ctx2.scale(1, -1);
			ctx2.drawImage(canvas, 0, canvas2.height * -1);
		} else if (mode == 'horizontal') {
			ctx2.scale(-1, 1);
			ctx2.drawImage(canvas, canvas2.width * -1, 0);
		}

		// Save
		return app.State.doAction(
			new app.Actions.UpdateLayerImageAction(canvas2)
		);
	}

}

export default ImageFlipClass;
