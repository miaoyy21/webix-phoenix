function builder() {
    var out = utils.UUID();

    function load() {
        webix.ajax().get("/api/sys", { "method": "System" })
            .then((res) => {
                $$(out).setHTML("<pre>" + res.json() + "</pre>");
            });
    }

    load();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    { view: "button", label: "刷新", css: "webix_primary", autowidth: true, type: "icon", icon: "mdi mdi-18px mdi-refresh", click: load }
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: {
                    id: out,
                    view: "template",
                }
            }
        ]
    }
}

export { builder }