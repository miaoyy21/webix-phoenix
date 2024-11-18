function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJ.query_self";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query";

    var mainPager = utils.protos.pager();
    var btnPrint = utils.UUID();

    function onAfterSelect(id) {
        $$(mainForm.id).setValues($$(mainGrid.id).getItem(id));

        $$(btnPrint).disable();
        $$(mxGrid.id).clearAll();
        $$(mxGrid.id).showOverlay("正在检索入库单明细，请稍后...");

        webix.ajax()
            .get(mxUrl, { "hcbz": "0", "wzrkd_id": id })
            .then((res) => {
                $$(mxGrid.id).define("data", res.json());
                $$(btnPrint).enable();
            })
            .fail(() => {
                $$(mxGrid.id).showOverlay("检索出现异常");
            });
    }

    // 列表
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&wgbz=1",
        save: {},
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
            { id: "bmld", header: { text: "部门领导", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审核日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
        ],
        on: {
            onDataUpdate(id, newValues) { $$(mainForm.id).setValues(newValues) },
            onAfterSelect: (selection, preserve) => onAfterSelect(selection.id),
            onAfterLoad() {
                if (this.count() < 1) {
                    _.delay(() => {
                        $$(mainForm.id).setValues({});
                        $$(mxGrid.id).define("data", []);
                    }, 50);
                }
            }
        },
        pager: mainPager.id,
    });

    // 表单
    var mainForm = utils.protos.form({
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "入库单号", readonly: true },
                    { view: "richselect", name: "rklx", label: "入库类型", options: utils.dicts["wz_lxr_rklx"], readonly: true },
                    {}
                ]
            },
            {
                cols: [
                    { view: "text", name: "khbh", label: "供应商编号", readonly: true },
                    { view: "text", name: "khmc", gravity: 2, label: "供应商名称", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "htbh", label: "合同号", readonly: true },
                    { view: "text", name: "gcbh", label: "项目编号", readonly: true },
                    { view: "text", name: "gcmc", label: "项目名称", readonly: true },
                ]
            },
            { view: "textarea", name: "bz", label: "备注", readonly: true },
            {
                cols: [
                    { view: "text", name: "cgy", label: "采购员", readonly: true },
                    { view: "text", name: "create_depart_name_", label: "所属部门", readonly: true },
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                ]
            },
            {
                cols: [
                    { view: "text", name: "bmld", label: "部门领导", readonly: true },
                    { view: "text", name: "bmld_shrq", label: "审核日期", readonly: true },
                    {}
                ]
            },
        ],
    });

    // 明细
    var mxGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        footer: true,
        url: null,
        leftSplit: 4,
        rightSplit: 0,
        save: {},
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, footer: { text: "合  计：", colspan: 3 }, css: { "text-align": "center" }, width: 50 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 60 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 180 },
            { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 60 },
            { id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "taxje", header: { text: "税额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "clph", header: { text: "材料批号", css: { "text-align": "center" } }, width: 120 },
            { id: "scrq", header: { text: "生产日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 120 },
            { id: "kwmc", header: { text: "库位名称", css: { "text-align": "center" } }, width: 160 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, width: 240 },
            { id: "hgsl", header: { text: "合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "bhgsl", header: { text: "不合格数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
    });

    // 打印的UI窗口
    function openPrint(options) {
        var winId = utils.UUID();

        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            fullscreen: true,
            animate: { type: "flip", subtype: "vertical" },
            head: "打印入库单【" + options["ldbh"] + " &nbsp; &nbsp; " + options["khmc"] + "】",
            position: "center",
            body: {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "打印入库单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
                                click() {
                                    webix.print($$(winId + "_print"), { mode: "landscape" });
                                    $$(winId).hide();
                                }
                            },
                        ]
                    },
                    {
                        id: winId + "_print",
                        view: "scrollview",
                        body: {
                            paddingX: 12,
                            rows: [
                                utils.protos.form({
                                    data: options,
                                    borderless: true,
                                    rows: [
                                        {
                                            cols: [
                                                {},
                                                { view: "label", align: "center", template: "<span style='font-size:36px; font-weight:500'>物资零星入库单</span>", height: 60 },
                                                {}
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "text", name: "ldbh", label: "入库单号：" },
                                                { view: "text", name: "htbh", label: "合同号：" },
                                                { gravity: 2 }
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "text", name: "khbh", label: "供应商编号：" },
                                                { view: "text", name: "khmc", label: "供应商名称：" },
                                                { view: "text", name: "gcbh", label: "项目编号：" },
                                                { view: "text", name: "gcmc", label: "项目名称：" },
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "text", name: "cgy", label: "采购员：" },
                                                { view: "text", name: "kdrq", label: "开单日期：" },
                                                { view: "text", name: "bmld", label: "部门领导" },
                                                { view: "text", name: "bmld_shrq", label: "审核日期" },
                                            ]
                                        },
                                    ],
                                    elementsConfig: { labelAlign: "right", labelWidth: 100, readonly: true, clear: false },
                                }),
                                { view: "label", label: "<span style='margin-left:8px'></span>物资入库清单" },
                                utils.protos.datatable({
                                    data: options["rows"],
                                    url: null,
                                    select: false,
                                    autoheight: true,
                                    scroll: false,
                                    footer: true,
                                    columns: [
                                        { id: "index", header: { text: "№", css: { "text-align": "center" } }, footer: { text: "合  计：", colspan: 3 }, css: { "text-align": "center" }, width: 50 },
                                        { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                                        { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", minWidth: 220, fillspace: true },
                                        { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                        { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 100 },
                                        { id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                        { id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                        { id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 60 },
                                        { id: "taxje", header: { text: "税额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                        { id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
                                        { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 120 },
                                        { id: "jyrq", header: { text: "检验日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 80 },
                                        { id: "jyry", header: { text: "检验员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                                        { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 80 },
                                        { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                                    ],
                                }),
                                { height: 12 },
                                {
                                    view: "toolbar", borderless: true,
                                    cols: [
                                        {
                                            cols: [
                                                { view: "label", label: "采购员：", align: "right", width: 80 },
                                                utils.protos.signer(options["cgy_id"]),
                                                {}
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "label", label: "部门领导：", align: "right", width: 80 },
                                                utils.protos.signer(options["bmld_id"]),
                                                {}
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "label", label: "检验员：", align: "right", width: 80 },
                                                utils.protos.signer(options["jyry_id"]),
                                                {}
                                            ]
                                        },
                                        {
                                            cols: [
                                                { view: "label", label: "保管员：", align: "right", width: 80 },
                                                utils.protos.signer(options["bgy_id"]),
                                                {}
                                            ]
                                        },
                                    ]
                                },
                                { height: 12 },
                            ]
                        }
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
                        view: "richselect", options: utils.dicts["wgzt"], width: 120, value: "1", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(mainGrid.id).clearAll();
                                $$(mainGrid.id).define("url", mainUrl + "&wgbz=" + newValue);
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    { width: 24 },
                    {
                        id: btnPrint, view: "button", label: "打印预览", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
                        click() {
                            var mxValues = $$(mxGrid.id).serialize(true);
                            if (_.size(mxValues) < 1) {
                                webix.message({ type: "error", text: "正在检索该入库单明细，请等待..." });
                                return
                            }

                            // 必须全部入库才可以打印
                            var has = _.findIndex(mxValues, (row) => {
                                if (_.isEqual(row["zt"], "9")) {
                                    return false;
                                }

                                if (_.isEqual(row["zt"], "5")) {
                                    var hgsl = utils.formats.number.editParse(row["hgsl"], 2);
                                    if (hgsl < 0.01) {
                                        return false;
                                    }
                                }

                                return true;
                            });
                            if (has >= 0) {
                                webix.message({ type: "error", text: "入库单中存在未办理入库实收的物资！" });
                                return
                            }

                            var mainValues = $$(mainForm.id).getValues();
                            var options = _.extend({}, mainValues, _.pick(_.first(mxValues), "jyry_id", "bgy_id"));
                            options["rows"] = _.filter(mxValues, (row) => row["zt"] == "9" && row["hcbz"] == "0");

                            openPrint(options);
                        }
                    },
                    {}
                ]
            },
            {
                cols: [
                    {
                        width: 300,
                        rows: [
                            { view: "toolbar", cols: [mainGrid.actions.search({ fields: "ldbh,htbh,khbh,khmc,gcbh,gcmc", autoWidth: true })] },
                            mainGrid,
                            mainPager
                        ],
                    },
                    { view: "resizer" },
                    {
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
                                    { view: "toolbar", cols: [{ view: "label", label: "<span style='margin-left:8px'></span>物资入库单明细", height: 38 }] },
                                    mxGrid
                                ]
                            },
                        ]
                    },
                ]
            },
        ],
        on: { onDestruct: () => { } }
    }
}

export { builder }