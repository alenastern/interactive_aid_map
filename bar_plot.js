function myBar(ghanaCount, ghanaFunding) {    
    
    console.log(ghanaCount);

    // append svg and g for plot
    var svg2 = d3.select('#bar')
    .append('svg')
    .attr('width', plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)
    .attr('height', plot_dims.scatter.height + plot_dims.scatter.margin.bottom + plot_dims.scatter.margin.top)
    //.attr('y', 355 + "px");

    var g2= svg2.append("g")
    .attr("transform", `translate(20, ${plot_dims.scatter.margin.top})`);

    // calcualte y domain
    const yDomain = ghanaCount.reduce((acc, row) => {
        return {
          min: Math.min(row.count, acc.min),
          max: Math.max(row.count, acc.max)
        };
      }, {min: Infinity, max: -Infinity});

    // create scales
    const x = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6])
        .range([0, plot_dims.scatter.width - plot_dims.scatter.margin.left - 15])
        .padding([0.2]);

    const y =  d3.scaleLinear()
        .domain([0, yDomain.max])
        .range([plot_dims.scatter.height, plot_dims.scatter.margin.top]);

    // create axes
    g2.append("g")
        .call(d3.axisBottom(x).tickValues([1, 2, 3, 4, 5, 6]))
        .attr('class', 'xaxis')
        .attr("transform", `translate(${plot_dims.scatter.margin.left}, ${plot_dims.scatter.height})`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');
        
    g2.append('g')
        .call(d3.axisLeft(y))
        .attr('class', 'yaxis')
        .attr('transform', `translate(${plot_dims.scatter.margin.left}, 0)`)
        .selectAll(".tick > text")
        .style("font-family",'"Lucida Console", monospace');

    const chart = g2.append('g')
        .attr('transform', `translate(${plot_dims.scatter.margin.left},0)`)
        .attr('height', plot_dims.scatter.height)
        .attr('width', plot_dims.scatter.width)

    // create bars
    var rects = chart.selectAll("rect")
        .data(ghanaCount);

    rects.enter()
        .append('rect')
        .attr('class', 'rect')
        .attr('width', x.bandwidth())
        .attr('x', d => x(d.category))
        .attr('y', plot_dims.scatter.height)
        .attr('height', 0)
        .style("fill",  d => color(d.category))
        .style("stroke", d => color(d.category))
        .style("stroke-width", 3)
        .style("opacity", .7)
        .attr("id", d => "cat_" + d.category)
        .transition()
        .duration(3000)
        .attr('y', d => y(d.count))
        .attr('height', d => plot_dims.scatter.height - y(d.count) - 2);
        
    //add axis labels
    svg2.append('text')
        // do i need to fix - ?
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
        .attr('class', 'axis-label')
        .text('Performance Rating')
        .style("font-family",'"Lucida Console", monospace')
        .style("font-size", "12px");



    var FundingButton = svg2.append("g")
      .attr("id", "LabButton")
      .attr("opacity", 10)
      .attr('class', "HistButton")
      .attr("transform", "translate(" + 20 + "," + 10 + ")");
    
    FundingButton.append("rect")
      .attr("x", 120)
      .attr("y", 15)
      .attr("width", 85)
      .attr("height", 25);
    
    FundingButton.append("text")
      .attr("x", 130)
      .attr("y", 30)
      .html(" Funding ");

    FundingButton.on("click", function() {
      d3.selectAll(".rect").remove();
      d3.selectAll(".axis-label").remove();
      d3.selectAll(".xaxis").remove();
     // d3.selectAll(".yaxis").remove();

      // update bar plot
      updateBar(ghanaFunding, "funding");

    });

    var PerformanceButton = svg2.append("g")
      .attr("id", "LabButton")
      .attr("opacity", 10)
      .attr('class', "HistButton")
      .attr("transform", "translate(" + 20 + "," + 10 + ")");
    
    PerformanceButton.append("rect")
      .attr("x", 260)
      .attr("y", 15)
      .attr("width", 85)
      .attr("height", 25);
    
    PerformanceButton.append("text")
      .attr("x", 270)
      .attr("y", 30)
      .html(" Performance ");

    PerformanceButton.on("click", function() {
        d3.selectAll(".rect").remove();
        d3.selectAll(".axis-label").remove();
        //d3.selectAll(".xaxis").remove();
        d3.selectAll(".yaxis").remove();

        // update bar plot
        updateBar(ghanaCount, "performance");

    })

    function updateBar(data, var_name){  

       const variable = var_name

        const yDomain = data.reduce((acc, row) => {
            return {
              min: Math.min(row.count, acc.min),
              max: Math.max(row.count, acc.max)
            };
          }, {min: Infinity, max: -Infinity});

        // if (var_name === "funding"){
        //     var colorScale = color();
        //     var x_lab = "Total Project Funding";
        //   } else {
        //     var colorScale = gradient();
        //     var x_lab = "Performance Category";
        // }
    
        // create scales
    
        const y =  d3.scaleLinear()
            .domain([0, yDomain.max])
            .range([plot_dims.scatter.height, plot_dims.scatter.margin.top]);
    
        // create bars
        var rects = chart.selectAll("rect")
            .data(data);

        // rename six_overall_rating to category

        rects.enter()
            .append('rect')
            .attr('class', 'rect')
            .attr('width', x.bandwidth())
            .attr('x', d => x(d.category))
            .attr('y', plot_dims.scatter.height)
            .attr('height', 0)
            .style("fill",  function(d) {
              if (variable === "funding") {
                  return gradient(d.category);
              } else {
                  console.log("here");
                  return color(d.category);
                  
              }})
            .style("stroke", function(d) {
              console.log(variable)
              if (variable === "funding") {
                  return gradient(d.category);
              } else {
                  return color(d.category);
              }})
            //d => colorScale(d.category))
            .style("stroke-width", 3)
            .style("opacity", .7)
            .attr("id", d => "cat_" + d.category)
            .transition()
            .duration(3000)
            .attr('y', d => y(d.count))
            .attr('height', d => plot_dims.scatter.height - y(d.count) - 2);
            
        //add x axis label
        //x_lab_dict.var_name
        
        svg2.append('text')
            .attr('x', (plot_dims.scatter.width + plot_dims.scatter.margin.left + plot_dims.scatter.margin.right)/2)
            .attr('y', plot_dims.scatter.margin.top + plot_dims.scatter.height + plot_dims.scatter.margin.bottom - 10)
            .attr('text-anchor', 'middle')
            .attr('class', 'axis-label')
            .text(x_lab_dict[var_name])
            .style("font-family",'"Lucida Console", monospace')
            .style("font-size", "12px");
    
    }


    
    
    //Define click behavior

    // JQButton.on("click", function() {
    //   d3.selectAll(".dot").remove();
    //   d3.selectAll("text.scattertitle").remove();
    //   d3.selectAll("text.scattersubtitle").remove();
    //   d3.selectAll("text.xtext").remove();
    //   d3.selectAll("text.ytext").remove();
    //   d3.selectAll(".xaxis").remove();

    //   // Produce new scatterplot:
    //   updateVar("JobQuality", " Job Quality (%) ", "Job Quality ",
    //    "Higher female LFP seems correlated with better jobs...")
  

  


    //http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8
    //https://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
//     var dropdown = d3.select("#proj_highlight")
//         .insert("select", "svg")
//         .on("change", dropdownChange);

//     var dropdownChange = function(d){

//     }
//     dropdown.selectAll("option")
//                     .text('Performance'); 

 }