import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

class LayerRasterClass {
	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	raster() {
		var canvas = this.BaseLayers.convertLayerToCanvas();
		var currentLayer = config.layer;
		var currentID = currentLayer.id;

		// Show
		var params = {
			type: 'image',
			name: config.layer.name + ' + raster',
			data: canvas.toDataURL("image/png"),
			x: parseInt(canvas.dataset.x),
			y: parseInt(canvas.dataset.y),
			width: canvas.width,
			height: canvas.height,
			opacity: currentLayer.opacity,
		};
		
		app.State.doAction(
			new app.Actions.BundleAction('convert_to_raster', 'Convert To Raster', [
				new app.Actions.InsertLayerAction(params, false),
				new app.Actions.DeleteLayerAction(currentID)
			])
		);
	}
}

export default LayerRasterClass;
