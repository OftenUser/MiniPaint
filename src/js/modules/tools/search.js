import BaseSearchClass from './../../core/base-search.js';

class ToolsSearchClass {
	constructor() {
		this.BaseSearch = new BaseSearchClass();
	}

	search() {
		this.BaseSearch.search();
	}
}

export default ToolsSearchClass;
