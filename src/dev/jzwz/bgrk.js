var qrCode = require("qrcode");

function builder() {
    var winId = utils.UUID();

    const qUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_bgrk";

    var winPrintId = utils.UUID();
    var btnFinish = utils.UUID();
    var btnUnFinish = utils.UUID();

    function onSelectKwdm() {
        var values = $$(form.id).getValues();

        var checked = [];
        if (!_.isEmpty(values["kwbh"])) {
            checked = [_.pick(values, "ckbh", "ckmc", "kwbh", "kwmc")];
        }

        // 选择用户
        utils.windows.kwdm({
            multiple: false,
            checked: checked,
            filter: (row) => (row["bgy_id"].indexOf(utils.users.getUserId()) >= 0),
            callback(checked) {
                $$(form.id).setValues(_.extend(values, _.pick(checked, "ckbh", "ckmc", "kwbh", "kwmc")));
                return true;
            }
        })
    }

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
                                                webix.message({ type: "error", text: "无效或未检验的条形码" });
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
                    { view: "text", name: "clph", label: "材料批号" },
                    { view: "datepicker", name: "scrq", label: "生产日期", stringResult: true, format: utils.formats.date.format },
                ]
            },
            {
                cols: [
                    { view: "text", name: "rksl", label: "入库数量", readonly: true, format: "1,111.00" },
                    { view: "text", name: "hgsl", label: "合格数量", readonly: true, format: "1,111.00" },
                    { view: "text", name: "bhgsl", label: "不合格数量", readonly: true, format: "1,111.00" },
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "ckmc", label: "仓库名称", required: true, readonly: true,
                        on: { onSearchIconClick: onSelectKwdm }
                    },
                    {
                        view: "search", name: "kwmc", label: "库位名称", required: true, readonly: true,
                        on: { onSearchIconClick: onSelectKwdm }
                    },
                    { view: "text", name: "sssl", label: "实收数量", required: true, placeholder: "请填写 实收数量 ...", format: "1,111.00" },
                ]
            },
            { view: "textarea", name: "bgy_bz", label: "保管员备注", placeholder: "请输入备注信息 ..." },
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

        // 默认实收数量等于合格数量
        if (_.isEqual(values["zt"], "5")) {
            values["sssl"] = values["hgsl"];
        }

        $$(form.id).setValues(values);
        if (_.isEqual(values["zt"], "5")) {
            $$(btnFinish).enable();
            $$(btnUnFinish).disable();

            form.actions.readonly(["clph", "scrq", "ckmc", "kwmc", "sssl", "bgy_bz"], false);
        } else if (_.isEqual(values["zt"], "9")) {
            $$(btnFinish).disable();
            $$(btnUnFinish).enable();

            form.actions.readonly(["clph", "scrq", "ckmc", "kwmc", "sssl", "bgy_bz"], true);
        } else {
            $$(btnFinish).disable();
            $$(btnUnFinish).disable();

            form.actions.readonly(["clph", "scrq", "ckmc", "kwmc", "sssl", "bgy_bz"], true);
        }
    }


    /***************************** 选择打印已入库的入库单 *****************************/
    function openPrint() {
        var printGrid = utils.protos.datatable({
            drag: false,
            sort: false,
            multiselect: true,
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query_print",
            data: [],
            save: {},
            rowHeight: 48,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                {
                    id: "qrcode", header: { text: "二维码", css: { "text-align": "center" } }, width: 64,
                    template(obj, common, value) {
                        return `<div class="datatable-qrcode" style='text-align:center;vertical-align:middle'> ` + value + ` </div>`;
                    },
                },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "rkrq", header: { text: "入库时间", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 140 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", fillspace: true, minWidth: 180 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
                { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 80 },
                { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 80 },
                { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 120 },
            ],
            on: {
                onAfterLoad() {
                    this.eachRow((id) => {
                        var row = this.getItem(id);

                        var data = webix.template("#!txmvalue# | #!ldbh# #!wzbh# #!sssl#")(row);
                        qrCode.toString(data, { type: 'image/png', margin: 0 }, function (err, qrcode) {
                            if (err) throw err;

                            row["qrcode"] = qrcode;
                        })
                    }, true);
                }
            }
        });

        webix.ui({
            id: winPrintId, view: "window",
            close: true, modal: true, move: true, width: 720, height: 420,
            head: "入库单打印", position: "center",
            body: {
                rows: [
                    { paddingX: 8, cols: [printGrid] },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", width: 80, label: "打印", css: "webix_primary",
                                click() {
                                    var sel = $$(printGrid.id).getSelectedId(true, true);
                                    if (_.size(sel) < 1) {
                                        webix.message({ type: "error", text: "请选择需要打印的入库明细" });
                                        return
                                    }

                                    var all = _.pluck($$(printGrid.id).serialize(true), "id");

                                    printGrid.actions.hideColumn("rksl", true);
                                    $$(printGrid.id).remove(_.difference(all, sel));

                                    setTimeout(() => {
                                        webix.print($$(printGrid.id), { mode: "landscape" });
                                        $$(winPrintId).hide();
                                    }, 500);
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winPrintId).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    function open() {
        var dlgPager = utils.protos.pager();

        var dlgGrid = utils.protos.datatable({
            editable: false,
            drag: false,
            url: qUrl + "&pager=true",
            leftSplit: 3,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 60 },
                { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 200 },
                { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 180 },
                { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
                { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "rksl", header: { text: "交检数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
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
            width: 720,
            height: 480,
            animate: { type: "flip", subtype: "vertical" },
            head: "选择物资待入库或已入库的入库单",
            position: "center",
            body: {
                paddingX: 12,
                rows: [
                    {
                        rows: [
                            dlgGrid.actions.search({ fields: "txmvalue,ldbh,htbh,khbh,khmc,gcbh,gcmc,wzbh,wzmc,ggxh,bylx,byyq,cgy,jyry,bgy", autoWidth: true }),
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

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        id: btnFinish, view: "button", label: "入库确认", disable: true, autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() {
                            var values = $$(form.id).getValues();
                            if (_.isEmpty(values["txmvalue"]) || _.isEmpty(values["ldbh"]) || _.isEmpty(values["wzbh"])) {
                                webix.message({ type: "error", text: "请输入或选择条形码" });
                                return;
                            }

                            var hgsl = utils.formats.number.editParse(values["hgsl"], 2);
                            var sssl = utils.formats.number.editParse(values["sssl"], 2);
                            if (hgsl != sssl) {
                                webix.message({ type: "error", text: "输入的实收数量不等于合格数量" });
                                return;
                            }

                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.finish", values)
                                .then(
                                    (res) => {
                                        $$(form.id).setValues({});
                                        webix.message({ type: "success", text: "入库确认成功" });

                                        $$(btnFinish).enable();
                                        $$(btnUnFinish).enable();
                                    }
                                );
                        }
                    },
                    {
                        id: btnUnFinish, view: "button", label: "撤销入库", disable: true, autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() {
                            var values = $$(form.id).getValues();
                            if (_.isEmpty(values["txmvalue"]) || _.isEmpty(values["ldbh"]) || _.isEmpty(values["wzbh"])) {
                                webix.message({ type: "error", text: "请输入或选择条形码" });
                                return;
                            }

                            webix.ajax()
                                .post("/api/sys/data_service?service=JZWZ_WZRKDWJMX.unFinish", values)
                                .then(
                                    (res) => {
                                        $$(form.id).setValues({});
                                        webix.message({ type: "success", text: "撤销入库成功" });

                                        $$(btnFinish).enable();
                                        $$(btnUnFinish).enable();
                                    }
                                );
                        }
                    },
                    {},
                    {
                        view: "button", label: "打印入库单", autowidth: true, css: "webix_transparent", type: "icon", icon: "mdi mdi-18px mdi-printer",
                        click() { openPrint() }
                    },
                    {}
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