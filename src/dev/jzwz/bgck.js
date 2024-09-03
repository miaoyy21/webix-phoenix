function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJ.query";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.query";

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
        url: mainUrl + "&wgbz=0",
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
            { id: "sqry", header: { text: "申请部门", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
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
        editable: true,
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
            {
                id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 60
            },
            {
                id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "taxje", header: { text: "税额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, editor: "text", width: 160 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, editor: "combo", options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "clph", header: { text: "材料批号", css: { "text-align": "center" } }, editor: "text", width: 120 },
            {
                id: "scrq", header: { text: "生产日期", css: { "text-align": "center" } }, editor: "date",
                format: utils.formats.date.format,
                editParse: utils.formats.date.editParse,
                editFormat: utils.formats.date.editFormat,
                css: { "text-align": "center" }, width: 80
            },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: "text", width: 240 },
            { id: "tjrq", header: { text: "提交日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "create_user_name_", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
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
                        view: "richselect", options: utils.dicts["wgzt"], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&wgbz=" + newValue);

                                if (_.isEqual(newValue, "1")) {
                                    $$(btnCommit).disable();
                                    $$(btnUnCommit).disable();

                                    $$(btnCommit).disable();
                                }
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    {
                        id: btnCommit, view: "button", label: "提交检验", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJ.commit", { "id": id })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "提交检验成功" });
                                        onAfterSelect(id);
                                    }
                                );
                        }
                    },
                    {
                        id: btnUnCommit, view: "button", label: "撤销提交", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJ.unCommit", { "id": id })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "撤销提交成功" });
                                        onAfterSelect(id);
                                    }
                                );
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
                                { view: "toolbar", cols: [mainGrid.actions.search({ fields: "ldbh,htbh,khbh,khmc,gcbh,gcmc", autoWidth: true })] },
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
                                        { view: "toolbar", cols: [{ view: "label", label: "<span style='margin-left:8px'></span>可发库存明细", height: 38 }] },
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