import "./install";
import { utils } from "./utils";

// 自定义的工具库
_.extend(global, { utils });


_.extend(global, {
    MAIN_PAGE_ID: "PHOENIX_MAIN",
    MAIN_PAGE_TASKS_ID: "MAIN_PAGE_TASKS",
    EXECUTING_PAGE_ID: "PHOENIX_EXECUTING_PAGE",
    LOGIN_PAGE_ID: "PHOENIX_LOGIN_PAGE",
    LOGIN_PAGE_FORM_ID: "PHOENIX_LOGIN_PAGE_FORM",
    CHANGE_PASSWORD_PAGE_ID: "PHOENIX_CHANGE_PASSWORD_PAGE",
    HOME_PAGE_ID: "PHOENIX_HOME_PAGE",
    MENU_TREE_ID: "PHOENIX_MENU_TREE",
    VIEWS_ID: "PHOENIX_VIEWS",
    VIEWS_TABBAR_ID: "PHOENIX_VIEWS_TABBAR",
});

// 界面初始化
webix.ready(function () {

    // 登录界面
    webix.ui({
        id: LOGIN_PAGE_ID,
        css: {
            "background": "url('./assets/background.jpeg') no-repeat right top",
            "background-size": "100% 100%",
        },
        rows: [
            {},
            {
                cols: [
                    {},
                    {
                        id: LOGIN_PAGE_FORM_ID,
                        view: "form",
                        width: 360,
                        rows: [
                            {
                                view: "fieldset",
                                label: "登 录",
                                body: {
                                    rows: [
                                        { view: "text", name: "account_id", label: "登录名", labelPosition: "top", clear: true, required: true },
                                        { view: "text", name: "password", label: "密码", labelPosition: "top", type: "password", clear: true, required: true },
                                        { view: "switch", name: "auto_login", label: "自动登录", labelWidth: 60, labelAlign: "right" },
                                    ]
                                }
                            },
                            { view: "combo", name: "depart_id", label: "登录部门", options: [], labelWidth: 60, labelAlign: "right" },
                            {
                                view: "toolbar",
                                borderless: true,
                                cols: [
                                    {},
                                    {
                                        view: "button", value: "登录", css: "webix_primary",
                                        click() {
                                            if (!$$(LOGIN_PAGE_FORM_ID).validate()) return;

                                            var user = $$(LOGIN_PAGE_FORM_ID).getValues();
                                            var departs = JSON.parse(webix.ajax().sync().get("/api/sys/users?PHOENIX_USING_MENU=0", { scope: "LOGIN", "account_id": user["account_id"] }).responseText);

                                            var departView = $$(LOGIN_PAGE_FORM_ID).elements["depart_id"];
                                            if (_.size(departs) < 1) {
                                                webix.message({ type: "error", text: "不存在的用户" });
                                                return
                                            } else if (_.size(departs) === 1) {
                                                // 只有1个部门时，不需要选择登录部门
                                                user["depart_id"] = _.first(departs)["id"];
                                            } else {
                                                // 需要选择登录部门
                                                departView.define("options", _.map(departs, (depart) => ({ "id": depart["id"], "value": depart["name_"] })));
                                                departView.refresh();

                                                departView.show();
                                                var find = _.find(departs, (depart) => depart["id"] === user["depart_id"])
                                                if (!find) {
                                                    webix.message({ type: "info", text: "请选择登录部门" });
                                                    return
                                                }
                                            }

                                            webix.ajax()
                                                .post("/api/sys/login?method=ByPassword", user)
                                                .then((data) => {
                                                    // 自动登录
                                                    if (user["auto_login"]) {
                                                        webix.storage.local.put("PHOENIX_AUTO_LOGIN", 1);
                                                    } else {
                                                        webix.storage.local.remove("PHOENIX_AUTO_LOGIN");
                                                    }

                                                    $$(LOGIN_PAGE_FORM_ID).clear();
                                                    departView.hide();

                                                    $$(MAIN_PAGE_ID).show();
                                                    $$(LOGIN_PAGE_ID).hide();

                                                    // 设置该参数的意义：避免密码登录时，多显示1条Token登录
                                                    reloadMenus({ "byPassword": true });
                                                })
                                        }
                                    },
                                    {}
                                ]
                            },
                        ]
                    },
                    {}
                ]
            },
            {}
        ]
    }).hide();

    // 自动加载用户菜单
    function reloadMenus(params) {
        webix.extend($$(MENU_TREE_ID), webix.ProgressBar).showProgress();
        webix.ajax().get("/api/sys/login?method=ByToken", params)
            .then((res) => {
                var data = res.json();

                var menus = _.map(
                    _.sortBy(data["menus"], (o) => Number(o["order_"])), (d) => ({
                        "id": d["id"],
                        "menu_": d["menu_"],
                        "value": d["name_"],
                        "parent_id_": d["parent_id_"],
                        "icon": d["icon_"]
                    }));

                $$(MENU_TREE_ID).clearAll();
                $$(MENU_TREE_ID).define("data", utils.tree.buildTree(menus))

                $$(MAIN_PAGE_TASKS_ID).data.badge = data["tasks"] > 0 ? data["tasks"] : null;
                $$(MAIN_PAGE_TASKS_ID).refresh();

                webix.extend(view, webix.ProgressBar).hideProgress();
            })
    }

    // 主界面
    webix.ui({
        id: MAIN_PAGE_ID,
        rows: [
            {
                view: "toolbar",
                css: { "background": "#F8F9F9" }, elements: [
                    { view: "icon", icon: "mdi mdi-menu", click: () => { $$(MENU_TREE_ID).toggle() } },
                    { view: "label", label: PHOENIX_SETTING["name"] },
                    {},
                    {
                        id: MAIN_PAGE_TASKS_ID, view: "icon", css: "phoenix_primary_icon", icon: "mdi mdi-message", tooltip: "任务中心",
                        click() {
                            onMenuSelect({
                                "id": EXECUTING_PAGE_ID,
                                "menu_": "framework_tasks",
                                "value": "任务中心"
                            });
                        }
                    },
                    {
                        view: "icon", icon: "wxi-user", tooltip: "个人设置",
                        popup: {
                            view: 'contextmenu',
                            data: [
                                { id: "change_password", value: '修改密码' },
                                { id: 'logout', value: '退出系统' },
                            ],
                            on: {
                                onMenuItemClick(id) {
                                    if (id === "change_password") {
                                        change_password();
                                    } else if (id === 'logout') {
                                        // 移除自动登录
                                        webix.storage.local.remove("PHOENIX_AUTO_LOGIN");

                                        // 显示登录界面
                                        $$(LOGIN_PAGE_ID).show();
                                        $$(LOGIN_PAGE_FORM_ID).elements["depart_id"].hide();
                                        $$(LOGIN_PAGE_FORM_ID).clear();

                                        // 关闭所有的页面，并隐藏主界面
                                        var menus = _.pluck($$(VIEWS_TABBAR_ID).data.options, "id")
                                        _.each(menus, (id) => { id != HOME_PAGE_ID && $$(VIEWS_TABBAR_ID).removeOption(id) });
                                        $$(MAIN_PAGE_ID).hide();

                                        webix.storage.cookie.put("PHOENIX_USING_MENU", null);
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            {
                cols: [
                    {
                        id: MENU_TREE_ID,
                        view: "sidebar",
                        css: { "background": "#F8F9F9" },
                        scroll: "y",
                        width: 240,
                        data: null,
                        on: { onAfterSelect(id) { onMenuSelect(this.getItem(id)) } }
                    },
                    { view: "resizer" },
                    {
                        rows: [
                            {
                                id: VIEWS_TABBAR_ID,
                                view: "tabbar",
                                multiview: true,
                                multipleOpen: true,
                                options: [
                                    { id: HOME_PAGE_ID, value: "<span style='font-size:12px'>首页</span>" }
                                ],
                                optionWidth: 120,
                                height: 30,
                                on: {
                                    onOptionRemove(id) { $$(VIEWS_ID).removeView(id) },
                                    onChange: onTabChange
                                },
                            },
                            {
                                id: VIEWS_ID,
                                animate: false,
                                cells: [
                                    PHOENIX_FRAMEWORK_DATA.framework_home.builder(),

                                    // _.extend(
                                    //     PHOENIX_MENUS_DATA.diagram_full_designer.builder(),
                                    //     {
                                    //         id: HOME_PAGE_ID,
                                    //         css: { "border-left": "none", "border-top": "none" }
                                    //     },
                                    // )
                                ]
                            },
                            {
                                view: "template",
                                height: 30,
                                css: { "text-align": "center", "background": "#F8F9F9" },
                                template: PHOENIX_SETTING["copyright"] + "<span style='padding-left:24px'>版本号: " + PHOENIX_SETTING["version"] + "</span>"
                            }
                        ]
                    }
                ]
            }
        ],
    }).hide();

    // 如果是自动登录，那么直接请求加载菜单，如果因为Token无效加载失败，那么自动跳转到登录界面
    if (webix.storage.local.get("PHOENIX_AUTO_LOGIN")) {
        $$(LOGIN_PAGE_ID).hide();

        $$(MAIN_PAGE_ID).show();
        reloadMenus();
    } else {
        $$(LOGIN_PAGE_ID).show();
        $$(LOGIN_PAGE_FORM_ID).elements["depart_id"].hide();

        $$(MAIN_PAGE_ID).hide();
    }
});

/*****************************************************************************************************************/

// 修改密码
function change_password() {

    webix.ui({
        id: CHANGE_PASSWORD_PAGE_ID,
        view: "window",
        modal: true,
        close: true,
        height: 420,
        width: 360,
        headHeight: 40,
        position: "center",
        head: "修改密码",
        body: {
            rows: [
                {
                    id: "PHOENIX_CHANGE_PASSWORD_FORM",
                    view: "form",
                    borderless: true,
                    gravity: 2,
                    data: {},
                    rows: [
                        { view: "text", name: "old_password", label: "原密码", labelPosition: "top", type: "password", clear: true, required: true },
                        { view: "text", name: "new_password1", label: "新密码", labelPosition: "top", type: "password", clear: true, required: true },
                        { view: "text", name: "new_password2", label: "确认密码", labelPosition: "top", type: "password", clear: true, required: true },
                    ],
                },
                { height: 8, css: { "border-top": "none" } },
                {
                    view: "toolbar",
                    borderless: true,
                    height: 34,
                    cols: [
                        {},
                        {
                            view: "button", label: "修改", autowidth: true, css: "webix_primary", type: "icon", icon: "mdi mdi-18px mdi-shield-key",
                            click() {
                                if (!$$("PHOENIX_CHANGE_PASSWORD_FORM").validate()) return;

                                var values = $$("PHOENIX_CHANGE_PASSWORD_FORM").getValues();

                                // 确认密码与新密码
                                if (values["new_password1"] != values["new_password2"]) {
                                    webix.message({ type: "error", text: "确认密码与新密码不一致" });
                                    return
                                }

                                // 新密码与旧密码
                                if (values["new_password1"] == values["old_password"]) {
                                    webix.message({ type: "error", text: "新密码不能与旧密码相同" });
                                    return
                                }

                                // 修改密码
                                webix.ajax().post("/api/sys/login?method=ChangePassword&PHOENIX_USING_MENU=0",
                                    {
                                        "old_password": values["old_password"],
                                        "new_password": values["new_password1"]
                                    }
                                ).then((data) => {
                                    webix.message({ type: "success", text: "修改密码成功" });
                                    $$(CHANGE_PASSWORD_PAGE_ID).hide();
                                })
                            }
                        },
                        {},
                    ]
                },
                { height: 8 }
            ]
        },
        on: { onHide() { this.close() } }
    }).show();
}

// 选择菜单
function onMenuSelect(item) {
    if (!$$(item.id)) {
        var module = _.has(PHOENIX_MENUS_DATA, item["menu_"], "builder") ?
            PHOENIX_MENUS_DATA[item["menu_"]] :
            PHOENIX_FRAMEWORK_DATA[item["menu_"]];

        if (!module) {
            $$(VIEWS_ID).addView({
                id: item.id,
                view: "template",
                template: "Menu:" + item["menu_"] + "<br>Value: " + item.value
            });
        } else {
            $$(VIEWS_ID).addView(_.extend(
                module.builder(),
                {
                    id: item.id,
                    css: { "border-left": "none", "border-top": "none" }
                }
            ));
        }

        $$(VIEWS_TABBAR_ID).addOption({
            id: item.id,
            close: true,
            value: "<span style='font-size:12px'>" + item.value.trim() + "</span>"
        }, true);
    } else {
        $$(VIEWS_TABBAR_ID).setValue(item.id);
    }
}

// Tab页切换
function onTabChange(newid, oldid) {

    // 关闭全局滑动菜单
    _.forEach(PHOENIX_SIDE_MENUS, (s) => $$(s) && $$(s).hide());

    // 取消选中原菜单
    if (!newid || newid === HOME_PAGE_ID || newid == EXECUTING_PAGE_ID) {
        return $$(MENU_TREE_ID).unselect(oldid);
    }

    // 寻找当前菜单的路径
    var path = utils.tree.path($$(MENU_TREE_ID), newid);
    _.forEach(path, (id) => $$(MENU_TREE_ID).open(id, true));

    // 设置选中菜单
    $$(MENU_TREE_ID).select(newid);
    webix.storage.cookie.put("PHOENIX_USING_MENU", newid);
}
