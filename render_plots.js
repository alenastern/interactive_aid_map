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
        width: 430,
        margin: {
            top: 30,
            left: 70,
            right: 10,
            bottom: 40
        }
    }
}
//var to_click = true
// define color scale
var colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
var color = d3.scaleOrdinal()
  .domain([6, 5, 4, 3, 2, 1])
  .range(colorRange);

// render plots
document.addEventListener('DOMContentLoaded', () => {
    Promise.all(['./ghana_2.geojson',
    './ghana_wb.geojson', './d3_ghana_priority.json',
    './d3_ghana_perf_count.json'
    ].map(url => fetch(url).then(data => data.json())))
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount]) => {
     myVis(ghanaShapes, ghanaWB, ghanaPriority, ghanaCount);
        return [ghanaShapes, ghanaWB, ghanaPriority, ghanaCount];
        })
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount]) => {
       myScatter(ghanaPriority);
       return [ghanaShapes, ghanaWB, ghanaPriority, ghanaCount];
        })
    .then(([ghanaShapes, ghanaWB, ghanaPriority, ghanaCount]) => {
        myBar(ghanaCount);
        })
    });