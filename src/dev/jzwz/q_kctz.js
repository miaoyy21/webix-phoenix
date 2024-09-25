function builder() {
    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        footer: true,
        url: "/api/sys/data_service?service=JZWZ_WZYE.query_kctz&pager=true",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, footer: { text: "合  计：", colspan: 3 }, width: 50 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" }, rowspan: 2 }, width: 80 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" }, rowspan: 2 }, width: 100 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" }, rowspan: 2 }, width: 120 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" }, rowspan: 2 }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 60 },

            {
                id: "sssl", header: [{ text: "入库汇总", css: { "text-align": "center" }, colspan: 2 }, { text: "入库数量", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },
            {
                id: "rkje", header: ["", { text: "入库金额", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },
            {
                id: "sfs", header: [{ text: "出库汇总", css: { "text-align": "center" }, colspan: 2 }, { text: "出库数量", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },
            {
                id: "ckje", header: ["", { text: "出库金额", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },
            {
                id: "kcsl", header: [{ text: "库存汇总", css: { "text-align": "center" }, colspan: 2 }, { text: "库存数量", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },
            {
                id: "kcje", header: ["", { text: "库存金额", css: { "text-align": "center" } }],
                css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, width: 100
            },

        ],
        pager: mainPager.id,
    });

    return {
        rows: [
            {
                view: "toolbar", cols: [
                    mainGrid.actions.search({ fields: "ckbh,ckmc,kwbh,kwmc,wzbh,wzmc,ggxh,wzph,bzdh", label: "快速过滤：", placeholder: "可根据 仓库、库位和物资 进行过滤" }),
                    {},
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
