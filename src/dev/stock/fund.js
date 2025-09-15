function builder() {
    var pager = utils.protos.pager();

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: true,
        click: "sort",
        url: "/api/sys/data_service?service=ST_FUND.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=ST_FUND.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "code", header: { text: "基金代码", css: { "text-align": "center" } }, editor: "text", sort: "text", css: { "text-align": "center" }, width: 100 },
            { id: "name", header: { text: "基金名称", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
            { id: "settlement_at", header: { text: "结算日期", css: { "text-align": "center" } }, format: utils.formats.date.format, sort: "date", css: { "text-align": "center" }, width: 140 },
            { id: "npv", header: { text: "净值", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 4), sort: "int", css: { "text-align": "right" }, minWidth: 80 },
            { id: "holdings", header: { text: "持仓金额（元）", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), sort: "int", css: { "text-align": "right" }, minWidth: 120 },
            { id: "holdings_percentage", header: { text: "持仓占比（%）", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), sort: "int", css: { "text-align": "right" }, minWidth: 120 },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, sort: "text", width: 140 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                 <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`,
            }
        ],
        rules: {
            "code": webix.rules.isNotEmpty,
            "name": webix.rules.isNotEmpty,
        },
        styles: {
            cellTextColor: function (row, col) { return row["tybz"] == "1" ? "red" : "none" }
        },
        pager: pager.id
    });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    datatable.actions.add({ callback: () => ({ "settlement_at": "2000-01-01", "npv": 0.0000, "holdings": 0.00, "holdings_percentage": 0.00 }) }),
                    datatable.actions.refresh(),
                    {},
                    datatable.actions.search({ fields: "code,name" }),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };