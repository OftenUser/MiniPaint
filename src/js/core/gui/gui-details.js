/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import app from './../../app.js';
import config from './../../config.js';
import DialogClass from './../../libs/popup.js';
import TextClass from './../../tools/text.js';
import BaseLayersClass from "../base-layers";
import ToolsSettingsClass from './../../modules/tools/settings.js';
import HelperClass from './../../libs/helpers.js';
import ToolsTranslateClass from './../../modules/tools/translate.js';

var template = `
	<div class="row">
		<span class="trn label">X</span>
		<input type="number" id="detail_x" step="any" />
		<button class="extra reset trn" type="button" id="reset_x" title="Reset">Reset</button>
	</div>
	<div class="row">
		<span class="trn label">Y:</span>
		<input type="number" id="detail_y" step="any" />
		<button class="extra reset trn" type="button" id="reset_y" title="Reset">Reset</button>
	</div>
	<div class="row">
		<span class="trn label">Width:</span>
		<input type="number" id="detail_width" step="any" />
		<button class="extra reset trn" type="button" id="reset_size" title="Reset">Reset</button>
	</div>
	<div class="row">
		<span class="trn label">Height:</span>
		<input type="number" id="detail_height" step="any" />
	</div>
	<hr />
	<div class="row">
		<span class="trn label">Rotate:</span>
		<input type="number" min="-360" max="360" id="detail_rotate" />
		<button class="extra reset trn" type="button" id="reset_rotate" title="Reset">Reset</button>
	</div>
	<div class="row">
		<span class="trn label">Opacity:</span>
		<input type="number" min="0" max="100" id="detail_opacity" />
		<button class="extra reset trn" type="button" id="reset_opacity" title="Reset">Reset</button>
	</div>
	<div class="row">
		<span class="trn label">Color:</span>
		<input style="padding: 0px;" type="color" id="detail_color" />
	</div>
	<div id="parameters_container"></div>
	<div id="text_detail_params">
		<div class="row center">
			<span class="trn label">&nbsp;</span>
			<button type="button" class="trn dots" id="detail_param_text" title="Edit Text">Edit Text</button>
		</div>
		<div class="row">
			<span class="trn label" title="Resize Boundary">Bounds:</span>
			<select id="detail_param_boundary">
				<option value="box">Box</option>
				<option value="dynamic">Dynamic</option>
			</select>
		</div>
		<div class="row">
			<span class="trn label" title="Auto Kerning">Kerning:</span>
			<select id="detail_param_kerning">
				<option value="none">None</option>
				<option value="metrics">Metrics</option>
			</select>
		</div>
		<div class="row" hidden> <!-- Future implementation -->
			<span class="trn label" title="Direction">Direction:</span>
			<select id="detail_param_text_direction">
				<option value="ltr" title="Left To Right">Left To Right</option>
				<option value="rtl" title="Right To Left">Right To Left</option>
				<option value="ttb" title="Top To Bottom">Top To Bottom</option>
				<option value="btt" title="Bottom To Top">Bottom To Top</option>
			</select>
		</div>
		<div class="row" hidden> <!-- Future implementation -->
			<span class="trn label" title="Wrap">Wrap:</span>
			<select id="detail_param_wrap_direction">
				<option value="ltr" title="Left To Right">Left To Right</option>
				<option value="rtl" title="Right To Left">Right To Left</option>
				<option value="ttb" title="Top To Bottom">Top To Bottom</option>
				<option value="btt" title="Bottom To Top">Bottom To Top</option>
			</select>
		</div>
		<div class="row">
			<span class="trn label" title="Wrap At">Wrap At:</span>
			<select id="detail_param_wrap">
				<option value="letter" title="Word + Letter">Word + Letter</option>
				<option value="word" title="Word">Word</option>
			</select>
		</div>
		<div class="row">
			<span class="trn label" title="Horizontal Alignment">Horizontal Alignment:</span>
			<select id="detail_param_halign">
				<option value="left" title="Left">Left</option>
				<option value="center" title="Center">Center</option>
				<option value="right" title="Right">Right</option>
			</select>
		</div>
		<div class="row" hidden> <!-- Future implementation -->
			<span class="trn label" title="Vertical Alignment">Vertical Alignment:</span>
			<select id="detail_param_valign">
				<option value="top" title="Top">Top</option>
				<option value="middle" title="Middle">Middle</option>
				<option value="bottom" title="Bottom">Bottom</option>
			</select>
		</div>
	<div>
`;

