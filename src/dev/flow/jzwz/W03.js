// 红冲申请单
function defaultValues(options) {
    // rows：{ ldbh,rkrq,wzbh,wzmc,ggxh,wzph,bzdh,jldw,ckbh,ckmc,sssl }
    //      { src_cgdjhs,src_cgjehs,src_cgdj,src_cgje,src_taxrate,src_taxje }
    //      { cgdjhs,cgjehs,cgdj,cgje,taxrate,taxje }

    var request = webix.ajax().sync().get("api/sys/auto_nos", { "code": "wz_hcd_ldbh" });
    var ldbh = request.responseText;

    return {
        "ldbh": ldbh,
        "kdrq": utils.users.getDateTime(),
        "khbh": "",
        "khmc": "",
        "bz": "",
        "sqry_id": utils.users.getUserId(),
        "sqry": utils.users.getUserName(),
    };
}

function builder(options, values) {
    console.log(options, values)

    var winImportId = utils.UUID();
    var saving = 0; // 标识是否正在保存中

    // 元素
    var mainForm = utils.protos.form({
        data: values,
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "红冲单号", readonly: true },
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                    { view: "text", name: "sqry", label: "申请人员", readonly: true },
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "khbh", label: "供应商编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                var rows = $$(mxGrid.id).serialize(true);
                                if (_.size(rows) > 0) {
                                    webix.message({ type: "error", text: "修改供应商前，请先删除入库单明细！" });
                                    return
                                }

                                var values = $$(mainForm.id).getValues();
                                utils.windows.khdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["khbh"]) ? [_.pick(values, "khbh", "khmc")] : [],
                                    filter: (row) => row["tybz"] != '1',
                                    callback(checked) {
                                        var newValues = _.extend(values, _.pick(checked, "khbh", "khmc"));
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                });
                            }
                        }
                    },
                    { view: "text", name: "khmc", gravity: 2, label: "供应商名称", readonly: true },
                ]
            },
            { view: "textarea", name: "bz", label: "红冲原因", readonly: options["readonly"], required: true, height: 72, placeholder: "请填写红冲原因 ..." },
        ],
    });

    // 加载入库单
    function onLoad(values) {
        var newValues = _.map(values, (value) => {
            var newValue = _.pick(value, "id", "ldbh", "rkrq", "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "ckbh", "ckmc", "sssl");
            newValue = _.extend(newValue, _.pick(value, "cgdjhs", "cgjehs", "cgdj", "cgje", "taxrate", "taxje"));

            return _.extend(newValue, {
                "src_cgdjhs": value["cgdjhs"],
                "src_cgjehs": value["cgjehs"],
                "src_cgdj": value["cgdj"],
                "src_cgje": value["cgje"],
                "src_taxrate": value["taxrate"],
                "src_taxje": value["taxje"],
            })
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
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_hcd&khbh=" + data["khbh"],
            leftSplit: 4,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 200 },
                { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 80 },
                { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 60 },
                { id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "taxje", header: { text: "税额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
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
            head: "选择待红冲的入库单",
            position: "center",
            body: {
                paddingX: 8,
                rows: [
                    {
                        rows: [
                            {
                                view: "toolbar",
                                height: 38,
                                cols: [
                                    dlgGrid.actions.search({ fields: "ldbh,gcbh,gcmc,wzbh,wzmc,ggxh,wzph,bzdh", autoWidth: true }),
                                ]
                            },
                            dlgGrid,
                            dlgPager
                        ]
                    },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
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
        footer: true,
        url: null,
        data: values["rows"],
        leftSplit: 3,
        rightSplit: 1,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" }, rowspan: 2 }, footer: { text: "合  计：", colspan: 3 }, css: { "text-align": "center" }, width: 50 },
            { id: "ldbh", header: { text: "原入库单号", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 100 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" }, rowspan: 2 }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 60 },
            {
                id: "sssl", header: { text: "实收数量", css: { "text-align": "center" }, rowspan: 2 },
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "cgdjhs", header: [{ text: "新入库单", css: { "text-align": "center", "background": "#d5f5e3" }, colspan: 6 }, { text: "含税单价", css: { "text-align": "center" } }], editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 4),
                editFormat: (value) => utils.formats.number.editFormat(value, 4),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 80
            },
            {
                id: "cgjehs", header: [{}, { text: "含税金额", css: { "text-align": "center" } }], editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 80
            },
            {
                id: "taxrate", header: [{}, { text: "税率(%)", css: { "text-align": "center" } }], editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 60
            },
            {
                id: "cgdj", header: [{}, { text: "采购单价", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "cgje", header: [{}, { text: "采购金额", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "taxje", header: [{}, { text: "税额", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "src_cgdjhs", header: [{ text: "原入库单", css: { "text-align": "center", "background": "#d5e3f5" }, colspan: 6 }, { text: "含税单价", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "src_cgjehs", header: [{}, { text: "含税金额", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "src_taxrate", header: [{}, { text: "税率(%)", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" },
                adjust: true, minWidth: 60
            },
            {
                id: "src_cgdj", header: [{}, { text: "采购单价", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "src_cgje", header: [{}, { text: "采购金额", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "src_taxje", header: [{}, { text: "税额", css: { "text-align": "center" } }],
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" }, rowspan: 2 }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" }, rowspan: 2 }, width: 120 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" }, rowspan: 2 },
                tooltip: false,
                template() {
                    return ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`;
                },
            }
        ],
        on: {
            onDataUpdate(id, data, old) {
                var newData = _.pick(data, "cgdjhs", "cgjehs", "taxrate");
                newData["sl"] = data["sssl"];

                var oldData = _.pick(old, "cgdjhs", "cgjehs", "taxrate");
                oldData["sl"] = old["sssl"];

                saving++;
                webix.ajax()
                    .post("/api/sys/data_service?service=JZWZ.calucate", { "new": newData, "old": oldData })
                    .then((res) => {
                        var calcData = res.json();

                        data = _.extend(data, calcData);
                        $$(mxGrid.id).refresh(id);

                        saving--;
                    });
            },
            onAfterRender() {
                if (options["readonly"]) {
                    mxGrid.actions.hideColumn("buttons", true);
                } else {
                    mxGrid.actions.hideColumn("buttons", false);
                }
            }
        }
    });


    var btnRkd = {
        view: "button", label: "加载入库单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
        click() {
            var values = $$(mainForm.id).getValues();
            if (_.isEmpty(values["khbh"])) {
                webix.message({ type: "error", text: "请选择供应商！" });
                return;
            }

            open(values);
        }
    };

    // 请假单
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
                                            ] : [{ view: "label", label: "<span style='margin-left:8px'></span>待红冲入库单明细", height: 38 }]
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
            if (saving > 0) {
                webix.message({ type: "error", text: "正在进行计算，请稍后再试..." });
                return
            }

            if (!$$(mainForm.id).validate()) {
                webix.message({ type: "error", text: "缺少必输项" });
                return;
            };

            // 红冲明细
            var rows = $$(mxGrid.id).serialize(true);
            if (_.size(rows) < 1) {
                webix.message({ type: "error", text: "请选择待红冲的物资入库单！" });
                return
            }

            // 必须填写含税金额及含税单价
            var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["cgjehs"], 2) <= 0));
            if (index >= 0) {
                webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写含税金额！" });
                return
            }

            var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["cgdjhs"], 4) <= 0));
            if (index >= 0) {
                webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写含税单价！" });
                return
            }

            // 入库单明细
            var values = $$(mainForm.id).getValues();
            values["rows"] = rows;

            return values;
        },
    }
};

export { defaultValues, builder };