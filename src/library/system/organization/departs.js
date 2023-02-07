function builder() {
    var tree_id = utils.UUID();
    var form_id = utils.UUID();

    // 删除当前节点
    function remove(item) {
        var prevId = $$(tree_id).getPrevId(item.id);
        var lastId = $$(tree_id).getLastId(item.id);
        var sid = prevId ? prevId : lastId;

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
                                $$(tree_id).select($$(tree_id).add({ "code_": utils.UUID(), "name_": "<部门名称>", "valid_": "Effective" }, 0));
                            } else {
                                $$(tree_id).select($$(tree_id).add({ "code_": utils.UUID(), "name_": "<部门名称>", "valid_": "Effective" }, 0, item.$parent));
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
                                webix.alert({ type: "alert-warning", title: "系统提示", text: "请选择一个部门" });
                                return;
                            }

                            var id = $$(tree_id).add({ "code_": utils.UUID(), "name_": "<部门名称>", "valid_": "Effective" }, 0, item.id);
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
                                text: "确认删除部门 【" + item["name_"] + "】 ?",
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
                        select: true,
                        drag: "inner",
                        data: [],
                        save: {
                            url: "/api/sys/departs",
                            updateFromResponse: true,
                            trackMove: true,
                            operationName: "operation",
                            on: {
                                onAfterSave(response, id, details) {
                                    if (!_.isUndefined(response["update_at_"]) && !_.isNull(response["update_at_"])) {
                                        webix.message({ type: "success", text: "保存成功" });
                                    }
                                }
                            }
                        },
                        template: "{common.icon()} {common.icons()} <span>#name_#</span>",
                        type: {
                            icons: (obj) => utils.icons.departs.tree($$(tree_id), obj)
                        },
                        ready() {
                            utils.tree.builder($$(tree_id), "/api/sys/departs");
                        },
                        on: {
                            onAfterLoad() {
                                this.select(this.getFirstId());
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
                                { view: "text", name: "code_", label: "部门编码", required: true },
                                { view: "text", name: "name_", label: "部门名称", required: true },
                                { view: "radio", name: "valid_", label: "部门状态", options: utils.dicts["depart_valid"] },
                                { view: "textarea", name: "description_", label: "描述", maxHeight: 96 },
                                {
                                    cols: [
                                        {},
                                        {
                                            view: "button", label: "保存", css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-content-save-outline", click() {
                                                if (!$$(form_id).validate()) return;

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