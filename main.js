const routesPath = "data/Rapid_Transit_Routes.geojson";
const stopsPath = "data/Rapid_Transit_Stops.geojson";
const accuracyPath = "data/rapid_transit_and_bus_prediction_accuracy_data.csv";

const highlightColor = "#e8ca84";

const minZoom = 1;
const maxZoom = 4;
let currentZoom = 1;

function toPastel(hexColor) {
    const color = d3.color(hexColor);
    if (!color) return "gray";
    color.opacity = 0.7;
    return color.toString();
}

const mapWidth = 1100, mapHeight = 800;
const svg = d3.select("#map").append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

svg.append("defs")
    .append("clipPath")
    .attr("id", "map-clip")
    .append("rect")
    .attr("width", mapWidth)
    .attr("height", mapHeight * 0.9);

//zoom
const zoom = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([[0, 0], [mapWidth, mapHeight]]) //constrain
    .extent([[0, 0], [mapWidth, mapHeight]])
    .on('zoom', handleZoom);

//group for zoom
const zoomGroup = svg.append("g")
    .attr("class", "zoom-group")
    .attr("clip-path", "url(#map-clip)");

const zoomControl = svg.append("g")
    .attr("class", "zoom-control")
    .attr("transform", `translate(20, 20)`);

zoomControl.append("rect")
    .attr("width", 150)
    .attr("height", 40)
    .attr("fill", "#091F2F")
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("opacity", 0.9);

const zoomSlider = zoomControl.append("g")
    .attr("transform", "translate(30, 20)");

zoomSlider.append("line")
    .attr("x1", 0)
    .attr("x2", 100)
    .attr("stroke", "white")
    .attr("stroke-width", 2);

const sliderHandle = zoomSlider.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .attr("fill", "white")
    .call(d3.drag()
        .on("drag", function(event) {
            const x = Math.max(0, Math.min(100, event.x));
            d3.select(this).attr("cx", x);
            const newZoom = minZoom + (x/100) * (maxZoom - minZoom);
            zoomTo(newZoom);
        }));

zoomControl.append("text")
    .attr("x", 10)
    .attr("y", 25)
    .attr("fill", "white")
    .attr("font-size", "12px")
    .text("-");

zoomControl.append("text")
    .attr("x", 140)
    .attr("y", 25)
    .attr("fill", "white")
    .attr("font-size", "12px")
    .text("+");

function handleZoom(event) {
    zoomGroup.attr("transform", event.transform);
    currentZoom = event.transform.k;
    updateSliderPosition(currentZoom);
}

function zoomTo(scale) {
    const mapCenter = [mapWidth/2.25, mapHeight/3.25];
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
            .translate(mapCenter[0], mapCenter[1])
            .scale(scale)
            .translate(-mapCenter[0], -mapCenter[1]));
}

function zoomToPoint(x, y, scale) {
    // Calculate bounded coordinates
    const dx = x * scale - mapWidth/2;
    const dy = y * scale - mapHeight/2;

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
            .translate(-dx, -dy)
            .scale(scale));
}

function updateSliderPosition(scale) {
    const x = ((scale - minZoom) / (maxZoom - minZoom)) * 100;
    sliderHandle.attr("cx", x);
}

//call zoom
svg.call(zoom);

const projection = d3.geoMercator()
    .center([-71.07, 42.36])
    .scale(mapWidth * 105)
    .translate([mapWidth/2.25, mapHeight/3.25]);

const path = d3.geoPath().projection(projection);

//tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0, 0, 0, 0.75)")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("font-size", "12px");

let routeColors = {};

zoomGroup.append("rect")
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("width", mapWidth)
    .attr("height", mapHeight * 0.9)
    .attr("fill", "#cbd5cb");



const waterFeatures = zoomGroup.append("g")
    .attr("class", "water-features");

//charles river
waterFeatures.append("path")
    .attr("d", `
        M ${projection([-71.13, 42.35])[0]},${projection([-71.13, 42.35])[1]}
        Q ${projection([-71.1, 42.36])[0]},${projection([-71.1, 42.36])[1]}
        ${projection([-71.07, 42.37])[0]},${projection([-71.07, 42.37])[1]}
        Q ${projection([-71.05, 42.37])[0]},${projection([-71.05, 42.37])[1]}
        ${projection([-71.03, 42.36])[0]},${projection([-71.03, 42.36])[1]}
    `)
    .attr("fill", "none")
    .attr("stroke", "#84a7e3")
    .attr("stroke-width", 25)
    .attr("opacity", 0.6);