/**
 * GUI class responsible for rendering selected layer details block on right sidebar
 */
class GUIDetailsClass {

	constructor() {
		this.POP = new DialogClass();
		this.Text = new TextClass();
		this.BaseLayers = new BaseLayersClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.Helper = new HelperClass();
		this.layerDetailsActive = false;
		this.ToolsTranslate = new ToolsTranslateClass();
	}

	renderMainDetails() {
		document.getElementById('toggle_details').innerHTML = template;
		
		if (config.LANG != 'en') {
			this.ToolsTranslate.translate(config.LANG, document.getElementById('toggle_details'));
		}
		
		this.renderDetails(true);
	}

	renderDetails(events = false) {
		this.renderGeneral('x', events);
		this.renderGeneral('y', events);
		this.renderGeneral('width', events);
		this.renderGeneral('height', events);

		this.renderGeneral('rotate', events);
		this.renderGeneral('opacity', events);
		this.renderColor(events);
		this.renderReset(events);

		// Text - Special case
		if (config.layer != undefined && config.layer.type == 'text') {
			document.getElementById('text_detail_params').style.display = 'block';
			document.getElementById('detail_color').closest('.row').style.display = 'none';
		} else {
			document.getElementById('text_detail_params').style.display = 'none';

			if (config.layer != undefined && (config.layer.color === null || config.layer.type == 'image')) {
				// Hide color
				document.getElementById('detail_color').closest('.row').style.display = 'none';
			} else {
				// Show color
				document.getElementById('detail_color').closest('.row').style.display = 'block';
			}
		}

		// Add params
		this.renderMoreParameters();

		this.renderText(events);
		this.renderGeneralSelectParam('boundary', events);
		this.renderGeneralSelectParam('kerning', events);
		this.renderGeneralSelectParam('text_direction', events);
		this.renderGeneralSelectParam('wrap', events);
		this.renderGeneralSelectParam('wrap_direction', events);
		this.renderGeneralSelectParam('halign', events);
		this.renderGeneralSelectParam('valign', events);
	}

