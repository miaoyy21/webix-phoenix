function builder() {
    var grid_id = utils.UUID();
    var grid_column_id = utils.UUID();
    // var grid_index_id = utils.UUID();
    // var grid_foreign_key_id = utils.UUID();

    function open(table_id) {
        var isChanged = false;

        webix.ui({
            view: "window",
            close: true,
            modal: true,
            fullscreen: true,
            animate: { type: "flip", subtype: "vertical" },
            head: "编辑数据库表",
            position: "center",
            body: {
                // view: "tabview",
                // tabbar: { optionWidth: 160 },
                // cells: [
                /************************************** 字段 **************************************/
                // {
                // header: "<span class='webix_icon mdi mdi-middleware-outline'></span>字段",
                // body: {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() {
                                    if (!$$(grid_column_id).count()) {
                                        $$(grid_column_id).hideOverlay();
                                    }

                                    var row = $$(grid_column_id).find((obj) => obj["is_sys_"] === "1" && obj["code_"] !== "id", true)
                                    var id = $$(grid_column_id).add({ "table_id_": table_id, "type_": "VARCHAR(256)", "description_": "" }, row.index - 1);
                                    // var id = $$(grid_column_id).add({ "table_id_": table_id, "type_": "VARCHAR(256)", "description_": "" },0);
                                    $$(grid_column_id).edit({ row: id, column: "code_" });
                                }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click() {
                                    utils.grid.remove($$(grid_column_id), null, "字段", "name_");
                                    isChanged = true;
                                }
                            },
                            {
                                view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                                click() {
                                    $$(grid_column_id).clearAll();
                                    $$(grid_column_id).load($$(grid_column_id).config.url);
                                }
                            },
                        ]
                    },
                    {
                        id: grid_column_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        editable: true,
                        tooltip: true,
                        resizeColumn: true,
                        scrollX: false,
                        drag: "order",
                        select: "row",
                        url: "/api/sys/table_columns?table_id=" + table_id,
                        save: {
                            url: "/api/sys/table_columns",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation"
                        },
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "code_", header: { text: "字段", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                            { id: "name_", header: { text: "字段名称", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 120 },
                            {
                                id: "type_", header: { text: "存储类型", css: { "text-align": "center" } }, editor: "combo",
                                options: [
                                    "VARCHAR(32)",
                                    "VARCHAR(256)",
                                    "VARCHAR(4096)",
                                    "TINYINT",
                                    "INT",
                                    "BIGINT",
                                    "NUMERIC(13,2)",
                                    "NUMERIC(18,4)",
                                    "DATE",
                                    "DATETIME",
                                    "TEXT"
                                ],
                                inputAlign: "right", width: 120
                            },
                            { id: "description_", header: { text: "备注", css: { "text-align": "center" } }, editor: "text", fillspace: true },
                            { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 160, css: { "text-align": "center" } },
                            { id: "update_at_", header: { text: "修改时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 160, css: { "text-align": "center" } }
                        ],
                        rules: {
                            "code_": (value) => /^[a-zA-Z]([_a-zA-Z0-9]{1,63})+$/.test(value && value.trim()),
                            "name_": webix.rules.isNotEmpty,
                            "type_": webix.rules.isNotEmpty,
                        },
                        on: {
                            "data->onStoreUpdated": function () {
                                this.data.each(function (obj, i) {
                                    obj.index = i + 1;
                                })
                            },
                            onValidationError(id, obj, details) {
                                var text = [];
                                for (var key in details) {
                                    if (key == "code") {
                                        text.push("字段命名规则：以字母开头，可包含 字母、数字、_");
                                    }
                                }

                                _.size(text) && webix.message({ type: "error", text: text.join("<br>") });
                            },
                            onBeforeEditStart(cell) {
                                var row = this.getItem(cell.row);
                                if (row["is_sys_"] === "1" && (cell.column === "code_" || cell.column === "type_")) {
                                    return false;
                                }

                                return true;
                            },
                            onAfterEditStop(state, editor, ignoreUpdate) {
                                if (state.value != state.old && (editor.column === "code_" || editor.column === "type_")) {
                                    isChanged = true;
                                }
                            },
                            onAfterDrop(context, native_event) {
                                isChanged = true;
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
                // },
                // },
                // /************************************** 索引 **************************************/
                // {
                //     header: "<span class='webix_icon mdi mdi-folder-key-network-outline'></span>索引",
                //     body: {
                //         rows: [
                //             {
                //                 view: "toolbar",
                //                 cols: [
                //                     {
                //                         view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                //                         click() {
                //                             $$(grid_index_id).clearAll();
                //                             $$(grid_index_id).load($$(grid_index_id).config.url);
                //                         }
                //                     },
                //                 ]
                //             },
                //             {
                //                 id: grid_index_id,
                //                 view: "datatable",
                //                 css: "webix_data_border webix_header_border",
                //                 tooltip: true,
                //                 resizeColumn: true,
                //                 scrollX: false,
                //                 select: "row",
                //                 url: "/api/sys/table_indexes?table_id=" + table_id,
                //                 columns: [
                //                     { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                //                     { id: "code_", header: { text: "索引名称", css: { "text-align": "center" } }, width: 240 },
                //                     { id: "type_", header: { text: "索引类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
                //                     { id: "columns_", header: { text: "相关字段", css: { "text-align": "center" } }, fillspace: true },
                //                 ],
                //                 on: {
                //                     "data->onStoreUpdated": function () {
                //                         this.data.each(function (obj, i) {
                //                             obj.index = i + 1;
                //                         })
                //                     },
                //                     onBeforeLoad() {
                //                         this.showOverlay("数据加载中...");
                //                     },
                //                     onAfterLoad() {
                //                         this.hideOverlay();
                //                         if (!this.count()) {
                //                             this.showOverlay("无检索数据");
                //                             return;
                //                         }

                //                         this.select(this.getFirstId());
                //                     },
                //                 }
                //             }
                //         ]
                //     }
                // },
                // /************************************** 外键 **************************************/
                // {
                //     header: "<span class='webix_icon mdi mdi-focus-field'></span>外键",
                //     body: {
                //         rows: [
                //             {
                //                 view: "toolbar",
                //                 cols: [
                //                     {
                //                         view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                //                         click() {
                //                             $$(grid_foreign_key_id).clearAll();
                //                             $$(grid_foreign_key_id).load($$(grid_foreign_key_id).config.url);
                //                         }
                //                     },
                //                 ]
                //             },
                //             {
                //                 id: grid_foreign_key_id,
                //                 view: "datatable",
                //                 css: "webix_data_border webix_header_border",
                //                 tooltip: true,
                //                 resizeColumn: true,
                //                 scrollX: false,
                //                 select: "row",
                //                 url: "/api/sys/table_foreign_keys?table_id=" + table_id,
                //                 columns: [
                //                     { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                //                     { id: "code_", header: { text: "外键名称", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 240 },
                //                     { id: "column_", header: { text: "外键字段", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                //                     { id: "referenced_table_", header: { text: "关联表", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                //                     { id: "referenced_column_", header: { text: "关联表字段", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                //                 ],
                //                 on: {
                //                     "data->onStoreUpdated"() {
                //                         this.data.each(function (obj, i) {
                //                             obj.index = i + 1;
                //                         })
                //                     },
                //                     onBeforeLoad() {
                //                         this.showOverlay("数据加载中...");
                //                     },
                //                     onAfterLoad() {
                //                         this.hideOverlay();
                //                         if (!this.count()) {
                //                             this.showOverlay("无检索数据");
                //                             return;
                //                         }

                //                         this.select(this.getFirstId());
                //                     },
                //                 }
                //             }
                //         ]
                //     }
                // }
                // ]
            },
            on: {
                onHide() {
                    if (isChanged) {
                        $$(grid_id).updateItem(table_id, { "sync_status_": "Changed" });
                    }

                    this.close();
                }
            }
        }).show();
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "创建", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            webix.prompt({
                                title: "创建数据表",
                                text: "表名是个很重要的信息，输入后不允许再次进行修改。",
                                input: {
                                    required: true,
                                    placeholder: "规则：以字母开头，可包含 字母、数字、_ ",
                                },
                                type: "prompt-warning",
                                width: 350,
                            }).then(function (res) {
                                var pattern = /^[a-zA-Z]([_a-zA-Z0-9]{1,63})+$/;
                                if (!pattern.test(res.trim())) {
                                    webix.alert({ type: "alert-warning", title: "系统提示", text: "表名不符合规则" });
                                } else {
                                    utils.grid.add($$(grid_id), { "code_": res.trim(), "description_": "" }, "name_");
                                }
                            });
                        }
                    },
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            $$(grid_id).editCancel();
                            $$(grid_id).clearAll();
                            $$(grid_id).load($$(grid_id).config.url);
                        }
                    },
                    {},
                    {
                        view: "button", label: "打印", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-printer", click() {
                            webix.print($$(grid_id), {
                                mode: "landscape",
                                fit: "data"
                            });
                        }
                    },
                    {
                        view: "button", label: "导出", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-microsoft-excel", click() {
                            webix.toExcel($$(grid_id), {
                                spans: true,
                                styles: true
                            });
                        }
                    },
                    { view: "icon", icon: "mdi mdi-18px mdi-fullscreen", tooltip: "全屏模式", click: () => webix.fullscreen.set($$(webix.storage.cookie.get("PHOENIX_USING_MENU"))) },
                ]
            },
            {
                id: grid_id,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                editable: true,
                tooltip: true,
                scrollX: false,
                drag: "order",
                select: true,
                url: "/api/sys/tables",
                save: {
                    url: "/api/sys/tables",
                    updateFromResponse: true,
                    trackMove: true,
                    operationName: "operation"
                },
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "code_", header: { text: "数据库表", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 100 },
                    { id: "name_", header: { text: "数据库表名称", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                    { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                    { id: "sync_status_", header: { text: "同步状态", css: { "text-align": "center" } }, template: utils.icons.tables["sync_status"], css: { "text-align": "center" }, tooltip: (obj) => obj["sync_status_"] == "Creating" ? "创建中" : obj["sync_status_"] == "Changed" ? "已修改" : "已同步", sort: "text", width: 80 },
                    { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "update_at_", header: { text: "修改时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    {
                        width: 160,
                        header: { text: "操作按钮", css: { "text-align": "center" } },
                        tooltip: false,
                        css: { "text-align": "center" },
                        template: `<div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="编辑" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                        <button webix_tooltip="同步" type="button" class="btn_sync webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-cloud-sync"></span>
                                        </button> 
                                    </div>`,
                    },
                ],
                rules: {
                    "code_": webix.rules.isNotEmpty,
                    "name_": webix.rules.isNotEmpty,
                },
                onClick: {
                    btn_edit(e, item) {
                        var row = this.getItem(item.row);
                        if (!row["sync_status_"]) return;

                        open(item.row);
                    },
                    btn_remove(e, item) {
                        $$(grid_id).select(item.row, false);
                        utils.grid.remove($$(grid_id), null, "数据库表", "code_")
                    },
                    btn_sync(e, item) {
                        var row = this.getItem(item.row);
                        if (!row["sync_status_"]) return;

                        webix.ajax().post("/api/sys/tables?method=Sync", { "id": item.row }).then(
                            (res) => {
                                webix.dp($$(grid_id)).ignore(
                                    () => {
                                        $$(grid_id).updateItem(item.row, res.json());
                                        webix.message({ type: "success", text: "同步成功" });
                                    }
                                );
                            }
                        )
                    },
                },
                on: {
                    "data->onStoreUpdated": function () {
                        this.data.each(function (obj, i) {
                            obj.index = i + 1;
                        })
                    },
                    onBeforeEditStart(cell) {
                        if (cell.column === "name_" || cell.column === "description_") {
                            return true;
                        }

                        var row = this.getItem(cell.row);
                        if (_.isUndefined(row["sync_status_"]) || _.isNull(row["sync_status_"]) || row["sync_status_"] === "Creating") {
                            return true;
                        }

                        return false;
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
            },
        ]
    }
}

export { builder }