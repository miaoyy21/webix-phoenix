
const $ = go.GraphObject.make;

var node = {};

// 标签
node.label = function (e) {
    var label = e.subject.findObject("LABEL");
    if (label !== null) label.visible = (e.subject.fromNode.data.category === "Branch");
}

// 样式
node.style = function () {
    return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { locationSpot: go.Spot.Center }
    ];
}

// 创建节点侧边的连接节点
node.makePort = function (editable, name, align, spot, output, input) {
    var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
    return $(go.Shape,
        {
            fill: "transparent",
            strokeWidth: 0,
            width: editable ? (horizontal ? NaN : 8) : 0,
            height: editable ? (!horizontal ? NaN : 8) : 0,
            alignment: align,
            stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
            portId: name,
            fromSpot: spot,
            fromLinkable: output,
            toSpot: spot,
            toLinkable: input,
            cursor: "pointer",
            mouseEnter: (e, port) => { if (!e.diagram.isReadOnly) port.fill = "purple"; },
            mouseLeave: (e, port) => port.fill = "transparent"
        },
    );
}

export { node }