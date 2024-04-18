/**
 * User dialogs library
 * 
 * @author ViliusL
 * 
 * Usage:
 * 
 * import Dialog_class from './libs/popup.js';
 * var POP = new popup();
 * 
 * var settings = {
 *		title: 'Differences',
 *		comment: '',
 *		preview: true,
 *		className: '',
 *		params: [
 *			{name: "param1", title: "Parameter #1:", value: "111"},
 *			{name: "param2", title: "Parameter #2:", value: "222"},
 *		],
 *		on_load: function(params){...},
 *		on_change: function(params, canvas_preview, w, h){...},
 *		on_finish: function(params){...},
 *		on_cancel: function(params){...},
 * };
 *
 * this.POP.show(settings);
 * 
 * Params Types:
 * - Name		Type				Example
 * - ---------------------------------------------------------------
 * - name		string				'parameter1'
 * - title		string				'enter value:'
 * - type		string				'select', 'textarea', 'color'
 * - value		string				'314'
 * - values		array for strings	        ['1', '2', '3']
 * - range		numbers interval	        [0, 255]
 * - step		int/float			1	
 * - placeholder	text			        'Enter Number Here'
 * - html		HTML text			'<b>bold</b>'
 * - function	        function			'custom_function'
 */

import './../../css/popup.css';
import BaseLayersClass from './../core/base-layers.js';
import BaseGUIClass from './../core/base-gui.js';
import ToolsTranslateClass from './../modules/tools/translate.js';

var template = `
	<button type="button" class="close" data-id="popup_close" title="Close">&times;</button>
	<div data-id="pretitle_area"></div>
	<span class="text_muted right" data-id="popup_comment"></span>
	<h2 class="trn" data-id="popup_title"></h2>
	<div class="dialog_content" data-id="dialog_content">
		<div data-id="preview_content"></div>
		<div data-id="params_content"></div>
	</div>
	<div class="buttons">
		<button type="button" data-id="popup_ok" class="button trn" title="OK">OK</button>
		<button type="button" data-id="popup_cancel" class="button trn" title="Cancel">Cancel</button>
	</div>
`;

class DialogClass {

	constructor() {
		if (!window.POP) {
			window.POP = this;
		}

		this.previousPOP = null;
		this.el = null;
		this.eventHandles = [];
		this.active = false;
		this.title = null;
		this.onfinish = false;
		this.oncancel = false;
		this.preview = false;
		this.previewPadding = 0;
		this.onload = false;
		this.onchange = false;
		this.widthMini = 225;
		this.heightMini = 200;
		this.id = 0;
		this.parameters = [];
		this.BaseLayers = new BaseLayersClass();
		this.BaseGUI = new BaseGUIClass();
		this.ToolsTranslate = new ToolsTranslateClass();
		this.last_params_hash = '';
		this.layerActiveSmall = document.createElement("canvas");
		this.layerActiveSmallCtx = this.layerActiveSmall.getContext("2d");
		this.caller = null;
		this.resizeClicked = {x: null, y: null}
		this.elementOffset = {x: null, y: null}
	}

	/**
	 * Shows dialog
	 * 
	 * @param {array} config
	 */
	show(config) {
		this.previousPOP = window.POP;
		window.POP = this;

		if (this.active == true) {
			this.hide();
		}

		this.title = config.title || '';
		this.parameters = config.params || [];
		this.onfinish = config.on_finish || false;
		this.oncancel = config.on_cancel || false;
		this.preview = config.preview || false;
		this.previewPadding = config.preview_padding || 0;
		this.onchange = config.on_change || false;
		this.onload = config.on_load || false;
		this.className = config.className || '';
		this.comment = config.comment || '';

		// Reset position
		this.el = document.createElement('div');
		this.el.classList = 'popup';
		this.el.role = 'dialog';
		document.querySelector('#popups').appendChild(this.el);
		this.el.style.top = null;
		this.el.style.left = null;

		this.showAction();
		this.setEvents();
	}

	/**
	 * Hides dialog
	 * 
	 * @param {boolean} success
	 * @returns {undefined}
	 */
	hide(success) {
		window.POP = this.previousPOP;
		var params = this.getParams();

		if (success === false && this.oncancel) {
			this.oncancel(params);
		}
		
		if (this.el && this.el.parentNode) {
			this.el.parentNode.removeChild(this.el);
		}
		
		this.parameters = [];
		this.active = false;
		this.preview = false;
		this.previewPadding = 0;
		this.onload = false;
		this.onchange = false;
		this.title = null;
		this.className = '';
		this.comment = '';
		this.onfinish = false;
		this.oncancel = false;

		this.removeEvents();
	}

