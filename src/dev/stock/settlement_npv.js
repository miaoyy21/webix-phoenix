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
                var url = "/api/sys/data_service?service=ST_SETTLEMENT_NPV.query&settlement_id=" + selection.id;

                $$(detailGrid.id).showOverlay("数据加载中...");
                $$(detailGrid.id).define("url", url);
                $$(detailGrid.id).refresh();
            }
        }
    });


    var detailGrid = utils.protos.datatable({
        multiselect: false,
        editable: true,
        leftSplit: 0,
        rightSplit: 1,
        url: "/api/sys/data_service?service=ST_SETTLEMENT_NPV.query",
        save: {
            url: "/api/sys/data_service?service=ST_SETTLEMENT_NPV.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "code", header: { text: "基金代码", css: { "text-align": "center" } },
                template(values) {
                    return ` <div class="webix_el_box"> ` + (values["code"] || "") + `
                                <span class="button_code webix_input_icon wxi-search" style="height:22px;"/>
                            </div>`;
                }, css: { "text-align": "center" }, width: 160
            },
            { id: "name", header: { text: "基金名称", css: { "text-align": "center" } }, minWidth: 180, fillspace: true },
            {
                id: "npv", header: { text: "净值", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 4),
                editParse: (value) => utils.formats.number.editParse(value, 4),
                editFormat: (value) => utils.formats.number.editFormat(value, 4),
                css: { "text-align": "right" }, adjust: true, minWidth: 100
            },
            {
                id: "holdings", header: { text: "持仓金额（元）", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 100
            },
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
            "code": webix.rules.isNotEmpty,
            "name": webix.rules.isNotEmpty,
            "npv": webix.rules.isNumber,
            "holdings": webix.rules.isNumber,
        },
        onClick: {
            button_code: function (e, item) {
                var data = $$(detailGrid.id).getItem(item.row);
                if (!data) return;

                // 选择用户
                utils.windows.fund({
                    multiple: false,
                    checked: [],
                    callback(checked) {
                        $$(detailGrid.id).updateItem(item.row, _.extend(data, _.pick(checked, "code", "name")));
                        return true;
                    }
                })
            },
        }
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
                                detailGrid.actions.add({
                                    callback: () => ({ "settlement_id": $$(mainGrid.id).getSelectedId(false, true) })
                                }),
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