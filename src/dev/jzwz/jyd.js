
function builder() {
    var winId = utils.UUID();

    const qUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_jyd";

    var btnCheck = utils.UUID();
    var btnUnCheck = utils.UUID();
    var btnPrint = utils.UUID();

    var form = utils.protos.form({
        data: {},
        rows: [
            {
                cols: [
                    {
                        name: "txmvalue", view: "search", label: "条形码", required: true,
                        on: {
                            onEnter() {
                                var txmvalue = this.getValue();
                                if (_.isEmpty(txmvalue)) return;

                                webix.extend($$(form.id), webix.ProgressBar).showProgress();
                                webix.ajax()
                                    .get(qUrl, { "txmvalue": txmvalue })
                                    .then(
                                        (res) => {
                                            $$(form.id).hideProgress();

                                            var values = res.json()["data"];
                                            var size = _.size(values);
                                            if (size == 0) {
                                                onLoad({ "txmvalue": txmvalue });
                                                webix.message({ type: "error", text: "无效的条形码" });
                                                return;
                                            } else if (size > 1) {
                                                onLoad({ "txmvalue": txmvalue });
                                                webix.message({ type: "error", text: "【异常】检索到" + size + "个条形码" });
                                                return;
                                            } else {
                                                onLoad(_.first(values));
                                            }
                                        }
                                    );
                            },
                            onSearchIconClick: open
                        }
                    },
                    { view: "text", name: "ldbh", label: "入库单号", readonly: true },
                    { view: "richselect", name: "zt", label: "状态", options: utils.dicts["wz_rkzt"], readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "khmc", label: "供应商", readonly: true },
                    { view: "text", name: "htbh", label: "采购合同号", readonly: true },
                    { view: "text", name: "gcmc", label: "项目名称", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "wzbh", label: "物资编号", readonly: true },
                    { view: "text", name: "wzms", label: "物资描述", readonly: true },
                    { view: "text", name: "jldw", label: "计量单位", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "sccjmc", label: "生产厂家", readonly: true },
                    { view: "text", name: "clph", label: "材料批号", readonly: true },
                    { view: "text", name: "scrq", label: "生产日期", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "jydd", label: "检验地点", placeholder: "请填写 检验地点 ..." },
                    { view: "text", name: "bylx", label: "报验类型", readonly: true },
                    { view: "text", name: "byyq", label: "检验要求", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "rksl", label: "交检数量", readonly: true, format: "1,111.00" },
                    {
                        view: "text", name: "hgsl", label: "合格数量", required: true, placeholder: "请填写 合格数量 ...", format: "1,111.00",
                        on: {
                            onChange(newValue) {
                                var values = $$(form.id).getValues();

                                var rksl = utils.formats.number.editParse(values["rksl"], 2);
                                var hgsl = utils.formats.number.editParse(newValue, 2);
                                var bhgsl = 0;
                                if (hgsl > rksl) {
                                    hgsl = rksl;
                                    bhgsl = 0;
                                    webix.message({ type: "error", text: "合格数量不能大于交检数量" });
                                } else {
                                    bhgsl = rksl - hgsl;
                                }

                                $$(form.id).setValues(_.extend(values, { "hgsl": hgsl, "bhgsl": bhgsl }));
                            }
                        }
                    },
                    { view: "text", name: "bhgsl", label: "不合格数量", readonly: true, placeholder: "根据合格数量计算 ...", format: "1,111.00" },
                ]
            },
            { view: "textarea", name: "jyjl", label: "检验结论", placeholder: "请输入检验结论 ..." },
            { view: "textarea", name: "jynr", label: "检验内容", placeholder: "请输入检验内容 ..." },
            { view: "textarea", name: "bhgsm", label: "不合格说明", placeholder: "请输入不合格说明 ..." },
            { view: "textarea", name: "jyry_bz", label: "检验员备注", placeholder: "请输入备注信息 ..." },
            {
                cols: [
                    { view: "text", name: "cgy", label: "采购员", readonly: true },
                    { view: "text", name: "jyry", label: "检验员", readonly: true },
                    { view: "text", name: "bgy", label: "保管员", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                    { view: "text", name: "jyrq", label: "检验日期", readonly: true },
                    { view: "text", name: "rkrq", label: "入库日期", readonly: true },
                ]
            },
        ],
    });

    function onLoad(values) {
        // 根据显示要求重新构建
        values["wzms"] = webix.template("#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#")(values);

        // 默认全部合格
        if (_.isEqual(values["zt"], "1")) {
            values["hgsl"] = values["rksl"];
            values["bhgsl"] = 0;
            values["jyjl"] = "合格";
        }
        $$(form.id).setValues(values);

        if (_.isEqual(values["zt"], "1")) {
            $$(btnCheck).enable();
            $$(btnUnCheck).disable();

            form.actions.readonly(["jydd", "hgsl", "jynr", "jyjl", "bhgsm", "jyry_bz"], false);
        } else if (_.isEqual(values["zt"], "5")) {
            $$(btnCheck).disable();
            $$(btnUnCheck).enable();

            form.actions.readonly(["jydd", "hgsl", "jynr", "jyjl", "bhgsm", "jyry_bz"], true);
        } else {
            $$(btnCheck).disable();
            $$(btnUnCheck).disable();

            form.actions.readonly(["jydd", "hgsl", "jynr", "jyjl", "bhgsm", "jyry_bz"], true);
        }
    }

    function open() {
        var dlgPager = utils.protos.pager();

        var dlgGrid = utils.protos.datatable({
            editable: false,
            drag: false,
            url: qUrl + "&pager=true",
            leftSplit: 3,
            rightSplit: 0,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 60 },
                { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 220 },
                { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 180 },
                { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
                { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "rksl", header: { text: "交检数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, width: 80 },
                { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
                { id: "jydd", header: { text: "检验地点", css: { "text-align": "center" } }, width: 80 },
                { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "jynr", header: { text: "检验内容", css: { "text-align": "center" } }, width: 180 },
                { id: "jyjl", header: { text: "检验结论", css: { "text-align": "center" } }, width: 180 },
                { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            ],
            pager: dlgPager.id,
        });

        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 680,
            height: 420,
            animate: { type: "flip", subtype: "vertical" },
            head: "选择物资待检或已检的入库单",
            position: "center",
            body: {
                paddingX: 12,
                rows: [
                    {
                        rows: [
                            {
                                view: "toolbar",
                                height: 38,
                                cols: [
                                    dlgGrid.actions.search({ fields: "txmvalue,ldbh,htbh,khbh,khmc,gcbh,gcmc,wzbh,wzmc,ggxh,bylx,byyq,cgy,jyry,bgy", autoWidth: true }),
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
                                    var values = $$(dlgGrid.id).getSelectedItem();
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

    // 打印的UI窗口
    function openPrint(options) {
        console.log(options);

        var winId = utils.UUID();

        // 供应商和项目
        options["kh_ms"] = webix.template("#!khbh# | #!khmc#")(options);
        options["gc_ms"] = webix.template("#!gcbh# | #!gcmc#")(options);
        options["bz"] = webix.template("#!jyjl#  #!jynr#  #!bhgsm#  #!jyry_bz#")(options);

        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            animate: { type: "flip", subtype: "vertical" },
            head: "打印报验单【" + options["ldbh"] + " &nbsp; &nbsp; " + options["wzbh"] + " | " + options["wzms"] + "】",
            position: "center",
            body: {
                paddingX: 12,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "打印报验单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
                                click() {
                                    webix.print($$(winId + "_print"));
                                    $$(winId).hide();
                                }
                            },
                        ]
                    },
                    {
                        id: winId + "_print",
                        type: "line",
                        rows: [
                            utils.protos.form({
                                data: options,
                                type: "line",
                                rows: [
                                    {
                                        cols: [
                                            {},
                                            { view: "label", align: "center", template: "<span style='font-size:24px; font-weight:500'>物资报验单</span>", height: 48 },
                                            {}
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", gravity: 2, name: "ldbh", label: "入库单号：" },
                                            {},
                                            { view: "text", gravity: 3, name: "htbh", label: "合同号：" },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "kh_ms", label: "供应商：" },
                                            { view: "text", name: "gc_ms", label: "项目：" },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "wzbh", label: "报验物资：" },
                                            { view: "text", gravity: 3, name: "wzms" },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "bylx", label: "报验类型：" },
                                            { view: "text", gravity: 3, name: "byyq", label: "检验要求：" },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "rksl", label: "交检数量：" },
                                            { view: "text", name: "hgsl", label: "合格数量：" },
                                            { view: "text", name: "jldw", label: "计量单位：" },
                                            { view: "text", name: "jydd", label: "检验地点：" },
                                        ]
                                    },
                                    { view: "textarea", name: "bz", label: "备注：", maxHeight: 48 },
                                    // {
                                    //     cols: [
                                    //         { view: "label", label: "采购员：", align: "right", width: 80 },
                                    //         { view: "text", name: "cgy" },
                                    //         { view: "text", name: "kdrq" },
                                    //         { view: "label", label: "部门领导：", align: "right", width: 80 },
                                    //         { view: "text", name: "bmld" },
                                    //         { view: "text", name: "bmld_shrq" },
                                    //     ]
                                    // },
                                    {
                                        cols: [
                                            { view: "text", name: "cgy", label: "采购员：" },
                                            { view: "text", name: "kdrq" },
                                            { view: "text", name: "bmld", label: "部门领导：" },
                                            { view: "text", name: "bmld_shrq" },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "text", name: "jyry", label: "检验员：" },
                                            { view: "text", name: "jyrq" },
                                            { gravity: 2 },
                                        ]
                                    },
                                ],
                                elementsConfig: { labelAlign: "right", labelWidth: 80, readonly: true, clear: false },
                            }),
                            { height: 4 },
                            {
                                view: "toolbar", borderless: true,
                                cols: [
                                    {
                                        cols: [
                                            { view: "label", label: "采购员：", align: "right", width: 120 },
                                            utils.protos.signer(options["cgy_id"]),
                                            {}
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "label", label: "部门领导：", align: "right", width: 120 },
                                            utils.protos.signer(options["bmld_id"]),
                                            {}
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "label", label: "检验员：", align: "right", width: 120 },
                                            utils.protos.signer(options["jyry_id"]),
                                            {}
                                        ]
                                    },
                                ]
                            },
                            { height: 12 },
                        ]
                    },
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        id: btnCheck, view: "button", label: "检验确认", disable: true, autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            var values = $$(form.id).getValues();
                            if (_.isEmpty(values["txmvalue"]) || _.isEmpty(values["ldbh"]) || _.isEmpty(values["wzbh"])) {
                                webix.message({ type: "error", text: "请输入或选择条形码" });
                                return;
                            }

                            var rksl = utils.formats.number.editParse(values["rksl"], 2);
                            var hgsl = utils.formats.number.editParse(values["hgsl"], 2);
                            var bhgsl = utils.formats.number.editParse(values["bhgsl"], 2);
                            if (rksl != hgsl + bhgsl) {
                                webix.message({ type: "error", text: "请输入合格数量" });
                                return;
                            }

                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.check", values)
                                .then(
                                    (res) => {
                                        $$(form.id).setValues({});
                                        webix.message({ type: "success", text: "检验确认成功" });

                                        $$(btnCheck).enable();
                                        $$(btnUnCheck).enable();
                                    }
                                );
                        }
                    },
                    {
                        id: btnUnCheck, view: "button", label: "撤销检验", disable: true, autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            var values = $$(form.id).getValues();
                            if (_.isEmpty(values["txmvalue"]) || _.isEmpty(values["ldbh"]) || _.isEmpty(values["wzbh"])) {
                                webix.message({ type: "error", text: "请输入或选择条形码" });
                                return;
                            }

                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.unCheck", values)
                                .then(
                                    (res) => {
                                        $$(form.id).setValues({});
                                        webix.message({ type: "success", text: "撤销检验成功" });

                                        $$(btnCheck).enable();
                                        $$(btnUnCheck).enable();
                                    }
                                );
                        }
                    },
                    { width: 24 },
                    {
                        id: btnPrint, view: "button", label: "打印报验单", disable: true, autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-cloud-print-outline",
                        click() {
                            var values = $$(form.id).getValues();
                            if (!_.isEqual(values["zt"], "5") && !_.isEqual(values["zt"], "9")) {
                                webix.message({ type: "error", text: "不允许打印未检验的入库单" });
                                return;
                            }

                            openPrint(values);
                            // var values = $$(form.id).getValues();
                            // if (_.isEmpty(values["txmvalue"]) || _.isEmpty(values["ldbh"]) || _.isEmpty(values["wzbh"])) {
                            //     webix.message({ type: "error", text: "请输入或选择条形码" });
                            //     return;
                            // }

                            // var rksl = utils.formats.number.editParse(values["rksl"], 2);
                            // var hgsl = utils.formats.number.editParse(values["hgsl"], 2);
                            // var bhgsl = utils.formats.number.editParse(values["bhgsl"], 2);
                            // if (rksl != hgsl + bhgsl) {
                            //     webix.message({ type: "error", text: "请输入合格数量" });
                            //     return;
                            // }

                            // webix.ajax()
                            //     .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.check", values)
                            //     .then(
                            //         (res) => {
                            //             $$(form.id).setValues({});
                            //             webix.message({ type: "success", text: "检验确认成功" });

                            //             $$(btnCheck).enable();
                            //             $$(btnUnCheck).enable();
                            //         }
                            //     );
                        }
                    },
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 120 },
                        form,
                        { width: 120 },
                    ]
                }
            }
        ],
    };
}

export { builder };