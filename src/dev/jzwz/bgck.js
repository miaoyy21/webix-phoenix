
function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJ.query_bgck";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.query";
    const kcUrl = "/api/sys/data_service?service=JZWZ_WZYE.query_self";
    const sfUrl = "/api/sys/data_service?service=JZWZ_WZCK.query_yeck";

    var winPrintId = utils.UUID();
    var btnAuto = utils.UUID();
    var btnCommit = utils.UUID();

    var djzt = "0"; // 单据状态：0: 待出库   1: 已出库
    var allSfData = {}; // 本次实发 Map{ "领料单明细ID": Map["库存ID"] "实发数量" };

    // 列表选择事件
    function onAfterSelectMain(id) {
        // 重新加载
        $$(mxGrid.id).clearAll();
        $$(mxGrid.id).showOverlay("正在检索领料单明细，请稍后...");

        $$(kcGrid.id).clearAll();
        $$(kcGrid.id).showOverlay("正在检索库存，请稍后...");

        webix.ajax()
            .get(mxUrl, { "sq_id": id, "zt": djzt })
            .then((res) => {
                var values = res.json();
                $$(mxGrid.id).define("data", values);

                allSfData = {}; // 清空本次实发
                $$(mxGrid.id).define("editable", !_.isEqual(djzt, "1"));
            }).fail(() => {
                $$(mxGrid.id).showOverlay("检索出现异常");
            });
    }

    // 明细选择事件
    function onAfterSelectMx(id) {
        var row = $$(mxGrid.id).getItem(id);
        $$(kcGrid.id).clearAll();
        $$(kcGrid.id).showOverlay("正在检索库存，请稍后...");

        // 重新加载数据
        webix.ajax()
            .get(djzt == "0" ? kcUrl + "&wzbh=" + row["wzbh"] : sfUrl + "&sqmx_id=" + id)
            .then((res) => {
                var values = res.json()["data"];
                if (djzt == "0") {
                    values = _.map(values, (value) => {
                        var sfs = utils.formats.number.editParse(_.get(allSfData, [id, value["id"]], 0), 2) || 0;
                        return _.extend(value, { "checked": sfs > 0 ? "1" : "0", "sfs": sfs });
                    });

                    $$(kcGrid.id).define("editable", true);
                } else {
                    $$(kcGrid.id).define("editable", false);
                }

                $$(kcGrid.id).define("data", values);
            }).fail(() => {
                $$(kcGrid.id).showOverlay("检索出现错误");
            });
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
            { id: "sqry", header: { text: "申请人", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 180 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
            { id: "cklx", header: { text: "出库类型", css: { "text-align": "center" } }, options: utils.dicts["wz_cklx"], css: { "text-align": "center" }, width: 80 },
            { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
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
                    _.delay(() => {
                        $$(mxGrid.id).define("data", []);
                    }, 50);
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
        leftSplit: 5,
        rightSplit: 1,
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.save_bgck",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            // { id: "id", header: { text: "ID", css: { "text-align": "center" } }, width: 240 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_ckzt"], css: { "text-align": "center" }, width: 60 },
            { id: "llrq", hidden: true, header: { text: "出库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            { id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } }, css: { "text-align": "right", "background": "#d6eaf8" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            { id: "qx", header: { text: "去向", css: { "text-align": "center" } }, editor: "text", width: 160 },
            { id: "lly", hidden: true, header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bgy", hidden: true, header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, fillspace: true, minWidth: 240 },
            {
                id: "buttons",
                hidden: true,
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template() {
                    return ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="撤销出库" type="button" class="button_unCommit webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-eyedropper-minus"/> </button>
                            </div>`;
                },
            }
        ],
        on: {
            onAfterSelect: (selection, preserve) => onAfterSelectMx(selection.id),
            onAfterLoad() {
                if (this.count() < 1) {
                    _.delay(() => {
                        $$(kcGrid.id).define("data", []);
                    }, 50);
                }
            }
        },
        onClick: {
            button_unCommit: function (e, item) {
                var row = this.getItem(item.row);
                webix.message({ type: "confirm-error", title: "系统提示", text: "是否撤销物资【" + row["wzbh"] + "】的出库记录？" })
                    .then(function (res) {
                        webix.ajax()
                            .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.unCommit", { "id": row["id"] })
                            .then(
                                (res) => {
                                    webix.message({ type: "success", text: "撤销出库成功" });
                                    onAfterSelectMain(row["sq_id"]);
                                }
                            );
                    });
            },
        },
    });


    /********** 可发库存明细 **********/
    var kcPager = utils.protos.pager();
    var kcGrid = utils.protos.datatable({
        editable: true,
        drag: false,
        footer: true,
        url: null,
        leftSplit: 4,
        rightSplit: 0,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, footer: { text: "合  计：", colspan: 3 }, css: { "text-align": "center" }, css: { "text-align": "center" }, width: 60 },
            {
                id: "checked", header: { text: "✓", css: { "text-align": "center" } }, css: { "text-align": "center" },
                options: utils.dicts["checked"], adjust: true, width: 40
            },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 160 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 200 },
            { id: "kcsl", header: { text: "可发数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
            {
                id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } },
                footer: { content: "summColumn", css: { "text-align": "right" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                width: 80
            },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 120 },
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
                    sumSfs = _.reduce(_.values(sumData), (total, sfs) => {
                        var newSfs = utils.formats.number.editParse(sfs, 2);
                        return total + newSfs;
                    }, 0)
                } else {
                    allSfData[mxData["id"]] = {};
                }


                var kcsl = utils.formats.number.editParse(kcData["kcsl"], 2) || 0;
                var sfs = utils.formats.number.editParse(kcData["sfs"], 2) || 0;
                if (sfs > kcsl) {
                    webix.message({ type: "info", text: "实发数量不能大于库存数量！" });
                    sfs = kcsl;
                }

                console.log("sumsfs sfs => ", typeof sumSfs, sumSfs, typeof sfs, sfs);
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

    /***************************** 选择打印已出库的领料单 *****************************/
    function openPrint(values) {
        var printGrid = utils.protos.datatable({
            editable: true,
            drag: false,
            sort: false,
            multiselece: false,
            url: "/api/sys/data_service?service=JZWZ_WZLLSQWJMX.query_print&sq_id=" + values["id"],
            leftSplit: 0,
            rightSplit: 0,
            data: [],
            save: {},
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "checked", header: { text: "选择", css: { "text-align": "center" } }, template: "{common.checkbox()}", checkValue: "Y", uncheckValue: "N", tooltip: false, css: { "text-align": "center" }, adjust: true, minWidth: 50 },
                { id: "ldbh", header: { text: "出库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "llrq", header: { text: "领料日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", fillspace: true, minWidth: 180 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
                { id: "sfs", header: { text: "实发数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
                { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 80 },
                { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
                { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            ],
            on: {
                onAfterLoad() {
                    var max;

                    // 默认选中最后1次出库的记录
                    this.eachRow((id) => {
                        var row = this.getItem(id);
                        if (_.isEmpty(max)) { max = row["llrq"]; }

                        row["checked"] = row["llrq"] == max ? "Y" : "N";
                    }, true);
                }
            }
        });

        webix.ui({
            id: winPrintId, view: "window",
            close: true, modal: true, move: true, width: 720, height: 420,
            head: "出库单打印", position: "center",
            body: {
                rows: [
                    { paddingX: 8, cols: [printGrid] },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", width: 80, label: "打印", css: "webix_primary",
                                click() {
                                    var allData = $$(printGrid.id).serialize(true);
                                    var newData = _.filter(allData, (row) => row["checked"] == "Y");
                                    if (_.size(newData) < 1) {
                                        webix.message({ type: "error", text: "请选择需要打印的出库明细" });
                                        return
                                    }

                                    $$(printGrid.id).define("data", newData);

                                    printGrid.actions.hideColumn("checked", true);
                                    printGrid.actions.hideColumn("llrq", true);

                                    webix.print($$(printGrid.id), { mode: "landscape" });
                                    $$(winPrintId).hide();
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winPrintId).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "richselect", options: [{ id: "0", value: "待出库" }, { id: "1", value: "已出库" }], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                djzt = newValue;
                                console.log(mainUrl + "&djzt=" + djzt);

                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&djzt=" + djzt);

                                if (_.isEqual(djzt, "1")) {
                                    $$(btnAuto).disable();
                                    $$(btnCommit).disable();

                                    mxGrid.actions.hideColumn("llrq", false);
                                    mxGrid.actions.hideColumn("bgy", false);
                                    mxGrid.actions.hideColumn("lly", false);
                                    mxGrid.actions.hideColumn("buttons", false);

                                    kcGrid.actions.hideColumn("kcsl", true);
                                    kcGrid.actions.hideColumn("checked", true);
                                } else {
                                    $$(btnAuto).enable();
                                    $$(btnCommit).enable();

                                    mxGrid.actions.hideColumn("llrq", true);
                                    mxGrid.actions.hideColumn("bgy", true);
                                    mxGrid.actions.hideColumn("lly", true);
                                    mxGrid.actions.hideColumn("buttons", true);

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
                                        // var mxValues = $$(mxGrid.id).serialize(true);
                                        console.log(allSfData);
                                        $$(mxGrid.id).eachRow((id) => {
                                            var value = $$(mxGrid.id).getItem(id);

                                            var sumSfs = 0;
                                            if (_.has(allSfData, id)) {
                                                sumSfs = _.reduce(_.values(allSfData[id]), (total, sfs) => {
                                                    var newSfs = utils.formats.number.editParse(sfs, 2);
                                                    console.log("reduce => ", typeof total, total, typeof sfs, sfs, typeof newSfs, newSfs);
                                                    return total + newSfs;
                                                }, 0);
                                            }

                                            value["sfs"] = sumSfs;
                                            $$(mxGrid.id).updateItem(id, value);
                                        }, true);

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

                            // 选择领料员
                            var values = $$(mainGrid.id).getSelectedItem(false, true);
                            if (_.isEmpty(values)) return;

                            utils.windows.users({
                                title: "请选择领料员",
                                multiple: false,
                                checked: !_.isEmpty(values["lly_id"]) ? [{ "id": values["lly_id"], "user_name_": values["lly"] }] : [],
                                callback(checked) {
                                    webix.ajax()
                                        .post("/api/sys/data_service?service=JZWZ_WZLLSQWJ.commit",
                                            { "id": values["id"], "lly_id": checked["id"], "lly": checked["user_name_"], "allSfData": allSfData },
                                        ).then(
                                            (res) => {
                                                webix.message({ type: "success", text: "出库确认成功" });
                                                var values = $$(mainGrid.id).getSelectedItem(false);
                                                if (values) {
                                                    openPrint(values);
                                                }

                                                allSfData = {};
                                                onAfterSelectMain(values["id"]);
                                            }
                                        );

                                    return true;
                                }
                            })
                        }
                    },
                    {},
                    {
                        view: "button", label: "打印出库单", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-printer",
                        click() {
                            var values = $$(mainGrid.id).getSelectedItem(false);
                            if (values) {
                                openPrint(values);
                            }
                        }
                    },
                    {}
                ]
            },
            {
                cols: [
                    {
                        width: 300,
                        rows: [
                            { view: "toolbar", cols: [mainGrid.actions.search({ fields: "ldbh,gcbh,gcmc,sqry,sqbm,lly", autoWidth: true })] },
                            mainGrid, mainPager
                        ],
                    },
                    { view: "resizer" },
                    {
                        rows: [
                            { gravity: 2, rows: [mxGrid] },
                            { view: "resizer" },
                            {
                                gravity: 2,
                                rows: [
                                    { view: "toolbar", cols: [{ view: "label", label: "<span style='margin-left:8px'></span>可发库存明细", height: 28 }] },
                                    kcGrid, kcPager
                                ]
                            }
                        ]
                    },
                ]
            }
        ]
    }
}

export { builder }