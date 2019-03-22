// define dimension constants
const plot_dims = {
    map: {
        height: 900,
        margin: {
            top: 10,
            left: 10,
            right: 10,
            bottom: 10
            }
        },
    scatter: {
        height: 260,
        width: 410,
        margin: {
            top: 30,
            left: 70,
            right: 0,
            bottom: 40
        }
    }
}

const x_lab_dict = {funding: "Total Project Commitment", performance: "Preformance Category"}
//var to_click = true
// define color scale
var colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
var color = d3.scaleOrdinal()
  .domain([6, 5, 4, 3, 2, 1])
  .range(colorRange);

var gradientRange = ['#11445c','#1d749e', '#2699D0', '#52b1df', '#94cfeb', '#d6edf8']
var gradient = d3.scaleOrdinal()
   .domain([6, 5, 4, 3, 2, 1])
   .range(gradientRange);

   //render plots

//
document.addEventListener('DOMContentLoaded', () => {
    Promise.all(['./ghana_2.geojson',
    './ghana_wb.geojson', './d3_ghana_priority.json',
    './d3_ghana_perf_count.json', 'd3_ghana_fund_count.json'
    ].map(url => fetch(url).then(data => data.json())))
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding]) => {
     myVis(ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding);
        return [ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding];
        })
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding]) => {
       myScatter(ghanaPriority);
       return [ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding];
        })
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount, ghanaFunding]) => {
        myBar(ghanaCount, ghanaFunding);
        })
    });

    // can add controls from here
    // can just make them all siblings, don't have to do the pass then => myVis; myScatter; myBar;
    // give function argument that relates to which column accessing, write function that has responsivenessin here that calls dropdown
    // write function call render all visualizations, which column to use and passes to all functions (called update())
    // call update to make initial page load happen
    // new function create dropdown -> pass update function as argument to create dropdown
    // dropdown has listners on options, when click option, call update function with appropriate value from option list (just do for bar plot)