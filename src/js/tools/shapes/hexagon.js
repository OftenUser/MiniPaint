import app from './../../app.js';
import config from './../../config.js';
import BaseToolsClass from './../../core/base-tools.js';
import BaseLayersClass from './../../core/base-layers.js';

class HexagonClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.ctx = ctx;
		this.name = 'hexagon';
		this.layer = {};
		this.bestRatio = 1.1547005;
		this.snapLineInfo = {x: null, y: null};
		this.coordinates = [
			[75, 6.698729810778069],
			[100, 50],
			[75, 93.30127018922192],
			[24.99999999999999, 93.30127018922192],
			[0, 50.00000000000001],
			[24.99999999999998, 6.698729810778076],
			[75, 6.698729810778069],
			[75, 6.698729810778069],
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
		ctx.fillStyle = '#AAA';
		ctx.strokeStyle = '#555';
		ctx.lineWidth = 2;

		this.drawShape(ctx, x, y - 5, width, height, this.coordinates);

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
		this.drawShape(ctx, -layer.width / 2, -layer.height / 2, layer.width, layer.height, this.coords);

		ctx.restore();
	}

	drawShape(ctx, x, y, width, height, coordinates) {
		ctx.lineJoin = "round";

		ctx.beginPath();

		ctx.scale(1, this.bestRatio);

		for (var i in coordinates) {
			if (coordinates[i] === null) {
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				continue;
			}

			// Coordinates in 100x100 box
			var posX = x + coordinates[i][0] * width / 100;
			var posY = y + coordinates[i][1] * height / 100;

			if (i == '0')
				ctx.moveTo(posX, posY);
			else
				ctx.lineTo(posX, posY);
		}
		
		ctx.closePath();

		ctx.fill();
		ctx.stroke();
	}
}

export default HexagonClass;
