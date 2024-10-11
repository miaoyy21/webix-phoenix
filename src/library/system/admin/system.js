function builder() {
    const url = "/api/sys/system";
    var iframe = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    { view: "button", label: "刷新", css: "webix_primary", autowidth: true, type: "icon", icon: "mdi mdi-18px mdi-refresh", click: () => { $$(iframe).define("src", url) } }
                ]
            },
            { id: iframe, view: "iframe", src: url }
        ]
    }
}

export { builder }