function importExcel(options) {
    options = _.extend({
        id: utils.UUID(),
        docId: "*******",
        mapping: { "字段名": ["备选列名1", "备选列名2"] || "列名" },
        onData(data) { }
    }, options);

    return {
        id: options["id"],
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
                    var findKey = _.findKey(options["mapping"], (s, k) => {
                        if (_.isString(s)) {
                            return s == name;
                        }


                        return _.findIndex(s, (v0) => v0 == name) >= 0;
                    });

                    if (findKey) {
                        aliasName[alias] = findKey;
                    }
                })

                var newData = [];
                // console.log("aliasName  data[1:] => ", aliasName, data.slice(1));

                newData = _.map(data.slice(1), (row, index) => {
                    var newRow = {};
                    _.mapObject(row, (val, col) => {
                        if (_.has(aliasName, col)) {
                            newRow[_.get(aliasName, col)] = val.toString();
                        }
                    })

                    return newRow;
                })

                setTimeout(function () {
                    options["onData"](newData);
                }, 500)
            }
        }
    };
};

export { importExcel };