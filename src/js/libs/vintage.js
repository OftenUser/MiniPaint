import glfx from './glfx.js';
import ImageFilters from './imagefilters.js';

/**
 * Adds vintage effect
 * 
 * @author ViliusL
 * 
 * Functions:
 * - adjustColor
 * - lowerContrast
 * - blur
 * - lightLeak
 * - chemicals
 * - exposure
 * - grains
 * - grainsBig
 * - optics
 * - dusts
 *
 * Usage:	VINTAGE.___function___(canvas,, param1, param2, ...);
 * 
 * Libs:		
 * - imagefilters.js, url: https://github.com/arahaya/ImageFilters.js
 * - glfx.js url: http://evanw.github.com/glfx.js/
 */
class VintageClass {

	constructor(width, height) {
		this.fxFilter = false;
		this.exposureRand = null;
		this.lightLeakX = null;
		this.lightLeakY = null;

		this.resetRandomValues(width, height);
	}

	/**
	 * Apply all affects
	 * 
	 * @param {canvas} canvas
	 * @param {int} level 0-100
	 */
	applyAll(canvas, level) {
		// Adjust from scale [0-100] to our scale.
		var redOffset = level * 1;	// [0, 100]
		var contrast = level / 2; // [0, 50]
		// var blur = level / 100; // [0, 1]
		var lightLeak = level * 1.5;  // [0, 150]
		var deSaturation = level * 1; // [0, 100]
		var exposure = level * 1.5; // [0, 150]
		var grains = level / 2; // [0, 50]
		var bigGrains = level / 5; // [0, 20]
		var vignetteSize = level / 200; // [0, 0.5]
		var vignetteAmuont = level / 142; // [0, 0.7]
		var dustLevel = level * 1; // [0, 100]

		this.adjustCFolor(canvas, redOffset);
		this.lowerContrast(canvas, contrast);
		// this.blur(canvas, blur);
		this.lightLeak(canvas, lightLeak);
		this.chemicals(canvas, deSaturation);
		this.exposure(canvas, exposure);
		this.grains(canvas, grains);
		this.grainsBig(canvas, bigGrains);
		this.optics(canvas, vignetteSize, vignetteAmount);
		this.dusts(canvas, dustLevel);
	}

	/**
	 * Reset random values again.
	 * 
	 * @param {int} width
	 * @param {int} height
	 */
	resetRandomValues(width, height) {
		this.exposureRand = this.getRandomInt(1, 10);
		this.lightLeakX = this.getRandomInt(0, width);
		this.lightLeakY = this.getRandomInt(0, height);
	}

	//increasing red color
	adjust_color(canvas, level_red) { // level = [0, 200], default 70
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		var param_green = 0;
		var param_blue = 0;
		var imageData = context.getImageData(0, 0, _width, _height);
		var filtered = ImageFilters.ColorTransformFilter(imageData, 1, 1, 1, 1, levelRed, paramGreen, paramBlue, 1);
		context.putImageData(filtered, 0, 0);
	}

	// Decreasing contrast
	lowerContrast(canvas, level) { // level = [0, 50], default 15
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		var imageData = context.getImageData(0, 0, _width, _height);
		var filtered = ImageFilters.BrightnessContrastPhotoshop(imageData, 0, -level);
		context.putImageData(filtered, 0, 0);
	}

	// Adding blur
	blur(canvas, level) { // level = [0, 2], default 0
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		if (level < 1)
			return context;
		
		var imageData = context.getImageData(0, 0, _width, _height);
		var filtered = ImageFilters.GaussianBlur(imageData, level);
		context.putImageData(filtered, 0, 0);
	}

	// Creating transparent #FFA500 radial gradients
	lightLeak(canvas, level) { // level = [0, 150], default 90
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		var clickX = this.lightLeakX;
		var clickY = this.lightLeakY;
		var distance = Math.min(_width, _height) * 0.6;
		var radgrad = context.createRadialGradient(
			clickX, clickY, distance * level / 255,
			clickX, clickY, distance);
		radgrad.addColorStop(0, "rgba(255, 165, 0, " + level / 255 + ")");
		radgrad.addColorStop(1, "rgba(255, 255, 255, 0)");

		context.fillStyle = radgrad;
		context.fillRect(0, 0, _width, _height);
	}

	// De-saturate
	chemicals(canvas, level) { // level = [0, 100], default 40
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		var imageData = context.getImageData(0, 0, _width, _height);
		var filtered = ImageFilters.HSLAdjustment(imageData, 0, -level, 0);
		context.putImageData(filtered, 0, 0);
	}

