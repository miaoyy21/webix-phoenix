function builder() {
    var winId = utils.UUID();
    var formId = winId + "_form";

    var datatable = utils.protos.datatable({
        multiselect: false,
        editable: false,
        leftSplit: 0,
        rightSplit: 1,
        url: "/api/sys/data_service?service=JZMD_CKDM.query",
        save: {
            url: "/api/sys/data_service?service=JZMD_CKDM.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        },

        columns: [
            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 60 },
            { id: "ckbh", header: { text: "仓库编号", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 80 },
            { id: "ckmc", header: { text: "仓库名称", css: { "text-align": "center" } }, width: 120 },
            { id: "bgy", header: { text: "保管员", css: { "text-align": "center" } }, width: 240 },
            { id: "bz", header: { text: "备注", css: { "text-align": "center" } }, fillspace: true },
            { id: "create_at_", header: { text: "创建日期", css: { "text-align": "center" } }, width: 140 },
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
    });

    function open(options) {
        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            width: 520,
            height: 390,
            animate: { type: "flip", subtype: "vertical" },
            head: (options["operation"] == "insert" ? "创建" : "修改") + "仓库代码",
            position: "center",
            body: {
                rows: [{
                    id: formId,
                    view: "form",
                    data: options,
                    css: { "margin-right": "120px" },
                    rows: [
                        {
                            cols: [
                                { view: "text", name: "ckbh", label: "仓库编号", required: true },
                                { view: "text", name: "ckmc", label: "仓库名称", required: true },
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "search", name: "bgy", label: "保管员", readonly: true, required: true,
                                    on: {
                                        onSearchIconClick() {
                                            var values = $$(formId).getValues();
                                            var s1 = (values["bgy_id"] || "").split(",");
                                            var s2 = (values["bgy"] || "").split(",");

                                            var checked = _.map(s1, (id, i) => ({ "id": id, "user_name_": s2[i] }));

                                            // 选择用户
                                            utils.windows.users({
                                                multiple: true,
                                                checked: checked,
                                                callback(checked) {
                                                    var value = _.pluck(checked, "id").join(",");
                                                    var name = _.pluck(checked, "user_name_").join(",");

                                                    $$(formId).setValues(_.extend(values, { "bgy_id": value, "bgy": name }));

                                                    return true;
                                                }
                                            })
                                        }
                                    }
                                }
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
                                "create_user_name_": utils.users.getUserName(),
                                "create_at_": utils.users.getDateTime(),
                            });
                        }
                    },
                    datatable.actions.refresh(),
                    {},
                    datatable.actions.search("ckbh,ckmc,bgy"),
                ]
            },
            datatable,
        ],
    };
}

export { builder };