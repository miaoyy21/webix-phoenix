function builder() {
    var tree_id = utils.UUID();
    var form_id = utils.UUID();

    // 删除当前节点
    function remove(item) {
        var prevId = $$(tree_id).getPrevId(item.id);
        var nextId = $$(tree_id).getNextId(item.id);
        var sid = prevId ? prevId : nextId;


        var url = $$(tree_id).config.save.url;
        webix.dp($$(tree_id)).ignore(
            function () {
                webix.ajax()
                    .post(url, { "id": item.id, "operation": "delete" })
                    .then(
                        (res) => {
                            $$(tree_id).remove(item.id);

                            if ($$(tree_id).count()) {
                                if (sid && sid != item.id) {
                                    $$(tree_id).select(sid);
                                } else {
                                    $$(tree_id).showOverlay("无检索数据");
                                }
                            }
                        }
                    );
            }
        )
    }

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    {
                        view: "button", label: "新增同级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-line-spacing",
                        click() {
                            if (!$$(tree_id).count()) {
                                $$(tree_id).hideOverlay();
                            }

                            var item = $$(tree_id).getSelectedItem();
                            if (!item) {
                                $$(tree_id).select($$(tree_id).add({ "name_": "<菜单名称>", "icon_": "mdi mdi-checkbox-blank-circle-outline", "valid_": "Effective" }, 0));
                            } else {
                                $$(tree_id).select($$(tree_id).add({ "name_": "<菜单名称>", "icon_": "mdi mdi-checkbox-blank-circle-outline", "valid_": "Effective" }, 0, item.$parent));
                            }
                        }
                    },
                    {
                        view: "button", label: "新增下级", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-format-list-group",
                        click() {
                            if (!$$(tree_id).count()) {
                                $$(tree_id).hideOverlay();
                            }

                            var item = $$(tree_id).getSelectedItem();
                            if (!item) {
                                webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个菜单" });
                                return;
                            }

                            var id = $$(tree_id).add({ "name_": "<菜单名称>", "icon_": "mdi mdi-checkbox-blank-circle-outline", "valid_": "Effective" }, 0, item.id);
                            $$(tree_id).select(id);
                            $$(tree_id).open(item.id);
                        }
                    },
                    {
                        view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                        click() {
                            var item = $$(tree_id).getSelectedItem();
                            if (!item) return;

                            webix.confirm({
                                title: "系统提示",
                                text: "确认删除菜单 【" + item["name_"] + "】 ?",
                                type: "confirm-error"
                            }).then((result) => remove(item));
                        }
                    },
                ]
            },
            {
                cols: [
                    {
                        id: tree_id,
                        view: "tree",
                        type: "lineTree",
                        select: true,
                        drag: "inner",
                        data: [],
                        save: {
                            url: "/api/sys/menus",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation",
                            on: {
                                onAfterSave(response, id, details) {
                                    if (response["update_at_"]) {
                                        webix.message({ type: "success", text: "保存成功" });
                                    }
                                }
                            }
                        },
                        template: "{common.icon()} <span class='webix_icon mdi-dark #icon_#'></span> <span>#name_#</span>",
                        ready() {
                            utils.tree.builder($$(tree_id), "/api/sys/menus");
                        },
                        on: {
                            onAfterLoad() {
                                this.select(this.getFirstId());
                                // this.openAll();
                            },
                            onAfterSelect() {
                                $$(form_id).clearValidation();
                            }
                        }
                    },
                    { view: "resizer" },
                    {
                        view: "scrollview",
                        body: {
                            id: form_id,
                            view: "form",
                            elements: [
                                { view: "text", name: "name_", label: "菜单名称", required: true },
                                { view: "combo", name: "menu_", label: "功能点", options: _.flatten(["NONE", _.sortBy(_.map(PHOENIX_MENUS_DATA, (_, k) => k))]), required: true },
                                {
                                    view: "search", name: "icon_", label: "菜单图标", readonly: true, required: true, clear: false,
                                    on: {
                                        onSearchIconClick() {
                                            utils.windows.icons({
                                                callback(icon) {
                                                    $$(form_id).setValues({
                                                        "icon_": icon
                                                    }, true);
                                                }
                                            })
                                        }
                                    }
                                },
                                { view: "radio", name: "valid_", label: "菜单状态", options: utils.dicts["menu_valid"] },
                                { view: "textarea", name: "description_", label: "描述", maxHeight: 96 },
                                {
                                    cols: [
                                        {},
                                        {
                                            view: "button", label: "保存", css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline", click() {
                                                if (!$$(form_id).validate()) return;
                                                if (!$$(form_id).isDirty()) return;

                                                var value = $$(form_id).getValues();
                                                $$(tree_id).updateItem(value.id, value);
                                            }
                                        },
                                        {}
                                    ]
                                }
                            ],
                            data: {},
                            on: {
                                onBeforeLoad: () => $$(form_id).bind(tree_id)
                            }
                        },
                    }
                ]
            }
        ]
    };
}

export { builder };