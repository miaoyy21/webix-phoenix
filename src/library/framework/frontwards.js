
function frontwards(options) {
    var win = utils.UUID();
    var comm = utils.UUID();

    webix.ui({
        id: win,
        view: "window",
        modal: true,
        close: true,
        move: true,
        width: 600,
        minHeight: 240,
        headHeight: 40,
        position: "center",
        head: options["title"],
        body: {
            paddingX: 12,
            rows: [
                { height: 8 },
                { template: "【流程发起者】", type: "section" },
                {
                    view: "fieldset",
                    label: "驳回意见",
                    body: { id: comm, name: "comment", view: "textarea", placeholder: "请输入驳回意见 ..." },
                },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", label: "驳回", minWidth: 88, autowidth: true, css: "webix_danger",
                            click() {
                                var data = {
                                    "id": options["id"],
                                    "comment": $$(comm).getValue()
                                };

                                if (options.callback(data)) {
                                    $$(win).hide();
                                }
                            }
                        },
                        { width: 8 }
                    ]
                },
                { height: 8 }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
}

export { frontwards }