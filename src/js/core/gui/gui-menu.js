/*
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

import config from './../../config.js';
import menuDefinition from './../../config-menu.js';
import ToolsTranslateClass from './../../modules/tools/translate.js';

/**
 * Class responsible for rendering main menu
 */
class GUIMenuClass {

	constructor() {
		this.eventSubscriptions = {};
		this.dropdownMaxHeightMargin = 15;
		this.menuContainer = null;
		this.menuBarNode = null;
		this.lastFocusedMenuBarLink = 0;
		this.dropdownStack = [];

		this.ToolsTranslate = new ToolsTranslateClass();
	}

	renderMain() {
		this.menuContainer = document.getElementById('main_menu');

		let menuTemplate = '<ul class="menu_bar" role="menubar" tabindex="0">';
		
		for (let i = 0; i < menuDefinition.length; i++) {
			const item = menuDefinition[i];
			menuTemplate += this.generate_menu_bar_item_template(item, i);
		}
		
		menuTemplate += '</ul>';

		this.menuContainer.innerHTML = menuTemplate;
		this.menuBarNode = this.menuContainer.querySelector('[role="menubar"]');

		this.menuContainer.addEventListener('click', (event) => { return this.onClickMenu(event); }, true);
		this.menuContainer.addEventListener('keydown', (event) => { return this.onKeyDownMenu(event); }, true);
		this.menuBarNode.addEventListener('focus', (event) => { return this.onFocusMenuBar(event); });
		this.menuBarNode.addEventListener('blur', (event) => { return this.onBlurMenuBar(event); });
		this.menuBarNode.querySelectorAll('a').forEach((link) => {
			link.addEventListener('focus', (event) => { return this.onFocusMenuBarLink(event); });
		});
		
		document.body.addEventListener('mousedown', (event) => { return this.onMouseDownBody(event); }, true);
		document.body.addEventListener('touchstart', (event) => { return this.onMouseDownBody(event); }, true);
		window.addEventListener('resize', (event) => { return this.onResizeWindow(event); }, true);
		
		document.body.classList.add('loaded');
		
		if (config.LANG != 'en') {
			this.Tools_translate.translate(config.LANG, this.menuContainer);
		}
	}

	on(eventName, callback) {
		if (!this.eventSubscriptions[eventName]) {
			this.eventSubscriptions[eventName] = [];
		}
		
		if (!this.eventSubscriptions[eventName].includes(callback)) {
			this.eventSubscriptions[eventName].push(callback);
		}
	}

	emit(eventName, payload, object) {
		if (this.eventSubscriptions[eventName]) {
			for (let callback of this.eventSubscriptions[eventName]) {
				callback(payload, object);
			}
		}
	}

	generateMenuBarItemTemplate(definition, index) {
		return `
			<li>
				<a id="main_menu_0_${index}" role="menuitem" tabindex="-1" aria-haspopup="true" aria-expanded="false"
					href="javascript:void(0)" data-level="0" data-index="${ index }" title="${ definition.name }"><span class="name trn">${ definition.name }</span></a>
			</li>
		`.trim();
	}

	generateMenuDropdownItemTemplate(definition, level, index) {
		if (definition.divider) {
			return `
				<li role="presentation">
					<hr>
				</li>
			`.trim();
		} else {
			return `
				<li>
					<a id="main_menu_${ level }_${ index }" role="menuitem" tabindex="-1" aria-haspopup="${ (!!definition.children) + '' }"
						href="${ definition.href ? definition.href : 'javascript:void(0)' }"
						target="${ definition.href ? '_blank' : '_self' }"
						data-level="${ level }" data-index="${ index }">
						<span class="name" title="${ definition.name } &lpar;${ definition.ellipsis ? ' ...' : '' }&rpar;"><span class="trn">${ definition.name }</span>${ definition.ellipsis ? ' ...' : '' }</span>
						${ !!definition.shortcut ? `
							<span class="shortcut"><span class="sr_only">Shortcut Key:</span> ${ definition.shortcut }</span>
						` : `` }
					</a>
				</li>
			`.trim();
		}
	}