	getActiveInstances() {
		return document.getElementById('popups').children.length;
	}

	/* ----------------- Private Functions ---------------------------------- */

	addEventListener(target, type, listener, options) {
		target.addEventListener(type, listener, options);
		
		const handle = {
			target, type, listener,
			remove() {
				target.removeEventListener(type, listener);
			}
		};
		
		this.eventHandles.push(handle);
	}

	setEvents() {
		this.addEventListener(document, 'keydown', (event) => {
			var code = event.code;

			if (code == "Escape") {
				// Escape
				this.hide(false);
			}
		}, false);

		// Register events
		this.addEventListener(document, 'mousedown', (event) => {
			if (event.target != this.el.querySelector('h2'))
				return;
			
			event.preventDefault();
			this.resizeClicked.x = event.pageX;
			this.resizeClicked.y = event.pageY;

			var target = this.el;
			this.elementOffset.x = target.offsetLeft;
			this.elementOffset.y = target.offsetTop;
		}, false);

		this.addEventListener(document, 'mousemove', (event) => {
			if (this.resizeClicked.x != null) {
				var dx = this.resizeClicked.x - event.pageX;
				var dy = this.resizeClicked.y - event.pageY;

				var target = this.el;
				target.style.left = (this.elementOffset.x - dx) + "px";
				target.style.top = (this.elementOffset.y - dy) + "px";
			}
		}, false);

		this.addEventListener(document, 'mouseup', (event) => {
			if (event.target != this.el.querySelector('h2'))
				return;
			
			event.preventDefault();
			this.resizeClicked.x = null;
			this.resizeClicked.y = null;
		}, false);

		this.addEventListener(window, 'resize', (event) => {
			var target = this.el;
			target.style.top = null;
			target.style.left = null;
		}, false);
	}

	removeEvents() {
		for (let handle of this.eventHandles) {
			handle.remove();
		}
		
		this.eventHandles = [];
	}

	onChangeEvent(e) {
		var params = this.getParams();

		var hash = JSON.stringify(params);
		
		if (this.lastParamsHash == hash && this.onchange == false) {
			// Nothing changed
			return;
		}
		
		this.lastParamsHash = hash;

		if (this.onchange != false) {
			if (this.preview != false) {
				var canvasRight = this.el.querySelector('[data-id="pop_post"]');
				var ctxRight = canvasRight.getContext("2d");

				ctxRight.clearRect(0, 0, this.widthMini, this.heightMini);
				ctxRight.drawImage(this.layerActiveSmall,
					this.previewPadding, this.previewPadding,
					this.widthMini - this.previewPadding * 2, this.heightMini - this.previewPadding * 2
				);

				this.onchange(params, ctxRight, this.widthMini, this.heightMini, canvasRight);
			} else {
				this.onchange(params);
			}
		}
	}

	// Renders preview. If input=range supported, is called on every param update - Must be fast...
	previewHandler(e) {
		if (this.preview !== false) {
			this.onChangeEvent(e);
		}
	}

	// OK pressed - Prepare data and call handlers
	save() {
		var params = this.getParams();

		if (this.onfinish) {
			this.onfinish(params);
		}

		this.hide(true);
	}
	
	// "Cancel" pressed
	cancel() {
		if (this.oncancel) {
			var params = this.getParams();
			this.oncancel(params);
		}
	}

