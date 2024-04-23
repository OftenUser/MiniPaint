import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';

class LayerMoveClass {
	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	up() {
		app.State.doAction(
			new app.Actions.ReorderLayerAction(config.layer.id, 1)
		);
	}

	down() {
		app.State.doAction(
			new app.Actions.ReorderLayerAction(config.layer.id, -1)
		);
	}
}

export default LayerMoveClass;
