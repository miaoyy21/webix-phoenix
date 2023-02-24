
// DataTable 列配置
function show(options) {
    var window_id = utils.UUID();
    var grid_id = utils.UUID();

    /****************** column 属性 ******************/

    // val.id               : string
    // val.hidden           : string true false

    // header.text      : string
    // header.align     : string left center right
    // header.filter    : string textFilter disable

    // val.editor           : string text password checkbox richselect combo date popup disable
    // val.checkValue       : string
    // val.uncheckValue     : string

    // val.sort         : string int string disable
    // val.math         : string
    // val.format       : string int number price date datetime disable
    // val.decimal.size : string 1
    // val.options      : string

    // val.align        : string left center right
    // val.resize       : string true false
    // val.fillspace    : string true false
    // val.adjust       : string data header true disbale
    // val.width        : string 1
    // val.minWidth     : string 1
    // val.maxWidth     : string 1

    webix.ui({
        id: window_id,
        view: "window",
        close: true,
        modal: true,
        head: "字段配置",
        position: "center",
        fullscreen: true,
        body: {
            rows: [
                {
                    view: "toolbar",
                    cols: [
                        {
                            view: "button", label: "添加", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                            click() {
                                $$(grid_id).add({ "val.hidden": "false", "header.align": "center", "header.filter": "disable", "val.align": "left", "val.resize": "false", "val.sort": "disable", "val.adjust": "true" }, 0);
                            }
                        },
                        {
                            view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                            click() {
                                var id = $$(grid_id).getSelectedId(true, true);
                                if (!id) return;

                                webix.message({ type: "confirm-error", title: "系统提示", text: "是否删除选中的记录？" })
                                    .then((res) => { $$(grid_id).remove(id); })
                            }
                        },
                    ]
                },
                {
                    id: grid_id,
                    view: "datatable",
                    css: "webix_data_border webix_header_border",
                    editable: true,
                    select: "row",
                    multiselect: true,
                    drag: "order",
                    data: options.columns,
                    tooltip: true,
                    leftSplit: 3,
                    columns: [
                        { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                        { id: "val.id", header: { text: "字段", css: { "text-align": "center" } }, editor: "text", width: 100 },
                        { id: "header.text", header: { text: "显示名称", css: { "text-align": "center" } }, editor: "text", width: 100 },
                        { id: "val.hidden", header: { text: "隐藏", css: { "text-align": "center" } }, checkValue: "true", uncheckValue: "false", template: "{common.checkbox()}", css: { "text-align": "center" }, width: 80 },
                        { id: "header.align", header: { text: "页眉对齐", css: { "text-align": "center" } }, editor: "richselect", options: { "left": "左对齐", "center": "居中", "right": "右对齐" }, css: { "text-align": "center" }, width: 100 },
                        { id: "header.filter", header: { text: "过滤器", css: { "text-align": "center" } }, editor: "richselect", options: { "disable": "", "textFilter": "文本过滤器" }, css: { "text-align": "center" }, width: 80 },
                        { id: "val.editor", header: { text: "编辑器", css: { "text-align": "center" } }, editor: "richselect", options: { "disable": "", "text": "文本框", "password": "密码框", "checkbox": "单选框", "richselect": "下拉框[不可编辑]", "combo": "下拉框[可编辑]", "date": "时间", "popup": "弹出框" }, css: { "text-align": "center" }, width: 120 },
                        { id: "val.checkValue", header: { text: "选中值", css: { "text-align": "center" } }, editor: "text", width: 80 },
                        { id: "val.uncheckValue", header: { text: "未选中值", css: { "text-align": "center" } }, editor: "text", width: 80 },
                        { id: "val.sort", header: { text: "排序", css: { "text-align": "center" } }, editor: "richselect", options: { "disable": "", "int": "数值", "string": "字符串" }, css: { "text-align": "center" }, width: 80 },
                        { id: "val.math", header: { text: "数学表达式", css: { "text-align": "center" } }, editor: "text", width: 240 },
                        { id: "val.format", header: { text: "格式化", css: { "text-align": "center" } }, editor: "richselect", options: { "disable": "", "int": "整数", "number": "浮点数", "price": "货币", "date": "日期", "datetime": "日期时间" }, css: { "text-align": "center" }, width: 80 },
                        { id: "val.decimal.size", header: { text: "小数位数", css: { "text-align": "center" } }, editor: "text", format: utils.formats["int"].format, editParse: utils.formats["int"].editParse, editFormat: utils.formats["int"].editFormat, css: { "text-align": "right" }, width: 80 },
                        { id: "val.options", header: { text: "下拉框数据源", css: { "text-align": "center" } }, editor: "text", width: 360 },/** data header true disbale ***/
                        { id: "val.align", header: { text: "单元格对齐", css: { "text-align": "center" } }, editor: "richselect", options: { "left": "左对齐", "center": "居中", "right": "右对齐" }, css: { "text-align": "center" }, width: 100 },
                        { id: "val.resize", header: { text: "可调整宽度", css: { "text-align": "center" } }, checkValue: "true", uncheckValue: "false", template: "{common.checkbox()}", css: { "text-align": "center" }, width: 100 },
                        { id: "val.fillspace", header: { text: "自填充宽度", css: { "text-align": "center" } }, checkValue: "true", uncheckValue: "false", template: "{common.checkbox()}", css: { "text-align": "center" }, width: 100 },
                        { id: "val.adjust", header: { text: "自适应宽度", css: { "text-align": "center" } }, editor: "richselect", options: { "disable": "", "data": "单元格", "header": "页眉", "true": "全部" }, css: { "text-align": "center" }, width: 100 },
                        { id: "val.width", header: { text: "固定宽度", css: { "text-align": "center" } }, editor: "text", format: utils.formats["int"].format, editParse: utils.formats["int"].editParse, editFormat: utils.formats["int"].editFormat, css: { "text-align": "right" }, width: 80 },
                        { id: "val.minWidth", header: { text: "最小宽度", css: { "text-align": "center" } }, editor: "text", format: utils.formats["int"].format, editParse: utils.formats["int"].editParse, editFormat: utils.formats["int"].editFormat, css: { "text-align": "right" }, width: 80 },
                        { id: "val.maxWidth", header: { text: "最大宽度", css: { "text-align": "center" } }, editor: "text", format: utils.formats["int"].format, editParse: utils.formats["int"].editParse, editFormat: utils.formats["int"].editFormat, css: { "text-align": "right" }, width: 80 },
                        { id: "val.maxWidth", header: { text: "最大宽度", css: { "text-align": "center" } }, editor: "text", format: utils.formats["int"].format, editParse: utils.formats["int"].editParse, editFormat: utils.formats["int"].editFormat, css: { "text-align": "right" }, width: 80 },
                    ],
                    rules: {
                        "val.id": webix.rules.isNotEmpty,
                    },
                    on: {
                        "data->onStoreUpdated": function () {
                            this.data.each(function (obj, i) {
                                obj.index = i + 1;
                            })
                        },
                    }
                },
                { height: 8, css: { "border-top": "none" } },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", label: "同步", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-cloud-sync",
                            click() {
                                var rows = {};
                                $$(grid_id).eachRow((id) => {
                                    var row = $$(grid_id).getItem(id);
                                    rows[row["val.id"]] = row;
                                });

                                var res = JSON.parse(webix.ajax().sync().get(options.url, { "is_parse_columns": true }).responseText);
                                _.forEach(res["columns"], (col) => {
                                    if (!_.has(rows, col["val.id"])) {
                                        $$(grid_id).add(col, 0);
                                    }
                                });
                            }
                        },
                        { gravity: 2 },
                        {
                            view: "button", label: "确定", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-check",
                            click() {
                                var rows = [];

                                // 按照排序顺序获取所有的字段配置
                                $$(grid_id).eachRow(function (id) {
                                    var row = $$(grid_id).getItem(id);

                                    // 必须移除id，否则字段名称会闪现ID的情况
                                    delete row["id"];
                                    delete row["index"];
                                    rows.push(row);
                                });

                                options.callback(rows);
                                $$(window_id).hide();
                            }
                        },
                        {}
                    ]
                },
                { height: 8 }
            ],
        },
        on: {
            onHide() {
                this.close();
            }
        }
    }).show();
}

export { show };