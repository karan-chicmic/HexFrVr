// import {
//     _decorator,
//     Component,
//     EventMouse,
//     instantiate,
//     JsonAsset,
//     Layout,
//     Node,
//     Prefab,
//     systemEvent,
//     SystemEvent,
//     UITransform,
//     Vec2,
//     Vec3,
// } from "cc";
// const { ccclass, property } = _decorator;

// @ccclass("Game")
// export class Game extends Component {
//     @property({ type: Node })
//     tileArea: Node = null;
//     @property({ type: Prefab })
//     rowPrefab: Prefab = null;
//     @property({ type: Prefab })
//     tilePrefab: Prefab = null;
//     @property({ type: JsonAsset })
//     patternJson: JsonAsset;
//     @property({ type: Node })
//     patterns: Node = null;

//     private selectedNode: Node = null;

//     start() {
//         let jsonData = this.patternJson.json;
//         let patterns = jsonData.patterns;
//         let levelData = this.getDataByName(patterns, `map`);

//         for (let i = 0; i < 9; i++) {
//             let rowData = levelData[i];
//             let rowLength = rowData.length;
//             let rowNode = instantiate(this.rowPrefab);
//             if (rowLength < 9) {
//                 let diff = 9 - rowLength;
//                 rowNode.getComponent(Layout).paddingLeft = (diff * 45) / 2;
//                 rowNode.getComponent(Layout).paddingRight = (diff * 45) / 2;
//             }
//             for (let j = 0; j < rowLength; j++) {
//                 let tileNode = instantiate(this.tilePrefab);
//                 rowNode.addChild(tileNode);
//             }
//             this.tileArea.addChild(rowNode);
//         }

//         this.patterns.children.forEach((child: Node) => {
//             child.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
//         });

//         systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
//     }

//     onDestroy() {
//         this.patterns.children.forEach((child: Node) => {
//             child.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
//         });

//         systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
//     }

//     private onMouseDown(event: EventMouse) {
//         const targetNode = event.currentTarget as Node;
//         this.selectNode(targetNode);
//     }

//     private onMouseUp(event: EventMouse) {
//         this.deselectNode();
//     }

//     private selectNode(node: Node) {
//         this.selectedNode = node;
//         // Change the node's appearance or state
//         node.setScale(new Vec3(1.3, 1.3, 1.3)); // Example: scale up the selected node
//     }

//     private deselectNode() {
//         if (this.selectedNode) {
//             // Revert the node's appearance or state
//             this.selectedNode.setScale(new Vec3(1, 1, 1)); // Example: reset the scale of the node
//             this.selectedNode = null;
//         }
//     }

//     playAnimation(event: Event, node: Node) {
//         console.log("play called");
//         let otherChild = node.parent.children.filter((childNode) => childNode.name !== node.name);
//         node.setScale(new Vec3(1.3, 1.3, 0));
//         otherChild.forEach((childNode) => childNode.setScale(new Vec3(0.7, 0.7, 0.7)));
//     }

//     getDataByName(patterns: any[], name: string) {
//         return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
//     }
// }
