
// 默认状态
const DefaultOptions = { multiple: false, threeState: false, cache: true, callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_depts",

    filter_id: "phoenix_utils_windows_depts_filter",
    filter_placeholder: "请输入部门名称",

    tree_id: "phoenix_utils_windows_depts_tree",
    checked: "phoenix_utils_windows_depts_checked",

    // 状态设置
    options: DefaultOptions
}

// 刷新
instance.reload = function (callback) {
    $$(instance.tree_id).clearAll();
    utils.tree.builder($$(instance.tree_id), "/api/sys/departs", callback);
}

// 过滤
instance.filter = function () {
    $$(instance.tree_id).filter("#name_#", $$(instance.filter_id).getValue());

    // 没有符合条件的数据
    var overlayBox = webix.extend($$(instance.tree_id), webix.OverlayBox);
    if (!$$(instance.tree_id).count()) {
        overlayBox.showOverlay("没有找到符合条件的数据");
    } else {
        overlayBox.hideOverlay();
    }
}

// 确定
instance.ok = function () {

    // 根据单选与多选返回数据
    var checked = {};
    if (!instance.options.multiple) {
        checked = $$(instance.tree_id).getSelectedItem();
    } else {
        checked = _.map($$(instance.tree_id).getChecked(), (id) => $$(instance.tree_id).getItem(id));
    }

    // 默认存储状态
    webix.storage.local.put(instance.checked, checked);

    // 回调成功，隐藏对话框
    if (instance.options.callback(checked)) {
        $$(instance.window_id).hide();
    }
}

// 设定状态：根据选择的节点，自动展开；清空过滤
instance.initState = function (checked) {
    $$(instance.tree_id).closeAll();
    $$(instance.tree_id).uncheckAll();

    _.each(checked, (id) => {
        var path = utils.tree.path($$(instance.tree_id), id);

        // 展开父级节点
        _.forEach(path, (pid) => $$(instance.tree_id).open(pid, true));
        if (!instance.options.multiple) {
            $$(instance.tree_id).select(id);
        } else {
            $$(instance.tree_id).checkItem(id);
        }
    })

    // 清空过滤
    $$(instance.filter_id).setValue();
    $$(instance.tree_id).filter();

    // 没有符合条件的数据
    var overlayBox = webix.extend($$(instance.tree_id), webix.OverlayBox);
    if (!$$(instance.tree_id).count()) {
        overlayBox.showOverlay("没有找到符合条件的数据");
    } else {
        overlayBox.hideOverlay();
    }
}

webix.ui({
    id: instance.window_id,
    view: "window",
    modal: true,
    close: true,
    move: true,
    height: 420,
    width: 560,
    headHeight: 40,
    position: "center",
    head: "选择部门",
    body: {
        paddingX: 12,
        cols: [
            { width: 1 },
            {
                rows: [
                    { id: instance.filter_id, view: "text", placeholder: instance.filter_placeholder, clear: true, on: { onChange: instance.filter } },
                    {
                        id: instance.tree_id,
                        view: "tree",
                        filterMode: {
                            showSubItems: false
                        },
                        paddingX: 24,
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
                            },
                        }
                    },
                    { height: 8, css: { "border-top": "none" } },
                    {
                        cols: [
                            { width: 8 },
                            { view: "button", label: "刷新", minWidth: 88, autowidth: true, css: "webix_transparent", click: () => instance.reload(() => instance.initState(instance.options.checked)) },
                            {},
                            { view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary", click: instance.ok },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            { width: 1 }
        ]
    }
})


/*
    {
        multiple    可选    是否启用多选，默认单选
        threeState  可选    是否为级联选择
        cache       可选    是否开启缓存数据，默认开启
        checked     可选    已选部门ID，["depart's id", ...] 或者 id1,id2,...
        callback    必须    点击确定的回调函数
    }
*/
export function departs(options) {

    // 参数配置
    _.extend(instance.options, DefaultOptions, options);
    if (!_.isArray(instance.options.checked)) {
        if (_.isString(instance.options.checked)) {
            instance.options.checked = instance.options.checked.split(",");
        } else if (_.isEmpty(instance.options.checked)) {
            instance.options.checked = [];
        } else {
            console.error(`checked must be a Array or String, like ["depart's id", ...] or id1,id2,...`);
            return
        }
    }

    // 改变样式
    $$(instance.tree_id).define({
        select: !instance.options.multiple,
        threeState: instance.options.threeState,
        "template": "{common.icon()} " + (instance.options.multiple ? "{common.checkbox()}" : "{common.icons()}") + " #name_#"
    });
    $$(instance.tree_id).refresh();

    // 获取状态
    var checked = instance.options.checked;
    if (!checked) {
        checked = webix.storage.local.get(instance.checked);
        if (!checked) {
            checked = [];
        }
    }

    // 如果未设置缓存，或者无数据，那么执行刷新
    if (!instance.options.cache || $$(instance.tree_id).count() < 1) {
        instance.reload(() => instance.initState(checked));
    } else {
        instance.initState(checked);
    }

    $$(instance.window_id).show();
}