import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class DeleteLayerSettingsAction extends BaseAction {
	/**
	 * Deletes the specified settings in a layer
	 *
	 * @param {int} layerID
	 * @param {array} settingNames 
	 */
	constructor(layerID, settingNames) {
		super('delete_layer_settings', 'Delete Layer Settings');
		this.layerID = parseInt(layerID);
		this.settingNames = settingNames;
		this.referenceLayer = null;
		this.oldSettings = {};
	}

	async do() {
		super.do();
		this.referenceLayer = app.Layers.getLayer(this.layerID);
		
		if (!this.referenceLayer) {
			throw new Error('Aborted - Layer with specified ID doesn\'t exist');
		}
		
		for (let name in this.settingNames) {
			this.oldSettings[name] = this.referenceLayer[name];
			delete this.referenceLayer[name];
		}
		
		config.needRender = true;
	}

	async undo() {
		super.undo();
		if (this.referenceLayer) {
			for (let i in this.oldSettings) {
				this.referenceLayer[i] = this.oldSettings[i];
			}
			this.oldSettings = {};
		}
		this.referenceLayer = null;
		config.needRender = true;
	}

	free() {
		this.settingNames = null;
		this.referenceLayer = null;
		this.oldSettings = null;
	}
}
