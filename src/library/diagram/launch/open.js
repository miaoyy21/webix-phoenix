function open(options) {
    var win = utils.UUID();
    var menu = utils.UUID();
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
            rows: [
                {
                    view: "toolbar",
                    cols: [
                        { width: 12 },
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
                    cols: [
                        {
                            id: menu,
                            view: "menu",
                            layout: "y",
                            width: 240,
                            select: true,
                            data: [
                                { id: "DraftRevokedRejected", value: "草稿箱", badge: "1" },
                                { id: "Executing", value: "执行中", badge: "24" },
                                { id: "Suspended", value: "已挂起" },
                                { id: "Finished", value: "已结束", badge: "1224" }
                            ],
                            on: {
                                onBeforeLoad() {
                                    webix.extend(this, webix.ProgressBar).showProgress();
                                },
                                onAfterLoad() {
                                    webix.extend(this, webix.ProgressBar).hideProgress();

                                    this.select(this.getFirstId());
                                },
                                onAfterSelect(id) {
                                    console.log("onAfterSelect", arguments);
                                }
                            }
                        },
                        {
                            view: "resizer"
                        },
                        {
                            rows: [
                                {
                                    view: "toolbar", cols: [
                                        {
                                            view: "search", align: "center", placeholder: "请输入流程名称等 ...",
                                            on: {
                                                onTimedKeyPress() {
                                                    var value = this.getValue().toLowerCase();

                                                    $$(dview).filter(function (obj) {
                                                        return (obj["code_"] + "|" + obj["name_"] + "|" + (obj["description_"] || "")).toLowerCase().indexOf(value) != -1;
                                                    });
                                                }
                                            }
                                        },
                                        {}
                                    ]
                                },
                                {
                                    view: "template",
                                    template: "XXXXXXX"
                                }
                            ]
                        }
                    ],
                }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
};

export { open }