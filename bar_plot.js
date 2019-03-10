function myBar(ghanaCount) {    
    
    console.log(ghanaCount);

    // var perf_dict = d3.nest()
    //     .key(function(d) { return d.six_overall_rating; })
    //     .rollup(function(v) { return v.length; })
    //     .object(ghanaWB);

    //console.log(perf_dict);

   
    //ghanaPriority.forEach(d => goal_dict[d.goal] = d.six_overall_rating)
    
    var svg2 = d3.select('#proj_highlight')
    .append('svg')
    .attr('width', plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)
    .attr('height', plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top)
    .attr('y', 370 + "px");

    var g2= svg2.append("g")
    .attr("transform", `translate(20, ${plot_dims.scatter.margin.top})`);

    const yDomain = ghanaCount.reduce((acc, row) => {
        return {
          min: Math.min(row.count, acc.min),
          max: Math.max(row.count, acc.max)
        };
      }, {min: Infinity, max: -Infinity});

    console.log(yDomain.max)

    const x = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6])
        .range([0, plot_dims.scatter.width - plot_dims.scatter.margin.left - 15])
        .padding(0.1);

    const y =  d3.scaleLinear()
        .domain([0, yDomain.max])
        .range([plot_dims.scatter.height, plot_dims.scatter.margin.top]);

    // add axes
    // g1.append('g')
    // .call(d3.axisBottom(x))
    // .attr('transform', `translate((${plot_dims.scatter.height} - ${plot_dims.scatter.margin.bottom}), ${plot_dims.scatter.margin.left})`)
    // .selectAll(".tick > text")
    // .style("font-family",'"Lucida Console", monospace');

    g2.append("g")
        .call(d3.axisBottom(x).tickValues([1, 2, 3, 4, 5, 6]))
        .attr("transform", `translate(${plot_dims.scatter.margin.left}, ${plot_dims.scatter.height})`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');
        

    g2.append('g')
        .call(d3.axisLeft(y))
        .attr('transform', `translate(${plot_dims.scatter.margin.left}, 0)`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');

    const chart = g2.append('g')
    .attr('transform', `translate(30,0)`)
    .attr('height', plot_dims.scatter.height)
    .attr('width', plot_dims.scatter.width)

     var barWidth = plot_dims.scatter.width / ghanaCount.length;

    var bar = chart.selectAll("g")
        .data(ghanaCount)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

    bar.append("rect")
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return plot_dims.scatter.height - y(d.count); })
        .attr("width", barWidth - 1)
        .style("fill",  d => color(d.six_overall_rating))
        .style("stroke", d => color(d.six_overall_rating))
        .style("stroke-width", 10)
        .style("opacity", .7)
        .attr("id", d => "cat_" + d.six_overall_rating);

    // bar.append("text")
    //     .attr("x", barWidth / 2)
    //     .attr("y", function(d) { return y(d.value) + 3; })
    //     .attr("dy", ".75em")
    //     .text(function(d) { return d.value; });
}