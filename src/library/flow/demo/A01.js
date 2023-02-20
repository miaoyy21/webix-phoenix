function builder(options) {
    var form = utils.UUID();
    var doc = utils.UUID();

    // 改变日期时触发
    function callback() {
        var values = $$(form).getValues();

        var start = webix.i18n.dateFormatDate(values["start_"]);
        var end = webix.i18n.dateFormatDate(values["end_"]);

        values["days_"] = (end - start) / 1000 / 60 / 60 / 24;
        $$(form).setValues(values);
    }

    // 请假单
    return {
        show(values) {
            return {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 240 },
                        {
                            rows: [
                                utils.protos.form({
                                    id: form,
                                    data: values,
                                    rows: [
                                        { name: "type_", view: "combo", label: '请假类型', readonly: !options["editable"], options: ["事假", "病假", "年假", "调休", "婚假", "产假", "陪产假", "路途假", "其他"], required: true },
                                        { name: "start_", view: "datepicker", label: "开始时间", readonly: !options["editable"], stringResult: true, required: true, format: utils.formats.date.format, on: { onChange: () => callback() } },
                                        { name: "end_", view: "datepicker", label: "结束时间", readonly: !options["editable"], stringResult: true, required: true, format: utils.formats.date.format, on: { onChange: () => callback() } },
                                        { name: "days_", view: "text", label: "请假时长(天)", readonly: true, required: true },
                                        { name: "reason_", view: "textarea", label: "请假事由", readonly: !options["editable"], required: true, placeholder: "请输入明确的请假事由 ..." },
                                    ],
                                    elementsConfig: { labelAlign: "right", labelWidth: 120, clear: false },
                                }),
                                utils.protos.form({
                                    id: doc,
                                    data: values,
                                    uploader: "doc_",
                                    rows: [
                                        utils.protos.uploader({ name: "doc_", label: "相关材料", editable: options["editable"] }),
                                    ],
                                    elementsConfig: { labelAlign: "right", labelWidth: 120, clear: false },
                                }),
                            ]
                        },
                        { width: 240 },
                    ]
                }
            }
        },
        default() {
            return {
                "type_": "事假",
                "start_": utils.formats.date.format(new Date()),
                "end_": utils.formats.date.format(new Date()),
                "days_": 0,
                "reason_": "",
                "doc_": "",
            };
        },
        values() {
            if (!$$(form).validate()) {
                webix.message({ type: "error", text: "缺少必输项" });
                return;
            };

            // 开始时间必须小于结束时间
            var values = $$(form).getValues();
            if (values["start_"] >= values["end_"]) {
                webix.message({ type: "error", text: "结束时间必须大于开始时间" });
                return;
            }

            values = _.extend(values, _.pick($$(doc).getValues(), "doc_"));
            return values;
        },
    }
};

export { builder };