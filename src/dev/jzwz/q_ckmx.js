function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZCK.query_ckmx&pager=true";

    var txtStart = utils.UUID();
    var txtEnd = utils.UUID();

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: null,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, footer: { text: "合  计：", colspan: 3 }, width: 50 },
            { id: "ly", header: { text: "来源", css: { "text-align": "center" } }, options: utils.dicts["wz_ckly"], css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "出库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "llrq", header: { text: "出库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "sq_gcbh", header: { text: "请领项目编号", css: { "text-align": "center" } }, width: 100 },
            { id: "sq_gcmc", header: { text: "请领项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "sf_gcbh", header: { text: "实发项目编号", css: { "text-align": "center" } }, width: 100 },
            { id: "sf_gcmc", header: { text: "实发项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },

            { id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "dj", header: { text: "单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 4), css: { "text-align": "right" }, width: 100 },
            { id: "sfs", header: { text: "出库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "ckje", header: { text: "出库金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },

            { id: "sqry", header: { text: "申请人", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sqbm", header: { text: "申请部门", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "sqrq", header: { text: "申请日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
            { id: "bmld", header: { text: "审批人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审批日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },

            { id: "mxllrq", header: { text: "领料时间", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "lly", header: { text: "领料员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        pager: mainPager.id,
    });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        gravity: 2,
                        cols: [
                            { id: txtStart, name: "start", view: "datepicker", label: "开始时间", labelAlign: "right", value: webix.Date.dateToStr("%Y-%m-%d")(new Date()).substring(0, 8) + "01", stringResult: true, format: utils.formats.date.format },
                            { id: txtEnd, name: "end", view: "datepicker", label: "结束时间", labelAlign: "right", value: webix.Date.dateToStr("%Y-%m-%d")(new Date()).substring(0, 10), stringResult: true, format: utils.formats.date.format },
                            { width: 120 },
                        ]
                    },
                    {
                        cols: [
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
                                    webix.ajax()
                                        .get(mainUrl + "&start=" + start + "&end=" + end)
                                        .then(
                                            (res) => {
                                                var values = res.json();
                                                $$(mainGrid.id).define("data", values);
                                            }
                                        );
                                }
                            },
                            {},
                            {
                                view: "button", label: "导出", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-microsoft-excel",
                                click() { webix.toExcel($$(mainGrid.id), { spans: true, styles: true }) }
                            },
                        ]
                    }
                ]
            },
            mainGrid, mainPager,
        ]
    };
}

export { builder }