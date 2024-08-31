function builder() {
    var pager = utils.protos.pager();
    var datatable = utils.protos.datatable({ pager: pager.id });

    return {
        rows: [
            {
                view: "toolbar",
                cols: [
                    datatable.actions.add({ callback: () => ({ "varchar_32_": _.uniqueId() }) }),
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