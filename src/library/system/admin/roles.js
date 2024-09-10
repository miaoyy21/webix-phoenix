function builder() {
    var grid_id = utils.UUID();
    var tree_id = utils.UUID();
    var action_id = utils.UUID();

    var menus = [];

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
                                    view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                    click: () => utils.grid.add($$(grid_id), {}, "name_")
                                },
                                {
                                    view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                    click: () => utils.grid.remove($$(grid_id), null, "角色", "name_")
                                },
                            ]
                        },
                        {
                            id: grid_id,
                            view: "datatable",
                            css: "webix_data_border webix_header_border",
                            editable: true,
                            tooltip: true,
                            resizeColumn: true,
                            scrollX: false,
                            select: "row",
                            drag: "order",
                            url: "/api/sys/roles",
                            save: {
                                url: "/api/sys/roles",
                                updateFromResponse: true,
                                trackMove: true,
                                operationName: "operation",
                                on: {
                                    onAfterSync(status, text, data, loader) {
                                        if (status["status"] === "insert") {
                                            $$(action_id).enable();
                                        }
                                    }
                                }
                            },
                            columns: [
                                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                                { id: "name_", header: { text: "角色名称", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                                { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, editor: "text", fillspace: true },
                                { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 160, css: { "text-align": "center" } }
                            ],
                            rules: {
                                "name_": webix.rules.isNotEmpty,
                            },
                            on: {
                                "data->onStoreUpdated": function () {
                                    this.data.each(function (obj, i) {
                                        obj.index = i + 1;
                                    })
                                },
                                onBeforeLoad() {
                                    this.showOverlay("数据加载中...");
                                },
                                onAfterLoad() {
                                    this.hideOverlay();
                                    if (!this.count()) {
                                        this.showOverlay("无检索数据");
                                        return;
                                    }

                                    this.select(this.getFirstId());
                                },
                                onAfterSelect(row) {
                                    $$(tree_id).clearAll();
                                    webix.extend($$(tree_id), webix.ProgressBar).showProgress();
                                    if (!_.size(menus)) {
                                        menus = JSON.parse(webix.ajax().sync().get("/api/sys/menus", { "scope": "SIMPLE" }).responseText);
                                    }

                                    if ($$(grid_id).validate(row.id)) {
                                        $$(action_id).enable();
                                    } else {
                                        $$(action_id).disable();
                                    }

                                    webix.ajax("/api/sys/role_menus", { "role_id": row.id })
                                        .then((res) => {
                                            var data = utils.tree.buildTree(webix.copy(menus));
                                            $$(tree_id).define("data", data);
                                            $$(tree_id).refresh();

                                            _.map(res.json(), (menu) => $$(tree_id).checkItem(menu["menu_id_"]));

                                            webix.extend($$(tree_id), webix.ProgressBar).hideProgress();

                                            // 自动打开用户的系统菜单
                                            var userMenus = _.filter(data, (row) => row["name_"].indexOf("主数据") >= 0 || row["name_"].indexOf("物资") >= 0);
                                            _.each(userMenus, (menu) => { $$(tree_id).open(menu["id"], false) });
                                        });
                                }
                            }
                        },
                    ],
                },
            },
            { view: "resizer" },
            {
                view: "scrollview",
                width: 560,
                body: {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    id: action_id, view: "button", label: "保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                                    click() {
                                        var menus = [];
                                        _.forEach($$(tree_id).getChecked(), (id) => {
                                            var item = $$(tree_id).getItem(id);
                                            if (item["$count"]) return;

                                            menus.push(id);
                                        })

                                        var values = { "role_id": $$(grid_id).getSelectedId(false, true), "menus": menus };
                                        webix.ajax().post("/api/sys/role_menus?method=Patch", values)
                                            .then((res) => webix.message({ type: "success", text: "保存成功" }));
                                    }
                                },
                                {}
                            ]
                        },
                        {
                            id: tree_id,
                            view: "tree",
                            type: "lineTree",
                            threeState: true,
                            data: [],
                            template: "{common.icon()} {common.checkbox()} <span>#name_#</span>",
                        },
                    ]
                },
            }
        ]
    }
}

export { builder }