function builder() {
    var table_grid_id = utils.UUID();
    var service_grid_id = utils.UUID();
    var window_id = utils.UUID();
    var form_id = utils.UUID();

    function open_window(row) {
        webix.ui({
            id: window_id,
            view: "window",
            fullscreen: true,
            close: true,
            move: true,
            head: "数据服务",
            position: "center",
            body: {
                rows: [
                    {
                        id: form_id,
                        view: "form",
                        data: row,
                        rows: [
                            {
                                cols: [
                                    { view: "text", name: "code_", label: "服务编码", required: true },
                                    { view: "text", name: "name_", label: "服务名称", required: true },
                                ]
                            },
                            {
                                cols: [
                                    { view: "radio", name: "method_", label: "方法", options: ["GET", "POST", "PUT", "DEL"], required: true },
                                    { view: "text", name: "timeout_", label: "超时(秒)", required: true },
                                ]
                            },
                            {
                                rows: [
                                    { view: "label", label: "服务脚本" },
                                    { view: "ace-editor", mode: "javascript", name: "source_" }
                                ]
                            },
                        ],
                        elementsConfig: { labelAlign: "right", clear: true },
                        rules: {
                            "source_": webix.rules.isNotEmpty
                        }
                    },
                    { height: 8, css: { "border-top": "none" } },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", label: "语法检测", autowidth: true, css: "webix_primary",
                                click() {
                                    var values = $$(form_id).getValues();
                                    if (!values["source_"]) return;

                                    webix.ajax().post("api/sys/data_service?method=Parse", { "source_": values["source_"] })
                                        .then((res) => {
                                            webix.message({ type: "success", text: "语法检测成功" });
                                        })
                                }
                            },
                            {},
                            {
                                view: "button", label: "临时保存", autowidth: true, css: "webix_primary",
                                click() {
                                    if (!$$(form_id).validate()) return;

                                    var values = $$(form_id).getValues();

                                    var operation = !values["id"] ? "insert" : "update";
                                    var url = $$(service_grid_id).config.save.url;
                                    webix.ajax().post(url, _.extend(values, { "operation": operation }))
                                        .then((res) => {
                                            var data = res.json();

                                            webix.dp($$(service_grid_id)).ignore(function () {
                                                var row = _.extend(values, data);
                                                if (operation === "insert") {
                                                    row["id"] = data["newid"];

                                                    var count = $$(service_grid_id).count();
                                                    if (count < 1) {
                                                        $$(service_grid_id).hideOverlay();
                                                    }

                                                    $$(service_grid_id).add(row, count);
                                                } else {
                                                    $$(service_grid_id).updateItem(values["id"], row);
                                                }

                                                webix.message({ type: "success", text: "保存成功" });
                                            });
                                        })
                                }
                            },
                            {}
                        ]
                    },
                    { height: 8 }
                ],
            },
            on: {
                onHide() {
                    this.close();
                }
            }
        }).show();
    }

    return {
        cols: [
            {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "search", align: "center", placeholder: "按数据库表过滤",
                                on: {
                                    onTimedKeypress() {
                                        var text = this.getValue().toString().toLowerCase();
                                        $$(table_grid_id).filter((obj) => {
                                            var filter = [obj["code_"], obj["name_"]].join("|");
                                            filter = filter.toString().toLowerCase();
                                            return (filter.indexOf(text) != -1);
                                        });

                                        var first = $$(table_grid_id).getFirstId();
                                        var overlayBox = webix.extend($$(service_grid_id), webix.OverlayBox);
                                        if (!first) {
                                            $$(table_grid_id).showOverlay("无符合条件的数据");

                                            overlayBox.showOverlay("无检索数据");
                                            $$(service_grid_id).clearAll();
                                        } else {
                                            $$(table_grid_id).hideOverlay();

                                            overlayBox.hideOverlay();
                                            $$(table_grid_id).select(first);
                                        }
                                    }
                                }
                            },
                        ]
                    },
                    {
                        id: table_grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        width: 360,
                        tooltip: true,
                        select: true,
                        url: "/api/sys/tables?scope=SIMPLE",
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "code_", header: { text: "数据库表", css: { "text-align": "center" } }, editor: "text", sort: "text", width: 160 },
                            { id: "name_", header: { text: "数据库表名称", css: { "text-align": "center" } }, editor: "text", sort: "text", minWidth: 160, fillspace: true },
                        ],
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
                                $$(service_grid_id).clearAll();

                                var url = "/api/sys/data_service?method=ByTableId&table_id=" + row.id;
                                $$(service_grid_id).define("url", url);
                                $$(service_grid_id).load(url);
                            },
                        }
                    },
                ]
            },
            { view: "resizer" },
            {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "添加服务", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() {
                                    open_window({ "table_id_": $$(table_grid_id).getSelectedId(false, true), "method_": "GET", "timeout_": 0 });
                                }
                            },
                            {
                                view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                                click() {
                                    $$(service_grid_id).clearAll();
                                    $$(service_grid_id).load($$(service_grid_id).config.url);
                                    $$(service_grid_id).refresh();
                                }
                            },
                            {},
                            { view: "icon", icon: "mdi mdi-18px mdi-fullscreen", tooltip: "全屏模式", click: () => webix.fullscreen.set($$(webix.storage.cookie.get("PHOENIX_USING_MENU"))) },
                        ]
                    },
                    {
                        id: service_grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        hover: "phoenix_hover",
                        resizeColumn: true,
                        tooltip: true,
                        rightSplit: 1,
                        drag: "order",
                        // data: [],
                        save: {
                            url: "/api/sys/data_service?method=ByTableId",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation"
                        },
                        columns: [
                            { id: "code_", header: { text: "服务编码", css: { "text-align": "center" } }, sort: "text", width: 120 },
                            { id: "name_", header: { text: "服务名称", css: { "text-align": "center" } }, sort: "text", width: 240 },
                            { id: "method_", header: { text: "方法", css: { "text-align": "center" } }, cssFormat: utils.formats.method, css: { "text-align": "center" }, width: 60 },
                            { id: "source_", header: { text: "服务脚本", css: { "text-align": "center" } }, minWidth: 160, fillspace: true },
                            { id: "timeout_", header: { text: "超时(秒)", css: { "text-align": "center" } }, width: 80, css: { "text-align": "right" } },
                            { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                            { id: "update_at_", header: { text: "修改时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                            {
                                width: 120,
                                header: { text: "操作", css: { "text-align": "center" } },
                                tooltip: false,
                                css: { "text-align": "center" },
                                template: `<div class="webix_el_box" style="padding:0px">
                                        <button webix_tooltip="编辑" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                        <button webix_tooltip="复制至剪贴板" type="button" class="btn_copy webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_warning_icon mdi mdi-18px mdi-clipboard-text-multiple"></span>
                                        </button>
                                    </div>`,
                            },
                        ],
                        onClick: {
                            btn_edit(e, item) {
                                open_window(this.getItem(item.row));
                            },
                            btn_remove(e, item) {
                                var row = this.getItem(item.row);
                                if (!row) return;

                                utils.grid.remove($$(service_grid_id), row, "数据服务", "name_")
                            },
                            btn_copy(e, item) {
                                var rowTable = $$(table_grid_id).getSelectedItem();
                                var rowService = this.getItem(item.row);
                                var text = "/api/sys/data_service?service=" + rowTable["code_"] + "." + rowService["code_"] + "";

                                var copyFrom = document.createElement('textarea');
                                copyFrom.setAttribute("style", "position:fixed;opacity:0;top:100px;left:100px;");
                                copyFrom.value = text;
                                document.body.appendChild(copyFrom);
                                copyFrom.select();
                                document.execCommand('copy');

                                webix.message({ type: "info", text: "复制成功" });
                                setTimeout(function () {
                                    document.body.removeChild(copyFrom);
                                }, 1500);
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