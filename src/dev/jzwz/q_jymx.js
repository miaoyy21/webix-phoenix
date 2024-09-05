function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_jyd";

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&zt=1",
        leftSplit: 3,
        rightSplit: 0,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
            { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 180 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "jydd", header: { text: "检验地点", css: { "text-align": "center" } }, width: 80 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "rksl", header: { text: "交检数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "jynr", header: { text: "检验内容", css: { "text-align": "center" } }, width: 180 },
            { id: "jyjl", header: { text: "检验结论", css: { "text-align": "center" } }, width: 180 },
            { id: "tjrq", header: { text: "提交日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "create_user_name_", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        pager: mainPager.id,
    });

    return {
        rows: [
            {
                view: "toolbar", cols: [
                    {
                        gravity: 2,
                        cols: [
                            {
                                view: "richselect", label: "状态：", labelAlign: "right", labelWidth: 60, options: [{ id: "1", value: "待检" }, { id: "5", value: "已检" }, { id: "9", value: "入库" }], value: "1", width: 160,
                                on: {
                                    onChange(newValue) {
                                        $$(mainGrid.id).clearAll();
                                        $$(mainGrid.id).define("url", mainUrl + "&zt=" + newValue);
                                    }
                                }
                            },
                            { width: 24 },
                            mainGrid.actions.search({ fields: "txmvalue,ldbh,khbh,khmc,gcbh,gcmc,wzbh,wzmc,ggxh,create_user_name_,jyry,bgy", label: "快速过滤：", placeholder: "可根据 条形码、采购员、检验员、供应商、项目和物资 进行过滤", autoWidth: true }),
                        ]
                    },
                    {
                        cols: [
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
