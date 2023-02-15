function open(options) {
    var win = utils.UUID();
    var menu = utils.UUID();
    var dtable = utils.UUID();
    console.log(options);

    webix.ui({
        id: win,
        view: "window",
        close: true,
        modal: true,
        fullscreen: true,
        animate: { type: "flip", subtype: "vertical" },
        head: "【" + options["code"] + "】  " + options["name"],
        position: "center",
        body: {
            cols: [
                {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>流程状态", height: 35 },
                        {
                            id: menu,
                            view: "menu",
                            layout: "y",
                            width: 240,
                            select: true,
                            url: "/api/wf/flows?method=Summary&diagram_id=" + options.id,
                            on: {
                                onBeforeLoad() {
                                    webix.extend(this, webix.ProgressBar).showProgress();
                                },
                                onAfterLoad() {
                                    webix.extend(this, webix.ProgressBar).hideProgress();

                                    this.select(this.getFirstId());
                                },
                                onAfterSelect(id) {
                                    $$(dtable).clearAll();
                                    $$(dtable).load(() => webix.ajax("/api/wf/flows", { "diagram_id": options.id, "status": id }));
                                }
                            }
                        }
                    ]
                },
                { view: "resizer" },
                {
                    rows: [
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "button", label: "流程保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                                    click() {
                                    }
                                },
                                {
                                    view: "button", label: "流程发布", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-rocket-launch",
                                    click() {
                                    }
                                },
                                {},
                            ]
                        },
                        {
                            id: dtable,
                            view: "datatable",
                            css: "webix_data_border webix_header_border",
                            resizeColumn: true,
                            tooltip: true,
                            select: true,
                            leftSplit: 2,
                            rightSplit: 1,
                            data: [],
                            columns: [
                                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                                { id: "keyword_", header: { text: "关键字", css: { "text-align": "center" } }, sort: "text", width: 240 },
                                { id: "status_", header: { text: "流程状态", css: { "text-align": "center" } }, options: "/assets/flow_status.json", sort: "text", css: { "text-align": "center" }, width: 100 },
                                { id: "status_text_", header: { text: "状态描述", css: { "text-align": "center" } }, sort: "text", width: 360 },

                                { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                                { id: "start_at_", header: { text: "启动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                                { id: "active_at_", header: { text: "活动时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                                { id: "end_at_", header: { text: "结束时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                                {
                                    width: 160,
                                    header: { text: "操作按钮", css: { "text-align": "center" } },
                                    tooltip: false,
                                    css: { "text-align": "center" },
                                    template: `<div class="webix_el_box" style="padding:0px; text-align:center">
                                        <button webix_tooltip="设计" type="button" class="btn_edit webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-material-design"></span>
                                        </button> 
                                        <button webix_tooltip="删除" type="button" class="btn_remove webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_danger_icon mdi mdi-18px mdi-trash-can"></span>
                                        </button>
                                        <button webix_tooltip="发布" type="button" class="btn_publish webix_icon_button" style="height:30px;width:30px;">
                                            <span class="phoenix_primary_icon mdi mdi-18px mdi-rocket-launch"></span>
                                        </button> 
                                    </div>`,
                                },
                            ],
                            rules: {
                                "code_": webix.rules.isNotEmpty,
                                "name_": webix.rules.isNotEmpty,
                            },
                            onClick: {
                                btn_edit(e, item) {
                                },
                                btn_remove(e, item) {
                                },
                                btn_publish(e, item) {
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
                }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
};

export { open }