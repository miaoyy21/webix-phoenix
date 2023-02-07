import * as columns from "./columns";
import * as property from "./property";

function show(id, options) {
    var container_id = utils.UUID();
    var grid_id = id;
    var property_id = utils.UUID();

    // 字段配置
    function config_columns() {
        var values = webix.copy($$(property_id).getValues());
        var options = utils.parses.datatable.options(values);
        if (!_.size(options["columns"])) {
            var _columns = init_columns(options);
            if (!_.size(_columns)) return;

            options["columns"] = _columns;
        }

        columns.show({
            url: options.url,
            columns: options["columns"],
            callback(cols) {
                var values = $$(property_id).getValues();

                values["columns"] = cols;
                $$(property_id).setValues(values);

                preview();
            }
        })
    }

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

    // 初始化字段配置
    function init_columns(options) {
        var url = options["url"];
        if (_.isUndefined(url) || _.isNull(url) || !_.size(url)) {
            webix.message({ type: "error", text: "缺少检索服务URL" });
            return []
        }

        var res = JSON.parse(webix.ajax().sync().get(url, { "is_parse_columns": true }).responseText);
        return res["columns"];
    }

    // 预览
    function preview() {
        // 获取配置信息
        var values = $$(property_id).getValues();

        // 获取默认的字段配置
        var options = utils.parses.datatable.options(webix.copy(values));
        if (!_.size(options["columns"])) {
            var _columns = init_columns(options);
            if (!_.size(_columns)) return;

            // 字段配置
            options["columns"] = _columns;
            var values = $$(property_id).getValues();
            values["columns"] = _columns;
            $$(property_id).setValues(values);
        }

        options = _.extend(options, { id: grid_id });

        /*************************** Start ***************************/
        var target = utils.parses.json.marshal(options);
        var source = utils.parses.json.unmarshal(target);
        /***************************  End  ***************************/

        webix.ui(source, $$(container_id), $$(grid_id));
    }

    return {
        cols: [
            {
                id: container_id,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            { view: "button", label: "字段配置", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-progress-wrench", click: config_columns },
                            { view: "button", label: "事件脚本", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-code-json", click: config_events },
                            {
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() { $$(grid_id).add({}, 0); }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click() {
                                    var id = $$(grid_id).getSelectedId(true, true);
                                    if (_.size(id) < 1) {
                                        webix.message({ type: "debug", text: "未选中任何记录行" });
                                        return;
                                    }

                                    // 支持批量删除
                                    var text = "你总共选择" + _.size(id) + "条记录，是否删除这些记录 ?";
                                    if (_.size(id) === 1) {
                                        text = "是否删除第" + ($$(grid_id).getIndexById(_.head(id)) + 1) + "条记录？";
                                    }

                                    // 执行删除
                                    webix.message({ type: "confirm-error", title: "系统提示", text: text })
                                        .then(function (res) {
                                            var url = $$(grid_id).config.save.url;
                                            if (url) {
                                                // 提交服务端删除
                                                webix.ajax()
                                                    .post(url, { "id": id, "operation": "delete" })
                                                    .then((res) => webix.dp($$(grid_id)).ignore(() => $$(grid_id).remove(id)));
                                            } else {
                                                // 客户端直接移除记录
                                                $$(grid_id).remove(id);
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

                                    delete options["onClick"];
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
                        id: grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        columns: [
                            { id: "col_1", header: "Cell 1", css: "rank", fillspace: true },
                            { id: "col_2", header: "Cell 2", css: "rank", fillspace: true },
                            { id: "col_3", header: "Cell 3", css: "rank", fillspace: true },
                        ],
                        data: [
                            { id: "datatable_1", col_1: "Value 11", col_2: "Value 12", col_3: "Value 13" },
                            { id: "datatable_2", col_1: "Value 21", col_2: "Value 22", col_3: "Value 23" },
                            { id: "datatable_3", col_1: "Value 31", col_2: "Value 32", col_3: "Value 33" },
                        ],
                    }
                ],
            },
            { view: "resizer" },
            property.builder(property_id, options),
        ]
    }
}

export { show }