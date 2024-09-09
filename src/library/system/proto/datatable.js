function builder() {
    var pager = utils.protos.pager();
    var datatable = utils.protos.datatable({
        save: {
            url: "/api/sys/data_service?service=tests.save",
            updateFromResponse: true,
            trackMove: true,
            operationName: "operation",
        }, pager: pager.id
    });

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