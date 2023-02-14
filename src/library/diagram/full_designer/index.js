function builder() {
    var palette = utils.UUID();
    var diagram = utils.UUID();
    var property = utils.UUID();

    // Options Data
    var options = {
        "diagram": {
            "code_": "a1",
            "name_": "请假单",
            "description_": "x",
            "category": "Diagram",
            "keyword_": "关键字 => #name_#",
            "exceed_days_": "7"
        },
        "nodes": [
            {
                "code_": "Start",
                "key": -1,
                "category": "Start",
                "revocable_": true,
                "on_revoke_script_": `
    log.Info("***************************** 恭喜你 ****** 触发撤回事件 ");
                `,
            },
            {
                "code_": "001",
                "rejectable_": true,
                "require_reject_comment_": true,
                "on_reject_script_": `
    log.Info("***************************** 触发驳回事件 %s *****************************",$node.Name());
                `,
                "executor_custom_num_": "3",
                "executor_selectable_num_": "2",
                "executor_savable_": true,
                "executor_users_": "U040",
                "executor_name_users_": "杨幂",
                "executor_policy_": "None",
                "executor_script_": "[]",
                "key": -2,
                "category": "Execute"
            },
            {
                "code_": "002",
                "key": -3,
                "category": "Branch"
            },
            {
                "code_": "End",
                "key": -4,
                "category": "End"
            },
            {
                "code_": "003",
                "rejectable_": true,
                "require_reject_comment_": true,
                "executor_custom_num_": "0",
                "executor_selectable_num_": "3",
                "executor_savable_": true,
                "executor_users_": "U078,U040",
                "executor_name_users_": "马婉莹,杨幂",
                "executor_departs_": "D005",
                "executor_name_departs_": "后勤保障部",
                "executor_roles_": "R001,R002,R008,R010",
                "executor_name_roles_": "生产计划员,采购员,设计师,系统管理员",
                "executor_policy_": "None",
                "executor_script_": "[]",
                "key": -5,
                "category": "Execute"
            }
        ],
        "links": [
            {
                "on_script_": "true",
                "from": -1,
                "to": -2,
                "category": "Link"
            },
            {
                "on_script_": "true",
                "from": -2,
                "to": -3,
                "category": "Link"
            },
            {
                "on_script_": `
    log.Info("Hello Info %s","sssssss");
    // log.Error("Hello Error %s","vvvvvvv");
    log.Debug("Hello Debug %s","xxxxxxx");
    log.Debug("Node is %#v",$node);
    log.Debug("Node Name 1 is %#v",$node.name);
    log.Debug("Node Name 2 is %#v",$node.Name());
    $values["days"] >= 3;
    `,
                "from": -3,
                "to": -5,
                "category": "Link"
            },
            {
                "on_script_": `$values["days"] < 3`,
                "from": -3,
                "to": -4,
                "category": "Link"
            },
            {
                "on_script_": "true",
                "from": -5,
                "to": -4,
                "category": "Link"
            }
        ]
    };

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
        { id: "code_", label: "流程编码", type: "text", tooltip: "流程编码需与代码中定义的一致" },
        { id: "name_", label: "流程名称", type: "text", tooltip: "流程的名称" },
        { id: "description_", label: "流程描述", type: "text", tooltip: "流程的描述信息" },
        { id: "category", label: "类型", options: categories },
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

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "Save Full", autowidth: true, css: "webix_primary",
                        click() {
                            var model = $$(diagram).getDiagram().model.toJson();
                            console.log(model);

                            webix.ajax().post("/api/wf/diagrams?method=Save", {
                                "id": "123",
                                "model": model,
                                "options": options,
                            }).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    {
                        view: "button", label: "Publish", autowidth: true, css: "webix_primary",
                        click() {
                            webix.ajax().post("/api/wf/diagrams?method=Publish", { "id": "123" })
                                .then((res) => {
                                    console.log(res.json());
                                })
                        }
                    },
                    {
                        view: "button", label: "启动查询", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 2, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=StartBackwards",
                                {
                                    "instanceId": "XXXX", // 流程实例ID
                                    "diagramCode": "a1", // 流程编码
                                    "values": values, // 表单数据
                                }).then((res) => {
                                    console.log(res.json());
                                })
                        }
                    },
                    {
                        view: "button", label: "启动", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 2, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=Start",
                                {
                                    "instanceId": "XXXX", // 流程实例ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                    "backwards": [{
                                        "key": -2,
                                        "routes": [-1, -2],
                                        "executors": {
                                            "U002": "系统管理员",
                                            "U051": "吴文丽",
                                        }
                                    }],
                                }).then((res) => {
                                    console.log(res.json());
                                })
                        }
                    },
                    /****************************************** 重新启动 ******************************************/
                    {
                        view: "button", label: "重新启动查询", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 7, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=RestartBackwards",
                                {
                                    "instanceId": "XXXX", // 流程ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    {
                        view: "button", label: "重新启动", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 7, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=Restart",
                                {
                                    "instanceId": "XXXX", // 流程实例ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                    "backwards": [{
                                        "key": -2,
                                        "routes": [-1, -2],
                                        "executors": {
                                            "U002": "系统管理员",
                                            "U040": "杨幂",
                                        }
                                    }],
                                }).then((res) => {
                                    console.log(res.json());
                                })
                        }
                    },
                    {
                        view: "button", label: "撤回", autowidth: true, css: "webix_danger",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 7, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=Revoke",
                                {
                                    "instanceId": "XXXX",// 流程实例ID
                                    "values": values, // 表单数据
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    /****************************************** 部门领导 ******************************************/
                    {
                        view: "button", label: "部门领导查询", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 6, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=ExecuteBackwards",
                                {
                                    "id": "dhjm99zohgazuhap9y6ucg7ooao6rssr", // 流程ID
                                    "values": values, // 表单数据
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    {
                        view: "button", label: "部门领导同意", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 6, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=ExecuteAccept",
                                {
                                    "id": "dhjm99zohgazuhap9y6ucg7ooao6rssr", // 流转ID
                                    "instanceId": "XXXX",// 流程实例ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                    "comment": "部门领导已同意",
                                    // "backwards": [{
                                    //     "key": -4,
                                    //     "routes": [-2, -3, -4],
                                    //     "executors": {}
                                    // }],
                                    "backwards": [{
                                        "key": -5,
                                        "routes": [-2, -3, -5],
                                        "executors": {
                                            "U002": "系统管理员",
                                            "U040": "杨幂",
                                            "U051": "吴文丽"
                                        }
                                    }],
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    {
                        view: "button", label: "部门领导驳回", autowidth: true, css: "webix_danger",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 2, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=ExecuteReject",
                                {
                                    "id": "dhjju99tndm1uw3h9hqs9633vu6jcw7d", // 流转ID
                                    "instanceId": "XXXX",// 流程实例ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                    "comment": "部门领导驳回，驳回原因 ***",
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    /****************************************** 总经理 ******************************************/
                    {
                        view: "button", label: "总经理查询", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 2, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=ExecuteBackwards",
                                {
                                    "id": "dhjm9nxga8rq2kjwa22a3qknu3dtngc5", // 流程ID
                                    "values": values, // 表单数据
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
                    {
                        view: "button", label: "总经理同意", autowidth: true, css: "webix_primary",
                        click() {
                            var values = { "reason": "生病请假4天", "days": 2, "name_": "测试是否正常", "list": [{ "a": "1", "b": "2" }] };

                            webix.ajax().post("/api/wf/flows?method=ExecuteAccept",
                                {
                                    "id": "dhjm9nxga8rq2kjwa22a3qknu3dtngc5", // 流转ID
                                    "instanceId": "XXXX",// 流程实例ID
                                    "diagramId": "123", // 流程ID
                                    "values": values, // 表单数据
                                    "comment": "总经理已同意",
                                    "backwards": [{
                                        "key": -4,
                                        "routes": [-5, -4],
                                        "executors": {}
                                    }],
                                }
                            ).then((res) => {
                                console.log(res.json());
                            })
                        }
                    },
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
                        model: {
                            "class": "GraphLinksModel",
                            "linkFromPortIdProperty": "fromPort",
                            "linkToPortIdProperty": "toPort",
                            "nodeDataArray": [
                                { "category": "Start", "text": "\u5f00\u59cb", "key": -1, "loc": "-690 -290" },
                                { "category": "Execute", "text": "\u90e8\u95e8\u9886\u5bfc", "key": -2, "loc": "-690 -190" },
                                { "category": "Branch", "text": "\u8d85\u8fc73\u5929", "key": -3, "loc": "-690 -80" },
                                { "category": "End", "text": "\u7ed3\u675f", "key": -4, "loc": "-690 60" },
                                { "category": "Execute", "text": "\u603b\u7ecf\u7406", "key": -5, "loc": "-380 -80" }
                            ],
                            "linkDataArray": [
                                { "from": -1, "to": -2, "fromPort": "B", "toPort": "T", "points": [-690, -257, -690, -247, -690, -236, -690, -236, -690, -225, -690, -215], "category": "Link" },
                                { "from": -2, "to": -3, "fromPort": "B", "toPort": "T", "points": [-690, -165, -690, -155, -690, -141, -690, -141, -690, -127, -690, -117], "category": "Link" },
                                { "from": -3, "to": -5, "fromPort": "R", "toPort": "L", "visible": true, "points": [-629, -80, -619, -80, -535, -80, -535, -80, -451, -80, -441, -80], "category": "Link", "text": "\u662f" },
                                { "from": -3, "to": -4, "fromPort": "B", "toPort": "T", "visible": true, "points": [-690, -43, -690, -33, -690, -9.53125, -690, -9.53125, -690, 17, -690, 27], "category": "Link", "text": "\u5426" },
                                { "from": -5, "to": -4, "fromPort": "B", "toPort": "R", "points": [-380, -55, -380, -45, -380, 60, -513.5, 60, -647, 60, -657, 60], "category": "Link" }
                            ]
                        },
                        onChangedSelection(node) {
                            // 按照节点类型显示
                            if ($$(property)) {
                                var elements = diagramElements;
                                var data = options.diagram;
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
                        width: 240,
                        nameWidth: 88,
                        tooltip: (element) => element.type === "label" ? element.label : "属性描述：" + (element.tooltip || element.label) + "<br/><br/>当前值：" + element.value,
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
                                    var s1 = find["executor_users_"].split(",");
                                    var s2 = find["executor_name_users_"].split(",");

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
            },
        ],
    };
}

export { builder };