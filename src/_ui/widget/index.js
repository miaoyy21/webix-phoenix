var datatable = require("./datatable");
var tree = require("./tree");
var list = require("./list");

function builder() {
    var list_id = utils.UUID();
    var grid_id = utils.UUID();

    // 打开对应组件的设计界面
    function open_window(row, options) {
        var view;
        switch (row["view_"]) {
            case "datatable":
                view = datatable;
                break;
            case "tree":
                view = tree;
                break
            case "list":
                view = list;
                break
            default:

        }
        webix.ui({
            view: "window",
            fullscreen: true,
            close: true,
            head: "UI组件设计",
            position: "center",
            body: view.show(row["id"], options),
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
                view: "scrollview",
                width: 280,
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>UI 组件", height: 35 },
                        {
                            id: list_id,
                            view: "list",
                            template: "<span style='font-weight:bold;color:#FDBF4C'>#code#</span>  <span style='width:160px;text-align:left;float:right;color:#1CA1C1'> #name# </span>",
                            select: true,
                            url: "/static/sys_ui_widget_view.json",
                            ready() {
                                this.select(this.getFirstId());
                            },
                            on: {
                                onAfterSelect(id) {
                                    $$(grid_id).editCancel();

                                    $$(grid_id).clearAll();
                                    $$(grid_id).load(() => webix.ajax("/api/sys/ui_widget", { "view": id }));
                                }
                            }
                        },
                    ]
                },
            },
            { view: "resizer" },
            {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() {
                                    var id = $$(list_id).getSelectedId();
                                    if (!id) return;

                                    $$(grid_id).add({ "view_": id }, 0);
                                }
                            },
                        ]
                    },
                    {
                        id: grid_id,
                        view: "datatable",
                        gravity: 2,
                        css: "webix_data_border webix_header_border",
                        select: true,
                        editable: true,
                        data: [],
                        save: {
                            url: "/api/sys/ui_widget",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation"
                        },
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "name_", header: { text: "名称", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
                            { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                            {
                                width: 120,
                                header: { text: "操作", css: { "text-align": "center" } },
                                tooltip: false,
                                css: { "text-align": "center" },
                                template: `<div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="编辑" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                    </div>`,
                            },
                        ],
                        rules: {
                            "name_": webix.rules.isNotEmpty,
                        },
                        onClick: {
                            btn_edit(e, item) {
                                var row = this.getItem(item.row);
                                if (!row) return;

                                var options = webix.ajax().sync().get("/api/sys/ui_widget?method=Options", _.pick(row, "id")).responseText;
                                open_window(row, JSON.parse(options));
                            },
                            btn_remove(e, item) {
                                var self = this;
                                webix.message({
                                    type: "confirm-error",
                                    title: "系统提示",
                                    text: "是否删除当前记录？",
                                }).then(function (res) {
                                    var url = self.config.save.url;

                                    // 提交服务端删除
                                    webix.ajax()
                                        .post(url, { "id": item.row, "operation": "delete" })
                                        .then((res) => {
                                            webix.dp(self).ignore(() => self.remove(item.row));
                                        });
                                })
                            },
                        },
                        ready() {
                            //添加记录后触发事件
                            this.attachEvent("onAfterAdd", function (id, index) {
                                this.hideOverlay();
                                this.select && this.select(id);
                            });

                            var delete_index = -1; // 标记删除的记录索引
                            this.attachEvent("onBeforeDelete", function (id) {
                                // 删除记录前触发事件
                                delete_index = this.getIndexById(id);
                            })

                            // 删除记录后触发事件
                            this.attachEvent("onAfterDelete", function (id) {
                                if (!this.count()) {
                                    this.showOverlay("无检索数据");
                                    return;
                                }

                                // 选择删除记录行附近的数据行
                                if (this.select) {
                                    var select_index = delete_index;
                                    if (this.count() < delete_index + 1) {
                                        select_index = this.count() - 1;
                                    }

                                    var select_id = this.getIdByIndex(select_index);
                                    if (select_id) {
                                        this.select(select_id);
                                    }
                                }
                            });

                            var first = this.getFirstId();
                            if (first) {
                                this.select(first);
                            }
                        },
                        on: {
                            "data->onStoreUpdated": function () {
                                this.data.each(function (obj, i) {
                                    obj.index = i + 1;
                                })
                            },
                            onBeforeLoad: function () {
                                this.showOverlay("数据加载中...");
                                return true;
                            },
                            onAfterLoad: function () {
                                this.hideOverlay();
                                if (!this.count()) {
                                    this.showOverlay("无检索数据");
                                    return;
                                }
                            },
                        }
                    },
                ]
            }
        ]
    };
}

export { builder };