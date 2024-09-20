function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZYE.query_kctz_quick";

    var txtWzbh = utils.UUID();
    var txtWzms = utils.UUID();

    var mainPager = utils.protos.pager();
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        footer: true,
        url: null,
        data: [],
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, footer: { text: "合  计：", colspan: 3 }, width: 50 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", minWidth: 240, fillspace: true, },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },

            { id: "sssl", header: { text: "入库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, width: 100 },
            { id: "sfs", header: { text: "出库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, width: 100 },
            { id: "kcsl", header: { text: "库存数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, width: 100 },
            { id: "xxx", hidden: true, width: 1 }
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
                            { id: txtWzbh, view: "text", width: 240, label: "物资编号：", labelAlign: "right", placeholder: "可输入物资编号" },
                            { id: txtWzms, view: "text", label: "物资名称/型号/牌号/代号：", labelAlign: "right", labelWidth: 180, placeholder: "可输入物资名称/型号/牌号/代号" },
                        ]
                    },
                    {
                        cols: [
                            {
                                view: "button", label: "检索", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-filter-outline",
                                click() {
                                    var wzbh = $$(txtWzbh).getValue();
                                    var wzms = $$(txtWzms).getValue();

                                    // if (_.isEmpty(wzbh) && _.isEmpty(wzms)) {
                                    //     webix.message({ type: "info", text: "请输入物资编号或物资名称/型号/牌号/代号进行检索" });
                                    //     return
                                    // }

                                    $$(mainGrid.id).clearAll();
                                    $$(mainGrid.id).showOverlay("数据加载中...");

                                    webix.ajax()
                                        .get(mainUrl + "&filter[wzbh]=" + wzbh + "&full_filter[wzmc,ggxh,wzph,bzdh]=" + wzms)
                                        .then((res) => {
                                            var values = res.json()["data"];
                                            $$(mainGrid.id).define("data", values);
                                        }).fail(() => {
                                            $$(mainGrid.id).showOverlay("检索出现异常");
                                        });
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