	onMouseDownBody(event) {
		const target = event.touches && event.touches.length > 0 ? event.touches[0].target : event.target;

		// Clicked outside of menu; close dropdowns.
		if (target && !this.menuContainer.contains(target)) {
			this.closeChildDropdowns(0);
		}
	}

	onFocusMenuBar(event) {
		if (document.activeElement === this.menuBarNode) {
			let lastFocusedLink = this.menuBarNode.querySelector(`[data-index="${ this.lastFocusedMenuBarLink }"]`);
			
			if (!lastFocusedLink) {
				lastFocusedLink = this.menuBarNode.querySelector('a');
			}
			
			lastFocusedLink.focus();
		}
	}

	onFocusMenuBarLink(event) {
		this.lastFocusedMenuBarLink = parseInt(event.target.getAttribute('data-index'), 10) || 0;
	}

	onBlurMenuBar(event) {
		// TODO
	}

	onKeyDownMenu(event) {
		const key = event.key;
		const activeElement = document.activeElement;

		if (activeElement && activeElement.tagName === 'A') {
			const linkLevel = parseInt(activeElement.getAttribute('data-level'), 10) || 0;
			const linkIndex = parseInt(activeElement.getAttribute('data-index'), 10) || 0;
			const menuParent = activeElement.closest('ul');
			
			if (linkLevel === 0) {
				if (['Right', 'ArrowRight'].includes(event.key)) {
					let nextLink = menuParent.querySelector(`[data-index="${ linkIndex + 1 }"]`);
					
					if (!nextLink) {
						nextLink = menuParent.querySelector(`[data-index="0"]`);
					}
					
					nextLink.focus();
				} else if (['Left', 'ArrowLeft'].includes(event.key)) {
					let previousLink = menuParent.querySelector(`[data-index="${ linkIndex - 1 }"]`);
					
					if (!previousLink) {
						previousLink = menuParent.querySelector(`[data-index="${ menuParent.querySelectorAll('[data-index]').length - 1 }"]`);
					}
					
					previousLink.focus();
				} else if (['Down', 'ArrowDown'].includes(event.key)) {
					if (activeElement.getAttribute('aria-haspopup') === 'true') {
						event.preventDefault();
						activeElement.click();
					}
				} else if (event.key === 'Home') {
					menuParent.querySelector(`[data-index="0"]`).focus();
				} else if (event.key === 'End') {
					menuParent.querySelector(`[data-index="${ menuParent.querySelectorAll('[data-index]').length - 1 }"]`).focus();
				} else if ([' ', 'Enter'].includes(event.key)) {
					event.preventDefault();
					activeElement.click();
				}
			} else {
				if (['Up', 'ArrowUp'].includes(event.key)) {
					event.preventDefault();
					let previousLink = menuParent.querySelector(`[data-index="${ linkIndex - 1 }"]`);
					
					if (!previousLink) {
						previousLink = menuParent.querySelector(`[data-index="${ linkIndex - 2 }"]`); // Skip dividers
					}
					
					if (!previousLink) {
						previousLink = menuParent.querySelector(`[data-index="${ this.dropdownStack[linkLevel - 1].children.length - 1 }"]`);
					}
					
					previousLink.focus();
				} else if (['Down', 'ArrowDown'].includes(event.key)) {
					event.preventDefault();
					let nextLink = menuParent.querySelector(`[data-index="${ linkIndex + 1 }"]`);
					
					if (!nextLink) {
						nextLink = menuParent.querySelector(`[data-index="${ linkIndex + 2 }"]`); // Skip dividers
					}
					
					if (!nextLink) {
						nextLink = menuParent.querySelector(`[data-index="0"]`);
					}
					
					nextLink.focus();
				} else if (['Right', 'ArrowRight'].includes(event.key)) {
					if (activeElement.getAttribute('aria-haspopup') === 'true') {
						activeElement.click();
					} else if (this.dropdownStack.length > 1) {
						const opener = this.dropdownStack[linkLevel - 1].opener;
						opener.click();
						opener.focus();
					} else {
						const menuBarLinkIndex = parseInt(this.dropdownStack[0].opener.getAttribute('data-index'), 10) || 0;
						let nextLink = this.menuBarNode.querySelector(`[data-index="${ menuBarLinkIndex + 1 }"]`);
						
						if (!nextLink) {
							nextLink = this.menuBarNode.querySelector(`[data-index="0"]`);
						}
						
						nextLink.click();
					}
				} else if (['Left', 'ArrowLeft'].includes(event.key)) {
					if (this.dropdownStack.length > 1) {
						const opener = this.dropdownStack[linkLevel - 1].opener;
						opener.click();
						opener.focus();
					} else {
						const menuBarLinkIndex = parseInt(this.dropdownStack[0].opener.getAttribute('data-index'), 10) || 0;
						let previousLink = this.menuBarNode.querySelector(`[data-index="${ menuBarLinkIndex - 1 }"]`);
						
						if (!previousLink) {
							previousLink = this.menuBarNode.querySelector(`[data-index="${ this.menuBarNode.querySelectorAll('[data-index]').length - 1 }"]`);
						}
						
						previousLink.click();
					}
				} else if (event.key === 'Home') {
					menuParent.querySelector(`[data-index="0"]`).focus();
				} else if (event.key === 'End') {
					menuParent.querySelector(`[data-index="${ this.dropdownStack[linkLevel - 1].children.length - 1 }"]`).focus();
				} else if ([' ', 'Enter'].includes(event.key)) {
					event.preventDefault();
					activeElement.click();
				} else if (['Esc', 'Escape'].includes(event.key)) {
					const opener = this.dropdownStack[linkLevel - 1].opener;
					opener.click();
					opener.focus();
				} else if (event.key === 'Tab') {
					this.close_child_dropdowns(0);
				}
			}
		}
	}

