/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import config from './../config.js';

var instance = null;
var settingsAll = [];

const handleSize = 12;

const DRAG_TYPE_TOP = 1;
const DRAG_TYPE_BOTTOM = 2;
const DRAG_TYPE_LEFT = 4;
const DRAG_TYPE_RIGHT = 8;

/**
 * Selection class - Draws rectangular selection on canvas, can be resized.
 */
class BaseSelectionClass {

	/**
	 * Settings:
	 * - enableBackground
	 * - enableBorders
	 * - enableControls
	 * - enableRotation
	 * - enableMove
	 * - keepRatio
	 * 
	 * @param {ctx} ctx
	 * @param {object} settings
	 * @param {string|null} key
	 */
	constructor(ctx, settings, key = null) {
		if (key != null) {
			settingsAll[key] = settings;
		}

		// Singleton
		if (instance) {
			return instance;
		}
		
		instance = this;

		this.ctx = ctx;
		this.mouseLock = null;
		this.selectedObjPositions = {};
		this.selectedObjRotatePosition = {};
		this.selectedObjectDragType = null;
		this.clickDetails = {};
		this.isTouch = false;
		// True if dragging from inside canvas area
		this.isDrag = false;
		this.currentAngle = null;

		this.events();
	}

	events() {
		document.addEventListener('mousedown', (e) => {
			this.isDrag = false;
			
			if (this.isTouch == true)
				return;
			
			if (!e.target.closest('#main_wrapper'))
				return;
			
			this.isDrag = true;
			this.selectedObjectActions(e);
		});
		
		document.addEventListener('mousemove', (e) => {
			if (this.isTouch == true)
				return;
			
			this.selectedObjectActions(e);
		});
		
		document.addEventListener('mouseup', (e) => {
			if (this.isTouch == true)
				return;
			
			this.selectedObjectActions(e);
		});

		// Touch
		document.addEventListener('touchstart', (event) => {
			this.isDrag = false;
			this.isTouch = true;
			
			if (!event.target.closest('#main_wrapper'))
				return;
			
			this.isDrag = true;
			this.selectedObjectActions(event);
		});
		
		document.addEventListener('touchmove', (event) => {
			this.selectedObjectActions(event);
		}, {passive: false});
		
		document.addEventListener('touchend', (event) => {
			this.selectedObjectActions(event);
		});
	}

	setSelection(x, y, width, height) {
		var settings = this.findSettings();

		if (x != null)
			settings.data.x = x;
		
		if (y != null)
			settings.data.y = y;
		
		if (width != null)
			settings.data.width = width;
		
		if (height != null)
			settings.data.height = height;
		
		config.needRender = true;
	}

	resetSelection() {
		var settings = this.findSettings();

		settings.data = {
			x: null,
			y: null,
			width: null,
			height: null,
		};
		
		config.needRender = true;
	}

	getSelection() {
		var settings = this.findSettings();

		return settings.data;
	}

	findSettings() {
		var currentKey = config.TOOL.name;
		var settings = null;

		for (var i in settingsAll) {
			if (i == currentKey)
				settings = settingsAll[i];
		}

		// Default
		if (settings === null) {
			settings = settingsAll['main'];
		}

		// Find data
		settings.data = (settings.dataFunction).call();

		return settings;
	}

	calculateRotateDistanceFromX(layerWidth) {
		const blockSize = handleSize / config.ZOOM;
	
		return Math.max(
		  Math.min(layerWidth * 0.9, Math.abs(layerWidth - 2 * blockSize)),
		  layerWidth / 2 - blockSize / 2
		);
	}
	
