
// 默认状态
const DefaultOptions = { checked: [], callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_dicts",
    list_id: "phoenix_utils_windows_dicts_list",

    // 状态设置
    options: DefaultOptions,
}

// 刷新
instance.reload = function () {

    // 转换成列表能识别的格式
    $$(instance.list_id).parse(utils.dicts[instance.options.kind], "json", true);
}

// 确定
instance.ok = function () {
    var value = $$(instance.list_id).getValue();

    var checked = [];
    if (value) {
        // 按照固定顺序返回
        checked = _.filter(utils.dicts[instance.options.kind], (dict) => (_.findIndex(value.split(","), (id) => id == dict.id) >= 0))
    }

    // 回调成功，隐藏对话框
    if (instance.options.callback(checked)) {
        $$(instance.window_id).hide();
    }
}

webix.ui({
    id: instance.window_id,
    view: "window",
    modal: true,
    close: true,
    move: true,
    height: 360,
    width: 560,
    headHeight: 40,
    position: "center",
    head: "角色选择",
    body: {
        paddingX: 12,
        rows: [
            { height: 8 },
            {
                id: instance.list_id,
                view: "dbllist",
            },
            { height: 8 },
            {
                view: "toolbar",
                css: { "border-bottom": "none" },
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
    },
})

/*
    {
        kind        必须    数据字典分类
        checked     可选    已选角色ID，["role's id", ...] 或者 id1,id2,...
        callback    必须    点击确定的回调函数
    }
*/
export function dicts(options) {

    // 参数配置
    _.extend(instance.options, DefaultOptions, options);

    // 返回数组格式
    if (!_.isArray(instance.options.checked)) {
        if (_.isString(instance.options.checked)) {
            instance.options.checked = instance.options.checked.split(",");
        } else if (_.isEmpty(instance.options.checked)) {
            instance.options.checked = [];
        } else {
            console.error(`checked must be a Array or String, like ["role's id", ...] or id1,id2,...`);
            return
        }
    }

    // 如果未设置缓存，或者无数据，那么执行刷新
    if (!instance.options.cache || _.size($$(instance.list_id).config.data) < 1) {
        instance.reload();
    }
    $$(instance.list_id).setValue(instance.options.checked);

    $$(instance.window_id).show();
}