	onClickMenu(event) {
		const target = event.target.closest('a');

		// Any link in the menu is clicked.
		if (target && target.tagName === 'A') {
			const hasPopup = target.getAttribute('aria-haspopup') === 'true';			
			if (hasPopup) {
				this.toggleDropdown(target, event.isTrusted);
			} else {
				this.triggerLink(target);
			}
		} else {
			this.closeChildDropdowns(0);
		}
	}

	onResizeWindow(event) {
		if (this.dropdownStack.length > 0) {
			this.position_dropdowns();
		}
	}

	toggleDropdown(opener, isTrusted) {
		const linkLevel = parseInt(opener.getAttribute('data-level'), 10) || 0;
		const linkIndex = parseInt(opener.getAttribute('data-index'), 10) || 0;
		
		if (opener.getAttribute('aria-expanded') === 'true') {
			this.close_child_dropdowns(linkLevel);
		} else {
			const parentList = opener.closest('ul');
			
			parentList.querySelectorAll('a').forEach((item) => {
				item.setAttribute('aria-expanded', 'false');
			});
			
			opener.setAttribute('aria-expanded', true);
			this.createDropdown(opener, linkLevel, linkIndex, !isTrusted);
		}
	}

	triggerLink(link) {
		const level = parseInt(link.getAttribute('data-level'), 10) || 0;
		const index = parseInt(link.getAttribute('data-index'), 10) || 0;

		// Find link definition
		let children = menuDefinition;
		
		for (let i = 0; i < level; i++) {
			const childIndex = this.dropdownStack[i] != null ? this.dropdownStack[i].index : index;
			children = children[childIndex].children;
		}
		
		let definition = children[index];

		// Close the dropdown
		this.closeChildDropdowns(0);

		// Emit callback events for triggered links
		if (definition.target) {
			this.emit('select_target', definition.target, definition);
		} else if (definition.href) {
			this.emit('select_href', definition.href, null);
		}
	}

