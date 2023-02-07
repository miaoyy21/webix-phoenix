function builder() {
    var form = utils.protos.form({
        uploader: "doc_", // 设置附件上传组件 String ｜ Array
        data: {
            "text_": "It is a Text",
            "doc_": "dgxvkfzyqd9kcb8f97fuajbgx8g4shtg,dgxvkn55gc4mx6o2arbcw4m4autpccwu"
        }
    });
    var out = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "Get Values", autowidth: true,
                        click() { $$(out).setHTML("<pre>" + JSON.stringify($$(form.id).getValues(), null, "  ") + "</pre>"); }
                    }
                    // tree.actions.add(),
                    // tree.actions.addChild(),
                    // tree.actions.remove(),
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: { cols: [form, { id: out, view: "template" }] }
            }
        ],
    };
}

export { builder };