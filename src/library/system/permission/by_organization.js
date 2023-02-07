function builder() {
    var tree_organization_id = utils.UUID();
    var tree_menu_id = utils.UUID();

    var roles = [];

    return {
        cols: [
            {
                view: "scrollview",
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>组织架构" },
                        {
                            id: tree_organization_id,
                            view: "tree",
                            select: true,
                            drag: "inner",
                            data: [],
                            template: "{common.icon()} {common.icons()} <span>#name_#</span>",
                            type: {
                                icons(obj) {
                                    if (obj["type_"] === "depart") {
                                        return "<span class='webix_icon mdi mdi-dark mdi-newspaper-variant-multiple-outline'></span>";
                                    }

                                    return "<span class='webix_icon mdi mdi-dark mdi-account-outline'></span>";
                                }
                            },
                            ready() {
                                webix.extend(this, webix.ProgressBar).showProgress();
                                webix.ajax("/api/sys/departs", { "scope": "KIDS", "parent_id": "" }).then((data) => {
                                    $$(tree_organization_id).define("data", _.map(data.json(), (obj) => _.extend(obj, { webix_kids: obj["kids_"] === '1' })));
                                    $$(tree_organization_id).refresh();

                                    webix.extend($$(tree_id), webix.ProgressBar).hideProgress();
                                })
                            },
                            on: {
                                onDataRequest: function (id) {
                                    this.parse(
                                        webix.ajax().get("/api/sys/departs", { "scope": "KIDS", "parent_id": id })
                                            .then((data) => {
                                                return { "parent": id, "data": _.map(data.json(), (obj) => _.extend(obj, { webix_kids: obj["kids_"] === '1' })) };
                                            })
                                    )

                                    return false;
                                },
                                onAfterLoad() {
                                    this.select(this.getFirstId());
                                },
                                onAfterSelect(id) {
                                    $$(tree_menu_id).clearAll();
                                    webix.extend($$(tree_menu_id), webix.ProgressBar).showProgress();

                                    webix.ajax("/api/sys/permissions", { "organization_id": id })
                                        .then((data) => {
                                            $$(tree_menu_id).define("data", utils.tree.buildTree(data.json()))
                                            $$(tree_menu_id).openAll();

                                            webix.extend($$(tree_menu_id), webix.ProgressBar).hideProgress();


                                            // 没有符合条件的数据
                                            var overlayBox = webix.extend($$(tree_menu_id), webix.OverlayBox);
                                            if (!$$(tree_menu_id).count()) {
                                                overlayBox.showOverlay("无检索数据");
                                            } else {
                                                overlayBox.hideOverlay();
                                            }
                                        });
                                }
                            }
                        }
                    ]
                },
            },
            { view: "resizer" },
            {
                view: "scrollview",
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>权限菜单" },
                        {
                            id: tree_menu_id,
                            view: "tree",
                            type: "lineTree",
                            threeState: true,
                            data: [],
                            template: "{common.icon()} <span class='webix_icon mdi-dark #icon_#'></span> <span>#name_#</span>",
                        },
                    ]
                },
            }
        ]
    };
}

export { builder };