import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class UpdateLayerAction extends BaseAction {
	/**
	 * Updates an existing layer with the provided settings
	 * WARNING: If passing objects or arrays into settings, make sure these are new or cloned objects, and not a modified existing object!
	 *
	 * @param {string} layer_id
	 * @param {object} settings 
	 */
	constructor(layerID, settings) {
		super('update_layer', 'Update Layer');
		this.layerID = layerID;
		this.settings = settings;
		this.referenceLayer = null;
		this.oldSettings = {};
	}

	async do() {
		super.do();
		this.referenceLayer = app.Layers.getLayer(this.layerID);
		
		if (!this.reference_layer) {
			throw new Error('Aborted - Layer with specified ID doesn\'t exist');
		}
		
		for (let i in this.settings) {
			if (i == 'id')
				continue;
			
			if (i == 'order')
				continue;
			
			this.oldSettings[i] = this.referenceLayer[i];
			this.referenceLayer[i] = this.settings[i];
		}
		
		if (this.referenceLayer.type === 'text') {
			this.referenceLayer.needsUpdateData = true;
		}
		
		if (this.settings.params || this.settings.width || this.settings.height) {
			config.needRenderChangedParams = true;
		}
		
		config.needRender = true;
	}

	async undo() {
		super.undo();
		
		if (this.referenceLayer) {
			for (let i in this.oldSettings) {
				this.referenceLayer[i] = this.oldSettings[i];
			}
			
			if (this.referenceLayer.type === 'text') {
				this.referenceLayer.needsUpdateData = true;
			}
			
			if (this.oldSettings.params || this.oldSettings.width || this.oldSettings.height) {
				config.needRenderChangedParams = true;
			}
			
			this.old_settings = {};
		}
		
		this.referenceLayer = null;
		config.needRender = true;
	}

	free() {
		this.settings = null;
		this.oldSettings = null;
		this.referenceLayer = null;
	}
}
