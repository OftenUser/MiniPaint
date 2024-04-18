export class BaseAction {
	constructor(actionID, actionDescription) {
		this.actionID = actionID;
		this.actionDescription = actionDescription;
		this.isDone = false;
		this.memoryEstimate = 0; // Estimate of how much memory will be freed when the free() method is called (in bytes)
		this.databaseEstimate = 0; // Estimate of how much database space will be freed when the free() method is called (in bytes)
	}
	
	do() {
		this.isDone = true;
	}
	
	undo() {
		this.isDone = false;
	}
	
	free() {
		// Override if need to run tasks to free memory when action is discarded from history
	}
}
