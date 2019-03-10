// create svg and g blocks
//import {geoPath, geoAlbersUsa} from 'd3-geo';
//import {select} from 'd3-selection';

// best way to load different data sets for side plots

// ideas for overlapping circles
// https://stackoverflow.com/questions/28647623/collision-overlap-detection-of-circles-in-a-d3-transition
// https://bl.ocks.org/mbostock/1093130

// preturbation on points, put on wheel - which is biggest, set radius to be double largest, divide up wedge space based on 
// number, they'll all fit (similar to b)

// one function called from promise chain
// main function call scatter and bar in own function 

function myVis(ghanaShapes, ghanaWB, ghanaPriority) {

    //var [ghanaShapes, ghanaWB, ghanaPriority] = data;
    

    //var active_goal = 'None';
    //create scatter
    //myScatter(ghanaPriority);

    console.log(ghanaPriority);

    var goal_dict = {};

    ghanaPriority.forEach(d => goal_dict[d.goal] = d.six_overall_rating)

    //var goal_dict = ghanaPriority(function(d){return {d.goal : d.six_overall_rating}; });


    console.log(goal_dict);

    // add leaflet LatLng feature and define variables for project data
    ghanaWB.features.forEach(function(d) {
      d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])
      d.funding = d.properties.total_commitments
      d.id = d.properties.project_id
      d.performance = d.properties.six_overall_rating
      d.title = d.properties.project_title
      d.start = d.properties.start_actual_isodate
      d.end = d.properties.end_actual_isodate
      d.perf_cat = d.properties.performance_cat
      d.sdg = d.properties.goal
      d.sdg_name = d.properties.goal_name
     });
     
    console.log(ghanaWB)

    var shapeStyle = {
      "color": "#6A6A6A",
      "weight": 3,
      "opacity": 0.5
  };

    //create leaflet map
    var map = L.map('map', { center: [7.5, -1.2], zoom:7}); 
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map); 
        L.geoJSON(ghanaShapes, {style: shapeStyle}).addTo(map); 
        //L.geoJSON(ghanaWB).addTo(map);
    
    // append svg to map, g to svg
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // define color scale for project performance
  

    //tooltip + mouseover

    var tooltip = d3.select(map.getContainer()).append("div")
                  .attr("padding", 10 + "px")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

    var tipMouseover = function(d) {

      var funding = d3.format("($,.2f")(d.funding)
      var cl = color(d.six_overall_rating);
      var html  = "<b>Title:</b> " + d.title + "<br/>" +
                    "<b>Start Date:</b> " + d.start + " <b>End Date:</b> " + d.end + "<br/>" + 
                  "<b>Funding:</b> " + funding + "<br/>" +
                  "<b>Performance:<span style='color:" + cl + ";'> " +  d.perf_cat + "</span></b><br/>" +
                  "<b>Goal:</b> " + d.sdg_name;

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

    // function to change color of project locations on hover
    var onColor = function(d) {
      svg.selectAll("." + this.getAttribute('class'))
      .style("fill", "#E31480")
      .style("opacity", .9);
    }

    var onGoal = function(d) {
      console.log("#" + d.sdg)
      d3.select("#" + d.sdg)
      .style("fill", "#E31480")
      .style("opacity", .9);
    }

    var onPerf = function(d) {
      console.log("#cat_" + d.performance)
      d3.select("#cat_" + d.performance)
      .style("stroke", "#E31480")
      .style("opacity", .9);
    }

    var outColor = function(d) {
      svg.selectAll("." + this.getAttribute('class'))
      .style("fill",  d => color(d.performance))
      .style("opacity", .8);
    }

    var outGoal = function(d) {
      d3.select("#" + d.sdg)
      .style("fill", color(goal_dict[d.sdg]))
      .style("opacity", .8);
    }

    var outPerf = function(d) {
      d3.select("#cat_" + d.performance)
      .style("stroke", color(d.performance))
      .style("opacity", .7);
    }
    // create circles
    var circles=  g.selectAll('circle')
      .data(ghanaWB.features)
      .enter()
      .append('circle')
      .attr("class", function(d) { return d.id; })

      .attr('fill', d => color(d.performance))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.8);

      console.log('hi!')

      // circles mouseover + transition
      circles.transition()
        .duration(3000)
        .attr("r", function(d) {
            return Math.sqrt(parseInt(d.funding) * 0.000002);
        });
      circles.on("mouseover", function(d) {
        tipMouseover(d);
        onColor.call(this, d);
        onGoal.call(this, d);
        onPerf.call(this, d);
      });
      circles.on("mouseout", function(d) {
        tipMouseout(d);
        outColor.call(this, d);
        outGoal.call(this, d);
        outPerf.call(this, d);
      });
    
    

    //https://leafletjs.com/reference-1.4.0.html#circle  
    var transform = d3.geoTransform({point: projectPoint});

    var path = d3.geoPath().projection(transform);

    
    
    //map.on("viewreset", update);
		//update();
  
    function projectPoint(x, y) {
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    // adjust points on zoom
    map.on("moveend", update);
    update();
    
    function update() {
      console.log('map was reset')

      var bounds = path.bounds(ghanaWB),
         topLeft = bounds[0],
         bottomRight = bounds[1];

      var padding = 25;  
        topLeft = [topLeft[0]-padding, topLeft[1] - padding]
        bottomRight = [bottomRight[0]+padding, bottomRight[1]+ padding] 
  
      svg.attr("width", bottomRight[0] - topLeft[0])
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");
      
      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  
  
      circles.attr("transform", function(d) { 
        return "translate("+ 
          map.latLngToLayerPoint(d.LatLng).x +","+ 
          map.latLngToLayerPoint(d.LatLng).y +")";
      });
};

}
      
 

//

// var svg2 = d3.select('#proj_highlight')
//   .append('svg')
//   .attr('width', scatterWidth)
//   .attr('height', scatterHeight)
//   .attr('top', scatterHeight + 5);

// var g2= svg2.append("g")
//   .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
  
// var note2  = g2.append("text")             
//     .attr("transform",
//     "translate(" + (scatterMargin.left) + " ," + 
//                     (scatterHeight/2 + scatterMargin.top ) + ")")
//         .style("text-anchor", "left")
//         .text("A bar plot will live here")
//         .style("font-family", '"Lucida Console", monospace')
//         .style("font-size", "14px");


        // var scatterWidth = 430;
        // var scatterHeight= 360;
        // var scatterMargin = {
        //   top: 10,
        //   left: 10,
        //   right: 10,
        //   bottom: 10