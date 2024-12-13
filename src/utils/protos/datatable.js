function datatable(options) {
    options = options || {};

    // DataTable ID
    var datatable_id = options["id"] || utils.UUID();
    var _options = {
        id: datatable_id,
        borderless: false,
        css: "webix_data_border webix_header_border",
        tooltip: true,
        select: "row",
        multiselect: false,
        editable: true,
        editaction: "click",
        drag: "order",
        sort: "multi",
        leftSplit: 1,
        rightSplit: 0,
        resizeColumn: true,
        scheme: {},
        rules: {},

        data: [],
        url: "/api/sys/data_service?service=tests.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=tests.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        removeMissed: true,
        checkboxRefresh: true,

        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "varchar_32_", header: [{ text: "Text", css: { "text-align": "center" } }, { content: "serverFilter" }], editor: "text", adjust: true, minWidth: 120 },
            { id: "varchar_256_", header: [{ text: "Options", css: { "text-align": "center" } }, { content: "serverFilter" }], sort: "server", options: [{ id: "SC", value: "生产制造部" }, { id: "WZ", value: "物资采购部" }, { id: "RL", value: "人力资源部" }], adjust: true, minWidth: 100 },
            { id: "varchar_4096_", header: { text: "Popup", css: { "text-align": "center" } }, editor: "popup", sort: "server", minWidth: 240, maxWidth: 480 },
            { id: "varchar_1_", header: { text: "Combo", css: { "text-align": "center" } }, editor: "combo", options: "/api/sys/dict_items?kind_code=user_sex", css: { "text-align": "center" }, adjust: true, minWidth: 80 },
            { id: "varchar_2_", header: { text: "Rich Select", css: { "text-align": "center" } }, editor: "richselect", options: "/api/sys/dict_items?kind_code=user_sex", css: { "text-align": "center" }, adjust: true, minWidth: 80 },
            { id: "varchar_3_", header: { text: "Checkbox Editable", css: { "text-align": "center" } }, template: "{common.checkbox()}", checkValue: "Yes", uncheckValue: "No", tooltip: false, css: { "text-align": "center" }, adjust: true, minWidth: 80 },
            {
                id: "varchar_4_", header: { text: "Checkbox Readonly", css: { "text-align": "center" } }, template: function (obj, common, value, config) {
                    if (value == config.checkValue) {
                        return "<span class='webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />"
                    }

                    return "<span class='webix_icon mdi mdi-checkbox-blank-outline' />"
                }, checkValue: "Yes", uncheckValue: "No", tooltip: false, css: { "text-align": "center" }, adjust: true, minWidth: 80
            },
            {
                id: "int_", header: { text: "Integer", css: { "text-align": "center" } }, editor: "text",
                format: utils.formats.int.format,
                editParse: utils.formats.int.editParse,
                editFormat: utils.formats.int.editFormat,
                css: { "text-align": "right" }, adjust: true, minWidth: 100
            },
            {
                id: "numeric_13_2_", header: { text: "Numeric(13,2)", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 100
            },
            {
                id: "numeric_18_4_", header: { text: "Numeric(18,4)", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 4),
                editParse: (value) => utils.formats.number.editParse(value, 4),
                editFormat: (value) => utils.formats.number.editFormat(value, 4),
                css: { "text-align": "right" }, adjust: true, minWidth: 100
            },
            {
                id: "numeric_1_", header: { text: "Numeric Price(13,2)", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.price.format(value, 2),
                editParse: (value) => utils.formats.price.editParse(value, 2),
                editFormat: (value) => utils.formats.price.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true
            },
            {
                id: "date_", header: { text: "Date", css: { "text-align": "center" } }, editor: "date",
                format: utils.formats.date.format,
                editParse: utils.formats.date.editParse,
                editFormat: utils.formats.date.editFormat,
                css: { "text-align": "center" }, width: 80
            },
            { id: "create_at_", header: { text: "Date Readonly", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, adjust: true, minWidth: 80 },
            { id: "update_at_", header: { text: "DateTime Readonly", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, adjust: true, minWidth: 160 },
            {
                id: "buttons",
                width: 120,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="复制" type="button" class="button_copy webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_primary_icon mdi mdi-18px mdi-file-multiple"/> </button>
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`,
                minWidth: 120,
            }
        ],
        ready() {
            var self = this;

            // ⭐️ 解决数据不在列中，当编辑后未改变内容时，请求服务端的问题
            this.attachEvent("onBeforeEditStart", function (cell) {
                var row = this.getItem(cell.row);
                if (!_.has(row, cell.column)) {
                    row[cell.column] = "";
                    webix.dp(this).ignore(function () { self.updateItem(cell.row, row); });
                }
            });

            // 添加记录后触发事件
            this.attachEvent("onAfterAdd", function (id, index) {
                // this.hideOverlay();

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
                // if (!this.count()) {
                //     this.showOverlay("无检索数据");
                //     return;
                // }

                // 选择删除记录行附近的数据行
                if (this.config.select) {
                    var select_index = delete_index;
                    if (this.count() < delete_index + 1) {
                        select_index = this.count() - 1;
                    }

                    if (select_index >= 0) {
                        var select_id = this.getIdByIndex(select_index);
                        if (select_id) {
                            this.select(select_id);
                        }
                    }
                }
            });

            // 加载前
            this.attachEvent("onBeforeLoad", function () {
                // console.log("onBeforeLoad");
                this.showOverlay("数据加载中...");
                return true;
            })

            // 加载后
            this.attachEvent("onAfterLoad", function () {
                // console.log("onAfterLoad");
                this.hideOverlay();
                if (!this.count()) {
                    this.showOverlay("无检索数据");
                    return;
                }

                var first = this.getFirstId();
                if (this.config.select && first) {
                    this.select(first);
                }
            })

            this.attachEvent("onDataRequest", function (start, count, callback, url) {
                // console.log("onDataRequest", start, count, callback, url)
            })

            // 选择记录行或单元格后触发
            this.attachEvent("onAfterSelect", function (selection, preserve) {
                // console.log("onAfterSelect 2", selection, preserve);
            });

            // 默认选择第1条记录
            var first = this.getFirstId();
            if (this.config.select && first) {
                this.select(first);
            }

            if (!_.isEmpty(this.config.url) && _.isEmpty(this.config.data)) {
                this.showOverlay("数据加载中...");
            }
        },
        onClick: {
            button_copy: function (e, item) {
                var row = this.getItem(item.row);
                this.add(_.extend({}, row, { id: null }), row.index - 1);
            },
            button_remove: function (e, item) {
                var id = item.row;
                if (!id) return;

                // 执行删除
                var self = this;
                webix.message({ type: "confirm-error", title: "系统提示", text: "是否删除当前记录？" })
                    .then(function (res) {
                        var url = self.config.save.url;
                        if (url) {
                            // 提交服务端删除
                            webix.ajax()
                                .post(url, { "id": id, "operation": "delete" })
                                .then((res) => { webix.dp(self).ignore(function () { self.remove(id); }) });
                        } else {
                            // 客户端直接移除记录
                            self.remove(id);
                        }
                    });
            },
        },
        on: {
            "data->onStoreUpdated"() { this.data.each((obj, i) => { obj.index = i + 1 }) },
            onAfterRender(data) {
                if (data.count() < 1) {
                    this.showOverlay("无检索数据");
                } else {
                    this.hideOverlay();
                }
            }
        },
        styles: {
            cellTextColor: function (row) { }
        },
        actions: {
            hideColumn(column, hide) {
                /* {column: String, hide: Boolean }*/
                if (hide && $$(datatable_id).isColumnVisible(column)) {
                    $$(datatable_id).hideColumn(column);
                }

                if (!hide && !$$(datatable_id).isColumnVisible(column)) {
                    $$(datatable_id).showColumn(column);
                }
            },
            add(opts) {
                /* {id: String, label: String, callback: function(){ return Object } }*/
                opts = opts || {};
                opts.id = opts.id || utils.UUID();

                return {
                    id: opts["id"], view: "button", label: opts["label"] || "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                    click() {
                        var row = opts["callback"] ? opts["callback"]() : {};
                        $$(datatable_id).add(row, 0);
                    }
                };
            },
            remove(opts) {
                /* {id: String, label: String, callback: function(){ return Array<String>|String } }*/
                opts = opts || {};
                opts.id = opts.id || utils.UUID();

                return {
                    id: opts["id"], view: "button", label: opts["label"] || "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                    click() {
                        var datatable = $$(datatable_id);
                        var id = opts["callback"] ? opts["callback"]() : datatable.getSelectedId(true, true);

                        // 支持批量删除
                        id = !_.isArray(id) ? [id] : id;
                        var text = "总共选择" + _.size(id) + "条记录，是否删除这些记录 ?";
                        if (_.size(id) === 1) {
                            text = "是否删除第" + (datatable.getIndexById(_.head(id)) + 1) + "条记录？";
                        }

                        // 执行删除
                        webix.message({ type: "confirm-error", title: "系统提示", text: text })
                            .then(() => {
                                var url = datatable.config.save.url;
                                if (url) {
                                    // 提交服务端删除
                                    webix.ajax()
                                        .post(url, { "id": id, "operation": "delete" })
                                        .then((res) => {
                                            webix.dp(datatable).ignore(() => datatable.remove(res.json()["id"] || id));
                                        });
                                } else {
                                    // 客户端直接移除记录
                                    datatable.remove(id);
                                }
                            })
                    }
                };
            },
            refresh() {
                return {
                    view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                    click() {
                        var datatable = $$(datatable_id);
                        datatable.editCancel();

                        var params = {};
                        var state = datatable.getState();
                        console.log(state);

                        // 保持原有的数据排序状态
                        if (state.sort) {
                            var sorts = _.isArray(state.sort) ? state.sort : [state.sort];
                            _.forEach(sorts, (src) => { src["id"] && (params["sort[" + src["id"] + "]"] = src["dir"]) });
                        }

                        // 保持原有的数据过滤状态
                        if (state.filter) {
                            _.forEach(state.filter, (v, k) => { params["filter[" + k + "]"] = v });
                        }

                        // 由于可能分页，清除后，客户端丢失已分页数据，将产生重复请求，需要设置 clearAll 的参数为true
                        datatable.clearAll(true);
                        setTimeout(() => {
                            datatable.load(() => webix.ajax(datatable.config.url, params));
                        }, 50);
                    }
                }
            },
            search(opts) {
                // 执行的是服务端检索
                /* {id: String, label: String, placeholder: String, fields: String, width: Number }*/
                opts = opts || {};
                opts.id = opts.id || utils.UUID();

                var search = function () {
                    var url = $$(datatable_id).config.url;
                    if (_.isEmpty(url)) return;

                    $$(datatable_id).clearAll();
                    $$(datatable_id).load(url + "&full_filter[" + opts["fields"] + "]=" + this.getValue(), "json", () => { }, true)
                }

                return {
                    id: opts.id, view: "search", label: opts["label"] || "", labelAlign: "right", align: "center", placeholder: opts["placeholder"] || "请输入搜索内容", width: opts["width"] ? opts["width"] : null,
                    on: { onEnter: search, onSearchIconClick: search }
                };
            },
            filter(opts) {
                // 执行的是客户端过滤
                /* {id: String, placeholder: String, fields: String }*/
                opts = opts || {};
                opts.id = opts.id || utils.UUID();

                return {
                    id: opts.id, view: "text", placeholder: opts["placeholder"], clear: true, on: {
                        onChange() {
                            var fields = opts["fields"].split(",")
                            $$(datatable_id).filter((row) => (_.values(_.pick(row, ...fields)).join("|").indexOf($$(opts.id).getValue()) >= 0));

                            // 没有符合条件的数据
                            if (!$$(datatable_id).count()) {
                                $$(datatable_id).showOverlay("没有找到符合条件的数据");
                            } else {
                                $$(datatable_id).hideOverlay();
                                $$(datatable_id).select($$(datatable_id).getFirstId());
                            }
                        }
                    }
                };
            }
        },
    };

    // 扩展onClick事件
    options["on"] = _.extend(_options["on"], options["on"]);
    options["onClick"] = _.extend(_options["onClick"], options["onClick"]);

    // 为数据单元格添加颜色样式
    if (_.has(options["styles"], "cellTextColor")) {
        var fn = _.get(options["styles"], "cellTextColor");

        _.each(options.columns, function (column) {
            if (column["id"] === "buttons") {
                return;
            }

            var tpl = column["template"];

            // 单选框
            if (_.isString(tpl) && tpl.indexOf("common.checkbox") >= 0) {
                return;
            }

            // 函数
            if (_.isFunction(tpl)) {
                return
            }

            var opts = column["options"];

            column.template = function (row) {
                var value = row[column["id"]] || "";
                if (_.size(opts) > 0) {
                    var find = _.find(opts, { "id": value });
                    if (find) {
                        value = find["value"];
                    }
                } else if (_.size(tpl) > 0) {
                    value = webix.template(tpl)(row);
                }

                var color = fn(row, column["id"]);
                if (!_.isEmpty(color)) {
                    return "<span style='color:" + color + ";'>" + value + "</span>";
                }

                return value;
            }
        })
    }

    // 如果用户未提供保存的配置，那么默认就是不需要提交服务端
    options["save"] = options["save"] || {};

    return _.extend(_options, options, { view: "datatable" });
}

export { datatable };