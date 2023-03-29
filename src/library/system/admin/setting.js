function builder() {
    var form_id = utils.UUID();

    // 重置
    function reset() {
        $$(form_id).setValues($$(form_id).getCleanValues());
    }

    // 保存
    function save() {
        if (!$$(form_id).validate()) return;
        if (!$$(form_id).isDirty()) return;

        // 根据数据状态保存
        var value = $$(form_id).getValues();
        webix.ajax().post("/api/sys/setting", value).then(function () {
            webix.alert({ type: "alert-warning", title: "系统提示", text: "保存成功" });
            $$(form_id).setDirty(false);
        })
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    { view: "button", label: "保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline", click: save },
                    { view: "button", label: "重置", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-undo", click: reset },
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        {},
                        {
                            id: form_id,
                            view: "form",
                            borderless: true,
                            gravity: 2,
                            url: "/api/sys/setting",
                            rows: [
                                { view: "text", name: "name", label: "系统名称", required: true },
                                { view: "text", name: "version", label: "版本号", required: true },
                                { view: "text", name: "copyright", label: "版权显示", required: true },
                                { view: "text", name: "password_default", label: "默认密码", required: true },
                                { view: "slider", name: "password_min_length", label: "密码最小长度", min: 1, max: 64, title: webix.template("#value#") },
                                { view: "slider", name: "password_max_length", label: "密码最大长度", min: 1, max: 64, title: webix.template("#value#") },
                                { view: "text", name: "token_expire", label: "Token时效(秒)", required: true },
                                { view: "checkbox", name: "classification_enable", label: "启用密级管理", checkValue: "Yes", uncheckValue: "No" },
                            ],
                            elementsConfig: { labelWidth: 120, labelAlign: "right" },
                            on: {
                                onBeforeLoad() {
                                    webix.extend(this, webix.ProgressBar).showProgress();
                                },
                                onAfterLoad() {
                                    webix.extend(this, webix.ProgressBar).hideProgress();
                                }
                            }
                        },
                        {}
                    ]
                }
            }
        ]
    };
}

export { builder };