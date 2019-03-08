// create svg and g blocks
//import {geoPath, geoAlbersUsa} from 'd3-geo';
//import {select} from 'd3-selection';


document.addEventListener('DOMContentLoaded', () => {
    Promise.all(['./ghana_2.geojson',
    './ghana_wb.geojson'
    ].map(url => fetch(url).then(data => data.json())))
    .then(data => myVis(data)).catch(error => {
          console.log(`The following error has occured: ${error}`)
      })
  });


function myVis(data) {

    var [ghanaShapes, ghanaWB] = data;
    var width = 800;
    var height = 900;
    var notesHeight = 100;  
    var margin = {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10
    };

    
    // ghanaWB.forEach(function(d) {
		// 	d.LatLng = new L.LatLng(d.latitude,
		// 							d.longitude)
    // });
    
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
     });
     
     console.log(ghanaWB)

    //  var projection = d3.geoEquirectangular()
    //      .center([0, 7.0])
    //      .rotate([1.2, 0])
    //      .scale(6000)
    //      .translate([width/2,height/2]);

        
    // var path = d3.geoPath()
    //     .projection(projection);
    

    var map = L.map('map', { center: [7.5, -1.2], zoom:7}); 
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map); 
        L.geoJSON(ghanaShapes).addTo(map); 
        //L.geoJSON(ghanaWB).addTo(map);

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var notes = d3.select('.notes')
          .append('svg')
          .attr('width', width)
          .attr('height', notesHeight);

      
    // var svg =  d3.select('.first')
    //     .append('svg')
    //     .attr('width', width + margin.left + margin.right)
    //     .attr('height', height + margin.top + margin.bottom)

    var colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
    var color = d3.scaleOrdinal()
      .domain([6, 5, 4, 3, 2, 1])
      .range(colorRange);

    //tooltip + mouseover

    // change select to ".first"
    var tooltip = d3.select(map.getContainer()).append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

    var tipMouseover = function(d) {

      var cl = color(d.six_overall_rating);
      var html  = "<b>Title:</b> " + d.title + "<br/>" +
                    "<b>Start Date:</b> " + d.start + " <b>End Date:</b> " + d.end + "<br/>" + 
                  "<b>Funding:</b> " +  d.funding + "<br/>" +
                  "<b>Performance:<span style='color:" + cl + ";'> " +  d.perf_cat + "</span></b><br/>" +
                  "<b>Goal:</b> " + d.sdg;

      tooltip.html(html)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("z-index", "999")
          .transition()
            .duration(200) 
            .style("opacity", .9) 
    };

    var onColor = function(d) {
      svg.selectAll("." + this.getAttribute('class'))
      .style("fill", "#E31480")
      .style("opacity", .9);

    }

    var outColor = function(d) {
      svg.selectAll("." + this.getAttribute('class'))
      .style("fill",  d => color(d.performance))
      .style("opacity", .6);

    }
  // tooltip mouseout event handler
    var tipMouseout = function(d) {
      tooltip.transition()
          .duration(300) 
          .style("opacity", 0);
    };

  //change back to svg
    // g.selectAll('path')
    //   .data(ghanaShapes.features)
    //   .enter()
    //   .append('path')
    //   .attr('d', path)
    //   .attr('fill', '#e9e9e9') 
    //   .attr('stroke', 'black');

    //change to svg

    var circles=  g.selectAll('circle')
      .data(ghanaWB.features)
      .enter()
      .append('circle')
      .attr("class", function(d) { return d.id; })
      //.attr("cx", function(d) {
      //    return projection([d.longitude, d.latitude])[0];
      //})
      //.attr("cy", function(d) {
      //    return projection([d.longitude, d.latitude])[1];
      // })
      .attr('fill', d => color(d.performance))
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.60);

      console.log('hi!')

      circles.transition()
        .duration(3000)
        .attr("r", function(d) {
            return Math.sqrt(parseInt(d.funding) * 0.000002);
        });
      circles.on("mouseover", function(d) {
        tipMouseover(d);
        onColor.call(this, d);
      });
      circles.on("mouseout", function(d) {
        tipMouseout(d);
        outColor.call(this, d);
      });

    //https://leafletjs.com/reference-1.4.0.html#circle  
    var transform = d3.geoTransform({point: projectPoint});

    var path = d3.geoPath().projection(transform);

    // var bounds = path.bounds(ghanaWB),
    //   topLeft = bounds[0],
    //   bottomRight = bounds[1];

    // svg.attr("width", bottomRight[0] - topLeft[0])
    //     .attr("height", bottomRight[1] - topLeft[1])
    //     .style("left", topLeft[0] + "px")
    //     .style("top", topLeft[1] + "px");
    
    // g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    
    map.on("viewreset", update);
		update();
  
    function projectPoint(x, y) {
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    map.on("moveend", update);
    //map.on('zoomstart', function(d) {
    //  d3.select("#map").selectAll("circle").remove();})
    update();
    
    function update() {
      console.log('map was reset')

      var bounds = path.bounds(ghanaWB),
         topLeft = bounds[0],
         bottomRight = bounds[1];
  
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
    }

    // notes.append("text")             
    //   .attr("transform",
    //   "translate(" + (width/2 + margin.left) + " ," + 
    //                   (notesHeight + margin.top - 50) + ")")
    //       .style("text-anchor", "left")
    //       .text("Source: Project Performance Database (Honig 2018)")
    //       .style("font-family", '"Lucida Console", monospace')
    //       .style("font-size", "10px");

      
      
}  


