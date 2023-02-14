function open(item, options, model) {
    var win = utils.UUID();
    var palette = utils.UUID();
    var diagram = utils.UUID();
    var property = utils.UUID();

    // 分类
    var categories = [
        { id: "Diagram", value: "流程图" },
        { id: "Start", value: "开始节点" },
        { id: "Execute", value: "执行环节" },
        { id: "Branch", value: "条件分支" },
        { id: "End", value: "结束节点" },
        { id: "Link", value: "连接线" },
    ];

    // 流程图
    var diagramElements = [
        { label: "基本配置", type: "label" },
        { id: "category", label: "类型", options: categories },
        { id: "code_", label: "流程编码", type: "text", tooltip: "流程编码需与代码中定义的一致" },
        { id: "name_", label: "流程名称", type: "text", tooltip: "流程的名称" },
        { id: "description_", label: "流程描述", type: "text", tooltip: "流程的描述信息" },
        { id: "keyword_", label: "关键字", type: "text", tooltip: "表单信息要素中有重要意义的信息要素。示例：物资编号 #code_#；物资名称 #name_#" },
        {
            id: "exceed_days_", label: "超时天数", type: "richselect",
            options: [
                { id: "0", value: "[不限制]" },
                { id: "7", value: "一周" },
                { id: "14", value: "二周" },
                { id: "30", value: "一个月" },
                { id: "90", value: "三个月" },
                { id: "180", value: "半年" },
                { id: "365", value: "一年" },
            ],
            tooltip: "流程从开始后超过时限天数未结束，系统自动退还给流程发起者"
        },
    ];

    // 节点
    var nodeElements = {
        "Start": {
            "default": { "code_": "Start" },
            "elements": [
                { label: "流程图属性", type: "label" },
                { id: "category", label: "类型", options: categories },
                { id: "key", label: "ID" },
                { label: "基本配置", type: "label" },
                { id: "code_", label: "用户编码", type: "text", tooltip: "用户自定义编码" },
                { id: "revocable_", label: "允许撤回", type: "checkbox", tooltip: "是否允许流程发起者在流程开始后且流程结束前进行撤回操作" },
                { id: "on_before_script_", label: "{开始前事件}", tooltip: "在流程启动前触发的事件" },
                { id: "on_after_script_", label: "{开始后事件}", tooltip: "在流程启动后触发的事件" },
                { id: "on_revoke_script_", label: "{撤回事件}", tooltip: "在流程撤回时触发的事件" },
            ]
        },
        "Execute": {
            "default": {
                "rejectable_": true,
                "require_reject_comment_": true,
                "executor_custom_num_": "0",
                "executor_selectable_num_": "0",
                "executor_savable_": true,
                "executor_policy_": "None",
                "executor_script_": "[]" /*`\nvar onExecutors = function(){\n    // 编写获取执行者逻辑代码 \n    console.log(\"on Executors\");\n\n    // 返回值为用户ID的数组 \n    return [];\n};\n\nonExecutors();\n`*/,
            },
            "elements": [
                { label: "流程图属性", type: "label" },
                { id: "category", label: "类型", options: categories },
                { id: "key", label: "ID" },
                { label: "基本配置", type: "label" },
                { id: "code_", label: "用户编码", type: "text", tooltip: "用户自定义编码" },
                { id: "rejectable_", label: "允许驳回", type: "checkbox", tooltip: "是否允许执行者在流程处理时进行驳回，驳回后将流转至流程发起者" },
                { id: "require_reject_comment_", label: "填写驳回原因", type: "checkbox", tooltip: "执行者在执行驳回时，是否必须填写驳回原因" },
                { id: "on_before_script_", label: "{流转前事件}", tooltip: "在执行流转前触发的事件" },
                { id: "on_after_script_", label: "{流转后事件}", tooltip: "在执行流转后触发的事件" },
                { id: "on_reject_script_", label: "{驳回事件}", tooltip: "在执行驳回时触发的事件" },
                { label: "执行者设置", type: "label" },
                {
                    id: "executor_custom_num_", label: "默认数量", type: "richselect",
                    options: [
                        { id: "0", value: "[不设置]" },
                        { id: "1", value: "1个" },
                        { id: "2", value: "2个" },
                        { id: "3", value: "3个" },
                        { id: "5", value: "5个" },
                    ],
                    tooltip: "无默认执行者时，将从执行者范围中选择设置数量的执行者。如果默认数量和选择数量均未设置，那么最多默认10个执行者"
                },
                {
                    id: "executor_selectable_num_", label: "选择数量", type: "richselect",
                    options: [
                        { id: "0", value: "[不限制]" },
                        { id: "1", value: "1个" },
                        { id: "2", value: "2个" },
                        { id: "3", value: "3个" },
                        { id: "5", value: "5个" },
                    ],
                    tooltip: "从执行者范围中选择执行者时，不能超过设定的数量"
                },
                { id: "executor_savable_", label: "自动保存", type: "checkbox", tooltip: "自动保存本次选择的执行者，作为下次默认执行者" },
                { id: "executor_name_users_", label: "[用户范围]", tooltip: "用户范围内的用户，作为选择的执行者范围" },
                { id: "executor_name_departs_", label: "[部门范围]", tooltip: "属于部门范围内的用户，作为选择的执行者范围" },
                { id: "executor_name_roles_", label: "[角色范围]", tooltip: "拥有角色范围内的用户，作为选择的执行者范围" },
                {
                    id: "executor_policy_", label: "策略范围", type: "richselect",
                    options: [
                        { id: "None", value: "无" },
                        { id: "AllUsers", value: "所有用户" },
                        { id: "StartDepartLeader", value: "流程发起者的部门领导" },
                        { id: "ForwardDepartLeader", value: "前置执行环节的部门领导" },
                    ],
                    tooltip: "提供常用的执行者策略"
                },
                { id: "executor_script_", label: "{自定义范围}", tooltip: "自定义编写脚本，确定执行者范围，返回值类型为 []String (组织ID数组) 类型" },
            ]
        },
        "Branch": {
            "default": {},
            "elements": [
                { label: "流程图属性", type: "label" },
                { id: "category", label: "类型", options: categories },
                { id: "key", label: "ID" },
                { label: "基本配置", type: "label" },
                { id: "code_", label: "用户编码", type: "text", tooltip: "用户自定义编码" },
            ]
        },
        "End": {
            "default": {
                "code_": "End",
            },
            "elements": [
                { label: "流程图属性", type: "label" },
                { id: "category", label: "类型", options: categories },
                { id: "key", label: "ID" },
                { label: "基本配置", type: "label" },
                { id: "code_", label: "用户编码", type: "text", tooltip: "用户自定义编码" },
                { id: "on_before_script_", label: "{结束前事件}", tooltip: "在流程结束前触发的事件" },
                { id: "on_after_script_", label: "{结束后事件}", tooltip: "在流程结束后触发的事件" }
            ]
        }
    };

    // 连接线
    var linkElements = {
        "default": {
            "on_script_": "true",
        },
        "elements": [
            { label: "基本配置", type: "label" },
            { id: "category", label: "类型", options: categories },
            { id: "from", label: "开始ID" },
            { id: "to", label: "结束ID" },
            { id: "on_script_", label: "{执行条件}", tooltip: "执行条件的返回值为Boolean，表示是否符合当前分支条件。" },
        ]
    };

    webix.ui({
        id: win,
        view: "window",
        close: true,
        modal: true,
        fullscreen: true,
        animate: { type: "flip", subtype: "vertical" },
        head: "流程设计",
        position: "center",
        body: {
            rows: [
                {
                    view: "toolbar",
                    cols: [
                        { width: 12 },
                        {
                            view: "button", label: "保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                            click() {
                                webix.ajax().post("/api/wf/diagrams?method=Save", {
                                    "operation": item["operation"],
                                    "id": item["id"],
                                    "model": $$(diagram).getDiagram().model.toJson(),
                                    "options": options,
                                }).then((res) => {
                                    var newId = res.json()["id"];

                                    // 更新状态
                                    if (item["operation"] == "insert") {
                                        item["id"] = newId;
                                        item["operation"] = "update";
                                    }

                                    // 重新检索流程
                                    $$(item["grid"]).clearAll();
                                    $$(item["grid"]).load(
                                        $$(item["grid"]).config.url,
                                        "json",
                                        (text, data, http_request) => {
                                            // 如果已过滤，那么使用现有的过滤器
                                            $$(item["grid"]).filterByAll();

                                            // 默认选中
                                            $$(item["grid"]).select(newId, false);

                                            webix.message({ type: "success", text: "流程保存成功" });
                                        },
                                    );
                                })
                            }
                        },
                        {
                            view: "button", label: "发布", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-rocket-launch",
                            click() {
                                webix.ajax().post("/api/wf/diagrams?method=Publish", { "id": item["id"] })
                                    .then((res) => {
                                        $$(item["grid"]).clearAll();
                                        $$(item["grid"]).load(
                                            $$(item["grid"]).config.url,
                                            "json",
                                            (text, data, http_request) => {
                                                // 如果已过滤，那么使用现有的过滤器
                                                $$(item["grid"]).filterByAll();

                                                // 默认选中
                                                $$(item["grid"]).select(item["id"], false);

                                                webix.message({ type: "success", text: "流程发布成功" });
                                                $$(win).hide();
                                            },
                                        );
                                    })
                            }
                        },
                        {},
                    ]
                },
                {
                    cols: [
                        {
                            id: palette,
                            view: "goPalette",
                            width: 132
                        },
                        {
                            view: "resizer"
                        },
                        {
                            id: diagram,
                            view: "goDiagram",
                            editable: true,
                            model: model,
                            onChangedSelection(node) {
                                // 按照节点类型显示
                                if ($$(property)) {
                                    var elements = diagramElements;
                                    var data = options.diagram;
                                    console.log(data);

                                    if (node) {
                                        if (_.has(node, "key")) {
                                            elements = _.get(nodeElements, [node.category, "elements"]);
                                            data = _.findWhere(options.nodes, { key: node.key });
                                            if (!data) {
                                                var values = _.extend(
                                                    {},
                                                    _.get(nodeElements, [node.category, "default"]),
                                                    _.pick(node, "key", "category"),
                                                );

                                                data = values;
                                                options.nodes.push(values);
                                            }
                                        } else {
                                            node.category = "Link";
                                            elements = linkElements.elements;

                                            // 如果起始节点为条件分支，则显示执行条件
                                            var preNode = _.findWhere(options.nodes, { key: node.from });
                                            if (preNode["category"] != "Branch") {
                                                elements = _.filter(elements, (ele) => ele["id"] != "on_script_");
                                            }

                                            data = _.findWhere(options.links, { from: node.from, to: node.to });
                                            if (!data) {
                                                var values = _.extend(
                                                    {},
                                                    linkElements.default,
                                                    _.pick(node, "from", "to", "category"),
                                                );

                                                data = values;
                                                options.links.push(values);
                                            }
                                        }
                                    }

                                    $$(property).editStop();
                                    $$(property).define("elements", elements);
                                    $$(property).define("data", data)
                                    $$(property).refresh();
                                }
                            },
                            onSelectionDeleting(node) {
                                options.nodes = _.reject(options.nodes, { key: node.key });
                                options.links = _.reject(options.links, (link) => link.from === node.key || link.to === node.key || (link.from == node.from && link.to == node.to));
                            }
                        },
                        {
                            view: "resizer"
                        },
                        {
                            id: property,
                            view: "property",
                            scroll: "y",
                            width: 300,
                            nameWidth: 88,
                            tooltip: (element) => element.type === "label" ? element.label : "属性描述：" + (element.tooltip || element.label) + "<br/>当前值：" + element.value,
                            elements: diagramElements,
                            data: options.diagram,
                            on: {
                                onCheck(id, state) {
                                    var values = this.getValues();
                                    if (_.has(values, "key")) {
                                        // Node
                                        var find = _.find(options.nodes, { key: values.key });
                                        find ? find[id] = state : !0;
                                    } else if (_.has(values, "from") && _.has(values, "to")) {
                                        // Link
                                        var find = _.find(options.links, { from: values.from, to: values.to });
                                        find ? find[id] = state : !0;
                                    } else {
                                        // Diagram
                                        options.diagram = values;
                                    }
                                },
                                onItemDblClick(id, event) {
                                    var self = this;

                                    var item = this.getItem(id);
                                    var values = this.getValues();
                                    var find = _.find(options.nodes, { key: values.key });
                                    if (!find) {
                                        find = _.find(options.links, { from: values.from, to: values.to });
                                    }

                                    if (id.substring(id.length - 8) === "_script_") {
                                        // 事件代码
                                        utils.protos.window.form(
                                            {
                                                head: "服务脚本",
                                                fullscreen: true,
                                                form: {
                                                    data: { "script_": item.value },
                                                    rows: [{ view: "ace-editor", mode: "javascript", name: "script_" }],
                                                },
                                                callback(value) {
                                                    item.value = value["script_"];
                                                    self.refresh(id);

                                                    find[id] = value["script_"];
                                                }
                                            }
                                        );
                                    } else if (_.isEqual(id, "executor_name_users_")) {
                                        var s1 = (find["executor_users_"] || "").split(",");
                                        var s2 = (find["executor_name_users_"] || "").split(",");

                                        var checked = _.map(s1, (id, i) => ({ "id": id, "user_name_": s2[i] }));

                                        // 选择用户
                                        utils.windows.users({
                                            multiple: true,
                                            checked: checked,
                                            callback(checked) {
                                                var value = _.pluck(checked, "id").join(",");
                                                var name = _.pluck(checked, "user_name_").join(",");

                                                item.value = name;
                                                self.refresh(id);

                                                find["executor_users_"] = value;
                                                find["executor_name_users_"] = name;

                                                return true;
                                            }
                                        })
                                    } else if (_.isEqual(id, "executor_name_departs_")) {
                                        var checked = find["executor_departs_"];
                                        if (_.isEmpty(checked)) {
                                            checked = [];
                                        } else {
                                            checked = checked.split(",");
                                        }

                                        // 选择部门
                                        utils.windows.departs({
                                            multiple: true,
                                            threeState: true,
                                            checked: checked,
                                            callback(checked) {
                                                var names = _.pluck(checked, "name_").join(",")

                                                item.value = names;
                                                self.refresh(id);

                                                find[id] = names;
                                                find["executor_departs_"] = _.pluck(checked, "id").join(",");

                                                return true;
                                            }
                                        })
                                    } else if (_.isEqual(id, "executor_name_roles_")) {
                                        // 选择角色
                                        utils.windows.roles({
                                            multiple: true,
                                            checked: find["executor_roles_"],
                                            callback(checked) {
                                                var value = _.pluck(checked, "id").join(",");
                                                var name = _.pluck(checked, "name_").join(",");

                                                item.value = name;
                                                self.refresh(id);

                                                find["executor_roles_"] = value;
                                                find["executor_name_roles_"] = name;

                                                return true;
                                            }
                                        })
                                    }
                                },
                                onAfterEditStop(state, editor, ignoreUpdate) {
                                    if (state.value === state.old) return;

                                    var values = this.getValues();
                                    if (_.has(values, "key")) {
                                        // Node
                                        var find = _.find(options.nodes, { key: values.key });
                                        find ? find[editor.id] = state.value : !0;
                                    } else if (_.has(values, "from") && _.has(values, "to")) {
                                        // Link
                                    } else {
                                        // Diagram
                                        options.diagram = values;
                                    }
                                }
                            }
                        },
                    ],
                }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
};

export { open }