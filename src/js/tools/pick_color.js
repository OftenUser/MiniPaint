import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import BaseLayersClass from './../core/base-layers.js';
import HelperClass from './../libs/helpers.js';
import BaseGUIClass from './../core/base-gui.js';

class PickColorClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.Helper = new HelperClass();
		this.BaseGUI = new BaseGUIClass();
		this.ctx = ctx;
		this.name = 'pick_color';
	}

	dragStart(event) {
		var _this = this;
		
		if (config.TOOL.name != _this.name)
			return;
		
		_this.mousedown(event);
	}

	dragMove(event) {
		var _this = this;
		
		if (config.TOOL.name != _this.name)
			return;
		
		_this.mousemove(event);
	}

	load() {
		var _this = this;

		// Mouse events
		document.addEventListener('mousedown', function(event) {
			_this.dragStart(event);
		});
		
		document.addEventListener('mousemove', function(event) {
			_this.dragMove(event);
		});
		
		document.addEventListener('mouseup', function(event) {
			var mouse = _this.getMouseInfo(event);
			
			if (config.TOOL.name != _this.name || mouse.clickValid == false)
				return;
			
			_this.copyColorToClipboard();
		});

		// Collect touch events
		document.addEventListener('touchstart', function(event) {
			_this.dragStart(event);
		});
		
		document.addEventListener('touchmove', function(event) {
			_this.dragMove(event);
		});
	}

	mousedown(e) {
		var mouse = this.getMouseInfo(e);
		
		if (mouse.clickValid == false) {
			return;
		}

		this.pickColor(mouse);
	}

	mousemove(e) {
		var mouse = this.getMouseInfo(e);
		
		if (mouse.isDrag == false || mouse.clickValid == false) {
			return;
		}

		this.pickColor(mouse);
	}

	pickColor(mouse) {
		var params = this.getParams();

		// Get canvas from layer
		if (params.global == false) {
			// Active layer
			var canvas = this.BaseLayers.convertLayerToCanvas(config.layer.id, null, false);
			var ctx = canvas.getContext("2d");
		} else {
			// Global
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");
			canvas.width = config.WIDTH;
			canvas.height = config.HEIGHT;
			this.BaseLayers.convertLayerToCanvas(ctx, null, false);
		}
		
		// Find color
		var c = ctx.getImageData(mouse.x, mouse.y, 1, 1).data;
		var hex = this.Helper.rgbToHex(c[0], c[1], c[2]);

		const newColorDefinition = {hex};
		
		if (c[3] > 0) {
			// Set alpha
			newColorDefinition.a = c[3];
		}
		
		this.BaseGUI.GUIColors.setColor(newColorDefinition);
	}

	copyColorToClipboard() {
		navigator.clipboard.writeText(config.COLOR);
	}
}

export default PickColorClass;
