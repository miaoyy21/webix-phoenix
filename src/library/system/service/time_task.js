function builder() {
    var form = utils.UUID();
    var field_once = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "Get Values", autowidth: true,
                        click() {
                            var values = $$(form).getValues();
                            console.log(values);
                        }
                    }
                    // tree.actions.add(),
                    // tree.actions.addChild(),
                    // tree.actions.remove(),
                ]
            },
            {
                view: "scrollview",
                scroll: "y",
                body: {
                    id: form,
                    view: "form",
                    borderless: true,
                    gravity: 2,
                    url: "/api/sys/setting",
                    rows: [
                        { view: "text", name: "name_", label: "任务名称", required: true },
                        { view: "combo", name: "type_", label: "任务类型", options: [{ id: "Repeat", value: "重复执行" }, { id: "Once", value: "执行一次" }], required: true },

                        /*** 执行一次 ***/
                        {
                            id: field_once,
                            view: "fieldset",
                            label: "执行一次",
                            body: { view: "datepicker", name: "once_at_", label: "日期时间", editable: true, timepicker: true, format: "%Y-%m-%d %H:%i:%s" },
                        },

                        /*** 执行频率 ***/
                        {
                            view: "fieldset",
                            label: "执行频率",
                            body: {
                                view: "richselect", name: "frequency_", label: "执行频率",
                                options: [
                                    { id: "EveryDay", value: "每天" },
                                    { id: "EveryWeekDay1", value: "星期一(每周)" },
                                    { id: "EveryWeekDay2", value: "星期二(每周)" },
                                    { id: "EveryWeekDay3", value: "星期三(每周)" },
                                    { id: "EveryWeekDay4", value: "星期四(每周)" },
                                    { id: "EveryWeekDay5", value: "星期五(每周)" },
                                    { id: "EveryWeekDay6", value: "星期六(每周)" },
                                    { id: "EveryWeekDay7", value: "星期日(每周)" },
                                    { id: "EveryWeekWorkday", value: "每周工作日" },
                                    { id: "EveryWeekHoliday", value: "每周休息日" },
                                    { id: "Month1", value: "每月第一天" },
                                    { id: "MonthX", value: "每月最后一天" },
                                ]
                            },
                        },

                        /*** 每天频率 ***/
                        {
                            view: "fieldset",
                            label: "每天频率",
                            body: {
                                rows: [
                                    { view: "richselect", name: "frequency_day_", label: "每天频率", options: [{ id: "Once", value: "执行一次" }, { id: "Repeat", value: "重复执行" }] },

                                    /* 重复执行 */
                                    {
                                        cols: [
                                            { view: "counter", name: "frequency_day_repeat_", label: "执行间隔", min: 1, max: 60, width: 256 },
                                            { view: "richselect", name: "frequency_day_repeat_unit_", options: [{ id: "H", value: "小时" }, { id: "M", value: "分钟" }, { id: "S", value: "秒" }], inputWidth: 88 },
                                        ]
                                    },
                                    {
                                        cols: [
                                            { view: "datepicker", type: "time", name: "frequency_day_start_", label: "开始时间", editable: true, suggest: { type: "timeboard", seconds: true, twelve: false, body: { button: true } } },
                                            { view: "datepicker", type: "time", name: "frequency_day_end_", label: "结束时间", editable: true, suggest: { type: "timeboard", seconds: true, twelve: false, body: { button: true } } }
                                        ]
                                    }
                                ]
                            },
                        },
                    ],
                    elementsConfig: { labelWidth: 120, labelAlign: "right" },
                    on: {
                        onBeforeLoad() {
                            webix.extend(this, webix.ProgressBar).showProgress();
                        },
                        onAfterLoad() {
                            webix.extend(this, webix.ProgressBar).hideProgress();
                        }
                    }
                },
            }
        ]
    };
}

export { builder }