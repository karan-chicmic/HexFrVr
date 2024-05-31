import { _decorator, Component, Node, EventMouse, systemEvent, SystemEvent, Color } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SelectableNode")
export class SelectableNode extends Component {
    private isSelected: boolean = false;

    start() {
        // Add event listeners for mouse down and mouse up events
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onDestroy() {
        // Remove event listeners to avoid memory leaks
        this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onMouseDown(event: EventMouse) {
        // Check if the event target is this node
        if (event.target === this.node) {
            this.selectNode();
        }
    }

    private onMouseUp(event: EventMouse) {
        // Deselect the node when mouse is released
        this.deselectNode();
    }

    private selectNode() {
        this.isSelected = true;
        // Change the node's appearance or state
        // this.node.color = Color.RED; // Example: Change the node color to red
    }

    private deselectNode() {
        this.isSelected = false;
        // Revert the node's appearance or state
        // this.node.color = Color.WHITE; // Example: Change the node color back to white
    }
}
