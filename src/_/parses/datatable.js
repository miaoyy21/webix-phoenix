var datatable = {};

// 基本属性
datatable.options = function (options) {
    _.forEach(options, function (value, key) {
        if (value === "true") {
            options[key] = true
        } else if (value === "false") {
            options[key] = false
        }

        // 需要转换为int的列
        switch (key) {
            case "headerRowHeight":
            case "rowHeight":
            case "columnWidth":
            case "leftSplit":
            case "rightSplit":
            case "topSplit":
                options[key] = Number(value);
                break
            default:
            // ...
        }
    });


    // 检索服务URL的特殊处理
    if (!options.url) {
        delete options.url
    } else if (_.indexOf(options.url, "/") < 0) {
        if (_.indexOf(options.url, ".") < 0) {
            // 数据字典
            options.url = "/api/sys/dict_items?kind_code=" + options.url;
        } else {
            // 数据服务
            options.url = "/api/sys/data_service?service=" + options.url;
        }
    }

    // 保存服务URL的特殊处理
    if (!options.save.url) {
        delete options.save.url
    } else if (_.indexOf(options.save.url, "/") < 0) {
        options.save.url = "/api/sys/data_service?service=" + options.save.url;
    }

    // 按钮
    options.onClick = {
        button_copy: function (e, item) {
            var row = this.getItem(item.row);

            this.add(_.extend({}, row, { id: null }), row.index);
        },
        button_delete: function (e, item) {
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
    }

    // 预置事件
    options.on = {
        "data->onStoreUpdated": function () {
            this.data.each(function (obj, i) {
                obj.index = i + 1;
            })
        },
        onBeforeLoad: function () {
            this.showOverlay("数据加载中...");
            return true;
        },
        onAfterLoad: function () {
            this.hideOverlay();
            if (!this.count()) {
                this.showOverlay("无检索数据");
                return;
            }
        },
    }

    return options;
}

// 字段属性
datatable.columns = function (options, editable) {

    var buttons = [];
    var columns = [];
    _.forEach(options, function (option) {
        var column = {};

        /******************* id *******************/
        if (_.size(option["val.id"]) > 0) {
            column["id"] = option["val.id"]

            // 按钮
            if (option["val.id"].substring(0, 7) === "button_" && option["val.hidden"] !== "true") {
                var id = option["val.id"];
                var tooltip = option["header.text"];
                var color = id.substring(id.length - 6) === "delete" ? "phoenix_danger_icon" : "phoenix_primary_icon";
                var icon = id.substring(id.length - 4) === "copy" ? "mdi-notebook-plus" : id.substring(id.length - 6) === "delete" ? "mdi-trash-can" : "mdi-checkbox-blank-circle-outline";

                buttons.push("<button webix_tooltip='" + tooltip + "' type='button' class='" + id + " webix_icon_button' style='height:30px;width:30px;'> <span class='" + color + " mdi mdi-18px " + icon + "'/> </button>");
                return;
            }
        }

        /******************* Hidden *******************/
        if (option["val.hidden"] === "true") {
            column["hidden"] = true
        }

        /******************* Header *******************/
        var header = {};

        // 页眉对齐方式
        if (_.size(option["header.align"]) > 0) {
            header["css"] = { "text-align": option["header.align"] };
        }

        // 页眉文本显示
        if (_.size(option["header.text"]) > 0) {
            header["text"] = option["header.text"];
        }

        // 是否显示过滤器
        if (_.size(option["header.filter"]) > 0 && option["header.filter"] !== "disable") {
            header = [header, { content: option["header.filter"] }];
        }

        column.header = header;

        /******************* Editor *******************/
        if (_.size(option["val.editor"]) > 0 && option["val.editor"] !== "disable") {
            // CheckBox的特殊处理
            if (option["val.editor"] === "checkbox") {

                // Check Value
                if (_.size(option["val.checkValue"]) > 0) {
                    column["checkValue"] = option["val.checkValue"]
                }

                // UnCheck Value
                if (_.size(option["val.uncheckValue"]) > 0) {
                    column["uncheckValue"] = option["val.uncheckValue"]
                }

                // 是否处于可编辑状态
                if (editable) {
                    column["template"] = "{common.checkbox()}"
                } else {
                    column["template"] = function (obj, common, value, config) {
                        if (value === config.checkValue) {
                            return "<span class='webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />"
                        }

                        return "<span class='webix_icon mdi mdi-checkbox-blank-outline' />"
                    }
                }
            } else {
                column["editor"] = option["val.editor"];
                if (option["val.editor"] === "password") {
                    column["template"] = "******";
                }
            }
        }

        /******************* Sort *******************/
        if (_.size(option["val.sort"]) > 0 && option["header.filter"] !== "disable") {
            column["sort"] = option["val.sort"];
        }

        /******************* Math *******************/
        if (_.size(option["val.math"]) > 0) {
            column["math"] = option["val.math"]
        }

        /******************* Format *******************/
        // text number price date datetime
        if (_.size(option["val.format"]) > 0 && option["val.format"] !== "disable") {
            var decimalSize = webix.i18n.decimalSize;
            var size = Number(option["val.decimal.size"]);
            if (size > 1) {
                decimalSize = size
            }

            column["format"] = function (value) { return utils.formats[option["val.format"]].format(value, decimalSize) };
            column["editParse"] = function (value) { return utils.formats[option["val.format"]].editParse(value, decimalSize) };
            column["editFormat"] = function (value) { return utils.formats[option["val.format"]].editFormat(value, decimalSize) };
        }

        /******************* Options *******************/
        if (_.size(option["val.options"]) > 0) {
            var opt = option["val.options"];
            if ((opt.substring(0, 1) === "[" && opt.substring(opt.length - 1) === "]") ||
                (opt.substring(0, 1) === "{" && opt.substring(opt.length - 1) === "}")) {
                column["options"] = JSON.parse(opt);
            } else {
                if (_.indexOf(opt, "/") < 0) {
                    if (_.indexOf(opt, ".") < 0) {
                        // 数据字典
                        column["options"] = "/api/sys/dict_items?kind_code=" + opt;
                    } else {
                        // 数据服务
                        column["options"] = "/api/sys/data_service?service=" + opt;
                    }
                } else {
                    column["options"] = opt;
                }
            }
        }

        /******************* Align *******************/
        if (_.size(option["val.align"]) > 0) {
            column["css"] = { "text-align": option["val.align"] };
        }

        /******************* Resize *******************/
        if (option["val.resize"] === "true") {
            column["resize"] = true;
        }

        /******************* FillSpace *******************/
        if (option["val.fillspace"] === "true") {
            column["fillspace"] = true;
        }

        /******************* Adjust MinWidth MaxWidth Width *******************/
        if (_.size(option["val.adjust"]) > 0 && option["val.adjust"] !== "disable") {
            if (option["val.adjust"] === "true") {
                column["adjust"] = true;
            } else {
                column["adjust"] = option["val.adjust"];
            }
        }

        var width = Number(option["val.width"]);
        if (width > 0) {
            column["width"] = width;
        }

        var minWidth = Number(option["val.minWidth"])
        if (minWidth > 0) {
            column["minWidth"] = minWidth;
        }

        var maxWidth = Number(option["val.maxWidth"]);
        if (maxWidth > 0) {
            column["maxWidth"] = maxWidth;
        }

        columns.push(column);
    })

    // 按钮显示
    if (_.size(buttons) > 0) {
        columns.push({
            id: "buttons",
            width: _.size(buttons) * 60,
            header: { text: "操作按钮", css: { "text-align": "center" } },
            tooltip: false,
            template: "<div class='webix_el_box' style='padding:0px; text-align:center'>" + buttons.join("") + "</div>",
            minWidth: 120,
        })
    }

    console.log(columns);

    return columns;
}

export { datatable };