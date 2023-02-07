import { windows } from "./windows";
import { protos } from "./protos";

import { formats } from "./etc/formats"
import { UUID } from "./etc/uuid"
import { icons } from "./etc/icons";
import { dicts } from "./etc/dicts";
import { grid } from "./etc/grid";
import { tree } from "./etc/tree";

var utils = {};

utils.windows = windows;
utils.protos = protos;

// 设定导出
utils.formats = formats;
utils.UUID = UUID;
utils.icons = icons;
utils.dicts = dicts;

utils.grid = grid;
utils.tree = tree;


export { utils };