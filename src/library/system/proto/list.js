function builder() {
    var pager = utils.protos.pager();
    var list = utils.protos.list({ pager: pager.id });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    list.actions.add(),
                    list.actions.remove(),
                    list.actions.refresh(),
                ]
            },
            { view: "toolbar", cols: [list.actions.filter({ placeholder: "请输入..." })] },
            list,
            pager
        ],
    };
}

export { builder };