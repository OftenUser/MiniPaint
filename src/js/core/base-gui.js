/*
 * MiniPaint - https://github.com/Viliusle/MiniPaint
 * Author: Vilius L.
 */

import config from './../config.js';
import BaseLayersClass from './base-layers.js';
import GUIToolsClass from './gui/gui-tools.js';
import GUIPreviewClass from './gui/gui-preview.js';
import GUIColorsClass from './gui/gui-colors.js';
import GUILayersClass from './gui/gui-layers.js';
import GUIInformationClass from './gui/gui-information.js';
import GUIDetailsClass from './gui/gui-details.js';
import GUIMenuClass from './gui/gui-menu.js';
import ToolsTranslateClass from './../modules/tools/translate.js';
import ToolsSettingsClass from './../modules/tools/settings.js';
import HelperClass from './../libs/helpers.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';

var instance = null;

/**
 * Main GUI class
 */
class BaseGUIClass {

	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.Helper = new HelperClass();
		this.BaseLayers = new BaseLayersClass();

		// Last used menu ID
		this.lastMenu = '';

		// Grid dimensions config
		this.gridSize = [50, 50];

		// If grid is visible
		this.grid = false;

		this.canvasOffset = {x: 0, y: 0};

		// Common image dimensions
		this.commonDimensions = [
			[640, 480, '480p'],
			[800, 600, 'SVGA'],
			[1024, 768, 'XGA'],
			[1280, 720, 'HDTV, 720p'],
			[1600, 1200, 'UXGA'],
			[1920, 1080, 'Full HD, 1080p'],
			[3840, 2160, '4K UHD'],
			// [7680,4320, '8K UHD'],
		];

