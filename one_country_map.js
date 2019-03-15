
// inspiration for map:
// http://bl.ocks.org/d3noob/9267535
// http://bl.ocks.org/bimannie/33494479e839c3fe3735eac00be69787 

function myVis(ghanaShapes, ghanaWB, ghanaPriority) {

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
    var map = L.map('map', { center: [8.2, -1.2], zoom:7, minZoom: 6}); 
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map); 
        L.geoJSON(ghanaShapes, {style: shapeStyle}).addTo(map); 

    // Home Button
    //referenced: https://gis.stackexchange.com/questions/127286/home-button-leaflet-map, inspired by Lauren Li presentation
    var home = {
      lat: 8.2,
      lng: -1.2,
      zoom: 7
      };
  
    L.easyButton('fa-home',function(btn,map){
      map.setView([home.lat, home.lng], home.zoom);
    },'Return to Country View').addTo(map);

    // Color Legend
    //https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [1, 2, 3, 4, 5, 6],
          labels = ['Highly Unsatisfactory', 'Unsatisfactory', 'Marginally Unsatisfactory', 'Marginally Satisfactory',
          'Satisfactory', 'Highly Satisfactory'];

      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<div class = "row"><i style="background:' + color(grades[i]) + '"></i> ' + labels[i]+ '</div>'
      }

    return div;
    };

    legend.addTo(map);

    // Create Circle Legend
    var circ_legend = L.control({position: 'topleft'});

    circ_legend.onAdd = function (map) {

    var div2 = L.DomUtil.create('div', 'info legend'),
        labels = ['$10M', '$20M', '$100M', '$200M'];

        div2.innerHTML = 
        
        '<div class="row" "><i class="inner-circle circle4" ></i><span class="legend inner-row">' + labels[0] + '</span></div>' +
        '<div class="row" "><i class="inner-cirlce circle3" ></i><span class="legend inner-row">' + labels[1] + '</span></div>' +
        '<div class="row" "><i class="inner-cirlce circle2" ></i><span class="legend inner-row">' + labels[2] + '</span></div>' +
        '<div class="row" "><i class="inner-cirlce circle1" ></i><span class="legend inner-row">' + labels[3] + '</span></div>' 

    return div2;
    };

    circ_legend.addTo(map);

    // Add Info Tooltip
    //inspired by: https://leafletjs.com/examples/choropleth/
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); 
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (d) {
        this._div.innerHTML = '<h4> Development Project Explorer</h4>' +  (d ?
          "<b>Title:</b> " + d.title + "<br/>" +
          "<b>Start Date:</b> " + d.start + " <b>End Date:</b> " + d.end + "<br/>" + 
          "<b>Funding:</b> " + d.funding + "<br/>" +
          "<b>Goal:</b> " + d.sdg_name
            : 'Hover over a project location to learn more <br/> Click on a project location to zoom');
    };

    info.addTo(map);
    
    // append svg to map, g to svg
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var tipMouseover = function(d) {

      info.update(d);
  
    };

    // tooltip mouseout event handler
    var tipMouseout = function(d) {
      info.update();
    };

    // function to change color of project locations on hover
    var onColor = function(d) {
      svg.selectAll('circle').filter("." + this.getAttribute('projid'))
      .style("stroke", "#E31480")
      .attr('stroke-width', 3)
      .style("opacity", .9);
    }

    var onGoal = function(d) {
      d3.select("#" + d.sdg)
      .style("stroke", "#E31480")
      .attr('stroke-width', 2)
      .style("opacity", .9);
    }

    var onPerf = function(d) {
      d3.select("#cat_" + d.performance)
      .style("stroke", "#E31480")
      .style("opacity", .9);
    }

    var outColor = function(d) {
      svg.selectAll('circle').filter("." + this.getAttribute('projid'))
      .style("stroke",  'black')
      .attr('stroke-width', 0.25)
      .style("opacity", .8);
    }

    var outGoal = function(d) {
      d3.select("#" + d.sdg)
      .style("stroke", 'black')
      .attr('stroke-width', 0.25)
      .style("opacity", .8);
    }

    var outPerf = function(d) {
      d3.select("#cat_" + d.performance)
      .style("stroke", color(d.performance))
      .style("opacity", .7);
    }

    // dummy variable True = project not yet clicked
    var to_click = true

    var clicked = function (d) {
      // Zoom to selected project on the map
      map.setView(L.latLng(d.LatLng), 11, {animate:false, duration:1});

      // get current geoid
      var geo_id_this = this.getAttribute('geoid');

      // get current transform 
      const translate_this = this.getAttribute('transform');

      // parse function from https://stackoverflow.com/questions/17824145/parse-svg-transform-attribute-with-javascript
      var parse = function (a){
        var b={};
        for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
            var c = a[i].match(/[\w\.\-]+/g);
            b[c.shift()] = c;
        
        return b;
      }
      
      // parse translate text
      const trans_parse = parse(translate_this)

      // filter data to project locations at current geoid
      // resource: http://learnjsdata.com/iterate_data.html
      var d_filter = ghanaWB.features.filter(d => `G${d.geoid}` === geo_id_this).sort((a, b) => b.funding - a.funding);

      //define radius of spread as 2x radius of largest circle
      var max_rad = Math.sqrt(parseInt(d_filter[0].funding) * 0.000002)*2;

      //get count of locations at geoid
      //https://stackoverflow.com/questions/6756104/get-size-of-json-object
      var len = Object.keys(d_filter).length;

      //define angles as radians/ number of points in stack
      var theta = (2*Math.PI)/len;
     
      //if multiple projects in same location, scatter on click
      // circle math https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle
      if (len > 1 & to_click === true) {
        d_filter.forEach(function(d, i) {
          var x_tran = max_rad*Math.sin(theta*i) + +trans_parse.translate[0];
          var y_tran = max_rad*Math.cos(theta*i) + +trans_parse.translate[1];
         
          var proj_selection = svg.selectAll('circle').filter("." + geo_id_this).filter("." + d.id)
            .transition()
            .duration(1000)
            .attr("transform", `translate(${x_tran}, ${y_tran})`)
          
          console.log(`translate(${x_tran}, ${y_tran})`)   

          // set dummy to false
          to_click = false  

        // case if project already clicked
        });} else {
          svg.selectAll('circle').filter("." + geo_id_this)
          .transition()
          .duration(1000)
          .attr("transform", `${translate_this}`);

          // set dummy back to true
          to_click = true;
          
        }
      };
    
    // create circles
    var circles=  g.selectAll('circle')
      .data(ghanaWB.features)
      .enter()
      .append('circle')
      .attr("class", function(d) { return d.id+" G"+ d.geoid + " " + d.sdg;})
      .attr("geoid", d => "G" + d.geoid)
      .attr("projid", d => d.id)
      .attr('fill', d => color(d.performance))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.8)
      .attr('active', false)
      .attr('stable_translate', 0)
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
