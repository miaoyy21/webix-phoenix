
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
    webix.ui({
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
                    view: "template",
                    template: JSON.stringify(options)
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