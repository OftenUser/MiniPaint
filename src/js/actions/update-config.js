import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class UpdateConfigAction extends BaseAction {
	/**
	 * Updates the app config with the provided settings
	 *
	 * @param {object} settings 
	 */
	constructor(settings) {
		super('update_config', 'Update Config');
		this.settings = settings;
		this.oldSettings = {};
	}

	async do() {
		super.do();
		
		for (let i in this.settings) {
			this.oldSettings[i] = config[i];
			config[i] = this.settings[i];
		}
	}

	async undo() {
		super.undo();
		
		for (let i in this.oldSettings) {
			config[i] = this.oldSettings[i];
		}
		
		this.oldSettings = {};
	}

	free() {
		this.settings = null;
		this.oldSettings = null;
	}
}
