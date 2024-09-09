import { show } from "./task_show";

function builder() {
    return {
        id: HOME_PAGE_ID,
        view: "scrollview",
        scroll: "y",
        body: {
            rows: [
                {
                    view: "winmenu",
                    height: 144,
                    xCount: 4,
                    yCount: 1,
                    data: [
                        { id: "01", value: "员工总数 896人", color: "#0a57c0", img: "/assets/01.png", x: 1, y: 1 },
                        { id: "02", value: "本科及以上 549人", color: "#00a300", img: "/assets/02.png", x: 2, y: 1 },
                        { id: "03", value: "供应商总数 674家", color: "#a400ab", img: "/assets/03.png", x: 3, y: 1 },
                        { id: "04", value: "营业收入 ¥134,678.85", color: "#d9532c", img: "/assets/04.png", x: 4, y: 1 }
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
                                            }
                                        }
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
                                        <div> 【#name_#】  <span style="float:right"> #create_user_name_# &nbsp; &nbsp; #activated_at_#</span></div>
                                        <div style='text-indent:1em;'> #keyword_text_#</div>
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
                                { template: "员工男女比例", type: "header" },
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
}

export { builder }