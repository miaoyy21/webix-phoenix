function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZYE.query_rkmx&pager=true";

    var txtStart = utils.UUID();
    var txtEnd = utils.UUID();

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        footer: true,
        url: null,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, footer: { text: "合  计：", colspan: 3 }, width: 50 },
            { id: "ly", header: { text: "来源", css: { "text-align": "center" } }, options: utils.dicts["wz_yely"], css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "khbh", header: { text: "供应商编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 160 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 100 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 180 },
            { id: "clph", header: { text: "材料批号", css: { "text-align": "center" } }, width: 120 },
            { id: "scrq", header: { text: "生产日期", css: { "text-align": "center" } }, width: 80 },

            { id: "dj", header: { text: "单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 4), css: { "text-align": "right" }, width: 100 },
            { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },
            { id: "rkje", header: { text: "入库金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 100 },

            { id: "tjrq", header: { text: "提交时间", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "mxrkrq", header: { text: "入库时间", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
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
