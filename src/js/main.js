/**
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

// CSS
import './../css/reset.css';
import './../css/utility.css';
import './../css/component.css';
import './../css/layout.css';
import './../css/menu.css';
import './../css/print.css';
import './../../node_modules/alertifyjs/build/css/alertify.min.css';

// JavaScript
import app from './app.js';
import config from './config.js';
import './core/components/index.js';
import BaseGUIClass from './core/base-gui.js';
import BaseLayersClass from './core/base-layers.js';
import BaseToolsClass from './core/base-tools.js';
import BaseStateClass from './core/base-state.js';
import BaseSearchClass from './core/base-search.js';
import FileOpenClass from './modules/file/open.js';
import FileSaveClass from './modules/file/save.js';
import * as Actions from './actions/index.js';

window.addEventListener('load', function(e) {
	// Initiate app
	var Layers = new BaseLayersClass();
	var BaseTools = new BaseToolsClass(true);
	var GUI = new BaseGUIClass();
	var BaseState = new BaseStateClass();
	var FileOpen = new FileOpenClass();
	var FileSave = new FileSaveClass();
	var BaseSearch = new BaseSearchClass();

	// Register singletons in app module
	app.Actions = Actions;
	app.Config = config;
	app.FileOpen = FileOpen;
	app.FileSave = FileSave;
	app.GUI = GUI;
	app.Layers = Layers;
	app.State = BaseState;
	app.Tools = BaseTools;

	// Register as global for quick or external access
	window.Layers = Layers;
	window.AppConfig = config;
	window.State = BaseState;
	window.FileOpen = FileOpen;
	window.FileSave = FileSave;

	// Render all
	GUI.init();
	Layers.init();
}, false);
