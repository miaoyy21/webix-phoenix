function builder(options) {
    console.log("A01 UI options is ", options)

    // 请假单
    return {
        show(values) {
            console.log("A01 UI values is ", values)
            return {
                view: "template",
                template: JSON.stringify(values)
            }
        },
        default() {
            return { "aaa": 123, "id": options["diagram_id_"] };
        },
        values() {
            return { "bbb": "aaaaaa", "days_": Math.ceil(Math.random() * 4) };
        },
    }
};

export { builder };