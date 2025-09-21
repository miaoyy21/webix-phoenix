var qrCode = require("qrcode");

function builder() {

    var mainGrid = utils.protos.datatable({
        multiselect: false,
        editable: false,
        url: "/api/sys/data_service?service=ST_SETTLEMENT.query",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "settlement_at", header: { text: "结算日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, adjust: true, minWidth: 160 },
        ],
        on: {
            onAfterSelect(selection, preserve) {
                var url = "/api/sys/data_service?service=ST_SETTLEMENT_HOLDINGS.calculate&settlement_id=" + selection.id;

                $$(detailGrid.id).showOverlay("数据加载中...");
                $$(detailGrid.id).define("url", url);
                $$(detailGrid.id).refresh();
            }
        }
    });


    var detailGrid = utils.protos.datatable({
        multiselect: false,
        editable: false,
        leftSplit: 0,
        rightSplit: 1,
        url: "/api/sys/data_service?service=ST_SETTLEMENT_HOLDINGS.query",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "code", header: { text: "基金代码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "name", header: { text: "基金名称", css: { "text-align": "center" } }, minWidth: 180, fillspace: true },
            {
                id: "holdings", header: { text: "持仓金额（万元）", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 160
            },
            {
                id: "percentage", header: { text: "持仓占比（%）", css: { "text-align": "center" } },
                template: "#!percentage#%",
                css: { "text-align": "right" }, adjust: true, minWidth: 160
            },
            { id: "money", header: { text: "购买金额（元）", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 0), css: { "text-align": "right", "background": "#d5f5e3" }, adjust: true, minWidth: 160 },
            { id: "convert", header: { text: "转换份额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right", "background": "#f5d5e3" }, adjust: true, minWidth: 160 },
        ],
    });

    return {
        cols: [
            {
                view: "scrollview",
                width: 320,
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>结算日期", height: 38 },
                        mainGrid
                    ]
                },
            },
            { view: "resizer" },
            {
                view: "scrollview",
                gravity: 1,
                body: {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                detailGrid.actions.refresh(),
                                {},
                                detailGrid.actions.search({ fields: "rank,code,name" }),
                            ]
                        },
                        detailGrid,
                    ]
                }
            }
        ]
    };
}

export { builder };