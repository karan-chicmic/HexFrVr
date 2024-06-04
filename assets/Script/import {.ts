import {
    _decorator,
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
    tween,
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
    private rNo = -1;

    mapSet = new Map<string, number>();

    start() {
        this.generateBoard(this.MinLength, this.MaxLength);
        this.generateReverseBoard(this.MinLength, this.MaxLength);
        this.generatePattern();

        this.patterns.children.forEach((child: Node) => {
            child.on(Node.EventType.TOUCH_START, (event: EventTouch) => this.onTouchStart(event, child), this);
            child.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => this.onTouchMove(event, child), this);
            child.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onTouchEnd(event, child), this);
            child.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => this.onTouchEnd(event, child), this);
        });
    }

    onTouchStart(event: EventTouch, child: Node) {
        this.isDragging = true;
        this.scaleUp(child);

        const touchLocation = event.getUILocation();
        const nodeLocation = child
            .getComponent(UITransform)
            .convertToNodeSpaceAR(v3(touchLocation.x, touchLocation.y, 0));
        this.offset = child.position.subtract(nodeLocation);
    }

    scaleUp(child: Node) {
        tween(child)
            .to(0.25, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "linear" })
            .start();
    }

    scaleDown(child: Node) {
        tween(child)
            .to(0.25, { scale: new Vec3(1, 1, 1) }, { easing: "linear" })
            .start();
    }

    generateBoard(min: number, max: number) {
        for (let i = min; i <= max; i++) {
            let row = instantiate(this.rowPrefab);
            this.rNo = this.rNo + 1;
            for (let j = 0; j < i; j++) {
                let brick = instantiate(this.tilePrefab);
                let brickWidth = brick.getComponent(UITransform).width;
                let index = this.rNo.toString() + j.toString();

                this.mapSet.set(index, 0);

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
            this.rNo = this.rNo + 1;
            let row = instantiate(this.rowPrefab);
            for (let j = 0; j < i; j++) {
                let index = this.rNo.toString() + j.toString();
                this.mapSet.set(index, 0);
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
        this.checkAvailability(event, child);
        child.setPosition(nodeLocation.add(this.offset));
    }

    onTouchEnd(event: EventTouch, child: Node) {
        this.scaleDown(child);
        this.isDragging = false;

        // Check if the pattern can be placed and place it
        if (this.canPlacePattern(event, child)) {
            this.placePattern(event, child);
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

            let rowNode = instantiate(this.blockPrefab);

            for (let j = 0; j < blockData.length; j++) {
                let rowData = blockData[j];
                let row = instantiate(this.rowPrefab);
                for (let k = 0; k < rowData.length; k++) {
                    if (rowData[k] == 0) continue;
                    let blockNode = instantiate(this.patternPrefab);
                    let first = rowData[0];
                    let last = rowData[rowData.length - 1];
                    let blockNodeUITransform = blockNode.getComponent(UITransform).width;
                    row.addChild(blockNode);
                    if (j % 2 == 1) {
                        if (first == 0 && last !== 0) {
                            // padding left
                            row.getComponent(Layout).paddingLeft = blockNodeUITransform / 2;
                        }
                        if (first !== 0 && last == 0) {
                            // padding right
                            row.getComponent(Layout).paddingRight = blockNodeUITransform / 2;
                        }
                    }
                }
                rowNode.addChild(row);
            }
            this.patterns.addChild(rowNode);
        }
    }

    checkAvailability(event: EventTouch, currNode: Node) {
        // Get node from parent corresponding to mouse position
        // Check if currNode can be placed in tileArea or not

        let mousePosition = event.getUILocation();
        const localPosition = this.node
            .getComponent(UITransform)
            .convertToNodeSpaceAR(new Vec3(mousePosition.x, mousePosition.y, 0));

        // Get row from map
        const hitNode = this.getNodeAtPoint(new Vec2(localPosition.x, localPosition.y));

        if (hitNode != null) {
            const tile = this.getTileFromRow(hitNode, new Vec2(mousePosition.x, mousePosition.y));

            let tileIndex = hitNode.children.indexOf(tile);
            let parentIndex = this.tileArea.children.indexOf(hitNode);

            let index = parentIndex.toString() + tileIndex.toString();
            console.log("value at cell", this.mapSet.get(index));

            // Check if value is undefined
        }
    }

    getNodeAtPoint(point: Vec2) {
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

    canPlacePattern(event: EventTouch, pattern: Node) {
        let canPlace = true;
        const tiles = this.getTilesUnderPattern(event, pattern);

        for (const tile of tiles) {
            if (!tile || this.isTileOccupied(tile)) {
                canPlace = false;
                break;
            }
        }

        return canPlace;
    }

    placePattern(event: EventTouch, pattern: Node) {
        const tiles = this.getTilesUnderPattern(event, pattern);

        for (const tile of tiles) {
            if (tile) {
                this.markTileAsOccupied(tile);
            }
        }

        pattern.destroy();
        this.checkForCompletion();
    }

    getTilesUnderPattern(event: EventTouch, pattern: Node) {
        const patternPosition = pattern.position;
        const tiles = [];

        // Assuming pattern has children as rows and rows have children as blocks
        pattern.children.forEach((row: Node, rowIndex: number) => {
            row.children.forEach((block: Node, blockIndex: number) => {
                const blockPosition = block.getComponent(UITransform).convertToWorldSpaceAR(v3(0, 0, 0));
                const localPosition = this.tileArea.getComponent(UITransform).convertToNodeSpaceAR(blockPosition);
                const tile = this.getTileAtPoint(new Vec2(localPosition.x, localPosition.y));
                tile.getChildByName("Sprite").getComponent(Sprite).color = Color.RED;
                tiles.push(tile);
            });
        });

        return tiles;
    }

    getTileAtPoint(point: Vec2) {
        for (const row of this.tileArea.children) {
            for (const tile of row.children) {
                if (tile.getComponent(UITransform).getBoundingBox().contains(point)) {
                    return tile;
                }
            }
        }
        return null;
    }

    isTileOccupied(tile: Node) {
        const rowIndex = this.tileArea.children.indexOf(tile.parent);
        const tileIndex = tile.parent.children.indexOf(tile);
        const index = rowIndex.toString() + tileIndex.toString();
        return this.mapSet.get(index) === 1;
    }

    markTileAsOccupied(tile: Node) {
        const rowIndex = this.tileArea.children.indexOf(tile.parent);
        const tileIndex = tile.parent.children.indexOf(tile);
        const index = rowIndex.toString() + tileIndex.toString();
        this.mapSet.set(index, 1);
    }

    checkForCompletion() {
        const rows = this.tileArea.children.length;
        const cols = this.tileArea.children[0].children.length;

        for (let i = 0; i < rows; i++) {
            if (this.isRowComplete(i)) {
                this.clearRow(i);
            }
        }

        for (let i = 0; i < cols; i++) {
            if (this.isColumnComplete(i)) {
                this.clearColumn(i);
            }
        }

        if (this.isMainDiagonalComplete()) {
            this.clearMainDiagonal();
        }

        if (this.isAntiDiagonalComplete()) {
            this.clearAntiDiagonal();
        }
    }

    isRowComplete(rowIndex: number) {
        const row = this.tileArea.children[rowIndex];
        return row.children.every((tile: Node) => this.isTileOccupied(tile));
    }

    clearRow(rowIndex: number) {
        const row = this.tileArea.children[rowIndex];
        row.children.forEach((tile: Node) => {
            this.markTileAsFree(tile);
        });
    }

    isColumnComplete(colIndex: number) {
        return this.tileArea.children.every((row: Node) => this.isTileOccupied(row.children[colIndex]));
    }

    clearColumn(colIndex: number) {
        this.tileArea.children.forEach((row: Node) => {
            const tile = row.children[colIndex];
            this.markTileAsFree(tile);
        });
    }

    isMainDiagonalComplete() {
        for (let i = 0; i < this.tileArea.children.length; i++) {
            const row = this.tileArea.children[i];
            const tile = row.children[i];
            if (!this.isTileOccupied(tile)) {
                return false;
            }
        }
        return true;
    }

    clearMainDiagonal() {
        for (let i = 0; i < this.tileArea.children.length; i++) {
            const row = this.tileArea.children[i];
            const tile = row.children[i];
            this.markTileAsFree(tile);
        }
    }

    isAntiDiagonalComplete() {
        for (let i = 0; i < this.tileArea.children.length; i++) {
            const row = this.tileArea.children[i];
            const tile = row.children[row.children.length - 1 - i];
            if (!this.isTileOccupied(tile)) {
                return false;
            }
        }
        return true;
    }

    clearAntiDiagonal() {
        for (let i = 0; i < this.tileArea.children.length; i++) {
            const row = this.tileArea.children[i];
            const tile = row.children[row.children.length - 1 - i];
            this.markTileAsFree(tile);
        }
    }

    markTileAsFree(tile: Node) {
        const rowIndex = this.tileArea.children.indexOf(tile.parent);
        const tileIndex = tile.parent.children.indexOf(tile);
        const index = rowIndex.toString() + tileIndex.toString();
        this.mapSet.set(index, 0);

        // Optionally, you can reset the tile's appearance here
        tile.getChildByName("Sprite").getComponent(Sprite).color = Color.WHITE;
    }
}
