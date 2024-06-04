import {
    _decorator,
    Button,
    Color,
    Component,
    director,
    EventTouch,
    instantiate,
    JsonAsset,
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
    @property({ type: Node })
    menuButton: Node = null;
    @property({ type: Node })
    menu: Node = null;
    location: any;
    private isDragging: boolean = false;
    private offset: Vec3 = v3();
    private MinLength = 5;
    private MaxLength = 9;
    private rNo = -1;
    isValidPattern = false;
    tilesUnderPattern = [];
    tileIndex = [];

    mapSet = new Map<string, number>();

    AllColors = [
        { color: new Color(64, 102, 161) },
        { color: new Color(75, 92, 100) },
        { color: new Color(87, 50, 161) },
        { color: new Color(115, 190, 76) },
        { color: new Color(115, 93, 54) },
    ];

    start() {
        this.generateBoard(this.MinLength, this.MaxLength);
        this.generateReverseBoard(this.MinLength, this.MaxLength);
        this.generatePattern();
        this.patternCallbacks();
    }
    onTouchStart(event: EventTouch, child: Node) {
        this.isDragging = true;
        this.isValidPattern = false;
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

    patternCallbacks() {
        this.patterns.children.forEach((child: Node) => {
            child.on(
                Node.EventType.TOUCH_START,
                (event: EventTouch) => this.onTouchStart(event, child),

                this
            );
            child.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => this.onTouchMove(event, child), this);
            child.on(
                Node.EventType.TOUCH_END,
                (event: EventTouch) => this.onTouchEnd(event, child),

                this
            );
            child.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => this.onTouchEnd(event, child), this);
        });
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
        if (this.isValidPattern) {
            this.tilesUnderPattern.forEach((tile: Node) => {
                tile.getChildByName("Sprite").getComponent(Sprite).color = child.children[0].children[0]
                    .getChildByName("Sprite")
                    .getComponent(Sprite).color;
            });
            console.log(this.tileIndex);
            this.tileIndex.forEach((idx) => {
                this.mapSet.set(idx, 1);
            });
            child.destroy();
            this.addNewPattern();
            this.patternCallbacks();
        }

        this.isDragging = false;
    }

    getDataByName(patterns: any[], name: string) {
        return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
    }
    addNewPattern() {
        let patternColor = this.AllColors[randomRangeInt(0, this.AllColors.length)].color;
        let jsonData = this.blockPattern.json;
        let Allpatterns = jsonData.block;
        let blockNo = randomRangeInt(1, Allpatterns.length + 1);
        let blockData = this.getDataByName(Allpatterns, `block${blockNo}`);
        console.log("block data", blockData);
        console.log("block generated", `block${blockNo}`);

        let rowNode = instantiate(this.blockPrefab);
        for (let j = 0; j < blockData.length; j++) {
            let rowData = blockData[j];
            let row = instantiate(this.rowPrefab);
            for (let k = 0; k < rowData.length; k++) {
                if (rowData[k] == 0) {
                    continue;
                } else {
                    let blockNode = instantiate(this.patternPrefab);
                    blockNode.getChildByName("Sprite").getComponent(Sprite).color = patternColor;
                    row.addChild(blockNode);
                }
            }
            rowNode.addChild(row);
        }
        this.patterns.addChild(rowNode);
    }

    generatePattern() {
        for (let i = 0; i < 3; i++) {
            this.addNewPattern();
        }
    }
    checkAvailability(event: EventTouch, currNode: Node) {
        // get node from parent corresponding to mouse position
        // check if currNode can be placed in tiledArea or not

        let mousePosition = event.getUILocation();
        const localPosition = this.node
            .getComponent(UITransform)
            .convertToNodeSpaceAR(new Vec3(mousePosition.x, mousePosition.y, 0));

        // get row from map
        const hitNode = this.getNodeAtPoint(new Vec2(localPosition.x, localPosition.y));

        if (hitNode != null) {
            const tile = this.getTileFromRow(hitNode, new Vec2(mousePosition.x, mousePosition.y));

            let tileIndex = hitNode.children.indexOf(tile);
            let parentIndex = this.tileArea.children.indexOf(hitNode);

            let index = parentIndex.toString() + tileIndex.toString();

            console.log("value at cell", this.mapSet.get(index));

            let centerRow = this.getCenterofPattern(currNode);
            console.log("center of pattern row", centerRow);

            let centerRowLeftIndex = this.getLeftIndex(centerRow, currNode, tileIndex);
            console.log("center row left index", centerRowLeftIndex);
            if (centerRowLeftIndex >= 0) {
                if (this.isPatternValidForTile(currNode, centerRow, parentIndex, centerRowLeftIndex)) {
                    console.error("Pattern can be placed here");
                    let tiles = this.getTilesUnderPattern(currNode, centerRow, parentIndex, centerRowLeftIndex);
                    console.log("tiles under pattern", tiles);
                    tiles.forEach((tile) => {
                        tile.getChildByName("Sprite").getComponent(Sprite).color = currNode.children[0].children[0]
                            .getChildByName("Sprite")
                            .getComponent(Sprite).color;
                    });
                }
            }

            // check if value is undefined
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
    getLeftIndex(centerRow: number, currNode: Node, tileIndex: number) {
        let centerRowOfNode = currNode.children[centerRow];
        let centerRowLength = centerRowOfNode.children.length;
        let leftIndex = tileIndex - centerRowLength + 1;
        if (leftIndex >= 0) {
            return leftIndex;
        } else {
            return -1;
        }
    }

    getTilesUnderPattern(pattern: Node, centerRowIndex: number, parentIndex: number, leftIndex: number) {
        this.tilesUnderPattern = [];
        let upperParentIndex = parentIndex - centerRowIndex;
        let patternLength = pattern.children.length;
        for (let i = 0; i < patternLength; i++) {
            let currRow = this.tileArea.children[upperParentIndex];
            let currPatternRow = pattern.children[i];
            currRow.children.forEach((tile) => {
                if (
                    currRow.children.indexOf(tile) >= leftIndex &&
                    currRow.children.indexOf(tile) < leftIndex + currPatternRow.children.length
                ) {
                    let currIndex = upperParentIndex.toString() + currRow.children.indexOf(tile).toString();
                    this.tilesUnderPattern.push(tile);
                    this.tileIndex.push(currIndex);
                }
            });

            upperParentIndex = upperParentIndex + 1;
        }
        return this.tilesUnderPattern;
    }

    getCenterofPattern(pattern: Node) {
        return Math.floor(pattern.children.length / 2);
    }

    isPatternValidForTile(pattern: Node, centerRowIndex: number, parentIndex: number, leftIndex: number) {
        let upperParentIndex = parentIndex - centerRowIndex;
        let lowerParentIndex = parentIndex + centerRowIndex;
        console.log("upper parent index", upperParentIndex);
        console.log("lower parent index", lowerParentIndex);
        if (upperParentIndex < 0 || lowerParentIndex >= this.tileArea.children.length) return false;
        pattern.children.forEach((row) => {
            let rowLength = row.children.length;
            if (leftIndex + rowLength >= this.tileArea.children[upperParentIndex].children.length) {
                return false;
            } else {
                let currLeftIndex = leftIndex;
                let remainingChilds = rowLength - 1 - leftIndex;
                for (let i = 0; i < remainingChilds; i++) {
                    let currIndex = upperParentIndex.toString() + currLeftIndex.toString();
                    let tileValue = this.mapSet.get(currIndex);
                    console.log("curr index", currIndex, "curr value", this.mapSet.get(currIndex));
                    if (tileValue == 1) return false;
                    currLeftIndex = currLeftIndex + 1;
                }
                console.log("upper parent value inside loop", upperParentIndex);
                upperParentIndex = upperParentIndex + 1;
            }
        });
        this.isValidPattern = true;
        return true;
    }
    onMenuButtonClick() {
        this.menuButton.active = false;
        this.menu.active = true;
    }

    onCloseClick() {
        this.menu.active = false;
        this.menuButton.active = true;
    }

    onNewGame() {
        director.loadScene("main");
    }
}
