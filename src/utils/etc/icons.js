var icons = {}

// 部门图标
icons.departs = {
    tree: (tree, obj) => {
        if (tree.isSelected(obj.id)) {
            return "<span class='webix_icon phoenix_primary_icon mdi mdi-arrow-right-bold'></span>";
        }

        // 部门
        if (obj.$count > 0) {
            return "<span class='webix_icon mdi mdi-dark mdi-newspaper-variant-multiple-outline'></span>";
        }

        return "<span class='webix_icon mdi mdi-dark mdi-checkbox-blank-circle-outline'></span>";
    }
}

// 用户图标
icons.users = {
    // 性别
    sex(user) {
        if (user["sex_"] === "Male") {
            return "<span class='webix_icon phoenix_primary_icon mdi mdi-human-male'></span>";
        } else if (user["sex_"] === "Female") {
            return "<span class='webix_icon phoenix_danger_icon mdi mdi-human-female'></span>";
        }

        return "<span class='webix_icon mdi mdi-dark mdi-inactive mdi-head-question'></span>";
    },

    // 用户状态
    valid(user) {
        if (user["valid_"] === "Effective") {
            return "<span class='webix_icon phoenix_primary_icon mdi mdi-shield-check'></span>";
        } else if (user["valid_"] === "Locked") {
            return "<span class='webix_icon phoenix_danger_icon mdi mdi-shield-lock'></span>";
        }

        return "<span class='webix_icon mdi mdi-dark mdi-inactive mdi-shield-alert-outline'></span>";
    },

    // 部门领导
    is_depart_leader(user) {
        if (user["is_depart_leader_"] === "Yes") {
            return "<span class='webix_icon phoenix_primary_icon mdi mdi-account-multiple-check'></span>";
        }

        return "<span/>"
    }
}

// 数据库表状态
icons.tables = {
    sync_status(table) {
        if (table["sync_status_"] === "Creating") {
            return "<span class='webix_icon phoenix_warning_icon mdi mdi-cloud-alert'></span>";
        } else if (table["sync_status_"] === "Changed") {
            return "<span class='webix_icon phoenix_danger_icon mdi mdi-cloud-braces'></span>";
        } else if (table["sync_status_"] === "Done") {
            return "<span class='webix_icon phoenix_primary_icon mdi mdi-cloud-check'></span>";
        }

        return "<span class='webix_icon mdi mdi-dark mdi-inactive mdi-checkbox-blank-circle-outline'></span>";
    }
}

export { icons }