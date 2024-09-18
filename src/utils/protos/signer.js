
function signer(user) {
    if (_.size(user) < 1) {
        return {
            view: "template",
            template: "<div class='webix_light'> - - - </div>",
            width: 80
        };
    }

    return {
        view: "template",
        borderless: true,
        template: "<img src='/api/sys/docs?method=Signer&user=" + user + "' style='width:100%; height:100%; object-position:left; object-fit:cover'>",
        width: 80,
    };
};

export { signer };