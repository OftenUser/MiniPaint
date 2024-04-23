import config from './../../config.js';
import BaseLayersClass from './../../core/base-layers.js';
import SelectionClass from './../../tools/selection.js';
import alertify from './../../../../node_modules/alertifyjs/build/alertify.min.js';

class Edit_selection_class {

	constructor() {
		this.BaseLayers = new BaseLayersClass();
		this.Selection = new SelectionClass(this.BaseLayers.ctx);
	}

	selectAll() {
		if (config.layer.type != 'image') {
			alertify.error('This layer must contain an image. Please convert it to raster to apply this tool.');
			return;
		}
		
		this.Selection.selectAll();
	}

	delete() {
		this.Selection.deleteSelection();
	}
}

export default EditSelectionClass;
