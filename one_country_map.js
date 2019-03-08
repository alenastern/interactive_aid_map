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
    var colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
    var color = d3.scaleOrdinal()
      .domain([6, 5, 4, 3, 2, 1])
      .range(colorRange);

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
                  "<b>Goal:</b> " + d.sdg;

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

    var outColor = function(d) {
      svg.selectAll("." + this.getAttribute('class'))
      .style("fill",  d => color(d.performance))
      .style("opacity", .6);

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
      .attr('opacity', 0.60);

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
      });
      circles.on("mouseout", function(d) {
        tipMouseout(d);
        outColor.call(this, d);
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

      var scatterWidth = 430;
  var scatterHeight= 360;
  var scatterMargin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
};

    }
      
}  





var scatterWidth = 430;
var scatterHeight= 360;
var scatterMargin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10};

var svg1 = d3.select('#proj_highlight')
    .append('svg')
    .attr('width', scatterWidth)
    .attr('height', scatterHeight);

var g1= svg1.append("g")
    .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
    
var note  = g1.append("text")             
       .attr("transform",
       "translate(" + (scatterMargin.left) + " ," + 
                       (scatterHeight/2 + scatterMargin.top ) + ")")
           .style("text-anchor", "left")
           .text("A scatter plot will live here")
           .style("font-family", '"Lucida Console", monospace')
           .style("font-size", "14px");

var svg2 = d3.select('#proj_highlight')
    .append('svg')
    .attr('width', scatterWidth)
    .attr('height', scatterHeight)
    .attr('top', scatterHeight + 5);

var g2= svg2.append("g")
    .attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
    
var note2  = g2.append("text")             
      .attr("transform",
      "translate(" + (scatterMargin.left) + " ," + 
                      (scatterHeight/2 + scatterMargin.top ) + ")")
          .style("text-anchor", "left")
          .text("A bar plot will live here")
          .style("font-family", '"Lucida Console", monospace')
          .style("font-size", "14px");