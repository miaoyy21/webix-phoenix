import * as property from "./property";

function show(id, options) {
    var container_id = utils.UUID();
    var tree_id = id;
    var property_id = utils.UUID();

    // 事件脚本
    function config_events() {
        var values = $$(property_id).getValues();
        if (!_.has(values, "ready")) return;

        utils.windows.coding({
            js: values["ready"],
            callback: function (ready) {
                var values = $$(property_id).getValues();

                values["ready"] = ready;
                $$(property_id).setValues(values);

                preview();
            }
        });
    }

    // 预览
    function preview() {
        // 获取配置信息
        var values = $$(property_id).getValues();

        // 获取默认的字段配置
        var options = utils.parses.tree.options(webix.copy(values));
        options = _.extend(options, { id: tree_id, data: [] });

        console.log(options);
        /*************************** Start ***************************/
        var target = utils.parses.json.marshal(options);
        var source = utils.parses.json.unmarshal(target);
        /***************************  End  ***************************/

        webix.ui(source, $$(container_id), $$(tree_id));
    }

    return {
        cols: [
            {
                id: container_id,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            { view: "button", label: "事件脚本", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-code-json", click: config_events },
                            {
                                view: "button", label: "新增同级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-line-spacing",
                                click() {
                                    if (!$$(tree_id).validate()) return;

                                    var item = $$(tree_id).getSelectedItem();
                                    if (!item) {
                                        if (!$$(tree_id).count()) {
                                            $$(tree_id).select($$(tree_id).add({}, 0));
                                        } else {
                                            webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个节点" });
                                            return;
                                        }
                                    } else {
                                        $$(tree_id).select($$(tree_id).add({}, 0, item.$parent));
                                    }
                                }
                            },
                            {
                                view: "button", label: "新增下级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-list-group",
                                click() {
                                    var item = $$(tree_id).getSelectedItem();
                                    if (!item) {
                                        webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个节点" });
                                        return;
                                    }

                                    if (!$$(tree_id).validate()) return;

                                    var id = $$(tree_id).add({}, 0, item.id);
                                    $$(tree_id).select(id);
                                    $$(tree_id).open(item.id);
                                }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click() {
                                    var id = $$(tree_id).getChecked();

                                    var text = "是否删除选择的节点 ?";
                                    if (_.size(id) < 1) {
                                        id = $$(tree_id).getSelectedId(true);
                                    } else if (_.size(id) === 1) {
                                        text = "是否删除勾选的节点 ?";
                                    } else {
                                        text = "是否删除勾选的" + _.size(id) + "个节点 ?";
                                    }

                                    if (_.size(id) < 1) {
                                        webix.message({ type: "debug", text: "未选中任何节点" });
                                        return;
                                    }

                                    // 执行删除
                                    webix.message({ type: "confirm-error", title: "系统提示", text: text })
                                        .then(function (res) {
                                            var url = $$(tree_id).config.save.url;
                                            if (url) {
                                                // 提交服务端删除
                                                webix.ajax()
                                                    .post(url, { "id": id, "operation": "delete" })
                                                    .then((res) => webix.dp($$(tree_id)).ignore(() => _.forEach(id, (n) => $$(tree_id).exists(n) && $$(tree_id).remove(n))));
                                            } else {
                                                // 客户端直接移除记录
                                                $$(tree_id).remove(id);
                                            }
                                        })
                                }
                            },
                            {
                                view: "button", label: "保存设计", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                                click() {
                                    // 获取配置信息
                                    var values = $$(property_id).getValues();
                                    var options = utils.parses.datatable.options(webix.copy(values));

                                    delete options["on"];
                                    var newOptions = utils.parses.json.marshal(options);

                                    webix.ajax()
                                        .post("/api/sys/ui_widget?method=OptionsSource", { "id": id, "options": values, "source": newOptions })
                                        .then(function () {
                                            webix.message({ type: "success", text: "保存设计成功" });
                                        })
                                }
                            },
                            { view: "button", label: "设计预览", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-play-speed", click: preview },
                        ]
                    },
                    {
                        id: tree_id,
                        view: "edittree",
                        select: true,
                        data: [
                            {
                                id: "tree_root", value: "Nodes", open: true, data: [
                                    { id: "tree_1", value: "Node 1" },
                                    { id: "tree_2", value: "Node 2" },
                                    { id: "tree_3", value: "Node 3" },
                                ]
                            }
                        ]
                    }
                ],
            },
            { view: "resizer" },
            property.builder(property_id, options),
        ]
    }
}

export { show }