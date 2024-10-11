var grid = {};

grid.add = function (table, row, edit) {
    add(table, row, 0, edit);
}

grid.addLast = function (table, row, edit) {
    add(table, row, table.count(), edit);
}

function add(table, row, index, edit) {
    var count = table.count();
    if (count < 1) {
        table.hideOverlay();
    }

    var id = table.add(row, index);
    table.select && table.select(id, false);

    if (edit) {
        table.edit({ row: id, column: edit });
    }
}

// 不指定移除行时，默认当前行
grid.remove = function (table, row, module, name) {
    if (!row) {
        row = table.getSelectedItem();
    }

    if (!row) return;

    webix.confirm({
        title: "系统提示",
        text: "确认删除" + module + " 【" + row[name] + "】 ?",
        type: "confirm-error"
    }).then((result) => {
        var url = table.config.save.url;
        if (url) {
            webix.ajax()
                .post(url, { "id": row.id, "operation": "delete" })
                .then(
                    (res) => {
                        webix.dp(table).ignore(() => table.remove(row.id));


                        // 自动选择删除节点的附近记录
                        if (table.count()) {
                            var id = table.getIdByIndex(table.count() > row.index ? row.index - 1 : table.count() - 1);
                            if (id) {
                                table.select && table.select(id, false);
                            }
                        } else {
                            table.showOverlay("无检索数据");
                        }
                    }
                );
        } else {
            table.remove(row.id);
        }
    });
}

export { grid };