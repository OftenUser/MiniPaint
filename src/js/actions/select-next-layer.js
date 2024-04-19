import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class SelectNextLayerAction extends BaseAction {
	constructor(referenceLayerID) {
		super('select_next_layer', 'Select Next Layer');
		this.referenceLayerID = referenceLayerID;
		this.oldConfigLayer = null;
	}

	async do() {
		super.do();
		const next_layer = app.Layers.findNext(this.referenceLayerID);
		
		if (!next_layer) {
			throw new Error('Aborted - Next layer to select not found');
		}
		
		this.oldConfigLayer = config.layer;
		config.layer = nextLayer;

		app.Layers.render();
		app.GUI.GUILayers.renderLayers();
	}

	async undo() {
		super.undo();
		config.layer = this.oldConfigLayer;
		this.oldConfigLayer = null;

		app.Layers.render();
		app.GUI.GUILayers.renderLayers();
	}
}
