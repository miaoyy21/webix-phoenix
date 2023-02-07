import * as property from "./property";

function show(id, options) {
    var container_id = utils.UUID();
    var list_id = id;
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
        var options = utils.parses.list.options(webix.copy(values));
        options = _.extend(options, { id: list_id });

        console.log(options);
        /*************************** Start ***************************/
        var target = utils.parses.json.marshal(options);
        var source = utils.parses.json.unmarshal(target);
        /***************************  End  ***************************/

        webix.ui(source, $$(container_id), $$(list_id));
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
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() { $$(list_id).add({}, 0); }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click() {
                                    var id = $$(list_id).getSelectedId(true);
                                    if (_.size(id) < 1) {
                                        webix.message({ type: "debug", text: "未选中任何记录行" });
                                        return;
                                    }

                                    // 支持批量删除
                                    var text = "总共选择" + _.size(id) + "条记录，是否删除这些记录 ?";
                                    if (_.size(id) === 1) {
                                        text = "是否删除第" + ($$(list_id).getIndexById(_.head(id)) + 1) + "条记录？";
                                    }

                                    // 执行删除
                                    webix.message({ type: "confirm-error", title: "系统提示", text: text })
                                        .then(function (res) {
                                            var url = $$(list_id).config.save.url;
                                            if (url) {
                                                // 提交服务端删除
                                                webix.ajax()
                                                    .post(url, { "id": id, "operation": "delete" })
                                                    .then((res) => webix.dp($$(list_id)).ignore(() => $$(list_id).remove(res.json()["id"] || id)));
                                            } else {
                                                // 客户端直接移除记录
                                                $$(list_id).remove(id);
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
                        id: list_id,
                        view: "editlist",
                        select: true,
                        data: [
                            { id: "list_1", value: "Item 1" },
                            { id: "list_2", value: "Item 2" },
                            { id: "list_3", value: "Item 3" }
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