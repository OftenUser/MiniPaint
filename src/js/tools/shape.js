import app from './../app.js';
import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import BaseLayersClass from './../core/base-layers.js';
import DialogClass from './../libs/popup.js';
import GUIToolsClass from './../core/gui/gui-tools.js';

var instance = null;

class ShapeClass extends BaseToolsClass {

	constructor(ctx) {
		super();

		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.BaseLayers = new BaseLayersClass();
		this.GUITools = new GUIToolsClass();
		this.POP = new DialogClass();
		this.ctx = ctx;
		this.name = 'shape';
		this.layer = {};
		this.previewWidth = 150;
		this.previewHeight = 120;

		this.setEvents();
	}

	setEvents() {
		document.addEventListener('keydown', (event) => {
			var code = event.keyCode;
			
			if (this.Helper.isInput(event.target))
				return;

			if (code == 72) {
				// H
				this.showShapes();
			}
		}, false);
	}

	load() {
		// Nothing
	}

	onActivate() {
		this.showShapes();
	}

	async showShapes(){
		var _this = this;
		var html = '';

		var data = this.getShapes();

		for (var i in data) {
			html += '<div class="item">';
			html += '	<canvas id="c_' + data[i].key + '" width="' + this.previewWidth + '" height="'
				+ this.previewHeight + '" class="effectsPreview" data-key="'
				+ data[i].key + '"></canvas>';
			html += '<div class="preview-item-title">' + data[i].title + '</div>';
			html += '</div>';
		}
		
		for (var i = 0; i < 4; i++) {
			html += '<div class="item"></div>';
		}

		var settings = {
			title: 'Shapes',
			className: 'wide',
			on_load: function(params, popup) {
				var node = document.createElement("div");
				node.classList.add('flex-container');
				node.innerHTML = html;
				popup.el.querySelector('.dialog_content').appendChild(node);
				
				// Events
				var targets = popup.el.querySelectorAll('.item canvas');
				
				for (var i = 0; i < targets.length; i++) {
					targets[i].addEventListener('click', function(event) {
						// We have click
						_this.GUITools.activateTool(this.dataset.key);
						_this.POP.hide();
					});
				}
			},
		};
		
		this.POP.show(settings);

		// Sleep, lets wait till DOM is finished
		await new Promise(r => setTimeout(r, 10));

		// Draw demo thumbs
		for (var i in data) {
			var functionName = 'demo';
			var canvas = document.getElementById('c_' + data[i].key);
			var ctx = canvas.getContext("2d");

			if (typeof data[i].object[functionName] == "undefined")
				continue;

			data[i].object[functionName](ctx, 20, 20, this.previewHeight - 40, this.previewHeight - 40, null);
		}
	}

	render(ctx, layer) {

	}

	get_shapes(){
		var list = [];

		for (var i in this.Base_gui.GUI_tools.tools_modules) {
			var object = this.Base_gui.GUI_tools.tools_modules[i];
			if (object.full_key.indexOf("shapes/") == -1 )
				continue;

			list.push(object);
		}

		list.sort(function(a, b) {
			var nameA = a.title.toUpperCase();
			var nameB = b.title.toUpperCase();
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
			return 0;
		});

		return list;
	}

}

export default Shape_class;
