import app from '../app.js';
import config from '../config.js';
import {BaseAction} from './base.js';

export class RefreshLayersGUIAction extends BaseAction {
	/**
	 * Resizes/renders the canvas at the specified step. Usually used on both sides of a config update action.
	 *
	 * @param {boolean} callWhen
	 */
	constructor(callWhen = 'undo') {
		super('refresh_gui', 'Refresh GUI');
		this.callWhen = callWhen;
	}

	async do() {
		super.do();
		
		if (this.callWhen === 'do') {
			app.Layers.refreshGUI();
		}
	}

	async undo() {
		super.undo();
		
		if (this.callWhen === 'undo') {
			app.Layers.refreshGUI();
		}
	}
}