//boston harbor
waterFeatures.append("path")
    .attr("d", `
        M ${projection([-71.03, 42.36])[0]},${projection([-71.03, 42.36])[1]}
        L ${projection([-71.01, 42.35])[0]},${projection([-71.01, 42.35])[1]}
        Q ${projection([-71.02, 42.33])[0]},${projection([-71.02, 42.33])[1]}
        ${projection([-71.05, 42.32])[0]},${projection([-71.05, 42.32])[1]}
        L ${projection([-71.07, 42.31])[0]},${projection([-71.07, 42.31])[1]}
    `)
    .attr("fill", "#84a7e3")
    .attr("opacity", 0.6);

waterFeatures.append("path")
    .attr("d", `
        M ${projection([-71.035, 42.31])[0]},${projection([-70, 42.3])[1]}
        L ${projection([-71.01, 42.35])[0]},${projection([-71.01, 42.35])[1]}
        L ${mapWidth },${projection([-71.01, 42.89])[1]}
        L ${mapWidth},${projection([-71.01, 42.1])[1] + 300}  // Bottom right (from old rectangle)
    `)
    .attr("fill", "#84a7e3")
    .attr("opacity", 0.6);


//labels
waterFeatures.append("text")
    .attr("x", projection([-71.08, 42.37])[0] - 120)
    .attr("y", projection([-71.08, 42.37])[1] + 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .style("font-size", "12px")
    .text("Charles River");

waterFeatures.append("text")
    .attr("x", projection([-71.03, 42.33])[0] + 70)
    .attr("y", projection([-71.03, 42.33])[1] - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .style("font-size", "12px")
    .text("Boston Harbor");

//boston border
const bostonBorder = zoomGroup.append("g")
    .attr("class", "boston-border");

bostonBorder.append("path")
    .attr("d", `
        M ${projection([-71.17, 42.35])[0]},${projection([-71.17, 42.35])[1]}
        Q ${projection([-71.13, 42.38])[0]},${projection([-71.13, 42.38])[1]}
        ${projection([-71.08, 42.40])[0]},${projection([-71.08, 42.40])[1]}
        Q ${projection([-71.03, 42.39])[0]},${projection([-71.03, 42.39])[1]}
        ${projection([-71.01, 42.36])[0]},${projection([-71.01, 42.36])[1]}
        L ${projection([-71.02, 42.33])[0]},${projection([-71.02, 42.33])[1]}
        L ${projection([-71.04, 42.31])[0]},${projection([-71.04, 42.31])[1]}
        L ${projection([-71.06, 42.30])[0]},${projection([-71.06, 42.30])[1]}
        L ${projection([-71.09, 42.29])[0]},${projection([-71.09, 42.29])[1]}
        L ${projection([-71.12, 42.31])[0]},${projection([-71.12, 42.31])[1]}
        L ${projection([-71.15, 42.33])[0]},${projection([-71.15, 42.33])[1]}
        Z
    `)
    .attr("fill", "none")
    .attr("stroke", "#666666")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.6);

bostonBorder.append("text")
    .attr("x", projection([-71.08, 42.34])[0] - 10)
    .attr("y", projection([-71.08, 42.34])[1] + 100)
    .attr("text-anchor", "middle")
    .attr("fill", "#666666")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Boston");

let routesGroup = zoomGroup.append("g");

d3.json(routesPath).then(routesData => {
    routesData.features.forEach(route => {
        routeColors[route.properties.route_id] = toPastel(`#${route.properties.route_color}`);
    });

    routesGroup.selectAll("path")
        .data(routesData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", d => routeColors[d.properties.route_id] || "gray")
        .attr("stroke-width", 13)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("class", d => `route ${d.properties.route_id}`)
        .style("opacity", 0.8);

    loadStops();
}).catch(error => console.error("Error loading routes:", error));


function loadStops() {
    Promise.all([
        d3.json(stopsPath),
        d3.json(routesPath)
    ]).then(([stopsData, routesData]) => {
        //colors
        const routeIdToColor = {};
        routesData.features.forEach(route => {
            routeIdToColor[route.properties.route_id] = toPastel(`#${route.properties.route_color}`);
        });

        //filter
        const filteredStops = stopsData.features.filter(stop => {
            return stop.geometry &&
                stop.geometry.coordinates &&
                !isNaN(stop.geometry.coordinates[0]) &&
                !isNaN(stop.geometry.coordinates[1]) &&
                stop.properties &&
                stop.properties.stop_name;
        });

        //find nearest routes
        function findNearestRoutes(stopCoords) {
            const nearbyRoutes = [];
            const threshold = 0.005;

            routesData.features.forEach(route => {
                if (route.geometry.coordinates && Array.isArray(route.geometry.coordinates)) {
                    let coordinates = route.geometry.coordinates;
                    if (route.geometry.type === "MultiLineString") {
                        coordinates = coordinates.flat();
                    }

                    for (let i = 0; i < coordinates.length - 1; i++) {
                        const lineStart = coordinates[i];
                        const lineEnd = coordinates[i + 1];

                        const distance = pointToLineDistance(
                            stopCoords,
                            lineStart,
                            lineEnd
                        );

                        if (distance < threshold) {
                            nearbyRoutes.push(route.properties.route_id);
                        }
                    }
                }
            });

            return [...new Set(nearbyRoutes)];
        }

        //distance
        function pointToLineDistance(point, lineStart, lineEnd) {
            const x = point[0];
            const y = point[1];
            const x1 = lineStart[0];
            const y1 = lineStart[1];
            const x2 = lineEnd[0];
            const y2 = lineEnd[1];

            const A = x - x1;
            const B = y - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;

            if (lenSq !== 0) {
                param = dot / lenSq;
            }

            let xx, yy;

            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }

            const dx = x - xx;
            const dy = y - yy;

            return Math.sqrt(dx * dx + dy * dy);
        }

        //determine color
        function getStopColor(stopCoords) {
            const nearbyRoutes = findNearestRoutes(stopCoords);

            if (nearbyRoutes.length === 0) return "gray";
            const allGreenLine = nearbyRoutes.every(route => route.startsWith('Green'));
            if (allGreenLine && nearbyRoutes.length > 1) {
                return "#334a33"; //overlapping stops
            }

            //check if they are in dif lines
            const uniqueLines = new Set(nearbyRoutes.map(route => {
                return route.startsWith('Green') ? 'Green' : route;
            }));

            if (uniqueLines.size > 1) {
                return "black";
            }

            return routeIdToColor[nearbyRoutes[0]] || "gray";
        }

        //add stops
        const stopsGroup = zoomGroup.append("g").attr("class", "stops-group");

        stopsGroup.selectAll("circle")
            .data(filteredStops)
            .enter()
            .append("circle")
            .attr("cx", d => projection(d.geometry.coordinates)[0])
            .attr("cy", d => projection(d.geometry.coordinates)[1])
            .attr("r", 3.5)
            .attr("fill", d => getStopColor(d.geometry.coordinates))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("class", d => `stop ${d.properties.stop_id}`)
            .on("mouseover", function (event, d) {
                // Highlight the stop
                d3.select(this).attr("r", 8);

                // Display tooltip
                tooltip.style("visibility", "visible")
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`)
                    .html(`
                        <strong>${d.properties.stop_name}</strong><br>
                        Municipality: ${d.properties.municipality || "N/A"}<br>
                       `);
            })
            .on("mouseout", function () {
                // Reset stop appearance
                d3.select(this).attr("r", 4);

                //hide tooltop
                tooltip.style("visibility", "hidden");
            })
            .on("click", function (event, d) {
                event.stopPropagation();

                //zoom to clicked
                const coords = projection(d.geometry.coordinates);
                zoomToPoint(coords[0], coords[1], 3);
            });
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}


function zoomToPoint(x, y, scale) {
    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity.translate(mapWidth / 2 - x * scale, mapHeight / 2 - y * scale).scale(scale)
        );
}


function highlightRoute(routeId) {
    d3.selectAll(".route")
        .attr("stroke", d => routeColors[d.properties.route_id] || "gray")
        //.attr("stroke-width", 8)
        //.style("filter", "blur(2px)")
        .style("opacity", 0.8);

    d3.selectAll(".stop")
        .attr("r", 4);

    if (routeId) {
        d3.selectAll(`.route.${routeId}`)
            .attr("stroke", highlightColor)
            //.attr("stroke-width", 14)
            //.style("filter", "blur(1px)")
            .style("opacity", 1);

        d3.selectAll(`.stop.${routeId}`)
            .attr("r", 4);
    }
}

function addMapLegend() {
    const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${mapWidth * 0.02}, ${mapHeight * 0.55})`);

    legendGroup.append("rect")
        .attr("width", mapWidth * 0.18)
        .attr("height", mapHeight * 0.18)
        .attr("fill", "#091F2F")
        .attr("rx", 10)
        .attr("ry", 10)
        .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))")
        .attr("opacity", 0.9);

    legendGroup.append("text")
        .attr("x", mapWidth * 0.09)  // Center of legend width
        .attr("y", mapHeight * 0.03)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .style("font-size", `${Math.min(mapWidth, mapHeight) * 0.017}px`)  //responsive font
        .style("font-weight", "bold")
        .text("Station Types");

    const legendItems = [
        { color: "black", label: "Transfer Station" },
        { color: "#334a33", label: "Green Line Transfer" },
        { color: "rgba(255,255,255,0.76)", label: "Single Line Station" }
    ];

    legendItems.forEach((item, i) => {
        const itemGroup = legendGroup.append("g")
            .attr("transform", `translate(${mapWidth * 0.02}, ${mapHeight * (0.06 + i * 0.03)})`);

        itemGroup.append("circle")
            .attr("r", Math.min(mapWidth, mapHeight) * 0.008)  //change cirlce size
            .attr("fill", item.color)
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);

        itemGroup.append("text")
            .attr("x", mapWidth * 0.015)
            .attr("y", mapHeight * 0.005)
            .style("font-size", `${Math.min(mapWidth, mapHeight) * 0.015}px`)
            .style("fill", "white")
            .text(item.label);
    });

    // update hover text position
    legendGroup.append("text")
        .attr("x", mapWidth * 0.09)
        .attr("y", mapHeight * 0.15)
        .attr("text-anchor", "middle")
        .style("font-size", `${Math.min(mapWidth, mapHeight) * 0.012}px`)
        .style("font-style", "italic")
        .style("fill", "#ffffff")
        .text("Hover over stations for details");
}

addMapLegend();
createAccuracyPlot();

const plotGroup = svg.append("g")
    .attr("class", "accuracy-plot")
    .attr("transform", `translate(${mapWidth * 0.73}, ${mapHeight * 0.05})`);

plotGroup.append("rect")
    .attr("width", mapWidth * 0.25)
    .attr("height", mapHeight * 0.55)
    .attr("fill", "#091F2F")
    .attr("rx", 10)
    .attr("ry", 10)
    .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))");

