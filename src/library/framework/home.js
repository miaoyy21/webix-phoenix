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
                                { template: "待办事项", type: "header" },
                                utils.protos.list({
                                    url: "/api/wf/flows?method=Tasks&status=Executing",
                                    template: `
                                        <div> #diagram_name_#  【#name_#】 <span style="float:right">#activated_at_#</span></div>
                                        <div style='padding-left:8px'> #keyword_text_#
                                        <div style="float:right">
                                            <button webix_tooltip="发起" type="button" class="btn_launch webix_icon_button" style="height:48px;width:48px;">
                                                <span class="webix_icon phoenix_warning_icon mdi-dark mdi-18px mdi mdi-arrow-right-circle-outline"></span>
                                            </button>
                                        </div>
                                        </div>
                                    `,
                                    type: {
                                        height: 60
                                    },
                                }),
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