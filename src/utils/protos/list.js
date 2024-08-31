function list(options) {
    options = options || {};

    // List ID
    var list_id = options["id"] || utils.UUID();
    var _options = {
        id: list_id,
        borderless: false,
        tooltip: false,
        select: true,
        multiselect: false,
        editable: false,
        editor: "text",
        editValue: "varchar_32_",
        drag: "order",
        template: "#index#. #!varchar_32_#",

        scheme: {},
        rules: {},

        /* 不知为何，不能使用pager参数进行服务端分页，有可能是list的机制就不允许服务端分页 */
        url: "/api/sys/data_service?service=tests.simple",
        save: {
            url: "/api/sys/data_service?service=tests.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        removeMissed: true,

        ready() {
            // 添加数据后触发事件
            this.attachEvent("onAfterAdd", function (id, index) {
                this.hideOverlay();

                this.config.select && this.select(id);
                this.showItem(id);
            });

            // 删除记录前触发事件
            var delete_index = -1; // 标记删除的记录索引
            this.attachEvent("onBeforeDelete", function (id) {
                delete_index = this.getIndexById(id);
            })

            // 删除记录后触发事件
            this.attachEvent("onAfterDelete", function (id) {
                if (!this.count()) {
                    this.showOverlay("无检索数据");
                    return;
                }

                // 选择删除记录行附近的数据行
                if (this.select) {
                    var select_index = delete_index;
                    if (this.count() < delete_index + 1) {
                        select_index = this.count() - 1;
                    }

                    var select_id = this.getIdByIndex(select_index);
                    if (select_id) {
                        this.select(select_id);
                    }
                }

                this.refresh();
            });

            // 修改
            this.attachEvent("onDataUpdate", function (id, data, old) {
                this.refresh();
            })

            // 默认选择第1条数据
            var first = this.getFirstId();
            if (this.config.select && first) {
                this.select(first);
            }
        },
        on: {
            "data->onStoreUpdated": function () {
                this.data.each((obj, i) => { obj.index = i + 1 });
            },
            onBeforeLoad() {
                webix.extend(this, webix.OverlayBox);
                this.showOverlay("数据加载中...");
            },
            onAfterLoad() {
                this.hideOverlay();
                if (!this.count()) {
                    this.showOverlay("无检索数据");
                    return;
                }

                // 因为可能会设置index，所以需要重新刷新1次
                this.refresh();
            },
        },
        actions: {
            add(opts) {
                /* {label :: String, callback :: function(){ return Object } }*/
                opts = opts || {};

                return {
                    view: "button", label: opts["label"] || "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                    click() {
                        var row = opts["callback"] ? opts["callback"]() : {};

                        $$(list_id).add(row, 0);
                        $$(list_id).refresh();
                    }
                };
            },
            remove(opts) {
                /* {label :: String, callback :: function(){ return Array<String>|String } }*/
                opts = opts || {};

                return {
                    view: "button", label: opts["label"] || "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                    click() {
                        var list = $$(list_id);
                        var id = opts["callback"] ? opts["callback"]() : list.getSelectedId(true);

                        // 支持批量删除
                        id = !_.isArray(id) ? [id] : id;
                        var text = "总共选择" + _.size(id) + "条记录，是否删除这些记录 ?";
                        if (_.size(id) === 1) {
                            text = "是否删除第" + (list.getIndexById(_.head(id)) + 1) + "条记录？";
                        }

                        // 执行删除
                        webix.message({ type: "confirm-error", title: "系统提示", text: text })
                            .then(() => {
                                var url = list.config.save.url;
                                if (url) {
                                    // 提交服务端删除
                                    webix.ajax()
                                        .post(url, { "id": id, "operation": "delete" })
                                        .then((res) => webix.dp(list).ignore(() => list.remove(res.json()["id"] || id)));
                                } else {
                                    // 客户端直接移除记录
                                    list.remove(id);
                                }
                            });
                    }
                };
            },
            filter(params) {
                /* params :: {
                    placeholder: String ,
                    filter: function(obj) {return String} ,
                } */
                var placeholder = params && params.placeholder ? params.placeholder : "请输入检索内容...";
                var search = function () {
                    var list = $$(list_id);
                    var text = this.getValue().toString();

                    // 构建filter函数，默认全字段过滤
                    var filter = params && params["filter"] ?
                        params.filter :
                        (obj) => _.map(obj,
                            (v, k) => k !== "id" && k !== "parent_id_" && v.toString()
                        ).join("|");

                    list.filter((obj) => {
                        return (filter(obj).toString().toLowerCase().indexOf(text.toLowerCase()) != -1);
                    });
                    list.refresh();

                    if (!list.count()) {
                        list.showOverlay("无符合条件的数据");
                    } else {
                        list.hideOverlay();
                        list.config.select && list.select(list.getFirstId());
                    }
                }

                return {
                    view: "search", align: "center", placeholder: placeholder,
                    on: { onEnter: search, onSearchIconClick: search }
                };
            },
            refresh() {
                /*  */
                return {
                    view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                    click() {
                        var list = $$(list_id);

                        list.clearAll();
                        list.load(() => webix.ajax(list.config.url));
                    }
                }
            }
        }
    };

    return _.extend(_options, options, { view: "editlist" });
};

export { list };