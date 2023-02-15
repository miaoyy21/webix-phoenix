import { open } from "./window";

function builder() {
    var grid_id = utils.UUID();

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "新建流程", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                        click() {
                            open(
                                { "grid": grid_id, "operation": "insert" },
                                {
                                    "diagram": { "category": "Diagram", "icon_": "mdi mdi-checkbox-blank-circle-outline", "exceed_days_": "0" },
                                    "nodes": [],
                                    "links": [],
                                },
                                {
                                    "class": "GraphLinksModel",
                                    "linkFromPortIdProperty": "fromPort",
                                    "linkToPortIdProperty": "toPort",
                                    "nodeDataArray": [],
                                    "linkDataArray": [],
                                }
                            );
                        }
                    },
                    {
                        view: "button", label: "刷新", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-refresh",
                        click() {
                            $$(grid_id).clearAll();
                            $$(grid_id).load($$(grid_id).config.url);
                        }
                    },
                    {},
                ]
            },
            {
                id: grid_id,
                view: "datatable",
                css: "webix_data_border webix_header_border",
                resizeColumn: true,
                editable: true,
                tooltip: true,
                drag: "order",
                select: true,
                rightSplit: 1,
                url: "/api/wf/diagrams",
                save: {
                    url: "/api/wf/diagrams",
                    updateFromResponse: true,
                    trackMove: true,
                    operationName: "operation"
                },
                columns: [
                    { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                    { id: "code_", header: [{ text: "流程编码", css: { "text-align": "center" } }, { content: "textFilter" }], sort: "text", width: 100 },
                    { id: "name_", header: [{ text: "流程名称", css: { "text-align": "center" } }, { content: "textFilter" }], sort: "text", width: 160 },
                    {
                        id: "description_", header: [{ text: "描述", css: { "text-align": "center" } }, { content: "textFilter" }], sort: "text", fillspace: true
                    },
                    { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["date"].format, width: 80, css: { "text-align": "center" } },
                    { id: "update_at_", header: { text: "修改时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
                    { id: "publish_at_", header: { text: "发布时间", css: { "text-align": "center" } }, sort: "date", format: utils.formats["datetime"].format, width: 140, css: { "text-align": "center" } },
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
                        webix.ajax().get("/api/wf/diagrams", { id: item.row, scope: "EXTRA" })
                            .then((data) => {
                                var extra = data.json();

                                open({ "grid": grid_id, "operation": "update", "id": item.row }, JSON.parse(extra["options"]), JSON.parse(extra["model"]));
                            });
                    },
                    btn_remove(e, item) {
                        $$(grid_id).select(item.row, false);
                        utils.grid.remove($$(grid_id), null, "流程实例", "name_")
                    },
                    btn_publish(e, item) {
                        webix.ajax().post("/api/wf/diagrams?method=Publish", { "id": item.row })
                            .then((res) => {
                                webix.dp($$(grid_id)).ignore(
                                    () => {
                                        $$(grid_id).updateItem(item.row, res.json());
                                        webix.message({ type: "success", text: "流程发布成功" });
                                    }
                                );
                            });
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
        ],
    };
}

export { builder };