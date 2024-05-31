import { _decorator, Component, instantiate, JsonAsset, Layout, Node, Prefab, SystemEvent, UITransform, Vec2, Vec3 } from "cc";
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
    patternJson: JsonAsset;
    @property({ type: Node })
    patterns: Node = null;
    location;
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
            child.on(
                Node.EventType.MOUSE_DOWN,
                (event: MouseEvent) => {
                    console.log("outer event", event);
                   
                    // console.log(event.)
                    // event.target.addEventListener(
                    //     Node.EventType.MOUSE_MOVE,
                    //     (event: MouseEvent) => {
                    //         console.log("inner event", event);
                    //     },
                    //     true
                    // );
                    let pos = child.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(event.x, event.y, 0));

                    // console.log("before pos", child.getWorldPosition());
                    // child.setWorldPosition(pos);
                    // console.log("after pos", child.getWorldPosition());
                },
                this
            );
        });
    }

    playAnimation(event: Event, node: Node) {
        console.log("play called");
        let otherChild = node.parent.children.filter((childNode) => childNode.name !== node.name);
        // console.log("curr child", node);
        // console.log("other child", otherChild);
        node.setScale(new Vec3(1.3, 1.3, 0));
        otherChild.forEach((childNode) => childNode.setScale(new Vec3(0.7, 0.7, 0.7)));
    }

    getDataByName(patterns: any[], name: string) {
        return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
    }
}
// when mouse is clicked on a node i want that node to be selected until mouse click is released how to do that in cocos .ts
