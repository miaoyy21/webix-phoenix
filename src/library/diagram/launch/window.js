import { backwards } from "../../framework/backwards";

function open(options) {
    var win = utils.UUID();
    var menu = utils.UUID();
    var dtable = utils.UUID();

    webix.ui({
        id: win,
        view: "window",
        close: true,
        modal: true,
        fullscreen: true,
        animate: { type: "flip", subtype: "vertical" },
        head: "【" + options["diagram_code_"] + "】" + options["diagram_name_"],
        position: "center",
        body: {
            cols: [
                {
                    width: 200,
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>流程状态", height: 35 },
                        {
                            id: menu,
                            view: "menu",
                            layout: "y",
                            select: true,
                            url: "/api/wf/flows?method=Summary&diagram_id=" + options["diagram_id_"],
                            ready() {
                                this.select(this.getFirstId());
                            },
                            on: {
                                onBeforeLoad() {
                                    webix.extend(this, webix.ProgressBar).showProgress();
                                },
                                onAfterLoad() {
                                    webix.extend(this, webix.ProgressBar).hideProgress();
                                },
                                onAfterSelect(id) {
                                    $$(dtable).clearAll();
                                    $$(dtable).load(() => webix.ajax("/api/wf/flows", { "diagram_id": options["diagram_id_"], "status": id }));
                                }
                            }
                        }
                    ]
                },
                { view: "resizer" },
                {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "button", label: "创建流程实例", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                    click() {
                                        show(_.extend({}, options, { "$menu": menu, "$dtable": dtable, "operation": "insert" }));
                                    }
                                },
                                {},
                                {
                                    view: "search", width: 240, placeholder: "请输入流程实例关键字等 ...",
                                    on: {
                                        onTimedKeyPress() {
                                            var value = this.getValue().toLowerCase();

                                            $$(dtable).filter(function (obj) {
                                                return (obj["keyword_"] + "|" + obj["status_"] + "|" + (obj["status_text_"] || "")).toLowerCase().indexOf(value) != -1;
                                            });
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
                                { id: "keyword_", header: { text: "关键字", css: { "text-align": "center" } }, sort: "text", fillspace: true },
                                { id: "status_", header: { text: "流程状态", css: { "text-align": "center" } }, options: "/assets/flow_status.json", sort: "text", css: { "text-align": "center" }, width: 80 },
                                { id: "status_text_", header: { text: "流程状态描述", css: { "text-align": "center" } }, sort: "text", width: 240 },
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
                                                <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                                    <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
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
                            onClick: {
                                btn_edit(e, item) {
                                    var row = this.getItem(item.row);
                                    show(_.extend({}, options, {
                                        "$menu": menu,
                                        "$dtable": dtable,
                                        "operation": "update",
                                        "flow_id_": item.row,
                                        "$keyword": row["keyword_"],
                                        "executed_keys_": row["executed_keys_"],
                                        "activated_keys_": row["activated_keys_"],
                                        "status_": row["status_"],
                                    }));
                                },
                                btn_remove(e, item) {
                                    var row = this.getItem(item.row);
                                    advRemove({
                                        "$menu": menu,
                                        "$dtable": dtable,
                                        "operation": "view",
                                        "$keyword": row["keyword_"],
                                        "flow_id_": item.row,
                                        "status_": row["status_"],
                                    })
                                },
                                btn_view(e, item) {
                                    var row = this.getItem(item.row);
                                    show(_.extend({}, options, {
                                        "$menu": menu,
                                        "$dtable": dtable,
                                        "operation": "view",
                                        "$keyword": row["keyword_"],
                                        "flow_id_": item.row,
                                        "executed_keys_": row["executed_keys_"],
                                        "activated_keys_": row["activated_keys_"],
                                        "status_": row["status_"],
                                    }));
                                },
                                btn_revoke(e, item) {
                                    var row = this.getItem(item.row);
                                    advRevoke({
                                        "$menu": menu,
                                        "$dtable": dtable,
                                        "operation": "view",
                                        "$keyword": row["keyword_"],
                                        "flow_id_": item.row,
                                        "status_": row["status_"],
                                    })
                                },
                                btn_start(e, item) {
                                    var row = this.getItem(item.row);
                                    advStart(_.extend({}, options, {
                                        "$menu": menu,
                                        "$dtable": dtable,
                                        "operation": "view",
                                        "flow_id_": item.row,
                                        "status_": row["status_"],
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
                }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
};

function refresh(options) {
    var selected = $$(options["$menu"]).getSelectedId();

    $$(options["$menu"]).clearAll();
    $$(options["$menu"]).load($$(options["$menu"]).config.url)
        .then(() => { $$(options["$menu"]).select(selected) });
}

// 启动流程
function advStart(options) {
    webix.ajax().post("/api/wf/flows?method=StartBackwards", { "id": options["flow_id_"] })
        .then((res) => {
            backwards({
                id: options["flow_id_"],
                title: "启动流程",
                backwards: res.json(),
                callback(data) {
                    var request = webix.ajax().sync().post("/api/wf/flows?method=Start", data);
                    var res = JSON.parse(request.responseText);

                    if (res["status"] == "success") {
                        webix.message({ type: "success", text: "启动成功" });

                        refresh(options);
                        $$(options["$win"]) && $$(options["$win"]).hide();
                        return true;
                    }

                    return false;
                }
            })
        })
}

// 删除流程
function advRemove(options) {
    webix.confirm({
        title: "系统提示",
        text: "确认删除流程实例 【" + options["$keyword"] + "】 ?",
        type: "confirm-error"
    }).then((result) => {
        webix.ajax().post("/api/wf/flows?method=Remove", { id: options["flow_id_"] })
            .then((res) => {
                webix.message({ type: "success", text: "删除成功" });

                refresh(options);
                $$(options["$win"]) && $$(options["$win"]).hide();
                return true;
            });
    });
}

// 撤回流程
function advRevoke(options) {
    webix.confirm({
        title: "系统提示",
        text: "确认撤回流程实例 【" + options["$keyword"] + "】 ?",
        type: "confirm-error"
    }).then((result) => {
        webix.ajax().post("/api/wf/flows?method=Revoke", { id: options["flow_id_"] })
            .then((res) => {
                webix.message({ type: "success", text: "撤回成功" });

                refresh(options);
                $$(options["$win"]) && $$(options["$win"]).hide();
                return true;
            });
    });
}

function show(options) {
    options = _.extend({}, options, { "$win": utils.UUID(), readonly: true });

    // 表单
    if (_.isEqual(options["operation"], "insert") || _.isEqual(options["operation"], "update")) {
        options["readonly"] = false;
    }

    var values = {};
    var mod = PHOENIX_FLOWS[options["diagram_code_"]];
    if (_.isUndefined(mod)) {
        webix.message({ type: "error", text: "没有找到" + options["diagram_code_"] + "的注册表单：请在 @src/dev/flow/index.js 中完成注册表单" });
        return;
    };

    if (_.isEqual(options["operation"], "insert")) {

        // 加载流程图
        var request = webix.ajax().sync().get("/api/wf/diagrams?method=Publish", { id: options["diagram_id_"], scope: "MODEL" });
        var resp = JSON.parse(request.responseText);

        options["model"] = resp;
        values = mod.defaultValues ? mod.defaultValues(options) : {};
    } else {
        // 加载数据值
        var request = webix.ajax().sync().get("/api/wf/flows?method=ModelValues", { id: options["flow_id_"] });
        var resp = JSON.parse(request.responseText);

        options["model"] = JSON.parse(resp["model"]);
        values = JSON.parse(resp["values"]);
    }

    var view = mod.builder(options, webix.copy(values)); // 需要给一份拷贝的原值，用于是否数据变化比较

    // 按钮 保存
    var save = {
        view: "button", label: "保存", autowidth: true, css: "webix_secondary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
        click() {
            var newValues = view.values();
            if (!newValues) return;

            var self = this;
            self.disable();
            webix.ajax().post("/api/wf/flows", {
                "operation": options["operation"],
                "id": options["flow_id_"],
                "values_": JSON.stringify(newValues),
                "keyword_": webix.template(options["keyword_"])(newValues),
                "diagram_id_": options["diagram_id_"],
            }).then((res) => {
                var row = res.json();

                values = newValues;
                options["operation"] = "update";
                options["flow_id_"] = row["id"];

                webix.message({ type: "success", text: "保存成功" });
                refresh(options);
            }).finally(() => {
                setTimeout(() => { self.enable() }, 500)
            })
        }
    };

    // 按钮 启动
    var start = {
        view: "button", label: "启动", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-rocket-launch",
        click() {
            var newValues = view.values();
            if (!newValues) return;

            var self = this;
            self.disable();
            webix.ajax().post("/api/wf/flows", {
                "operation": options["operation"],
                "id": options["flow_id_"],
                "values_": JSON.stringify(newValues),
                "keyword_": webix.template(options["keyword_"])(newValues),
                "diagram_id_": options["diagram_id_"],
            }).then((res) => {
                var row = res.json();

                options["operation"] = "update";
                options["flow_id_"] = row["id"];
                advStart(options);
            }).finally(() => {
                setTimeout(() => { self.enable() }, 500)
            })
        }
    };

    // 按钮 撤回
    var revoke = {
        view: "button", label: "撤回", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-undo-variant",
        click() { advRevoke(options) }
    }

    // 显示按钮
    var actions = [];
    if (_.isEqual(options["operation"], "insert")) {
        actions = [save, start];
    } else if (_.isEqual(options["operation"], "update")) {
        if (_.isEqual(options["status_"], "Draft")) {
            actions = [save, start];
        } else if (_.isEqual(options["status_"], "Revoked") || _.isEqual(options["status_"], "Rejected")) {
            actions = [start];
        }
    } else {
        if (_.isEqual(options["status_"], "Executing")) {
            actions = [revoke];
        }
    }

    showUI(view.show(), actions, options);
};

function showUI(view, actions, options) {

    // 标题
    var operation = _.isEqual(options["operation"], "insert") ? "创建" :
        _.isEqual(options["operation"], "update") ? "编辑" : "查看";

    // 表单
    var views = {
        header: "<span class='webix_icon mdi mdi-format-wrap-tight'></span>" + options["diagram_name_"],
        body: _.size(actions) > 0 ?
            { rows: [{ view: "toolbar", cols: [...actions, {},] }, view] } :
            view,
    };

    // 流程图
    var executed = JSON.parse(options["executed_keys_"] || "[]");
    var activated = JSON.parse(options["activated_keys_"] || "[]");
    _.each(options["model"]["nodeDataArray"], (node) => {

        var color = "white";
        if (_.indexOf(activated, node.key) >= 0) {
            if (options["status_"] == "Executing") {
                color = "lightgreen";
            } else if (options["status_"] == "Revoked") {
                color = "orange";
            } else if (options["status_"] == "Rejected") {
                color = "coral";
            } else if (options["status_"] == "Suspended") {
                color = "lightgrey";
            } else {
                color = "black";
            }
        } else if (_.indexOf(executed, node.key) >= 0) {
            color = "lightskyblue";
        }

        _.extend(node, { "color": color });
    })

    var chart = {
        header: "<span class='webix_icon mdi mdi-mushroom'></span>流程图",
        body: {
            rows: [
                {
                    cols: [
                        { width: 12 },
                        {
                            view: "goDiagram",
                            editable: false,
                            model: options["model"],
                        },
                        { width: 24 },
                        { width: 48 },
                        {
                            width: 160,
                            rows: [
                                { height: 20 },
                                { css: { "background": "lightskyblue" }, height: 28, view: "template", template: "<div style='text-align: center'>已执行</div>", },
                                { height: 20 },
                                { css: { "background": "lightgreen" }, height: 28, view: "template", template: "<div style='text-align: center'>执行中</div>", },
                                { height: 20 },
                                { css: { "background": "orange" }, height: 28, view: "template", template: "<div style='text-align: center'>撤回</div>", },
                                { height: 20 },
                                { css: { "background": "coral" }, height: 28, view: "template", template: "<div style='text-align: center'>驳回</div>", },
                                { height: 20 },
                                { css: { "background": "lightgrey" }, height: 28, view: "template", template: "<div style='text-align: center'>挂起</div>", },
                                {},
                            ]
                        },
                        { width: 48 },
                    ]
                },
                { height: 12 },
            ]
        }
    };

    // 流转记录
    var record = {
        header: "<span class='webix_icon mdi mdi-record-circle'></span>流转记录",
        body: {
            view: "datatable",
            css: "webix_data_border webix_header_border",
            select: "row",
            url: "/api/wf/flows?method=Records&id=" + options["flow_id_"],
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                { id: "name_", header: { text: "任务名称", css: { "text-align": "center" } }, width: 120, css: { "text-align": "center" } },
                { id: "executor_user_name_", header: { text: "指定执行者", css: { "text-align": "center" } }, width: 100, css: { "text-align": "center" } },
                { id: "executed_depart_name_", header: { text: "实际执行部门", css: { "text-align": "center" } }, width: 120, css: { "text-align": "center" } },
                { id: "executed_user_name_", header: { text: "实际执行者", css: { "text-align": "center" } }, width: 100, css: { "text-align": "center" } },
                { id: "status_", header: { text: "任务状态", css: { "text-align": "center" } }, options: "/assets/flow_node_status.json", width: 100, css: { "text-align": "center" } },
                { id: "comment_", header: { text: "任务流转意见", css: { "text-align": "center" } }, minWidth: 360, fillspace: true },
                { id: "activated_at_", header: { text: "任务创建时间", css: { "text-align": "center" } }, format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                { id: "canceled_at_", header: { text: "任务取消时间", css: { "text-align": "center" } }, format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                { id: "executed_at_", header: { text: "任务执行时间", css: { "text-align": "center" } }, format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
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
            }
        },
    };

    // 显示的tab页
    var tabs = [views, chart, record];
    if (_.isEqual(options["operation"], "insert")) {
        tabs = [views, chart]
    } else if (_.isEqual(options["operation"], "update")) {
        if (_.isEqual(options["status_"], "Draft")) {
            tabs = [views, chart]
        }
    }

    webix.ui({
        id: options["$win"],
        view: "window",
        close: true,
        modal: true,
        fullscreen: true,
        animate: { type: "flip", subtype: "horizontal" },
        head: operation + "  【" + options["diagram_code_"] + "】" + options["diagram_name_"],
        position: "center",
        body: {
            view: "tabview",
            tabbar: { optionWidth: 160 },
            cells: tabs,
        },
        on: {
            onHide() { this.close(); }
        }
    }).show();
}

export { open }