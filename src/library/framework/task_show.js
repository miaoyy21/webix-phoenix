import { frontwards } from "./frontwards";
import { backwards } from "./backwards";

// 同意
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

// 驳回
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

    var valuesText = resp["values"];
    var view = mod.builder(options, JSON.parse(valuesText));

    // 按钮 同意
    var accept = {
        view: "button", label: "同意", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-clipboard-check-multiple",
        click() {
            var newValues = view.values();
            if (!newValues) return;

            var self = this;
            self.disable();

            webix.ajax().post("/api/wf/flows", {
                "operation": "update",
                "id": options["flow_id_"],
                "values_": JSON.stringify(newValues),
                "keyword_": webix.template(options["keyword_"])(newValues),
            }).then((res) => {
                advAccept(options);
            }).finally(() => {
                setTimeout(() => { self.enable() }, 500)
            })
        }
    };

    // 按钮 驳回
    var reject = {
        view: "button", label: "驳回", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-backspace",
        click() {
            var self = this;
            self.disable();
            setTimeout(() => { self.enable() }, 500)

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

// 任务处理/查看
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
        head: operation + " 【" + options["diagram_code_"] + ": " + options["diagram_name_"] + " * " + options["name_"] + "】",
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

export { show };