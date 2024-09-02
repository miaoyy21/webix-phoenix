function defaultValues(options) {
    /*
    rows：领料明细数据格式
    { wzbh,wzmc,ggxh,wzph,bzdh,jldw,sccjmc,qls,bz }
    */

    var request = webix.ajax().sync().get("api/sys/auto_nos", { "code": "wz_lxc_ldbh" });
    var ldbh = JSON.parse(request.responseText)["no"];

    return {
        "ldbh": ldbh,
        "kdrq": utils.users.getDateTime(),
        "cklx": "1",
        "lly_id": utils.users.getUserId(),
        "lly": utils.users.getUserName(),
        "gcbh": "",
        "gcmc": "",
        "sqry_id": utils.users.getUserId(),
        "sqry": utils.users.getUserName(),
        "sqbm_id": utils.users.getDepartId(),
        "sqbm": utils.users.getDepartName(),
        "bz": "",
        "rows": []
    };
}

function builder(options, values) {
    console.log("xxx", arguments);

    // 表单
    var form = utils.protos.form({
        data: values,
        rows: [
            {
                cols: [
                    { view: "text", name: "ldbh", label: "领料单号", readonly: true },
                    { view: "combo", name: "cklx", label: '出库类型', readonly: options["readonly"], options: utils.dicts["wz_cklx"], required: true },
                    {}
                ]
            },
            {
                cols: [
                    {
                        view: "search", name: "lly", label: "领料员", readonly: options["readonly"],
                        on: {
                            onSearchIconClick() {
                                if (this.config.readonly) return;

                                // 选择领料员
                                var values = $$(form.id).getValues();
                                utils.windows.users({
                                    multiple: false,
                                    checked: !_.isEmpty(values["lly_id"]) ? [{ "id": values["lly_id"], "user_name_": values["lly"] }] : [],
                                    callback(checked) {
                                        $$(form.id).setValues(_.extend(values, { "lly_id": checked["id"], "lly": checked["user_name_"] }));
                                        return true;
                                    }
                                })
                            }
                        }
                    },
                    {
                        view: "search", name: "gcbh", label: "项目编号", readonly: options["readonly"], required: true,
                        on: {
                            onSearchIconClick() {
                                if (this.config.readonly) return;

                                // 选择项目
                                var values = $$(form.id).getValues();
                                utils.windows.gcdm({
                                    multiple: false,
                                    checked: !_.isEmpty(values["gcbh"]) ? [_.pick(values, "gcbh", "gcmc")] : [],
                                    filter: (row) => row["tybz"] != '1' && row["wgbz"] != '1',
                                    callback(checked) {
                                        var newValues = _.extend(values, _.pick(checked, "gcbh", "gcmc"));
                                        $$(form.id).setValues(newValues);
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
            { id: "wzms", header: { text: "物资名称/型号/牌号/代号", css: { "text-align": "center" } }, template: "#!wzmc#/#!ggxh#/#!wzph#/#!bzdh#", width: 240 },
            { id: "jldw", header: { text: "单位", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            {
                id: "qls", header: { text: "请领数量", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null,
                format: (value) => utils.formats.number.format(value, 2),
                editParse: (value) => utils.formats.number.editParse(value, 2),
                editFormat: (value) => utils.formats.number.editFormat(value, 2),
                css: { "text-align": "right", "background": !options["readonly"] ? "#d5f5e3" : null },
                width: 80
            },
            { id: "sccjmc", header: { text: "生产厂家", css: { "text-align": "center" } }, width: 180 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, editor: !options["readonly"] ? "text" : null, fillspace: true },
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

    var btnWzdm = {
        view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
        click() {
            var rows = $$(mxGrid.id).serialize(true);

            // 选择物资代码
            utils.windows.wzdm({
                multiple: true,
                checked: [],
                filter: (row) => (row["xyzt"] != '禁用' && _.findIndex(rows, (value) => (value["wzbh"] == row["wzbh"])) < 0),
                callback(checked) {

                    // wzbh,wzmc,ggxh,wzph,bzdh,jldw,sccjmc,qls,bz
                    rows = _.union(rows,
                        _.map(checked,
                            (row) => (_.extend(
                                _.pick(row, "wzbh", "wzmc", "ggxh", "wzph", "bzdh", "sccjmc", "jldw"),
                                { "qls": 0 },
                            )),
                        ),
                    );

                    $$(mxGrid.id).define("data", rows);
                    return true;
                }
            })
        }
    };

    // 请假单
    return {
        show() {
            return {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 240 },
                        {
                            rows: [
                                form,
                                { view: "resizer" },
                                {
                                    gravity: 2,
                                    rows: [
                                        { view: "toolbar", cols: [!options["readonly"] ? btnWzdm : { view: "label", label: "<span style='margin-left:8px'></span>物资领料清单", height: 38 }] },
                                        mxGrid,
                                        mxPager,
                                    ]
                                },
                            ]
                        },
                        { width: 240 },
                    ]
                }
            }
        },
        values() {
            if (!$$(form.id).validate()) {
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

            var values = $$(form.id).getValues();
            values["rows"] = rows

            console.log(values);
            return values;
        },
    }
};

export { defaultValues, builder };