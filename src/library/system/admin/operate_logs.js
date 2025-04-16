function builder() {
    var grid_id = utils.UUID();
    var pager_id = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            var state = $$(grid_id).getState();

                            var params = {};

                            // 保持原有的数据排序状态
                            if (state.sort) {
                                var sorts = _.isArray(state.sort) ? state.sort : [state.sort];
                                _.forEach(sorts, (src) => { src["id"] && (params["sort[" + src["id"] + "]"] = src["dir"]) });
                            }

                            // 保持原有的数据过滤状态
                            if (state.filter) {
                                _.forEach(state.filter, (v, k) => { params["filter[" + k + "]"] = v });
                            }

                            $$(grid_id).load(() => webix.ajax("/api/sys/operate_logs?PHOENIX_IGNORE_LOG=true", params));
                            $$(grid_id).refresh();
                        }
                    },
                    {},
                    {
                        view: "button", label: "导出", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-microsoft-excel", click() {
                            webix.toExcel($$(grid_id), {
                                spans: true,
                                styles: true
                            });
                        }
                    },
                    { view: "icon", icon: "mdi mdi-18px mdi-fullscreen", tooltip: "全屏模式", click: () => webix.fullscreen.set($$(webix.storage.cookie.get("PHOENIX_USING_MENU"))) },
                ]
            },
            {
                id: grid_id,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                tooltip: true,
                leftSplit: 4,
                select: "row",
                sort: "multi",
                url: "/api/sys/operate_logs?PHOENIX_IGNORE_LOG=true",
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "user_name_", header: [{ text: "用户名", css: { "text-align": "center" } }, { content: "serverFilter" }], sort: "server", width: 100 },
                    { id: "method_", header: { text: "方法", css: { "text-align": "center" } }, css: { "text-align": "center" }, cssFormat: utils.formats.method, css: { "text-align": "center" }, width: 60 },
                    { id: "menu_name_", header: [{ text: "菜单名称", css: { "text-align": "center" } }, { content: "serverFilter" }], sort: "server", width: 160 },
                    { id: "path_", header: { text: "URL地址", css: { "text-align": "center" } }, sort: "server", width: 180 },

                    { id: "params_", header: [{ text: "请求参数", css: { "text-align": "center" } }, { content: "serverFilter" }], width: 480 },
                    { id: "values_", header: [{ text: "表单数据", css: { "text-align": "center" } }, { content: "serverFilter" }], width: 480 },
                    { id: "start_", header: { text: "请求时间", css: { "text-align": "center" } }, css: { "text-align": "center" }, format: utils.formats.datetime.format, width: 150 },
                    { id: "end_", header: { text: "响应时间", css: { "text-align": "center" } }, css: { "text-align": "center" }, format: utils.formats.datetime.format, width: 150 },
                    { id: "duration_", header: { text: "耗时(毫秒)", css: { "text-align": "center" } }, css: { "text-align": "right" }, sort: "server", width: 100 },
                    {
                        id: "status_", header: [{ text: "响应结果", css: { "text-align": "center" } }, { content: "serverSelectFilter", options: [{ id: "success", value: "成功" }, { id: "error", value: "失败" }] }], css: { "text-align": "center" }, options: [{ id: "success", value: "成功" }, { id: "error", value: "失败" }], sort: "server", width: 100
                    },
                    { id: "message_", header: { text: "响应消息", css: { "text-align": "center" } }, width: 600 },
                    { id: "ip_", header: [{ text: "IP地址", css: { "text-align": "center" } }, { content: "serverFilter" }], css: { "text-align": "center" }, sort: "server", width: 120 },
                    { id: "agent_", header: { text: "设备类型", css: { "text-align": "center" } }, sort: "server", width: 240 },
                    { id: "depart_name_", header: { text: "部门名称", css: { "text-align": "center" } }, sort: "server", width: 120 },
                    { id: "user_code_", header: { text: "工号", css: { "text-align": "center" } }, css: { "text-align": "center" }, sort: "server", width: 100 },
                ],
                scheme: {
                    $change: function (item) {
                        if (item["status_"] == "error")
                            item.$css = "phoenix_danger";
                    }
                },
                pager: pager_id,
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
            {
                cols: [
                    {
                        id: pager_id,
                        view: "pager",
                        template: function (obj, common) {
                            var master = $$(obj.id).$master;
                            if (master.count()) {
                                return common.first(obj) + common.prev(obj) + common.pages(obj) + common.next(obj) + common.last(obj)
                                    + "  当前在 " + common.page(obj) + "页/" + obj.limit + "页，总共 " + webix.i18n.intFormat(obj.count) + "条记录。";
                            } else {
                                return "  总共 0条记录"
                            }
                        },
                        group: 5,
                        size: 50
                    },
                    {},
                ]
            }
        ]
    }
}

export { builder }