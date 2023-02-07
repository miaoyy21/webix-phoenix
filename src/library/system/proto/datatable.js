function builder() {
    var pager = utils.protos.pager();
    var datatable = utils.protos.datatable({ pager: pager.id });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    datatable.actions.add(),
                    datatable.actions.remove(),
                    datatable.actions.refresh(),
                ]
            },
            datatable,
            pager
        ],
    };
}

export { builder };