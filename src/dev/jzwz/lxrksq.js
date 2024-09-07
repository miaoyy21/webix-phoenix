function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJ.query_self";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query";

    var btnCreate = utils.UUID();
    var btnDelete = utils.UUID();
    var btnCommit = utils.UUID();
    var btnUnCommit = utils.UUID();
    var btnMxWzdm = utils.UUID();
    var btnMxImport = utils.UUID();
    var winImportId = utils.UUID();
    var mainPager = utils.protos.pager();

    function onAfterSelect(id) {
        $$(mainForm.id).setValues($$(mainGrid.id).getItem(id));

        $$(mxGrid.id).clearAll();
        webix.ajax()
            .get(mxUrl, { "wzrkd_id": id })
            .then(
                (res) => {
                    var values = res.json();
                    $$(mxGrid.id).define("data", values);

                    if (_.findIndex(values["data"], (row) => (row["zt"] != "0")) >= 0) {
                        $$(mxGrid.id).define("editable", false);
                        $$(btnDelete).disable();
                        $$(btnCommit).disable();

                        if (_.findIndex(values["data"], (row) => (row["zt"] != "0" && row["zt"] != "1")) >= 0) {
                            $$(btnUnCommit).disable();
                        } else {
                            $$(btnUnCommit).enable();
                        }

                        $$(btnMxWzdm).disable();
                        $$(btnMxImport).disable();

                        mainForm.actions.required(["rklx", "khbh", "htbh", "gcbh"], false);
                        mainForm.actions.readonly(["rklx", "khbh", "htbh", "gcbh", "bz"], true);

                        if (_.findIndex(values["data"], (row) => (row["zt"] == "0" || row["zt"] == "1")) >= 0) {
                            mxGrid.actions.hideColumn("buttons", false);
                        } else {
                            mxGrid.actions.hideColumn("buttons", true);
                        }
                    } else {
                        $$(mxGrid.id).define("editable", true);
                        $$(btnDelete).enable();
                        $$(btnCommit).enable();
                        $$(btnUnCommit).disable();
                        $$(btnMxWzdm).enable();
                        $$(btnMxImport).enable();

                        mainForm.actions.required(["rklx", "khbh", "htbh", "gcbh"], true);
                        mainForm.actions.readonly(["rklx", "khbh", "htbh", "gcbh", "bz"], false);

                        mxGrid.actions.hideColumn("buttons", false);
                    }
                }
            );
    }

    // 列表
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&wgbz=0",
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJ.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        on: {
            onDataUpdate(id, newValues) { $$(mainForm.id).setValues(newValues) },
            onAfterSelect: (selection, preserve) => onAfterSelect(selection.id),
            onAfterLoad() {
                if (this.count() < 1) {
                    $$(mainForm.id).setValues({});
                    mainForm.actions.readonly(["rklx", "khbh", "htbh", "gcbh", "bz"], true);

                    $$(mxGrid.id).define("data", []);
                }
            }
        },
        pager: mainPager.id,
    });

    function onMainFormChange() {
        var oldValues = $$(mainGrid.id).getSelectedItem();
        var newValues = $$(mainForm.id).getValues();

        if (_.isEqual(
            _.pick(oldValues, (value, key) => !_.isEmpty(value) && key != "id"),
            _.pick(newValues, (value, key) => !_.isEmpty(value) && key != "id"),
        ) || !_.isEqual(oldValues.id, newValues.id)) { return }

        $$(mainGrid.id).updateItem(oldValues.id, newValues);
    }

    // 表单
    var mainForm = utils.protos.form({
        rows: [
            {
                cols: [
                    { view: "richselect", name: "rklx", label: "入库类型", options: utils.dicts["wz_lxr_rklx"], required: true, placeholder: "请选择入库类型..." },
                    { view: "text", name: "ldbh", label: "入库单号", readonly: true },
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "khbh", label: "供应商编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (this.config.readonly) return;

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
                    { view: "text", name: "htbh", label: "合同号", required: true },
                    {
                        view: "search", name: "gcbh", label: "项目编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (this.config.readonly) return;

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
            { view: "textarea", name: "bz", label: "备注", placeholder: "请输入备注 ..." },
            {
                cols: [
                    { view: "text", name: "create_user_name_", label: "编制人员", readonly: true },
                    { view: "datepicker", name: "create_at_", label: "编制日期", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                ]
            },
        ],
        on: {
            onChange: onMainFormChange,
            onValues: onMainFormChange
        }
    });

    // 明细
    var mxGrid = utils.protos.datatable({
        editable: true,
        drag: false,
        url: null,
        leftSplit: 4,
        rightSplit: 1,
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.save_lxrksq",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 60 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 180 },
            { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
                adjust: true, minWidth: 80
            },
            {
                id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, editor: "text",
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": "#d5f5e3" },
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
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "taxje", header: { text: "税额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, editor: "text", width: 160 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, editor: "combo", options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "clph", header: { text: "材料批号", css: { "text-align": "center" } }, editor: "text", width: 120 },
            {
                id: "scrq", header: { text: "生产日期", css: { "text-align": "center" } }, editor: "date",
                format: utils.formats.date.format,
                editParse: utils.formats.date.editParse,
                editFormat: utils.formats.date.editFormat,
                css: { "text-align": "center" }, width: 80
            },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: "text", width: 240 },
            { id: "tjrq", header: { text: "提交日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "create_user_name_", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
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
            onItemClick(cell, e, node) {
                var values = $$(mxGrid.id).getItem(cell["row"]);
                if (!_.isEqual(values["zt"], "0")) {
                    return;
                }

                if (_.isEqual(cell["column"], "ckmc")) {
                    // 选择仓库
                    var checked = !_.isEmpty(values["ckbh"]) ? [{ "ckbh": values["ckbh"], "ckmc": values["ckmc"] }] : [];
                    utils.windows.ckdm({
                        multiple: false,
                        checked: checked,
                        callback(checked) {
                            $$(mxGrid.id).updateItem(cell["row"], _.extend(values, { "ckbh": checked["ckbh"], "ckmc": checked["ckmc"] }))
                            return true;
                        }
                    })
                } else if (_.isEqual(cell["column"], "byyq")) {
                    // 选择检验要求
                    var checked = !_.isEmpty(values["byyq"]) ? values["byyq"].split(",") : [];
                    utils.windows.dicts({
                        title: "检验要求",
                        kind: "md_jyyq",
                        checked: checked,
                        callback(selected) {
                            $$(mxGrid.id).updateItem(cell["row"], _.extend(values, { "byyq": _.pluck(selected, "id").join(",") }))
                            return true;
                        }
                    })
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
                                .then(
                                    (res) => {
                                        console.log(res.json());

                                        $$(winImportId + "_import").define("data", res.json());

                                        $$(winImportId + "_import").hideOverlay();
                                        $$(winImportId + "_import").refresh();
                                    }
                                );
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
                                    // "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "sccjmc", "bylx", "byyq", "ckbh", "ckmc"
                                    // rksl, cgdjhs, cgjehs, taxrate, cgdj, cgje, taxje
                                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                    utils.protos.checkbox({ id: "flag", header: { text: "导入", css: { "text-align": "center" } } }),
                                    { id: "result", header: { text: "匹配结果", css: { "text-align": "center" } }, width: 240 },
                                    { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, width: 80 },
                                    {
                                        id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } },
                                        template(row) {
                                            var text = webix.template("#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#")(row);
                                            return row["flag"] == "1" ? text : "<span style='color:red'>" + text + "</span>";
                                        }, width: 180
                                    },
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

                                    for (let i = 0; i < _.size(data); i++) {
                                        var newRow = _.omit(data[i], "id");
                                        $$(mxGrid.id).add(_.extend(newRow, { "wzrkd_id": rkdid, "zt": "0" }));
                                    }

                                    setTimeout(() => {
                                        webix.message({ type: "success", text: "成功导入" + _.size(data) + "条物资！" });
                                        $$(winImportId).hide();
                                    }, 500)
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

    // 打印的UI窗口
    var printId = utils.UUID();
    var printView = {
        id: printId,
        height: 0.001,
        view: "scrollview",
        body: {
            rows: [
                utils.protos.form({
                    id: printId + "_form",
                    data: {},
                    rows: [
                        {
                            type: "line",
                            cols: [
                                {},
                                { view: "label", align: "center", template: "<span style='font-size:36px'>物资零星入库单</span>", height: 60 },
                                {}
                            ]
                        },
                        {
                            cols: [
                                { view: "text", name: "ldbh", label: "入库单号：" },
                                { view: "text", name: "kdrq", label: "开单日期：" },
                                { view: "text", name: "create_user_name_", label: "采购员：" },
                            ]
                        },
                        {
                            cols: [
                                { view: "text", name: "khbh", label: "供应商编号：" },
                                { view: "text", name: "khmc", gravity: 2, label: "供应商名称：" },
                            ]
                        },
                        {
                            cols: [
                                { view: "text", name: "gcbh", label: "项目编号：" },
                                { view: "text", name: "gcmc", gravity: 2, label: "项目名称：" },
                            ]
                        },
                    ],
                    elementsConfig: { labelAlign: "right", labelWidth: 100, clear: false },
                }),
                utils.protos.datatable({
                    id: printId + "_datatable",
                    data: [],
                    select: false,
                    autoheight: true,
                    columns: [
                        { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                        { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                        { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                        { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 220 },
                        { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                        { id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
                        { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
                        { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, fillspace: true },
                    ],
                })
            ]
        }
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "richselect", options: utils.dicts["wgzt"], width: 120, value: "0", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&wgbz=" + newValue);

                                if (_.isEqual(newValue, "1")) {
                                    $$(btnCreate).disable();
                                    $$(btnCommit).disable();
                                    $$(btnUnCommit).disable();

                                    $$(btnDelete).disable();
                                    $$(btnMxWzdm).disable();
                                    $$(btnMxImport).disable();
                                } else {
                                    $$(btnCreate).enable();
                                }
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    { width: 24 },
                    mainGrid.actions.add({ id: btnCreate, label: "新建单据", callback: () => ({ "wgbz": "0", "rklx": "1" }) }),
                    mainGrid.actions.remove({ id: btnDelete, label: "删除单据" }),
                    {
                        id: btnCommit, view: "button", label: "提交检验", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJ.commit", { "id": id })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "提交检验成功" });
                                        onAfterSelect(id);
                                    }
                                );
                        }
                    },
                    {
                        id: btnUnCommit, view: "button", label: "撤销提交", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            var id = $$(mainGrid.id).getSelectedId(false, true);
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJ.unCommit", { "id": id })
                                .then(
                                    (res) => {
                                        webix.message({ type: "success", text: "撤销提交成功" });
                                        onAfterSelect(id);
                                    }
                                );
                        }
                    },
                    {},
                    {
                        view: "button", label: "打印入库单", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-printer",
                        click() {
                            var data = $$(mainForm.id).getValues();
                            var rows = $$(mxGrid.id).serialize(true);

                            console.log(data, rows);
                            $$(printId + "_form").setValues(data);
                            $$(printId + "_datatable").define("data", rows);

                            setTimeout(() => {
                                webix.print($$(printId), { fit: data });
                            }, 500);
                        }
                    },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "scrollview",
                        width: 280,
                        body: {
                            rows: [
                                { view: "toolbar", cols: [mainGrid.actions.search({ fields: "ldbh,htbh,khbh,khmc,gcbh,gcmc", autoWidth: true })] },
                                mainGrid,
                                mainPager
                            ],
                        },
                    },
                    { view: "resizer" },
                    {
                        view: "scrollview",
                        body: {
                            rows: [
                                {
                                    view: "scrollview",
                                    gravity: 1,
                                    body: mainForm,
                                },
                                { view: "resizer" },
                                {
                                    gravity: 2,
                                    rows: [
                                        {
                                            view: "toolbar", cols: [
                                                {
                                                    id: btnMxWzdm, view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
                                                    click() {
                                                        var values = $$(mxGrid.id).serialize(true);
                                                        console.log(values)

                                                        // 选择物资代码
                                                        utils.windows.wzdm({
                                                            multiple: true,
                                                            checked: [],
                                                            filter: (row) => (row["xyzt"] != '禁用' && _.findIndex(values, (value) => (value["wzbh"] == row["wzbh"])) < 0),
                                                            callback(checked) {
                                                                var rkdid = $$(mainGrid.id).getSelectedId(false, true);
                                                                _.each(checked, (wzdm) => {
                                                                    var data = _.pick(wzdm, "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "jldw", "sccjmc", "bylx", "byyq", "ckbh", "ckmc");
                                                                    $$(mxGrid.id).add(_.extend({}, data, {
                                                                        "wzrkd_id": rkdid, "zt": "0",
                                                                        "rksl": 0, "cgdjhs": 0, "cgjehs": 0, "taxrate": 13, "cgdj": 0, "cgje": 0,
                                                                    }));
                                                                });

                                                                return true;
                                                            }
                                                        })
                                                    }
                                                },
                                                { width: 24 },
                                                utils.protos.importExcelButton({ id: btnMxImport, label: "物资导入", onImport: openImport }),
                                                { width: 24 },
                                                {
                                                    view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                                                    click() {
                                                        var rkdid = $$(mainGrid.id).getSelectedId(false, true);
                                                        onAfterSelect(rkdid);
                                                    }
                                                },
                                                {}
                                            ]
                                        },
                                        mxGrid
                                    ]
                                },
                                printView
                            ]
                        },
                    },
                ]
            },
        ]
    }
}

export { builder }