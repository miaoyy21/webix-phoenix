var window = {};

// Window Form
window.form = function (options) {

    // Form Option
    var form = _.extend(
        {
            id: utils.UUID(),
            data: {},
            rows: [
                { view: "text", name: "code_", label: "Code", required: true },
                { view: "text", name: "name_", label: "Name", required: true },
            ],
            elementsConfig: { labelAlign: "right", clear: false }
        },
        options["form"],
        { view: "form" }
    );

    // Window Option
    var _options = _.extend(
        {
            id: utils.UUID(),
            head: "Window Title",
            position: "center",
            close: true,
            modal: true,
            move: true,
            width: 480,
            height: 360,
            callback(value) {
                console.log("Window Form Values : ", value);
                return true;
            }
        },
        options,
        {
            view: "window",
            body: {
                rows: [
                    {
                        view: "scrollview",
                        scroll: "y",
                        body: form,
                    },
                    { height: 8, css: { "border-top": "none" } },
                    {
                        view: "toolbar",
                        borderless: true,
                        cols: [
                            {},
                            {
                                view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary", click() {
                                    if (!$$(form.id).validate()) return;

                                    var value = $$(form.id).getValues();
                                    var ok = _options.callback(value);
                                    if (ok !== false) {
                                        this.getTopParentView().close();
                                    }
                                }
                            },
                            {},
                            { view: "button", label: "取消", minWidth: 88, autowidth: true, click() { this.getTopParentView().close() } },
                            {},
                        ]
                    },
                    { height: 8 }
                ],
            },
            on: { onHide() { this.close() } }
        }
    );

    // Form ID
    webix.ui(_options).show();
}

export { window };