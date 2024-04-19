import app from '../app.js';
import config from '../config.js';
import {BaseAction} from './base.js';

export class Toggle_layer_visibility_action extends BaseAction {
	/**
	 * Toggle layer visibility
	 *
	 * @param {int} layerID
	 */
	constructor(layerID) {
		super('toggle_layer_visibility', 'Toggle Layer Visibility');
		this.layerID = parseInt(layerID);
		this.oldVisible = null;
	}

	async do() {
		super.do();
		const layer = app.Layers.getLayer(this.layerID);
		this.oldVisible = layer.visible;
		if (layer.visible == false)
			layer.visible = true;
		else
			layer.visible = false;
		app.Layers.render();
		app.GUI.GUILayers.renderLayers();
	}

	async undo() {
		super.undo();
		const layer = app.Layers.getLayer(this.layerID);
		layer.visible = this.oldVisible;
		this.oldVisible = null;
		app.Layers.render();
		app.GUI.GUILayers.renderLayers();
	}
}
