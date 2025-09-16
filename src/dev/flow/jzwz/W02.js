// 领料申请单
function defaultValues(options) {
    // rows：{ wzbh,wzmc,ggxh,wzph,bzdh,jldw,sccjmc,qmsl,qls,bz }

    var request = webix.ajax().sync().get("api/sys/auto_nos", { "code": "wz_lxc_ldbh" });
    var ldbh = request.responseText;

    return {
        "ldbh": ldbh,
        "kdrq": utils.users.getDateTime(),
        "cklx": "1",
        "gcbh": "",
        "gcmc": "",
        "lly_id": utils.users.getUserId(),
        "lly": utils.users.getUserName(),
        "sqry_id": utils.users.getUserId(),
        "sqry": utils.users.getUserName(),
        "sqbm_id": utils.users.getDepartId(),
        "sqbm": utils.users.getDepartName(),
        "bz": "",
        "rows": []
    };
}

function builder(options, values) {
    var wzyeData = []; // 只加载1次物资库存

    // 只加载一次物资库存余额，只加载1次数据
    function loadWzye(callback) {
        if (_.isEmpty(wzyeData)) {
            webix.ajax()
                .get("/api/sys/data_service?service=JZWZ_WZYE.query_wzye")
                .then((res) => {
                    wzyeData = res.json()["data"];

                    console.log("第1次加载: 从服务器加载 ", _.size(wzyeData));
                    callback(wzyeData);
                });
        } else {
            console.log("第N次加载: 已有数据，不再加载", _.size(wzyeData));
            setTimeout(() => { callback(wzyeData) }, 250);
        }
    }

    function openWzdm() {
        loadWzye((wzye) => {
            showWindow({
                "from": "wzdm",
                "data": _.map(wzye, (row) => _.extend(row, { "checked": "0", "max_qls": row["qmsl"], "qls": 0 })),
            });
        })
    }

    // 选择入库单
    function openWzrkd() {
        loadWzye((wzye) => {
            var winId = utils.UUID();

            function onOK() {
                var wzrkdId = $$(dlgGrid.id).getSelectedId(false, true);

                // 加载物资入库单明细
                webix.ajax()
                    .get("/api/sys/data_service?service=JZWZ_WZRKDWJMX.query", { "wzrkd_id": wzrkdId, "zt": "9", "ly": "NONE" })
                    .then((res) => {
                        var rows = res.json()["data"];
                        if (_.size(rows) < 1) return;

                        $$(winId).hide();
                        var newData = _.map(rows, (row) => {
                            var findWzye = _.findWhere(wzye, { "wzbh": row["wzbh"] });
                            if (!findWzye) {
                                return _.extend(row, {
                                    "checked": "0",
                                    "max_qls": 0,
                                    "qls": 0
                                });
                            }

                            var sssl = utils.formats.number.editParse(row["sssl"], 2) || 0;
                            var qmsl = utils.formats.number.editParse(findWzye["qmsl"], 2) || 0;

                            var qls = _.min([sssl, qmsl]);
                            return _.extend(row, {
                                "checked": qls > 0 ? "1" : "0",
                                "max_qls": utils.formats.number.format(qls, 2),
                                "qls": qls
                            });
                        })

                        showWindow({ "from": "wzrkd", "data": newData });
                    })
            }

            var dlgPager = utils.protos.pager();
            var dlgGrid = utils.protos.datatable({
                drag: false,
                url: "/api/sys/data_service?service=JZWZ_WZRKDWJ.query&pager=true&wgbz=1",
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                    { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
                    { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
                    { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                    { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 180 },
                    { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
                    { id: "bmld", header: { text: "部门领导", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                    { id: "bmld_shrq", header: { text: "审核日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 80 },
                ],
                on: { onItemDblClick: onOK },
                pager: dlgPager.id,
            });

            // 打开选择入库单对话框
            webix.ui({
                id: winId,
                view: "window", close: true, modal: true, move: true, width: 560, height: 380, head: "选择入库单", position: "center",
                body: {
                    paddingX: 12,
                    rows: [
                        {
                            rows: [
                                dlgGrid.actions.search({ fields: "ldbh,cgy,gcbh,gcmc,htbh,khbh,khmc", placeholder: "可根据 入库单号、采购员、供应商和项目 进行过滤" }),
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
        })
    }

    // 显示选择物资对话框
    function showWindow(options) {
        var winId = utils.UUID();

        var dlgPager = utils.protos.pager();

        var dlgGrid = utils.protos.datatable({
            editable: true,
            drag: false,
            url: null,
            data: options["data"],
            leftSplit: 3,
            columns: [
                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 40 },
                {
                    id: "checked", header: { text: "✓", css: { "text-align": "center" } }, css: { "text-align": "center" },
                    options: utils.dicts["checked"], adjust: true, width: 40
                },
                { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
                { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
                {
                    id: "max_qls", header: { text: _.isEqual(options["from"], "wzdm") ? "库存数量" : "可领数量", css: { "text-align": "center" } },
                    format: (value) => utils.formats.number.format(value, 2),
                    css: { "text-align": "right" }, adjust: true, minWidth: 80
                },
                {
                    id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, editor: "text",
                    format: (value) => utils.formats.number.format(value, 2),
                    editParse: (value) => utils.formats.number.editParse(value, 2),
                    editFormat: (value) => utils.formats.number.editFormat(value, 2),
                    css: { "text-align": "right", "background": "#d5f5e3" },
                    adjust: true, minWidth: 80
                },
                _.isEqual(options["from"], "wzdm") ? {
                    id: "dfsl", header: { text: "待发数量", css: { "text-align": "center" } },
                    format: (value) => utils.formats.number.format(value, 2),
                    css: { "text-align": "right" }, adjust: true, minWidth: 80
                } : {
                    id: "sssl", header: { text: "实收数量", css: { "text-align": "center" } },
                    format: (value) => utils.formats.number.format(value, 2),
                    css: { "text-align": "right" }, adjust: true, minWidth: 80
                },
                { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 160 },
                { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
                { id: "cgy", header: { text: "采购员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            ],
            on: {
                onDataUpdate(id, data, old) {
                    var maxQls = utils.formats.number.editParse(data["max_qls"], 2) || 0;
                    var qls = utils.formats.number.editParse(data["qls"], 2) || 0;

                    if (qls > maxQls) {
                        webix.message({ type: "info", text: "请领数量不能大于库存数量！" });
                        data["qls"] = maxQls;
                        data["checked"] = maxQls > 0 ? "1" : "0";
                        return;
                    }

                    data["checked"] = qls > 0 ? "1" : "0";
                }
            },
            pager: dlgPager.id,
        });

        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 680,
            height: 480,
            animate: { type: "flip", subtype: "vertical" },
            head: "选择待领料的物资清单",
            position: "center",
            body: {
                paddingX: 12,
                rows: [
                    {
                        rows: [
                            dlgGrid.actions.filter({ fields: "wzbh,wzmc,ggxh,wzph,bzdh,sccjmc", placeholder: "请输入物资编号、物资名称、规格型号等信息过滤" }),
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
                                    // 停止编辑状态
                                    $$(dlgGrid.id).editStop();

                                    var values = _.filter($$(dlgGrid.id).serialize(true), (row) => (row["checked"] == "1"));
                                    if (_.size(values) < 1) {
                                        webix.message({ type: "error", text: "请选择待领物资！" });
                                        return;
                                    }

                                    // 是否设置项目
                                    var formValues = $$(mainForm.id).getValues();
                                    if (_.isEmpty(formValues["gcbh"]) && !_.isEmpty(_.first(values)["gcbh"])) {
                                        $$(mainForm.id).setValues(_.extend(formValues, _.pick(_.first(values), "gcbh", "gcmc")));
                                    }

                                    var rows = $$(mxGrid.id).serialize(true);
                                    _.each(values, (value) => {
                                        var has = _.findIndex(rows, (row) => row["wzbh"] == value["wzbh"]);
                                        if (has >= 0) {
                                            webix.message({ type: "info", text: value["wzbh"] + "已在待领清单中，自动忽略！" });
                                            return
                                        }

                                        var row = _.pick(value, "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "sccjmc", "jldw", "max_qls", "qls", "ckbh", "ckmc");
                                        $$(mxGrid.id).add(row);
                                    })

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

    // 表单
    var mainForm = utils.protos.form({
        data: values,
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "领料单号", readonly: true },
                    { view: "combo", name: "cklx", label: '出库类型', options: utils.dicts["wz_cklx"], readonly: options["readonly"], required: true, placeholder: "请选择出库类型..." },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "lly", label: "领料员", readonly: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                // 选择领料员
                                var values = $$(mainForm.id).getValues();
                                utils.windows.users({
                                    multiple: false,
                                    checked: !_.isEmpty(values["lly_id"]) ? [{ "id": values["lly_id"], "user_name_": values["lly"] }] : [],
                                    callback(checked) {
                                        $$(mainForm.id).setValues(_.extend(values, { "lly_id": checked["id"], "lly": checked["user_name_"] }));
                                        return true;
                                    }
                                })
                            }
                        }
                    },
                    {
                        view: "search", name: "gcbh", label: "项目编号", readonly: true, required: true,
                        on: {
                            onSearchIconClick() {
                                if (options["readonly"]) return;

                                // 选择项目
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
            {
                cols: [
                    { view: "text", name: "sqry", label: "申请人员", readonly: true },
                    { view: "text", name: "sqbm", label: "申请部门", readonly: true },
                    { view: "text", name: "kdrq", label: "开单日期", readonly: true },
                ]
            },
            { name: "bz", view: "textarea", label: "备注", readonly: options["readonly"], placeholder: "请输入备注 ..." },
        ],
        elementsConfig: { labelAlign: "right", clear: false },
    });

    var mxPager = utils.protos.pager();
    var mxGrid = utils.protos.datatable({
        editable: true,
        url: null,
        data: values["rows"],
        leftSplit: 3,
        rightSplit: 1,
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 320 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "max_qls", header: { text: "可领数量", css: { "text-align": "center" } }, css: { "text-align": "right" }, format: "1,111.00", width: 80 },
            {
                id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                width: 80
            },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 140 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null, fillspace: true, minWidth: 240 },
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
                var maxQls = utils.formats.number.editParse(data["max_qls"], 2) || 0;
                var qls = utils.formats.number.editParse(data["qls"], 2) || 0;

                if (qls > maxQls) {
                    webix.message({ type: "info", text: "请领数量不能大于库存数量！" });
                    data["qls"] = maxQls;
                    return;
                }
            },
            onAfterRender() {
                if (options["readonly"]) {
                    mxGrid.actions.hideColumn("buttons", true);
                } else {
                    mxGrid.actions.hideColumn("buttons", false);
                }
            }
        },
        pager: mxPager.id
    });

    // 选择物资按钮
    var btnWzdm = {
        view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
        click: openWzdm
    };

    // 选择入库单按钮
    var btnWzrkd = {
        view: "button", label: "选择入库单", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-cursor-default-gesture-outline",
        click: openWzrkd
    };

    // 返回表单UI
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
                                            view: "toolbar",
                                            cols: !options["readonly"] ?
                                                [btnWzrkd, btnWzdm] :
                                                [{ view: "label", label: "<span style='margin-left:8px'></span>物资领料清单", height: 38 }],
                                        },
                                        mxGrid,
                                        mxPager,
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

            // 领料明细
            var rows = $$(mxGrid.id).serialize(true);
            if (_.size(rows) < 1) {
                webix.message({ type: "error", text: "请选择领料明细" });
                return
            }

            // 是否输入请领数量
            var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["qls"], 2) <= 0));
            if (index >= 0) {
                webix.message({ type: "error", text: "第" + (index + 1) + "行：请填写请领数量！" });
                return
            }

            // 请领数量是否大于可领数量
            var index = _.findIndex(rows, (row) => (utils.formats.number.editParse(row["qls"], 2) > utils.formats.number.editParse(row["max_qls"], 2)));
            if (index >= 0) {
                webix.message({ type: "error", text: "第" + (index + 1) + "行：请领数量大于可领数量！" });
                return
            }


            var values = $$(mainForm.id).getValues();
            values["rows"] = rows;

            console.log(values);
            return values;
        },
    }
};

export { defaultValues, builder };