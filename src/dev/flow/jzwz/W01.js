// 零星入库申请单
function defaultValues(options) {
    // rows：{ txmvalue,wzbh,wzmc,ggxh,wzph,bzdh,jldw,sccjmc,bylx,byyq,clph,scrq,bz,ckbh,ckmc,kwbh,kwmc }
    //      { cgdjhs,cgjehs,cgdj,cgje,taxrate,taxje }

    var request = webix.ajax().sync().get("api/sys/auto_nos", { "code": "wz_lxr_ldbh" });
    var ldbh = request.responseText;

    return {
        "wgbz": "0",
        "ldbh": ldbh,
        "rklx": "1",
        "kdrq": utils.users.getDateTime(),
        "cgy_id": utils.users.getUserId(),
        "cgy": utils.users.getUserName(),
        "sqbm": utils.users.getDepartName(),
    };
}

function builder(options, values) {
    console.log(options, values)

    var btnMxWzdm = utils.UUID();
    var btnMxImport = utils.UUID();
    var winImportId = utils.UUID();

    // 元素
    var mainForm = utils.protos.form({
        data: values,
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "入库单号", readonly: true },
                    { view: "richselect", name: "rklx", label: "入库类型", options: utils.dicts["wz_lxr_rklx"], readonly: options["readonly"], required: true, placeholder: "请选择入库类型..." },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "khbh", label: "供应商编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

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
            {
                cols: [
                    { view: "text", name: "htbh", label: "合同号", readonly: options["readonly"], required: true },
                    {
                        view: "search", name: "gcbh", label: "项目编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                var values = $$(mainForm.id).getValues();
                                utils.windows.gcdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["gcbh"]) ? [_.pick(values, "gcbh", "gcmc")] : [],
                                    filter: (row) => row["tybz"] != '1' && row["wgbz"] != '1',
                                    callback(checked) {
                                        var newValues = _.extend(values, _.pick(checked, "gcbh", "gcmc"));
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                });
                            }
                        }
                    },
                    { view: "text", name: "gcmc", label: "项目名称", readonly: true },
                ]
            },
            { view: "textarea", name: "bz", label: "备注", readonly: options["readonly"], placeholder: "请输入备注 ..." },
            {
                cols: [
                    { view: "text", name: "cgy", label: "采购员", readonly: true },
                    { view: "text", name: "sqbm", label: "所属部门", readonly: true },
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                ]
            },
        ],
    });

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
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, footer: { text: "合  计：", colspan: 3 }, css: { "text-align": "center" }, width: 50 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 80
            },
            {
                id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 80
            },
            {
                id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 80
            },
            {
                id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                adjust: true, minWidth: 60
            },
            {
                id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 4),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            {
                id: "taxje", header: { text: "税额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                footer: { content: "summColumn", css: { "text-align": "right" } },
                css: { "text-align": "right" },
                adjust: true, minWidth: 80
            },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null, width: 160 },
            { id: "clph", header: { text: "材料批号", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null, width: 120 },
            {
                id: "scrq", header: { text: "生产日期", css: { "text-align": "center" } }, editor: !options["readonly"] ? "date" : null,
                format: utils.formats.date.format,
                editParse: utils.formats.date.editParse,
                editFormat: utils.formats.date.editFormat,
                css: { "text-align": "center" }, width: 80
            },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "ckmc", header: { text: "默认仓库", css: { "text-align": "center" } }, width: 120 },
            { id: "kwmc", header: { text: "默认库位", css: { "text-align": "center" } }, width: 160 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null, width: 240 },
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
            onDataUpdate(id, data, old) {
                var newData = _.pick(data, "rksl", "cgdjhs", "cgjehs", "taxrate");
                var oldData = _.pick(old, "rksl", "cgdjhs", "cgjehs", "taxrate");

                webix.ajax()
                    .post("/api/sys/data_service?service=JZWZ.calucate", { "new": newData, "old": oldData })
                    .then((res) => {
                        var calcData = res.json();

                        data = _.extend(data, calcData);
                        $$(mxGrid.id).refresh(id);
                    })
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

    /************************* 物资清单导入 *************************/
    function openImport(docId) {
        // 导入字段映射
        var mapping = {
            "wzmc": "物资名称",
            "ggxh": ["规格型号", "型号规格", "型号"],
            "rksl": ["入库数量", "到货数量"],
            "cgjehs": ["含税金额", "金额"],
            "taxrate": "税率",
        };

        webix.ui({
            id: winImportId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 720,
            height: 420,
            animate: { type: "flip", subtype: "vertical" },
            head: "零星入库物资清单导入",
            position: "center",
            body: {
                rows: [
                    utils.protos.importExcel({
                        docId: docId,
                        mapping: mapping,
                        onData(data) {
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.import", { data: data })
                                .then((res) => {
                                    console.log(res.json());

                                    $$(winImportId + "_import").define("data", res.json());

                                    $$(winImportId + "_import").hideOverlay();
                                    $$(winImportId + "_import").refresh();
                                }).fail(() => {
                                    $$(winImportId).hide();
                                });
                        }
                    }),
                    {
                        paddingX: 8,
                        cols: [
                            utils.protos.datatable({
                                id: winImportId + "_import",
                                editable: false,
                                drag: false,
                                sort: false,
                                url: null,
                                leftSplit: 0,
                                rightSplit: 0,
                                data: [],
                                columns: [
                                    // wzrkd_id, zt
                                    // "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "sccjmc", "bylx", "byyq", "ckbh", "ckmc", "kwbh", "kwmc"
                                    // rksl, cgdjhs, cgjehs, taxrate, cgdj, cgje, taxje
                                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                    utils.protos.checkbox({ id: "flag", header: { text: "导入", css: { "text-align": "center" } } }),
                                    { id: "result", header: { text: "匹配结果", css: { "text-align": "center" } }, width: 240 },
                                    { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, width: 80 },
                                    { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, width: 220 },
                                    { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                                    { id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                    { id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                    { id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                    { id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 60 },
                                    { id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                    { id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                    { id: "taxje", header: { text: "税额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                ],
                                styles: {
                                    cellTextColor: function (row, col) { return row["flag"] == "0" ? "red" : "none" }
                                },
                            })
                        ]
                    },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {
                                view: "button", label: "导出", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-microsoft-excel",
                                click() { webix.toExcel($$(winImportId + "_import"), { rawValues: true }) }
                            },
                            {},
                            {
                                view: "button", width: 80, label: "导入", css: "webix_primary",
                                click() {
                                    var allData = $$(winImportId + "_import").serialize(true);

                                    var data = _.filter(allData, (row) => (row["flag"] == "1"));
                                    var rkdid = $$(mainGrid.id).getSelectedId(false, true);
                                    if (_.size(data) < 1 || _.isEmpty(rkdid)) {
                                        webix.message({ type: "error", text: "没有可导入的采购物资记录！" });
                                        return;
                                    }

                                    // 检查是否在列表中，相同的入库单不允许存在重复的物资
                                    for (let i = 0; i < _.size(data); i++) {
                                        var find = $$(mxGrid.id).find((row) => _.isEqual(row["wzbh"], data[i]["wzbh"]), true);
                                        if (!_.isEmpty(find)) {
                                            webix.message({ type: "error", text: "第" + (i + 1) + "行：物资编号【" + data[i]["wzbh"] + "】已存在入库清单中！" });
                                            return;
                                        }
                                    }

                                    // 批量插入
                                    this.disable();
                                    var self = this;
                                    webix.ajax()
                                        .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.patch", { "wzrkd_id": rkdid, "data": data })
                                        .then((res) => {
                                            self.enable();

                                            webix.message({ type: "success", text: "成功导入" + _.size(data) + "条物资！" });
                                            $$(winImportId).hide();
                                            onAfterSelect(rkdid);
                                        }).fail(() => {
                                            self.enable();
                                        });
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winImportId).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: {
                onShow() { $$(winImportId + "_import").showOverlay("正在导入采购物资清单 ...") },
                onHide() { this.close() }
            }
        }).show();
    }


    var btnWzdm = {
        view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
        click() {
            var values = $$(mxGrid.id).serialize(true);

            // 选择物资代码
            utils.windows.wzdm({
                multiple: true,
                checked: [],
                filter: (row) => (row["xyzt"] != '禁用' && _.findIndex(values, (value) => (value["wzbh"] == row["wzbh"])) < 0),
                callback(checked) {
                    // 获取条形码
                    var request = webix.ajax().sync().get("api/sys/auto_nos", { "method": "Patch", "code": "txmvalue", "count": _.size(checked) });
                    var txmvalues = JSON.parse(request.responseText);

                    _.each(checked, (row, index) => {
                        var newRow = _.pick(row, "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "sccjmc", "bylx", "byyq", "ckbh", "ckmc", "kwbh", "kwmc");
                        newRow = _.extend(newRow, { "txmvalue": txmvalues[index], "rksl": 0, "cgdjhs": 0, "cgjehs": 0, "taxrate": 13, "cgdj": 0, "cgje": 0, "taxje": 0 });

                        $$(mxGrid.id).add(newRow);
                    });
                    webix.message({ type: "success", text: "选择" + _.size(checked) + "条物资！" });

                    return true;
                }
            })
        }
    };

    var btnImport = utils.protos.importExcelButton({ label: "物资导入", onImport: openImport });

    // 请假单
    return {
        show() {
            return {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 120 },
                        {
                            rows: [
                                mainForm,
                                { view: "resizer" },
                                {
                                    gravity: 2,
                                    rows: [
                                        {
                                            view: "toolbar", cols: !options["readonly"] ? [
                                                btnWzdm,
                                                { width: 24 },
                                                btnImport,
                                                {}
                                            ] : [{ view: "label", label: "<span style='margin-left:8px'></span>物资入库单明细", height: 38 }]
                                        },
                                        mxGrid,
                                    ]
                                },
                            ]
                        },
                        { width: 120 },
                    ]
                }
            }
        },
        values() {
            if (!$$(mainForm.id).validate()) {
                webix.message({ type: "error", text: "缺少必输项" });
                return;
            };

            // 领料明细
            var rows = $$(mxGrid.id).serialize(true);
            if (_.size(rows) < 1) {
                webix.message({ type: "error", text: "请选择物资入库明细或导入物资清单！" });
                return
            }

            // 是否填写入库数量
            var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["rksl"], 2) <= 0));
            if (index >= 0) {
                webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写入库数量！" });
                return
            }

            // 入库类型不是捐赠入库时，必须填写含税金额及含税单价
            var values = $$(mainForm.id).getValues();
            if (!_.isEqual(values["rklx"], '9')) {
                var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["cgjehs"], 2) <= 0));
                if (index >= 0) {
                    webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写含税金额！" });
                    return
                }

                var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["cgdjhs"], 2) <= 0));
                if (index >= 0) {
                    webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写含税单价！" });
                    return
                }
            }

            // 入库单明细
            values["rows"] = rows;

            return values;
        },
    }
};

export { defaultValues, builder };