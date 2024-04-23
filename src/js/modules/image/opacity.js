import app from './../../app.js';
import config from './../../config.js';
import DialogClass from './../../libs/popup.js';

class ImageOpacityClass {

	constructor() {
		this.POP = new DialogClass();
	}

	opacity() {
		var _this = this;
		var initialOpacity = config.layer.opacity;

		var settings = {
			title: 'Opacity',
			params: [
				{name: "opacity", title: "Alpha:", value: config.layer.opacity, range: [0, 100]},
			],
			on_change: function(params, canvasPreview, _width, _height) {
				_this.opacityHandler(params, false);
			},
			on_finish: function(params) {
				config.layer.opacity = initialOpacity;
				_this.opacityHandler(params);
			},
			on_cancel: function(params) {
				config.layer.opacity = initialOpacity;
				config.needRender = true;
			},
		};
		
		this.POP.show(settings);
	}

	opacityHandler(data, isFinal = true) {
		var value = parseInt(data.opacity);
		if (value < 0)
			value = 0;
		
		if (value > 100)
			value = 100;
		
		if (isFinal) {
			app.State.doAction(
				new app.Actions.BundleAction('change_opacity', 'Change Opacity', [
					new app.Actions.UpdateLayerAction(config.layer.id, {
						opacity: value
					})
				])
			);
		} else {
			config.layer.opacity = value;
			config.needRender = true;
		}
	}
}

export default ImageOpacityClass;
