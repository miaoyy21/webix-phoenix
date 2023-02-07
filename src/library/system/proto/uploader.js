function builder() {
    var form_id = utils.UUID();
    var list_id = utils.UUID();


    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "获取", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-undo", click() {
                            var values = $$(form_id).getValues();

                            var text = JSON.stringify(values, "\n").replace(/,/g, ",\n\t");
                            webix.message(text);
                        }
                    },
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
                            width: 600,
                            rows: [
                                {
                                    view: "uploader",
                                    value: "Upload file",
                                    name: "uploader_",
                                    inputWidth: 130,
                                    link: list_id,
                                    upload: "/api/sys/docs?method=Upload"
                                },
                                {
                                    id: list_id,
                                    view: "list",
                                    autoheight: true,
                                    borderless: true,
                                    type: "uploader"
                                },
                                {
                                    view: "button", width: 130, label: "Get value", click: function () {
                                        var values = $$(form_id).getValues();

                                        var text = JSON.stringify(values, "\n").replace(/,/g, ",\n\t");
                                        webix.message("<pre>" + text + "</pre>");
                                    }
                                }
                            ]
                        },
                        {}
                    ]
                }
            }
        ]
    };
}

export { builder };