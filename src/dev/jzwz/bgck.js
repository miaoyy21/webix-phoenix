function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJ.query_bgck";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.query";
    const kcUrl = "/api/sys/data_service?service=JZWZ_WZYE.query_self";
    const sfUrl = "/api/sys/data_service?service=JZWZ_WZCK.query_yeck";

    var btnAuto = utils.UUID();
    var btnCommit = utils.UUID();
    var btnUnCommit = utils.UUID();

    var djzt = "0"; // 单据状态：0: 待出库   1: 已出库
    var allSfData = {}; // 本次实发 Map{ "领料单明细ID": Map["库存ID"] "实发数量" };

    // 列表选择事件
    function onAfterSelectMain(id) {
        $$(mxGrid.id).clearAll();

        // 重新加载
        webix.ajax()
            .get(mxUrl, { "sq_id": id, "zt": djzt })
            .then(
                (res) => {
                    var values = res.json();
                    $$(mxGrid.id).define("data", values);

                    allSfData = {}; // 清空本次实发
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

    // 明细选择事件
    function onAfterSelectMx(id) {
        var row = $$(mxGrid.id).getItem(id);
        $$(kcGrid.id).clearAll();

        // 重新加载数据
        webix.ajax()
            .get(djzt == "0" ? kcUrl + "&wzbh=" + row["wzbh"] : sfUrl + "&sqmx_id=" + id)
            .then(
                (res) => {
                    var values = res.json()["data"];
                    if (djzt == "0") {
                        values = _.map(values, (value) => {
                            var sfs = utils.formats.number.editParse(_.get(allSfData, [id, value["id"]], 0)) || 0;
                            return _.extend(value, { "checked": sfs > 0 ? "1" : "0", "sfs": sfs });
                        });

                        $$(kcGrid.id).define("editable", true);
                    } else {
                        $$(kcGrid.id).define("editable", false);
                    }

                    $$(kcGrid.id).define("data", values);
                }
            );
    }

    /********** 出库单列表 **********/
    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&djzt=0",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "ldbh", header: { text: "出库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "cklx", header: { text: "出库类型", css: { "text-align": "center" } }, options: utils.dicts["wz_cklx"], css: { "text-align": "center" }, width: 80 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 100 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqry", header: { text: "申请人", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqbm", header: { text: "申请部门", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "bmld", header: { text: "审批人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审批日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, width: 360 },
        ],
        on: {
            onAfterSelect: (selection, preserve) => onAfterSelectMain(selection.id),
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
        leftSplit: 5,
        rightSplit: 0,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            // { id: "id", header: { text: "ID", css: { "text-align": "center" } }, width: 240 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_ckzt"], css: { "text-align": "center" }, width: 60 },
            { id: "llrq", hidden: true, header: { text: "领料日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            { id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } }, css: { "text-align": "right", "background": "#d6eaf8" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
            { id: "lly", hidden: true, header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bgy", hidden: true, header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, fillspace: true, minWidth: 240 },
        ],
        on: {
            onAfterSelect: (selection, preserve) => onAfterSelectMx(selection.id),
            onAfterLoad() {
                if (this.count() < 1) {
                    $$(kcGrid.id).define("data", []);
                }
            }
        },
    });


    /********** 可发库存明细 **********/
    var kcPager = utils.protos.pager();
    var kcGrid = utils.protos.datatable({
        editable: true,
        drag: false,
        url: null,
        leftSplit: 4,
        rightSplit: 0,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "checked", header: { text: "✓", css: { "text-align": "center" } }, css: { "text-align": "center" },
                options: utils.dicts["checked"], adjust: true, width: 40
            },
            // { id: "id", header: { text: "ID", css: { "text-align": "center" } }, width: 240 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 100 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "kcsl", header: { text: "可发数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            {
                id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                width: 80
            },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 180 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, fillspace: true, minWidth: 240 },
        ],
        on: {
            onDataUpdate(id, kcData, old) {
                if (djzt == "1") return;

                var mxData = $$(mxGrid.id).getSelectedItem();
                console.log(mxData, mxData["qls"]);
                var qls = utils.formats.number.editParse(mxData["qls"], 2) || 0;

                // 除去本条记录的总实发数量
                var sumSfs = 0;
                if (_.has(allSfData, mxData["id"])) {
                    var sumData = _.reject(allSfData[mxData["id"]], (v, k) => (k == id));
                    sumSfs = _.reduce(_.values(sumData), function (total, sfs) { return total + sfs; }, 0)
                } else {
                    allSfData[mxData["id"]] = {};
                }


                var kcsl = utils.formats.number.editParse(kcData["kcsl"], 2) || 0;
                var sfs = utils.formats.number.editParse(kcData["sfs"], 2) || 0;
                if (sfs > kcsl) {
                    webix.message({ type: "info", text: "实发数量不能大于库存数量！" });
                    sfs = kcsl;
                }

                if (sumSfs + sfs > qls) {
                    webix.message({ type: "info", text: "实发数量总和不能大于请领数量！" });
                    sfs = qls - sumSfs;
                }

                allSfData[mxData["id"]][id] = sfs;

                mxData["sfs"] = (sumSfs + sfs).toFixed(2);
                kcData["sfs"] = sfs;
                kcData["checked"] = sfs > 0 ? "1" : "0";
                $$(mxGrid.id).updateItem(mxData["id"], mxData);
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

                                djzt = newValue;
                                if (_.isEqual(newValue, "1")) {
                                    $$(btnAuto).disable();
                                    $$(btnCommit).disable();
                                    $$(btnUnCommit).enable();

                                    mxGrid.actions.hideColumn("llrq", false);
                                    mxGrid.actions.hideColumn("bgy", false);
                                    mxGrid.actions.hideColumn("lly", false);

                                    kcGrid.actions.hideColumn("kcsl", true);
                                    kcGrid.actions.hideColumn("checked", true);
                                } else {
                                    $$(btnAuto).enable();
                                    $$(btnCommit).enable();
                                    $$(btnUnCommit).disable();

                                    mxGrid.actions.hideColumn("llrq", true);
                                    mxGrid.actions.hideColumn("bgy", true);
                                    mxGrid.actions.hideColumn("lly", true);

                                    kcGrid.actions.hideColumn("kcsl", false);
                                    kcGrid.actions.hideColumn("checked", false);
                                }
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    { width: 24 },
                    {
                        id: btnAuto, view: "button", label: "自动销账", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-calculator",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .get("/api/sys/data_service?service=JZWZ_WZLLSQWJ.auto", { "id": id })
                                .then(
                                    (res) => {
                                        allSfData = res.json();
                                        webix.message({ type: "success", text: "自动销账成功，请进行出库确认！" });

                                        // 刷新明细
                                        var mxValues = $$(mxGrid.id).serialize(true);
                                        _.each(mxValues, (value) => {
                                            var sumSfs = 0;
                                            if (_.has(allSfData, value["id"])) {
                                                sumSfs = _.reduce(_.values(allSfData[value["id"]]), function (total, sfs) { return total + sfs; }, 0)
                                            }

                                            value["sfs"] = sumSfs.toFixed(2);
                                            $$(mxGrid.id).updateItem(value["id"], value);
                                        })

                                        // 刷新选中的领料明细的库存
                                        var mxId = $$(mxGrid.id).getSelectedId(false, true);
                                        if (mxId) onAfterSelectMx(mxId);
                                    }
                                );
                        }
                    },
                    {
                        id: btnCommit, view: "button", label: "出库确认", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            var total = 0;
                            _.each(allSfData, (sfData) => { _.map(sfData, (sfs) => { total = total + sfs }) });
                            if (total <= 0) {
                                webix.message({ type: "error", text: "请根据库存填写实发数量或使用自动销账进行发料！" })
                                return;
                            }

                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.commit", { "id": id, "allSfData": allSfData })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "出库确认成功" });
                                        onAfterSelectMain(id);
                                    }
                                );
                        }
                    },
                    {
                        id: btnUnCommit, view: "button", label: "撤销出库", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.unCommit", { "id": id })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "撤销出库成功" });
                                        onAfterSelectMain(id);
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
                        width: 320,
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