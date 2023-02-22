import { frontwards } from "./frontwards";
import { backwards } from "./backwards";

function builder() {
    var dtable = utils.UUID();

    var taskStatus = [
        { "id": "Executing", "value": "正在执行中" },
        { "id": "Executed Accepted", "value": "已通过" },
        { "id": "Executed Rejected", "value": "已驳回" }
    ];

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "combo", width: 200, label: '任务状态', options: taskStatus, value: "Executing", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(dtable).clearAll();
                                $$(dtable).load(() => webix.ajax("/api/wf/flows?method=Tasks", { "status": newValue }));
                            }
                        }
                    },
                    {},
                    {
                        view: "search", width: 300, placeholder: "请输入流程名称、流程实例关键字等 ...",
                        on: {
                            onTimedKeyPress() {
                                var value = this.getValue().toLowerCase();

                                $$(dtable).filter(function (obj) {
                                    return (obj["diagram_name_"] + "|" + obj["keyword_text_"] + "|" + (obj["comment_"] || "")).toLowerCase().indexOf(value) != -1;
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
                leftSplit: 3,
                rightSplit: 1,
                url: "/api/wf/flows?method=Tasks&status=Executing",
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "diagram_name_", header: { text: "流程名称", css: { "text-align": "center" } }, sort: "text", width: 120 },
                    { id: "keyword_text_", header: { text: "关键字", css: { "text-align": "center" } }, sort: "text", width: 240 },
                    { id: "create_user_name_", header: { text: "发起者", css: { "text-align": "center" } }, sort: "text", css: { "text-align": "center" }, width: 80 },
                    { id: "name_", header: { text: "任务名称", css: { "text-align": "center" } }, sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "task_status_", header: { text: "任务状态", css: { "text-align": "center" } }, options: taskStatus, sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "comment_", header: { text: "任务流转意见", css: { "text-align": "center" } }, width: 360 },
                    { id: "activated_at_", header: { text: "任务激活时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "executed_at_", header: { text: "任务执行时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "status_", header: { text: "流程状态", css: { "text-align": "center" } }, options: "/assets/flow_status.json", sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "status_text_", header: { text: "流程状态描述", css: { "text-align": "center" } }, sort: "text", width: 360 },
                    { id: "start_at_", header: { text: "流程启动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    {
                        width: 80,
                        header: { text: "操作按钮", css: { "text-align": "center" } },
                        tooltip: false,
                        css: { "text-align": "center" },
                        template(row) {
                            if (row["task_status_"] == "Executed Accepted" || row["task_status_"] == "Executed Rejected") {
                                return `
                                        <div class="webix_el_box" style="padding:0px; text-align:center">
                                            <button webix_tooltip="查看" type="button" class="btn_view webix_icon_button" style="height:30px;width:30px;">
                                                <span class="phoenix_primary_icon mdi mdi-18px mdi-eye"></span>
                                            </button> 
                                        </div>
                                    `;
                            } else if (row["task_status_"] == "Executing") {
                                return `
                                    <div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="执行" type="button" class="btn_execute webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-hand-coin"></span>
                                        </button> 
                                    </div>
                                `;
                            }
                        },
                    },
                ],
                onClick: {
                    btn_execute(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, row, {
                            "$dtable": dtable,
                            "operation": "execute",
                            "$keyword": row["keyword_text_"],
                            "task_id_": item.row,
                        }));
                    },
                    btn_view(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, row, {
                            "$dtable": dtable,
                            "operation": "view",
                            "$keyword": row["keyword_text_"],
                            "task_id_": item.row,
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

function advAccept(options) {
    webix.ajax().post("/api/wf/flows?method=ExecuteBackwards", { "id": options["task_id_"] })
        .then((res) => {
            backwards({
                id: options["task_id_"],
                title: "同意【" + options["diagram_name_"] + "】 " + options["$keyword"],
                backwards: res.json(),
                callback(data) {
                    var request = webix.ajax().sync().post("/api/wf/flows?method=ExecuteAccept", data);
                    var res = JSON.parse(request.responseText);

                    if (res["status"] == "success") {
                        webix.message({ type: "success", text: "任务执行成功" });

                        $$(options["$dtable"]).clearAll();
                        $$(options["$dtable"]).load($$(options["$dtable"]).config.url);

                        $$(options["$win"]) && $$(options["$win"]).hide();
                        return true;
                    }

                    return false;
                }
            })
        })
}

function advReject(options) {
    frontwards({
        id: options["task_id_"],
        title: "驳回【" + options["diagram_name_"] + "】 " + options["$keyword"],
        callback(data) {
            var request = webix.ajax().sync().post("/api/wf/flows?method=ExecuteReject", data);
            var res = JSON.parse(request.responseText);

            if (res["status"] == "success") {
                webix.message({ type: "success", text: "任务驳回成功" });

                $$(options["$dtable"]).clearAll();
                $$(options["$dtable"]).load($$(options["$dtable"]).config.url);

                $$(options["$win"]) && $$(options["$win"]).hide();
                return true;
            }

            return false;
        }
    })
}

function show(options) {
    options = _.extend({}, options, { "$win": utils.UUID(), readonly: true });
    var mod = PHOENIX_FLOWS[options["diagram_code_"]];
    if (_.isUndefined(mod)) {
        webix.message({ type: "error", text: "没有找到" + options["diagram_code_"] + "的注册表单" });
        return;
    };

    // 加载数据值
    var respText = webix.ajax().sync().get("/api/wf/flows?method=ModelValues", { id: options["flow_id_"] }).responseText;
    var resp = JSON.parse(respText);

    options["model"] = JSON.parse(resp["model"]);

    var values = JSON.parse(resp["values"]);
    var view = mod.builder(options, values);

    // 按钮 同意
    var accept = {
        view: "button", label: "同意", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-clipboard-check-multiple",
        click() {
            var newValues = view.values();
            if (!newValues) return;

            if (!_.isEqual(values, newValues)) {
                console.log("数据已发生变化，先保存后再流转");
                webix.ajax().post("/api/wf/flows", {
                    "operation": "update",
                    "id": options["flow_id_"],
                    "values_": JSON.stringify(newValues),
                    "keyword_": webix.template(options["keyword_"])(newValues),
                }).then((res) => {
                    advAccept(options);
                })
            } else {
                console.log("数据没有发生变化，直接流转");
                advAccept(options);
            }
        }
    };

    // 按钮 驳回
    var reject = {
        view: "button", label: "驳回", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-backspace",
        click() {
            advReject(options);
        }
    }

    // 显示按钮
    var actions = [];
    if (_.isEqual(options["operation"], "execute")) {
        actions = [accept, reject];
    }

    showUI(view.show(), actions, options);
};

function showUI(view, actions, options) {
    console.log("showUI() Options is", options);

    // 标题
    var operation = _.isEqual(options["operation"], "execute") ? "执行" : "查看";

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
                        {
                            width: 72,
                            rows: [
                                { height: 12 },
                                { css: { "background": "lightskyblue" }, height: 28, view: "template", template: "<div style='text-align: center'>已执行</div>", },
                                { height: 12 },
                                { css: { "background": "lightgreen" }, height: 28, view: "template", template: "<div style='text-align: center'>执行中</div>", },
                                { height: 12 },
                                { css: { "background": "orange" }, height: 28, view: "template", template: "<div style='text-align: center'>撤回</div>", },
                                { height: 12 },
                                { css: { "background": "coral" }, height: 28, view: "template", template: "<div style='text-align: center'>驳回</div>", },
                                { height: 12 },
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

export { builder };