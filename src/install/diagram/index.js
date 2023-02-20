import { node } from "./node";
import { template } from "./template";

const $ = go.GraphObject.make;

webix.protoUI({
    name: "goDiagram",
    $init: function (config) {
        this.$view.innerHTML = "<div style='position:relative; width:100%; height:100%; overflow:scroll'></div>";
        this._initDiagram(config);
    },
    _initDiagram: function (config) {
        var editable = config.editable;

        var myDiagram = $(go.Diagram, this.$view.firstChild,
            {
                "LinkDrawn": node.label, "LinkRelinked": node.label, "undoManager.isEnabled": true,
                // grid: editable ? $(go.Panel, "Grid",
                //     $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                //     $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 })
                // ) : null,
                grid: $(go.Panel, "Grid",
                    $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                    $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 })
                ),
                allowCopy: editable,
                allowClipboard: editable,
                allowMove: editable,
                allowDelete: editable,
                allowLink: editable,
                allowRelink: editable,
                allowReshape: editable,
                allowTextEdit: editable,
                allowGroup: false,
                "draggingTool.isGridSnapEnabled": true,
            },
        );

        myDiagram.nodeTemplateMap = template.makeMap(editable);
        myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
        myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
        myDiagram.linkTemplate =
            $(go.Link,
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5,
                    toShortLength: 4,
                    relinkableFrom: true,
                    relinkableTo: true,
                    reshapable: true,
                    resegmentable: true,
                    mouseEnter: (e, link) => link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)",
                    mouseLeave: (e, link) => link.findObject("HIGHLIGHT").stroke = "transparent",
                    selectionAdorned: false
                },
                new go.Binding("points").makeTwoWay(),
                $(go.Shape, { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
                $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
                $(go.Shape, { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
                $(go.Panel, "Auto",
                    { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                    new go.Binding("visible", "visible").makeTwoWay(),
                    $(go.Shape, "RoundedRectangle", { fill: "white", strokeWidth: 0 }),
                    $(go.TextBlock, "条件输出", { textAlign: "center", stroke: "black", editable: true }, new go.Binding("text").makeTwoWay())
                )
            );

        // 改变所选节点
        var onChangedSelection = config.onChangedSelection;
        if (onChangedSelection) {
            myDiagram.addDiagramListener("ChangedSelection", function (event) {
                var node = myDiagram.selection.first();
                if (_.isNull(node) || _.isUndefined(node)) {
                    onChangedSelection();
                    return;
                }

                onChangedSelection(node.data);
            });

            onChangedSelection();
        }

        // 改变所选节点
        var onSelectionDeleting = config.onSelectionDeleting;
        if (onSelectionDeleting) {
            myDiagram.addDiagramListener("SelectionDeleting", function (event) {
                myDiagram.selection.each((selection) => onSelectionDeleting(selection.data))
            });
        }

        this.myDiagram = myDiagram;
    },

    model_setter(value) { this.myDiagram.model = go.Model.fromJson(value); },

    getDiagram() { return this.myDiagram; }
}, webix.ui.view);

// Palette
webix.protoUI({
    name: "goPalette",

    $init: function (config) {
        this.$view.innerHTML = "<div style='position:relative; width:100%; height:100%; overflow:visible'; ></div>";
        this._initPalette(config);
    },

    _initPalette: function (config) {
        this.myPalette = $(go.Palette, this.$view.firstChild, {
            nodeTemplateMap: template.makeMap(),
            model: new go.GraphLinksModel([
                { category: "Start", text: "开始" },
                { category: "Execute", text: "执行环节" },
                { category: "Branch", text: "条件分支" },
                { category: "End", text: "结束" },
            ])
        });
    },

    model_setter: function (value) {
        this.myPalette.model = new go.Palette(this.$view.innerHTML);
    },

    getPalette() {
        return this.myPalette;
    }
}, webix.ui.view);