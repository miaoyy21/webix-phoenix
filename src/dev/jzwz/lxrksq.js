function builder() {
    const mainUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJ.bySelf";
    const mxUrl = "/api/sys/data_service?service=JZWZ_WZRKDWJMX.query";

    var mainPager = utils.protos.pager();

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
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
        on: {
            onDataUpdate(id, newValues) { $$(mainForm.id).setValues(newValues) },
            onAfterSelect(selection, preserve) {
                $$(mainForm.id).setValues($$(mainGrid.id).getItem(selection.id));

                $$(mxGrid.id).clearAll();
                $$(mxGrid.id).define("url", mxUrl + "&wzrkd_id=" + selection.id);
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
                                var values = $$(mainForm.id).getValues();

                                // 选择供应商
                                utils.windows.khdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["khbh"]) ? [_.pick(values, "khbh", "khmc")] : [],
                                    filter: (row) => row["tybz"] != '1',
                                    callback(checked) {
                                        var newValues = _.extend(values, _.pick(checked, "khbh", "khmc"));
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                })
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
                                var values = $$(mainForm.id).getValues();

                                // 选择供应商
                                utils.windows.gcdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["gcbh"]) ? [_.pick(values, "gcbh", "gcmc")] : [],
                                    filter: (row) => row["tybz"] != '1' && row["wgbz"] != '1',
                                    callback(checked) {
                                        var newValues = _.extend(values, _.pick(checked, "gcbh", "gcmc"));
                                        $$(mainForm.id).setValues(newValues);
                                        return true;
                                    }
                                })
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
        editable: false,
        drag: false,
        url: null,
        save: {
            url: "/api/sys/data_service?service=JZWZ_WZRKDWJMX.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ldbh", header: { text: "入库单号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 100 },
            { id: "khmc", header: { text: "供应商名称", css: { "text-align": "center" } }, width: 240 },
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 160 },
            { id: "htbh", header: { text: "采购合同号", css: { "text-align": "center" } }, width: 120 },
            { id: "kdrq", header: { text: "开单日期", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
        ],
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
                    mainGrid.actions.add({ label: "新建单据", callback: () => ({ "wgbz": "0", "rklx": "1", "kdrq": utils.users.getDate() }) }),
                    mainGrid.actions.remove({ label: "删除单据" }),
                    {
                        view: "button", label: "提交检验", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-check",
                        click() { }
                    },
                    {
                        view: "button", label: "撤销提交", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-comment-remove",
                        click() { }
                    }
                ]
            },
            {
                cols: [
                    {
                        view: "scrollview",
                        width: 320,
                        body: {
                            rows: [
                                { view: "toolbar", cols: [mainGrid.actions.search("ldbh,htbh,khbh,khmc,gcbh,gcmc", true)] },
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
                                                    view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
                                                    click() { }
                                                },
                                                {
                                                    view: "button", label: "物资导入", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-database-import",
                                                    click() { }
                                                },
                                            ]
                                        },
                                        mxGrid
                                    ]
                                }
                            ]
                        },
                    }
                ]
            }
        ]
    }
}

export { builder }