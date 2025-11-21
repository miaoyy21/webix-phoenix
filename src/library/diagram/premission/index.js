function builder() {
    var diagrams = [];

    var roleGrid = utils.protos.datatable({
        editable: false,
        url: "/api/sys/roles",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "name_", header: { text: "角色名称", css: { "text-align": "center" } }, sort: "text", width: 160 },
            { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, fillspace: true },
        ],
        on: {
            onAfterSelect(item) {
                console.log(arguments);
                $$(diagramGrid.id).clearAll();
                webix.extend($$(diagramGrid.id), webix.ProgressBar).showProgress();
                if (!_.size(diagrams)) {
                    diagrams = JSON.parse(webix.ajax().sync().get("/api/wf/diagrams").responseText);
                }

                webix.ajax("/api/wf/diagram_roles", { "role_id": item.id })
                    .then((data) => {
                        // 转换为Map对象
                        var roleDiagrams = _.map(data.json(), (obj) => obj["diagram_id_"]);

                        // 设置选中状态
                        $$(diagramGrid.id).define("data", _.map(webix.copy(diagrams), (diagram) => _.extend(diagram, { "checked": _.indexOf(roleDiagrams, diagram.id) >= 0 })))

                        webix.extend($$(diagramGrid.id), webix.ProgressBar).hideProgress();

                        var overlayBox = webix.extend($$(diagramGrid.id), webix.OverlayBox);
                        if (!$$(diagramGrid.id).count()) {
                            overlayBox.showOverlay("无检索数据");
                        } else {
                            overlayBox.hideOverlay();
                        }
                    });
            },
        }
    });

    var diagramGrid = utils.protos.datatable({
        editable: true,
        checkboxRefresh: true,
        url: null,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            {
                id: "checked", header: { text: "选择", css: { "text-align": "center" } }, css: { "text-align": "center" },
                template(obj, common, value) {
                    if (value) {
                        return "<span class='webix_table_checkbox checked webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />";
                    }

                    return "<span class='webix_table_checkbox notchecked webix_icon mdi mdi-checkbox-blank-outline'/>";
                }, width: 50
            },
            { id: "code_", header: { text: "流程编码", css: { "text-align": "center" } }, sort: "text", width: 80 },
            { id: "name_", header: { text: "流程名称", css: { "text-align": "center" } }, sort: "text", fillspace: true },
        ],
    });

    return {
        cols: [
            {
                view: "scrollview",
                body: {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "search", align: "center", placeholder: "按角色过滤",
                                    on: {
                                        onTimedKeypress() {
                                            var text = this.getValue().toString().toLowerCase();

                                            $$(roleGrid.id).filter((obj) => {
                                                var filter = [obj["code_"], obj["name_"]].join("|");
                                                filter = filter.toString().toLowerCase();
                                                return (filter.indexOf(text) != -1);
                                            });

                                            var first = $$(roleGrid.id).getFirstId();
                                            var overlayBox = webix.extend($$(diagramGrid.id), webix.OverlayBox);
                                            if (!first) {
                                                $$(roleGrid.id).showOverlay("无符合条件的数据");

                                                overlayBox.showOverlay("无检索数据");
                                                $$(diagramGrid.id).clearAll();
                                            } else {
                                                $$(roleGrid.id).hideOverlay();

                                                overlayBox.hideOverlay();
                                                $$(roleGrid.id).select(first);
                                            }
                                        }
                                    }
                                },
                            ]
                        },
                        roleGrid,
                    ]
                },
            },
            { view: "resizer" },
            {
                view: "scrollview",
                body: {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "button", label: "保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                                    click() {
                                        var roleDiagrams = [];
                                        $$(diagramGrid.id).eachRow((id) => {
                                            if ($$(diagramGrid.id).getItem(id)["checked"]) {
                                                roleDiagrams.push(id);
                                            }
                                        }, true);

                                        var params = { "role_id": $$(roleGrid.id).getSelectedId(false, true), "diagrams": roleDiagrams };
                                        webix.ajax().post("/api/wf/diagram_roles?method=PatchDiagrams", params)
                                            .then((res) => webix.message({ type: "success", text: "保存成功" }));
                                    }
                                },
                                {}
                            ]
                        },
                        diagramGrid,
                    ]
                }
            }
        ]
    };
}

export { builder };