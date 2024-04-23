import BaseStateClass from './../../core/base-state.js';

var instance = null;

class EditUndoClass {

	constructor() {
		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.BaseState = new BaseStateClass();
		this.events();
	}

	events(){
		var _this = this;

		document.querySelector('#undo_button').addEventListener('click', function(event) {
			_this.BaseState.undo();
		});
	}

	undo() {
		this.BaseState.undo();
	}
}

export default EditUndoClass;
