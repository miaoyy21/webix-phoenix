
/** WebIX CSS **/
import "webix/skins/mini.css";

import "@mdi/font/css/materialdesignicons.min.css";
import "../assets/phoenix.css";

import "../assets/goJs";
import _ from "underscore";

console.log("gojs", go);

/** WebIX **/
import * as webix from "webix";

// 全局可以使用工具库和组件库
_.extend(global, { _, webix });

// 组件库的相关配置
webix.env.cdn = "./";
webix.i18n.setLocale("zh-CN");

// 全局AJAX请求报错提示
webix.attachEvent("onAjaxError", function (xhr) {
    var obj = JSON.parse(xhr.response);
    if (obj["error"] === "[PHOENIX_TOKEN_EXPIRE]") {
        webix.message({ type: "error", text: "Token已失效，需要重新登录" });

        // 显示登录界面
        $$("PHOENIX_LOGIN").show();
        $$("PHOENIX_LOGIN_FORM").elements["depart_id"].hide();

        // 隐藏主界面
        $$("PHOENIX_MAIN").hide();
    } else {
        webix.message({ type: "error", text: obj["error"] });
    }
});

// 引入 ProtoUI 组件
require("./view/ace");
require("./view/tree");
require("./view/list");
require("./diagram");

// 初始化全局存储
require("./store");

console.log(window);