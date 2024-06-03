import {
    _decorator,
    BlockInputEvents,
    Component,
    EventTouch,
    instantiate,
    JsonAsset,
    Layout,
    Node,
    Prefab,
    randomRangeInt,
    UITransform,
    v3,
    Vec3,
    Widget,
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
    @property({ type: Prefab })
    patternPrefab: Prefab = null;
    @property({ type: JsonAsset })
    patternJson: JsonAsset;
    @property({ type: JsonAsset })
    blockPattern: JsonAsset;
    @property({ type: Node })
    patterns: Node = null;
    @property({ type: Prefab })
    blockPrefab: Prefab = null;
    location: any;
    private isDragging: boolean = false;
    private offset: Vec3 = v3();
    start() {
        let jsonData = this.patternJson.json;
        let patterns = jsonData.patterns;
        let levelData = this.getDataByName(patterns, `map`);
        this.generatePattern();
        for (let i = 0; i < 9; i++) {
            let rowData = levelData[i];
            let rowLength = rowData.length;
            let rowNode = instantiate(this.rowPrefab);
            if (rowLength < 9) {
                let diff = 9 - rowLength;
                // rowNode.getComponent(Layout).paddingLeft = (diff * 45) / 2;
                // rowNode.getComponent(Layout).paddingRight = (diff * 45) / 2;
                rowNode.getComponent(Widget).left = (diff * 50) / 2;
                rowNode.getComponent(Widget).right = (diff * 50) / 2;
            }
            for (let j = 0; j < rowLength; j++) {
                let tileNode = instantiate(this.tilePrefab);
                rowNode.addChild(tileNode);
            }
            this.tileArea.addChild(rowNode);
        }

        this.patterns.children.forEach((child: Node) => {
            child.on(Node.EventType.TOUCH_START, (event: EventTouch) => this.onTouchStart(event, child), this);
            child.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => this.onTouchMove(event, child), this);
            child.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onTouchEnd(event, child), this);
            child.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => this.onTouchEnd(event, child), this);
        });
    }
    private onTouchStart(event: EventTouch, child: Node) {
        this.isDragging = true;
        const touchLocation = event.getUILocation();
        const nodeLocation = child
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        this.offset = child.position.subtract(nodeLocation);
    }

    private onTouchMove(event: EventTouch, child: Node) {
        if (!this.isDragging) return;

        const touchLocation = event.getUILocation();
        const nodeLocation = child
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        child.setPosition(nodeLocation.add(this.offset));
    }

    private onTouchEnd(event: EventTouch, child: Node) {
        this.isDragging = false;
    }

    getDataByName(patterns: any[], name: string) {
        return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
    }

    generatePattern() {
        for (let i = 0; i < 3; i++) {
            let jsonData = this.blockPattern.json;
            let Allpatterns = jsonData.block;
            let blockNo = randomRangeInt(1, Allpatterns.length + 1);
            let blockData = this.getDataByName(Allpatterns, `block${blockNo}`);
            let str = `block${blockNo}`;
            let rowNode = instantiate(this.blockPrefab);
            console.log("block data " + `block${blockNo}`, blockData);
            for (let j = 0; j < blockData.length; j++) {
                let rowData = blockData[j];
                let row = instantiate(this.rowPrefab);
                for (let k = 0; k < rowData.length; k++) {
                    if (rowData[k] == 0) continue;
                    let blockNode = instantiate(this.patternPrefab);
                    let first = rowData[0];
                    let last = rowData[rowData.length - 1];
                    row.addChild(blockNode);
                    if (j % 2 == 1) {
                        if (first == 0 && last !== 0) {
                            //padding left
                            row.getComponent(Layout).paddingLeft = 25;
                        }
                        if (first !== 0 && last == 0) {
                            row.getComponent(Layout).paddingRight = 25;
                        }
                    }
                }
                rowNode.addChild(row);
            }
            this.patterns.addChild(rowNode);
        }
    }
}
