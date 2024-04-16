/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import config from './../config.js';
import DialogClass from './../libs/popup.js';
import BaseGUIClass from './base-gui.js';
const fuzzysort = require('fuzzysort');

var instance = null;

class BaseSearchClass {

	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.POP = new DialogClass();
		this.BaseGUI = new BaseGUIClass();
		this.db = null;

		this.events();
	}

	events() {
		document.addEventListener('keydown', (event) => {
			if (this.POP.getActiveInstances() > 0) {
				return;
			}

			var code = event.key;
			
			if (code == "F3" || ( (event.ctrlKey == true || event.metaKey) && code == "f")) {
				// Open
				this.search();
				event.preventDefault();
			}
		}, false);

		document.addEventListener('input', (event) => {
			if (document.querySelector('#pop_data_search') == null) {
				return;
			}

			var node = document.querySelector('#global_search_results');
			node.innerHTML = '';

			var query = event.target.value;
			
			if (query == '') {
				return;
			}

			let results = fuzzysort.go(query, this.db, {
				keys: ['title'],
				limit: 10,
				threshold: -50000,
			});

			// Show
			for (var i = 0; i < results.length; i++) {
				var item = results[i];

				var className = "search-result n" + (i + 1);
				
				if (i == 0) {
					className += " active";
				}

				node.innerHTML += "<div class='" + className + "' data-key='" + item.obj.key + "'>"
					+ fuzzysort.highlight(item[0]) + "</div>";
			}
		}, false);

		// Allow to select with arrow keys
		document.addEventListener('keydown', function(e) {
			if (document.querySelector('#global_search_results') == null
				|| document.querySelector('.search-result') == null) {
				return;
			}
			
			var k = e.key;

			if (k == "ArrowUp") {
				var target = document.querySelector('.search-result.active');
				var index = Array.from(target.parentNode.children).indexOf(target);
				
				if (index > 0) {
					index--;
				}
				
				target.classList.remove('active');
				var target2 =document.querySelector('#global_search_results').childNodes[index];
				target2.classList.add('active');
				e.preventDefault();
			} else if (k == "ArrowDown") {
				var target = document.querySelector('.search-result.active');
				var index = Array.from(target.parentNode.children).indexOf(target);
				var total = target.parentNode.childElementCount;
				
				if (index < total - 1) {
					index++;
				}
				
				target.classList.remove('active');
				var target2 = document.querySelector('#global_search_results').childNodes[index];
				target2.classList.add('active');
				e.preventDefault();
			}

		}, false);
	}

	search() {
		var _this = this;

		//init DB
		if (this.db === null) {
			this.db = Object.keys(this.BaseGUI.modules);
			
			for (var i in this.db) {
				this.db[i] = {
					key: this.db[i],
					title: this.db[i].replace(/_/i, ' '),
				};
			}
		}

		var settings = {
			title: 'Search',
			params: [
				{name: "search", title: "Search:", value: ""},
			],
			on_load: function (params, popup) {
				var node = document.createElement("div");
				node.id = 'global_search_results';
				node.innerHTML = '';
				popup.el.querySelector('.dialog_content').appendChild(node);
			},
			on_finish: function (params) {
				// Execute
				var target = document.querySelector('.search-result.active');
				
				if (target) {
					// Execute
					var key = target.dataset.key;
					var classObject = this.BaseGUI.modules[key];
					var functionName = _this.getFunctionFromPath(key);

					_this.POP.hide();
					classObject[functionName]();
				}
			},
		};
		
		this.POP.show(settings);

		// On input change
		document.getElementById("pop_data_search").select();
	}

	getFunctionFromPath(path) {
		var parts = path.split("/");
		var result = parts[parts.length - 1];
		result = result.replace(/-/, '_');

		return result;
	}

}

export default Base_search_class;