	getParams() {
		var response = {};
		
		if (this.el == undefined) {
			return null;
		}
		
		var inputs = this.el.querySelectorAll('input');
		
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].id.substr(0, 9) == 'pop_data_') {
				var key = inputs[i].id.substr(9);
				
				if (this.strpos(key, "_poptmp") != false)
					key = key.substring(0, this.strpos(key, "_poptmp"));
				
				var value = inputs[i].value;
				
				if (inputs[i].type == 'radio') {
					if (inputs[i].checked == true)
						response[key] = value;
				} else if (inputs[i].type == 'number') {
					response[key] = parseFloat(value);
				} else if (inputs[i].type == 'checkbox') {
					if (inputs[i].checked == true)
						response[key] = true;
					else
						response[key] = false;
				} else if (inputs[i].type == 'range') {
					response[key] = parseFloat(value);
				} else {
					response[key] = value;
				}

			}
		}
		
		var selects = this.el.querySelectorAll('select');
		
		for (var i = 0; i < selects.length; i++) {
			if (selects[i].id.substr(0, 9) == 'pop_data_') {
				var key = selects[i].id.substr(9);
				response[key] = selects[i].value;
			}
		}
		
		var textareas = this.el.querySelectorAll('textarea');
		
		for (var i = 0; i < textareas.length; i++) {
			if (textareas[i].id.substr(0, 9) == 'pop_data_') {
				var key = textareas[i].id.substr(9);
				response[key] = textareas[i].value;
			}
		}

		return response;
	}

	/**
	 * Show popup window.
	 * Used strings: "OK", "Cancel", "Preview"
	 */
	showAction() {
		this.id = this.getRandomInt(0, 999999999);
		
		if (this.active == true) {
			this.hide();
			return false;
		}
		
		this.active = true;

		// Build content
		var htmlPretitleArea = '';
		var htmlPreviewContent = '';
		var htmlParams = '';

		// Preview area
		if (this.preview !== false) {
			htmlPreviewContent += '<div class="preview_container">';
			htmlPreviewContent += '<canvas class="preview_canvas_left" width="' + this.widthMini + '" height="'
				+ this.heightMini + '" data-id="pop_pre"></canvas>';
			htmlPreviewContent += '<div class="canvas_preview_container">';
			htmlPreviewContent += '	<canvas class="preview_canvas_post_back" width="' + this.widthMini
				+ '" height="' + this.heightMini + '" data-id="pop_post_back"></canvas>';
			htmlPreviewContent += '	<canvas class="preview_canvas_post" width="' + this.widthMini + '" height="'
				+ this.heightMini + '" data-id="pop_post"></canvas>';
			htmlPreviewContent += '</div>';
			htmlPreviewContent += '</div>';
		}

		// Generate params
		htmlParams += this.generateParamsHtml();

		this.el.innerHTML = template;
		this.el.querySelector('[data-id="pretitle_area"]').innerHTML = htmlPretitleArea;
		this.el.querySelector('[data-id="popup_title"]').innerHTML = this.title;
		this.el.querySelector('[data-id="popup_comment"]').innerHTML = this.comment;
		this.el.querySelector('[data-id="preview_content"]').innerHTML = htmlPreviewContent;
		this.el.querySelector('[data-id="params_content"]').innerHTML = htmlParams;
		
		if (this.onfinish != false) {
			this.el.querySelector('[data-id="popup_cancel"]').style.display = '';
		} else {
			this.el.querySelector('[data-id="popup_cancel"]').style.display = 'none';
		}

		this.el.style.display = "block";
		
		if (this.className) {
			this.el.classList.add(this.className);
		}

		// Replace color inputs
		this.el.querySelectorAll('input[type="color"]').forEach((colorInput) => {
			const id = colorInput.getAttribute('id');
			colorInput.removeAttribute('id');
			$(colorInput)
				.uiColorInput({inputId: id})
				.on('change', (e) => {
					this.onChangeEvent(e);
				});
		});

		// Events
		this.el.querySelector('[data-id="popup_ok"]').addEventListener('click', (event) => {
			this.save();
		});
		
		this.el.querySelector('[data-id="popup_cancel"]').addEventListener('click', (event) => {
			this.hide(false);
		});
		
		this.el.querySelector('[data-id="popup_close"]').addEventListener('click', (event) => {
			this.hide(false);
		});
		
		var targets = this.el.querySelectorAll('input');
		
		for (var i = 0; i < targets.length; i++) {
			targets[i].addEventListener('keyup', (event) => {
				this.onkeyup(event);
			});
		}

		// Onload
		if (this.onload) {
			var params = this.getParams();
			this.onload(params, this);
		}

		// Load preview
		if (this.preview !== false) {
			// Get canvas from layer
			var canvas = this.BaseLayers.convertLayerToCanvas();

			// Draw original image
			var canvasLeft = this.el.querySelector('[data-id="pop_pre"]');
			var popPre = canvas_left.getContext("2d");
			popPre.clearRect(0, 0, this.widthMini, this.heightMini);
			popPre.rect(0, 0, this.widthMini, this.heightMini);
			popPre.fillStyle = "#FFFFFF";
			popPre.fill();
			this.drawBackground(popPre, this.widthMini, this.heightMini, 10);

			popPre.scale(this.widthMini / canvas.width, this.heightMini / canvas.height);
			popPre.drawImage(canvas, 0, 0);
			popPre.scale(1, 1);

			// Prepare temp canvas for faster repaint
			this.layerActiveSmall.width = POP.widthMini;
			this.layerActiveSmall.height = POP.heightMini;
			this.layerActiveSmallCtx.scale(this.widthMini / canvas.width, this.heightMini / canvas.height);
			this.layerActiveSmallCtx.drawImage(canvas, 0, 0);
			this.layerActiveSmallCtx.scale(1, 1);

			// Draw right background
			var canvasRightBack = this.el.querySelector('[data-id="pop_post_back"]').getContext("2d");
			this.drawBackground(canvasRightBack, this.widthMini, this.heightMini, 10);

			// Copy to right side
			var canvasRight = this.el.querySelector('[data-id="pop_post"]').getContext("2d");
			canvasRight.clearRect(0, 0, this.widthMini, this.heightMini);
			canvasRight.drawImage(canvasLeft,
				this.previewPadding, this.previewPadding,
				this.widthMini - this.previewPadding * 2, this.heightMini - this.previewPadding * 2);

			// Prepare temp canvas
			this.previewHandler();
		}

		// Call translation again to translate popup
		var lang = this.BaseGUI.getLanguage();
		this.ToolsTranslate.translate(lang);
	}

	generateParamsHtml() {
		var html = '<table>';
		var title = null;
		
		for (var i in this.parameters) {
			var parameter = this.parameters[i];

			html += '<tr id="popup-tr-' + this.parameters[i].name + '">';
			
			if (title != 'Error' && parameter.title != undefined)
				html += '<th class="trn">' + parameter.title + '</th>';
			
			if (parameter.name != undefined) {
				if (parameter.values != undefined) {
					if (parameter.values.length > 10 || parameter.type == 'select') {
						// Drop down
						html += '<td colspan="2"><select onchange="POP.onChangeEvent();" id="pop_data_' + parameter.name
							+ '">';
						var k = 0;
						
						for (var j in parameter.values) {
							var sel = '';
							
							if (parameter.value == parameter.values[j])
								sel = 'selected="selected"';
							
							if (parameter.value == undefined && k == 0)
								sel = 'selected="selected"';
							
							html += '<option ' + sel + ' name="' + parameter.values[j] + '">' + parameter.values[j]
								+ '</option>';
							k++;
						}
						html += '</select></td>';
					} else {
						// Radio
						html += '<td class="radios" colspan="2">';
						
						if (parameter.values.length > 2)
							html += '<div class="group" id="popup-group-' + this.parameters[i].name + '">';
						var k = 0;
						
						for (var j in parameter.values) {
							var ch = '';
							
							if (parameter.value == parameter.values[j])
								ch = 'checked="checked"';
							
							if (parameter.value == undefined && k == 0)
								ch = 'checked="checked"';

							var title = parameter.values[j];
							var parts = parameter.values[j].split(" - ");
							
							if (parts.length > 1) {
								title = parts[0] + ' - <span class="trn">' + parts[1] + '</span>';
							}

							html += '<input type="radio" onchange="POP.onChangeEvent();" ' + ch + ' name="'
								+ parameter.name + '" id="pop_data_' + parameter.name + "_poptmp" + j + '" value="'
								+ parameter.values[j] + '">';
							html += '<label class="trn" for="pop_data_' + parameter.name + "_poptmp" + j + '">' + title
								+ '</label>';
							
							if (parameter.values.length > 2)
								html += '<br />';
							k++;
						}
						
						if (parameter.values.length > 2)
							html += '</div>';
						
						html += '</td>';
					}
				} else if (parameter.value != undefined) {
					// Input, range, textarea, color
					var step = 1;
					
					if (parameter.step != undefined)
						step = parameter.step;
					
					if (parameter.range != undefined) {
						// Range
						html += '<td><input type="range" name="' + parameter.name + '" id="pop_data_' + parameter.name
							+ '" value="' + parameter.value + '" min="' + parameter.range[0] + '" max="'
							+ parameter.range[1] + '" step="' + step
							+ '" oninput="document.getElementById(\'pv' + i + '\').innerHTML = '
							+ 'Math.round(this.value*100) / 100;POP.preview_handler();" '
							+'onchange="POP.onChangeEvent();" /></td>';
						html += '<td class="range_value" id="pv' + i + '">' + parameter.value + '</td>';
					} else if (parameter.type == 'color') {
						// Color
						html += '<td><input type="color" id="pop_data_' + parameter.name + '" value="' + parameter.value
							+ '" onchange="POP.onChangeEvent();" /></td>';
					} else if (typeof parameter.value == 'boolean') {
						var checked = '';
						if (parameter.value === true)
							checked = 'checked';
						html += '<td class="checkbox"><input type="checkbox" id="pop_data_' + parameter.name + '" '
							+ checked + ' onclick="POP.onChangeEvent();" > <label class="trn" for="pop_data_'
							+ parameter.name + '">Toggle</label></td>';
					} else {
						// Input or textarea
						if (parameter.placeholder == undefined)
							parameter.placeholder = '';
						
						if (parameter.type == 'textarea') {
							// Textarea
							html += '<td><textarea rows="10" id="pop_data_' + parameter.name
								+ '" onchange="POP.onChangeEvent();" placeholder="' + parameter.placeholder + '" ' + (parameter.prevent_submission ? 'data-prevent-submission=""' : '' ) + '>'
								+ parameter.value + '</textarea></td>';
						} else {
							// Text or number
							var inputType = "text";
							
							if (parameter.placeholder != '' && !isNaN(parameter.placeholder))
								input_type = 'number';
							
							if (parameter.value != undefined && typeof parameter.value == 'number')
								input_type = 'number';

							var commentHTML = '';
							
							if (typeof parameter.comment !== 'undefined') {
								commentHTML = '<span class="field_comment trn">' + parameter.comment + '</span>';
							}

							html += '<td colspan="2"><input type="' + input_type + '" id="pop_data_' + parameter.name
								+ '" onchange="POP.onChangeEvent();" value="' + parameter.value + '" placeholder="'
								+ parameter.placeholder + '" ' + (parameter.prevent_submission ? 'data-prevent-submission=""' : '' ) + ' />' + commentHTML + '</td>';
						}
					}
				}
			} else if (parameter.function != undefined) {
				// Custom function
				var result;
				result = parameter.function();
				html += '<td colspan="3">' + result + '</td>';
			} else if (parameter.html != undefined) {
				// HTML
				html += '<td class="html_value" colspan="2">' + parameter.html + '</td>';
			} else if (parameter.title == undefined) {
				// Gap
				html += '<td colspan="2"></td>';
			} else {
				// Locked fields without name
				var str = "" + parameter.value;
				var idTmp = parameter.title.toLowerCase().replace(/[^\w]+/g, '').replace(/ +/g, '-');
				idTmp = idTmp.substring(0, 10);
				
				if (str.length < 40)
					html += '<td colspan="2"><div class="trn" id="pop_data_' + idTmp + '">' + parameter.value
						+ '</div></td>';
				else
					html += '<td class="long_text_value" colspan="2"><textarea disabled="disabled">' + parameter.value
						+ '</textarea></td>';
			}
			
			html += '</tr>';
		}
		
		html += '</table>';

		return html;
	}

	// On key press inside input text
	onkeyup(event) {
		if (event.key == 'Enter') {
			if (event.target.hasAttribute('data-prevent-submission')) {
				event.preventDefault();
			} else {
				this.save();
			}
		}
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	strpos(haystack, needle, offset) {
		var i = (haystack + '').indexOf(needle, (offset || 0));
		return i === -1 ? false : i;
	}

	drawBackground(canvas, W, H, gap, force) {
		var transparent = this.BaseGUI.getTransparencySupport();

		if (transparent == false && force == undefined) {
			canvas.beginPath();
			canvas.rect(0, 0, W, H);
			canvas.fillStyle = "#FFFFFF";
			canvas.fill();
			return false;
		}
		
		if (gap == undefined)
			gap = 10;
		
		var fill = true;
		
		for (var i = 0; i < W; i = i + gap) {
			if (i % (gap * 2) == 0)
				fill = true;
			else
				fill = false;
			
			for (var j = 0; j < H; j = j + gap) {
				if (fill == true) {
					canvas.fillStyle = '#EEEEEE';
					canvas.fillRect(i, j, gap, gap);
					fill = false;
				}
				else
					fill = true;
			}
		}
	}

}

export default DialogClass;
