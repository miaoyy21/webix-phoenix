var qrCode = require("qrcode");

function builder() {
    var winId = utils.UUID();
    var winImportId = utils.UUID();
    var formId = winId + "_form";
    var pager = utils.protos.pager();

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: false,
        leftSplit: 5,
        rightSplit: 1,
        url: "/api/sys/data_service?service=JZMD_WZDM.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=JZMD_WZDM.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "xyzt", header: { text: "选用要求", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzmc", header: { text: "物资名称", css: { "text-align": "center" } }, width: 120 },
            { id: "ggxh", header: { text: "规格型号", css: { "text-align": "center" } }, width: 180 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "wzph", header: { text: "物资牌号", css: { "text-align": "center" } }, width: 120 },
            { id: "bzdh", header: { text: "标准代号", css: { "text-align": "center" } }, width: 180 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
            { id: "ckmc", header: { text: "默认仓库", css: { "text-align": "center" } }, width: 120 },
            { id: "kwmc", header: { text: "默认库位", css: { "text-align": "center" } }, width: 160 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, minWidth: 180 },
            {
                id: "buttons",
                width: 120,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="编辑" type="button" class="button_edit webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"/> </button>
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                                <button webix_tooltip="打印" type="button" class="button_print webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_primary_icon mdi mdi-18px mdi-fingerprint"/> </button>
                            </div>`,
            }
        ],
        onClick: {
            button_edit(e, item) {
                var row = this.getItem(item.row);
                open(_.extend({}, row, { "operation": "update" }));
            },
            button_print(e, item) {
                var row = this.getItem(item.row);
                openPrint(row);
            },
        },
        styles: {
            cellTextColor: function (row, col) { return row["xyzt"] == "禁用" ? "red" : "none" }
        },
        pager: pager.id
    });

    /******************************************* 打开编辑窗口 *******************************************/
    function open(options) {
        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 600,
            height: 450,
            animate: { type: "flip", subtype: "vertical" },
            head: (options["operation"] == "insert" ? "创建" : "修改") + "物资标准库",
            position: "center",
            body: {
                rows: [
                    {
                        view: "scrollview",
                        scroll: "y",
                        body: {
                            id: formId,
                            view: "form",
                            data: options,
                            rows: [
                                {
                                    cols: [
                                        { view: "text", name: "wzbh", label: "物资编号", disabled: true },
                                        {
                                            view: "richselect", name: "xyzt", label: "选用要求", options: utils.dicts["md_xyzt"], required: true, placeholder: "请选择选用要求...",
                                            on: {
                                                onChange(val) {
                                                    var values = $$(formId).getValues();

                                                    if (_.isEqual(val, "禁用")) {
                                                        $$(formId).setValues(_.extend(values, { "jyry": utils.users.getUserName(), "jyrq": utils.users.getDateTime() }));
                                                    } else {
                                                        $$(formId).setValues(_.extend(values, { "jyry": "", "jyrq": "" }));
                                                    }
                                                },
                                            }
                                        },
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "text", name: "wzmc", label: "物资名称", required: true },
                                        { view: "text", name: "ggxh", label: "规格型号", required: true },
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "text", name: "wzph", label: "物资牌号" },
                                        { view: "text", name: "bzdh", label: "标准代号" }
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "text", name: "sccjmc", label: "生产厂家" },
                                        { view: "richselect", name: "jldw", label: "计量单位", options: utils.dicts["md_jldw"], required: true, placeholder: "请选择计量单位..." },
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "richselect", name: "bylx", label: "报验类型", options: utils.dicts["md_bylx"], required: true, placeholder: "请选择报验类型...",
                                            on: {
                                                onChange(val) {
                                                    _.each($$(formId).elements, (v, k) => {
                                                        if (_.isEqual(k, "byyq")) {
                                                            var element = $$(formId).elements[k];

                                                            if (_.isEqual(val, "无需报验")) {
                                                                element.define("required", false);
                                                            } else {
                                                                element.define("required", true);
                                                            }

                                                            element.refresh();
                                                        }
                                                    })
                                                },
                                            }
                                        },
                                        {
                                            view: "search", name: "byyq", label: "检验要求", readonly: true, required: true,
                                            on: {
                                                onSearchIconClick() {
                                                    var values = $$(formId).getValues();

                                                    var checked = [];
                                                    if (!_.isEmpty(values["byyq"])) {
                                                        checked = values["byyq"].split(",");;
                                                    }

                                                    utils.windows.dicts({
                                                        title: "检验要求",
                                                        kind: "md_jyyq",
                                                        checked: checked,
                                                        callback(selected) {
                                                            $$(formId).setValues(_.extend(values, { "byyq": _.pluck(selected, "id").join(",") }));
                                                            return true;
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    ]
                                },
                                { view: "textarea", name: "bz", label: "备注", placeholder: "请输入备注 ..." },
                                {
                                    cols: [
                                        { view: "text", name: "jyry", label: "禁用人员", readonly: true },
                                        { view: "datepicker", name: "jyrq", label: "禁用日期", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                                    ]
                                },
                                { view: "textarea", name: "jyyy", label: "禁用原因", placeholder: "请输入禁用原因 ..." },
                                {
                                    cols: [
                                        { view: "text", name: "create_user_name_", label: "创建人员", readonly: true },
                                        { view: "datepicker", name: "create_at_", label: "创建日期", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                                    ]
                                },
                            ],
                            elementsConfig: { labelAlign: "right", clear: false },
                        }
                    },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", width: 80, label: "保存", css: "webix_primary",
                                click() {
                                    $$(formId).clearValidation();
                                    if (!$$(formId).validate()) return;

                                    var row = $$(formId).getValues();
                                    webix.ajax().post(datatable.save.url, row).then(
                                        (res) => {
                                            webix.dp($$(datatable.id)).ignore(
                                                () => {
                                                    if (_.isEqual(row["operation"], "insert")) {
                                                        utils.grid.add($$(datatable.id), _.extend(row, res.json()));
                                                    } else {
                                                        $$(datatable.id).updateItem(row["id"], _.extend(row, res.json()));
                                                    }

                                                    $$(winId).hide() && webix.message({ type: "success", text: "保存成功" });
                                                }
                                            );
                                        },
                                    );
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winId).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    /************************************************** 上传数据匹配 **************************************************/
    function openImport(docId) {
        // 导入字段映射
        var mapping = {
            "wzmc": "物资名称",
            "ggxh": ["规格型号", "型号规格", "型号"],
            "wzph": ["物资牌号", "材料牌号", "牌号"],
            "bzdh": ["标准代号", "代号"],
            "jldw": ["计量单位", "单位"],
            "sccjmc": "生产厂家",
            "bylx": "报验类型",
            "byyq": ["报验要求", "检验要求"],
            "bz": "备注"
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
            head: "物资匹配导入",
            position: "center",
            body: {
                rows: [
                    utils.protos.importExcel({
                        docId: docId,
                        mapping: mapping,
                        onData(data) {
                            webix.ajax()
                                .post("/api/sys/data_service?service=JZMD_WZDM.match", { data: data })
                                .then(
                                    (res) => {
                                        $$(winImportId + "_import").define("data", res.json());
                                        $$(winImportId + "_import").hideOverlay();
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
                                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                    utils.protos.checkbox({ id: "flag", header: { text: "导入", css: { "text-align": "center" } } }),
                                    { id: "result", header: { text: "匹配结果", css: { "text-align": "center" } }, width: 240 },
                                    { id: "wzmc", header: { text: "物资名称", css: { "text-align": "center" } }, width: 120 },
                                    { id: "ggxh", header: { text: "规格型号", css: { "text-align": "center" } }, width: 160 },
                                    { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                                    { id: "wzph", header: { text: "物资牌号", css: { "text-align": "center" } }, width: 120 },
                                    { id: "bzdh", header: { text: "标准代号", css: { "text-align": "center" } }, width: 180 },
                                    { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
                                    { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                                    { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
                                    { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, minWidth: 180 },
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
                                    if (_.size(data) < 1) {
                                        webix.message({ type: "error", text: "没有可导入的物资！" });
                                        return;
                                    }

                                    this.disable();

                                    var self = this;
                                    webix.ajax().
                                        post("/api/sys/data_service?service=JZMD_WZDM.patch", { "data": data })
                                        .then((res) => {
                                            self.enable();

                                            webix.message({ type: "success", text: "成功导入" + _.size(data) + "条物资！" });
                                            $$(winImportId).hide();

                                            $$(datatable.id).clearAll();
                                            $$(datatable.id).load($$(datatable.id).config.url);
                                        }).fail(function (xhr) {
                                            self.enable();
                                        });;
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
                onShow() { $$(winImportId + "_import").showOverlay("正在匹配清单 ...") },
                onHide() { this.close() }
            }
        }).show();
    }

    // 打印的UI窗口
    function openPrint(options) {
        var winId = utils.UUID();

        qrCode.toDataURL(webix.template("#!wzbh# | #!wzmc#/#!ggxh#")(options), { type: 'image/png', margin: 0 }, function (err, url) {
            if (err) throw err;

            webix.ui({
                id: winId, view: "window", position: "center",
                close: true, modal: true, head: "打印二维码【" + options["wzbh"] + " &nbsp; &nbsp; " + webix.template("#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#")(options) + "】",
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
                        {
                            id: winId + "_print",
                            paddingY: 24,
                            cols: [
                                {
                                    view: "template",
                                    borderless: true,
                                    width: 160,
                                    template: `<img src='` + url + `' style='width:100%; height:100%;'>`,
                                },
                                utils.protos.form({
                                    data: options,
                                    type: "clean",
                                    borderless: true,
                                    width: 280,
                                    rows: [
                                        { view: "text", name: "wzbh", label: "物资编号：" },
                                        { view: "text", name: "wzmc", label: "物资名称：" },
                                        { view: "text", name: "ggxh", label: "规格型号：" },
                                        { view: "text", name: "wzph", label: "物资牌号：" },
                                        { view: "text", name: "bzdh", label: "标准代号：" },
                                    ],
                                    elementsConfig: { labelAlign: "right", labelWidth: 80, readonly: true, clear: false },
                                }),
                            ]
                        },
                    ]
                },
                on: { onHide() { this.close() } }
            }).show();
        })
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            open({
                                "operation": "insert",
                                "xyzt": "在用",
                                "create_user_name_": utils.users.getUserName(),
                                "create_at_": utils.users.getDateTime(),
                            });
                        }
                    },
                    datatable.actions.refresh(),
                    { width: 24 },
                    utils.protos.importExcelButton({ onImport: openImport }),
                    {},
                    datatable.actions.search({ fields: "wzbh,wzmc,ggxh,xyzt,sccjmc,bylx,byyq,ckmc,cgy" }),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };