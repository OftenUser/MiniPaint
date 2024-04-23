import GUIPreviewClass from './../../core/gui/gui-preview.js';

class ViewZoomClass {
	constructor() {
		this.GUIPreview = new GUIPreviewClass();
	}

	in() {
		this.GUIPreview.zoom(1);
	}

	out() {
		this.GUIPreview.zoom(-1);
	}

	original() {
		this.GUIPreview.zoom(100);
	}

	auto() {
		this.GUIPreview.zoomAuto();
	}
}

export default ViewZoomClass;
