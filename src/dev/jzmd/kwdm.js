var qrCode = require("qrcode");

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
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 240 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, minWidth: 180, fillspace: true },
        ],
        on: {
            onAfterSelect(selection, preserve) {
                var url = "/api/sys/data_service?service=JZMD_KWDM.query&ckdm_id=" + selection.id;

                $$(kwGrid.id).showOverlay("数据加载中...");
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
            { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, editor: "text", width: 120 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, editor: "text", minWidth: 240, fillspace: true },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, width: 140 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                                <button webix_tooltip="打印二维码" type="button" class="button_qrcode webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_primary_icon mdi mdi-18px mdi-fingerprint"/> </button>
                            </div>`,
            }
        ],
        rules: {
            "ckdm_id": webix.rules.isNotEmpty,
            "kwbh": webix.rules.isNotEmpty,
            "kwmc": webix.rules.isNotEmpty,
        },
        onClick: {
            button_qrcode(e, item) {
                var ckData = $$(ckGrid.id).getSelectedItem(false);
                var kwData = this.getItem(item.row);
                openPrintQRCode(_.extend({}, _.pick(ckData, "ckbh", "ckmc"), _.pick(kwData, "kwbh", "kwmc")));
            },
        },
    });

    // 打印二维码标签
    function openPrintQRCode(options) {
        var winId = utils.UUID();

        var data = webix.template("#!ckbh#@#!kwbh# | #!ckmc#/#!kwmc#")(options);
        qrCode.toDataURL(data, { type: 'image/png', margin: 0 }, function (err, url) {
            if (err) throw err;

            webix.ui({
                id: winId, view: "window", position: "center",
                close: true, modal: true, head: "打印二维码【" + data + "】",
                body: {
                    paddingX: 12,
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "button", label: "打印", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
                                    click() {
                                        setTimeout(() => {
                                            webix.print($$(winId + "_print"));
                                            $$(winId).hide();
                                        }, 500);
                                    }
                                },
                            ]
                        },
                        { height: 24 },
                        {
                            id: winId + "_print",
                            cols: [
                                {
                                    view: "template",
                                    borderless: true,
                                    width: 140,
                                    template: `<img src='` + url + `' style='width:100%; height:100%;'>`,
                                },
                                utils.protos.form({
                                    data: options,
                                    type: "clean",
                                    borderless: true,
                                    width: 280,
                                    rows: [
                                        { view: "text", name: "ckbh", label: "仓库编号：" },
                                        { view: "text", name: "ckmc", label: "仓库名称：" },
                                        { view: "text", name: "kwbh", label: "库位编号：" },
                                        { view: "text", name: "kwmc", label: "库位名称：" },
                                    ],
                                    elementsConfig: { labelAlign: "right", labelWidth: 80, readonly: true, clear: false },
                                }),
                            ]
                        },
                        { height: 24 }
                    ]
                },
                on: { onHide() { this.close() } }
            }).show();
        })
    }

    return {
        cols: [
            {
                view: "scrollview",
                gravity: 4,
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
                gravity: 3,
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