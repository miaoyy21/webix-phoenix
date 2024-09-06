function builder() {
    var winId = utils.UUID();
    var fullscreen_id = utils.UUID();

    var tree_id = utils.UUID();
    var grid_id = utils.UUID();
    var pager_id = utils.UUID();
    var search_id = utils.UUID();

    function open(options) {
        webix.ui({
            id: winId,
            view: "window",
            close: true,
            modal: true,
            move: true,
            width: 580,
            height: 420,
            animate: { type: "flip", subtype: "vertical" },
            head: (options["operation"] == "insert" ? "添加" : "修改") + "用户",
            position: "center",
            body: {
                rows: [{
                    id: winId + "_form",
                    view: "form",
                    data: options,
                    css: { "margin-right": "120px" },
                    rows: [
                        {
                            cols: [
                                { view: "text", name: "user_code_", label: "工号", required: true },
                                { view: "text", name: "user_name_", label: "用户名", required: true },
                            ]
                        },
                        {
                            cols: [
                                { view: "text", name: "account_id_", label: "登录名", required: true },
                                { view: "radio", name: "sex_", label: "性别", options: utils.dicts["user_sex"] },
                            ]
                        },
                        {
                            cols: [

                                {
                                    view: "search", name: "depart_name_", label: "部门名称", readonly: true, required: true, clear: false,
                                    on: {
                                        onSearchIconClick() {
                                            utils.windows.departs({
                                                checked: $$(winId + "_form").getValues()["depart_id_"],
                                                callback(checked) {
                                                    $$(winId + "_form").setValues({
                                                        "depart_id_": checked["id"],
                                                        "depart_name_": checked["name_"]
                                                    }, true);

                                                    return true;
                                                }
                                            })
                                        }
                                    }
                                },
                                { view: "checkbox", name: "is_depart_leader_", label: "部门领导", checkValue: "Yes", uncheckValue: "No" },
                            ]
                        },
                        { view: "radio", name: "valid_", label: "用户状态", options: utils.dicts["user_valid"] },
                        {
                            view: "radio", name: "classification_", label: "用户密级", options: utils.dicts["user_classification"],
                            on: {
                                onBeforeRender() {
                                    if (PHOENIX_SETTING["classification_enable"] === "Yes") {
                                        this.show();
                                    } else {
                                        this.hide();
                                    }
                                }
                            }
                        },
                        {
                            cols: [
                                { view: "text", name: "telephone_", label: "联系电话" },
                                { view: "text", name: "email_", label: "邮箱" },
                            ]
                        },
                        {
                            cols: [
                                { view: "datepicker", name: "birth_", label: "出生日期", clear: false, format: utils.formats["date"].format },
                                {}
                            ]
                        },
                        { view: "textarea", name: "description_", label: "描述" },
                    ],
                    elementsConfig: { labelAlign: "right", clear: false },
                },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", width: 80, label: "保存", css: "webix_primary",
                            click() {
                                if (!$$(winId + "_form").validate()) return;

                                var value = $$(winId + "_form").getValues();
                                if (_.isEqual(value["operation"], "insert")) {
                                    utils.grid.add($$(grid_id), value);
                                } else {
                                    $$(grid_id).updateItem(value.id, value);
                                }

                                // 改变部门
                                var deptId = $$(tree_id).getSelectedId();
                                if (deptId !== value["depart_id_"]) {
                                    _.delay(reload, 250, deptId);
                                }

                                $$(winId).hide();
                            }
                        },
                        { width: 8 },
                        { view: "button", width: 80, value: "取消", css: "webix_transparent ", click: () => $$(winId).hide() },
                        { width: 8 }
                    ]
                },
                { height: 8 }
                ]
            },
            on: { onHide() { this.close() } }
        }).show();
    }

    // 刷新列表
    function reload(id) {
        var request = webix.ajax().sync().get("/api/sys/users", { "depart_id": id, scope: "ALL" });
        var response = JSON.parse(request.responseText);

        $$(grid_id).clearAll();
        $$(grid_id).define("data", response);
        $$(grid_id).refresh();
    }

    // 查找
    function search() {
        var text = $$(search_id).getValue();
        if (!text) return;

        utils.windows.organization({
            multiple: false,
            filter: text,
            callback(checked) {
                console.log(checked);
                if (checked["type_"] === "depart") {
                    var path = utils.tree.path($$(tree_id), checked["id"]);

                    _.forEach(path, (id) => $$(tree_id).open(id, true));
                    $$(tree_id).select(checked["id"]);
                } else {
                    var path = utils.tree.path($$(tree_id), checked["parent_id_"]);

                    // 选择部门
                    _.forEach(path, (id) => $$(tree_id).open(id, true));
                    $$(tree_id).select(checked["parent_id_"]);

                    // 选择用户
                    var pager = $$(grid_id).getPager();
                    if (pager) {
                        var index = $$(grid_id).getIndexById(checked["id"]);
                        var size = pager.config.size;
                        $$(grid_id).setPage(Math.floor(index / size));
                    }

                    $$(grid_id).select(checked["id"]);
                }

                $$(search_id).setValue();
                return true;
            }
        })
    }

    return {
        cols: [
            {
                gravity: 2,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                id: search_id, view: "search", align: "center", placeholder: "按部门名称或用户名过滤",
                                on: {
                                    onEnter: search,
                                    onSearchIconClick: search,
                                }
                            },
                        ]
                    },
                    {
                        id: tree_id,
                        view: "tree",
                        select: true,
                        data: [],
                        template: "{common.icon()} {common.icons()} <span>#name_#</span>",
                        type: {
                            icons: (obj) => utils.icons.departs.tree($$(tree_id), obj)
                        },
                        ready() {
                            utils.tree.builder($$(tree_id), "/api/sys/departs");
                        },
                        on: {
                            onBeforeLoad() {
                                webix.extend(this, webix.ProgressBar).showProgress();
                            },
                            onAfterLoad() {
                                webix.extend(this, webix.ProgressBar).hideProgress();
                                if (!this.count()) {
                                    webix.extend(this, webix.OverlayBox).showOverlay("无检索数据");
                                    return;
                                }

                                this.select(this.getFirstId());
                                this.openAll();
                            },
                            onAfterSelect: (id) => reload(id),
                        }
                    }
                ]
            },
            { view: "resizer" },
            {
                id: fullscreen_id,
                gravity: 7,
                rows: [
                    {
                        view: "toolbar",
                        cols: [
                            {
                                view: "button", label: "新增", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-plus",
                                click() {
                                    var item = $$(tree_id).getSelectedItem();
                                    if (!item) return;

                                    open({
                                        "operation": "insert",
                                        "depart_id_": item["id"],
                                        "depart_name_": item["name_"],
                                        "is_depart_leader_": "No",
                                        "sex_": 'Unknown',
                                        "valid_": 'Disable',
                                        "classification_": "0"
                                    });
                                }
                            },
                            {
                                view: "button", label: "编辑", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-pencil",
                                click() {
                                    var row = $$(grid_id).getSelectedItem();
                                    if (!row) return;

                                    open(_.extend(row, { "operation": "update" }));
                                }
                            },
                            {
                                view: "button", label: "删除", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-trash-can",
                                click: () => utils.grid.remove($$(grid_id), null, "用户", "user_name_")
                            },
                            {
                                view: "button", label: "激活", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-select-place",
                                click() {
                                    var row = $$(grid_id).getSelectedItem();
                                    if (!row) return;

                                    row["valid_"] = "Effective";
                                    $$(grid_id).updateItem(row.id, row);
                                }
                            },
                            {
                                view: "button", label: "锁定", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-select-remove",
                                click() {
                                    var row = $$(grid_id).getSelectedItem();
                                    if (!row) return;

                                    row["valid_"] = "Locked";
                                    $$(grid_id).updateItem(row.id, row);
                                }
                            },
                            {
                                view: "button", label: "重置密码", autowidth: true, css: "webix_danger", type: "icon", icon: "mdi mdi-18px mdi-lock-reset",
                                click() {
                                    var row = $$(grid_id).getSelectedItem();
                                    if (!row) return;

                                    webix.confirm({
                                        title: "系统提示",
                                        text: "确认重置用户【" + row["user_name_"] + "】的密码为初始密码 ?",
                                        type: "confirm-error"
                                    }).then((result) => {
                                        webix.ajax().post("/api/sys/users?method=ResetPassword", { id: row["id"] })
                                            .then((data) => {
                                                webix.message({ type: "success", text: "重置用户【" + row["user_name_"] + "】的初始密码成功" });
                                            })
                                    });
                                }
                            },
                            {},
                            { view: "icon", icon: "mdi mdi-18px mdi-fullscreen", tooltip: "全屏模式", click: () => webix.fullscreen.set($$(fullscreen_id)) },
                        ]
                    },
                    {
                        view: "scrollview",
                        body: {
                            rows: [
                                {
                                    id: grid_id,
                                    view: "datatable",
                                    css: "webix_data_border webix_header_border",
                                    resizeColumn: true,
                                    tooltip: true,
                                    select: "row",
                                    drag: "order",
                                    leftSplit: 3,
                                    data: [],
                                    save: {
                                        url: "/api/sys/users",
                                        updateFromResponse: true,
                                        trackMove: true,
                                        operationName: "operation"
                                    },
                                    pager: pager_id,
                                    columns: [
                                        { id: "index", header: { text: "№", css: { "text-align": "center" } }, css: { "text-align": "center" }, width: 50 },
                                        { id: "user_code_", header: { text: "工号", css: { "text-align": "center" } }, css: { "text-align": "center" }, sort: "text", width: 100 },
                                        { id: "user_name_", header: { text: "用户名", css: { "text-align": "center" } }, sort: "text", width: 80 },
                                        { id: "account_id_", header: { text: "登录名", css: { "text-align": "center" } }, sort: "text", width: 100 },
                                        { id: "sex_", header: { text: "性别", css: { "text-align": "center" } }, template: utils.icons.users["sex"], css: { "text-align": "center" }, sort: "text", width: 50 },
                                        { id: "valid_", header: { text: "用户状态", css: { "text-align": "center" } }, template: utils.icons.users["valid"], css: { "text-align": "center" }, sort: "text", width: 80 },
                                        { id: "is_depart_leader_", header: { text: "部门领导", css: { "text-align": "center" } }, template: utils.icons.users["is_depart_leader"], css: { "text-align": "center" }, sort: "int", width: 100 },
                                        { id: "classification_", header: { text: "用户密级", css: { "text-align": "center" } }, template: (user) => _.find(utils.dicts["user_classification"], (o) => o.id === user["classification_"]).value, css: { "text-align": "center" }, sort: "text", width: 80 },
                                        { id: "telephone_", header: { text: "联系电话", css: { "text-align": "center" } }, width: 120 },
                                        { id: "email_", header: { text: "邮箱", css: { "text-align": "center" } }, width: 160 },
                                        { id: "birth_", header: { text: "出生日期", css: { "text-align": "center" } }, format: utils.formats["date"].format, css: { "text-align": "center" }, width: 100 },
                                        { id: "description_", header: { text: "描述", css: { "text-align": "center" } }, width: 360 },
                                        { id: "create_at_", header: { text: "创建时间", css: { "text-align": "center" } }, sort: "date", css: { "text-align": "center" }, sort: "date", format: utils.formats["datetime"].format, width: 150 },
                                        { id: "login_at_", header: { text: "最近登录时间", css: { "text-align": "center" } }, sort: "date", css: { "text-align": "center" }, sort: "date", format: utils.formats["datetime"].format, width: 150 }
                                    ],
                                    ready() {
                                        if (PHOENIX_SETTING["classification_enable"] === "Yes") {
                                            !this.isColumnVisible("classification_") && this.showColumn("classification_");
                                        } else {
                                            this.isColumnVisible("classification_") && this.hideColumn("classification_");
                                        }
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
                                {
                                    cols: [
                                        {},
                                        {
                                            id: pager_id,
                                            view: "pager",
                                            template: function (obj, common) {
                                                var master = $$(obj.id).$master;
                                                if (master.count()) {
                                                    return common.first(obj) + common.prev(obj) + common.pages(obj) + common.next(obj) + common.last(obj)
                                                        + "  当前在 " + common.page(obj) + "页/" + obj.limit + "页，总共 " + webix.i18n.intFormat(obj.count) + "条记录。";
                                                } else {
                                                    return "  总共 0条记录"
                                                }
                                            },
                                            size: 20
                                        }
                                    ]
                                },
                            ]
                        }
                    }
                ]
            }
        ],
    };
}

export { builder };