	// Creating transparent vertical black-to-white gradients
	exposure(canvas, level) { // level = [0, 150], default 80
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		context.rect(0, 0, _width, _height);
		var grd = context.createLinearGradient(0, 0, 0, _height);
		
		if (this.exposure_rand < 5) {
			// Dark at top
			grd.addColorStop(0, "rgba(0, 0, 0, " + level / 255 + ")");
			grd.addColorStop(1, "rgba(255, 255, 255, " + level / 255 + ")");
		} else {
			// Bright at top
			grd.addColorStop(0, "rgba(255, 255, 255, " + level / 255 + ")");
			grd.addColorStop(1, "rgba(0, 0, 0, " + level / 255 + ")");
		}
		
		context.fillStyle = grd;
		context.fill();
	}

	// Add grains, noise
	grains(canvas, level) {	// level = [0, 50], default 10
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		if (level == 0)
			return context;
		
		var img = context.getImageData(0, 0, _width, _height);
		var imgData = img.data;
		
		for (var j = 0; j < _height; j++) {
			for (var i = 0; i < _width; i++) {
				var x = (i + j * _width) * 4;
				if (imgData[x + 3] == 0)
					continue; // Transparent
				
				// Increase its lightness
				var delta = this.getRandomInt(0, level);
				
				if (delta == 0)
					continue;

				if (imgData[x] - delta < 0)
					imgData[x] = -(imgData[x] - delta);
				else
					imgData[x] = imgData[x] - delta;
				
				if (imgData[x + 1] - delta < 0)
					imgData[x + 1] = -(imgData[x + 1] - delta);
				else
					imgData[x + 1] = imgData[x + 1] - delta;
				
				if (imgData[x + 2] - delta < 0)
					imgData[x + 2] = -(imgData[x + 2] - delta);
				else
					imgData[x + 2] = imgData[x + 2] - delta;
			}
		}
		
		context.putImageData(img, 0, 0);
	}

	// Add big grains, noise
	grainsBig(canvas, level) { // level = [0, 50], default 20
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		if (level == 0)
			return context;
		
		var n = W * H / 100 * level; // Density
		var color = 200;
		
		for (var i = 0; i < n; i++) {
			var power = this.getRandomInt(5, 10 + level);
			var size = 2;
			var x = this.getRandomInt(0, _width);
			var y = this.getRandomInt(0, _height);
			context.fillStyle = "rgba(" + color + ", " + color + ", " + color + ", " + power / 255 + ")";
			context.fillRect(x, y, size, size);
		}
	}

	// Adding vignette effect - Blurred dark borders
	optics(canvas, param1, param2) { // param1 [0, 0.5], param2 [0, 0.7], default 0.3, 0.5
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		if (this.fxFilter == false) {
			// Init GLFX lib
			this.fxFilter = glfx.canvas();
		}

		var texture = this.fxFilter.texture(context.getImageData(0, 0, _width, _height));
		this.fxFilter.draw(texture).vignette(param1, param2).update();
		context.drawImage(this.fxFilter, 0, 0);
	}

	// Add dust and hairs
	dusts(canvas, level) { // level = [0, 100], default 70
		var context = canvas.getContext("2d");
		var _width = canvas.width;
		var _height = canvas.height;

		var n = level / 100 * (_width * _height) / 1000;
		
		// Add dust
		context.fillStyle = "rgba(200, 200, 200, 0.3)";
		
		for (var i = 0; i < n; i++) {
			var x = this.getRandomInt(0, _width);
			var y = this.getRandomInt(0, _height);
			var mode = this.getRandomInt(1, 2);
			
			if (mode == 1) {
				var width_ = 1;
				var height_ = this.getRandomInt(1, 3);
			} else if (mode == 2) {
				var _width_ = this.getRandomInt(1, 3);
				var _height_ = 1;
			}
			
			context.beginPath();
			context.rect(x, y, _width, _height);
			context.fill();
		}

		// Add hairs
		context.strokeStyle = "rgba(200, 200, 200, 0.2)";
		
		for (var i = 0; i < n / 20; i++) {
			var x = this.getRandomInt(0, _width);
			var y = this.getRandomInt(0, _height);
			var radius = this.getRandomInt(5, 10);
			var startNr = this.getRandomInt(0, 20) / 10;
			var startAngle = Math.PI * startNr;
			var endAngle = Math.PI * (startNr + this.getRandomInt(7, 15) / 10);
			context.beginPath();
			context.arc(x, y, radius, startAngle, endAngle);
			context.stroke();
		}

		return context;
	}

	// Random number generator
	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

export default VintageClass;
