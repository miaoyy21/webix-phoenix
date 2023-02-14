function builder() {

    // 请假单
    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "创建", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                        }
                    },
                ]
            },
            {
                view: "template",
                template: "1张请假单"
            },
        ],
    };
}

export { builder };