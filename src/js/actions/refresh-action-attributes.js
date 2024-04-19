import app from '../app.js';
import config from '../config.js';
import {BaseAction} from './base.js';

export class RefreshActionAttributesAction extends BaseAction {
	/**
	 * Resizes/renders the canvas at the specified step. Usually used on both sides of a config update action.
	 *
	 * @param {boolean} callWhen
	 */
	constructor(callWhen = 'undo') {
		super('refresh_action_attributes', 'Refresh Action Attributes');
		this.callWhen = callWhen;
	}

	async do() {
		super.do();
		
		if (this.callWhen === 'do') {
			app.GUI.GUITools.showActionAttributes();
		}
	}

	async undo() {
		super.undo();
		
		if (this.callWhen === 'undo') {
			app.GUI.GUITools.showActionAttributes();
		}
	}
}
