
function myScatter(ghanaPriority) {    
    
    console.log(ghanaPriority)
        
    // create SVG and G for scatterplot
    var svg1 = d3.select('#proj_highlight')
    .append('svg')
    .attr('width', plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)
    .attr('height', plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top);

    var g1= svg1.append("g")
    .attr("transform", `translate(20, ${plot_dims.scatter.margin.top})`);

    // var note  = g1.append("text")             
    //    .attr("transform",
    //    "translate(" + (plot_dims.scatter.margin.left) + " ," + 
    //                    (plot_dims.scatter.height/2 + plot_dims.scatter.margin.top ) + ")")
    //        .style("text-anchor", "left")
    //        .text("A scatter plot will live here")
    //        .style("font-family", '"Lucida Console", monospace')
    //        .style("font-size", "14px");

    const x = d3.scaleLinear()
    .domain([18, 1])
    .range([0, plot_dims.scatter.width - plot_dims.scatter.margin.left - 15]);

    const y =  d3.scaleLinear()
    .domain([18, 1])
    .range([plot_dims.scatter.height, 0]);

    // add axes
    // g1.append('g')
    // .call(d3.axisBottom(x))
    // .attr('transform', `translate((${plot_dims.scatter.height} - ${plot_dims.scatter.margin.bottom}), ${plot_dims.scatter.margin.left})`)
    // .selectAll(".tick > text")
    // .style("font-family",'"Lucida Console", monospace');

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
    .attr('transform', `translate(30,0)`)
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
            //circles.on("mouseover", tipMouseover);
            //circles.on("mouseout", tipMouseout);

    // g.append('g')
    // .call(d3.axisTop(x))
    // .attr('transform', `translate(0, 0)`)
    // .selectAll(".tick > text")
    // .style("font-family",'"Lucida Console", monospace');

    // g.append('g')
    // .attr("transform", "translate( " + width + ", 0 )")
    // .call(d3.axisRight(y))
    // .selectAll(".tick > text")
    // .style("font-family",'"Lucida Console", monospace');

    

}
        
      // var note  = g1.append("text")             
      //       .attr("transform",
      //       "translate(" + (scatterMargin.left) + " ," + 
      //                       (scatterHeight/2 + scatterMargin.top ) + ")")
      //           .style("text-anchor", "left")
      //           .text("A scatter plot will live here")
      //           .style("font-family", '"Lucida Console", monospace')
      //           .style("font-size", "14px");
    
    
    //   // const findDomain = function(data, field){
    //   //     data.reduce((acc, row) => {
    //   //     return {
    //   //       min: Math.min(row.total_spending, row[field]),
    //   //       max: Math.max(row.total_spending, row[field])
    //   //     };
    //   //   }, {min: -Infinity, max: Infinity});
    //   // };
    
    //   //const yDomain = findDomain(data, "")
    //   //console.log(yDomain)
    
    
    
    //   //console.log(xDomain)
    
    // }