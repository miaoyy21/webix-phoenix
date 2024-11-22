import { show } from "./task_show";

function builder() {
    const menusUrl = "/api/sys/home_menus?PHOENIX_IGNORE_LOG=true";

    var winId = utils.UUID();

    var res = webix.ajax().sync().get("/api/sys/data_service?PHOENIX_IGNORE_LOG=true&service=JZWZ.query");
    var data = JSON.parse(res.responseText);

    // 打开登录用户的菜单对话框
    function openMenus() {
        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 520,
            height: 390,
            animate: { type: "flip", subtype: "vertical" },
            head: "选择菜单",
            position: "center",
            body: {
                rows: [
                    {
                        cols: [
                            {
                                id: winId + "_tree",
                                view: "tree",
                                type: "lineTree",
                                threeState: true,
                                data: [],
                                template: "{common.icon()} {common.checkbox()} <span> &nbsp; #name_#</span>",
                            },
                        ]
                    },
                    { height: 8 },
                    {
                        cols: [
                            {},
                            {
                                view: "button", width: 80, label: "保存", css: "webix_primary",
                                click() {
                                    var menus = _.filter($$(winId + "_tree").getChecked(), (id) => {
                                        var item = $$(winId + "_tree").getItem(id);

                                        return item["$count"] < 1;
                                    })

                                    webix.ajax().
                                        post("/api/sys/home_menus", { "operation": "save", "menus": menus })
                                        .then((res) => {
                                            webix.message({ type: "success", text: "保存成功" });

                                            $$(HOME_PAGE_ID + "_dataview").clearAll();
                                            $$(HOME_PAGE_ID + "_dataview").load(menusUrl);

                                            $$(winId).hide();
                                        });

                                }
                            },
                            { width: 8 },
                            { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winId).hide() },
                            { width: 8 }
                        ]
                    },
                    { height: 8 },
                ]
            },
            on: {
                onShow() {
                    var menus = $$(HOME_PAGE_ID + "_dataview").serialize(true);

                    var userMenus = _.sortBy(webix.copy(PHOENIX_USER_MENUS_DATA), (o) => Number(o["seq"]));
                    $$(winId + "_tree").define("data", utils.tree.buildTree(userMenus));
                    $$(winId + "_tree").refresh();

                    _.each(menus, (menu) => $$(winId + "_tree").checkItem(menu["menu_id_"]));
                    $$(winId + "_tree").openAll();
                },
                onHide() { this.close() },
            }
        }).show();
    }


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
            },
            { view: "resizer" },
            {
                cols: [
                    {
                        rows: [
                            {
                                view: "toolbar",
                                cols: [
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
                                url: "/api/wf/flows?method=Tasks&status=Executing&PHOENIX_IGNORE_LOG=true",
                                save: {},
                                uniteBy: function (obj) {
                                    return "【" + obj["diagram_code_"] + "】" + obj["diagram_name_"];
                                },
                                template: `
                                        <div class='webix_strong'> #status_text_#  <span style="float:right"> #create_user_name_# &nbsp; #activated_at_#</span></div>
                                        <div style='text-indent:0em;'> #keyword_text_#</div>
                                    `,
                                type: {
                                    height: 60
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
                                            $$(HOME_PAGE_ID + "_dataview").clearAll();
                                            $$(HOME_PAGE_ID + "_dataview").load(menusUrl);
                                        }
                                    },
                                    { width: 4 },
                                    { view: "icon", icon: "mdi mdi-18px mdi-cogs", click: openMenus },
                                ],
                            },
                            {
                                view: "dataview",
                                id: HOME_PAGE_ID + "_dataview",
                                select: true,
                                drag: true,
                                tooltip: "#menu_name_#",
                                template: `
                                    <div class='webix_strong' style='text-align:center; margin-top:8px'>
                                        <span class='phoenix_danger_icon mdi-24px #menu_icon_#'></span>
                                    </div> 
                                    <div style="text-align:center">#menu_name_#</div>
                                    `,
                                type: {
                                    type: "tiles",
                                    height: 80,
                                    width: 140,
                                },
                                url: menusUrl,
                                save: {
                                    url: menusUrl,
                                    updateFromResponse: true,
                                    trackMove: true,
                                    operationName: "operation",
                                },
                                on: {
                                    "data->onStoreUpdated": function () {
                                        this.data.each(function (obj, i) {
                                            obj.index = i + 1;
                                        })
                                    },
                                    onItemClick(id) {
                                        var item = this.getItem(id);

                                        if (!$$(item.id)) {
                                            var module = PHOENIX_MENUS_DATA[item["menu_"]];
                                            $$(VIEWS_ID).addView(_.extend(
                                                module.builder(),
                                                {
                                                    id: item.id,
                                                    padding: { right: 4 },
                                                    css: { "border-left": "none", "border-top": "none" }
                                                }
                                            ));

                                            $$(VIEWS_TABBAR_ID).addOption({
                                                id: item.id,
                                                close: true,
                                                value: "<span style='font-size:12px'>" + item["menu_name_"].trim() + "</span>"
                                            }, true);
                                        } else {
                                            $$(VIEWS_TABBAR_ID).setValue(item.id);
                                        }
                                    },
                                    onBeforeLoad() {
                                        webix.extend(this, webix.OverlayBox);
                                        this.showOverlay("正在加载用户常用功能 ...");
                                    },
                                    onAfterLoad() {
                                        this.hideOverlay();
                                        if (this.count() < 1) {
                                            this.showOverlay("没有配置常用功能");
                                        }
                                    },
                                }
                            }
                        ]
                    },
                ]
            },
        ]
    }
}

export { builder }