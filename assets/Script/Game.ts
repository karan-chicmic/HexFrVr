import {
    _decorator,
    BlockInputEvents,
    Collider,
    Color,
    Component,
    EventTouch,
    instantiate,
    JsonAsset,
    Layout,
    Node,
    Prefab,
    randomRangeInt,
    Sprite,
    UITransform,
    v3,
    Vec2,
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

    private MinLength = 5;
    private MaxLength = 9;

    start() {
        // console.log(this.node.getComponent(UITransform));
        let jsonData = this.patternJson.json;
        let patterns = jsonData.patterns;
        let levelData = this.getDataByName(patterns, `map`);
        this.generateBoard(this.MinLength, this.MaxLength);
        this.generateReverseBoard(this.MinLength, this.MaxLength);
        this.generatePattern();
        // for (let i = 0; i < 9; i++) {
        //     let rowData = levelData[i];
        //     let rowLength = rowData.length;
        //     let rowNode = instantiate(this.rowPrefab);
        //     if (rowLength < 9) {
        //         let diff = 9 - rowLength;
        //         rowNode.getComponent(Widget).left = (diff * 50) / 2;
        //         rowNode.getComponent(Widget).right = (diff * 50) / 2;
        //     }
        //     for (let j = 0; j < rowLength; j++) {
        //         let tileNode = instantiate(this.tilePrefab);
        //         rowNode.addChild(tileNode);
        //     }
        //     this.tileArea.addChild(rowNode);
        // }

        this.patterns.children.forEach((child: Node) => {
            child.on(Node.EventType.TOUCH_START, (event: EventTouch) => this.onTouchStart(event, child), this);
            child.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => this.onTouchMove(event, child), this);
            child.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onTouchEnd(event, child), this);
            child.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => this.onTouchEnd(event, child), this);
        });
    }
    onTouchStart(event: EventTouch, child: Node) {
        this.isDragging = true;
        // let otherChilds = child.parent.children.filter((childNode) => childNode !== child);
        // console.log(otherChilds.length);
        // child.setScale(1.3, 1.3, 0);
        // otherChilds.forEach((otherChild) => otherChild.setScale(0.8, 0.8, 0));
        const touchLocation = event.getUILocation();
        const nodeLocation = child
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        this.offset = child.position.subtract(nodeLocation);
    }

    generateBoard(min: number, max: number) {
        for (let i = min; i <= max; i++) {
            let row = instantiate(this.rowPrefab);
            for (let j = 0; j < i; j++) {
                let brick = instantiate(this.tilePrefab);
                let brickWidth = brick.getComponent(UITransform).width;
                if (i < max) {
                    let diff = max - i;
                    row.getComponent(Widget).left = (diff * brickWidth) / 2;
                    row.getComponent(Widget).right = (diff * brickWidth) / 2;
                }
                row.addChild(brick);
            }
            this.tileArea.addChild(row);
        }
    }
    generateReverseBoard(min: number, max: number) {
        for (let i = max - 1; i >= min; i--) {
            let row = instantiate(this.rowPrefab);
            for (let j = 0; j < i; j++) {
                let brick = instantiate(this.tilePrefab);
                let brickWidth = brick.getComponent(UITransform).width;
                if (i < max) {
                    let diff = max - i;
                    row.getComponent(Widget).left = (diff * brickWidth) / 2;
                    row.getComponent(Widget).right = (diff * brickWidth) / 2;
                }
                row.addChild(brick);
            }
            this.tileArea.addChild(row);
        }
    }
    onTouchMove(event: EventTouch, child: Node) {
        if (!this.isDragging) return;

        const touchLocation = event.getUILocation();
        const nodeLocation = child
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));

        child.setPosition(nodeLocation.add(this.offset));
    }

    onTouchEnd(event: EventTouch, child: Node) {
        this.isDragging = false;
        // child.parent.children.forEach((childNode) => {
        //     childNode.setScale(1, 1, 0);
        // });

        this.checkAvailability(event, child);
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
                            //padding right
                            row.getComponent(Layout).paddingRight = 25;
                        }
                    }
                }
                rowNode.addChild(row);
            }
            this.patterns.addChild(rowNode);
        }
    }
    checkAvailability(event: EventTouch, currNode: Node) {
        // get node from parent corresponding to mouse position
        // check if currNode can be placed in tiledArea or not
        let currNodeBoundingBox = currNode.getComponent(UITransform).getBoundingBoxToWorld();

        let mousePosition = event.getUILocation();
        const localPosition = this.node
            .getComponent(UITransform)
            .convertToNodeSpaceAR(new Vec3(mousePosition.x, mousePosition.y, 0));
        const hitNode = this.getNodeAtPoint(new Vec2(localPosition.x, localPosition.y));

        console.log("row", hitNode);
        const tile = this.getTileFromRow(hitNode, new Vec2(mousePosition.x, mousePosition.y));
        console.log("tile", tile);
    }

    getNodeAtPoint(point: Vec2) {
        // Iterate through nodes and check collision
        for (const child of this.tileArea.children) {
            if (child.getComponent(UITransform).getBoundingBox().contains(point)) {
                return child;
            }
        }
        return null;
    }
    getTileFromRow(row: Node, point: Vec2) {
        for (const tile of row.children) {
            if (tile.getComponent(UITransform).getBoundingBoxToWorld().contains(point)) {
                tile.getChildByName("Sprite").getComponent(Sprite).color = Color.GREEN;
                return tile;
            }
        }
        return null;
    }
}
