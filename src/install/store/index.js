import { system } from "../../library/system";
import { diagram } from "../../library/diagram";
import { flow } from "../../dev/flow";
import { framework } from "../../library/framework";
import { dev } from "../../dev";

// 系统设置
var text = webix.ajax().sync().get("/api/sys", { "method": "Setting", "PHOENIX_USING_MENU": "[系统预加载]" }).responseText;
var PHOENIX_SETTING = JSON.parse(text);

_.extend(global, { PHOENIX_SETTING });

// 使用Cookie记录当前打开菜单
webix.storage.cookie.put("PHOENIX_USING_MENU", null);

// 所有UI菜单
var PHOENIX_MENUS_DATA = _.extend({}, system, diagram, dev);
_.extend(global, { PHOENIX_MENUS_DATA });

// 框架所需UI
var PHOENIX_FRAMEWORK_DATA = _.extend({}, framework);
_.extend(global, { PHOENIX_FRAMEWORK_DATA });

// 所有的流程实例
var PHOENIX_FLOWS = _.extend({}, flow);
_.extend(global, { PHOENIX_FLOWS });

// 全局的侧边栏菜单
_.extend(global, { PHOENIX_SIDE_MENUS: [] });