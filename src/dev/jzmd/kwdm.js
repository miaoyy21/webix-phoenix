function builder() {

    var ckGrid = utils.protos.datatable({
        multiselect: false,
        editable: false,
        leftSplit: 0,
        rightSplit: 0,
        url: "/api/sys/data_service?service=JZMD_CKDM.query",
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 120 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, minWidth: 240, fillspace: true },
        ],
        on: {
            onAfterSelect(selection, preserve) {
                var url = "/api/sys/data_service?service=JZMD_KWDM.query&ckdm_id=" + selection.id;

                $$(kwGrid.id).define("url", url);
                $$(kwGrid.id).refresh();
            }
        }
    });


    var kwGrid = utils.protos.datatable({
        multiselect: false,
        editable: true,
        leftSplit: 0,
        rightSplit: 1,
        url: "/api/sys/data_service?service=JZMD_KWDM.query",
        save: {
            url: "/api/sys/data_service?service=JZMD_KWDM.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },

        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, editor: "text", width: 80 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, editor: "text", minWidth: 240, fillspace: true },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, width: 140 },
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
            "ckdm_id": webix.rules.isNotEmpty,
            "kwbh": webix.rules.isNotEmpty,
            "kwmc": webix.rules.isNotEmpty,
        },
    });

    return {
        cols: [
            {
                view: "scrollview",
                gravity: 3,
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>仓库列表", height: 38 },
                        ckGrid
                    ]
                },
            },
            { view: "resizer" },
            {
                view: "scrollview",
                gravity: 4,
                body: {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                kwGrid.actions.add({
                                    callback: () => ({ "ckdm_id": $$(ckGrid.id).getSelectedId(false, true) })
                                }),
                                kwGrid.actions.refresh(),
                            ]
                        },
                        kwGrid,
                    ]
                }
            }
        ]
    };
}

export { builder };