plotGroup.append("text")
    .attr("x", 100)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Transit Line Reliability");

function createAccuracyPlot() {
    d3.csv(accuracyPath).then(data => {
        const accuracyData = d3.group(data, d => d.route_id);

        const processedData = Array.from(accuracyData, ([route, values]) => {
            const totalPredictions = d3.sum(values, d => parseInt(d.num_predictions) || 0);
            const accuratePredictions = d3.sum(values, d => parseInt(d.num_accurate_predictions) || 0);
            return {
                line: route || "Unknown",
                accuracy: totalPredictions > 0 ? (accuratePredictions / totalPredictions * 100) : 0
            };
        }).filter(d => d.line !== "" && d.line !== "Unknown" && d.line !== "bus");

        processedData.sort((a, b) => b.accuracy - a.accuracy);

        const y = d3.scaleLinear()
            .domain([65, 95])
            .range([mapHeight * 0.5, mapHeight * 0.08]);

        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => d + "%");

        plotGroup.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${mapWidth * 0.08}, 0)`)
            .call(yAxis)
            .style("color", "white")
            .style("font-size", `${Math.min(mapWidth, mapHeight) * 0.015}px`);

        plotGroup.select("text")
            .attr("x", mapWidth * 0.125)
            .attr("y", mapHeight * 0.04);

        function getXOffset(i) {
            return mapWidth * 0.1;
        }

        const dotsGroup = plotGroup.append("g")
            .attr("class", "dots-group");

        dotsGroup.selectAll(".accuracy-dot")
            .data(processedData)
            .enter()
            .append("circle")
            .attr("class", d => `accuracy-dot ${d.line}`)
            .attr("cx", (d, i) => getXOffset(i))
            .attr("cy", d => y(d.accuracy))
            .attr("r", 8)
            .attr("fill", d => {
                const color = d3.color(routeColors[d.line] || "#666");
                color.opacity = 1;
                return color;
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)
            .on("mouseover", function(event, d) {
                highlightRoute(d.line);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 6)
                    .attr("r", 8)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2.5)
                    .attr("fill", () => {
                        const color = d3.color(routeColors[d.line] || "#666");
                        color.opacity = 1;
                        return color;})


                tooltip.style("visibility", "visible")
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px")
                    .html(`<strong>${d.line}</strong><br>Reliability: ${d.accuracy.toFixed(1)}%`);
            })
            .on("mouseout", function(event, d) {
                highlightRoute(null);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2.5)
                    .attr("fill", () => {
                        const color = d3.color(routeColors[d.line] || "#666");
                        color.opacity = 1;
                        return color;
                    });


                tooltip.style("visibility", "hidden");
            })
            .on("click", function(event, d) {
                event.stopPropagation();
                const isSelected = d3.select(this).classed("selected");

                dotsGroup.selectAll("circle")
                    .classed("selected", false)
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .attr("fill", d => {
                        const color = d3.color(routeColors[d.line] || "#666");
                        color.opacity = 1;
                        return color;
                    })
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);

                if (!isSelected) {
                    d3.select(this)
                        .classed("selected", true)
                        .transition()
                        .duration(200)
                        .attr("r", 6)
                        .attr("fill", "white")
                        .attr("stroke", d => routeColors[d.line] || "#666")
                        .attr("stroke-width", 2);
                    highlightRoute(d.line);
                } else {
                    highlightRoute(null);
                }
            });

        //labels
        dotsGroup.selectAll(".accuracy-label")
            .data(processedData)
            .enter()
            .append("text")
            .attr("class", "accuracy-label")
            .attr("x", (d, i) => getXOffset(i) + 15)
            .attr("y", d => y(d.accuracy))
            .attr("dy", "0.35em")
            .attr("fill", "white")
            .text(d => d.line)
            .style("font-size", "14px");
    }).catch(error => console.error("Error loading accuracy data:", error));
}


function createCircularRidershipChart() {
    const width = 650;
    const height = 650;
    const radius = Math.min(width, height) / 2;

    const container = d3.select("#neighborhood-heatmap")
        .style("display", "flex")
        .style("align-items", "start")
        .style("gap", "20px");

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const description = container.append("div")
        .style("width", "400px")
        .style("background", "#091F2F")
        .style("padding", "20px")
        .style("border-radius", "30px")
        .style("color", "white");

    description.append("h3")
        .style("margin", "0 0 15px 0")
        .style("color", "white")
        .text("MBTA Station Activity");

    description.append("p")
        .style("font-size", "14px")
        .style("line-height", "1.5")
        .style("margin-bottom", "20px")
        .text("Explore passenger flows throughout the MBTA network in this interactive display. The visualization features a dual-ring structure - transit routes form the interior circle, with their corresponding stations arranged in the exterior ring.");
    description.append("p")
        .style("font-size", "14px")
        .style("line-height", "1.5")
        .style("margin-bottom", "20px")
        .text("Each station's arc length corresponds to its combined daily ridership volume, calculated as the sum of passengers entering and exiting the station.");
    description.append("p")
        .style("font-size", "14px")
        .style("font-style", "italic")
        .text("For specific passenger counts and station details, move your cursor over any station segment.");

    svg.append("circle")
        .attr("r", radius)
        .attr("fill", "#091F2F")
        .attr("opacity", 0.9);

    const lineColors = {
        "Red": "#aa2016",
        "Blue": "#003da5",
        "Orange": "#ed8b00",
        "Green": "#00843d",
        "Mattapan": "#da291c"
    };

    d3.csv("data/Rail_Ridership_by_Season_Time_Period_RouteLine_and_Stop.csv").then(data => {
        const processedData = d3.rollup(data,
            v => ({
                total_ons: d3.sum(v, d => +d.total_ons),
                total_offs: d3.sum(v, d => +d.total_offs),
                avg_flow: d3.mean(v, d => +d.average_flow)
            }),
            d => d.route_id,
            d => d.stop_name
        );

        // convert to heirarchy
        const hierarchyData = {
            name: "root",
            children: Array.from(processedData, ([line, stops]) => ({
                name: line,
                children: Array.from(stops, ([stop, values]) => ({
                    name: stop,
                    value: values.total_ons + values.total_offs,
                    details: values
                }))
                    .filter(stop => stop.value > 10000)
            }))
        };

        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        const root = partition(d3.hierarchy(hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.85)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px");

        const segments = svg.selectAll("g")
            .data(root.descendants().filter(d => d.depth))
            .join("g");

        segments.append("path")
            .attr("d", arc)
            .attr("fill", d => {
                if (d.depth === 1) return lineColors[d.data.name] || "#666";
                return d3.color(lineColors[d.parent.data.name] || "#666").brighter(0.5);
            })
            .style("opacity", 0.8)
            .style("stroke", "white")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke-width", 2);

                if (d.depth === 2) {
                    tooltip.style("visibility", "visible")
                        .html(`
                            <strong>${d.data.name}</strong><br>
                            Line: ${d.parent.data.name}<br>
                            Daily Boardings: ${d3.format(",")(Math.round(d.data.details.total_ons/77))}<br>
                            Daily Alightings: ${d3.format(",")(Math.round(d.data.details.total_offs/77))}<br>
                            Average Flow: ${d3.format(",")(Math.round(d.data.details.avg_flow))}
                        `)
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                }
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("opacity", 0.8)
                    .style("stroke-width", 0.5);
                tooltip.style("visibility", "hidden");
            });
        //labels
        segments.append("text")
            .attr("transform", d => {
                const x = arc.centroid(d)[0];
                const y = arc.centroid(d)[1];
                let rotation = (d.x0 + d.x1) / 2 * 180 / Math.PI - 90;

                if (d.data.name === "Green" || d.data.name === "Blue" ||
                    (d.parent && (d.parent.data.name === "Green" || d.parent.data.name === "Blue"))) {
                    rotation = rotation + 180;
                }

                return `translate(${x},${y}) rotate(${rotation})`;
            })
            .attr("dy", d => {
                if (d.data.name === "Green" || d.data.name === "Blue" ||
                    (d.parent && (d.parent.data.name === "Green" || d.parent.data.name === "Blue"))) {
                    return "-0.35em";
                }
                return "0.35em";
            })
            .attr("text-anchor", "middle")
            .style("font-size", d => d.depth === 1 ? "14px" : "10px")
            .style("fill", "white")
            .style("pointer-events", "none")
            .style("opacity", d => {
                const arcLength = d.x1 - d.x0;
                return arcLength > 0.1 ? 1 : 0;
            })
            .text(d => {
                if (d.depth === 1) return d.data.name;
                const arcLength = d.x1 - d.x0;
                if (arcLength < 0.2) {
                    return d.data.name.split(' ')[0];
                }
                return d.data.name;
            });

        //center circle
        const totalRidership = d3.sum(root.leaves(), d => d.value);

        svg.append("circle")
            .attr("r", radius * 0.15)
            .attr("fill", "#091F2F")
            .attr("stroke", "white");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("y", -10)
            .style("font-size", "14px")
            .text("Total Daily");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("y", 20)
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`${d3.format(",")(Math.round(totalRidership/77))} riders`);

        //interactive legen
        description.append("div")
            .style("margin-top", "30px")
            .style("padding-top", "15px")
            .style("border-top", "1px solid rgba(255,255,255,0.2)")
            .selectAll("div")
            .data(Object.entries(lineColors))
            .join("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "10px")
            .style("cursor", "pointer")
            .style("padding", "4px")
            .each(function([line, color]) {
                const div = d3.select(this);
                div.append("div")
                    .style("width", "12px")
                    .style("height", "12px")
                    .style("border-radius", "50%")
                    .style("background", color)
                    .style("margin-right", "8px");
                div.append("span")
                    .text(line);
            })
            .on("mouseover", function(event, [line, color]) {
                //dim
                segments.selectAll("path")
                    .style("opacity", 0.2);

                //highlight
                segments.selectAll("path")
                    .filter(d => d.data.name === line || (d.parent && d.parent.data.name === line))
                    .style("opacity", 1)
                    .style("stroke-width", 2);

                d3.select(this)
                    .style("background", "rgba(255,255,255,0.1)")
                    .style("border-radius", "4px");
            })
            .on("mouseout", function() {
                //reset
                segments.selectAll("path")
                    .style("opacity", 0.8)
                    .style("stroke-width", 0.5);

                d3.select(this)
                    .style("background", "none");
            });
    });
}


createCircularRidershipChart();







