
function myScatter(ghanaPriority) {    
    
    console.log(ghanaPriority)
        
    // create SVG and G for scatterplot
    var svg1 = d3.select('#proj_highlight')
    .append('svg')
    .attr('width', plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)
    .attr('height', plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top);

    var g1= svg1.append("g")
    .attr("transform", `translate(20, ${plot_dims.scatter.margin.top})`);

    const x = d3.scaleLinear()
    .domain([18, 1])
    .range([0, plot_dims.scatter.width - plot_dims.scatter.margin.left - 15]);

    const y =  d3.scaleLinear()
    .domain([18, 1])
    .range([plot_dims.scatter.height, 0]);

    g1.append("g")
        .call(d3.axisBottom(x).tickValues([1,3,5,7,9,11,13,15,17]))
        .attr("transform", `translate(${plot_dims.scatter.margin.left}, ${plot_dims.scatter.height})`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');
        

    g1.append('g')
        .call(d3.axisLeft(y).tickValues([1,3,5,7,9,11,13,15,17]))
        .attr('transform', `translate(${plot_dims.scatter.margin.left}, 0)`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');

    const chart = g1.append('g')
        .attr('transform', `translate(${plot_dims.scatter.margin.left},0)`)
        .attr('height', plot_dims.scatter.height)
        .attr('width', plot_dims.scatter.width)

    // add circles, transition, mouseover
    const circles = chart.selectAll(".circle")
                 .data(ghanaPriority)     
                 .enter() 
                 .append("circle")	
                 .attr("id", d => d.goal)
                 .attr("cx", d => x(d.donor_priority))
                 .attr("cy", d => y(d.leader_priority))
                 .style("fill", d => color(d.six_overall_rating))
            
            circles.transition()
                    .duration(3000)
                    .attr("r", 8);

    svg1.append('text')
        .attr('x', -(plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top)/2)
        .attr('y', plot_dims.scatter.margin.left -10)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Leader Priority Ranking (1 = highest)')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");
    
    svg1.append('text')
        .attr('x', (plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)/2)
        .attr('y', plot_dims.scatter.margin.top + plot_dims.scatter.height + plot_dims.scatter.margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Donor Priority Ranking')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");
            
        

    }