	closeChildDropdowns(level) {
		for (let i = this.dropdownStack.length - 1; i >= 0; i--) {
			if (i >= level) {
				this.dropdownStack[i].element.parentNode.removeChild(this.dropdownStack[i].element);
				this.dropdownStack[i].opener.setAttribute('aria-expanded', false);
			}
		}
		
		this.dropdownStack = this.dropdownStack.slice(0, level);
	}

	createDropdown(opener, level, index, focusAfterCreation) {
		this.closeChildDropdowns(level);

		// Find child list in the menu definition
		let children = menuDefinition;
		
		for (let i = 0; i <= level; i++) {
			const childIndex = this.dropdownStack[i] != null ? this.dropdownStack[i].index : index;
			children = children[childIndex].children;
		}

		// Create the dropdown element, place it in DOM & position it
		let dropdownElement = document.createElement('ul');
		dropdownElement.className = 'menu_dropdown';
		dropdownElement.role = 'menu';
		dropdownElement.tabIndex = 0;
		dropdownElement.setAttribute('aria-labelledby', 'main_menu_' + level + '_' + index);
		let dropdownTemplate = '';
		
		for (let i = 0; i < children.length; i++) {
			dropdownTemplate += this.generateMenuDropdownItemTemplate(children[i], level + 1, i);
		}
		
		dropdownElement.innerHTML = dropdownTemplate;

		this.menuContainer.appendChild(dropdownElement);

		if (config.LANG != 'en') {
			this.ToolsTranslate.translate(config.LANG, this.menuContainer);
		}

		if (focusAfterCreation) {
			dropdownElement.querySelector('a').focus();
		}

		this.dropdownStack.push({
			children,
			opener,
			index,
			element: dropdownElement
		});

		this.positionDropdowns();
	}

	positionDropdowns() {
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

		let topNavHeight = 0;
		for (let level = 0; level < this.dropdownStack.length; level++) {
			const dropdownElement = this.dropdownStack[level].element;
			const openerRect = this.dropdownStack[level].opener.getBoundingClientRect();

			topNavHeight = openerRect.height;
			const dropdownMaxHeight = vh - topNavHeight - this.dropdownMaxHeightMargin;
			dropdownElement.style.maxHeight = dropdownMaxHeight + 'px';
			const dropdownRect = dropdownElement.getBoundingClientRect();

			if (level === 0) {
				dropdownElement.style.top = (openerRect.y + openerRect.height) + 'px';

				let left = openerRect.x;
				
				if (left + dropdownRect.width > vw) {
					left = openerRect.x + openerRect.width - dropdownRect.width;
				}
				
				if (left + dropdownRect.width > vw) {
					left = vw - dropdownRect.width;
				}
				
				if (left < 0) {
					left = 0;
				}
				
				dropdownElement.style.left = left + 'px';
			} else {
				let top = openerRect.y;
				
				if (top + dropdownRect.height > vh - this.dropdownMaxHeightMargin) {
					top = vh - this.dropdownMaxHeightMargin - dropdownRect.height;
				}
				
				dropdownElement.style.top = top + 'px';

				let left = openerRect.x + openerRect.width + 1;
				
				if (left + dropdownRect.width > vw) {
					left = openerRect.x - dropdownRect.width - 1;
				}
				
				if (left < 0) {
					if (openerRect.x + (openerRect.width / 2) > vw / 2) {
						left = 1;
					} else {
						left = vw - dropdownRect.width - 1;
						if (left < 0) {
							left = 1;
						}
					}
				}
				dropdownElement.style.left = left + 'px';
			}
		}
	}

}

export default GUIMenuClass;