		this.GUITools = new GUIToolsClass(this);
		this.GUIPreview = new GUIPreviewClass(this);
		this.GUIColors = new GUIColorsClass(this);
		this.GUILayers = new GUILayersClass(this);
		this.GUIInformation = new GUIInformationClass(this);
		this.GUIDetails = new GUIDetailsClass(this);
		this.GUIMenu = new GUIMenuClass();
		this.ToolsTranslate = new ToolsTranslateClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.modules = {};
	}

	init() {
		this.loadModules();
		this.loadDefaultValues();
		this.renderMainGUI();
		this.initServiceWorker();
	}

	load_modules() {
		var _this = this;
		var modulesContext = require.context("./../modules/", true, /\.js$/);
		
		modulesContext.keys().forEach(function(key) {
			if (key.indexOf('Base' + '/') < 0) {
				var moduleKey = key.replace('./', '').replace('.js', '');
				var classObj = modulesContext(key);
				_this.modules[moduleKey] = new classObj.default();
			}
		});
	}

	load_default_values() {
		// Transparency cookie
		var transparencyCookie = this.Helper.getCookie('transparency');
		
		if (transparencyCookie === null) {
			// Default
			config.TRANSPARENCY = false;
		}
		
		if (transparency_cookie) {
			config.TRANSPARENCY = true;
		} else {
			config.TRANSPARENCY = false;
		}
		
		// Transparency type
		var transparencyType = this.Helper.getCookie('transparency_type');
		
		if (transparencyType === null) {
			// Default
			config.TRANSPARENCY_TYPE = 'squares';
		}
		
		if (transparency_type) {
			config.TRANSPARENCY_TYPE = transparencyType;
		}

		// Snap cookie
		var snapCookie = this.Helper.getCookie('snap');
		if (snap_cookie === null) {
			//default
			config.SNAP = true;
		} else {
			config.SNAP = Boolean(snapCookie);
		}

		// Guides cookie
		var guidesCookie = this.Helper.getCookie('guides');
		if (guidesCookie === null) {
			// Default
			config.guidesEnabled = true;
		} else {
			config.guidesEnabled = Boolean(guidesCookie);
		}
	}

	renderMainGUI() {
		this.autodetectDimensions();

		this.changeTheme();
		this.prepareCanvas();
		this.GUITools.renderMainTools();
		this.GUIPreview.renderMainPreview();
		this.GUIColors.renderMainColors();
		this.GUILayers.renderMainLayers();
		this.GUIInformation.renderMainInformation();
		this.GUIDetails.renderMainDetails();
		this.GUIMenu.renderMain();
		this.loadSavedChanges();

		this.setEvents();
		this.loadTranslations();
	}

	initServiceWorker() {
		/* if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
				// Successfully registered service worker
			}).catch(function(err) {
				console.warn('Error registering service worker', err);
			});
		} */
	}

	setEvents() {
		var _this = this;

		// Menu events
		this.GUIMenu.on('select_target', (target, object) => {
			var parts = target.split('.');
			var module = parts[0];
			var functionName = parts[1];
			var param = object.parameter ??= null;

			// Call module
			if (this.modules[module] == undefined) {
				alertify.error('Modules class not found: ' + module);
				return;
			}
			
			if (this.modules[module][functionName] == undefined) {
				alertify.error('Module function not found. ' + module + '.' + functionName);
				return;
			}
			
			this.modules[module][functionName](param);
		});

		// Register toggle ability
		var targets = document.querySelectorAll('.toggle');
		
		for (var i = 0; i < targets.length; i++) {
			if (targets[i].dataset.target == undefined)
				continue;
			
			targets[i].addEventListener('click', function(event) {
				this.classList.toggle('toggled');
				var target = document.getElementById(this.dataset.target);
				target.classList.toggle('hidden');
				
				// Save
				if (target.classList.contains('hidden') == false)
					_this.Helper.setCookie(this.dataset.target, 1);
				else
					_this.Helper.setCookie(this.dataset.target, 0);
			});
		}

		document.getElementById('left_mobile_menu_button').addEventListener('click', function(event) {
			document.querySelector('.sidebar_left').classList.toggle('active');
		});
		
		document.getElementById('mobile_menu_button').addEventListener('click', function(event) {
			document.querySelector('.sidebar_right').classList.toggle('active');
		});
		
		window.addEventListener('resize', function(event) {
			// Resize
			_this.prepareCanvas();
			config.needRender = true;
		}, false);
		
		this.checkCanvasOffset();

		// Confirmation on exit
		var exitConfirm = this.ToolsSettings.getSetting('exit_confirm');
		
		window.addEventListener('beforeunload', function(e) {
			if (exitConfirm && (config.layers.length > 1 || _this.BaseLayers.isLayerEmpty(config.layer.id) == false)) {
				e.preventDefault();
				e.returnValue = '';
			}
			
			return undefined;
		});

		document.getElementById('canvas_minipaint').addEventListener('contextmenu', function(e) {
			e.preventDefault();
		}, false);
	}

	checkCanvasOffset() {
		// Calculate canvas position offset
		var bodyRect = document.body.getBoundingClientRect();
		var canvasEl = document.getElementById('canvas_minipaint').getBoundingClientRect();
		this.canvasOffset.x = canvasEl.left - bodyRect.left;
		this.canvasOffset.y = canvasEl.top - bodyRect.top;
	}

	prepareCanvas() {
		var canvas = document.getElementById('canvas_minipaint');
		var ctx = canvas.getContext("2d");

		var wrapper = document.getElementById('main_wrapper');
		var pageWidth = wrapper.clientWidth;
		var pageHeight = wrapper.clientHeight;

		var _width = Math.min(Math.ceil(config.WIDTH * config.ZOOM), pageWidth);
		var _height = Math.min(Math.ceil(config.HEIGHT * config.ZOOM), pageHeight);

		canvas.width = w;
		canvas.height = h;

		config.visibleWidth = _width;
		config.visibleHeight = _height;

		if (config.ZOOM >= 1) {
			ctx.imageSmoothingEnabled = false;
		} else {
			ctx.imageSmoothingEnabled = true;
		}

		this.renderCanvasBackground('canvas_minipaint');

		// Change wrapper dimensions
		document.getElementById('canvas_wrapper').style.width = _width + 'px';
		document.getElementById('canvas_wrapper').style.height = _height + 'px';

		this.checkCanvasOffset();
	}

	loadSavedChanges() {
		var targets = document.querySelectorAll('.toggle');
		
		for (var i = 0; i < targets.length; i++) {
			if (targets[i].dataset.target == undefined)
				continue;

			var target = document.getElementById(targets[i].dataset.target);
			var saved = this.Helper.getCookie(targets[i].dataset.target);
			
			if (saved === 0) {
				targets[i].classList.toggle('toggled');
				target.classList.add('hidden');
			}
		}
	}

	loadTranslations() {
		var lang = this.Helper.getCookie('language');
		
		// Load from params
		var params = this.Helper.getURLParameters();
		
		if (params.lang != undefined) {
			lang = params.lang.replace(/([^a-z]+)/gi, '');
		}
		
		if (lang != null && lang != config.LANG) {
			config.LANG = lang.replace(/([^a-z]+)/gi, '');
			this.ToolsTranslate.translate(config.LANG);
		}
	}

	autodetectDimensions() {
		var wrapper = document.getElementById('main_wrapper');
		var pageWidth = wrapper.clientWidth;
		var pageHeight = wrapper.clientHeight;
		var autoSize = false;

		// Use largest possible
		for (var i = this.commonDimensions.length - 1; i >= 0; i--) {
			if (this.commonDimensions[i][0] > pageWidth
				|| this.commonDimensions[i][1] > pageHeight) {
				// Browser size is too small
				continue;
			}
			
			config.WIDTH = parseInt(this.commonDimensions[i][0]);
			config.HEIGHT = parseInt(this.commonDimensions[i][1]);
			autoSize = true;
			break;
		}

		if (autoSize == false) {
			// Screen size is smaller then 400x300
			config.WIDTH = parseInt(pageWidth) - 15;
			config.HEIGHT = parseInt(pageHeight) - 10;
		}
	}

	renderCanvasBackground(canvasID, gap) {
		if (gap == undefined)
			gap = 10;

		var target = document.getElementById(canvasID + '_background');

		if (config.TRANSPARENCY == false) {
			target.className = 'transparent-grid white';
			return false;
		} else {
			target.className = 'transparent-grid ' + config.TRANSPARENCY_TYPE;
		}
		
		target.style.backgroundSize = (gap * 2) + 'px auto';
	}

	drawGrid(ctx) {
		if (this.grid == false)
			return;

		var gapX = this.gridSize[0];
		var gapY = this.gridSize[1];

		var width = config.WIDTH;
		var height = config.HEIGHT;

		// Size
		if (gapX != undefined && gapY != undefined)
			this.gridSize = [gapX, gapY];
		else {
			gapX = this.gridSize[0];
			gapY = this.gridSize[1];
		}
		
		gapX = parseInt(gapX);
		gapY = parseInt(gapY);
		ctx.lineWidth = 1;
		ctx.beginPath();
		
		if (gapX < 2)
			gapX = 2;
		
		if (gapY < 2)
			gapY = 2;
		
		for (var i = gapX; i < width; i = i + gapX) {
			if (gapX == 0)
				break;
			
			if (i % (gapX * 5) == 0) {
				// Main lines
				ctx.strokeStyle = '#222222';
			} else {
				// Small lines
				ctx.strokeStyle = '#BBBBBB';
			}
			
			ctx.beginPath();
			ctx.moveTo(0.5 + i, 0);
			ctx.lineTo(0.5 + i, height);
			ctx.stroke();
		}
		
		for (var i = gapY; i < height; i = i + gapY) {
			if (gapY == 0)
				break;
			
			if (i % (gap_y * 5) == 0) {
				// Main lines
				ctx.strokeStyle = '#222222';
			} else {
				// Small lines
				ctx.strokeStyle = '#BBBBBB';
			}
			
			ctx.beginPath();
			ctx.moveTo(0, 0.5 + i);
			ctx.lineTo(width, 0.5 + i);
			ctx.stroke();
		}
	}

	drawGuides(ctx) {
		if (config.guidesEnabled == false) {
			return;
		}
		
		var thickGuides = this.ToolsSettings.getSetting('thick_guides');

		for (var i in config.guides) {
			var guide = config.guides[i];

			if (guide.x === 0 || guide.y === 0) {
				continue;
			}

			// Set styles
			ctx.strokeStyle = '#00B8B8';
			
			if (thick_guides == false)
				ctx.lineWidth = 1;
			else
				ctx.lineWidth = 3;

			ctx.beginPath();
			
			if (guide.y === null) {
				// Vertical
				ctx.moveTo(guide.x, 0);
				ctx.lineTo(guide.x, config.HEIGHT);
			}
			
			if (guide.x === null) {
				// Horizontal
				ctx.moveTo(0, guide.y);
				ctx.lineTo(config.WIDTH, guide.y);
			}
			
			ctx.stroke();
		}
	}
	
	/**
	 * Change draw area size
	 * 
	 * @param {int} width
	 * @param {int} height
	 */
	setSize(width, height) {
		config.WIDTH = parseInt(width);
		config.HEIGHT = parseInt(height);
		this.prepareCanvas();
	}
	
	/**
	 * 
	 * @returns {object} Keys: width, height
	 */
	getVisibleAreaSize() {
		var wrapper = document.getElementById('main_wrapper');
		var pageWidth = wrapper.clientWidth;
		var pageHeight = wrapper.clientHeight;
		
		// Find visible size in pixels, but make sure its correct even if image smaller then screen
		var _width = Math.min(Math.ceil(config.WIDTH * config.ZOOM), Math.ceil(pageWidth / config.ZOOM));
		var _height = Math.min(Math.ceil(config.HEIGHT * config.ZOOM), Math.ceil(pageHeight / config.ZOOM));
		
		return {
			width: _width,
			height: _height,
		};
	}

	/**
	 * Change theme or set automatically from cookie if possible
	 * 
	 * @param {string} themeName
	 */
	changeTheme(themeName = null) {
		if (themeName == null) {
			// Auto detect
			var themeCookie = this.Helper.getCookie('theme');
			
			if (themeCookie) {
				themeName = themeCookie;
			} else {
				themeName = this.ToolsSettings.getSetting('theme');
			}
		}

		for (var i in config.themes) {
			document.querySelector('body').classList.remove('theme-' + config.themes[i]);
		}
		
		document.querySelector('body').classList.add('theme-' + themeName);
	}

	getLanguage() {
		return config.LANG;
	}

	getColor() {
		return config.COLOR;
	}

	getAlpha() {
		return config.ALPHA;
	}

	getZoom() {
		return config.ZOOM;
	}

	getTransparencySupport() {
		return config.TRANSPARENCY;
	}

	getActiveTool() {
		return config.TOOL;
	}

}

export default BaseGUIClass;
