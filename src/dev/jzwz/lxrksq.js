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
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "zt", header: { text: "状态", css: { "text-align": "center" } }, options: utils.dicts["wz_rkzt"], css: { "text-align": "center" }, width: 80 },
            { id: "wzbh", header: { text: "物资编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 160 },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, editor: "text", width: 160 },
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
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "cgje", header: { text: "采购金额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            {
                id: "taxje", header: { text: "税额", css: { "text-align": "center" } },
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right" }, adjust: true, minWidth: 80
            },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "bylx", header: { text: "报验类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "byyq", header: { text: "检验要求", css: { "text-align": "center" } }, minWidth: 240, maxWidth: 360 },
            { id: "txmvalue", header: { text: "条形码", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 120 },
            {
                id: "buttons",
                width: 80,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`,
            }
        ],
        on: {

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
                                                    click() {
                                                        var values = $$(mxGrid.id).serialize(true);
                                                        console.log(values)

                                                        // 选择供应商
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