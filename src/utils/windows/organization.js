
// 默认状态
const DefaultOptions = { multiple: false, callback: (select) => { } };

const instance = {
    window_id: "phoenix_utils_windows_organization",

    filter_id: "phoenix_utils_windows_organization_filter",
    filter_placeholder: "请输入组织名称",

    list_id: "phoenix_utils_windows_organization_list",
    pager_id: "phoenix_utils_windows_organization_pager",

    // 状态设置
    options: DefaultOptions
}

// 刷新
instance.reload = function () {
    $$(instance.filter_id).setValue();
    webix.extend($$(instance.list_id), webix.ProgressBar).showProgress();

    $$(instance.list_id).clearAll();
    var request = webix.ajax().sync().get("/api/sys/departs", { "scope": "ORGANIZATION" });
    var response = JSON.parse(request.responseText);

    $$(instance.list_id).define("data", response)
    $$(instance.list_id).refresh();

    webix.extend($$(instance.list_id), webix.ProgressBar).hideProgress();
    var overlayBox = webix.extend($$(instance.list_id), webix.OverlayBox);
    if (!$$(instance.list_id).count()) {
        overlayBox.showOverlay("无检索数据");
    } else {
        overlayBox.hideOverlay();
    }
}

// 过滤
instance.filter = function () {
    var value = $$(instance.filter_id).getValue().toLowerCase();
    $$(instance.list_id).filter((obj) => {
        return [obj["name_"], obj["parent_name_"]].join("|").toLowerCase().indexOf(value) !== -1;
    })

    var overlayBox = webix.extend($$(instance.list_id), webix.OverlayBox);
    if (!$$(instance.list_id).count()) {
        overlayBox.showOverlay("没有符合条件的数据");
    } else {
        overlayBox.hideOverlay();
        if (!instance.multiple) {
            console.log($$(instance.list_id).getFirstId());
            $$(instance.list_id).select($$(instance.list_id).getFirstId());
        }
    }
}

// 确定
instance.ok = function () {

    // 根据单选与多选返回数据
    var checked;
    if (!instance.options.multiple) {
        checked = $$(instance.list_id).getSelectedItem();
    } else {
        checked = [];
        $$(instance.list_id).data.each((item) => {
            if (item["checked"]) { checked.push(_.extend({}, item, { "checked": false })); }
        })
    }

    // 回调成功，隐藏对话框
    if (checked && instance.options.callback(checked)) {
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
    width: 560,
    headHeight: 40,
    position: "center",
    head: "组织选择",
    body: {
        rows: [
            {
                view: "toolbar",
                paddingX: 12,
                height: 38,
                cols: [
                    { id: instance.filter_id, view: "text", placeholder: instance.filter_placeholder, clear: true, on: { onChange: instance.filter } }
                ]
            },
            {
                id: instance.list_id,
                view: "unitlist",
                scroll: "auto",
                uniteBy: (obj) => obj["parent_name_"],
                pager: instance.pager_id,
                template(obj) {
                    var icon = "<span class='webix_icon mdi mdi-18px mdi-account-outline' style='margin:0px 8px'></span>";
                    if (obj["type_"] === "depart") {
                        icon = "<span class='webix_icon mdi mdi-18px mdi-newspaper-variant-multiple-outline' style='margin:0px 8px'></span>";
                    }


                    if (obj["checked"]) {
                        return (instance.options.multiple ? "<span class='webix_icon phoenix_primary_icon mdi mdi-18px mdi-checkbox-marked checkbox_icon'></span>  " : "") + icon + obj["name_"];
                    }

                    return (instance.options.multiple ? "<span class='webix_icon mdi mdi-18px mdi-checkbox-blank-outline checkbox_icon'></span> " : "") + icon + obj["name_"];
                },
                onClick: {
                    "checkbox_icon"(event, id) {
                        var item = this.getItem(id);

                        item["checked"] = !item["checked"];
                        this.updateItem(id, item)
                    }
                },
            },
            {
                cols: [
                    {
                        id: instance.pager_id,
                        view: "pager",
                        template: function (obj, common) {
                            var master = $$(obj.id).$master;
                            if (master.count()) {
                                return common.first(obj) + common.prev(obj) + common.pages(obj) + common.next(obj) + common.last(obj)
                                    + "  当前在 " + common.page(obj) + "页/" + obj.limit + "页，总共 " + webix.i18n.intFormat(obj.count) + "条记录。";
                            } else {
                                return "  总共 0条记录"
                            }
                        },
                        size: 20
                    }
                ]
            },
            { height: 8, css: { "border-top": "none" } },
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
        filter      可选    过滤文本
        multiple    可选    是否启用多选，默认单选
        callback    必须    点击确定的回调函数
    }
*/
export function organization(options) {

    // 参数配置
    _.extend(instance.options, DefaultOptions, options);

    // 改变样式
    $$(instance.list_id).define({ select: !instance.options.multiple });
    $$(instance.list_id).refresh();

    // 如果未设置缓存，或者无数据，那么执行刷新
    if ($$(instance.list_id).count() < 1) {
        instance.reload();
    } else {
        $$(instance.list_id).data.each((item) => {
            if (item["checked"]) {
                item["checked"] = false;
                $$(instance.list_id).updateItem(item.id, item);
            }
        })

        $$(instance.list_id).setPage(0);
    }

    $$(instance.filter_id).setValue(options.filter);
    $$(instance.window_id).show();
}