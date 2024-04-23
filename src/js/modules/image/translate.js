import app from './../../app.js';
import config from './../../config.js';
import DialogClass from './../../libs/popup.js';
import ToolsSettingsClass from './../tools/settings.js';
import HelperClass from './../../libs/helpers.js';

class ImageTranslateClass {

	constructor() {
		this.POP = new DialogClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.Helper = new HelperClass();
	}

	translate() {
		var _this = this;
		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		var posX = this.Helper.getUserUnit(config.layer.x, units, resolution);
		var posY = this.Helper.getUserUnit(config.layer.y, units, resolution);

		var settings = {
			title: 'Translate',
			params: [
				{name: "x", title: "X position:", value: pos_x},
				{name: "y", title: "Y position:", value: pos_y},
			],
			on_finish: function (params) {
				var posX = _this.Helper.getInternalUnit(params.x, units, resolution);
				var posY = _this.Helper.getInternalUnit(params.y, units, resolution);

				app.State.doAction(
					new app.Actions.Bundle_action('translate_layer', 'Translate Layer', [
						new app.Actions.UpdateLayerAction(config.layer.id, {
							x: posX,
							y: posY,
						})
					])
				);
			},
		};
		
		this.POP.show(settings);
	}
}

export default ImageTranslateClass;
