import { system } from "../../library/system";
import { diagram } from "../../library/diagram";
import { flow } from "../../library/flow";

// 系统设置
var PHOENIX_SETTING = JSON.parse(
    webix.ajax().sync()
        .get("/api/sys/setting?PHOENIX_USING_MENU=0&scope=LOGIN")
        .responseText
);
_.extend(global, { PHOENIX_SETTING });

// 使用Cookie记录当前打开菜单
webix.storage.cookie.put("PHOENIX_USING_MENU", null);

// 所有UI菜单
var PHOENIX_MENUS = _.extend({}, system, diagram);
_.extend(global, { PHOENIX_MENUS });

// 所有的流程实例
var PHOENIX_FLOWS = _.extend({}, flow);
_.extend(global, { PHOENIX_FLOWS });

// 全局的侧边栏菜单
_.extend(global, { PHOENIX_SIDE_MENUS: [] });