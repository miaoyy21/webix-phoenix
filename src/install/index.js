
/** WebIX CSS **/
import "webix/skins/mini.css";

import "@mdi/font/css/materialdesignicons.min.css";
import "../assets/phoenix.css";

import "../assets/goJs";
import _ from "underscore";
import * as webix from "webix";


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

// 全局可以使用工具库和组件库 webix md5
_.extend(global, { _, webix });

// 组件库的相关配置
webix.env.cdn = "./";
webix.i18n.setLocale("zh-CN");

// 全局AJAX请求报错提示
webix.attachEvent("onAjaxError", function (xhr) {
    try {
        var obj = JSON.parse(xhr.response);
        if (obj["error"] === "[PHOENIX_TOKEN_EXPIRE]") {
            webix.message({ type: "error", text: "Token已失效，需要重新登录" });

            // 显示登录界面
            $$(LOGIN_PAGE_ID) && $$(LOGIN_PAGE_ID).show();
            $$(LOGIN_PAGE_FORM_ID) && $$(LOGIN_PAGE_FORM_ID).elements["depart_id"].hide();

            // 隐藏主界面
            $$(MAIN_PAGE_ID) && $$(MAIN_PAGE_ID).hide();
        } else {
            webix.message({ type: "error", text: obj["error"] });
        }
    } catch (e) {
        webix.message({ type: "error", text: xhr.responseText });
    }
});

// 引入 ProtoUI 组件
require("./view/ace");
require("./view/tree");
require("./view/list");
require("./view/winmenu");
require("./diagram");

// 初始化全局存储
require("./store");

require("../assets/hcharts");

console.log(window);