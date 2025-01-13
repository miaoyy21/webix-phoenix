function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZCK.query_ckmx&pager=true";

    var txtStart = utils.UUID();
    var txtEnd = utils.UUID();

    var initStart = webix.Date.dateToStr("%Y-%m-%d")(new Date()).substring(0, 8) + "01";
    var initEnd = webix.Date.dateToStr("%Y-%m-%d")(new Date()).substring(0, 10);

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&start_date=" + initStart + "&end_date=" + initEnd,
        data: [],
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, footer: { text: "合  计：", colspan: 3 }, width: 50 },
            { id: "ly", header: { text: "来源", css: { "text-align": "center" } }, options: utils.dicts["wz_rkly"], css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "出库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "llrq", header: { text: "出库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "rkldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "sq_gcbh", header: { text: "请领项目编号", css: { "text-align": "center" } }, width: 180 },
            { id: "sq_gcmc", header: { text: "请领项目名称", css: { "text-align": "center" } }, width: 200 },
            { id: "sf_gcbh", header: { text: "实发项目编号", css: { "text-align": "center" } }, width: 180 },
            { id: "sf_gcmc", header: { text: "实发项目名称", css: { "text-align": "center" } }, width: 200 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "sfs", header: { text: "出库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "dj", header: { text: "单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 4), css: { "text-align": "right" }, width: 100 },
            { id: "ckje", header: { text: "出库金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "sqry", header: { text: "申请人", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqbm", header: { text: "申请部门", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "sqrq", header: { text: "申请日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "bmld", header: { text: "审批人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审批日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "qx", header: { text: "去向", css: { "text-align": "center" } }, width: 160 },
            { id: "mxllrq", header: { text: "出库时间", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        styles: {
            cellTextColor(row, col) {
                return row["ly"] == "HCD" || row["ly"] == "ZKD" ? "red" : (row["ly"] == "HCR" || row["ly"] == "ZKR" ? "blue" : "none");
            }
        },
        pager: mainPager.id,
    });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    { id: txtStart, width: 240, name: "start", view: "datepicker", label: "开始时间", labelAlign: "right", value: initStart, stringResult: true, format: utils.formats.date.format },
                    { id: txtEnd, width: 240, name: "end", view: "datepicker", label: "结束时间", labelAlign: "right", value: initEnd, stringResult: true, format: utils.formats.date.format },
                    { width: 24 },
                    {
                        view: "button", label: "检索", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-filter-outline",
                        click() {
                            var start = $$(txtStart).getValue().substring(0, 10);
                            var end = $$(txtEnd).getValue().substring(0, 10);

                            if (_.isEmpty(start) && _.isEmpty(end)) {
                                webix.message({ type: "info", text: "请选择开始时间和结束时间进行检索" });
                                return
                            }

                            $$(mainGrid.id).clearAll();
                            $$(mainGrid.id).define("url", mainUrl + "&start_date=" + start + "&end_date=" + end);
                        }
                    },
                    {},
                    mainGrid.actions.search({ fields: "ldbh,sq_gcbh,sq_gcmc,sf_gcbh,sf_gcmc,ckbh,ckmc,kwbh,kwmc,wzbh,wzmc,ggxh,qx", placeholder: "可根据 仓库、项目、库位和物资 进行过滤", width: 360 }),
                    {
                        view: "button", label: "导出", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-microsoft-excel",
                        click() { webix.toExcel($$(mainGrid.id), { spans: true, styles: true }) }
                    },
                ]
            },
            mainGrid, mainPager,
        ]
    };
}

export { builder }
