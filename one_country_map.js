
// ideas for overlapping circles
// https://stackoverflow.com/questions/28647623/collision-overlap-detection-of-circles-in-a-d3-transition
// https://bl.ocks.org/mbostock/1093130

// preturbation on points, put on wheel - which is biggest, set radius to be double largest, divide up wedge space based on 
// number, they'll all fit (similar to b)

// one function called from promise chain
// main function call scatter and bar in own function 

// inspiration for map:
// http://bl.ocks.org/d3noob/9267535
// http://bl.ocks.org/bimannie/33494479e839c3fe3735eac00be69787 

// QUESTIONS
// handling errors w/ promise all
// multi classes w/ select
// 

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
      d.geoid = d.properties.geoname_id
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
    



    

    //legend.addTo(map);
    // append svg to map, g to svg
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

  //  // create legend
  //  var colorLegend = d3.legend.color()
  //       .labelFormat(d3.format(".0f"))
  //       .scale(color)
  //       .shapePadding(5)
  //       .shapeWidth(50)
  //       .shapeHeight(20)
  //       .labelOffset(12);

    // svg.append("g")
    //     .attr("transform", `translate(500, ${plot_dims.map.height - 100})`)
    //     .call(colorLegend);
  

    //tooltip + mouseover

    var tooltip = d3.select(map.getContainer()).append("div")
                  .attr("padding", 10 + "px")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

    var tipMouseover = function(d) {

      var funding = d3.format("($,.2f")(d.funding)
      var cl = color(d.performance);
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
      //svg.selectAll("." + this.getAttribute('class'))
      svg.selectAll('circle').filter("." + this.getAttribute('projid'))
      .style("fill", "#E31480")
      .style("opacity", .9);
    }

    var onGoal = function(d) {
      d3.select("#" + d.sdg)
      .style("fill", "#E31480")
      .style("opacity", .9);
    }

    var onPerf = function(d) {
      d3.select("#cat_" + d.performance)
      .style("stroke", "#E31480")
      .style("opacity", .9);
    }

    var outColor = function(d) {
      //svg.selectAll("." + this.getAttribute('class'))
      svg.selectAll('circle').filter("." + this.getAttribute('projid'))
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


    var clicked = function (d) {
      // Zoom to selected project on the map
      map.setView(L.latLng(d.LatLng), 11);

      // get current geoid
      var geo_id_this = this.getAttribute('geoid');
      console.log(geo_id_this)
      var translate_this = this.getAttribute('transform');
      console.log(translate_this[0])
    

      // parse function from https://stackoverflow.com/questions/17824145/parse-svg-transform-attribute-with-javascript
      var parse = function (a){
        var b={};
        for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
        {
            var c = a[i].match(/[\w\.\-]+/g);
            b[c.shift()] = c;
        }
        return b;
    }
      var trans_parse = parse(translate_this)

      console.log(trans_parse)
      // filter data to current geoid
      // resource: http://learnjsdata.com/iterate_data.html
      // var d_filter = ghanaWB.filter(function(d) { return d.geoid === geo_id_this; }).sort(function(a,b) {
      //   return b.funding - a.funding;
      // });
      var d_filter = ghanaWB.features.filter(d => `G${d.geoid}` === geo_id_this).sort((a, b) => b.funding - a.funding);
      console.log(d_filter)

      //var selection = svg.selectAll('circle').filter("." + this.getAttribute('geoid'))
      //  .style("fill", "yellow");

      //console.log(d_filter)
      var max_rad = Math.sqrt(parseInt(d_filter[0].funding) * 0.000002)*2;
      var len = Object.keys(d_filter).length;
      //console.log(max_rad)
      var theta = (2*Math.PI)/len;
      //console.log(theta)

      d_filter.forEach(function(d, i) {
          var x_tran = max_rad*Math.sin(theta*i) + +trans_parse.translate[0];
          //console.log(x_tran)
          var y_tran = max_rad*Math.cos(theta*i) + +trans_parse.translate[1];
          //console.log(y_tran);
          var proj_selection = svg.selectAll('circle').filter("." + geo_id_this).filter("." + d.id)
          //var proj_select = selection.filter("." + d.id)
          .attr("transform", `translate(${x_tran}, ${y_tran})`);   
          console.log(`translate(${x_tran}, ${y_tran})`)     
        });

      var invisible = svg.append("g").attr("class", "invisible");

      invisible.on('clicked', svg.selectAll('circle').filter(".G" + geo_id_this).attr("transform", `${translate_this}`));
    
      }

      //map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
      //map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
      //})
       // [r_new*sin(theta*i), r_new*cos(theta*i)]
      //.forEach(function(d) {

        // store current latlng as variable
       // const cur_latlng = d.LatLng
        // find circle with max radius

        // const max_rad = selection.reduce((acc, row) => {
        //   return {
        //     min: Math.min(row.count, acc.min),
        //   };)
        // define r_new = max radius * 2
        // define theta = 2*Math.PI/ num item in selection
        // in order of size radius, update d.LatLong = [r_new*sin(theta*i), r_new*cos(theta*i)]
        // Math.sin, radians convert theta to radian 2*pi radians in circle 
        // use transform translate a la this http://bl.ocks.org/cartoda/035f893cd5fc86bb955f
        
        // append invisible div
        // on click of div, return to normal
        // css class for invisible div w 4 properties top: 0, left:0, bottom:0, right:0, positon:absolute

      

      // on second click, update LatLng of all objects to be old latlong using variable


      //𝑥=𝑟sin𝜃, 𝑦=𝑟cos𝜃.

    
    // create circles
    var circles=  g.selectAll('circle')
      .data(ghanaWB.features)
      .enter()
      .append('circle')
      //.attr("class", function(d) { return d.id; })//function(d) { return d.id+" "+ d.geoid;})
      .attr("class", function(d) { return d.id+" G"+ d.geoid;})
      .attr("geoid", d => "G" + d.geoid)
      .attr("projid", d => d.id)
      .attr('fill', d => color(d.performance))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.8)
      .on('click', clicked);

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
  
    function projectPoint(x, y) {
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    // adjust points on zoom
    map.on("moveend", update);
    update();
    
    function update() {

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
      

// idea for circles https://codepen.io/eesur/pen/KcDHj
// calculating circle math https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle
