import app from './../app.js';
import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import BaseLayersClass from './../core/base-layers.js';
import HelperClass from './../libs/helpers.js';

class GradientClass extends BaseToolsClass {

	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.Helper = new HelperClass();
		this.ctx = ctx;
		this.name = 'gradient';
		this.layer = {};
	}

	load() {
		this.defaultEvents();
	}

	mousedown(e) {
		var mouse = this.getMouseInfo(e);
		var params = this.getParams();
		
		if (mouse.clickValid == false)
			return;

		var name = this.name;
		var isVector = false;
		
		if (params.radial == true) {
			name = 'Radial Gradient';
			isVector = true;
		}

		// Register new object - Current layer is not ours or params changed
		this.layer = {
			type: this.name,
			name: this.Helper.ucfirst(name) + ' #' + this.BaseLayers.autoIncrement,
			params: this.clone(this.getParams()),
			status: 'draft',
			render_function: [this.name, 'render'],
			x: mouse.x,
			y: mouse.y,
			rotate: null,
			is_vector: isVector,
			color: null,
			data: {
				center_x: mouse.x,
				center_y: mouse.y,
			},
		};
		app.State.doAction(
			new app.Actions.BundleAction('new_gradient_layer', 'New Gradient Layer', [
				new app.Actions.InsertLayerAction(this.layer)
			])
		);
	}

	mousemove(e) {
		var mouse = this.getMouseInfo(e);
		var params = this.getParams();
		
		if (mouse.isDrag == false)
			return;
		
		if (mouse.clickValid == false) {
			return;
		}

		var width = mouse.x - this.layer.x;
		var height = mouse.y - this.layer.y;

		if (params.radial == true) {
			config.layer.x = this.layer.data.centerX - width;
			config.layer.y = this.layer.data.centerY - height;
			config.layer.width = width * 2;
			config.layer.height = height * 2;
		} else {
			config.layer.width = width;
			config.layer.height = height;
		}

		this.BaseLayers.render();
	}

	mouseup(e) {
		var mouse = this.getMouseInfo(e);
		var params = this.getParams();
		
		if (mouse.clickValid == false) {
			config.layer.status = null;
			return;
		}

		var width = mouse.x - this.layer.x;
		var height = mouse.y - this.layer.y;

		if (width == 0 && height == 0) {
			// Same coordinates - Cancel
			app.State.scrapLastAction();
			return;
		}

		let newSettings = {};
		
		if (params.radial == true) {
			newSettings = {
				x: this.layer.data.centerX - width,
				y: this.layer.data.centerY - height,
				width: width * 2,
				height: height * 2
			}
		} else {
			newSettings = {
				width,
				height
			}
		}
		
		newSettings.status = null;

		app.State.doAction(
			new app.Actions.UpdateLayerAction(config.layer.id, newSettings),
			{merge_with_history: 'new_gradient_layer'}
		);

		this.BaseLayers.render();
	}

	render(ctx, layer) {
		if (layer.width == 0 && layer.height == 0)
			return;

		var params = layer.params;
		var power = params.radialPower;
		
		if (power > 99) {
			power = 99;
		}
		
		var alpha = params.alpha / 100 * 255;
		
		if (power > 255) {
			power = 255;
		}

		var color1 = params.color1;
		var color2 = params.color2;
		var radial = params.radial;

		var color2RGB = this.Helper.hexToRGB(color2);

		var width = layer.x + layer.width - 1;
		var height = layer.y + layer.height - 1;

		if (radial == false) {
			// Linear
			ctx.beginPath();
			ctx.rect(0, 0, config.WIDTH, config.HEIGHT);
			var grd = ctx.createLinearGradient(
				layer.x, layer.y,
				width, height);

			grd.addColorStop(0, color1);
			grd.addColorStop(1, "rgba(" + color2RGB.r + ", " + color2RGB.g + ", "
				+ color2RGB.b + ", " + alpha / 255 + ")");
			ctx.fillStyle = grd;
			ctx.fill();
		} else {
			// Radial
			var distanceX = layer.width;
			var distanceY = layer.height;
			var centerX = layer.x + Math.round(layer.width / 2);
			var centerY = layer.y + Math.round(layer.height / 2);
			var distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
			var radgrad = ctx.createRadialGradient(
				centerX, centerY, distance * power / 100,
				centerX, centerY, distance);

			radgrad.addColorStop(0, color1);
			radgrad.addColorStop(1, "rgba(" + color2RGB.r + ", " + color2RGB.g + ", "
				+ color2RGB.b + ", " + alpha / 255 + ")");
			ctx.fillStyle = radgrad;
			ctx.fillRect(0, 0, config.WIDTH, config.HEIGHT);
		}
	}
}

export default GradientClass;
