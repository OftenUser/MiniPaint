import BaseStateClass from './../../core/base-state.js';

class EditRedoClass {
	constructor() {
		this.BaseState = new BaseStateClass();
	}

	redo() {
		this.BaseState.redo();
	}
}

export default EditRedoClass;
