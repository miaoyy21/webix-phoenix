function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJ.query_self";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query";

    var mainPager = utils.protos.pager();

    function onAfterSelect(id) {
        $$(mainForm.id).setValues($$(mainGrid.id).getItem(id));

        $$(mxGrid.id).clearAll();
        webix.ajax()
            .get(mxUrl, { "wzrkd_id": id })
            .then((res) => { $$(mxGrid.id).define("data", res.json()) });
    }

    // 列表
    var mainGrid = utils.protos.datatable({
        editable: false,
        drag: false,
        url: mainUrl + "&wgbz=0",
        save: {},
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld", header: { text: "部门领导", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bmld_shrq", header: { text: "审核日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
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
            { id: "cgdjhs", header: { text: "含税单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "cgjehs", header: { text: "含税金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "taxrate", header: { text: "税率(%)", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 60 },
            { id: "cgdj", header: { text: "采购单价", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 4), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), footer: { content: "summColumn", css: { "text-align": "right" } }, css: { "text-align": "right" }, adjust: true, minWidth: 80 },
            { id: "taxje", header: { text: "税额", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, adjust: true, minWidth: 80 },
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
            { id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } }, format: (value) => utils.formats.number.format(value, 2), css: { "text-align": "right" }, width: 80 },
            { id: "rkrq", header: { text: "入库日期", css: { "text-align": "center" } }, format: utils.formats.datetime.format, css: { "text-align": "center" }, width: 140 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
    });

    // 打印的UI窗口
    var printId = utils.UUID();
    var printView = webix.ui({
        view: "scrollview",
        body: {
            rows: [
                utils.protos.form({
                    id: printId + "_form",
                    data: {},
                    borderless: true,
                    rows: [
                        {
                            cols: [
                                {},
                                { view: "label", align: "center", template: "<span style='font-size:40px; font-weight:500'>物资零星入库单</span>", height: 80 },
                                {}
                            ]
                        },
                        {
                            cols: [
                                { view: "text", name: "ldbh", label: "入库单号：" },
                                { view: "text", name: "cgy", label: "采购员：" },
                                { view: "text", name: "kdrq", label: "开单日期：" },
                                {},
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
                    ],
                    elementsConfig: { labelAlign: "right", labelWidth: 100, clear: false },
                }),
                { view: "label", label: "<span style='margin-left:8px'></span>物资入库清单" },
                {
                    cols: [
                        { width: 5 },
                        utils.protos.datatable({
                            id: printId + "_datatable",
                            data: [],
                            select: false,
                            autoheight: true,
                            scroll: false,
                            columns: [
                                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", minWidth: 220, fillspace: true },
                                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                                { id: "rksl", header: { text: "入库数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: (value) => utils.formats.number.format(value, 2), width: 100 },
                                { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, options: utils.dicts["md_bylx"], css: { "text-align": "center" }, minWidth: 80 },
                                { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 220, fillspace: true },
                            ],
                        }),
                        { width: 5 },
                    ]
                },
                { height: 5 },
            ]
        }
    });

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
                            }
                        }
                    },
                    mainGrid.actions.refresh(),
                    { width: 24 },
                    {
                        view: "button", label: "打印入库单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-printer",
                        click() {
                            $$(printId + "_form").setValues($$(mainForm.id).getValues());
                            $$(printId + "_datatable").define("data", $$(mxGrid.id).serialize(true));

                            setTimeout(() => {
                                webix.print(printView, { mode: "landscape" });
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
                        width: 240,
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
        on: { onDestruct: () => { printView.destructor() } }
    }
}

export { builder }