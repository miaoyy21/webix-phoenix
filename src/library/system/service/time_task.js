function builder() {
    var table = utils.UUID();

    var win = utils.UUID();
    var form = utils.UUID();
    var formSource = utils.UUID();

    function open(options) {
        webix.ui({
            id: win,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 800,
            height: 640,
            animate: { type: "flip", subtype: "vertical" },
            head: (options["operation"] == "insert" ? "创建" : "修改") + "定时任务",
            position: "center",
            body: {
                rows: [
                    {
                        view: "tabview",
                        tabbar: { optionWidth: 160 },
                        cells: [
                            /************************************** 基本信息 **************************************/
                            {
                                header: "<span class='webix_icon mdi mdi-middleware-outline'></span>基本信息",
                                body: {
                                    view: "scrollview",
                                    scroll: "y",
                                    body: {
                                        id: form,
                                        view: "form",
                                        borderless: true,
                                        gravity: 2,
                                        data: options,
                                        rows: [
                                            { view: "text", name: "name_", label: "任务名称", required: true },
                                            {
                                                view: "combo", name: "type_", label: "任务类型", required: true,
                                                options: [{ id: "Repeat", value: "重复执行" }, { id: "Once", value: "执行一次" }],
                                                on: {
                                                    onChange(val) {
                                                        _.each($$(form).elements, (v, k) => {
                                                            if (_.isEqual(k, "name_") || _.isEqual(k, "type_") || _.isEqual(k, "description_")) {
                                                                return
                                                            }

                                                            if (_.isEqual(val, "Once")) {
                                                                if (_.isEqual(k, "once_at_")) {
                                                                    $$(form).elements[k].define("required", true);
                                                                    $$(form).elements[k].enable();
                                                                } else {
                                                                    $$(form).elements[k].define("required", false);
                                                                    $$(form).elements[k].disable();
                                                                }
                                                            } else {
                                                                if (_.isEqual(k, "once_at_")) {
                                                                    $$(form).elements[k].define("required", false);
                                                                    $$(form).elements[k].disable();
                                                                } else {
                                                                    $$(form).elements[k].define("required", true);
                                                                    $$(form).elements[k].enable();
                                                                }
                                                            }

                                                            $$(form).elements[k].refresh();
                                                        })
                                                    },
                                                }
                                            },

                                            /*** 任务描述 ***/
                                            { view: "textarea", name: "description_", label: "任务描述", placeholder: "请输入任务描述 ..." },

                                            /*** 执行一次 ***/
                                            {
                                                view: "fieldset",
                                                label: "执行一次",
                                                body: { view: "datepicker", name: "once_at_", label: "日期时间", editable: true, stringResult: true, timepicker: true, format: "%Y-%m-%d %H:%i:%s" },
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
                                                                { view: "counter", name: "frequency_day_repeat_", label: "执行间隔", min: 1, max: 360, width: 256 },
                                                                { view: "richselect", name: "frequency_day_repeat_unit_", options: [{ id: "S", value: "秒" }, { id: "M", value: "分钟" }, { id: "H", value: "小时" }], inputWidth: 88 },
                                                            ]
                                                        },
                                                        {
                                                            cols: [
                                                                { view: "datepicker", type: "time", name: "frequency_day_start_", label: "开始时间", editable: true, stringResult: true, format: "%H:%i:%s" },
                                                                { view: "datepicker", type: "time", name: "frequency_day_end_", label: "结束时间", editable: true, stringResult: true, format: "%H:%i:%s" }
                                                            ]
                                                        }
                                                    ]
                                                },
                                            },

                                            /*** 持续时间 ***/
                                            {
                                                view: "fieldset",
                                                label: "持续时间",
                                                body: {
                                                    cols: [
                                                        { view: "datepicker", name: "frequency_start_at_", label: "开始时间", editable: true, stringResult: true, format: "%Y-%m-%d" },
                                                        { view: "datepicker", name: "frequency_end_at_", label: "结束时间", editable: true, stringResult: true, format: "%Y-%m-%d" },
                                                    ]
                                                },
                                            },
                                        ],
                                        elementsConfig: { labelWidth: 120, labelAlign: "right" },
                                        on: { onChange() { this.validate() } }
                                    },
                                },
                            },

                            /************************************** 服务脚本 **************************************/
                            {
                                header: "<span class='webix_icon mdi mdi-powershell'></span>执行脚本",
                                body: {
                                    view: "scrollview",
                                    scroll: "y",
                                    body: {
                                        id: formSource,
                                        view: "form",
                                        borderless: true,
                                        gravity: 2,
                                        data: options,
                                        rows: [{ view: "ace-editor", mode: "javascript", name: "source_" }]
                                    }
                                }
                            },
                        ]
                    },
                    { height: 8, css: { "border-top": "none" } },
                    {
                        view: "toolbar",
                        borderless: true,
                        height: 34,
                        cols: [
                            {},
                            {
                                view: "button", width: 100, label: "保存", css: "webix_primary",
                                click() {
                                    if ($$(form).validate() && $$(formSource).validate()) {

                                        var row = _.extend({}, $$(form).getValues(), _.pick($$(formSource).getValues(), "source_"));
                                        webix.ajax().post("/api/sys/time_tasks", row).then(
                                            (res) => {
                                                webix.dp($$(table)).ignore(
                                                    () => {
                                                        if (_.isEqual(row["operation"], "insert")) {
                                                            utils.grid.add($$(table), _.extend(row, res.json()));
                                                        } else {
                                                            $$(table).updateItem(row["id"], _.extend(row, res.json()));
                                                        }

                                                        $$(win).hide() && webix.message({ type: "success", text: "保存成功" });
                                                    }
                                                );
                                            });
                                    }
                                }
                            },
                            { width: 8 },
                            { view: "button", width: 100, value: "取消", css: "webix_transparent ", click: () => $$(win).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 }
                ]
            },
            on: {
                onHide() { this.close() }
            }
        }).show();
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "创建任务", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            open({
                                "operation": "insert",
                                "type_": "Repeat",
                                "frequency_": "EveryDay",
                                "frequency_day_": "Repeat",
                                "frequency_day_repeat_": 10,
                                "frequency_day_repeat_unit_": "M",
                                "frequency_day_start_": "00:00:00",
                                "frequency_day_end_": "23:59:59",
                                "frequency_start_at_": utils.formats.date.format(new Date()),
                                "frequency_end_at_": "2099-12-31"
                            });
                        }
                    },
                    {},
                ]
            },
            {
                id: table,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                tooltip: true,
                scrollX: false,
                drag: "order",
                select: true,
                url: "/api/sys/time_tasks",
                save: {
                    url: "/api/sys/time_tasks",
                    updateFromResponse: true,
                    trackMove: true,
                    operationName: "operation"
                },
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "name_", header: { text: "任务名称", css: { "text-align": "center" } }, sort: "text", width: 160 },
                    { id: "type_", header: { text: "任务类型", css: { "text-align": "center" } }, options: [{ id: "Repeat", value: "重复执行" }, { id: "Once", value: "执行一次" }], sort: "text", width: 80, css: { "text-align": "center" } },
                    { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, sort: "text", fillspace: true },
                    { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "update_at_", header: { text: "修改时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    {
                        width: 160,
                        header: { text: "操作按钮", css: { "text-align": "center" } },
                        tooltip: false,
                        css: { "text-align": "center" },
                        template: `<div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="编辑" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-pencil"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                        <button webix_tooltip="启动" type="button" class="btn_start webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-restart"></span>
                                        </button> 
                                        <button webix_tooltip="日志" type="button" class="btn_log webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-math-log"></span>
                                        </button> 
                                    </div>`,
                    },
                ],
                onClick: {
                    btn_edit(e, item) {
                        var row = this.getItem(item.row);
                        webix.ajax("/api/sys/time_tasks?method=Extra", { "id": item.row })
                            .then((res) => {
                                open(_.extend({}, row, _.first(res.json()), { "operation": "update" }))
                            });
                    },
                    btn_remove(e, item) {
                        $$(table).select(item.row, false);
                        utils.grid.remove($$(table), null, "定时任务", "name_")
                    },
                    btn_start(e, item) {
                        var row = this.getItem(item.row);
                        console.log("Start", row);
                    },
                    btn_log(e, item) {
                        var row = this.getItem(item.row);
                        console.log("Log", row);
                    },
                },
                on: {
                    "data->onStoreUpdated": function () {
                        this.data.each(function (obj, i) {
                            obj.index = i + 1;
                        })
                    },
                    onBeforeLoad() {
                        this.showOverlay("数据加载中...");
                    },
                    onAfterLoad() {
                        this.hideOverlay();
                        if (!this.count()) {
                            this.showOverlay("无检索数据");
                            return;
                        }

                        this.select(this.getFirstId());
                    },
                }
            },
        ]
    }
}

export { builder }