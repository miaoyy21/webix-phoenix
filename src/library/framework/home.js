import { show } from "./task_show";

function builder() {
    var res = webix.ajax().sync().get("/api/sys/data_service?service=JZWZ.query");
    var data = JSON.parse(res.responseText);

    return {
        id: HOME_PAGE_ID,
        padding: { right: 4 },
        rows: [
            {
                view: "winmenu",
                height: 144,
                xCount: 4,
                yCount: 1,
                data: [
                    { id: "01", value: "物资标准库 " + data["wzdm"] + "条", color: "#0a57c0", img: "/assets/01.png", x: 1, y: 1 },
                    { id: "02", value: "供应商标准库 " + data["khdm"] + "条", color: "#00a300", img: "/assets/02.png", x: 2, y: 1 },
                    { id: "03", value: "本月入库物资 " + data["rkd"] + "项", color: "#a400ab", img: "/assets/03.png", x: 3, y: 1 },
                    { id: "04", value: "本月出库物资 " + data["ckd"] + "项", color: "#d9532c", img: "/assets/04.png", x: 4, y: 1 }
                ],
                on: {
                    onItemClick: function (id) {
                        console.log(this.getItem(id));
                    }
                }
            },
            { view: "resizer" },
            {
                cols: [
                    {
                        rows: [
                            {
                                view: "toolbar", cols: [
                                    { template: "待办事项", borderless: true, type: "header" },
                                    {
                                        view: "icon", icon: "mdi mdi-18px mdi-refresh",
                                        click() {
                                            $$(HOME_PAGE_ID + "_unitlist").clearAll();
                                            $$(HOME_PAGE_ID + "_unitlist").load("/api/wf/flows?method=Tasks&status=Executing");
                                        }
                                    },
                                    { width: 4 },
                                    {
                                        view: "icon", icon: "mdi mdi-18px mdi-format-list-bulleted",
                                        click() {
                                            if (!$$(EXECUTING_PAGE_ID)) {
                                                $$(VIEWS_ID).addView(_.extend(
                                                    PHOENIX_FRAMEWORK_DATA["framework_tasks"].builder(),
                                                    {
                                                        id: EXECUTING_PAGE_ID,
                                                        padding: { right: 4 },
                                                        css: { "border-left": "none", "border-top": "none" }
                                                    }
                                                ));

                                                $$(VIEWS_TABBAR_ID).addOption({
                                                    id: EXECUTING_PAGE_ID,
                                                    close: true,
                                                    value: "<span style='font-size:12px'>任务中心</span>"
                                                }, true);
                                            } else {
                                                $$(VIEWS_TABBAR_ID).setValue(EXECUTING_PAGE_ID);
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                id: HOME_PAGE_ID + "_unitlist",
                                view: "unitlist",
                                select: true,
                                url: "/api/wf/flows?method=Tasks&status=Executing",
                                save: {},
                                uniteBy: function (obj) {
                                    return "【" + obj["diagram_code_"] + "】" + obj["diagram_name_"];
                                },
                                template: `
                                        <div class='webix_strong'> #status_text_#  <span style="float:right"> #create_user_name_# &nbsp; #activated_at_#</span></div>
                                        <div style='text-indent:0em;'> #keyword_text_#</div>
                                    `,
                                type: {
                                    height: 54
                                },
                                on: {
                                    "data->onStoreUpdated": function () {
                                        this.data.each((obj, i) => { obj.index = i + 1 });
                                    },
                                    onBeforeLoad() {
                                        webix.extend(this, webix.OverlayBox);
                                        this.showOverlay("正在加载待办事项...");
                                    },
                                    onAfterLoad() {
                                        this.hideOverlay();
                                        if (!this.count()) {
                                            this.showOverlay("暂无待办事项");
                                            return;
                                        }

                                        this.refresh();
                                    },
                                    onItemClick(id) {
                                        var row = this.getItem(id);

                                        show(_.extend({}, row, {
                                            "$dtable": HOME_PAGE_ID + "_unitlist",
                                            "operation": "execute",
                                            "$keyword": row["keyword_text_"],
                                            "task_id_": id,
                                        }));
                                    }
                                },
                            },
                        ]
                    },
                    { view: "resizer" },
                    {
                        rows: [
                            {
                                view: "toolbar", cols: [
                                    { template: "常用功能", borderless: true, type: "header" },
                                    {
                                        view: "icon", icon: "mdi mdi-18px mdi-refresh",
                                        click() {
                                            console.log("刷新")
                                        }
                                    },
                                    { width: 4 },
                                ],
                            },
                            {
                                view: "chart",
                                donutInnerText: "<span style='font-size: 20px'>男职工比例</span></br>70%",
                                type: "donut",
                                innerRadius: 70,
                                value: "#val#",
                                color: "#color#",
                                data: [
                                    { val: "70", type: "男", color: "#4C3CE7" },
                                    { val: "30", type: "女", color: "#AAB7B8" },
                                ]
                            }
                        ]
                    },
                ]
            },
        ]
    }
}

export { builder }