	/**
	 * Marks object as selected, and draws corners
	 */
	drawSelection() {
		var settings = this.findSettings();
		var data = settings.data;

		if (settings.data === null || settings.data.status == 'draft'
			|| (settings.data.hideSelectionIfActive === true && settings.data.type == config.TOOL.name)) {
			return;
		}

		var x = settings.data.x;
		var y = settings.data.y;
		var _width = settings.data.width;
		var _height = settings.data.height;

		if (x == null || y == null || _width == null || _height == null) {
			// Not supported 
			return;
		}

		var blockSizeDefault = handleSize / config.ZOOM;

		if (config.ZOOM != 1) {
			x = Math.round(x);
			y = Math.round(y);
			_width = Math.round(_width);
			_height = Math.round(_height);
		}
		
		var blockSize = blockSizeDefault;
		var cornerOffset = (blockSize / 2.4);
		var middleOffset = (blockSize / 1.9);

		this.ctx.save();
		this.ctx.globalAlpha = 1;
		let isRotated = false;
		
		if (data.rotate != null && data.rotate != 0) {
			// Rotate
			isRotated = true;
			this.ctx.translate(data.x + data.width / 2, data.y + data.height / 2);
			this.ctx.rotate(data.rotate * Math.PI / 180);
			x = Math.round(-data.width / 2);
			y = Math.round(-data.height / 2);
		}

		// Fill
		if (settings.enableBackground == true) {
			this.ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
			this.ctx.fillRect(x, y, _width, _height);
		}

		const wholeLineWidth = 2 / config.ZOOM;
		const halfLineWidth = wholeLineWidth / 2;

		// Borders
		if (settings.enableBorders == true && (x != 0 || y != 0 || _width != config.WIDTH || _height != config.HEIGHT)) {
			this.ctx.lineWidth = wholeLineWidth;
			this.ctx.strokeStyle = 'rgb(255, 255, 255)';
			this.ctx.strokeRect(x - halfLineWidth, y - halfLineWidth, _width + wholeLineWidth, _height + wholeLineWidth);
			this.ctx.lineWidth = halfLineWidth;
			this.ctx.strokeStyle = 'rgb(0, 0, 0)';
			this.ctx.strokeRect(x - wholeLineWidth, y - wholeLineWidth, _width + (wholeLineWidth * 2), _height + (wholeLineWidth * 2));
		}

		// Show crop lines
		if (settings.cropLines === true) {
			for (var part = 1; part < 3; part++) {
				this.ctx.lineWidth = wholeLineWidth;
				this.ctx.strokeStyle = 'rgb(255, 255, 255)';
				this.ctx.beginPath();
				this.ctx.moveTo(x + _width / 3 * part - halfLineWidth, y);
				this.ctx.lineTo(x + _width / 3 * part - halfLineWidth, y + _height);
				this.ctx.stroke();

				this.ctx.lineWidth = halfLineWidth;
				this.ctx.strokeStyle = 'rgb(0, 0, 0)';
				this.ctx.beginPath();
				this.ctx.moveTo(x + _width / 3 * part - halfLineWidth, y);
				this.ctx.lineTo(x + _width / 3 * part - halfLineWidth, y + _height);
				this.ctx.stroke();
			}

			for (var part = 1; part < 3; part++) {
				this.ctx.lineWidth = wholeLineWidth;
				this.ctx.strokeStyle = 'rgb(255, 255, 255)';
				this.ctx.beginPath();
				this.ctx.moveTo(x, y + _height / 3 * part - halfLineWidth);
				this.ctx.lineTo(x + _width, y + _height / 3 * part - halfLineWidth);
				this.ctx.stroke();

				this.ctx.lineWidth = halfLineWidth;
				this.ctx.strokeStyle = 'rgb(0, 0, 0)';
				this.ctx.beginPath();
				this.ctx.moveTo(x, y + _height / 3 * part - halfLineWidth);
				this.ctx.lineTo(x + _width, y + _height / 3 * part - halfLineWidth);
				this.ctx.stroke();
			}
		}

		const hitsLeftEdge = isRotated ? false : x < handleSize;
		const hitsTopEdge = isRotated ? false : y < handleSize;
		const hitsRightEdge = isRotated ? false : x + _width > config.WIDTH - handleSize;
		const hitsBottomEdge = isRotated ? false : y + _height > config.HEIGHT - handleSize;

		// Draw corners
		var corner = (x, y, dx, dy, dragType, cursor) => {
			var angle = 0;
			
			if (settings.data.rotate != null && settings.data.rotate != 0) {
				angle = settings.data.rotate;
			}

			if (settings.enableControls == false || angle != 0) {
				this.ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
				this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
			} else {
				this.ctx.strokeStyle = "#000000";
				this.ctx.fillStyle = "#FFFFFF";
			}
			
			this.ctx.lineWidth = wholeLineWidth;

			// Create path
			const circle = new Path2D();
			circle.arc(x + dx * block_size, y + dy * blockSize, blockSize / 2, 0, 2 * Math.PI);

			// Draw
			this.ctx.fill(circle);
			this.ctx.stroke(circle);

			// Register position
			this.selectedObjectPositions[dragType] = {
				cursor: cursor,
				path: circle,
			};
		};

		// Draw rotation
		var drawRotation = () => {
			var settings = this.findSettings();

			if (settings.data === null
				|| settings.data.status == 'draft'
				|| settings.data.rotate === null
				|| (settings.data.hideSelectionIfActive === true && settings.data.type == config.TOOL.name)) {
				return;
			}
			
			var rX = x + this.calculateRotateDistanceFromX(_width) + cornerOffset + wholeLineWidth;
			var rY = y - corner_offset - wholeLineWidth;
			var rDx =  hitsRightEdge ? -0.5 : 0;
			var rDy = hitsTopEdge ? 0.5 : 0;

			this.ctx.strokeStyle = "#000000";
			this.ctx.fillStyle = "#D0D62A";
			this.ctx.lineWidth = wholeLineWidth;

			// Create path
			const circle = new Path2D();
			circle.arc(rX + rDx * blockSize, rY + rDy * blockSize, blockSize / 2, 0, 2 * Math.PI);

			// Draw
			this.ctx.fill(circle);
			this.ctx.stroke(circle);

			// Register position
			this.selectedObjectRotatePosition = {
				cursor: "pointer",
				path: circle,
			};

		};
		
		if (settings.enableRotation == true) {
			drawRotation();
		}

		if (settings.enableControls == true) {
			corner(x - cornerOffset - wholeLineWidth, y - cornerOffset - wholeLineWidth, hitsLeftEdge ? 0.5 : 0, hitsTopEdge ? 0.5 : 0, DRAG_TYPE_LEFT | DRAG_TYPE_TOP, 'nwse-resize');
			corner(x + _width + cornerOffset + wholeLineWidth, y - cornerOffset - wholeLineWidth, hitsRightEdge ? -0.5 : 0, hitsTopEdge ? 0.5 : 0, DRAG_TYPE_RIGHT | DRAG_TYPE_TOP, 'nesw-resize');
			corner(x - cornerOffset - wholeLineWidth, y + _height + cornerOffset + wholeLineWidth, hitsLeftEdge ? 0.5 : 0, hitsBottomEdge ? -0.5 : 0, DRAG_TYPE_LEFT | DRAG_TYPE_BOTTOM, 'nesw-resize');
			corner(x + _width + cornerOffset + wholeLineWidth, y + _height + cornerOffset + wholeLineWidth, hitsRightEdge ? -0.5 : 0, hitsBottomEdge ? -0.5 : 0, DRAG_TYPE_RIGHT | DRAG_TYPE_BOTTOM, 'nwse-resize');
		}

		if (settings.enableControls == true) {
			// Draw centers
			if (Math.abs(w) > block_size * 5) {
				corner(x + _width / 2, y - middleOffset - wholeLineWidth, 0, hitsTopEdge ? 0.5 : 0, DRAG_TYPE_TOP, 'ns-resize');
				corner(x + _width / 2, y + _height + middleOffset + wholeLineWidth, 0, hitsBottomEdge ? -0.5 : 0, DRAG_TYPE_BOTTOM, 'ns-resize');
			}
			
			if (Math.abs(h) > block_size * 5) {
				corner(x - middleOffset - wholeLineWidth, y + _height / 2, hitsLeftEdge ? 0.5 : 0, 0, DRAG_TYPE_LEFT, 'ew-resize');
				corner(x + _width + middleOffset + wholeLineWidth, y + _height / 2, hitsRightEdge ? -0.5 : 0, 0, DRAG_TYPE_RIGHT, 'ew-resize');
			}
		}

		// Restore
		this.ctx.restore();
	}

