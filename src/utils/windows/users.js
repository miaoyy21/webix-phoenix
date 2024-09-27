
import { icons } from "../etc/icons";

// 默认状态
const DefaultOptions = { title: "选择用户", multiple: false, cache: true, checked: [], filter: (departId, userId) => true, callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_users",

    filter_id: "phoenix_utils_windows_users_filter",
    filter_placeholder: "请输入工号或用户名",

    tree_id: "phoenix_utils_windows_users_tree",
    grid_id: "phoenix_utils_windows_users_grid",

    toolbar_checked_id: "phoenix_utils_windows_users_toolbar_checked",
    checked_id: "phoenix_utils_windows_users_checked",

    // 状态设置
    options: DefaultOptions
}

// 加载用户
instance.load = function (id) {
    var request = webix.ajax().sync().get("/api/sys/users", { "depart_id": id, scope: "SIMPLE" });

    // 根据条件进行数据筛选
    var users = JSON.parse(request.responseText);
    if (!instance.options.filter(id)) {
        users = _.filter(users, (user) => instance.options.filter(id, user["id"]));
    }

    // 设置选中状态
    $$(instance.grid_id).clearAll();

    var rows = _.map(users, (user) => _.extend(user, { "checked": _.findIndex(instance.options.checked, (obj) => user.id == obj.id) >= 0 }));


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
}

// 刷新
instance.reload = function (callback) {
    $$(instance.tree_id).clearAll();
    utils.tree.builder($$(instance.tree_id), "/api/sys/departs", callback);

    // 设置已选用户
    $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "user_name_").join(","));
}

// 过滤
instance.filter = function () {
    $$(instance.grid_id).filter((row) => ((row["user_code_"] || "") + "|" + (row["user_name_"] || "")).indexOf($$(instance.filter_id).getValue()) != -1);

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
    height: 480,
    width: 720,
    headHeight: 40,
    position: "center",
    head: instance.options["title"],
    body: {
        paddingX: 12,
        rows: [
            { height: 8 },
            {
                cols: [
                    { width: 1 },
                    {
                        view: "scrollview",
                        body: {
                            rows: [
                                { view: "label", label: "<span style='margin-left:8px'></span>组织架构", height: 38 },
                                {
                                    id: instance.tree_id,
                                    view: "tree",
                                    filterMode: {
                                        showSubItems: false
                                    },
                                    select: true,
                                    template: "{common.icon()} {common.icons()} <span>#name_#</span>",
                                    type: {
                                        icons: (obj) => utils.icons.departs.tree($$(instance.tree_id), obj)
                                    },
                                    on: {
                                        onBeforeLoad() {
                                            webix.extend(this, webix.ProgressBar).showProgress();
                                        },
                                        onAfterLoad() {
                                            webix.extend(this, webix.ProgressBar).hideProgress();

                                            var overlayBox = webix.extend(this, webix.OverlayBox)
                                            if (!this.count()) {
                                                overlayBox.showOverlay("无检索数据");
                                            } else {
                                                overlayBox.hideOverlay();
                                            }

                                            this.select(this.getFirstId());
                                        },
                                        onAfterSelect: (id) => instance.load(id),
                                    }
                                }
                            ]
                        },
                    },
                    {
                        gravity: 2,
                        rows: [
                            {
                                view: "toolbar",
                                height: 38,
                                cols: [
                                    { id: instance.filter_id, view: "text", placeholder: instance.filter_placeholder, clear: true, on: { onChange: instance.filter } }
                                ]
                            },
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
                                    { id: "user_code_", header: { text: "工号", css: { "text-align": "center" } }, css: { "text-align": "center" }, sort: "text", width: 100 },
                                    { id: "user_name_", header: { text: "用户名", css: { "text-align": "center" } }, sort: "text", fillspace: true },
                                    { id: "sex_", header: { text: "性别", css: { "text-align": "center" } }, template: icons.users["sex"], css: { "text-align": "center" }, sort: "text", width: 50 },
                                    { id: "is_depart_leader_", header: { text: "部门领导", css: { "text-align": "center" } }, template: icons.users["is_depart_leader"], css: { "text-align": "center" }, sort: "int", width: 80 },
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
                                                _.reject(instance.options.checked, (user) => user.id === id);
                                        }

                                        $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "user_name_").join(","));
                                    }
                                }
                            },
                        ]
                    },
                    { width: 1 }
                ]
            },
            {
                id: instance.toolbar_checked_id,
                view: "toolbar",
                height: 38,
                cols: [
                    { id: instance.checked_id, view: "text", label: "已选用户", labelAlign: "right", readonly: true, placeholder: "请选择用户..." },
                ]
            },
            {
                view: "toolbar",
                borderless: true,
                height: 34,
                cols: [
                    { width: 8 },
                    { view: "button", label: "刷新", minWidth: 88, autowidth: true, css: "webix_transparent", click: () => instance.reload(instance.filter) },
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
        checked     可选    已选用户ID，[{"id":"user's id","user_name_":"user's name"}, ...]
        callback    必须    点击确定的回调函数
    }
*/
export function users(options) {

    // 参数配置
    instance.options = _.extend({}, DefaultOptions, options);
    console.log(instance.options);

    // 返回数组格式
    if (_.isEmpty(instance.options.checked)) {
        instance.options.checked = [];
    } else if (!_.isArray(instance.options.checked)) {
        console.error(`checked must be a Array, like [{"id":"user's id","user_name_":"user's name"}, ...]`)
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
    if (!instance.options.cache || $$(instance.tree_id).count() < 1) {
        instance.reload();
    } else {
        // 重新设置用户选中状态
        $$(instance.grid_id).eachRow(
            function (id) {
                var row = this.getItem(id);
                row.checked = _.findIndex(instance.options.checked, (obj) => row.id == obj.id) >= 0;

                this.updateItem(id, row);
            }, true);

        // 设置已选用户
        $$(instance.checked_id).setValue(_.pluck(instance.options.checked, "user_name_").join(","));
    }

    $$(instance.window_id).show();
}