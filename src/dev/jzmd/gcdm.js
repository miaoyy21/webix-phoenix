function builder() {
    var winId = utils.UUID();
    var formId = winId + "_form";
    var pager = utils.protos.pager();

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: false,
        leftSplit: 5,
        rightSplit: 1,
        url: "/api/sys/data_service?service=JZMD_GCDM.query&pager=true",
        save: {
            url: "/api/sys/data_service?service=JZMD_GCDM.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },
        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            utils.protos.checkbox({ id: "tybz", header: { text: "停用", css: { "text-align": "center" } } }),
            utils.protos.checkbox({ id: "wgbz", header: { text: "完工", css: { "text-align": "center" } } }),
            { id: "gcbh", header: { text: "项目编号", css: { "text-align": "center" } }, width: 120 },
            { id: "gcmc", header: { text: "项目名称", css: { "text-align": "center" } }, width: 160 },
            { id: "cpxh", header: { text: "产品型号", css: { "text-align": "center" } }, width: 160 },
            { id: "sl", header: { text: "数量", css: { "text-align": "center" } }, width: 60 },
            { id: "xmlb", header: { text: "项目类别", css: { "text-align": "center" } }, width: 160 },
            { id: "xmlx", header: { text: "项目类型", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "xmsx", header: { text: "项目属性", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "xmfzr", header: { text: "项目负责人", css: { "text-align": "center" } }, width: 240 },
            { id: "xmzg", header: { text: "项目主管", css: { "text-align": "center" } }, width: 240 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, minWidth: 240 },
            { id: "create_user_name_", header: { text: "创建人员", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, format: utils.formats.date.format, css: { "text-align": "center" }, width: 140 },
            {
                id: "buttons",
                width: 120,
                header: { text: "操作按钮", css: { "text-align": "center" } },
                tooltip: false,
                template: ` <div class="webix_el_box" style="padding:0px; text-align:center"> 
                                <button webix_tooltip="编辑" type="button" class="button_edit webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"/> </button>
                                <button webix_tooltip="删除" type="button" class="button_remove webix_icon_button" style="height:30px;width:30px;"> <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"/> </button>
                            </div>`,
            }
        ],
        onClick: {
            button_edit: function (e, item) {
                var row = this.getItem(item.row);
                open(_.extend({}, row, { "operation": "update" }));
            },
        },
        styles: {
            cellTextColor: function (row, col) { return row["tybz"] == "1" ? "red" : row["wgbz"] == "1" ? "blue" : "none" }
        },
        pager: pager.id
    });

    function open(options) {
        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 600,
            height: 450,
            animate: { type: "flip", subtype: "vertical" },
            head: (options["operation"] == "insert" ? "创建" : "修改") + "项目标准库",
            position: "center",
            body: {
                rows: [
                    {
                        view: "scrollview",
                        scroll: "y",
                        body: {
                            id: formId,
                            view: "form",
                            data: options,
                            rows: [
                                {
                                    cols: [
                                        { view: "text", name: "gcbh", label: "项目编号", required: true, placeholder: "请输入项目编号..." },
                                        { view: "text", name: "gcmc", label: "项目名称", required: true, placeholder: "请输入项目名称..." },
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "text", name: "cpxh", label: "产品型号" },
                                        { view: "text", name: "sl", label: "数量" },
                                    ]
                                },
                                {
                                    cols: [
                                        { view: "richselect", name: "xmlb", label: "项目类别", options: utils.dicts["md_xmlb"], required: true, placeholder: "请选择..." },
                                        { view: "richselect", name: "xmlx", label: "项目类型", options: utils.dicts["md_xmlx"], required: true, placeholder: "请选择..." },
                                        { view: "richselect", name: "xmsx", label: "项目属性", options: utils.dicts["md_xmsx"], required: true, placeholder: "请选择..." },
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "search", name: "xmfzr", label: "项目负责人", readonly: true, placeholder: "请选择 项目负责人...",
                                            on: {
                                                onSearchIconClick() {
                                                    var values = $$(formId).getValues();
                                                    var checked = _.map((values["xmfzr_id"] || "").split(","), (id, i) => ({ "id": id, "user_name_": (values["xmfzr"] || "").split(",")[i] }));

                                                    // 选择用户
                                                    utils.windows.users({
                                                        multiple: true, checked: checked,
                                                        callback(checked) {
                                                            $$(formId).setValues(_.extend(values, { "xmfzr_id": _.pluck(checked, "id").join(","), "xmfzr": _.pluck(checked, "user_name_").join(",") }));
                                                            return true;
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    cols: [
                                        {
                                            view: "search", name: "xmzg", label: "项目主管", readonly: true, placeholder: "请选择 项目主管...",
                                            on: {
                                                onSearchIconClick() {
                                                    var values = $$(formId).getValues();
                                                    var checked = _.map((values["xmzg_id"] || "").split(","), (id, i) => ({ "id": id, "user_name_": (values["xmzg"] || "").split(",")[i] }));

                                                    // 选择用户
                                                    utils.windows.users({
                                                        multiple: true, checked: checked,
                                                        callback(checked) {
                                                            $$(formId).setValues(_.extend(values, { "xmzg_id": _.pluck(checked, "id").join(","), "xmzg": _.pluck(checked, "user_name_").join(",") }));
                                                            return true;
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    cols: [
                                        utils.protos.checkbox({
                                            editable: true, name: "tybz", gravity: 2, label: "停用",
                                            on: {
                                                onChange(val) {
                                                    var updateValues = _.isEqual(val, "1") ? { "tyry": utils.users.getUserName(), "tyrq": utils.users.getDateTime() } : { "tyry": "", "tyrq": "" };
                                                    $$(formId).setValues(_.extend($$(formId).getValues(), updateValues))
                                                }
                                            }
                                        }),
                                        { view: "text", name: "tyry", gravity: 4, label: "停用人员", readonly: true },
                                        { view: "datepicker", name: "tyrq", gravity: 5, label: "停用时间", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                                    ]
                                },
                                { view: "textarea", name: "tyyy", label: "停用原因", placeholder: "请输入停用原因 ..." },
                                {
                                    cols: [
                                        utils.protos.checkbox({
                                            editable: true, name: "wgbz", gravity: 2, label: "完工",
                                            on: {
                                                onChange(val) {
                                                    var updateValues = _.isEqual(val, "1") ? { "wgjbr": utils.users.getUserName(), "wgrq": utils.users.getDateTime() } : { "wgjbr": "", "wgrq": "" };
                                                    $$(formId).setValues(_.extend($$(formId).getValues(), updateValues))
                                                }
                                            }
                                        }),
                                        { view: "text", name: "wgjbr", gravity: 4, label: "完工经办人", readonly: true },
                                        { view: "datepicker", name: "wgrq", gravity: 5, label: "完工时间", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                                    ]
                                },
                                { view: "textarea", name: "bz", label: "备注", placeholder: "请输入备注 ..." },
                                {
                                    cols: [
                                        { view: "text", name: "create_user_name_", label: "创建人员", readonly: true },
                                        { view: "datepicker", name: "create_at_", label: "创建日期", readonly: true, stringResult: true, format: "%Y-%m-%d %H:%i:%s" },
                                    ]
                                },
                            ],
                            elementsConfig: { labelAlign: "right", clear: false },
                        }
                    },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", width: 80, label: "保存", css: "webix_primary",
                                click() {
                                    $$(formId).clearValidation();
                                    if (!$$(formId).validate()) return;

                                    var row = $$(formId).getValues();
                                    webix.ajax().post(datatable.save.url, row).then(
                                        (res) => {
                                            webix.dp($$(datatable.id)).ignore(
                                                () => {
                                                    if (_.isEqual(row["operation"], "insert")) {
                                                        utils.grid.add($$(datatable.id), _.extend(row, res.json()));
                                                    } else {
                                                        $$(datatable.id).updateItem(row["id"], _.extend(row, res.json()));
                                                    }

                                                    $$(winId).hide() && webix.message({ type: "success", text: "保存成功" });
                                                }
                                            );
                                        },
                                    );
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winId).hide() },
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
                        view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            open({
                                "operation": "insert",
                                "wgbz": "0",
                                "tybz": "0",
                                "create_user_name_": utils.users.getUserName(),
                                "create_at_": utils.users.getDateTime(),
                            });
                        }
                    },
                    datatable.actions.refresh(),
                    {},
                    datatable.actions.search({ fields: "gcbh,gcmc,cpxh,xmlb,xmlx,xmsx,xmfzr,xmzg" }),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };