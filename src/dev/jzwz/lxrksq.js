function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJ.bySelf";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query";

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&wgbz=0",
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJ.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 160 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        on: {
            onAfterSelect(selection, preserve) {
                var values = this.getItem(selection.id);

                $$(mainForm.id).setValues(values);

                $$(mxGrid.id).clearAll();
                $$(mxGrid.id).define("url", mxUrl + "&wzrkd_id=" + selection.id);
            }
        },
        pager: mainPager.id,
    });

    var mainForm = utils.protos.form({});
    var mxGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: null,
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 160 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
    });


    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "richselect", options: utils.dicts["wgzt"], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&wgbz=" + newValue);
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    mainGrid.actions.add({ label: "新建单据", callback: () => ({ "wgbz": "0", "rklx": "1", "kdrq": utils.users.getDate() }) }),
                    mainGrid.actions.remove({ label: "删除单据" }),
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
                                { view: "toolbar", cols: [mainGrid.actions.search("ldbh,khmc,htbh,gcbh", true)] },
                                mainGrid,
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