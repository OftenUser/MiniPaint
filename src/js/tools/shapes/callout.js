import BaseToolsClass from './../../core/base-tools.js';
import BaseLayersClass from './../../core/base-layers.js';

class CalloutClass extends BaseToolsClass {

	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.ctx = ctx;
		this.name = 'callout';
		this.layer = {};
		this.bestRatio = 1.3;
		this.snapLineInfo = {x: null, y: null};
	}

	load() {
		this.defaultEvents();
	}

	mousedown(e) {
		this.shapeMousedown(e);
	}

	mousemove(e) {
		this.shapeMousemove(e);
	}

	mouseup(e) {
		this.shapeMouseup(e);
	}

	render_overlay(ctx){
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
		this.drawShape(ctx, -width / 2, -height / 2, width, height);
		ctx.restore();
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
		this.drawShape(ctx, -layer.width / 2, -layer.height / 2, layer.width, layer.height);

		ctx.restore();
	}

	drawShape(ctx, x, y, width, height, coords) {
		ctx.lineJoin = "round";

		ctx.beginPath();

		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height * 0.6);

		ctx.lineTo(x + width / 2 + width / 10, y + height * 0.6);
		ctx.lineTo(x + width / 8, y + height);
		ctx.lineTo(x + width / 2 - width / 10, y + height * 0.6);

		ctx.lineTo(x, y + height * 0.6);
		ctx.lineTo(x, y);

		ctx.closePath();

		ctx.fill();
		ctx.stroke();
	}

}

export default CalloutClass;
