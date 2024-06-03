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
    private startPos: Vec3 = v3();

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
        this.startPos = child.position.clone();
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

        if (this.checkAvailability(child)) {
            this.placeBlock(child);
            this.clearFullRowsAndColumns();
            if (!this.hasValidMoves()) {
                this.gameOver();
            }
        } else {
            child.setPosition(this.startPos); // Return to start position if not valid
        }
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

    checkAvailability(currNode: Node) {
        // Check if the block can be placed in the tile area without overlapping or going out of bounds
        const blockPosition = currNode.getWorldPosition();
        const tileAreaTransform = this.tileArea.getComponent(UITransform);
        const tileAreaPosition = tileAreaTransform.convertToNodeSpaceAR(blockPosition);

        const tileNodes = this.tileArea.getComponentsInChildren(UITransform);

        for (let tileNode of tileNodes) {
            if (tileNode.node === currNode) continue;
            if (
                tileNode
                    .getComponent(UITransform)
                    .getBoundingBox()
                    .intersects(currNode.getComponent(UITransform).getBoundingBox())
            ) {
                return false;
            }
        }

        return tileAreaTransform.getBoundingBox().contains(new Vec2(tileAreaPosition.x, tileAreaPosition.y));
    }

    placeBlock(blockNode: Node) {
        // Adjust positions and parent the blockNode to the tile area
        const tileAreaTransform = this.tileArea.getComponent(UITransform);
        const blockPosition = blockNode.getWorldPosition();
        const localPosition = tileAreaTransform.convertToNodeSpaceAR(blockPosition);
        blockNode.setPosition(localPosition);
        blockNode.setParent(this.tileArea);
    }

    clearFullRowsAndColumns() {
        const rows = this.tileArea.children;
        let columns = new Array(rows[0].children.length).fill(0).map(() => []);

        rows.forEach((row, rowIndex) => {
            if (row.children.every((tile) => tile.active)) {
                row.children.forEach((tile) => (tile.active = false));
                // Award points here for clearing a row
            }
            row.children.forEach((tile, colIndex) => {
                columns[colIndex].push(tile);
            });
        });

        columns.forEach((column) => {
            if (column.every((tile) => tile.active)) {
                column.forEach((tile) => (tile.active = false));
                // Award points here for clearing a column
            }
        });
    }

    hasValidMoves() {
        const blocks = this.patterns.children;
        const tileAreaTransform = this.tileArea.getComponent(UITransform);

        for (let block of blocks) {
            const blockPosition = block.getWorldPosition();
            const localPosition = tileAreaTransform.convertToNodeSpaceAR(blockPosition);

            if (this.checkAvailability(block)) {
                return true;
            }
        }

        return false;
    }

    gameOver() {
        console.log("Game Over");
        // Show game over screen, reset the game, etc.
    }
}
