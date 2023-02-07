function builder() {
    var kind_grid_id = utils.UUID();
    var item_grid_id = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "创建", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            utils.grid.add($$(kind_grid_id), { "description_": "" }, "code_");
                        }
                    },
                    {
                        view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                        click: () => utils.grid.remove($$(kind_grid_id), null, "数据字典", "name_")
                    },
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            $$(kind_grid_id).editCancel();

                            $$(kind_grid_id).clearAll();
                            $$(kind_grid_id).load($$(kind_grid_id).config.url);
                        }
                    },
                    {},
                    { view: "icon", icon: "mdi mdi-18px mdi-fullscreen", tooltip: "全屏模式", click: () => webix.fullscreen.set($$(webix.storage.cookie.get("PHOENIX_USING_MENU"))) },
                ]
            },
            {
                cols: [
                    {
                        id: kind_grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        resizeColumn: true,
                        editable: true,
                        tooltip: true,
                        scrollX: false,
                        drag: "order",
                        select: true,
                        url: "/api/sys/dict_kinds",
                        save: {
                            url: "/api/sys/dict_kinds",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation",
                            on: {
                                onAfterSync(status, text, data, loader) {
                                    if (status["status"] === "insert") {
                                        utils.grid.add($$(item_grid_id), { "kind_id_": data["newid"], "code_": "Default", "name_": "默认值" });
                                    }
                                }
                            }
                        },
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "code_", header: { text: "字典编码", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 140 },
                            { id: "name_", header: { text: "字典名称", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 140 },
                            { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                            { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 160, css: { "text-align": "center" } },
                        ],
                        rules: {
                            "code_": webix.rules.isNotEmpty,
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
                                $$(item_grid_id).editCancel();

                                $$(item_grid_id).clearAll();
                                $$(item_grid_id).load(() => webix.ajax("/api/sys/dict_items", { "kind_id": row.id }));
                            },
                        }
                    },
                    { view: "resizer" },
                    {
                        id: item_grid_id,
                        view: "datatable",
                        width: 360,
                        css: "webix_data_border webix_header_border",
                        resizeColumn: true,
                        editable: true,
                        tooltip: true,
                        scrollX: false,
                        drag: "order",
                        select: true,
                        data: [],
                        save: {
                            url: "/api/sys/dict_items",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation"
                        },
                        columns: [
                            { id: "code_", header: { text: "字典项编码", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 100 },
                            { id: "name_", header: { text: "字典项名称", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                            {
                                width: 120,
                                header: { text: "操作", css: { "text-align": "center" } },
                                tooltip: false,
                                css: { "text-align": "center" },
                                template: `<div class="webix_el_box" style="padding:0px">
                                        <button webix_tooltip="新增" type="button" class="btn_add webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil-plus"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                    </div>`,
                            },
                        ],
                        rules: {
                            "code_": webix.rules.isNotEmpty,
                            "name_": webix.rules.isNotEmpty,
                        },
                        onClick: {
                            btn_add(e, item) {
                                var row = this.getItem(item.row);

                                utils.grid.add($$(item_grid_id), { "kind_id_": row["kind_id_"] }, "code_");
                            },
                            btn_remove(e, item) {
                                var row = this.getItem(item.row);
                                if (!row) return;

                                if ($$(item_grid_id).count() == 1) {
                                    webix.message({ type: "error", text: "至少要包含一个数据字典项" });
                                    return;
                                }

                                utils.grid.remove($$(item_grid_id), row, "数据字典项", "code_")
                            },
                        },
                        on: {
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
                        }
                    }
                ]
            }
        ]
    }
}

export { builder }