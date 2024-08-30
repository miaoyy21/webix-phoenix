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
                        view: "richselect", options: utils.dicts["wgzt"], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                // $$(dtable).clearAll();
                                // $$(dtable).load(() => webix.ajax("/api/wf/flows?method=Tasks", { "status": newValue }));
                            }
                        }
                    },
                    mainList.actions.refresh(),
                    mainList.actions.add({ label: "新建单据", callback: () => ({}) }),
                    mainList.actions.remove({ label: "删除单据" }),
                    {
                        view: "button", label: "提交检验", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() { }
                    },
                    {
                        view: "button", label: "撤销提交", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() { }
                    }
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
                                {
                                    gravity: 2,
                                    rows: [
                                        {
                                            view: "toolbar", cols: [
                                                {
                                                    view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
                                                    click() { }
                                                },
                                                {
                                                    view: "button", label: "物资导入", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-database-import",
                                                    click() { }
                                                },
                                            ]
                                        },
                                        mxGrid
                                    ]
                                }
                            ]
                        },
                    }
                ]
            }
        ]
    }
}

export { builder }