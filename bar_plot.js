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
    .attr('y', 355 + "px");

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
        .padding([0.2]);

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
        .attr('transform', `translate(${plot_dims.scatter.margin.left},0)`)
        .attr('height', plot_dims.scatter.height)
        .attr('width', plot_dims.scatter.width)

     var barWidth = ((plot_dims.scatter.width - plot_dims.scatter.margin.left - 15) / ghanaCount.length) - 5;

    var rects = chart.selectAll("rect")
        .data(ghanaCount);

    rects.enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('width', x.bandwidth())
        .attr('x', d => x(d.six_overall_rating))
        .attr('y', plot_dims.scatter.height)
        .attr('height', 0)
        .style("fill",  d => color(d.six_overall_rating))
        .style("stroke", d => color(d.six_overall_rating))
        .style("stroke-width", 10)
        .style("opacity", .7)
        .attr("id", d => "cat_" + d.six_overall_rating)
        .transition()
        .duration(3000)
        .attr('y', d => y(d.count))
        .attr('height', d => plot_dims.scatter.height - y(d.count));

    svg2.append('text')
        .attr('x', -(plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top)/2)
        .attr('y', plot_dims.scatter.margin.left -10)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Count Projects')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");
    
    svg2.append('text')
        .attr('x', (plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)/2)
        .attr('y', plot_dims.scatter.margin.top + plot_dims.scatter.height + plot_dims.scatter.margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Performance Rating')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");
}