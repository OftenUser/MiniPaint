import config from './../../config.js';
import DialogClass from './../../libs/popup.js';
import HelperClass from './../../libs/helpers.js';
import BaseLayersClass from './../../core/base-layers.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';
import ToolsSettingsClass from './../tools/settings.js';
import app from './../../app.js';

class ViewGuidesClass {
	constructor() {
		this.POP = new DialogClass();
		this.BaseLayers = new BaseLayersClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.Helper = new HelperClass();
	}

	insert() {
		var _this = this;
		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		// Convert units
		var position = 20;
		var position = this.Helper.getUserUnit(position, units, resolution);

		var settings = {
			title: 'Insert Guides',
			params: [
				{name: "type", title: "Type:", values: ["Vertical", "Horizontal"], value :"Vertical"},
				{name: "position", title: "Position:",  value: position},
			],
			on_finish: function(params) {
				_this.insertHandler(params);
			},
		};
		
		this.POP.show(settings);
	}

	insertHandler(data) {
		var type = data.type;
		var position = parseFloat(data.position);
		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		// Convert units
		position = this.Helper.getInternalUnit(position, units, resolution);

		var x = null;
		var y = null;
		
		if (type == 'Vertical')
			x = position;
		
		if (type == 'Horizontal')
			y = position;

		// Update
		config.guides.push({x: x, y: y});

		if (config.guidesEnabled == false) {
			// Was disabled
			config.guidesEnabled = true;
			this.Helper.setCookie('guides', 1);
			alertify.warning('Guides enabled.');
		}

		config.needRender = true;
	}

	update() {
		var _this = this;
		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		var params = [];
		
		for (var i in config.guides) {
			var guide = config.guides[i];

			// Convert units
			var value = guide.x;
			var value = this.Helper.getUserUnit(value, units, resolution);

			if (guide.y === null) {
				params.push({name: i, title: "Vertical:", value: value});
			}
		}
		
		for (var i in config.guides) {
			var guide = config.guides[i];

			// Convert units
			var value = guide.y;
			var value = this.Helper.getUserUnit(value, units, resolution);

			if (guide.x === null) {
				params.push({name: i, title: "Horizontal:", value: value});
			}
		}

		var settings = {
			title: 'Update guides',
			params: params,
			on_finish: function(params) {
				_this.updateHandler(params);
			},
		};
		
		this.POP.show(settings);
	}

	updateHandler(data) {
		var units = this.ToolsSettings.getSetting('default_units');
		var resolution = this.ToolsSettings.getSetting('resolution');

		// Update
		for (var i in data) {
			var key = parseInt(i);
			var value = parseFloat(data[i]);

			// Convert units
			value = this.Helper.getInternalUnit(value, units, resolution);

			if (config.guides[key].x === null)
				config.guides[key].y = value;
			else
				config.guides[key].x = value;
		}

		// Remove empty
		for (var i = 0; i < config.guides.length; i++) {
			if (config.guides[i].x === 0 || config.guides[i].y === 0
				|| isNaN(config.guides[i].x) || isNaN(config.guides[i].y)) {
				config.guides.splice(i, 1);
				i--;
			}
		}

		config.needRender = true;
	}

	remove(params) {
		config.guides = [];
		config.needRender = true;
	}
}

export default ViewGuidesClass;
