var flow = {};

flow.A01 = require("./demo/A01");

flow.W01 = require("./jzwz/W01"); // 零星入库申请
flow.W02 = require("./jzwz/W02"); // 领料申请单
flow.W03 = require("./jzwz/W03"); // 红冲申请单
flow.W04 = require("./jzwz/W04"); // 转库申请单

export { flow };