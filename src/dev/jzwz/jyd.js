
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

        function onOK() {
            var values = $$(dlgGrid.id).getSelectedItem();
            if (_.isEmpty(values)) return;

            onLoad(values);
            $$(winId).hide();
        }

        var dlgGrid = utils.protos.datatable({
            editable: false,
            drag: false,
            url: qUrl + "&pager=true",
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
            on: { onItemDblClick: onOK },
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
            head: "选择物资待检或已检的入库单",
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
                            { view: "button", label: "确定", minWidth: 88, autowidth: true, css: "webix_primary", click: onOK },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }


    /***************************** 选择打印已检验的入库单 *****************************/
    function openSelectPrint() {
        var printSelectPager = utils.protos.pager();

        var printSelectGrid = utils.protos.datatable({
            drag: false,
            sort: false,
            url: qUrl + "&jyry_id=" + utils.users.getUserId() + "&sort[jyrq]=desc&pager=true",
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                { id: "checked", header: { text: "选择", css: { "text-align": "center" } }, template: "{common.checkbox()}", checkValue: "Y", uncheckValue: "N", tooltip: false, css: { "text-align": "center" }, adjust: true, minWidth: 50 },
                { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 60 },
                { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 220 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                { id: "rksl", header: { text: "交检数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, width: 80 },
                { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
                { id: "jydd", header: { text: "检验地点", css: { "text-align": "center" } }, width: 80 },
                { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
                { id: "jynr", header: { text: "检验内容", css: { "text-align": "center" } }, width: 180 },
                { id: "jyjl", header: { text: "检验结论", css: { "text-align": "center" } }, width: 180 },
                { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 180 },
                { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
                { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
                { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
                { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            ],
            pager: printSelectPager.id,
        });

        webix.ui({
            id: winId + "_select_print_win",
            view: "window",
            close: true, modal: true, move: true, width: 720, height: 420,
            head: "检验单打印", position: "center",
            body: {
                paddingX: 12,
                rows: [
                    {
                        rows: [
                            printSelectGrid.actions.search({ fields: "txmvalue,ldbh,htbh,khbh,khmc,gcbh,gcmc,wzbh,wzmc,ggxh,bylx,byyq,cgy,jyry,bgy", autoWidth: true }),
                            printSelectGrid,
                            printSelectPager
                        ]
                    },
                    {
                        cols: [
                            { width: 8 },
                            {},
                            {
                                view: "button", label: "预览", minWidth: 88, autowidth: true, css: "webix_primary",
                                click() {
                                    var allData = $$(printSelectGrid.id).serialize(true);
                                    var selectedData = _.filter(allData, (row) => row["checked"] == "Y");
                                    if (_.size(selectedData) < 1) {
                                        webix.message({ type: "error", text: "请选择需要打印的检验单" });
                                        return
                                    }

                                    setTimeout(() => {
                                        openPrint(selectedData);
                                        $$(winId + "_select_print_win").hide();
                                    }, 500);
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
        var winId = utils.UUID();

        webix.ui({
            id: winId,
            view: "window",
            position: "center",
            close: true, modal: true, width: 820, height: 480,
            head: "报验单打印预览",
            body: {
                paddingX: 12,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "打印报验单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
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
                        view: "dataview",
                        item: {
                            width: 760,
                            height: 360
                        },
                        data: options,
                        xCount: 1,
                        template: `
                        <div class="webix_view webix_layout_line" style="border-left-width: 0px; border-right-width: 0px; border-bottom-width: 0px; margin-left: 12px; margin-top: 24px;  ">
                            <div class="webix_view webix_layout_line" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: 0px; height: 36px;">
                                <div class="webix_view webix_spacer" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 240px; height: 36px;"></div>
                                    <div class="webix_view webix_control webix_el_label" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 240px; height: 36px; text-align: center;">
                                        <span style="font-size: 24px; font-weight: 500; display: inline-block;vertical-align: middle;">物资报验单</span>
                                    </div>
                                    <div class="webix_view webix_spacer" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 240px; height: 36px;"></div>
                            </div>
                            <div class="webix_view webix_spacer" style="border-width: 0px; margin-left: 0px; margin-top: -1px; height: 4px;"></div>
                            <div class="webix_view webix_form webix_layout_line" role="form" style="border-width: 1px 0px; margin-left: 0px; margin-top: -1px; height: 263px;">
                                <div class="webix_scroll_cont">
                                    <div class="webix_view webix_layout_line" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: 0px; height: 30px;">
                                        <div class="webix_view webix_control webix_el_text" view_id="$text#!id#36" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 179px; height: 30px;">
                                            <div class="webix_el_box" style="width:179px; height:30px">
                                                <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330235" class="webix_inp_label ">入库单号：</label>
                                                <input readonly="true" aria-readonly="" id="174011#!id#7330235" type="text" value="#!ldbh#" style="width:95px;text-align:left;border:none;">
                                            </div>
                                        </div>
                                    <div class="webix_view webix_spacer" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 178px; height: 30px;"></div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#37" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 357px; height: 30px;">
                                        <div class="webix_el_box" style="width:357px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330237" class="webix_inp_label ">合同号：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330237" type="text" value="#!htbh#" style="width:273px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                </div>
                                <div class="webix_view webix_layout_line" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#38" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 357px; height: 30px;">
                                        <div class="webix_el_box" style="width:357px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" class="webix_inp_label ">供应商：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330239" type="text" value="#!khbh# | #!khmc#" style="width:273px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#39" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 356px; height: 30px;">
                                        <div class="webix_el_box" style="width:356px; height:30px"><label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330241" class="webix_inp_label ">项目：</label>
                                        <input readonly="true" aria-readonly="" id="174011#!id#7330241" type="text" value="#!gcbh# | #!gcmc#" style="width:272px;text-align:left;border:none;"></div>
                                    </div>
                                </div>
                                <div class="webix_view webix_layout_line" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#40" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 178px; height: 30px;">
                                        <div class="webix_el_box" style="width:178px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330243" class="webix_inp_label ">报验物资：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330243" type="text" value="#!wzbh#" style="width:94px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#41" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 535px; height: 30px;">
                                        <div class="webix_el_box" style="width:535px; height:30px">
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330245" type="text" value="#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#" style="width:531px;text-align:left;border:none;"></div>
                                    </div>
                                </div>
                                <div class="webix_view webix_layout_line" view_id="$layout84" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#42" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 178px; height: 30px;">
                                        <div class="webix_el_box" style="width:178px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330247" class="webix_inp_label ">报验类型：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330247" type="text" value="#!bylx#" style="width:94px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#43" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 535px; height: 30px;">
                                        <div class="webix_el_box" style="width:535px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330249" class="webix_inp_label ">检验要求：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330249" type="text" value="#!byyq#" style="width:451px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                </div>
                                <div class="webix_view webix_layout_line" view_id="$layout85" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#44" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330251" class="webix_inp_label ">交检数量：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330251" type="text" value="#!rksl#" style="width:95px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#45" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330253" class="webix_inp_label ">合格数量：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330253" type="text" value="#!hgsl#" style="width:95px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#46" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330255" class="webix_inp_label ">计量单位：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330255" type="text" value="#!jldw#" style="width:95px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#47" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 178px; height: 30px;">
                                        <div class="webix_el_box" style="width:178px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330257" class="webix_inp_label ">检验地点：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330257" type="text" value="#!jydd#" style="width:94px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                </div>
                                <div class="webix_view webix_control webix_el_textarea" view_id="$text#!id#area6" style="border-width: 0px; margin-left: 0px; margin-top: -1px; height: 48px;">
                                    <div class="webix_el_box" style="width:712px; height:48px">
                                        <label style="text-align:right; line-height:px; width:80px;" onclick="" for="x174011#!id#7330259" class="webix_inp_label ">检验员备注：</label>
                                        <textarea readonly="true" aria-readonly="" style="width:628px;border:none;" id="x174011#!id#7330259" name="jyry_bz" class="webix_inp_textarea">#!jyry_bz#</textarea>
                                    </div>
                                </div>
                                <div class="webix_view webix_layout_line" view_id="$layout86" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#48" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330261" class="webix_inp_label ">采购员：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330261" type="text" value="#!cgy#" style="width:95px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#49" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330263" type="text" value="#!kdrq#" style="width:175px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#50" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 179px; height: 30px;">
                                        <div class="webix_el_box" style="width:179px; height:30px">
                                            <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330265" class="webix_inp_label ">部门领导：</label>
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330265" type="text" value="#!bmld#" style="width:95px;text-align:left;border:none;">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_control webix_el_text" view_id="$text#!id#51" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 178px; height: 30px;">
                                        <div class="webix_el_box" style="width:178px; height:30px">
                                            <input readonly="true" aria-readonly="" id="174011#!id#7330267" type="text" value="#!bmld_shrq#" style="width:174px;text-align:left;border:none;"></div>
                                        </div>
                                    </div>
                                    <div class="webix_view webix_layout_line" view_id="$layout87" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                        <div class="webix_view webix_control webix_el_text" view_id="$text#!id#52" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 179px; height: 30px;">
                                            <div class="webix_el_box" style="width:179px; height:30px">
                                                <label style="text-align:right; line-height:24px; width:80px;" onclick="" for="174011#!id#7330269" class="webix_inp_label ">检验员：</label>
                                                <input readonly="true" aria-readonly="" id="174011#!id#7330269" type="text" value="#!jyry#" style="width:95px;text-align:left;border:none;">
                                            </div>
                                        </div>
                                        <div class="webix_view webix_control webix_el_text" view_id="$text#!id#53" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 178px; height: 30px;">
                                            <div class="webix_el_box" style="width:178px; height:30px">
                                                <input readonly="true" aria-readonly="" id="174011#!id#7330271" type="text" value="#!jyrq#" style="width:174px;text-align:left;border:none;">
                                            </div>
                                        </div>
                                        <div class="webix_view webix_spacer" view_id="$spacer75" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 357px; height: 30px;"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="webix_view webix_spacer" view_id="$spacer76" style="border-width: 0px; margin-left: 0px; margin-top: -1px; height: 2px;"></div>
                            <div class="webix_view webix_layout_line" view_id="$layout88" style="white-space: nowrap; border-left-width: 0px; border-right-width: 0px; margin-left: 0px; margin-top: -1px; height: 30px;">
                                <div class="webix_view webix_layout_line" view_id="$layout89" style="white-space: nowrap; display: inline-block; vertical-align: top; border-left-width: 0px; margin-top: 0px; margin-left: 0px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_label" view_id="$label9" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 120px; height: 30px;">
                                        <div class="webix_el_box" style="width: 120px; height: 30px; line-height: 24px; float: right; text-align: right;">采购员：</div>
                                    </div>
                                    <div class="webix_view" view_id="$template#!id#22" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 120px; height: 30px;">
                                        <div class=" webix_template">
                                            <img src="/api/sys/docs?method=Signer&user=#!cgy_id#" style="width:100%; height:100%; object-position:left; object-fit:contain" onerror="this.src = '/assets/signer_none.png'">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_spacer" view_id="$spacer77" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 0px; height: 30px;"></div>
                                </div>
                                <div class="webix_view webix_layout_line" view_id="$layout90" style="white-space: nowrap; display: inline-block; vertical-align: top; margin-top: 0px; margin-left: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_label" view_id="$label10" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 120px; height: 30px;">
                                        <div class="webix_el_box" style="width: 120px; height: 30px; line-height: 24px; float: right; text-align: right;">部门领导：</div>
                                    </div>
                                    <div class="webix_view" view_id="$template#!id#23" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 120px; height: 30px;">
                                        <div class=" webix_template">
                                            <img src="/api/sys/docs?method=Signer&user=#!bmld_id#" style="width:100%; height:100%; object-position:left; object-fit:contain" onerror="this.src = '/assets/signer_none.png'">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_spacer" view_id="$spacer78" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 0px; height: 30px;"></div>
                                </div>
                                <div class="webix_view webix_layout_line" view_id="$layout91" style="white-space: nowrap; display: inline-block; vertical-align: top; border-right-width: 0px; margin-top: 0px; margin-left: -1px; height: 30px;">
                                    <div class="webix_view webix_control webix_el_label" view_id="$label11" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: 0px; width: 120px; height: 30px;">
                                        <div class="webix_el_box" style="width: 120px; height: 30px; line-height: 24px; float: right; text-align: right;">检验员：</div>
                                    </div>
                                    <div class="webix_view" view_id="$template#!id#24" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 120px; height: 30px;">
                                        <div class=" webix_template">
                                            <img src="/api/sys/docs?method=Signer&user=#!jyry_id#" style="width:100%; height:100%; object-position:left; object-fit:contain" onerror="this.src = '/assets/signer_none.png'">
                                        </div>
                                    </div>
                                    <div class="webix_view webix_spacer" view_id="$spacer79" style="display: inline-block; vertical-align: top; border-width: 0px; margin-top: 0px; margin-left: -1px; width: 0px; height: 30px;"></div>
                                </div>
                            </div>
                            <div class="webix_view webix_spacer" view_id="$spacer80" style="border-width: 0px; margin-left: 0px; margin-top: -1px; height: 12px;"></div>
                        </div>
`
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
                                        console.log(res.json());
                                        webix.message({ type: "success", text: "检验确认成功" });

                                        $$(btnCheck).enable();
                                        $$(btnUnCheck).enable();

                                        $$(form.id).setValues({});
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
                            // var values = $$(form.id).getValues();
                            // if (!_.isEqual(values["zt"], "5") && !_.isEqual(values["zt"], "9")) {
                            //     webix.message({ type: "error", text: "不允许打印未检验的入库单" });
                            //     return;
                            // }

                            // openPrint(values);
                            openSelectPrint();
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