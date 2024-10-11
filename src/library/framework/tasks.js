import { show } from "./task_show";

function builder() {
    var dtable = utils.UUID();

    var taskStatus = [
        { "id": "Executing", "value": "正在执行中" },
        { "id": "Executed Accepted", "value": "已通过" },
        { "id": "Executed Rejected", "value": "已驳回" }
    ];

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "combo", width: 200, label: '任务状态', options: taskStatus, value: "Executing", labelAlign: "center",
                        on: {
                            onChange(newValue) {
                                $$(dtable).clearAll();

                                $$(dtable).define("url", "/api/wf/flows?method=Tasks&status=" + newValue);
                            }
                        }
                    },
                    { width: 24 },
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            $$(dtable).clearAll();
                            $$(dtable).load($$(dtable).config.url);
                        }
                    },
                    {},
                    {
                        view: "search", width: 300, placeholder: "请输入流程名称、流程实例关键字等 ...",
                        on: {
                            onTimedKeyPress() {
                                var value = this.getValue().toLowerCase();

                                $$(dtable).filter(function (obj) {
                                    return (obj["diagram_name_"] + "|" + obj["keyword_text_"] + "|" + (obj["comment_"] || "")).toLowerCase().indexOf(value) != -1;
                                });
                            }
                        }
                    },
                ]
            },
            {
                id: dtable,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                tooltip: true,
                select: true,
                leftSplit: 3,
                rightSplit: 1,
                url: "/api/wf/flows?method=Tasks&status=Executing",
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "diagram_name_", header: { text: "流程名称", css: { "text-align": "center" } }, sort: "text", width: 120 },
                    { id: "keyword_text_", header: { text: "关键字", css: { "text-align": "center" } }, sort: "text", width: 360 },
                    { id: "create_user_name_", header: { text: "发起者", css: { "text-align": "center" } }, sort: "text", css: { "text-align": "center" }, width: 80 },
                    { id: "name_", header: { text: "任务名称", css: { "text-align": "center" } }, sort: "text", css: { "text-align": "center" }, width: 80 },
                    { id: "status_text_", header: { text: "流程状态描述", css: { "text-align": "center" } }, sort: "text", width: 240 },
                    { id: "task_status_", header: { text: "任务状态", css: { "text-align": "center" } }, options: taskStatus, sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "comment_", header: { text: "任务流转意见", css: { "text-align": "center" } }, width: 240 },
                    { id: "activated_at_", header: { text: "任务激活时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "executed_at_", header: { text: "任务执行时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "status_", header: { text: "流程状态", css: { "text-align": "center" } }, options: "/assets/flow_status.json", sort: "text", css: { "text-align": "center" }, width: 100 },
                    { id: "start_at_", header: { text: "流程启动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    {
                        width: 80,
                        header: { text: "操作按钮", css: { "text-align": "center" } },
                        tooltip: false,
                        css: { "text-align": "center" },
                        template(row) {
                            if (row["task_status_"] == "Executed Accepted" || row["task_status_"] == "Executed Rejected") {
                                return `
                                        <div class="webix_el_box" style="padding:0px; text-align:center">
                                            <button webix_tooltip="查看" type="button" class="btn_view webix_icon_button" style="height:30px;width:30px;">
                                                <span class="phoenix_primary_icon mdi mdi-18px mdi-eye"></span>
                                            </button> 
                                        </div>
                                    `;
                            } else if (row["task_status_"] == "Executing") {
                                return `
                                    <div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="执行" type="button" class="btn_execute webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-hand-coin"></span>
                                        </button> 
                                    </div>
                                `;
                            }
                        },
                    },
                ],
                onClick: {
                    btn_execute(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, row, {
                            "$dtable": dtable,
                            "operation": "execute",
                            "$keyword": row["keyword_text_"],
                            "task_id_": item.row,
                        }));
                    },
                    btn_view(e, item) {
                        var row = this.getItem(item.row);
                        show(_.extend({}, row, {
                            "$dtable": dtable,
                            "operation": "view",
                            "$keyword": row["keyword_text_"],
                            "task_id_": item.row,
                        }));
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
            }
        ]
    };
}

export { builder };