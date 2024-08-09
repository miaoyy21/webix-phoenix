function tree(options) {
    options = options || {};

    // Tree ID
    var tree_id = options["id"] || utils.UUID();

    // 接管外部的URL参数
    var url = "/api/sys/data_service?service=tests.simple";
    if (options["url"]) {
        url = options["url"];
    }

    var _options = {
        id: tree_id,
        borderless: false,
        tooltip: false,
        select: true,
        editable: false,
        editor: "text",
        editValue: "varchar_32_",
        drag: "order",
        threeState: true,
        template: "{common.icon()} {common.checkbox()} {common.folder()} #!varchar_32_#",

        scheme: {},
        rules: {},

        data: [],
        save: {
            url: "/api/sys/data_service?service=tests.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        removeMissed: true,

        ready() {
            webix.extend(this, webix.OverlayBox).hideOverlay();
            webix.extend(this, webix.ProgressBar).showProgress();

            // ⭐️ 根据检索地址加载平面数据，然后进行建树
            webix.ajax(url).then((res) => {
                var data = utils.tree.buildTree(res.json().data, null);
                this.define("data", data);
                this.refresh();

                this.hideProgress();
                if (!this.count()) {
                    this.showOverlay("无检索数据");
                    return;
                } else {
                    this.config.select && this.select(this.getFirstId());
                }
            });

            // 添加节点后触发事件
            this.attachEvent("onAfterAdd", function (id, index) {
                this.hideOverlay();

                this.config.select && this.select(id);
                this.showItem(id);
            });

            // 删除节点后触发事件
            this.attachEvent("onAfterDelete", function (id) {
                if (!this.count()) {
                    this.showOverlay("无检索数据");
                    return;
                }
            });
        },
        actions: {
            add(callback) {
                /* callback :: function(){ return Object } */
                return {
                    view: "button", label: "新增同级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-line-spacing",
                    click() {
                        if (!$$(tree_id).validate()) return;

                        var row = callback ? callback() : {};
                        var item = $$(tree_id).getSelectedItem();
                        if (!item) {
                            if (!$$(tree_id).count()) {
                                $$(tree_id).select($$(tree_id).add(row, 0));
                            } else {
                                webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个节点" });
                                return;
                            }
                        } else {
                            $$(tree_id).select($$(tree_id).add(row, 0, item.$parent));
                        }
                    }
                };
            },
            addChild(callback) {
                /* callback :: function(){ return Object } */
                return {
                    view: "button", label: "新增下级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-list-group",
                    click() {
                        var item = $$(tree_id).getSelectedItem();
                        if (!item) {
                            webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个节点" });
                            return;
                        }

                        if (!$$(tree_id).validate()) return;

                        var row = callback ? callback() : {};
                        var id = $$(tree_id).add(row, 0, item.id);
                        $$(tree_id).select(id);
                        $$(tree_id).open(item.id);
                    }
                };
            },
            remove(callback) {
                /* callback :: function(){ return Array<String>|String } */
                return {
                    view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                    click() {
                        var tree = $$(tree_id);
                        var id = callback ? callback() : tree.getChecked();
                        var text = "是否删除选择的节点 ?";

                        id = !_.isArray(id) ? [id] : id;
                        if (_.size(id) < 1) {
                            id = tree.getSelectedId(true);
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
                                var url = tree.config.save.url;
                                if (url) {
                                    // 提交服务端删除
                                    webix.ajax()
                                        .post(url, { "id": id, "operation": "delete" })
                                        .then((res) => webix.dp(tree).ignore(() => _.forEach(id, (n) => tree.exists(n) && tree.remove(n))));
                                } else {
                                    // 客户端直接移除记录
                                    tree.remove(id);
                                }
                            })
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
                    var tree = $$(tree_id);
                    var text = this.getValue().toString();

                    // 构建filter函数，默认全字段过滤
                    var filter = params && params["filter"] ?
                        params.filter :
                        (obj) => _.map(obj,
                            (v, k) => k !== "id" && k !== "parent_id_" && v.toString()
                        ).join("|");

                    tree.filter((obj) => {
                        return (filter(obj).toString().toLowerCase().indexOf(text.toLowerCase()) != -1);
                    });

                    var overlayBox = webix.extend(tree, webix.OverlayBox);
                    if (!tree.count()) {
                        overlayBox.showOverlay("没有找到符合条件的数据");
                    } else {
                        overlayBox.hideOverlay();
                    }
                }

                return {
                    view: "search", align: "center", placeholder: placeholder,
                    on: { onEnter: search, onSearchIconClick: search }
                };
            },
        }
    };

    return _.extend(_options, options, { view: "edittree", url: null });
};

export { tree };