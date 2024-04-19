import config from '../config.js';
import {BaseAction} from './base.js';

export class BundleAction extends BaseAction {
	/**
	 * Groups multiple actions together in the undo/redo history, runs them all at once.
	 */
	constructor(bundleID, bundleName, actionsToDo) {
		super(bundleID, bundleName);
		this.actionsToDo = actionsToDo;
	}

	async do() {
		super.do();
		let error = null;
		let i = 0;
		this.memoryEstimate = 0;
		this.databaseEstimate = 0;
		
		for (i = 0; i < this.actionsToDo.length; i++) {
			try {
				await this.actionsToDo[i].do();
				this.memoryEstimate += this.actionsToDo[i].memoryEstimate;
				this.databaseEstimate += this.actionsToDo[i].databaseEstimate;
			} catch (e) {
				error = e;
				break;
			}
		}
		
		// One of the actions aborted, undo all previous actions.
		if (error) {
			for (i--; i >= 0; i--) {
				await this.actionsToDo[i].undo();
			}
			
			throw error;
		}
		
		config.needRender = true;
	}

	async undo() {
		super.undo();
		this.memoryEstimate = 0;
		this.databaseEstimate = 0;
		
		for (let i = this.actionsToDo.length - 1; i >= 0; i--) {
			await this.actionsToDo[i].undo();
			this.memoryEstimate += this.actionsToDo[i].memoryEstimate;
			this.databaseEstimate += this.actionsToDo[i].databaseEstimate;
		}
		
		config.needRender = true;
	}

	free() {
		if (this.actionsToDo) {
			for (let action of this.actionsToDo) {
				action.free();
			}
			
			this.actionsToDo = null;
		}
	}
}