	renderGeneral(key, events) {
		var layer = config.layer;
		var _this = this;
		var units = this.Tools_settings.get_setting('default_units');
		var resolution = this.Tools_settings.get_setting('resolution');

		if (layer != undefined) {
			var target = document.getElementById('detail_' + key);
			target.dataset.layer = layer.id;
			if (layer[key] == null) {
				target.value = '';
				target.disabled = true;
			} else {
				var value = layer[key];

				if (key == 'x' || key == 'y' || key == 'width' || key == 'height') {
					// Convert units
					value = this.Helper.getUserUnit(value, units, resolution);
				} else {
					value = Math.round(value);
				}

				// Set
				target.value = value;
				target.disabled = false;
			}
		}

		if (events) {
			// Events
			var target = document.getElementById('detail_' + key);
			
			if (target == undefined) {
				console.log('Error: Missing details event target ' + 'detail_' + key);
				return;
			}
			
			let focusValue = null;
			
			target.addEventListener('focus', function(e) {
				focusValue = parseFloat(this.value);
			});
			
			target.addEventListener('blur', function(e) {
				if (key == 'x' || key == 'y' || key == 'width' || key == 'height') {
					// Convert units
					var value = _this.Helper.getInternalUnit(this.value, units, resolution);
				} else {
					var value = parseInt(this.value);
				}
				
				var layer = _this.BaseLayers.getLayer(e.target.dataset.layer);
				layer[key] = focusValue;
				
				if (focusValue !== value) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(layer.id, {
								[key]: value
							})
						])
					);
				}
			});
			
			target.addEventListener('change', function(e) {
				if (key == 'x' || key == 'y' || key == 'width' || key == 'height') {
					// Convert units
					var value = _this.Helper.get_internal_unit(this.value, units, resolution);
				} else {
					var value = parseInt(this.value);
				}
				
				if (this.min != undefined && this.min != '' && value < this.min) {
					document.getElementById('detail_opacity').value = value;
					value = this.min;
				}
				if (this.max != undefined && this.min != '' && value > this.max) {
					document.getElementById('detail_opacity').value = value;
					value = this.max;
				}
				
				config.layer[key] = value;
				config.needRender = true;
			});
			
			target.addEventListener('keyup', function(e) {
				// For edge....
				if (e.keyCode != 13) {
					return;
				}

				if (key == 'x' || key == 'y' || key == 'width' || key == 'height') {
					// Convert units
					var value = _this.Helper.getInternalUnit(this.value, units, resolution);
				} else {
					var value = parseInt(this.value);
				}
				
				if (this.min != undefined && this.min != '' && value < this.min) {
					document.getElementById('detail_opacity').value = value;
					value = this.min;
				}
				
				if (this.max != undefined && this.min != '' && value > this.max) {
					document.getElementById('detail_opacity').value = value;
					value = this.max;
				}
				
				config.layer[key] = value;
				config.needRender = true;
			});
		}
	}

	renderGeneralParam(key, events) {
		var layer = config.layer;

		if (layer != undefined) {
			var target = document.getElementById('detail_param_' + key);
			
			if (layer.params[key] == null) {
				target.value = '';
				target.disabled = true;
			} else {
				if (typeof layer.params[key] == 'boolean') {
					// Boolean
					if (target.tagName == 'BUTTON') {
						if (layer.params[key]) {
							target.classList.add('active');
						} else {
							target.classList.remove('active');
						}
					}
				} else {
					// Common
					target.value = layer.params[key];
				}
				target.disabled = false;
			}
		}

		if (events) {
			// Events
			var target = document.getElementById('detail_param_' + key);
			let focusValue = null;
			
			target.addEventListener('focus', function(e) {
				focusValue = parseInt(this.value);
			});
			
			target.addEventListener('blur', function(e) {
				var value = parseInt(this.value);
				config.layer.params[key] = focusValue;
				let paramsCopy = JSON.parse(JSON.stringify(config.layer.params));
				paramsCopy[key] = value;
				
				if (focusValue !== value) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								params: paramsCopy
							})
						])
					);
				}
			});
			
			target.addEventListener('change', function(e) {
				var value = parseInt(this.value);
				config.layer.params[key] = value;
				config.needRender = true;
				config.needRenderChangedParams = true;
			});
			
			target.addEventListener('click', function(e) {
				if (typeof config.layer.params[key] != 'boolean')
					return;
				
				this.classList.toggle('active');
				config.layer.params[key] = !config.layer.params[key];
				config.needRender = true;
				config.needRenderChangedParams = true;
			});
		}
	}

	renderGeneralSelectParam(key, events) {
		var layer = config.layer;

		if (layer != undefined) {
			var target = document.getElementById('detail_param_' + key);

			if (layer.params[key] == null) {
				target.value = '';
				target.disabled = true;
			} else {
				if (typeof layer.params[key] == 'object')
					target.value = layer.params[key].value; // Legacy
				else
					target.value = layer.params[key];
				
				target.disabled = false;
			}
		}

		if (events) {
			// Events
			var target = document.getElementById('detail_param_' + key);
			let focusValue = null;
			
			target.addEventListener('focus', function(e) {
				focusValue = this.value;
			});
			
			target.addEventListener('blur', function(e) {
				var value = this.value;
				config.layer.params[key] = focusValue;
				let paramsCopy = JSON.parse(JSON.stringify(config.layer.params));
				paramsCopy[key] = value;
				
				if (focusValue !== value) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								params: paramsCopy
							})
						])
					);
				}
			});
			
			target.addEventListener('change', function(e) {
				var value = this.value;
				config.layer.params[key] = value;
				config.needRender = true;
				config.needRenderChangedParams = true;
			});
		}
	}

	/**
	 * Item: Color
	 */
	renderColor(events) {
		var layer = config.layer;

		let $colorInput;
		
		if (events) {
			$colorInput = $(document.getElementById('detail_color')).uiColorInput();
		} else {
			$colorInput = $(document.getElementById('detail_color'));
		}

		if (layer != undefined) {
			$colorInput.uiColorInput('set_value', layer.color);
		}

		if (events) {
			// Events
			let focusValue = null;
			
			$colorInput.on('focus', function(e) {
				focusValue = $colorInput.uiColorInput('get_value');
			});
			
			$colorInput.on('change', function(e) {
				const value = $colorInput.uiColorInput('get_value');
				config.layer.color = focus_value;
				
				if (focusValue !== value) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								color: value
							})
						])
					);
				}
			});
		}
	}

	/**
	 * Item: Size reset button
	 */
	renderReset(events) {
		var layer = config.layer;

		if (layer != undefined) {
			// Size
			if (layer.widthOriginal != null) {
				document.getElementById('reset_size').classList.remove('hidden');
			} else {
				document.getElementById('reset_size').classList.add('hidden');
			}
		}

		if (events) {
			// Events
			document.getElementById('reset_x').addEventListener('click', function(e) {
				if (config.layer.x) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								x: 0
							})
						])
					);
				}
			});
			
			document.getElementById('reset_y').addEventListener('click', function(e) {
				if (config.layer.y) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								y: 0
							})
						])
					);
				}
			});
			
			document.getElementById('reset_size').addEventListener('click', function(e) {
				if (config.layer.width !== config.layer.widthOriginal
					|| config.layer.height !== config.layer.heightOriginal) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								width: config.layer.widthOriginal,
								height: config.layer.heightOriginal
							})
						])
					);
				}
			});
			
			document.getElementById('reset_rotate').addEventListener('click', function(e) {
				if (config.layer.rotate) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								rotate: 0
							})
						])
					);
				}
			});
			
			document.getElementById('reset_opacity').addEventListener('click', function(e) {
				if (config.layer.opacity != 100) {
					app.State.doAction(
						new app.Actions.BundleAction('change_layer_details', 'Change Layer Details', [
							new app.Actions.UpdateLayerAction(config.layer.id, {
								opacity: 100
							})
						])
					);
				}
			});
		}
	}

	/**
	 * Item: Text
	 */
	renderText(events) {
		if (events) {
			// Events
			document.getElementById('detail_param_text').addEventListener('click', function(e) {
				document.querySelector('#tools_container #text').click();
				document.getElementById('text_tool_keyboard_input').focus();
				config.needRender = true;
			});
		}
	}

	renderMoreParameters() {
		var _this = this;
		var targetID = "parameters_container";
		const itemContainer = document.getElementById(targetID);

		if (this.layerDetailsActive == true) {
			return;
		}

		itemContainer.innerHTML = "";

		if (!config.layer || typeof config.layer.params == 'undefined' || config.layer.type == 'text') {
			return;
		}

		// Find layer parameters settings
		var paramsConfig = null;
		
		for (var i in config.TOOLS) {
			if (config.TOOLS[i].name == config.layer.type) {
				paramsConfig =  config.TOOLS[i];
			}
		}
		
		if (paramsConfig == null) {
			return;
		}

		for (var k in paramsConfig.attributes) {
			var item = paramsConfig.attributes[k];

			// Hide some fields, in future name should start with underscore
			if (paramsConfig.name == 'rectangle' && k == 'square'
				|| paramsConfig.name == 'ellipse' && k == 'circle'
				|| paramsConfig.name == 'pencil' && k == 'pressure'
				|| paramsConfig.name == 'pencil' && k == 'size') {
				continue;
			}

			// Row
			let itemRow = document.createElement('div');
			itemRow.className = 'row';
			itemContainer.appendChild(itemRow);

			// Title
			var title = k[0].toUpperCase() + k.slice(1);
			title = title.replace("_", " ");
			let itemTitle = document.createElement('span');
			itemTitle.className = 'trn label';
			itemTitle.innerHTML = title;
			itemRow.appendChild(itemTitle);

			// Value
			if (typeof item == 'boolean' || (typeof item == 'object' && typeof item.value == 'boolean')) {
				// Boolean - True, False

				const elementInput = document.createElement('button');
				elementInput.type = 'button';
				elementInput.className = 'trn ui_toggle_button';
				elementInput.innerHTML = title;

				elementInput.dataset.key = k;
				itemRow.appendChild(elementInput);

				let value = config.layer.params[k];
				elementInput.setAttribute('aria-pressed', value);

				// Events
				elementInput.addEventListener('click', function (e) {
					// On leave
					let layer = config.layer;
					let key = this.dataset.key;
					let newValue = elementInput.getAttribute('aria-pressed') !== 'true';
					let params = JSON.parse(JSON.stringify(config.layer.params));
					params[key] = newValue;

					app.State.doAction(
						new app.Actions.UpdateLayerAction(layer.id, {
							params: params
						})
					);
				});
			} else if (typeof item == 'number' || (typeof item == 'object' && typeof item.value == 'number')) {
				// Numbers
				const elementInput = document.createElement('input');
				elementInput.type = 'number';
				elementInput.dataset.key = k;
				itemRow.appendChild(elementInput);

				let min = 1;
				let max = k === 'power' ? 100 : 999;
				let step = null;
				let value = config.layer.params[k];
				
				if (typeof item == 'object') {
					value = item.value;
					
					if (item.min != null) {
						min = item.min;
					}
					
					if (item.max != null) {
						max = item.max;
					}
					
					if (item.step != null) {
						step = item.step;
					}
				}
				
				elementInput.setAttribute('min', min);
				elementInput.setAttribute('max', max);
				
				if (item.step != null) {
					elementInput.setAttribute('step', step);
				}
				
				elementInput.setAttribute('value', config.layer.params[k]);

				// Events
				let focusValue = null;
				
				elementInput.addEventListener('focus', function(e) {
					focusValue = parseFloat(this.value);
					_this.layer_details_active = true;
				});
				
				elementInput.addEventListener('blur', function(e) {
					// On leave
					_this.layerDetailsActive = false;
					let layer = config.layer;
					let key = this.dataset.key;
					let newValue = parseInt(this.value);
					let params = JSON.parse(JSON.stringify(config.layer.params));
					params[key] = newValue;

					if (focusValue !== newValue) {
						app.State.doAction(
							new app.Actions.UpdateLayerAction(layer.id, {
								params: params
							})
						);
					}
				});
				
				elementInput.addEventListener('change', function(e) {
					// On change - Lots of events here in short time
					let key = this.dataset.key;
					let newValue = parseInt(this.value);

					config.layer.params[key] = newValue;
					config.needRender = true;
				});
			} else if (typeof item == 'string' && item[0] == '#') {
				// Color
				var elementInput = document.createElement('input');
				elementInput.type = 'color';
				let focusValue = null;
				
				const $colorInput = $(elementInput).uiColorInput({
						id: k,
						value: item
					})
					.on('change', () => {
						let layer = config.layer;
						let key = $colorInput.uiColorInput('get_id');
						let newValue = $colorInput.uiColorInput('get_value');
						let params = JSON.parse(JSON.stringify(config.layer.params));
						params[key] = new_value;

						app.State.doAction(
							new app.Actions.UpdateLayerAction(layer.id, {
								params: params
							})
						);
					});
				
				$colorInput.uiColorInput('set_value', config.layer.params[k]);

				itemRow.appendChild($colorInput[0]);
			}
			else {
				alertify.error('Error: Unsupported attribute type:' + typeof item + ', ' + k);
			}
		}
	}

}

export default GUIDetailsClass;
