function builder() {
    var dtable = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "创建流程", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            // show(_.extend({}, options, { "$menu": menu, "$dtable": dtable, "operation": "insert" }));
                        }
                    },
                    {},
                    {
                        view: "search", width: 240, placeholder: "请输入流程实例关键字等 ...",
                        on: {
                            onTimedKeyPress() {
                                // var value = this.getValue().toLowerCase();

                                // $$(dtable).filter(function (obj) {
                                //     return (obj["keyword_"] + "|" + obj["status_"] + "|" + (obj["status_text_"] || "")).toLowerCase().indexOf(value) != -1;
                                // });
                            }
                        }
                    },
                ]
            },
            {
                id: dtable,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                tooltip: true,
                select: true,
                leftSplit: 2,
                rightSplit: 1,
                data: [],
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "keyword_", header: { text: "关键字", css: { "text-align": "center" } }, sort: "text", width: 240 },
                    { id: "status_", header: { text: "流程状态", css: { "text-align": "center" } }, options: "/assets/flow_status.json", sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "status_text_", header: { text: "状态描述", css: { "text-align": "center" } }, sort: "text", width: 360 },

                    { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "start_at_", header: { text: "启动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "active_at_", header: { text: "活动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "end_at_", header: { text: "结束时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    {
                        width: 120,
                        header: { text: "操作按钮", css: { "text-align": "center" } },
                        tooltip: false,
                        css: { "text-align": "center" },
                        template(row) {
                            if (row["status_"] == "Finished" || row["status_"] == "Suspended") {
                                return `
                                                <div class="webix_el_box" style="padding:0px; text-align:center">
                                                    <button webix_tooltip="查看" type="button" class="btn_view webix_icon_button" style="height:30px;width:30px;">
                                                        <span class="phoenix_primary_icon mdi mdi-18px mdi-eye"></span>
                                                    </button> 
                                                </div>
                                            `;
                            } else if (row["status_"] == "Draft" || row["status_"] == "Revoked" || row["status_"] == "Rejected") {
                                return `
                                            <div class="webix_el_box" style="padding:0px; text-align:center">
                                                <button webix_tooltip="编辑" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                                    <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"></span>
                                                </button> 
                                                <button webix_tooltip="启动" type="button" class="btn_start webix_icon_button" style="height:30px;width:30px;">
                                                    <span class="phoenix_warning_icon mdi mdi-18px mdi-rocket-launch"></span>
                                                </button> 
                                            </div>
                                        `;
                            } else if (row["status_"] == "Executing") {
                                return `
                                            <div class="webix_el_box" style="padding:0px; text-align:center">
                                                <button webix_tooltip="查看" type="button" class="btn_view webix_icon_button" style="height:30px;width:30px;">
                                                    <span class="phoenix_primary_icon mdi mdi-18px mdi-eye"></span>
                                                </button> 
                                                <button webix_tooltip="撤回" type="button" class="btn_revoke webix_icon_button" style="height:30px;width:30px;">
                                                    <span class="phoenix_danger_icon mdi mdi-18px mdi-undo-variant"></span>
                                                </button>
                                            </div>
                                        `;
                            } else {
                                return `<div class="webix_el_box" style="padding:0px; text-align:center"> invalid Flow Status "` + row["status_"] + `" </div>`;
                            }
                        },
                    },
                ],
                rules: {
                    "code_": webix.rules.isNotEmpty,
                    "name_": webix.rules.isNotEmpty,
                },
                onClick: {
                    btn_edit(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, options, {
                            "$menu": menu,
                            "$dtable": dtable,
                            "operation": "update",
                            "id": item.row,
                            "_keyword": row["keyword_"],
                            "executed_keys_": row["executed_keys_"],
                            "activated_keys_": row["activated_keys_"],
                            "status_": row["status_"],
                            "values_md5_": row["values_md5_"]
                        }));
                    },
                    btn_view(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, options, {
                            "$menu": menu,
                            "$dtable": dtable,
                            "operation": "view",
                            "$keyword": row["keyword_"],
                            "id": item.row,
                            "executed_keys_": row["executed_keys_"],
                            "activated_keys_": row["activated_keys_"],
                            "status_": row["status_"],
                            "values_md5_": row["values_md5_"]
                        }));
                    },
                    btn_revoke(e, item) {
                        var row = this.getItem(item.row);
                        advRevoke({
                            "$menu": menu,
                            "$dtable": dtable,
                            "operation": "view",
                            "$keyword": row["keyword_"],
                            "id": item.row,
                            "status_": row["status_"],
                            "values_md5_": row["values_md5_"]
                        })
                    },
                    btn_start(e, item) {
                        var row = this.getItem(item.row);
                        advStart(_.extend({}, options, {
                            "$menu": menu,
                            "$dtable": dtable,
                            "operation": "view",
                            "id": item.row,
                            "status_": row["status_"],
                            "values_md5_": row["values_md5_"]
                        }));
                    },
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
                }
            }
        ]
    };
}

export { builder };