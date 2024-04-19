import app from './../app.js';
import config from './../config.js';
import {BaseAction} from './base.js';

export class SetObjectPropertyAction extends BaseAction {
	/**
	 * Sets a generic object property. I recommend against using this as it's generally a hack for edge cases.
	 *
	 * @param {string} layerID
	 * @param {object} settings 
	 */
	constructor(object, propertyName, value) {
		super('set_object_property', 'Set Object Property');
		this.object = object;
		this.propertyName = propertyName;
		this.value = value;
		this.oldValue = null;
	}

	async do() {
		super.do();
		this.oldValue = this.object[this.propertyName];
		this.object[this.propertyName] = this.value;
	}

	async undo() {
		super.undo();
		this.object[this.propertyName] = this.oldValue;
		this.oldValue = null;
	}

	free() {
		this.object = null;
	}
}
