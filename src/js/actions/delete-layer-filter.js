import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class DeleteLayerFilterAction extends BaseAction {
	/**
	 * Delete live filter
	 *
	 * @param {int} layerID
	 * @param {string} filterID
	 */
	constructor(layerID, filterID) {
		super('delete_layer_filter', 'Delete Layer Filter');
		
		if (layerID == null)
			layerID = config.layer.id;
		
		this.layerID = parseInt(layerID);
		this.filterID = filterID;
		this.referenceLayer = null;
		this.filterRemoveIndex = null;
		this.oldFilter = null;
	}

	async do() {
		super.do();
		this.referenceLayer = app.Layers.getLayer(this.layerID);
		
		if (!this.referenceLayer) {
			throw new Error('Aborted - Layer with specified ID doesn\'t exist');
		}
		
		this.oldFilter = null;
		
		for (let i in this.referenceLayer.filters) {
			if (this.referenceLayer.filters[i].id == this.filterID) {
				this.filterRemoveIndex = i;
				this.oldFilter = this.referenceLayer.filters.splice(i, 1)[0];
				break;
			}
		}
		
		if (!this.oldFilter) {
			throw new Error('Aborted - Filter with specified ID doesn\'t exist in layer');
		}
		
		config.needRender = true;
		app.GUI.GUILayers.renderLayers();
	}

	async undo() {
		super.undo();
		
		if (this.referenceLayer && this.oldFilter) {
			this.referenceLayer.filters.splice(this.filterRemoveIndex, 0, this.oldFilter);
		}
		
		this.referenceLayer = null;
		this.oldFilter = null;
		this.filterRemoveIndex = null;
		config.needRender = true;
		app.GUI.GUILayers.renderLayers();
	}

	free() {
		this.referenceLayer = null;
		this.oldFilter = null;
	}
}
