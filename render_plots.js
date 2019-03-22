// define dimension constants
const plot_dims = {
    map: {
        height: 550,
        margin: {
            top: 10,
            left: 10,
            right: 10,
            bottom: 10
            }
        },
    scatter: {
        height: 230,
        width: 430,
        margin: {
            top: 30,
            left: 70,
            right: 0,
            bottom: 30
        }
    }
}

// define x axis label dictionary for bar plot
const x_lab_dict = {funding: {label: "Total Project Funding", ticks: ['$0-50M', '$50-100M', '$100-150M', '$150-200M', '$200-250M', '$250-300M'] }, 
                    performance: {label: "Preformance Category", ticks: [1, 2, 3, 4, 5, 6]}}

// define color scale for performance throughout plots
var colorRange = ['#125169', '#2699D0', '#a9d9ef','#fabe7a', '#F89E37', '#b83d05'];
var color = d3.scaleOrdinal()
  .domain([6, 5, 4, 3, 2, 1])
  .range(colorRange);

// define gradient color scale for funding bars in bar plot 
var gradientRange = ['#11445c','#1d749e', '#2699D0', '#52b1df', '#94cfeb', '#d6edf8']
var gradient = d3.scaleOrdinal()
   .domain([6, 5, 4, 3, 2, 1])
   .range(gradientRange);

//render plots
document.addEventListener('DOMContentLoaded', () => {
    Promise.all(['./ghana_2.geojson',
    './ghana_wb.geojson', './d3_ghana_priority.json',
    './d3_ghana_perf_count.json', './d3_ghana_fund_count.json'
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