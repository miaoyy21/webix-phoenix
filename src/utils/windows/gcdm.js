
// 默认状态
const DefaultOptions = { multiple: false, cache: true, checked: [], filter: (row) => true, callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_gcdm",

    filter_id: "phoenix_utils_windows_gcdm_filter",
    filter_placeholder: "请输入项目编号或项目名称等",

    grid_id: "phoenix_utils_windows_gcdm_grid",

    toolbar_checked_id: "phoenix_utils_windows_gcdm_toolbar_checked",
    checked_id: "phoenix_utils_windows_gcdm_checked",

    // 状态设置
    options: DefaultOptions,
}

// 刷新
instance.reload = function () {
    var request = webix.ajax().sync().get("/api/sys/data_service?service=JZMD_GCDM.query");

    // 根据条件进行数据筛选
    var data = _.filter(JSON.parse(request.responseText)["data"], (row) => instance.options.filter(row));

    // 设置选中状态
    $$(instance.grid_id).clearAll();

    var rows = _.map(data, (row) => _.extend(row, { "checked": _.findIndex(instance.options.checked, (obj) => row["gcbh"] == obj["gcbh"]) >= 0 }));
    $$(instance.grid_id).define("data", rows)
    $$(instance.grid_id).refresh();

    // 默认选中第1个可选用户
    if ($$(instance.grid_id).select && $$(instance.grid_id).getFirstId()) {
        $$(instance.grid_id).select($$(instance.grid_id).getFirstId());
    }

    // 是否根据条件过滤用户
    if ($$(instance.filter_id).getValue()) {
        instance.filter();
    }

    // 设置已选用户
    $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "gcmc").join(","));
}

// 过滤
instance.filter = function () {
    $$(instance.grid_id).filter((row) => ((row["gcbh"] || "") + "|" + (row["gcmc"] || "") + "|" + (row["cpxh"] || "")
        + "|" + (row["xmlb"] || "") + "|" + (row["xmlx"] || "") + "|" + (row["xmsx"] || "")
        + "|" + (row["xmfzr"] || "") + "|" + (row["xmzg"] || ""))
        .indexOf($$(instance.filter_id).getValue()) >= 0);

    // 没有符合条件的数据
    if (!$$(instance.grid_id).count()) {
        $$(instance.grid_id).showOverlay("没有找到符合条件的数据");
    } else {
        $$(instance.grid_id).hideOverlay();

        // 默认选中第1个可选用户
        if ($$(instance.grid_id).select) {
            $$(instance.grid_id).select($$(instance.grid_id).getFirstId());
        }
    }
}

// 确定
instance.ok = function () {
    var checked = instance.options.checked;
    if (!instance.options.multiple) {
        checked = $$(instance.grid_id).getSelectedItem(false);
    }

    // 回调成功，隐藏对话框
    if (instance.options.callback(checked)) {
        instance.options = _.extend({}, DefaultOptions);

        $$(instance.window_id).hide();
    }
}

webix.ui({
    id: instance.window_id,
    view: "window",
    modal: true,
    close: true,
    move: true,
    height: 420,
    width: 640,
    headHeight: 38,
    position: "center",
    head: "选择项目",
    body: {
        paddingX: 12,
        rows: [
            {
                rows: [
                    { id: instance.filter_id, view: "text", placeholder: instance.filter_placeholder, clear: true, on: { onChange: instance.filter } },
                    {
                        id: instance.grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        multiselect: true,
                        headerRowHeight: 35,
                        rowHeight: 28,
                        checkboxRefresh: true,
                        data: [],
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            {
                                id: "checked", header: { text: "选择", css: { "text-align": "center" } }, css: { "text-align": "center" },
                                template(obj, common, value) {
                                    if (value) {
                                        return "<span class='webix_table_checkbox checked webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />";
                                    }

                                    return "<span class='webix_table_checkbox notchecked webix_icon mdi mdi-checkbox-blank-outline'/>";
                                }, width: 50
                            },
                            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 160 },
                            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 200 },
                            { id: "xmlb", header: { text: "项目类别", css: { "text-align": "center" } }, width: 120 },
                            { id: "xmlx", header: { text: "项目类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                            { id: "xmsx", header: { text: "项目属性", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                            { id: "xmfzr", header: { text: "项目负责人", css: { "text-align": "center" } }, width: 240 },
                            { id: "xmzg", header: { text: "项目主管", css: { "text-align": "center" } }, width: 240 },
                        ],
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
                            },
                            onCheck(id, col, value) {
                                var row = this.getItem(id);
                                if (!row) return;

                                if (value) {
                                    instance.options.checked.push(row);
                                } else {
                                    instance.options.checked =
                                        _.reject(instance.options.checked, (user) => user["gcbh"] === row["gcbh"]);
                                }

                                $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "gcmc").join(","));
                            }
                        }
                    },
                ]
            },
            {
                id: instance.toolbar_checked_id,
                view: "toolbar",
                height: 38,
                cols: [
                    { id: instance.checked_id, view: "text", label: "已选项目", labelAlign: "right", readonly: true, placeholder: "请选择项目..." },
                ]
            },
            {
                cols: [
                    { width: 8 },
                    { view: "button", label: "刷新", minWidth: 88, autowidth: true, css: "webix_transparent", click: () => instance.reload() },
                    {},
                    { view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary", click: instance.ok },
                    { width: 8 }
                ]
            },
            { height: 8 }
        ]
    }
})

/*
    {
        multiple    可选    是否启用多选，默认单选
        cache       可选    是否开启缓存数据，默认开启
        filter      可选    筛选数据回调函数
        checked     可选    已选用户ID，[{"gcbh":"项目编号","gcmc":"项目名称"}, ...]
        callback    必须    点击确定的回调函数
    }
*/
export function gcdm(options) {

    // 参数配置
    instance.options = _.extend({}, DefaultOptions, options);

    // 返回数组格式
    if (_.isEmpty(instance.options.checked)) {
        instance.options.checked = [];
    } else if (!_.isArray(instance.options.checked)) {
        console.error(`checked must be a Array, like [{"gcbh":"项目编号","gcmc":"项目名称"}, ...]`)
        return
    } else {
        instance.options.checked = _.reject(instance.options.checked, (o) => _.isEmpty(o.id));
    }

    // 是否多选
    if (instance.options.multiple) {
        if (!$$(instance.grid_id).isColumnVisible("checked")) {
            $$(instance.grid_id).showColumn("checked");
        }

        $$(instance.grid_id).define({ select: false });
        $$(instance.toolbar_checked_id).show();
    } else {
        if ($$(instance.grid_id).isColumnVisible("checked")) {
            $$(instance.grid_id).hideColumn("checked");
        }

        $$(instance.grid_id).define({ select: "row" });
        $$(instance.toolbar_checked_id).hide();
    }
    $$(instance.grid_id).refresh();

    // 如果未设置缓存，或者无数据，那么执行刷新
    if (!instance.options.cache || $$(instance.grid_id).count() < 1) {
        instance.reload();
    } else {
        // 重新设置用户选中状态
        $$(instance.grid_id).eachRow(
            function (id) {
                var row = this.getItem(id);
                row.checked = _.findIndex(instance.options.checked, (obj) => row["gcbh"] == obj["gcbh"]) >= 0;

                this.updateItem(id, row);
            }, true);

        // 设置已选用户
        $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "gcmc").join(","));
    }

    $$(instance.window_id).show();
}