import {
    _decorator,
    Component,
    instantiate,
    JsonAsset,
    Layout,
    Node,
    NodeEventType,
    Prefab,
    UITransform,
    Vec2,
    Vec3,
    EventMouse,
    Camera,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
    @property({ type: Node })
    tileArea: Node = null;

    @property({ type: Prefab })
    rowPrefab: Prefab = null;

    @property({ type: Prefab })
    tilePrefab: Prefab = null;

    @property({ type: JsonAsset })
    patternJson: JsonAsset = null;

    @property({ type: Node })
    patterns: Node = null;

    private originalScale: Vec3 = new Vec3();
    private isMouseDown: boolean = false;
    private selectedNode: Node = null;

    start() {
        let jsonData = this.patternJson.json;
        let patterns = jsonData.patterns;
        let levelData = this.getDataByName(patterns, `map`);

        for (let i = 0; i < 9; i++) {
            let rowData = levelData[i];
            let rowLength = rowData.length;
            let rowNode = instantiate(this.rowPrefab);
            if (rowLength < 9) {
                let diff = 9 - rowLength;
                rowNode.getComponent(Layout).paddingLeft = (diff * 45) / 2;
                rowNode.getComponent(Layout).paddingRight = (diff * 45) / 2;
            }
            for (let j = 0; j < rowLength; j++) {
                let tileNode = instantiate(this.tilePrefab);
                rowNode.addChild(tileNode);
            }
            this.tileArea.addChild(rowNode);
        }

        this.patterns.children.forEach((child: Node) => {
            child.on(NodeEventType.MOUSE_DOWN, (event: EventMouse) => this.onMouseDown(event, child), this);
            child.on(NodeEventType.MOUSE_MOVE, (event: EventMouse) => this.onMouseMove(event), this);
            child.on(NodeEventType.MOUSE_UP, (event: EventMouse) => this.onMouseUp(event), this);
            child.on(NodeEventType.MOUSE_LEAVE, (event: EventMouse) => this.onMouseUp(event), this);
        });
    }

    onMouseDown(event: EventMouse, node: Node) {
        this.isMouseDown = true;
        this.selectedNode = node;

        // Store the original scale of the node
        this.originalScale.set(node.scale);

        // Scale the node up
        node.setScale(new Vec3(this.originalScale.x * 1.2, this.originalScale.y * 1.2, this.originalScale.z * 1.2));
    }

    onMouseMove(event: EventMouse) {
        if (this.isMouseDown && this.selectedNode) {
            // Update the node position as the mouse moves
            this.updateNodePosition(event, this.selectedNode);
        }
    }

    onMouseUp(event: EventMouse) {
        if (this.selectedNode) {
            // Scale the node back to its original size
            this.selectedNode.setScale(this.originalScale);
        }
        this.isMouseDown = false;
        this.selectedNode = null;
    }

    updateNodePosition(event: EventMouse, node: Node) {
        // Convert mouse position to node position
        const location = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const pos = uiTransform.convertToWorldSpaceAR(new Vec3(location.x, location.y, 0));

        // Set the node position
        node.setPosition(pos);
    }

    getDataByName(patterns: any[], name: string) {
        return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
    }
}
