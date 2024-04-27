import BaseToolsClass from './../../core/base-tools.js';
import BaseLayersClass from './../../core/base-layers.js';

class MoonClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.ctx = ctx;
		this.name = 'Moon';
		this.layer = {};
		this.bestRatio = 0.8;
		this.snapLineInfo = {x: null, y: null};
	}

	load() {
		this.default_events();
	}

	mousedown(e) {
		this.shape_mousedown(e);
	}

	mousemove(e) {
		this.shape_mousemove(e);
	}

	mouseup(e) {
		this.shape_mouseup(e);
	}

	renderOverlay(ctx) {
		var ctx = this.BaseLayers.ctx;
		this.renderOverlayParent(ctx);
	}

	demo(ctx, x, y, width, height) {
		ctx.fillStyle = '#AAA';
		ctx.strokeStyle = '#555';
		ctx.lineWidth = 2;

		var widthAll = width + x * 2;
		width = height * this.bestRatio;
		x = (widthAll - width) / 2;

		ctx.save();
		ctx.translate(x + width / 2, y + height / 2);
		this.drawShape(ctx, -width / 2, -height / 2, width, height, true, true);
		ctx.restore();
	}

	render(ctx, layer) {
		var params = layer.params;
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
		this.drawShape(ctx, -layer.width / 2, -layer.height / 2, layer.width, layer.height, params.fill, params.border);

		ctx.restore();
	}

	drawShape(ctx, x, y, width, height, fill, stroke) {
		var left = parseInt(x);
		var top = parseInt(y);

		ctx.beginPath();
		ctx.moveTo(left + width * 0.512, top + height / 2);
		
		ctx.bezierCurveTo(
			left + width * 51.2 / 100, top + height * 28.4 / 100,
			left + width * 71.5 / 100, top + height * 10.1 / 100,
			left + width * 100 / 100, top + height * 3.1 / 100
		);
		
		ctx.bezierCurveTo(
			left + width * 92 / 100, top + height * 1.1 / 100,
			left + width * 83.4 / 100, top + height * 0 / 100,
			left + width * 74.4 / 100, top + height * 0 / 100
		);
		
		ctx.bezierCurveTo(
			left + width * 33.3 / 100, top + height * 0 / 100,
			left + width * 0 / 100, top + height * 22.4 / 100,
			left + width * 0 / 100, top + height * 50 / 100
		);
		
		ctx.bezierCurveTo(
			left + width * 0 / 100, top + height * 77.6 / 100,
			left + width * 33.3 / 100, top + height * 100 / 100,
			left + width * 74.4 / 100, top + height * 100 / 100
		);
		
		ctx.bezierCurveTo(
			left + width * 83.4 / 100, top + height * 100 / 100,
			left + width * 92 / 100, top + height * 98.9 / 100,
			left + width * 100 / 100, top + height * 96.9 / 100
		);
		
		ctx.bezierCurveTo(
			left + width * 71.5 / 100, top + height * 89.9 / 100,
			left + width * 51.2 / 100, top + height * 71.6 / 100,
			left + width * 51.2 / 100, top + height * 50 / 100
		);
		
		ctx.closePath();
		
		if (fill) {
			ctx.fill();
		}
		
		if (stroke) {
			ctx.stroke();
		}
	}
}

export default MoonClass;
