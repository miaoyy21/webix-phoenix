function builder() {
    var pager = utils.protos.pager();

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: true,
        click: "sort",
        url: "/api/sys/data_service?service=ST_SETTLEMENT.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=ST_SETTLEMENT.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "settlement_at", header: { text: "结算日期", css: { "text-align": "center" } }, editor: "date",
                format: utils.formats.date.format,
                editParse: utils.formats.date.editParse,
                editFormat: utils.formats.date.editFormat,
                css: { "text-align": "center" }, width: 120
            },
            { id: "description", header: { text: "描述", css: { "text-align": "center" } }, editor: "text", sort: "text", fillspace: true },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, adjust: true, minWidth: 160 },
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
            "settlement_at": webix.rules.isNotEmpty,
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
                    datatable.actions.add(),
                    datatable.actions.refresh(),
                    {},
                    datatable.actions.search({ fields: "settlement_at" }),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };