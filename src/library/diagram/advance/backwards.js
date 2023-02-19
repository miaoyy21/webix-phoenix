
/*
{
    title: "*******",
    backwards:[
        {
            "key": -2,
            "name": "部门领导",
            "category": "Execute",
            "routes": [
                -1,
                -2
            ],
            "executors": {
                "U051": "吴文丽"
            },
            "organization": [
                "U051",
                "U018",
                "U002"
            ]
        }
    ],
    callback: function(backwards){ }
}
*/
function backwards(options) {
    var win = utils.UUID();
    var form = utils.UUID();
    console.log(options);

    // 构建用户选择
    _.map(options.backwards, (back) => {
        return {
            view: "fieldset",
            label: back["name"],
            body: {
                rows: [
                    {
                        name: "executors", view: "search", label: "执行者", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                console.log(back);
                            }
                        }
                    },
                ]
            },
        };
    })

    webix.ui({
        id: win,
        view: "window",
        modal: true,
        close: true,
        move: true,
        height: 480,
        width: 720,
        headHeight: 40,
        position: "center",
        head: options["title"],
        body: {
            paddingX: 12,
            rows: [
                { height: 8 },
                {
                    id: form,
                    view: "form",
                    data: {},
                    rows: [
                        {
                            view: "fieldset",
                            label: options.backwards["name"],
                            body: {
                                rows: [
                                    {
                                        name: "executors", view: "search", label: "Tree", readonly: true, required: true,
                                        on: {
                                            onSearchIconClick() {
                                                console.log(this);
                                            }
                                        }
                                    },
                                ]
                            },
                        },
                        {
                            view: "fieldset",
                            label: "流转意见",
                            body: {
                                rows: [
                                    { name: "comment", view: "textarea", label: "Textarea", placeholder: "请输入流转意见 ..." },
                                ]
                            },
                        },
                    ],
                    elementsConfig: { labelAlign: "right", clear: false },
                },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary",
                            click() {
                                console.log($$(form).getValues());
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

export { backwards }