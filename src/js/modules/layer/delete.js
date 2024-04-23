import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';

class LayerDeleteClass {
	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	delete() {
		app.State.doAction(
			new app.Actions.DeleteLayerAction(config.layer.id)
		);
	}
}

export default LayerDeleteClass;
