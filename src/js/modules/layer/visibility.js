import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';

class LayerVisibilityClass {

	constructor() {
		this.BaseLayers = new BaseLayersClass();
	}

	toggle() {
		app.State.doAction(
			new app.Actions.ToggleLayerVisibilityAction(config.layer.id)
		);
	}

}

export default LayerVisibilityClass;
