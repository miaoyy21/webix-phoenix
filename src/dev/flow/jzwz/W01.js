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

    // 元素
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
    var mxGrid = utils.protos.datatable({ pager: mxPager.id });

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
                                        {
                                            view: "toolbar", cols: [
                                                {
                                                    view: "button", label: "选择物资", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-gesture-tap-hold",
                                                    click() {
                                                    }
                                                },
                                            ]
                                        },
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

            // 开始时间必须小于结束时间
            var values = $$(form.id).getValues();
            // if (values["start_"] >= values["end_"]) {
            //     webix.message({ type: "error", text: "结束时间必须大于开始时间" });
            //     return;
            // }


            // values = _.extend(values, { "doc_": uploader.getValue() });
            return values;
        },
    }
};

export { defaultValues, builder };