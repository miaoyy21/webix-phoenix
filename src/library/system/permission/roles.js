function builder() {
    var grid_id = utils.UUID();
    var list_id = utils.UUID();

    return {
        cols: [
            {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "search", align: "center", placeholder: "按角色过滤",
                                on: {
                                    onTimedKeypress() {
                                        var text = this.getValue().toString().toLowerCase();

                                        $$(grid_id).filter((obj) => {
                                            var filter = [obj["code_"], obj["name_"]].join("|");
                                            filter = filter.toString().toLowerCase();
                                            return (filter.indexOf(text) != -1);
                                        });

                                        var first = $$(grid_id).getFirstId();
                                        var overlayBox = webix.extend($$(list_id), webix.OverlayBox);
                                        if (!first) {
                                            $$(grid_id).showOverlay("无符合条件的数据");

                                            overlayBox.showOverlay("无检索数据");
                                            $$(list_id).clearAll();
                                        } else {
                                            $$(grid_id).hideOverlay();

                                            overlayBox.hideOverlay();
                                            $$(grid_id).select(first);
                                        }
                                    }
                                }
                            },
                        ]
                    },
                    {
                        id: grid_id,
                        view: "datatable",
                        css: "webix_data_border webix_header_border",
                        select: "row",
                        url: "/api/sys/roles",
                        columns: [
                            { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                            { id: "name_", header: { text: "角色名称", css: { "text-align": "center" } }, sort: "text", width: 160 },
                            { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, editor: "text", fillspace: true },
                        ],
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
                            onAfterSelect(row) {
                                $$(list_id).clearAll();
                                webix.extend($$(list_id), webix.ProgressBar).showProgress();

                                webix.ajax("/api/sys/organization_roles", { "role_id": row.id })
                                    .then((data) => {
                                        $$(list_id).define("data", data.json())
                                        $$(list_id).refresh();

                                        webix.extend($$(list_id), webix.ProgressBar).hideProgress();
                                        var overlayBox = webix.extend($$(list_id), webix.OverlayBox);
                                        if (!$$(list_id).count()) {
                                            overlayBox.showOverlay("无检索数据");
                                        } else {
                                            overlayBox.hideOverlay();
                                        }
                                    });
                            },
                        }
                    },
                ]
            },
            { view: "resizer" },
            {
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() {
                                    utils.windows.organization({
                                        multiple: true,
                                        callback(checked) {
                                            var items = _.filter(checked, (item) => !$$(list_id).exists(item.id));
                                            if (!items.length) return;

                                            var params = { "operation": "insert", "role_id": $$(grid_id).getSelectedId(false, true), "organization": _.map(items, "id") };
                                            var response = JSON.parse(webix.ajax().sync().post("/api/sys/organization_roles?method=PatchOrganization", params).responseText);
                                            if (response["status"] === "success") {
                                                _.forEach(items, (item) => $$(list_id).add(item), 0);
                                                webix.message({ type: "success", text: "保存成功" });

                                                return true;
                                            }

                                            return false;
                                        }
                                    })
                                }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click() {
                                    var checked = [];
                                    $$(list_id).data.each((item) => item["checked"] && checked.push(item.id));
                                    if (!checked.length) return;

                                    webix.confirm({
                                        title: "系统提示",
                                        text: "确认删除 【" + checked.length + "条】 角色关联的组织记录 ?",
                                        type: "confirm-error"
                                    }).then((result) => {
                                        var params = { "operation": "delete", "role_id": $$(grid_id).getSelectedId(false, true), "organization": checked };
                                        var response = JSON.parse(webix.ajax().sync().post("/api/sys/organization_roles?method=PatchOrganization", params).responseText);
                                        if (response["status"] === "success") {
                                            $$(list_id).remove(checked);

                                            webix.message({ type: "success", text: "删除成功" });
                                            if (!$$(list_id).count()) {
                                                var overlayBox = webix.extend($$(list_id), webix.OverlayBox);
                                                overlayBox.showOverlay("无检索数据");
                                            }
                                        }
                                    });
                                }
                            },
                            {},
                        ]
                    },
                    {
                        id: list_id,
                        view: "unitlist",
                        scroll: "auto",
                        uniteBy: (obj) => obj["parent_name_"],
                        template(obj) {
                            var icon = "<span class='webix_icon mdi mdi-18px mdi-account-outline' style='margin:0px 8px'></span>";
                            if (obj["type_"] === "depart") {
                                icon = "<span class='webix_icon mdi mdi-18px mdi-newspaper-variant-multiple-outline' style='margin:0px 8px'></span>";
                            }

                            if (obj["checked"]) {
                                return "<span class='webix_icon phoenix_primary_icon mdi mdi-18px mdi-checkbox-marked checkbox_icon'></span>  " + icon + obj["name_"];
                            }

                            return "<span class='webix_icon mdi mdi-18px mdi-checkbox-blank-outline checkbox_icon'></span> " + icon + obj["name_"];
                        },
                        onClick: {
                            "checkbox_icon"(event, id) {
                                var item = $$(list_id).getItem(id);

                                item["checked"] = !item["checked"];
                                $$(list_id).updateItem(id, item);
                            }
                        },
                    }
                ]
            }
        ]
    };
}

export { builder };