function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJ.query_bgck";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.query";

    var btnAuto = utils.UUID();
    var btnCommit = utils.UUID();
    var btnUnCommit = utils.UUID();

    function onAfterSelect(id) {
        $$(mxGrid.id).clearAll();

        // 重新加载数据
        webix.ajax()
            .get(mxUrl, { "sq_id": id })
            .then(
                (res) => {
                    var values = res.json();
                    $$(mxGrid.id).define("data", values);

                    if (_.findIndex(values["data"], (row) => (row["zt"] != "0")) >= 0) {
                        $$(mxGrid.id).define("editable", false);
                        $$(btnCommit).disable();

                        if (_.findIndex(values["data"], (row) => (row["zt"] != "0" && row["zt"] != "1")) >= 0) {
                            $$(btnUnCommit).disable();
                        } else {
                            $$(btnUnCommit).enable();
                        }

                        if (_.findIndex(values["data"], (row) => (row["zt"] == "0" || row["zt"] == "1")) >= 0) {
                            mxGrid.actions.hideColumn("buttons", false);
                        } else {
                            mxGrid.actions.hideColumn("buttons", true);
                        }
                    } else {
                        $$(mxGrid.id).define("editable", true);
                        $$(btnCommit).enable();
                        $$(btnUnCommit).disable();

                        mxGrid.actions.hideColumn("buttons", false);
                    }
                }
            );
    }

    /********** 出库单列表 **********/
    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&djzt=0",
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZLLSQWJ.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "ldbh", header: { text: "出库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "cklx", header: { text: "出库类型", css: { "text-align": "center" } }, options: utils.dicts["wz_cklx"], css: { "text-align": "center" }, width: 80 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqry", header: { text: "申请人", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqbm", header: { text: "申请部门", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
            { id: "bmld", header: { text: "审批人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审批日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, width: 360 },
        ],
        on: {
            onAfterSelect: (selection, preserve) => onAfterSelect(selection.id),
            onAfterLoad() {
                if (this.count() < 1) {
                    $$(mxGrid.id).define("data", []);
                }
            }
        },
        pager: mainPager.id,
    });

    /********** 出库单明细 **********/
    var mxGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: null,
        leftSplit: 4,
        rightSplit: 0,
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_ckzt"], css: { "text-align": "center" }, width: 60 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: "1,111.00", width: 80 },
            { id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } }, css: { "text-align": "right", "background": "#d6eaf8" }, format: "1,111.00", width: 80 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
            { id: "llrq", header: { text: "领料日期", css: { "text-align": "center" } }, format: utils.formats["datetime"].format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, width: 360 },
        ],
    });


    /********** 可发库存明细 **********/
    var kcPager = utils.protos.pager();
    var kcGrid = utils.protos.datatable({
        editable: true,
        url: "/api/sys/data_service?service=JZWZ_WZYE.query_wzye",
        leftSplit: 3,
        rightSplit: 0,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "kcsl", header: { text: "库存数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: "1,111.00", width: 80 },
            {
                id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                width: 80
            },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 180 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: "text", fillspace: true, minWidth: 240 },
        ],
        on: {
            onDataUpdate(id, data, old) {
                // var kcsl = utils.formats.number.editParse(data["kcsl"], 2) || 0;
                // var qls = utils.formats.number.editParse(data["qls"], 2) || 0;

                // if (qls > kcsl) {
                //     webix.message({ type: "danger", text: "请领数量不能大于库存数量！" });
                //     data["qls"] = kcsl;
                //     return;
                // }
            },
        },
        pager: kcPager.id
    });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "richselect", options: [{ id: "0", value: "待出库" }, { id: "1", value: "已出库" }], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&djzt=" + newValue);

                                if (_.isEqual(newValue, "1")) {
                                    $$(btnCommit).disable();
                                    $$(btnUnCommit).enable();
                                } else {
                                    $$(btnCommit).enable();
                                    $$(btnUnCommit).disable();
                                }
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    {
                        id: btnAuto, view: "button", label: "自动销账", autowidth: true, css: "webix_secondary", type: "icon", icon: "mdi mdi-18px mdi-calculator",
                        click() {
                            console.log("自动销账");
                        }
                    },
                    {
                        id: btnCommit, view: "button", label: "出库确认", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            // var id = $$(mainGrid.id).getSelectedId(false, true);
                            // webix.ajax()
                            //     .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.commit", { "id": id })
                            //     .then(
                            //         (res) => {
                            //             webix.message({ type: "success", text: "提交检验成功" });
                            //             onAfterSelect(id);
                            //         }
                            //     );
                        }
                    },
                    {
                        id: btnUnCommit, view: "button", label: "撤销出库", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            // var id = $$(mainGrid.id).getSelectedId(false, true);
                            // webix.ajax()
                            //     .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.unCommit", { "id": id })
                            //     .then(
                            //         (res) => {
                            //             webix.message({ type: "success", text: "撤销提交成功" });
                            //             onAfterSelect(id);
                            //         }
                            //     );
                        }
                    }
                ]
            },
            {
                cols: [
                    {
                        view: "scrollview",
                        width: 360,
                        body: {
                            rows: [
                                { view: "toolbar", cols: [mainGrid.actions.search({ fields: "ldbh,gcbh,gcmc,sqry,sqbm,lly", autoWidth: true })] },
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
                                { gravity: 2, rows: [mxGrid] },
                                { view: "resizer" },
                                {
                                    gravity: 2,
                                    rows: [
                                        { view: "toolbar", cols: [{ view: "label", label: "<span style='margin-left:8px'></span>可发库存明细", height: 28 }] },
                                        kcGrid,
                                        { cols: [{ width: 120 }, kcPager] }
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