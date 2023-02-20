function builder() {
    // 普通组件
    var form = utils.protos.form({
        data: { "text_": "It is a Text", }
    });

    // 文档
    var uploader = utils.protos.uploader({
        label: "附件资料",
        data: `[{"id":"dhtr6fmqomc92jcfamjvwsoxpdvzcupg","value":"dhtr6fmqomc92jcfamjvwsoxpdvzcupg","name":"40x40--1.png","sizetext":"1.33 Kb","status":"server"}]`,
        readonly: false
    });

    // uploader: "doc_", // 设置附件上传组件 String ｜ Array
    var out = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "Get Values", autowidth: true,
                        click() {
                            var values = $$(form.id).getValues();
                            values["doc_"] = uploader.getValue();
                            $$(out).setHTML("<pre>" + JSON.stringify(values, null, "  ") + "</pre>");
                        }
                    }
                    // tree.actions.add(),
                    // tree.actions.addChild(),
                    // tree.actions.remove(),
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { rows: [uploader, form] },
                        { id: out, view: "template" },
                    ]
                }
            }
        ],
    };
}

export { builder };