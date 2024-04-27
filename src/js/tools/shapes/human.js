import app from './../../app.js';
import config from './../../config.js';
import BaseToolsClass from './../../core/base-tools.js';
import BaseLayersClass from './../../core/base-layers.js';

class HumanClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.ctx = ctx;
		this.name = 'human';
		this.layer = {};
		this.bestRatio = 0.35;
		this.snapLineInfo = {x: null, y: null};
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

	drawShape(ctx, x, y, width, height) {
		ctx.lineJoin = "round";

		ctx.beginPath();

		ctx.translate(-width / 2, -height / 2);

		var radius = Math.sqrt(width * height) * 0.28;
		var neckHeight = height * 0.07;
		var legHeight = height * 0.3;
		
		if (radius * 2 + neckHeight + legHeight > height) {
			radius = (height - legHeight - neckHeight) / 2;
		}

		ctx.arc(width / 2, radius, radius, 0, 2 * Math.PI);
		
		// Body
		ctx.moveTo(width / 2, radius * 2);
		ctx.lineTo(width / 2, height - legHeight);
		
		// Arm
		ctx.moveTo(0, radius * 2 + neckHeight);
		ctx.lineTo(width, radius * 2 + neckHeight);
		
		// Left leg
		ctx.moveTo(width / 2, height - legHeight);
		ctx.lineTo(0, height);
		
		// Right leg
		ctx.moveTo(width / 2, height - legHeight);
		ctx.lineTo(width, height);

		ctx.fill();
		ctx.stroke();
	}
}

export default HumanClass;
