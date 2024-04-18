/*
 * MiniPaint - https://github.com/Viliusle/MiniPaint
 * Author: Vilius L.
 */

import app from './../../app.js';
import config from './../../config.js';
import BaseLayersClass from './../base-layers.js';
import HelperClass from './../../libs/helpers.js';
import LayerRenameClass from './../../modules/layer/rename.js';
import EffectsBrowserClass from './../../modules/effects/browser.js';
import LayerDuplicateClass from './../../modules/layer/duplicate.js';
import LayerRasterClass from './../../modules/layer/raster.js';
import ToolsTranslateClass from './../../modules/tools/translate.js';

var template = `
	<button type="button" class="layer_add trn" id="insert_layer" title="Insert New Layer">+</button>
	<button type="button" class="layer_duplicate trn" id="layer_duplicate" title="Duplicate Layer">D</button>
	<button type="button" class="layer_raster trn" id="layer_raster" title="Convert Layer To Raster">R</button>

	<button type="button" class="layers_arrow trn" title="Move Layer Down" id="layer_down">&darr;</button>
	<button type="button" class="layers_arrow trn" title="Move Layer Up" id="layer_up">&uarr;</button>

	<div class="layers_list" id="layers"></div>
`;

/**
 * GUI class responsible for rendering layers on right sidebar
 */
class GUILayersClass {

	constructor(ctx) {
		this.BaseLayers = new BaseLayersClass();
		this.Helper = new HelperClass();
		this.LayerRename = new LayerRenameClass();
		this.EffectsBrowser = new EffectsBrowserClass();
		this.LayerDuplicate = new LayerDuplicateClass();
		this.LayerRaster = new LayerRasterClass();
		this.ToolsTranslate = new ToolsTranslateClass();
	}

	renderMainLayers() {
		document.getElementById('layers_base').innerHTML = template;
		
		if (config.LANG != 'en') {
			this.ToolsTranslate.translate(config.LANG, document.getElementById('layers_base'));
		}
		
		this.renderLayers();
		this.setEvents();
	}

	setEvents() {
		var _this = this;

		document.getElementById('layers_base').addEventListener('click', function(event) {
			var target = event.target;
			if (target.id == 'insert_layer') {
				// New layer
				app.State.doAction(
					new app.Actions.InsertLayerAction()
				);
			} else if (target.id == 'layer_duplicate') {
				// Duplicate
				_this.LayerDuplicate.duplicate();
			} else if (target.id == 'layer_raster') {
				// Raster
				_this.LayerRaster.raster();
			} else if (target.id == 'layer_up') {
				// Move layer up
				app.State.doAction(
					new app.Actions.ReorderLayerAction(config.layer.id, 1)
				);
			} else if (target.id == 'layer_down') {
				// Move layer down
				app.State.doAction(
					new app.Actions.ReorderLayerAction(config.layer.id, -1)
				);
			} else if (target.id == 'visibility') {
				// Change visibility
				return app.State.doAction(
					new app.Actions.ToggleLayerVisibilityAction(target.dataset.id)
				);
			} else if (target.id == 'delete') {
				// Delete layer
				app.State.doAction(
					new app.Actions.DeleteLayerAction(target.dataset.id)
				);
			} else if (target.id == 'layer_name') {
				// Select layer
				if (target.dataset.id == config.layer.id)
					return;
				
				app.State.doAction(
					new app.Actions.SelectLayerAction(target.dataset.id)
				);
			} else if (target.id == 'delete_filter') {
				// Delete filter
				app.State.doAction(
					new app.Actions.DeleteLayerFilterAction(target.dataset.pid, target.dataset.id)
				);
			} else if (target.id == 'filter_name') {
				// Edit filter
				var effects = _this.EffectsBrowser.getEffectsList();
				var key = target.dataset.filter.toLowerCase();
				
				for (var i in effects) {
					if (effects[i].title.toLowerCase() == key) {
						_this.BaseLayers.select(target.dataset.pid);
						var functionName = _this.EffectsBrowser.getFunctionFromPath(key);
						effects[i].object[functionName](target.dataset.id);
					}
				}
			}
		});

		document.getElementById('layers_base').addEventListener('dblclick', function(event) {
			var target = event.target;
			if (target.id == 'layer_name') {
				// Rename layer
				_this.LayerRename.rename(target.dataset.id);
			}
		});

	}

	/**
	 * Renders layers list
	 */
	renderLayers() {
		var targetID = 'layers';
		var layers = config.layers.concat().sort(
			// Sort function
				(a, b) => b.order - a.order
			);

		document.getElementById(target_id).innerHTML = '';
		var html = '';
		
		if (config.layer) {
			for (var i in layers) {
				var value = layers[i];
				var classExtra = '';
				
				if (value.composition === 'source-atop') {
					classExtra += ' shorter';
				}
				
				if (value.id == config.layer.id) {
					classExtra += ' active';
				}

				html += '<div class="item ' + class_extra + '">';
				if (value.visible == true)
					html += '	<button class="visibility visible trn" id="visibility" data-id="' + value.id + '" title="Hide"></button>';
				else
					html += '	<button class="visibility trn" id="visibility" data-id="' + value.id + '" title="Show"></button>';
				html += '	<button class="delete trn" id="delete" data-id="' + value.id + '" title="Delete"></button>';
				
				if (value.composition === 'source-atop') {
					html += '	<button class="arrow_down" data-id="' + value.id + '" ></button>';
				}

				var layerTitle = this.Helper.escapeHtml(value.name);
				
				html += '	<button class="layer_name" id="layer_name" data-id="' + value.id + '" title="' + layerTitle + '">' + layerTitle + '</button>';
				html += '	<div class="clear"></div>';
				html += '</div>';

				// Show filters
				if (layers[i].filters.length > 0) {
					html += '<div class="filters">';
					
					for (var j in layers[i].filters) {
						var filter = layers[i].filters[j];
						var title = this.Helper.ucfirst(filter.name);
						title = title.replace(/-/g, ' ');

						html += '<div class="filter">';
						html += '	<span class="delete" id="delete_filter" data-pid="' + layers[i].id + '" data-id="' + filter.id + '" title="delete"></span>';
						html += '	<span class="layer_name" id="filter_name" data-pid="' + layers[i].id + '" data-id="' + filter.id + '" data-filter="' + filter.name + '">' + title + '</span>';
						html += '	<div class="clear"></div>';
						html += '</div>';
					}
					
					html += '</div>';
				}
			}
		}

		// Register
		document.getElementById(targetID).innerHTML = html;
		
		if (config.LANG != 'en') {
			this.ToolsTranslate.translate(config.LANG, document.getElementById(targetID));
		}
	}
}

export default GUILayersClass;
