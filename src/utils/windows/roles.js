
// 默认状态
const DefaultOptions = { cache: true, checked: [], callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_roles",
    list_id: "phoenix_utils_windows_roles_list",

    // 状态设置
    options: DefaultOptions,
    data: [],
}

// 刷新
instance.reload = function (callback) {
    var request = webix.ajax().sync().get("/api/sys/roles", { scope: "SIMPLE" });
    var roles = JSON.parse(request.responseText);
    instance.data = roles;

    // 转换成列表能识别的格式
    var rows = _.map(roles, (role) => ({ "id": role.id, "value": role["name_"] }));
    $$(instance.list_id).parse(rows, "json", true);
}

// 确定
instance.ok = function () {
    var value = $$(instance.list_id).getValue();

    var checked = [];
    if (value) {
        checked = _.map(value.split(","), (id) => (_.find(instance.data, (row) => row.id == id)));
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
                labelBottomLeft: "系统角色",
                labelBottomRight: "已选角色",
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
        cache       可选    是否开启缓存数据，默认开启
        checked     可选    已选角色ID，["role's id", ...] 或者 id1,id2,...
        callback    必须    点击确定的回调函数
    }
*/
export function roles(options) {

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