
function myScatter(ghanaPriority) {    
        
    // create SVG and G for scatterplot
    var svg1 = d3.select('#scatter')
    .append('svg')
    .attr('width', plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)
    .attr('height', plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top);

    var g1= svg1.append("g")
    .attr("transform", `translate(20, ${plot_dims.scatter.margin.top})`);

    // create scales
    const x = d3.scaleLinear()
    .domain([18, 1])
    .range([0, plot_dims.scatter.width - plot_dims.scatter.margin.left - 15]);

    const y =  d3.scaleLinear()
    .domain([18, 1])
    .range([plot_dims.scatter.height, 0]);

    // create axes
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

    // create chart
    const chart = g1.append('g')
        .attr('transform', `translate(${plot_dims.scatter.margin.left},0)`)
        .attr('height', plot_dims.scatter.height)
        .attr('width', plot_dims.scatter.width)

    //create tooltip
    var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")	
        .attr("padding", 10 + "px")			
        .style("opacity", 0);
    
    var tipMouseover = function(d) {

            var diff = d.donor_priority - d.leader_priority

            var html  = "<b>Goal: </b> " + d.goal_name + '</br>' +
                        "<b>Donor-Leader Ranking Difference: </b>" + diff + '</br>' +
                        "<b>Avg. Performance: </b>" + d.performance_cat;
      
            tooltip.html(html)
                .attr("padding", 3 + "px")
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("z-index", "999")
                .transition()
                  .duration(200) 
                  .style("opacity", .9) 
          };
      
          // tooltip mouseout event handler
          var tipMouseout = function(d) {
            tooltip.transition()
                .duration(300) 
                .style("opacity", 0);
          };
    
    // select all project locations corresponding to goal 
    var onGoal = function(d) {
        d3.selectAll("." + d.goal)
        .style("stroke", "#E31480")
        .attr('stroke-width', 3);
        }

    var outGoal = function(d) {
            d3.selectAll("." + d.goal)
            .style("stroke", 'black')
            .attr('stroke-width', 0.25);
          }
    
    // add circles, transition, mouseover
    const circles = chart.selectAll(".circle")
                 .data(ghanaPriority)     
                 .enter() 
                 .append("circle")	
                 .attr("class", d => d.goal)
                 .attr("id", d => d.goal)
                 .attr("cx", d => x(d.donor_priority))
                 .attr("cy", d => y(d.leader_priority))
                 .style("fill", d => color(d.six_overall_rating))
                 .attr('stroke', 'black')
                 .attr('stroke-width', 0.25)
            
            circles.transition()
                    .duration(3000)
                    .attr("r", 8);

            circles.on("mouseover", function(d) {
                tipMouseover(d);
                onGoal.call(this, d);
                });
            circles.on("mouseout", function(d) {
                    tipMouseout(d);
                    outGoal.call(this, d);
                  });

    //referenced: http://bl.ocks.org/jalapic/cf35b0212d18993ca07c
    chart.append("line")
        .attr("x1", x(1))
        .attr("y1", y(1))
        .attr("x2", x(18))
        .attr("y2", y(18))
        .attr("stroke-width", 2)
        .attr("stroke", "#4CA145")
        .attr("stroke-dasharray", "5,5");

    // axis labels and title
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
        .style("z-index", "999")
        .style("font-size", "12px");

    svg1.append('text')
        .attr('x', (plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)/2)
        .attr('y', plot_dims.scatter.margin.top  - 16)
        .attr('text-anchor', 'middle')
        .text('SDG by Donor and Leader Priority')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");
            
        

    }