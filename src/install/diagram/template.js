import { node } from "./node";

const $ = go.GraphObject.make;

var template = {};

template.makeMap = function (editable) {
    var nodeTemplateMap = new go.Map();

    // 默认节点
    nodeTemplateMap.add("Execute",
        $(go.Node, "Table", node.style(),
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { width: 120, height: 48, fill: "white", stroke: "black", strokeWidth: 2 }, new go.Binding("fill", "color")),// fill -> 背景颜色；stroke -> 边框颜色；strokeWidth -> 边框宽度
                $(go.TextBlock,
                    { margin: 8, wrap: go.TextBlock.WrapFit, editable: editable },
                    new go.Binding("text").makeTwoWay(),
                )
            ),
            node.makePort(editable, "T", go.Spot.Top, go.Spot.TopSide, false, true),
            node.makePort(editable, "L", go.Spot.Left, go.Spot.LeftSide, true, true),
            node.makePort(editable, "R", go.Spot.Right, go.Spot.RightSide, true, true),
            node.makePort(editable, "B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        ),
    );

    // 条件节点
    nodeTemplateMap.add("Branch",
        $(go.Node, "Table", node.style(),
            $(go.Panel, "Auto",
                $(go.Shape, "Diamond", { width: 120, height: 72, fill: "white", stroke: "black", strokeWidth: 2 }, new go.Binding("fill", "color")),
                $(go.TextBlock,
                    { margin: 16, wrap: go.TextBlock.WrapFit, editable: editable },
                    new go.Binding("text").makeTwoWay(),
                )
            ),
            node.makePort(editable, "T", go.Spot.Top, go.Spot.Top, false, true),
            node.makePort(editable, "L", go.Spot.Left, go.Spot.Left, true, true),
            node.makePort(editable, "R", go.Spot.Right, go.Spot.Right, true, true),
            node.makePort(editable, "B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ),
    );

    // 开始节点
    nodeTemplateMap.add("Start",
        $(go.Node, "Table", node.style(),
            $(go.Panel, "Spot",
                $(go.Shape, "Circle", { desiredSize: new go.Size(64, 64), fill: "white", stroke: "black", strokeWidth: 2 }, new go.Binding("fill", "color")),
                $(go.TextBlock, "Start", new go.Binding("text"))
            ),
            node.makePort(editable, "L", go.Spot.Left, go.Spot.Left, true, false),
            node.makePort(editable, "R", go.Spot.Right, go.Spot.Right, true, false),
            node.makePort(editable, "B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ),
    );

    // 结束节点
    nodeTemplateMap.add("End",
        $(go.Node, "Table", node.style(),
            $(go.Panel, "Spot",
                $(go.Shape, "Circle", { desiredSize: new go.Size(64, 64), fill: "white", stroke: "black", strokeWidth: 2 }, new go.Binding("fill", "color")),
                $(go.TextBlock, "End", new go.Binding("text"))
            ),
            node.makePort(editable, "T", go.Spot.Top, go.Spot.Top, false, true),
            node.makePort(editable, "L", go.Spot.Left, go.Spot.Left, false, true),
            node.makePort(editable, "R", go.Spot.Right, go.Spot.Right, false, true)
        ),
    );

    return nodeTemplateMap;
}

export { template }