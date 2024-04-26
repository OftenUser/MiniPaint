import app from './../app.js';
import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import BaseLayersClass from './../core/base-layers.js';
import GUIToolsClass from './../core/gui/gui-tools.js';
import BaseGUIClass from './../core/base-gui.js';
import BaseSelectionClass from './../core/base-selection.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';

class AnimationClass extends BaseToolsClass {

	constructor(ctx) {
		super();
		this.BaseLayers = new BaseLayersClass();
		this.GUITools = new GUIToolsClass();
		this.BaseGUI = new BaseGUIClass();
		this.name = 'animation';
		this.intervalID = null;
		this.index = 0;
		this.toggleLayerVisibilityAction = new app.Actions.ToggleLayerVisibilityAction();

		this.disableSelection(ctx);
	}

	load() {
		// Nothing
	}

	render(ctx, layer) {
		// Nothing
	}

	/**
	 * Disable selection
	 */
	disableSelection(ctx) {
		var selConfig = {
			enable_background: false,
			enable_borders: false,
			enable_controls: false,
			enable_rotation: false,
			enable_move: false,
			data_function: function () {
				return null;
			},
		};
		this.BaseSelection = new BaseSelectionClass(ctx, selConfig, this.name);
	}

	onParamsUpdate(data) {
		if (data.key != "play")
			return;

		var params = this.getParams();
		
		if (config.layers.length == 1) {
			alertify.error('Can not animate 1 layer.');
			return;
		}
		
		this.stop();

		if (params.play == true) {
			this.start(params.delay);
		}
	}

	onActivate() {
		return [
			new app.Actions.StopAnimationAction(false)
		];
	}

	onLeave() {
		return [
			new app.Actions.StopAnimationAction(true)
		];
	}

	start(delay) {
		var _this = this;
		delay = parseInt(delay);
		
		if (delay < 0)
			delay = 50;

		this.intervalID = window.setInterval(function() {
			_this.play(_this);
		}, delay);
	}

	stop() {
		new app.Actions.StopAnimationAction(true).do();
	}

	play(_this) {

		for (var i in config.layers) {
			config.layers[i].visible = false;
		}

		// Show 1
		if (config.layers[this.index] != undefined) {
			this.toggleLayerVisibilityAction.layer_id = config.layers[this.index].id;
			this.toggleLayerVisibilityAction.do();
		}

		// Change index
		if (config.layers[this.index + 1] != undefined) {
			this.index++;
		} else {
			this.index = 0;
		}
	}

}
;
export default Animation_class;
