function builder() {
    var mainPager = utils.protos.pager();
    var mainList = utils.protos.list({ pager: mainPager.id });
    var mainForm = utils.protos.form({});
    var mxGrid = utils.protos.datatable({});

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "richselect", options: utils.dicts["wgzt"], width: 180, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                // $$(dtable).clearAll();
                                // $$(dtable).load(() => webix.ajax("/api/wf/flows?method=Tasks", { "status": newValue }));
                            }
                        }
                    },
                    mainList.actions.refresh(),
                    mainList.actions.add({ label: "新建单据", callback: () => { } }),
                ]
            },
            {
                cols: [
                    {
                        view: "scrollview",
                        width: 280,
                        body: {
                            rows: [
                                { view: "toolbar", cols: [mainList.actions.filter({ placeholder: "请输入..." })] },
                                mainList,
                                mainPager
                            ],
                        },
                    },
                    { view: "resizer" },
                    {
                        view: "scrollview",
                        body: {
                            rows: [
                                {
                                    view: "scrollview",
                                    gravity: 1,
                                    body: mainForm,
                                },
                                { view: "resizer" },
                                { gravity: 2, rows: [mxGrid] }
                            ]
                        },
                    }
                ]
            }
        ]
    }
}

export { builder }