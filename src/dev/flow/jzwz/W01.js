function defaultValues(options) {
    // rows：{ wzbh,wzmc,ggxh,wzph,bzdh,jldw,sccjmc,kcsl,qls,bz }

    return {
        "type_": "事假",
        "start_": utils.formats.date.format(new Date()),
        "end_": utils.formats.date.format(new Date()),
    };
}

function builder(options, values) {
    console.log(options, values)

    // 元素
    var form = utils.protos.form({
        data: values,
        rows: [
            { name: "type_", view: "combo", label: '请假类型', readonly: options["readonly"], options: ["事假", "病假", "年假", "调休", "婚假", "产假", "陪产假", "路途假", "其他"], required: true },
            { name: "start_", view: "datepicker", label: "开始时间", readonly: options["readonly"], stringResult: true, required: true, format: utils.formats.date.format, on: { onChange: () => callback() } },
            { name: "end_", view: "datepicker", label: "结束时间", readonly: options["readonly"], stringResult: true, required: true, format: utils.formats.date.format, on: { onChange: () => callback() } },
            { name: "days_", view: "text", label: "请假时长(天)", readonly: true, required: true },
            { name: "reason_", view: "textarea", label: "请假事由", readonly: options["readonly"], required: true, placeholder: "请输入明确的请假事由 ..." },
        ],
        elementsConfig: { labelAlign: "right", labelWidth: 120, clear: false },
    });

    // 文档
    var uploader = utils.protos.uploader({
        label: "相关材料",
        data: values["doc_"],
        readonly: options["readonly"]
    });

    // 改变日期时触发
    function callback() {
        var values = $$(form.id).getValues();

        var start = webix.i18n.dateFormatDate(values["start_"]);
        var end = webix.i18n.dateFormatDate(values["end_"]);

        values["days_"] = (end - start) / 1000 / 60 / 60 / 24;
        $$(form.id).setValues(values);
    }


    // 请假单
    return {
        show() {
            return {
                view: "scrollview",
                scroll: "y",
                body: {
                    cols: [
                        { width: 240 },
                        { rows: [form, uploader] },
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
            if (values["start_"] >= values["end_"]) {
                webix.message({ type: "error", text: "结束时间必须大于开始时间" });
                return;
            }


            values = _.extend(values, { "doc_": uploader.getValue() });
            return values;
        },
    }
};

export { defaultValues, builder };