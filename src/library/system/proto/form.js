function builder() {
    var form = utils.protos.form({
        uploader: "doc_", // 设置附件上传组件 String ｜ Array
        data: {
            "text_": "It is a Text",
            "doc_": "dhp97jjoz7faptpq9amvahnrgt9n9fuk,dhp97km8g725ha7k9pqvrgrhnpmnttvo"
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