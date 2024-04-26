import app from './../app.js';
import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import BaseLayersClass from './../core/base-layers.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';
import ImageFilters from './../libs/imagefilters.js';
import HelperClass from './../libs/helpers.js';

class SharpenClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.Helper = new HelperClass();
		this.ctx = ctx;
		this.name = 'sharpen';
		this.tmpCanvas = null;
		this.tmpCanvasCtx = null;
		this.started = false;
	}

	load() {
		this.defaultEvents();
	}

	defaultDragMove(event) {
		if (config.TOOL.name != this.name)
			return;
		
		this.mousemove(event);

		// Mouse cursor
		var mouse = this.getMouseInfo(event);
		var params = this.getParams();
		this.showMouseCursor(mouse.x, mouse.y, params.size, 'circle');
	}

	mousedown(e) {
		this.started = false;
		var mouse = this.getMouseInfo(e);
		var params = this.getParams();
		
		if (mouse.clickValid == false) {
			return;
		}
		
		if (config.layer.type != 'image') {
			alertify.error('This layer must contain an image. Please convert it to raster to apply this tool.');
			return;
		}
		
		if (config.layer.rotate || 0 > 0) {
			alertify.error('Erase on rotate object is disabled. Please rasterize first.');
			return;
		}
		
		this.started = true;

		// Get canvas from layer
		this.tmpCanvas = document.createElement('canvas');
		this.tmpCanvasCtx = this.tmpCanvas.getContext("2d");
		this.tmpCanvas.width = config.layer.widthOriginal;
		this.tmpCanvas.height = config.layer.heightOriginal;
		this.tmpCanvasCtx.drawImage(config.layer.link, 0, 0);

		// Do sharpen
		this.sharpenGeneral('click', mouse, params.size);

		// Register tmp canvas for faster redraw
		config.layer.linkCanvas = this.tmpCanvas;
		config.needRender = true;
	}

	mousemove(e) {
		var mouse = this.getMouseInfo(e);
		var params = this.getParams();
		
		if (mouse.isDrag == false)
			return;
		
		if (mouse.clickValid == false) {
			return;
		}
		
		if (this.started == false) {
			return;
		}

		// Do sharpen
		this.sharpenGeneral('move', mouse, params.size);

		// Draw draft preview
		config.needRender = true;
	}

	mouseup(e) {
		if (this.started == false) {
			return;
		}
		
		delete config.layer.linkCanvas;

		app.State.doAction(
			new app.Actions.BundleAction('sharpen_tool', 'Sharpen Tool', [
				new app.Actions.UpdateLayerImageAction(this.tmpCanvas)
			])
		);

		// Decrease memory
		this.tmpCanvas.width = 1;
		this.tmpCanvas.height = 1;
		this.tmpCanvas = null;
		this.tmpCanvasCtx = null;
	}

	sharpenGeneral(type, mouse, size) {
		var ctx = this.tmpCanvasCtx;
		var mouseX = Math.round(mouse.x) - config.layer.x;
		var mouseY = Math.round(mouse.y) - config.layer.y;

		// Adapt to origin size
		mouseX = this.adaptSize(mouseX, 'width');
		mouseY = this.adaptSize(mouseY, 'height');
		var sizeWidth = this.adaptSize(size, 'width');
		var sizeHeight = this.adaptSize(size, 'height');

		// Find center
		var centerX = mouseX - Math.round(sizeWidth / 2);
		var centerY = mouseY - Math.round(sizeHeight / 2);

		// Convert float coordinates to integers
		mouseX = Math.round(mouseX);
		mouseY = Math.round(mouseY);
		centerX = Math.round(centerX);
		centerY = Math.round(centerY);

		var power = 0.5;
		
		if (type == 'move') {
			power = power / 10;
		}

		var imageData = ctx.getImageData(centerX, centerY, sizeWidth, sizeHeight);
		var filtered = ImageFilters.Sharpen(imageData, power); // Add effect
		this.Helper.imageRound(this.tmpCanvasCtx, mouseX, mouseY, sizeWidth, sizeHeight, filtered);
	}
}

export default SharpenClass;
