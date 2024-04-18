import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class AddLayerFilterAction extends BaseAction {
	/**
	 * Register new live filter
	 *
	 * @param {int} layer_id
	 * @param {string} name
	 * @param {object} params
	 */
	constructor(layerID, name, params, filterID) {
		super('add_layer_filter', 'Add Layer Filter');
		if (layerID == null)
			layerID = config.layer.id;
		this.layerID = parseInt(layer_id);
		this.name = name;
		this.params = params;
		this.filterID = filterID;
		this.referenceLayer = null;
	}

	async do() {
		super.do();
		this.referenceLayer = app.Layers.getLayer(this.layerID);
		
		if (!this.referenceLayer) {
			throw new Error('Aborted - Layer with specified ID doesn\'t exist');
		}
		
		var filter = {
			id: this.filterID,
			name: this.name,
			params: this.params,
		};
		
		if (this.filterID) {
			// Update
			for (var i in this.referenceLayer.filters) {
				if(this.referenceLayer.filters[i].id == this.filterID) {
					this.referenceLayer.filters[i] = filter;
					break;
				}
			}
		} else {
			// Insert
			filter.id = Math.floor(Math.random() * 999999999) + 1; // A good UUID library would
			this.referenceLayer.filters.push(filter);
		}
		
		config.needRender = true;
		app.GUI.GUILayers.renderLayers();
	}

	async undo() {
		super.undo();
		
		if (this.referenceLayer) {
			this.referenceLayer.filters.pop();
			this.referenceLayer = null;
		}
		
		config.need_render = true;
		app.GUI.GUILayers.renderLayers();
	}

	free() {
		this.referenceLayer = null;
		this.params = null;
	}
}
