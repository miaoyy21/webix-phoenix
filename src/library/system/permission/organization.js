function builder() {
    var tree_id = utils.UUID();
    var grid_id = utils.UUID();

    var roles = [];

    return {
        cols: [
            {
                view: "scrollview",
                body: {
                    rows: [
                        { view: "label", label: "<span style='margin-left:8px'></span>组织架构", height: 38 },
                        {
                            id: tree_id,
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
                                    console.log(data.json());
                                    $$(tree_id).define("data", _.map(data.json(), (obj) => _.extend(obj, { webix_kids: obj["kids_"] === '1' })));
                                    $$(tree_id).refresh();

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
                                    $$(grid_id).clearAll();
                                    $$(grid_id).showOverlay("数据加载中...");
                                    if (!_.size(roles)) {
                                        roles = JSON.parse(webix.ajax().sync().get("/api/sys/roles").responseText);
                                    }

                                    webix.ajax("/api/sys/organization_roles", { "organization_id": id })
                                        .then((data) => {
                                            // 转换为Map对象
                                            var orgRoles = _.map(data.json(), (obj) => obj["role_id_"]);

                                            // 设置选中状态
                                            $$(grid_id).define("data", _.map(webix.copy(roles), (role) => _.extend(role, { "checked": _.indexOf(orgRoles, role.id) >= 0 })))


                                            $$(grid_id).hideOverlay();
                                            if (!$$(grid_id).count()) {
                                                $$(grid_id).showOverlay("无检索数据");
                                                return;
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
                        {
                            view: "toolbar",
                            cols: [
                                {
                                    view: "button", label: "保存", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline",
                                    click() {
                                        var roles = [];
                                        $$(grid_id).eachRow((id) => {
                                            if ($$(grid_id).getItem(id)["checked"]) {
                                                roles.push(id);
                                            }
                                        }, true);

                                        var params = { "organization_id": $$(tree_id).getSelectedId(), "roles": roles };
                                        webix.ajax().post("/api/sys/organization_roles?method=PatchRoles", params)
                                            .then((res) => webix.message({ type: "success", text: "保存成功" }));
                                    }
                                },
                                {}
                            ]
                        },
                        {
                            id: grid_id,
                            view: "datatable",
                            css: "webix_data_border webix_header_border",
                            editable: true,
                            checkboxRefresh: true,
                            columns: [
                                { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                                {
                                    id: "checked", header: { text: "选择", css: { "text-align": "center" } }, css: { "text-align": "center" },
                                    template(obj, common, value) {
                                        if (value) {
                                            return "<span class='webix_table_checkbox checked webix_icon phoenix_primary_icon mdi mdi-checkbox-marked' />";
                                        }

                                        return "<span class='webix_table_checkbox notchecked webix_icon mdi mdi-checkbox-blank-outline'/>";
                                    }, width: 50
                                },
                                { id: "code_", header: { text: "角色编码", css: { "text-align": "center" } }, sort: "text", width: 120 },
                                { id: "name_", header: { text: "角色名称", css: { "text-align": "center" } }, sort: "text", fillspace: true },
                            ],
                            on: {
                                "data->onStoreUpdated": function () {
                                    this.data.each(function (obj, i) {
                                        obj.index = i + 1;
                                    })
                                },
                            }
                        },
                    ]
                }
            }
        ]
    };
}

export { builder };