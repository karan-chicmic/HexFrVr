import { _decorator, Component, instantiate, JsonAsset, Layout, Node, Prefab, UITransform } from "cc";
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
    }

    getDataByName(patterns: any[], name: string) {
        return patterns.find((pattern: { name: any }) => pattern.name === name)?.data || null;
    }
}
