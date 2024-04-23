import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

class EditPasteClass {
	paste() {
		alertify.error('Use Ctrl+V keyboard shortcut to paste from Clipboard.');
	}
}

export default EditPasteClass;
