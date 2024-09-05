function importExcel(options) {
    options = options || {
        docId: "xxxxxx",
        mapping: { "字段名": ["备选列名1", "备选列名2"] || "列名" },
        onData(data) { }
    };

    return {
        id: utils.UUID(),
        view: "datatable",
        datatype: "excel",
        hidden: true,
        autoConfig: true,
        url: "binary->/api/sys/docs?method=Download&id=" + options["docId"],
        columns: [],
        on: {
            onAfterLoad() {
                var data = this.serialize(true);


                // 获取表头
                var aliasName = {}; // 表格列名 : 数据库列名
                _.map(_.first(data), (name, alias) => {
                    var findKey = _.findKey(options["mapping"], (v, k) => {
                        if (_.isString(v)) {
                            return v == name;
                        }


                        return _.findIndex(v, (v0) => v0 == name) >= 0;
                    });

                    if (findKey) {
                        aliasName[alias] = findKey;
                    }
                })

                var newData = [];
                _.each(data.slice(1), (row, index) => {
                    var newRow = {};
                    _.each(row, (value, column) => {
                        if (_.has(aliasName, column)) {
                            newRow[_.get(aliasName, column)] = value;
                        }
                    })

                    newData.push(newRow);
                })

                options["onData"](newData);
            }
        }
    };
};

export { importExcel };