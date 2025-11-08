import "./install";
import { utils } from "./utils";

webix.debug = false;

// 自定义的工具库
_.extend(global, { utils });

// 界面初始化
webix.ready(function () {
    // 登录背景
    webix.ui({
        id: LOGIN_PAGE_BACKGROUND,
        css: {
            "background": "url('./assets/background.png?001') no-repeat center center",
            "background-size": "100% 100%",
            // "-webkit-filter": "blur(2px)",
            // "-moz-filter": "blur(2px)",
            // "-o-filter": "blur(2px)",
            // "-ms-filter": "blur(2px)",
            // "filter": "blur(2px)",
        },
    }).hide();

    function onLogin() {
        if (!$$(LOGIN_PAGE_FORM_ID).validate()) return;

        var user = $$(LOGIN_PAGE_FORM_ID).getValues();
        var departs = JSON.parse(webix.ajax().sync().get("/api/sys", { "method": "Depart", "PHOENIX_USING_MENU": "[所属部门]", scope: "LOGIN", "account_id": user["account_id"] }).responseText);

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
            .post("/api/sys?method=LoginByPassword&PHOENIX_USING_MENU=[密码登录]", user)
            .then((data) => {
                // 自动登录
                if (user["auto_login"]) {
                    webix.storage.local.put("PHOENIX_AUTO_LOGIN", 1);
                } else {
                    webix.storage.local.remove("PHOENIX_AUTO_LOGIN");
                }

                $$(LOGIN_PAGE_FORM_ID).clear();
                departView.hide();

                webix.ui(buildMainPage()).show();
                $$(LOGIN_PAGE_BACKGROUND).hide();
                $$(LOGIN_PAGE_ID).hide();

                // 设置该参数的意义：避免密码登录时，多显示1条Token登录
                reloadMenus();
            })
    }

    var login = {
        id: LOGIN_PAGE_FORM_ID,
        view: "form",
        width: 300,
        borderless: true,
        rows: [
            { view: "text", name: "account_id", /*value: "admin",*/ label: "账号", clear: true, required: true },
            { view: "text", name: "password", /*value: "12345678",*/ label: "密码", type: "password", clear: true, required: true, on: { onEnter: onLogin }, },
            { view: "switch", name: "auto_login", label: "自动登录", value: 1 },

            { view: "combo", name: "depart_id", label: "登录部门", options: [] },
        ],
        elementsConfig: { labelAlign: "center", labelWidth: 60 },
    };

    // 登录界面
    webix.ui({
        id: LOGIN_PAGE_ID,
        view: "window",
        modal: true,
        head: "用户登录",
        position: "center",
        css: {
            "padding": "0px 12px 0px 12px ",
            "border-radius": "8px",
            "box-shadow": "0px 6px 8px 0px rgba(0,0,0,0.75)",
            "-webkit-box-shadow": "0px 6px 8px 0px rgba(0,0,0,0.75)",
            "-moz-box-shadow": "0px 6px 8px 0px rgba(0,0,0,0.75)",
        },
        body: {
            rows: [
                login,
                { height: 8, borderless: false },
                {
                    view: "toolbar",
                    borderless: true,
                    cols: [
                        {},
                        {
                            view: "button", value: "登录", css: "webix_primary",
                            click: onLogin,
                        },
                        {}
                    ]
                },
                { height: 8, css: { "border-top": "none" } },
            ]
        },
    }).hide();

    // 自动加载用户菜单
    function reloadMenus() {
        webix.extend($$(MENU_TREE_ID), webix.ProgressBar).showProgress();
        webix.ajax().get("/api/sys/users?method=LoginByToken&PHOENIX_USING_MENU=[Token登录]")
            .then((res) => {
                var data = res.json();

                // var start = new Date(data["user"]["password_at"] || "1900-01-01");
                // var end = new Date(utils.users.getDateTime())
                // var days = (end - start) / (1000 * 60 * 60 * 24);

                // // 如果是默认密码或者密码期限超过90天，需要修改密码
                // console.log(days)
                // if (days >= 90) {
                //     $$(MAIN_PAGE_BODY_ID).hide();
                //     change_password(true);
                // }

                var PHOENIX_USER_MENUS_DATA = data["menus"];
                var menus = _.map(
                    _.sortBy(PHOENIX_USER_MENUS_DATA, (o) => Number(o["seq"])), (d) => ({
                        "id": d["id"],
                        "menu_": d["menu_"],
                        "value": d["name_"],
                        "parent_id_": d["parent_id_"],
                        "icon": d["icon_"]
                    }));

                $$(MENU_TREE_ID).clearAll();
                $$(MENU_TREE_ID).define("data", utils.tree.buildTree(menus));

                _.extend(global, { PHOENIX_USER_MENUS_DATA }); // 记录用户菜单数据，这边为平面的数据

                var tasksCount = data["tasks_count"];
                var tasksMaxActivated = data["tasks_max_activated"];

                $$(MAIN_PAGE_TASKS_ID).data.badge = tasksCount > 0 ? tasksCount : null;
                $$(MAIN_PAGE_TASKS_ID).refresh();

                global.TASKS_MAX_ACTIVATED = tasksMaxActivated;
                global.TASKS_COUNT = tasksCount;

                webix.extend(view, webix.ProgressBar).hideProgress();
            })
    }

    // 如果是自动登录，那么直接请求加载菜单，如果因为Token无效加载失败，那么自动跳转到登录界面
    if (webix.storage.local.get("PHOENIX_AUTO_LOGIN")) {
        $$(LOGIN_PAGE_BACKGROUND).hide();
        $$(LOGIN_PAGE_ID).hide();
        $$(LOGIN_PAGE_FORM_ID).elements["depart_id"].hide();

        // 主界面
        webix.ui(buildMainPage()).show();
        reloadMenus();
    } else {
        $$(LOGIN_PAGE_BACKGROUND).show();
        $$(LOGIN_PAGE_ID).show();
        $$(LOGIN_PAGE_FORM_ID).elements["depart_id"].hide();

        $$(MAIN_PAGE_ID) && $$(MAIN_PAGE_ID).hide();
    }
});

