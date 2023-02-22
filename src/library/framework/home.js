function builder() {
    return {
        id: HOME_PAGE_ID,
        view: "scrollview",
        scroll: "y",
        body: {
            rows: [
                {
                    height: 320,
                    cols: [
                        {
                            rows: [
                                { template: "各部门在职员工统计", type: "header" },
                                {
                                    view: "chart",
                                    type: "bar",
                                    value: "#num#",
                                    label: "#num#",
                                    radius: 0,
                                    barWidth: 40,
                                    tooltip: {
                                        template: "#num#"
                                    },
                                    yAxis: {
                                        template: "",
                                        start: 0, end: 100, step: 10
                                    },
                                    // xAxis: {
                                    //     title: "各部门在职员工数",
                                    //     template: "#name#",
                                    //     lines: false
                                    // },
                                    padding: {
                                        left: 10,
                                        right: 10,
                                        top: 50
                                    },
                                    data: [
                                        { id: 1, name: "物资部", num: 31 },
                                        { id: 2, name: "生产制造部", num: 324 },
                                        { id: 3, name: "人力资源部", num: 23 },
                                        { id: 4, name: "财务部", num: 16 },
                                        { id: 5, name: "研究部", num: 157 },
                                        { id: 6, name: "网络信息部", num: 39 },
                                        { id: 7, name: "后勤保障部", num: 18 },
                                        { id: 8, name: "保卫办", num: 29 },
                                    ]
                                }
                            ]
                        },
                        { view: "resizer" },
                        {
                            rows: [
                                { template: "员工男女比例", type: "header" },
                                {
                                    view: "chart",
                                    donutInnerText: "<span style='font-size: 20px'>男职工比例</span></br>70%",
                                    type: "donut",
                                    innerRadius: 70,
                                    value: "#val#",
                                    color: "#color#",
                                    width: 360,
                                    data: [
                                        { val: "70", type: "男", color: "#4C3CE7" },
                                        { val: "30", type: "女", color: "#AAB7B8" },
                                    ]
                                }
                            ]
                        },
                    ]
                },
                { view: "resizer" },
                {
                    height: 480,
                    rows: [
                        { template: "库存金额变化趋势", type: "header" },
                        {
                            view: "highchart",
                            modules: ["series-label", "exporting", "export-data"],
                            settings: {
                                title: {
                                    text: '各仓库库存金额变化趋势'
                                },
                                subtitle: {
                                    text: '单位：万元'
                                },
                                yAxis: {
                                    title: {
                                        text: '库存金额'
                                    }
                                },
                                legend: {
                                    layout: 'vertical',
                                    align: 'right',
                                    verticalAlign: 'middle'
                                },
                                plotOptions: {
                                    series: {
                                        label: {
                                            connectorAllowed: false
                                        },
                                        pointStart: 2016
                                    }
                                },
                                series: [{
                                    name: '电子元件',
                                    data: [439.34, 525.03, 671.77, 696.58, 970.31, 1199.31, 1371.33, 1541.75]
                                }, {
                                    name: '电子器件',
                                    data: [249.16, 240.64, 897.42, 298.51, 324.90, 302.82, 381.21, 404.34]
                                }, {
                                    name: '机电产品',
                                    data: [117.44, 177.22, 460.05, 197.71, 201.85, 243.77, 321.47, 393.87]
                                }, {
                                    name: '办公用品',
                                    data: [null, null, 249.88, 91.69, 151.12, 224.52, 344.00, 342.27]
                                }, {
                                    name: '原材料',
                                    data: [129.08, 59.48, 81.05, 112.48, 89.89, 118.16, 182.74, 981.11]
                                }]
                            }
                        }
                    ]
                },
            ]
        }
    }
}

export { builder }