var system = {};

system.system_organization_departs = require("./organization/departs");
system.system_organization_users = require("./organization/users");
system.system_admin_setting = require("./admin/setting");
system.system_admin_roles = require("./admin/roles");
system.system_admin_menus = require("./admin/menus");
system.system_admin_operate_logs = require("./admin/operate_logs");
system.system_service_tables = require("./service/tables");
system.system_service_dicts = require("./service/dicts");
system.system_service_auto_no = require("./service/auto_no");
system.system_service_data = require("./service/data");
system.system_permission_organization = require("./permission/organization");
system.system_permission_roles = require("./permission/roles");
system.system_permission_by_organization = require("./permission/by_organization");

system.system_proto_datatable = require("./proto/datatable");
system.system_proto_tree = require("./proto/tree");
system.system_proto_list = require("./proto/list");
system.system_proto_form = require("./proto/form");

export { system }