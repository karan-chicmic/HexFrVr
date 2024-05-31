// DragAndDrop.ts

import { _decorator, Component, Node, EventTouch, UITransform, Vec3, v3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DragAndDrop")
export class DragAndDrop extends Component {
    private isDragging: boolean = false;
    private offset: Vec3 = v3();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        this.isDragging = true;
        const touchLocation = event.getUILocation();
        const nodeLocation = this.node
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        this.offset = this.node.position.subtract(nodeLocation);
    }

    private onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;

        const touchLocation = event.getUILocation();
        const nodeLocation = this.node
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        this.node.setPosition(nodeLocation.add(this.offset));
    }

    private onTouchEnd(event: EventTouch) {
        this.isDragging = false;
    }
}
