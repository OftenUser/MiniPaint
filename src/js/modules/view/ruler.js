import config from './../../config.js';
import HelperClass from './../../libs/helpers.js';
import BaseGUIClass from './../../core/base-gui.js';
import BaseLayersClass from './../../core/base-layers.js';
import ToolsSettingsClass from './../tools/settings.js';

var instance = null;

class ViewRulerClass {

	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.GUI = new BaseGUIClass();
		this.BaseLayers = new BaseLayersClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.Helper = new HelperClass();

		this.setEvents();
	}

	setEvents() {
		var _this = this;

		window.addEventListener('resize', function(event) {
			// Resize
			_this.prepareRuler();
			_this.renderRuler();
		}, false);
		
		document.addEventListener('keydown', (event) => {
			var code = event.code;
			
			if (this.Helper.is_input(event.target))
				return;

			if (event.code == "KeyU" && event.ctrlKey != true && event.metaKey != true) {
				_this.ruler();
				event.preventDefault();
			}
		}, false);
	}

	ruler() {
		var rulerLeft = document.getElementById('ruler_left');
		var rulerTop = document.getElementById('ruler_top');
		var middleArea = document.getElementById('middle_area');

		if (config.ruler_active == false) {
			// Activate
			config.rulerActive = true;
			document.getElementById('middle_area').classList.add('has-ruler');
			rulerLeft.style.display = 'block';
			rulerTop.style.display = 'block';

			this.prepareRuler();
			this.renderRuler();
		} else {
			// Deactivate
			config.rulerActive = false;
			document.getElementById('middle_area').classList.remove('has-ruler');
			rulerLeft.style.display = 'none';
			rulerTop.style.display = 'none';
		}

		this.GUI.prepareCanvas();

		config.needRender = true;
	}

	prepareRuler() {
		if (config.rulerActive == false)
			return;

		var rulerLeft = document.getElementById('ruler_left');
		var rulerTop = document.getElementById('ruler_top');
		var middleArea = document.getElementById('middle_area');

		var middleAreaWidth = middleArea.clientWidth;
		var middleAreaHeight = middleArea.clientHeight;

		rulerLeft.width = 15;
		rulerLeft.height = middleAreaHeight - 20;

		rulerTop.width = middleAreaWidth - 20;
		rulerTop.height = 15;
	}

	renderRuler() {
		if (config.rulerActive == false)
			return;

		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		var rulerLeft = document.getElementById('ruler_left');
		var rulerTop = document.getElementById('ruler_top');

		var ctxLeft = ruler_left.getContext("2d");
		var ctxTop = ruler_top.getContext("2d");

		var color = '#111';
		var size = 15;

		// Calculate step
		var step = Math.ceil(10 * config.ZOOM);
		
		while (step < 5) {
			step = step * 2;
		}
		
		while (step > 10) {
			step = Math.ceil(step / 2);
		}
		
		var stepBig = step * 10;

		// Calculate begin/end point
		var beginX = Math.max(0, rulerTop.width / 2 - config.WIDTH * config.ZOOM / 2);
		var beginY = Math.max(0, rulerLeft.height / 2 - config.HEIGHT * config.ZOOM / 2);

		var endX = Math.min(rulerTop.width, rulerTop.width / 2 + config.WIDTH * config.ZOOM / 2);
		var endY = Math.min(rulerLeft.height, rulerLeft.height / 2 + config.HEIGHT * config.ZOOM / 2);

		// Left
		ctxLeft.strokeStyle = color;
		ctxLeft.lineWidth = 1;
		ctxLeft.font = "11px Arial";

		ctxLeft.clearRect(0, 0, rulerLeft.width, rulerLeft.height);

		ctxLeft.beginPath();
		
		for (var i = beginY; i < endY; i += step) {
			ctxLeft.moveTo(10, i + 0.5);
			ctxLeft.lineTo(size, i + 0.5);
		}
		
		ctxLeft.stroke();

		ctxLeft.beginPath();
		
		for (var i = beginY; i <= endY; i += stepBig) {
			ctxLeft.moveTo(0, i + 0.5);
			ctxLeft.lineTo(size, i + 0.5);

			var globalPos = this.BaseLayers.getWorldCoordinates(0, i - beginY);
			var value = this.Helper.getUserUnit(globalPos.y, units, resolution);

			if (units == 'inches') {
				// More decimals value
				var text = this.Helper.numberFormat(value, 1);
			} else {
				var text = Math.ceil(value);
			}
			
			text = text.toString();

			// Text
			for (var j = 0; j < text.length; j++) {
				var letter = text.charAt(j);
				var lineHeight = 10;
				ctxLeft.fillText(letter, 1, i + 11 + j * lineHeight);
			}
		}
		
		ctxLeft.stroke();

		// Top
		ctxLeft.strokeStyle = color;
		ctxTop.lineWidth = 1;
		ctxTop.font = "11px Arial";

		ctxTop.clearRect(0, 0, rulerTop.width, rulerTop.height);

		ctxTop.beginPath();
		
		for (var i = beginX; i < endX; i += step) {
			var y = (i / stepBig == parseInt(i / stepBig)) ? 0 : step;
			ctxTop.moveTo(i + 0.5, 10);
			ctxTop.lineTo(i + 0.5, size);
		}
		
		ctxTop.stroke();

		ctxTop.beginPath();
		
		for (var i = beginX; i <= endX; i += stepBig) {
			ctxTop.moveTo(i + 0.5, 0);
			ctxTop.lineTo(i + 0.5, size);

			var globalPos = this.BaseLayers.getWorldCoordinates(i - beginX, 0);
			var value = this.Helper.getUserUnit(globalPos.x, units, resolution);

			if (units == 'inches') {
				// More decimals value
				var text = this.Helper.numberFormat(value, 1);
			} else {
				var text = Math.ceil(value);
			}
			
			text = text.toString();

			// Text
			ctxTop.fillText(text, i + 3, 9);
		}
		
		ctxTop.stroke();
	}
}

export default ViewRulerClass;
