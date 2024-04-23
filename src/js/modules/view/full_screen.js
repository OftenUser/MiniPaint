class ViewFullScreenClass {
	constructor() {
		//
	}

	/**
	 * Toggle full-screen
	 */
	fs() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}
}

export default ViewFullScreenClass;
