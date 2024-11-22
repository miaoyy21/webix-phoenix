
const instance = {
    window_id: "phoenix_utils_windows_icons",
    dataview_id: "phoenix_utils_windows_icons_dataview",

    filter_id: "phoenix_utils_windows_icons_filter",
    filter_placeholder: "请输入图标名称",

    options: { callback: (select) => { } }
}


// 确定
instance.ok = function () {

    // 根据单选与多选返回数据
    var selected = $$(instance.dataview_id).getSelectedItem();

    // 回调成功，隐藏对话框
    instance.options.callback(selected.value);

    $$(instance.window_id).hide();
}

/*
    {
        callback    必须    点击确定的回调函数
    }
*/
function icons(options) {
    _.extend(instance.options, options);

    webix.ui({
        id: instance.window_id,
        view: "window",
        modal: true,
        close: true,
        move: true,
        height: 420,
        width: 480,
        headHeight: 40,
        position: "center",
        head: "选择图标",
        body: {
            rows: [
                {
                    cols: [
                        {
                            id: instance.filter_id,
                            view: "text",
                            placeholder: instance.filter_placeholder,
                            clear: true,
                            on: {
                                onChange() {
                                    $$(instance.dataview_id).filter("#value#", $$(instance.filter_id).getValue());

                                    // 没有符合条件的数据
                                    var overlayBox = webix.extend($$(instance.dataview_id), webix.OverlayBox);
                                    if (!$$(instance.dataview_id).count()) {
                                        overlayBox.showOverlay("没有找到符合的图标");
                                    } else {
                                        overlayBox.hideOverlay();
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    id: instance.dataview_id,
                    view: "dataview",
                    select: true,
                    xCount: 8,
                    tooltip: true,
                    type: {
                        width: "auto",
                        height: "auto",
                        type: "tiles",
                        template: "<span class='webix_icon mdi-dark #value#'></span>"
                    },
                    url: "/assets/icons.json"
                },
                { height: 8, css: { "border-top": "none" } },
                {
                    cols: [
                        { width: 8 },
                        {},
                        { view: "button", label: "确定", autowidth: true, css: "webix_primary", click: instance.ok },
                        { width: 8 }
                    ]
                },
                { height: 8 }
            ]
        },
        on: {
            onHide() {
                this.close();
            }
        }
    }).show();
}

export { icons }