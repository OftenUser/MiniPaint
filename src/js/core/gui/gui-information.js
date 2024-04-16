/*
 * MiniPaint - https://github.com/Viliusle/MiniPaint
 * Author: Vilius L.
 */

import config from './../../config.js';
import BaseLayersClass from './../base-layers.js';
import ToolsSettingsClass from './../../modules/tools/settings.js';
import HelperClass from './../../libs/helpers.js';
import ToolsTranslateClass from './../../modules/tools/translate.js';

var template = `
	<span class="trn label">Size:</span>
	<span id="mouse_info_size">-</span> 
	<span class="id-mouse_info_units"></span>
	<br />
	<span class="trn label">Mouse:</span>
	<span id="mouse_info_mouse">-</span>
	<span class="id-mouse_info_units"></span>
	<br />
	<span class="trn label">Resolution:</span>
	<span id="mouse_info_resolution">-</span>
`;

/**
 * GUI class responsible for rendering information block on right sidebar
 */
class GUIInformationClass {

	constructor(ctx) {
		this.BaseLayers = new BaseLayersClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.Helper = new HelperClass();
		this.ToolsTranslate = new ToolsTranslateClass();
		this.lastWidth = null;
		this.lastHeight = null;
		this.units = this.ToolsSettings.getSetting('default_units');
		this.resolution = this.ToolsSettings.getSetting('resolution');
	}

	renderMainInformation() {
		document.getElementById('toggle_info').innerHTML = template;
		
		if (config.LANG != 'en') {
			this.ToolsTranslate.translate(config.LANG, document.getElementById('toggle_info'));
		}
		
		this.setEvents();
		this.showSize();
	}

	setEvents() {
		var _this = this;
		var target = document.getElementById('mouse_info_mouse');

		// Show width and height
		// Should use canvas resize API in future
		document.addEventListener('mousemove', function(e) {
			_this.show_size();
		}, false);

		// Show current mouse position
		document.getElementById('canvas_minipaint').addEventListener('mousemove', function(e) {
			var globalPos = _this.BaseLayers.getWorldCoordinates(e.offsetX, e.offsetY);
			var mouseX = Math.ceil(globalPos.x);
			var mouseY = Math.ceil(globalPos.y);

			mouseX = _this.Helper.getUserUnit(mouseX, _this.units, _this.resolution);
			mouseY = _this.Helper.getUserUnit(mouseY, _this.units, _this.resolution);

			target.innerHTML = mouseX + ', ' + mouseY;
		}, false);
	}

	updateUnits() {
		this.units = this.ToolsSettings.getSetting('default_units');
		this.resolution = this.ToolsSettings.getSetting('resolution');
		this.showSize(true);
	}

	showSize(force) {
		if(force == undefined && this.last_width == config.WIDTH && this.last_height == config.HEIGHT) {
			return;
		}

		var width = this.Helper.getUserUnit(config.WIDTH, this.units, this.resolution);
		var height = this.Helper.getUserUnit(config.HEIGHT, this.units, this.resolution);

		document.getElementById('mouse_info_size').innerHTML = width + ' x ' + height;

		var resolution = this.ToolsSettings.getSetting('resolution');
		document.getElementById('mouse_info_resolution').innerHTML = resolution;

		// Show units
		var defaultUnits = this.ToolsSettings.getSetting('default_units_short');
		var targets = document.querySelectorAll('.id-mouse_info_units');
		for (var i = 0; i < targets.length; i++) {
			targets[i].innerHTML = defaultUnits;
		}

		this.lastWidth = config.WIDTH;
		this.lastHeight = config.HEIGHT;
	}

}

export default GUIInformationClass;
