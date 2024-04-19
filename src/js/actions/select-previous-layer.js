import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class SelectPreviousLayerAction extends BaseAction {
	constructor(referenceLayerID) {
		super('select_previous_layer', 'Select Previous Layer');
		this.referenceLayerID = referenceLayerID;
		this.oldConfigLayer = null;
	}

	async do() {
		super.do();
		const previousLayer = app.Layers.findPrevious(this.referenceLayerID);
		
		if (!previousLayer) {
			throw new Error('Aborted - Previous layer to select not found');
		}
		
		this.oldConfigLayer = config.layer;
		config.layer = previousLayer;

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
