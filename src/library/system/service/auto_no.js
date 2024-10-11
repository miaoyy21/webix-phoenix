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
                            utils.grid.addLast($$(kind_grid_id), { "description_": "" }, "code_");
                        }
                    },
                    {
                        view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                        click: () => utils.grid.remove($$(kind_grid_id), null, "自动编码", "name_")
                    },
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            $$(kind_grid_id).editCancel();

                            $$(kind_grid_id).clearAll();
                            $$(kind_grid_id).load($$(kind_grid_id).config.url);
                        }
                    },
                    {
                        view: "button", label: "测试", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-run-fast",
                        click() {
                            var row = $$(kind_grid_id).getSelectedItem();
                            if (!row) return;

                            var fields = [];
                            $$(item_grid_id).eachRow((id) => {
                                var item = $$(item_grid_id).getItem(id);
                                if (item["code_"] === "VALUES") {
                                    fields.push(item["value_"]);
                                }
                            });

                            var callback = function (values) {
                                webix.ajax()
                                    .get("api/sys/auto_nos?code=" + row["code_"], values)
                                    .then(
                                        (res) => {
                                            webix.alert({ type: "alert-warning", title: "系统提示", text: res.text() });
                                        }
                                    );
                            }

                            if (fields.length) {
                                webix.prompt({
                                    title: "可变参数",
                                    text: "请依次输入可变参数 " + fields.join(","),
                                    input: {
                                        required: true,
                                        placeholder: "如果多个可变参数，需要用逗号分隔",
                                    },
                                    type: "prompt-warning",
                                    width: 350,
                                }).then(function (res) { callback(_.object(fields, res.split(","))) });
                            } else {
                                callback();
                            }
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
                        gravity: 3,
                        resizeColumn: true,
                        editable: true,
                        tooltip: true,
                        scrollX: false,
                        drag: "order",
                        select: true,
                        url: "/api/sys/auto_no_kinds",
                        save: {
                            url: "/api/sys/auto_no_kinds",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation",
                            on: {
                                onAfterSync(status, text, data, loader) {
                                    if (status["status"] === "insert") {
                                        utils.grid.add($$(item_grid_id), { "kind_id_": data["newid"], "code_": "STRING", "value_": "*" });
                                    }
                                }
                            }
                        },
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "code_", header: { text: "编码", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 120 },
                            { id: "name_", header: { text: "名称", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                            { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 160, css: { "text-align": "center" } },
                            // {
                            //     width: 80,
                            //     header: { text: "操作", css: { "text-align": "center" } },
                            //     tooltip: false,
                            //     css: { "text-align": "center" },
                            //     template: `<div class="webix_el_box" style="padding:0px">
                            //             <button webix_tooltip="测试" type="button" class="btn_test webix_icon_button" style="height:30px;width:30px;">
                            //                 <span class="phoenix_primary_icon mdi mdi-18px mdi-run-fast"></span>
                            //             </button> 
                            //         </div>`,
                            // },
                        ],
                        rules: {
                            "code_": webix.rules.isNotEmpty,
                            "name_": webix.rules.isNotEmpty,
                        },
                        // onClick: {
                        //     btn_test(e, item) {

                        //     },
                        // },
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
                                $$(item_grid_id).load(() => webix.ajax("/api/sys/auto_no_items", { "kind_id": row.id }));
                            },
                        }
                    },
                    { view: "resizer" },
                    {
                        id: item_grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        gravity: 2,
                        resizeColumn: true,
                        editable: true,
                        tooltip: true,
                        scrollX: false,
                        drag: "order",
                        select: true,
                        data: [],
                        save: {
                            url: "/api/sys/auto_no_items",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation"
                        },
                        columns: [
                            {
                                id: "code_", header: { text: "编码", css: { "text-align": "center" } }, editor: "combo",
                                options: [
                                    {
                                        "id": "STRING",
                                        "value": "固定字符串",
                                        "default": "*"
                                    },
                                    {
                                        "id": "VALUES",
                                        "value": "可变参数",
                                        "default": ""
                                    },
                                    {
                                        "id": "DATETIME",
                                        "value": "日期时间格式",
                                        "default": "20060102"
                                    },
                                    {
                                        "id": "SEQ",
                                        "value": "顺序号",
                                        "default": "0001"
                                    }
                                ],
                                sort: "text", width: 100
                            },
                            { id: "value_", header: { text: "名称", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
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
                            "value_": webix.rules.isNotEmpty,
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
                                    webix.message({ type: "error", text: "至少要包含一个自动编码项" });
                                    return;
                                }

                                utils.grid.remove($$(item_grid_id), row, "自动编码项", "code_")
                            },
                        },
                        on: {
                            onAfterEditStop(state, editor, ignoreUpdate) {
                                // 设置默认格式
                                if (editor.column === "code_" && state.old != state.value) {
                                    var row = this.getItem(editor.row);
                                    if (!row) return;

                                    var find = _.find($$(item_grid_id).config.columns, (col) => col.id === editor.column);
                                    if (!find) return;

                                    var item = find.collection.getItem(state.value);
                                    if (!item) return;

                                    row["value_"] = item["default"];
                                    this.updateItem(editor.row, row);
                                }
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
                        }
                    }
                ]
            }
        ]
    }
}

export { builder }