	selectedObjectActions(e) {
		var settings = this.findSettings();
		var data = settings.data;

		if (data == null) {
			return;
		}

		this.ctx.save();
		
		if (data.rotate != null && data.rotate != 0) {
			this.ctx.translate(data.x + data.width / 2, data.y + data.height / 2);
			this.ctx.rotate(data.rotate * Math.PI / 180);
		}

		var x = settings.data.x;
		var y = settings.data.y;
		var _width = settings.data.width;
		var _height = settings.data.height;

		// Simplify checks
		var eventType = e.type;
		if (event_type == 'touchstart') eventType = 'mousedown';
		if (event_type == 'touchmove') eventType = 'mousemove';
		if (event_type == 'touchend') eventType = 'mouseup';

		if (!this.isDrag && ['mousedown', 'mouseup'].includes(eventType))
			return;

		const mainWrapper = document.getElementById('main_wrapper');
		const defaultCursor = config.TOOL && config.TOOL.name === 'text' ? 'text' : 'default';
		
		if (mainWrapper.style.cursor != defaultCursor) {
			mainWrapper.style.cursor = defaultCursor;
		}
		
		if (eventType == 'mousedown' && config.mouse.valid == false || settings.enableControls == false) {
			return;
		}

		var mouse = config.mouse;
		const dragType = this.selectedObjectDragType;

		if (eventType == 'mousedown' && settings.data !== null) {
			this.clickDetails = {
				x: settings.data.x,
				y: settings.data.y,
				width: settings.data.width,
				height: settings.data.height,
			};
			
			this.currentAngle = null;
		}
		
		if (eventType == 'mousemove' && this.mouseLock == 'selected_object_actions' && this.isDrag) {

			const allowNegativeDimensions = settings.data.renderFunction
				&& ['line', 'arrow', 'gradient'].includes(settings.data.renderFunction[0]);

			mainWrapper.style.cursor = "pointer";
			
			var isCtrl = false;
			
			if (e.ctrlKey == true || e.metaKey) {
				isCtrl = true;
			}

			const isDragTypeLeft = Math.floor(dragType / DRAG_TYPE_LEFT) % 2 === 1;
			const isDragTypeRight = Math.floor(dragType / DRAG_TYPE_RIGHT) % 2 === 1;
			const isDragTypeTop = Math.floor(dragType / DRAG_TYPE_TOP) % 2 === 1;
			const isDragTypeBottom = Math.floor(dragType / DRAG_TYPE_BOTTOM) % 2 === 1;

			if (isDragTypeLeft && isDragTypeTop) mainWrapper.style.cursor = "nwse-resize";
			else if (isDragTypeTop && isDragTypeRight) mainWrapper.style.cursor = "nesw-resize";
			else if (isDragTypeRight && isDragTypeBottom) mainWrapper.style.cursor = "nwse-resize";
			else if (isDragTypeBottom && isDragTypeLeft) mainWrapper.style.cursor = "nesw-resize";
			else if (isDragTypeTop) mainWrapper.style.cursor = "ns-resize";
			else if (isDragTypeRight) mainWrapper.style.cursor = "ew-resize";
			else if (isDragTypeBottom) mainWrapper.style.cursor = "ns-resize";
			else if (isDragTypeLeft) mainWrapper.style.cursor = "ew-resize";

			if (dragType == 'rotate') {
				// Rotate
				var dx = x + this.calculateRotateDistanceFromX(_width) - (x + _width / 2);
				var dy = _height / 2;
				var original_angle = Math.atan2(dy, dx) / Math.PI * 180; // Compensate rotation icon angle

				var dx = mouse.x - (x + _width / 2);
				var dy = mouse.y - (y + _height / 2);
				var angle = Math.atan2(dy, dx) / Math.PI * 180 + originalAngle;

				// settings.data.rotate = angle;
				this.currentAngle = angle;

				config.needRender = true;
			} else if (e.buttons == 1 || typeof e.buttons == "undefined") {
				// Do transformations
				var dx = Math.round(mouse.x - mouse.click_x);
				var dy = Math.round(mouse.y - mouse.click_y);
				var width = this.click_details.width + dx;
				var height = this.click_details.height + dy;
				if (is_drag_type_top)
					height = this.click_details.height - dy;
				if (is_drag_type_left)
					width = this.click_details.width - dx;

				// Keep ratio - (If drag_type power of 2, only dragging on single axis)
				if (dragType && (dragType & (dragType - 1)) !== 0 && (settings.keepRatio == true && isCtrl == false) 
					|| (settings.keepRatio !== true && isCtrl == true)) {
					var ratio = this.clickDetails.width / this.clickDetails.height;
					var widthNew = Math.round(height * ratio);
					var heightNew = Math.round(width / ratio);

					if (Math.abs(width * 100 / widthNew) > Math.abs(height * 100 / heightNew)) {
						height = heightNew;
					} else {
						width = widthNew;
					}
				}

				// Set values
				settings.data.x = this.clickDetails.x;
				settings.data.y = this.clickDetails.y;
				
				if (isDragTypeTop)
					settings.data.y = this.clickDetails.y - (height - this.clickDetails.height);
				
				if (isDragTypeLeft)
					settings.data.x = this.clickDetails.x - (width - this.clickDetails.width);
				
				if (isDragTypeLeft || isDragTypeRight)
					settings.data.width = width;
				
				if (isDragTypeTop || isDragTypeBottom)
					settings.data.height = height;

				// Don't allow negative width/height on most layers
				if (!allowNegativeDimensions) {
					if (settings.data.width <= 0) {
						settings.data.width = Math.abs(settings.data.width);
						
						if (isDragTypeLeft) {
							settings.data.x -= settings.data.width;
						} else {
							settings.data.x = this.clickDetails.x - settings.data.width;
						}
					}
					
					if (settings.data.height <= 0) {
						settings.data.height = Math.abs(settings.data.height);
						
						if (isDragTypeTop) {
							settings.data.y -= settings.data.height;
						} else {
							settings.data.y = this.clickDetails.y - settings.data.height;
						}
					}
				}
				
				config.needRender = true;
			}
			
			return;
		}
		
		if (eventType == 'mouseup' && this.mouseLock == 'selected_object_actions') {
			// Reset
			this.mouseLock = null;
		}

		if (!this.mouseLock) {
			// Set mouse move cursor
			if (settings.enableMove && mouse.x > x && mouse.x < x + _width && mouse.y > y && mouse.y < y + _height) {
				mainWrapper.style.cursor = "move";
			}

			for (let currentDragType in this.selectedObjectPositions) {
				const position = this.selectedObjectPositions[currentDragType];
				
				if (position.path && this.ctx.isPointInPath(position.path, mouse.x, mouse.y)) {
					// Match
					if (eventType == 'mousedown') {
						if (e.buttons == 1 || typeof e.buttons == "undefined") {
							this.mouseLock = 'selected_object_actions';
							this.selectedObjectDragType = currentDragType;
						}
					}
					
					if (eventType == 'mousemove') {
						mainWrapper.style.cursor = position.cursor;
					}
				}
			}

			// Rotate?
			const position = this.selectedObjectRotatePosition;
			if (position.path && this.ctx.isPointInPath(position.path, mouse.x, mouse.y)) {
				// Match
				if (eventType == 'mousedown') {
					if (e.buttons == 1 || typeof e.buttons == "undefined") {
						this.mouseLock = 'selected_object_actions';
						this.selectedObjectDragType = "rotate";
					}
				}
				
				if (eventType == 'mousemove') {
					mainWrapper.style.cursor = position.cursor;
				}
			}

			this.ctx.restore();
		}
	}

}

export default BaseSelectionClass;
