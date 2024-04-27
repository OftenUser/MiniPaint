import app from './../../app.js';
import config from './../../config.js';
import BaseToolsClass from './../../core/base-tools.js';
import BaseLayersClass from './../../core/base-layers.js';

class TriangleClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.ctx = ctx;
		this.name = 'Triangle';
		this.layer = {};
		this.bestRatio = 2 / Math.sqrt(3);
		this.snapLineInfo = {x: null, y: null};
		this.coordinates = [
			[50, 0],
			[100, 100],
			[0, 100],
			[50, 0],
		];
	}

	load() {
		this.defaultEvents();
	}

	mousedown(e) {
		this.shapeMouseDown(e);
	}

	mousemove(e) {
		this.shapeMouseMove(e);
	}

	mouseup(e) {
		this.shapeMouseUp(e);
	}

	renderOverlay(ctx) {
		var ctx = this.BaseLayers.ctx;
		this.renderOverlayParent(ctx);
	}

	demo(ctx, x, y, width, height) {
		this.drawShape(ctx, x, y, width, height, this.coordinates);
	}

	render(ctx, layer) {
		var params = layer.params;
		var fill = params.fill;

		ctx.save();

		// Set styles
		ctx.strokeStyle = 'transparent';
		ctx.fillStyle = 'transparent';
		
		if (params.border)
			ctx.strokeStyle = params.borderColor;
		
		if (params.fill)
			ctx.fillStyle = params.fillColor;
		
		ctx.lineWidth = params.borderSize;

		// Draw with rotation support
		ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
		ctx.rotate(layer.rotate * Math.PI / 180);
		this.drawShape(ctx, -layer.width / 2, -layer.height / 2, layer.width, layer.height, this.coordinates, false);

		ctx.restore();
	}
}

export default TriangleClass;
