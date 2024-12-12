// // Get the map container dimensions
// const width = 800;
// const height = 600;
// const margin = { top: 20, right: 20, bottom: 20, left: 20 };
//
// // Simplified Boston boundary coordinates (approximate)
// const bostonBoundary = {
//     "type": "Feature",
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [[
//             [-71.1912, 42.2279],
//             [-71.1912, 42.3973],
//             [-70.9228, 42.3973],
//             [-70.9228, 42.2279],
//             [-71.1912, 42.2279]
//         ]]
//     }
// };
//
// // Boston attractions data
// const attractions = [
//     { name: "Fenway Park", lat: 42.3467, lng: -71.0972, type: "Sports" },
//     { name: "Museum of Fine Arts", lat: 42.3394, lng: -71.0940, type: "Culture" },
//     { name: "Freedom Trail", lat: 42.3588, lng: -71.0578, type: "Historical" },
//     { name: "Boston Common", lat: 42.3554, lng: -71.0660, type: "Park" },
//     { name: "New England Aquarium", lat: 42.3590, lng: -71.0490, type: "Entertainment" },
//     { name: "Faneuil Hall", lat: 42.3600, lng: -71.0562, type: "Historical" },
//     { name: "TD Garden", lat: 42.3662, lng: -71.0621, type: "Sports" },
//     { name: "USS Constitution", lat: 42.3724, lng: -71.0568, type: "Historical" }
// ];
//
// // Create SVG container
// const svg = d3.select("#map")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("viewBox", [0, 0, width, height])
//     .attr("style", "max-width: 100%; height: auto; background-color: #f0f8ff;");
//
// // Create a projection for Boston area
// const projection = d3.geoMercator()
//     .center([-71.0589, 42.3601]) // Boston coordinates
//     .scale(200000)
//     .translate([width / 2, height / 2]);
//
// // Create a path generator
// const path = d3.geoPath().projection(projection);
//
// // Draw Boston boundary
// svg.append("path")
//     .datum(bostonBoundary)
//     .attr("d", path)
//     .attr("fill", "#f0f0f0")
//     .attr("stroke", "#999")
//     .attr("stroke-width", 1);
//
// // Add water features
// svg.append("rect")
//     .attr("x", projection([-71.0700, 42.3550])[0])
//     .attr("y", projection([-71.0700, 42.3550])[1])
//     .attr("width", width/3)
//     .attr("height", height/3)
//     .attr("fill", "#b3d9ff")
//     .attr("opacity", 0.5);
//
// // Add attractions markers
// const markers = svg.selectAll("circle")
//     .data(attractions)
//     .enter()
//     .append("circle")
//     .attr("cx", d => projection([d.lng, d.lat])[0])
//     .attr("cy", d => projection([d.lng, d.lat])[1])
//     .attr("r", 8)
//     .attr("fill", d => {
//         const colors = {
//             "Sports": "#ff4242",
//             "Culture": "#4287f5",
//             "Historical": "#42f554",
//             "Park": "#42f5a7",
//             "Entertainment": "#f542f2"
//         };
//         return colors[d.type];
//     })
//     .attr("stroke", "#fff")
//     .attr("stroke-width", 2)
//     .style("cursor", "pointer");
//
// // Add tooltips
// const tooltip = d3.select("#map")
//     .append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0)
//     .style("position", "absolute")
//     .style("background-color", "white")
//     .style("padding", "10px")
//     .style("border-radius", "5px")
//     .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)");
//
// markers.on("mouseover", function(event, d) {
//     tooltip.transition()
//         .duration(200)
//         .style("opacity", .9);
//     tooltip.html(`<strong>${d.name}</strong><br/>${d.type}`)
//         .style("left", (event.pageX + 10) + "px")
//         .style("top", (event.pageY - 28) + "px");
// })
//     .on("mouseout", function() {
//         tooltip.transition()
//             .duration(500)
//             .style("opacity", 0);
//     });
//
// // Add legend
// const legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${width - 150}, 20)`);
//
// const types = ["Sports", "Culture", "Historical", "Park", "Entertainment"];
// const colors = ["#ff4242", "#4287f5", "#42f554", "#42f5a7", "#f542f2"];
//
// types.forEach((type, i) => {
//     const legendRow = legend.append("g")
//         .attr("transform", `translate(0, ${i * 20})`);
//
//     legendRow.append("circle")
//         .attr("cx", 0)
//         .attr("cy", 0)
//         .attr("r", 6)
//         .style("fill", colors[i]);
//
//     legendRow.append("text")
//         .attr("x", 10)
//         .attr("y", 4)
//         .style("font-size", "12px")
//         .text(type);
// });
//
// // Add zoom functionality
// const zoom = d3.zoom()
//     .scaleExtent([1, 8])
//     .on("zoom", (event) => {
//         svg.selectAll("path,circle")
//             .attr("transform", event.transform);
//     });

svg.call(zoom);