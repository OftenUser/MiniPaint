import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';

class LayerClearClass {

	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	clear() {
		return app.State.doAction(
			new app.Actions.ClearLayerAction(config.layer.id)
		);
	}

}

export default LayerClearClass;