function onLogout() {
    // 移除自动登录
    webix.storage.local.remove("PHOENIX_AUTO_LOGIN");

    // 显示登录界面
    $$(LOGIN_PAGE_BACKGROUND).show();
    $$(LOGIN_PAGE_ID).show();

    $$(LOGIN_PAGE_FORM_ID).clear();
    $$(LOGIN_PAGE_FORM_ID).setValues({ "auto_login": 1 });

    // 关闭所有的页面，并隐藏主界面
    var menus = _.pluck($$(VIEWS_TABBAR_ID).data.options, "id")
    _.each(menus, (id) => { id != HOME_PAGE_ID && $$(VIEWS_TABBAR_ID).removeOption(id) });
    $$(MAIN_PAGE_ID).hide();

    webix.storage.cookie.put("PHOENIX_USING_MENU", null);

    $$(MAIN_PAGE_ID).destructor();
}

// 应用主页面构建
function buildMainPage() {
    return {
        id: MAIN_PAGE_ID,
        rows: [
            {
                view: "toolbar",
                css: { "background": "#1D2A3D" },
                elements: [
                    { view: "icon", icon: "mdi mdi-menu", click: () => { $$(MENU_TREE_ID).toggle() } },
                    { view: "label", label: "<span style='color:#eee'>" + PHOENIX_SETTING["name"] + "</span>" },
                    {},
                    {
                        id: MAIN_PAGE_TASKS_ID,
                        view: "icon", icon: "mdi mdi-chat", tooltip: "任务中心",
                        click() {
                            onMenuSelect({
                                "id": EXECUTING_PAGE_ID,
                                "menu_": "framework_tasks",
                                "value": "任务中心"
                            });
                        }
                    },
                    {
                        view: "icon", icon: "mdi mdi-account-settings", tooltip: "个人设置",
                        popup: {
                            view: 'contextmenu',
                            data: [
                                { id: "change_password", value: '修改密码', icon: "mdi mdi-shield-key" },
                                { id: 'logout', value: '退出系统', icon: "mdi mdi-exit-to-app" },
                            ],
                            on: {
                                onMenuItemClick(id) {
                                    if (id === "change_password") {
                                        change_password(false);
                                    } else if (id === 'logout') {
                                        onLogout();
                                    }
                                }
                            }
                        }
                    },
                    { width: 4 }
                ]
            },
            {
                id: MAIN_PAGE_BODY_ID,
                cols: [
                    {
                        id: MENU_TREE_ID,
                        view: "sidebar",
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
                                optionWidth: 140,
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
                                    PHOENIX_FRAMEWORK_DATA["framework_home"].builder(),
                                ]
                            },
                            {
                                height: 24,
                                cols: [
                                    { borderless: true, css: { "background": "#F8F9F9" } },
                                    {
                                        view: "template",
                                        borderless: true,
                                        gravity: 2,
                                        css: { "text-align": "center", "background": "#F8F9F9" },
                                        template: PHOENIX_SETTING["copyright"] + "<span style='padding-left:24px'>版本号: " + PHOENIX_SETTING["version"] + "</span>"
                                    },
                                    { view: "template", borderless: true, css: { "text-align": "center", "background": "#F8F9F9" }, template: "【登录】" + utils.users.getUserName() },
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
    };
}

// 每隔8秒执行1次定时任务
setInterval(() => {
    try {
        // 在登录界面，则不进行消息同步
        if (!$$(LOGIN_PAGE_ID) || !$$(LOGIN_PAGE_ID).config.hidden) return;

        // 查询用户的待办事项
        webix.ajax().get("api/sys?method=Sync&PHOENIX_IGNORE_LOG=true")
            .then((res) => {
                var data = res.json();

                // 待办数量
                var oldTasksCount = global.TASKS_COUNT || 0;
                var oldTasksMaxActivated = global.TASKS_MAX_ACTIVATED || "191900-01-01 01:01:01";

                var newTasksCount = data["tasks_count"];
                var newTasksMaxActivated = data["tasks_max_activated"];
                if (newTasksMaxActivated > oldTasksMaxActivated) {
                    webix.message({ type: "info", text: "你收到新的待办事项！" });
                    global.TASKS_MAX_ACTIVATED = newTasksMaxActivated;
                }

                if (!_.isEqual(newTasksCount, oldTasksCount)) {
                    $$(MAIN_PAGE_TASKS_ID).data.badge = newTasksCount > 0 ? newTasksCount : null;
                    $$(MAIN_PAGE_TASKS_ID).refresh();

                    $$(HOME_PAGE_ID + "_unitlist").clearAll();
                    $$(HOME_PAGE_ID + "_unitlist").load($$(HOME_PAGE_ID + "_unitlist").config.url);

                    global.TASKS_COUNT = newTasksCount;
                }
            });
    } catch (e) {
        console.log(e);
    }
}, 8000);

/*****************************************************************************************************************/

// 修改密码
function change_password(force) {
    webix.ui({
        id: CHANGE_PASSWORD_PAGE_ID,
        view: "window",
        modal: true,
        close: false,
        move: true,
        height: 420,
        width: 360,
        headHeight: 40,
        position: "center",
        head: "修改密码",
        body: {
            rows: [
                {
                    id: PHOENIX_CHANGE_PASSWORD_FORM,
                    view: "form",
                    borderless: true,
                    gravity: 2,
                    data: {},
                    rows: [
                        {
                            view: "text", name: "old_password", label: "原密码", labelPosition: "top", type: "password", placeholder: "请输入原密码...",
                            invalidMessage: "请输入原密码",
                            validate(value) {
                                return webix.rules.isNotEmpty(value);
                            },
                            clear: true, required: true
                        },
                        {
                            view: "text", name: "new_password1", label: "新密码", labelPosition: "top", type: "password",
                            // placeholder: "数字、字母及特殊字符的组合，且至少为8位。",
                            // invalidMessage: "必须为数字、字母及特殊字符的组合，且长度至少为8位",
                            // validate(value) {
                            //     const regexp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
                            //     return regexp.test(value);
                            // },
                            placeholder: "请再次输入新密码...",
                            invalidMessage: "请输入新的密码",
                            validate(value) {
                                return webix.rules.isNotEmpty(value);
                            },
                            clear: true, required: true
                        },
                        {
                            view: "text", name: "new_password2", label: "确认密码", labelPosition: "top", type: "password", placeholder: "请再次输入新密码...",
                            invalidMessage: "必须与新密码相同",
                            validate(value) {
                                var values = $$(PHOENIX_CHANGE_PASSWORD_FORM).getValues();

                                return values["new_password1"] == value;
                            },
                            clear: true, required: true
                        },
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
                                if (!$$(PHOENIX_CHANGE_PASSWORD_FORM).validate()) return;

                                var values = $$(PHOENIX_CHANGE_PASSWORD_FORM).getValues();

                                // 新密码与旧密码
                                if (values["new_password1"] == values["old_password"]) {
                                    webix.message({ type: "error", text: "新密码不能与旧密码相同" });
                                    return
                                }

                                // 修改密码
                                webix.ajax().post("/api/sys/users?method=ChangedPassword&PHOENIX_USING_MENU=[修改密码]",
                                    {
                                        "old_password": values["old_password"],
                                        "new_password": values["new_password1"]
                                    }
                                ).then((data) => {
                                    webix.message({ type: "success", text: "修改密码成功" });
                                    $$(CHANGE_PASSWORD_PAGE_ID).hide();
                                    $$(MAIN_PAGE_BODY_ID).show();
                                })
                            }
                        },
                        { width: 8 },
                        {
                            view: "button", width: 80, value: "取消", css: "webix_transparent ",
                            click() {
                                $$(CHANGE_PASSWORD_PAGE_ID).hide();

                                if (force) { onLogout(); }
                            }
                        },
                        { width: 8 },
                    ]
                },
                { height: 8 }
            ]
        },
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
                padding: { right: 4 },
                template: "Menu:" + item["menu_"] + "<br>Value: " + item.value
            });
        } else {
            $$(VIEWS_ID).addView(_.extend(
                module.builder(),
                {
                    id: item.id,
                    padding: { right: 4 },
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
        webix.storage.cookie.put("PHOENIX_USING_MENU", newid);
        return $$(MENU_TREE_ID).unselect(oldid);
    }

    // 寻找当前菜单的路径
    var path = utils.tree.path($$(MENU_TREE_ID), newid);
    _.forEach(path, (id) => $$(MENU_TREE_ID).open(id, true));

    // 设置选中菜单
    $$(MENU_TREE_ID).select(newid);
    webix.storage.cookie.put("PHOENIX_USING_MENU", newid);
}
