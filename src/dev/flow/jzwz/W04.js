// 转库申请单
function defaultValues(options) {
    // rows：{ ldbh,rkrq,wzbh,wzmc,ggxh,wzph,bzdh,jldw,sl }
    //      { src_kwbh,src_kwmc,dst_kwbh,dst_kwmc }

    var request = webix.ajax().sync().get("api/sys/auto_nos", { "code": "wz_zkd_ldbh" });
    var ldbh = request.responseText;

    return {
        "ldbh": ldbh,
        "zc_ckbh": "",
        "zc_ckmc": "",
        "zr_ckbh": "",
        "zr_ckmc": "",
        "bz": "",
        "sqry_id": utils.users.getUserId(),
        "sqry": utils.users.getUserName(),
        "sqrq": utils.users.getDateTime(),
    };
}

function builder(options, values) {
    console.log(options, values)

    // 元素
    var mainForm = utils.protos.form({
        data: values,
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "转库单号", readonly: true },
                    { view: "text", name: "sqry", label: "申请人员", readonly: true },
                    { view: "text", name: "sqrq", label: "申请日期", readonly: true },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "zc_ckbh", label: "转出仓库", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                var rows = $$(mxGrid.id).serialize(true);
                                if (_.size(rows) > 0) {
                                    webix.message({ type: "error", text: "重新选择转出仓库前，请删除已加载的转库清单！" });
                                    return
                                }

                                var values = $$(mainForm.id).getValues();
                                utils.windows.ckdm({
                                    multiple: false,
                                    filter: (row) => row["bgy_id"].indexOf(utils.users.getUserId()) >= 0,
                                    checked: !_.isEmpty(values["zc_ckbh"]) ? [{ "ckbh": values["zc_ckbh"], "ckmc": values["zc_ckmc"] }] : [],
                                    callback(checked) {
                                        var newValues = _.extend(values, { "zc_ckbh": checked["ckbh"], "zc_ckmc": checked["ckmc"] });
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                })
                            }
                        }
                    },
                    { view: "text", name: "zc_ckmc", readonly: true },
                    {
                        view: "search", name: "zr_ckbh", label: "转入仓库", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                var values = $$(mainForm.id).getValues();

                                utils.windows.ckdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["zr_ckbh"]) ? [{ "ckbh": values["zr_ckbh"], "ckmc": values["zr_ckmc"] }] : [],
                                    callback(checked) {
                                        var newValues = _.extend(values, { "zr_ckbh": checked["ckbh"], "zr_ckmc": checked["ckmc"] });
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                })
                            }
                        }
                    },
                    { view: "text", name: "zr_ckmc", readonly: true },
                ],
            },
            { view: "textarea", name: "bz", label: "转库原因", readonly: options["readonly"], required: true, height: 72, placeholder: "请填写申请转库原因 ..." },
        ],
    });

    // 加载入库单
    function onLoad(values) {
        var newValues = _.map(values, (value) => {
            var newValue = _.pick(value, "id", "ldbh", "rkrq", "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "sssl", "sfs", "qmsl");

            return _.extend(newValue, { "src_kwbh": value["kwbh"], "src_kwmc": value["kwmc"] });
        });

        var rows = $$(mxGrid.id).serialize(true);
        if (_.size(rows) < 1) {
            $$(mxGrid.id).define("data", newValues);
        } else {
            var newRows = _.filter(newValues, (value) => (!_.findWhere(rows, { "id": value["id"] })));
            $$(mxGrid.id).define("data", _.union(rows, newRows));
        }
    }

    // 选择入库单
    var winId = utils.UUID();
    function open(data) {
        var dlgPager = utils.protos.pager();

        var dlgGrid = utils.protos.datatable({
            editable: false,
            multiselect: true,
            drag: false,
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_zkd&ckbh=" + data["zc_ckbh"],
            leftSplit: 3,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 200 },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 80 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "sssl", header: { text: "入库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "sfs", header: { text: "出库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "qmsl", header: { text: "库存数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "kwbh", header: { text: "库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            ],
            pager: dlgPager.id,
        });

        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 720,
            height: 480,
            animate: { type: "flip", subtype: "vertical" },
            head: "选择待转库的入库单",
            position: "center",
            body: {
                paddingX: 8,
                rows: [
                    {
                        rows: [
                            dlgGrid.actions.search({ fields: "ldbh,wzbh,wzmc,ggxh,wzph,bzdh,kwbh,kwmc", autoWidth: true }),
                            dlgGrid,
                            dlgPager
                        ]
                    },
                    {
                        cols: [
                            { width: 8 },
                            {},
                            {
                                view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary",
                                click() {
                                    var values = $$(dlgGrid.id).getSelectedItem(true);
                                    if (_.isEmpty(values)) return;

                                    onLoad(values);
                                    $$(winId).hide();
                                },
                            },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    // 明细
    var mxGrid = utils.protos.datatable({
        editable: true,
        drag: false,
        url: null,
        data: values["rows"],
        leftSplit: 3,
        rightSplit: 1,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "src_kwbh", header: { text: "转出库位编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            { id: "src_kwmc", header: { text: "转出库位名称", css: { "text-align": "center" } }, width: 160 },
            { id: "qmsl", header: { text: "转库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            {
                id: "dst_kwbh", header: { text: "转入库位编号", css: { "text-align": "center" } },
                template(values) {
                    if (_.isEqual(options["code_"], "RECV")) {
                        return ` <div class="webix_el_box"> ` + (values["dst_kwbh"] || "") + `
                                <span class="button_kwbh webix_input_icon wxi-search" style="height:22px;padding-top:2px;"/>
                            </div>`;
                    }

                    return (values["dst_kwbh"] || "");
                }, css: { "text-align": "center" }, width: 120
            },
            { id: "dst_kwmc", header: { text: "转入库位名称", css: { "text-align": "center" } }, width: 160 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template() {
                    return ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`;
                },
            }
        ],
        on: {
            onAfterRender() {
                if (options["readonly"]) {
                    mxGrid.actions.hideColumn("buttons", true);
                } else {
                    mxGrid.actions.hideColumn("buttons", false);
                }
            }
        },
        onClick: {
            button_kwbh: function (e, item) {
                var values = $$(mainForm.id).getValues();

                var data = $$(mxGrid.id).getItem(item.row);
                if (!data) return;

                // 选择用户
                utils.windows.kwdm({
                    multiple: false,
                    checked: [],
                    filter: (row) => (row["ckbh"] == values["zr_ckbh"]),
                    callback(checked) {
                        var kwData = { "dst_kwbh": checked["kwbh"], "dst_kwmc": checked["kwmc"] };

                        var rows = $$(mxGrid.id).serialize(true);
                        var newRows = _.map(rows, (row) => {
                            if (row["id"] == data["id"]) {
                                return _.extend({}, row, kwData);
                            }

                            if (row["wzbh"] == data["wzbh"] && _.isEmpty(row["dst_kwbh"])) {
                                return _.extend({}, row, kwData);
                            }

                            return row;
                        })

                        $$(mxGrid.id).define("data", newRows);
                        return true;
                    }
                })
            },
        }
    });

    var btnRkd = {
        view: "button", label: "加载入库单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
        click() {
            var values = $$(mainForm.id).getValues();
            if (_.isEmpty(values["zc_ckbh"])) {
                webix.message({ type: "error", text: "请选择转出仓库！" });
                return;
            }

            open(values);
        }
    };

    // 转库单
    return {
        show() {
            return {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 160 },
                        {
                            rows: [
                                mainForm,
                                { view: "resizer" },
                                {
                                    gravity: 2,
                                    rows: [
                                        {
                                            view: "toolbar", cols: !options["readonly"] ? [
                                                btnRkd,
                                                {}
                                            ] : [{ view: "label", label: "<span style='margin-left:8px'></span>待转库清单", height: 38 }]
                                        },
                                        mxGrid,
                                    ]
                                },
                            ]
                        },
                        { width: 160 },
                    ]
                }
            }
        },
        values() {
            if (!$$(mainForm.id).validate()) {
                webix.message({ type: "error", text: "缺少必输项" });
                return;
            };

            // 转库明细
            var rows = $$(mxGrid.id).serialize(true);
            if (_.size(rows) < 1) {
                webix.message({ type: "error", text: "请选择待转库的物资清单！" });
                return
            }

            // 接收确认时，必须选择库位
            if (_.isEqual(options["code_"], "RECV")) {
                var index = _.findIndex(rows, (row) => (_.isEmpty(row["dst_kwbh"])));
                if (index >= 0) {
                    webix.message({ type: "error", text: "第" + (index + 1) + "行：请选择转入库位！" });
                    return
                }
            }

            var values = $$(mainForm.id).getValues();

            // 转出仓库是否与转入仓库相同
            // if (_.isEqual(values["zc_ckbh"], values["zr_ckbh"])) {
            //     webix.message({ type: "error", text: "转出仓库不能与转入仓库相同" });
            //     return
            // }

            values["rows"] = rows;

            return values;
        },
    }
};

export { defaultValues, builder };