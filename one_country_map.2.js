// create svg and g blocks
//import {geoPath, geoAlbersUsa} from 'd3-geo';
//import {select} from 'd3-selection';
// var map, projects;


const width = 800;
const height = 900;
const notesHeight = 100;  
const margin = {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10
    };

// d3.queue()

//     .defer(d3.json, "ghana_2.geojson")
//     .awaitAll(ready)


  // create Leaflet map
  var map = L.map('map', {center: [7.0, -1.2], zoom:6}) 
  var mapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
          { attribution: '© OpenStreetMap'}).addTo(map); 
          //L.geoJSON(ghanaShapes).addTo(map); 
          //L.geoJSON(ghanaWB).addTo(map);

  //var points;

  // function ready(error, results){
  //   if (error) throw error;
  //   points = results
  //   initializePoint(points[0]);
  // }

  // create map svg
  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  // const notes = d3.select('.notes')
  //       .append('svg')
  //       .attr('width', width)
  //       .attr('height', notesHeight);

  const colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
  const color = d3.scaleOrdinal()
    .domain([6, 5, 4, 3, 2, 1])
    .range(colorRange);

//var projects, remaining = 3;
  console.log('here')

d3.json('./d3_ghana_data.json', function(collection) {
  /* Add a LatLng object to each item in the dataset */
  console.log('helllllllo')
  //if (error) {
  //  console.log(error);
  //  } else {
      collection.objects.forEach(function(d) {
      //d.LatLng = new L.LatLng(d.latitude,
      //            d.longitude)
          //d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);
          //d.id = d.project_id
          //d.rating = d.six_overall_rating
        d.LatLng = new L.LatLng(d.latitude,
                        d.longitude)
          });
      });

      //projects = collection;
      console.log('hello')
      //console.log(projects)

      //if (!--remaining) myMap();
    //};
  
  //});


  // function initializePoint(location){
  //   var transform = d3.geoTransform({point: projectPoint});
  //   var path = d3.geoPath().projection(transform);
  //   collection.features.forEach(function(d) {
  //     //d.LatLng = new L.LatLng(d.latitude,
  //     //            d.longitude)
  //         d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])
  // }

  //function myMap(){
  var transform = d3.geoTransform({point: projectPoint});
  var path = d3.geoPath().projection(transform);

  function projectPoint(x, y) {
       	  var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
  }

  var circles=  g.selectAll('circle')
      .data(collection.objects)
      .enter()
      .append('circle')
      .attr("class", function(d) { return d.id; })
      //.attr("cx", function(d) {
      //    return projection([d.longitude, d.latitude])[0];
      //})
      //.attr("cy", function(d) {
      //    return projection([d.longitude, d.latitude])[1];
      // })
      .attr('fill', d => color(d.rating))
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.60);

  console.log('hi')

  map.on("viewreset", update);
  update();
  
  function update() {
    console.log('map was reset')
    var bounds = path.bounds(collecton.objects),
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
//} 

//myMap();
// const circles=  g.selectAll('circle')
//   .data(projects.features)
//   .enter()
//   .append('circle')
//   .attr("class", function(d) { return d.project_id; })
//   //.attr("cx", function(d) {
  //    return projection([d.longitude, d.latitude])[0];
  //})
  //.attr("cy", function(d) {
  //    return projection([d.longitude, d.latitude])[1];
  // // })
  // .attr('fill', d => color(d.six_overall_rating))
  // .attr('stroke-width', 0.25)
  // .attr('opacity', 0.60);


  // map.on("viewreset", update);
  // update();
  
  // function update() {
  // circles.attr("transform", 
  // function(d) { 
  //   return "translate("+ 
  //     map.latLngToLayerPoint(d.LatLng).x +","+ 
  //     map.latLngToLayerPoint(d.LatLng).y +")";
  //   }
  // )
  // }
  // })

/* <script type="text/javascript">
	
  var map = L.map('map').setView([-41.2858, 174.7868], 13);
  mapLink = 
      '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      maxZoom: 18,
      }).addTo(map);
  
/* Initialize the SVG layer */
// map._initPathRoot()    

// /* We simply pick up the SVG from the map object */
// var svg = d3.select("#map").select("svg"),
// g = svg.append("g");



// var feature = g.selectAll("circle")
// .data(collection.objects)
// .enter().append("circle")
// .style("stroke", "black")  
// .style("opacity", .6) 
// .style("fill", "red")
// .attr("r", 20);  

// map.on("viewreset", update);
// update();

// function update() {
// feature.attr("transform", 
// function(d) { 
//   return "translate("+ 
//     map.latLngToLayerPoint(d.LatLng).x +","+ 
//     map.latLngToLayerPoint(d.LatLng).y +")";
//   }
// )
// }
// })			 
// </script>
// </body>
// </html>




// document.addEventListener('DOMContentLoaded', () => {
//     Promise.all(['./ghana_2.geojson',
//     './d3_ghana_data.json'
//     ].map(url => fetch(url).then(data => data.json())))
//     .then(data => myVis(data)).catch(error => {
//           console.log(`The following error has occured: ${error}`)
//       })
//   });


// function myVis(data) {

//     const [ghanaShapes, ghanaWB] = data;
//     const width = 800;
//     const height = 900;
//     const notesHeight = 100;  
//     const margin = {
//         top: 10,
//         left: 10,
//         right: 10,
//         bottom: 10
//     };

    
  

//     //  const projection = d3.geoEquirectangular()
//     //      .center([0, 7.0])
//     //      .rotate([1.2, 0])
//     //      .scale(6000)
//     //      .translate([width/2,height/2]);

        
//     // const path = d3.geoPath()
//     //     .projection(projection);
    

    

      
//     // const svg =  d3.select('.first')
//     //     .append('svg')
//     //     .attr('width', width + margin.left + margin.right)
//     //     .attr('height', height + margin.top + margin.bottom)

//     const colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
//     const color = d3.scaleOrdinal()
//       .domain([6, 5, 4, 3, 2, 1])
//       .range(colorRange);


//       ghanaWB.forEach(function(d) {
//         d.LatLng = new L.LatLng(d.latitude,
//                     d.longitude)
//       });

//     //tooltip + mouseover

//     // change select to ".first"
//     const tooltip = d3.select(map.getContainer()).append("div")
//                   .attr("class", "tooltip")
//                   .style("opacity", 0);

//     const tipMouseover = function(d) {

//       const cl = color(d.six_overall_rating);
//       const html  = "<b>Title:</b> " + d.project_title + "<br/>" +
//                     "<b>Start Date:</b> " + d.start_actual_isodate + " <b>End Date:</b> " + d.end_actual_isodate + "<br/>" + 
//                   "<b>Funding:</b> " +  d.total_commitments + "<br/>" +
//                   "<b>Performance:<span style='color:" + cl + ";'> " +  d.performance_cat + "</span></b><br/>" +
//                   "<b>Goal:</b> " + d.goal;

//       tooltip.html(html)
//           .style("left", (d3.event.pageX + 15) + "px")
//           .style("top", (d3.event.pageY - 28) + "px")
//           .style("z-index", "999")
//           .transition()
//             .duration(200) 
//             .style("opacity", .9) 
//     };

//     const onColor = function(d) {
//       svg.selectAll("." + this.getAttribute('class'))
//       .style("fill", "#E31480")
//       .style("opacity", .9);

//     }

//     const outColor = function(d) {
//       svg.selectAll("." + this.getAttribute('class'))
//       .style("fill",  d => color(d.six_overall_rating))
//       .style("opacity", .6);

//     }
//   // tooltip mouseout event handler
//     var tipMouseout = function(d) {
//       tooltip.transition()
//           .duration(300) 
//           .style("opacity", 0);
//     };

//   //change back to svg
//     // g.selectAll('path')
//     //   .data(ghanaShapes.features)
//     //   .enter()
//     //   .append('path')
//     //   .attr('d', path)
//     //   .attr('fill', '#e9e9e9') 
//     //   .attr('stroke', 'black');

//     //change to svg

//     const circles=  g.selectAll('circle')
//       .data(ghanaWB)
//       .enter()
//       .append('circle')
//       .attr("class", function(d) { return d.project_id; })
//       //.attr("cx", function(d) {
//       //    return projection([d.longitude, d.latitude])[0];
//       //})
//       //.attr("cy", function(d) {
//       //    return projection([d.longitude, d.latitude])[1];
//       // })
//       .attr('fill', d => color(d.six_overall_rating))
//       .attr('stroke-width', 0.25)
//       .attr('opacity', 0.60);
    

//       circles.transition()
//         .duration(3000)
//         .attr("r", function(d) {
//             return Math.sqrt(parseInt(d.total_commitments) * 0.000002);
//         });
//       circles.on("mouseover", function(d) {
//         tipMouseover(d);
//         onColor.call(this, d);
//       });
//       circles.on("mouseout", function(d) {
//         tipMouseout(d);
//         outColor.call(this, d);
//       });

//     //https://leafletjs.com/reference-1.4.0.html#circle  
//     const transform = d3.geoTransform({point: projectPoint});

//     const path = d3.geoPath().projection(transform);

//     const bounds = path.bounds(ghanaShapes),
//       topLeft = bounds[0],
//       bottomRight = bounds[1];

//     svg.attr("width", bottomRight[0] - topLeft[0])
//         .attr("height", bottomRight[1] - topLeft[1])
//         .style("left", topLeft[0] + "px")
//         .style("top", topLeft[1] + "px");
    
//     g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    
//     map.on("viewreset", update);
// 		  update();
  
//     function projectPoint(x, y) {
// 			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//       this.stream.point(point.x, point.y);
//     }

//     function update() {
//       currentZoom = map.getZoom();
//       circles.attr("transform", 
//       function(d) { 
//         return "translate("+ 
//           map.latLngToLayerPoint(d.LatLng).x +","+ 
//           map.latLngToLayerPoint(d.LatLng).y +")";
//       })
      
//       svg.attr("width", bottomRight[0] - topLeft[0])
//         .attr("height", bottomRight[1] - topLeft[1])
//         .style("left", topLeft[0] + "px")
//         .style("top", topLeft[1] + "px");
    
//       g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
//   }

//     notes.append("text")             
//       .attr("transform",
//       "translate(" + (width/2 + margin.left) + " ," + 
//                       (notesHeight + margin.top - 50) + ")")
//           .style("text-anchor", "left")
//           .text("Source: Project Performance Database (Honig 2018)")
//           .style("font-family", '"Lucida Console", monospace')
//           .style("font-size", "10px");

      
      
// }  


