import app from './../app.js';
import config from './../config.js';
import BaseToolsClass from './../core/base-tools.js';
import FileOpenClass from './../modules/file/open.js';
import ToolsSettingsClass from './../modules/tools/settings.js';
import DialogClass from './../libs/popup.js';
import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';

class MediaClass extends BaseToolsClass {
	constructor(ctx) {
		super();
		this.FileOpen = new FileOpenClass();
		this.ToolsSettings = new ToolsSettingsClass();
		this.POP = new DialogClass();
		this.name = 'media';
		this.cache = [];
		this.page = 1;
		this.perPage = 50;
	}

	load() {
		// Nothing
	}

	render(ctx, layer) {
		// Nothing
	}

	onActivate() {
		this.search();
	}

	/**
	 * Image search API
	 *
	 * @param {string} query
	 * @param {array} data
	 * @param pages
	 */
	search(query = '', data = [], pages = null) {
		var _this = this;
		var html = '';
		var htmlPaging = '';

		var key = config.pixabayKey;
		key = key.split("").reverse().join("");

		var safeSearch = this.ToolsSettings.getSetting('safe_search');

		if (data.length > 0) {
			for (var i in data) {
				html += '<div class="item">';
				html += '	<img class="displayBlock pointer" alt="" src="' + data[i].previewURL + '" data-url="' + data[i].webformatURL + '" />';
				html += '</div>';
			}
			
			// Fix for last line
			html += '<div class="item"></div>';
			html += '<div class="item"></div>';
			html += '<div class="item"></div>';
			html += '<div class="item"></div>';

			// Paging
			htmlPaging += '<div class="media-paging" id="media_paging">';
			htmlPaging += '<button type="button" data-value="1" title="Previous">&lt;</button> ';
			
			for (var i = 1; i <= Math.min(10, pages); i++) {
				var selected = '';
				
				if (this.page == i) {
					var selected = 'selected';
				}
				
				htmlPaging += '<button type="button" class="' + selected + '" data-value="' + i + '" title="' + i + '">' + i + '</button> ';
			}
			
			htmlPaging += '<button type="button" data-value="' + Math.min(this.page + 1, pages) + '" title="Next">&gt;</button> ';
			htmlPaging += '</div>';
		} else {
			this.page = 1;
		}

		var settings = {
			title: 'Search',
			// comment: 'Source: <a class="text_muted" href="https://pixabay.com/" title="Pixabay.com">Pixabay.com</a>.',
			className: 'wide',
			params: [
				{name: "query", title: "Keyword:", value: query},
			],
			on_load: function(params, popup) {
				var node = document.createElement("div");
				node.classList.add('flex-container');
				node.innerHTML = html + htmlPaging;
				popup.el.querySelector('.dialog_content').appendChild(node);
				
				// Events
				var targets = popup.el.querySelectorAll('.item img');
				
				for (var i = 0; i < targets.length; i++) {
					targets[i].addEventListener('click', function(event) {
						// We have click
						var data = {
							url: this.dataset.url,
						};
						_this.FileOpen.fileOpenURLHandler(data);
						_this.POP.hide();

						new app.Actions.ActivateToolAction('select', true).do();
					});
				}
				
				var targets = popup.el.querySelectorAll('#media_paging button');
				
				for (var i = 0; i < targets.length; i++) {
					targets[i].addEventListener('click', function(event) {
						// We have click
						_this.page = parseInt(this.dataset.value);
						_this.POP.save();
					});
				}
			},
			on_finish: function(params) {
				if (params.query == '')
					return;

				var URL = "https://pixabay.com/api/?key=" + key
					+ "&page=" + _this.page
					+ "&per_page=" + _this.perPage
					+ "&safesearch=" + safe_search
					+ "&q="	+ encodeURIComponent(params.query);

				if (_this.cache[URL] != undefined) {
					// Using cache
					setTimeout(function() {
						// Only call same function after all handlers finishes
						var data = _this.cache[URL];

						if (parseInt(data.totalHits) == 0) {
							alertify.error('Your search did not match any images.');
						}

						var pages = Math.ceil(data.totalHits / _this.perPage);
						_this.search(params.query, data.hits, pages);
					}, 100);
				} else {
					// Query to service
					$.getJSON(URL, function(data) {
						_this.cache[URL] = data;

						if (parseInt(data.totalHits) == 0) {
							alertify.error('Your search did not match any images.');
						}

						var pages = Math.ceil(data.totalHits / _this.perPage);
						_this.search(params.query, data.hits, pages);
					})
					.fail(function () {
						alertify.error('Error connecting to service.');
					});
				}
			},
		};
		
		this.POP.show(settings);

		document.getElementById("pop_data_query").select();
	}
}

export default MediaClass;
