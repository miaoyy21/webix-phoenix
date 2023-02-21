function builder() {
    return {
        id: HOME_PAGE_ID,
        rows: [
            { view: "template", template: "xxxxxx111111" },
            { view: "resizer" },
            {
                cols: [
                    { view: "template", template: "2222" },
                    { view: "resizer" },
                    { view: "template", template: "333" },
                ]
            }
        ]
    }
}

export { builder }