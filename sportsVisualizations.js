const radarMetrics = ["TS%", "USG%", "ORtg", "DRtg", "AST%", "TRB%"];

d3.csv("data/celtics_advanced_cleaned.csv").then((rawData) => {
    console.log("Loaded Data:", rawData);

    // Parse the data
    const cleanedData = rawData.map((d) => {
        radarMetrics.forEach((metric) => {
            d[metric] = parseFloat(d[metric]) || 0;
        });
        return d;
    });

    console.log("Data After Cleaning:", cleanedData);

    const normalizedData = normalizeData(cleanedData, radarMetrics);
    console.log("Normalized Data:", normalizedData);

    const playerData = normalizedData.map((d) => ({
        player: d.Player,
        metrics: radarMetrics.map((metric) => ({
            name: metric,
            value: d[`${metric}_normalized`] || 0,
        })),
    }));
    console.log("Processed Player Data:", playerData);

    createRadarChart("#radar-chart", playerData);
}).catch((error) => {
    console.error("Error loading or processing data:", error);
});

function normalizeData(data, metrics) {
    metrics.forEach((metric) => {
        const values = data.map((d) => d[metric]);
        const min = d3.min(values);
        const max = d3.max(values);

        console.log(`Normalizing metric: ${metric}, Min: ${min}, Max: ${max}`);

        if (min === max) {
            console.warn(`Metric ${metric} has identical min and max values. Assigning default normalized value.`);
            data.forEach((d) => (d[`${metric}_normalized`] = 0.5));
        } else {
            data.forEach((d) => {
                d[`${metric}_normalized`] = (d[metric] - min) / (max - min);
            });
        }
    });

    return data;
}

function createRadarChart(selector, playerData) {
    const width = 700;  // Increased width to accommodate legend
    const height = 500;
    const radius = Math.min(width - 200, height) / 2 - 50;
    const angleSlice = (2 * Math.PI) / radarMetrics.length;

    // Clear any existing SVG
    d3.select(selector).selectAll("svg").remove();

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${(width - 200) / 2}, ${height / 2})`);

    // Add title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -height/2 + 20)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Player Performance Metrics");

    // Enhanced grid circles with labels
    const gridGroup = svg.append("g").attr("class", "grid-group");
    const numLevels = 5;

    for (let level = 0; level <= numLevels; level++) {
        const gridRadius = (radius / numLevels) * level;

        gridGroup.append("circle")
            .attr("r", gridRadius)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "3,3")
            .style("opacity", 0.5);

        if (level > 0) {
            gridGroup.append("text")
                .attr("x", 5)
                .attr("y", -gridRadius)
                .attr("text-anchor", "start")
                .attr("font-size", "10px")
                .attr("fill", "#666")
                .text(`${(level * 20)}%`);
        }
    }

    // Enhanced axis lines and labels
    const axisGroup = svg.append("g").attr("class", "axis-group");

    radarMetrics.forEach((metric, i) => {
        const angle = i * angleSlice;
        const x = radius * Math.cos(angle - Math.PI / 2);
        const y = radius * Math.sin(angle - Math.PI / 2);

        // Axis lines
        axisGroup.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "#999")
            .attr("stroke-width", 1);

        // Enhanced metric labels
        const labelX = (radius + 20) * Math.cos(angle - Math.PI / 2);
        const labelY = (radius + 20) * Math.sin(angle - Math.PI / 2);

        axisGroup.append("text")
            .attr("x", labelX)
            .attr("y", labelY)
            .attr("dy", "0.35em")
            .attr("text-anchor", (Math.cos(angle - Math.PI / 2) < 0) ? "end" : "start")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(metric);
    });

    // Enhanced tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "#fff")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("z-index", "10");

    // Create legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${radius + 50}, ${-radius + 20})`);

    playerData.forEach((player, index) => {
        const radarGroup = svg.append("g").attr("class", "radar-group");

        const pathData = player.metrics
            .map((metric, i) => {
                const angle = i * angleSlice;
                const x = radius * metric.value * Math.cos(angle - Math.PI / 2);
                const y = radius * metric.value * Math.sin(angle - Math.PI / 2);
                return `${x},${y}`;
            })
            .join(" ");

        // Enhanced radar paths
        radarGroup.append("path")
            .attr("d", `M${pathData}Z`)
            .attr("fill", colorScale(index))
            .attr("stroke", colorScale(index))
            .attr("stroke-width", 2)
            .attr("fill-opacity", 0.3)
            .attr("stroke-opacity", 0.8)
            .style("transition", "all 0.3s ease")
            .on("mouseover", function(event) {
                d3.select(this)
                    .attr("fill-opacity", 0.5)
                    .attr("stroke-width", 3);

                tooltip.style("visibility", "visible")
                    .html(`
                        <strong>${player.player}</strong><br>
                        ${player.metrics.map(m =>
                        `${m.name}: ${(m.value * 100).toFixed(1)}%`
                    ).join("<br>")}
                    `);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill-opacity", 0.3)
                    .attr("stroke-width", 2);
                tooltip.style("visibility", "hidden");
            });

        // Add legend items
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${index * 25})`);

        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale(index))
            .attr("fill-opacity", 0.3)
            .attr("stroke", colorScale(index));

        legendItem.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .style("font-size", "12px")
            .text(player.player);
    });
}





document.addEventListener("DOMContentLoaded", () => {
    const metrics = [
        { key: "Totals_PTS", label: "Points" },
        { key: "Totals_TRB", label: "Rebounds" },
        { key: "Totals_AST", label: "Assists" },
        { key: "Totals_TOV", label: "Turnovers" }
    ];

    // Dimensions
    const margin = { top: 40, right: 20, bottom: 100, left: 100 }; 
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // SVG setup
    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Append X-axis Label
    const xLabel = svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2) // Centered horizontally
        .attr("y", height + 90) // Position below X-axis
        .attr("font-size", "14px")
        .text("Players"); // Default X-axis label

    // Append Y-axis Label
    const yLabel = svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -60) // Positioned to the left of the Y-axis
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Points"); // Default Y-axis label

    // Load the data
    d3.csv("data/celtics_finals_categorized.csv").then(data => {
        console.log("Loaded Data:", data);

        data.forEach(d => {
            metrics.forEach(metric => {
                d[metric.key] = +d[metric.key];
            });
        });

        let selectedMetric = metrics[0].key; // Default metric

        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.nan_Player))
            .range([0, width])
            .padding(0.15);

        const yScale = d3.scaleLinear().range([height, 0]);

        // Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`);

        svg.append("g")
            .attr("class", "y-axis");

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(50, 50, 50, 0.85)")
            .style("color", "#fff")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "14px");

        const barColor = "#C71585"; // Dark pink for bars
        const hoverColor = "#FFB6C1"; // Light pink for hover

        function updateChart(metricKey) {
            console.log("Selected Metric:", metricKey);

            yScale.domain([0, d3.max(data, d => d[metricKey])]);

            const bars = svg.selectAll(".bar").data(data);

            // Enter
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.nan_Player))
                .attr("width", xScale.bandwidth())
                .attr("y", d => height)
                .attr("height", 0)
                .attr("fill", barColor)
                .attr("rx", 8) // Rounded corners
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("fill", hoverColor);
                    tooltip.style("visibility", "visible")
                        .html(`
                            <strong>${d.nan_Player}</strong><br>
                            ${metrics.find(m => m.key === metricKey).label}: ${d[metricKey]}
                        `);
                })
                .on("mousemove", event => {
                    tooltip.style("top", `${event.pageY - 20}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("fill", barColor);
                    tooltip.style("visibility", "hidden");
                })
                .transition()
                .duration(1000)
                .attr("y", d => yScale(d[metricKey]))
                .attr("height", d => height - yScale(d[metricKey]));

            // Update
            bars.transition()
                .duration(1000)
                .attr("y", d => yScale(d[metricKey]))
                .attr("height", d => height - yScale(d[metricKey]));

            // Exit
            bars.exit().remove();

            // Update Axes
            svg.select(".x-axis")
                .transition()
                .duration(1000)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .attr("text-anchor", "end")
                .attr("font-size", "12px")
                .attr("fill", "#333");

            svg.select(".y-axis")
                .transition()
                .duration(1000)
                .call(yAxis)
                .selectAll("text")
                .attr("font-size", "12px")
                .attr("fill", "#333");

                
            xLabel.text("Players");
            yLabel.text(metrics.find(m => m.key === metricKey).label); 
        }

   
        updateChart(selectedMetric);

      
        d3.select("#metric-selector").on("change", function () {
            selectedMetric = d3.select(this).property("value");
            updateChart(selectedMetric);
        });
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
});


document.addEventListener("DOMContentLoaded", () => {
 
    const metrics = {
        x: "Totals_PTS",    
        y: "Shooting_FG%",  
        bubbleSize: "Totals_MP" 
    };

    // Chart Dimensions
    const margin = { top: 40, right: 40, bottom: 80, left: 100 }; 
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // SVG Setup
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const bubbleScale = d3.scaleSqrt().range([5, 20]);

    // Axes and Gridlines
    const xGrid = svg.append("g")
        .attr("class", "x-grid")
        .attr("transform", `translate(0, ${height})`);
    const yGrid = svg.append("g")
        .attr("class", "y-grid");

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis");

    const yAxis = svg.append("g")
        .attr("class", "y-axis");

    // Append X-axis Label
    const xLabel = svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 50) 
        .attr("font-size", "14px")
        .text("Total Points"); 
    // Append Y-axis Label
    const yLabel = svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -60) 
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Field Goal Percentage"); 

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "6px")
        .style("font-size", "12px");

    // Load Data
    d3.csv("data/celtics_finals_categorized.csv").then(data => {
        console.log("Loaded Data:", data);

        // Convert numeric values
        data.forEach(d => {
            Object.keys(metrics).forEach(metric => {
                d[metrics[metric]] = +d[metrics[metric]];
            });
        });

      
        function updateChart() {
            const xMetric = metrics.x;
            const yMetric = metrics.y;
            const bubbleMetric = metrics.bubbleSize;

           
            xScale.domain(d3.extent(data, d => d[xMetric]));
            yScale.domain(d3.extent(data, d => d[yMetric]));
            bubbleScale.domain(d3.extent(data, d => d[bubbleMetric]));

          
            xGrid.call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''))
                .selectAll(".tick line")
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "2,2");

            yGrid.call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
                .selectAll(".tick line")
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "2,2");

            xAxis.transition().duration(1000).call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("fill", "#333")
                .attr("font-size", "12px")
                .attr("font-weight", "bold");

            yAxis.transition().duration(1000).call(d3.axisLeft(yScale))
                .selectAll("text")
                .attr("fill", "#333")
                .attr("font-size", "12px")
                .attr("font-weight", "bold");

           
            xLabel.text(xMetric.replace("_", " ")); 
            yLabel.text(yMetric.replace("_", " ")); 

            // Update circles
            const circles = svg.selectAll(".circle").data(data);

            // Enter
            circles.enter()
                .append("circle")
                .attr("class", "circle")
                .attr("cx", d => xScale(d[xMetric]))
                .attr("cy", d => yScale(d[yMetric]))
                .attr("r", d => bubbleScale(d[bubbleMetric]))
                .attr("fill", "rgba(128, 0, 128, 0.7)") // Purple fill
                .attr("stroke", "#800080") // Darker purple stroke
                .attr("stroke-width", 1.5)
                .on("mouseover", (event, d) => {
                    tooltip.style("visibility", "visible")
                        .html(`
                            <strong>Player: ${d.nan_Player}</strong><br>
                            ${xMetric.replace("_", " ")}: ${d[xMetric]}<br>
                            ${yMetric.replace("_", " ")}: ${d[yMetric]}<br>
                            ${bubbleMetric.replace("_", " ")}: ${d[bubbleMetric]}
                        `);
                })
                .on("mousemove", event => {
                    tooltip.style("top", `${event.pageY - 20}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip.style("visibility", "hidden"));

            // Update
            circles.transition()
                .duration(1000)
                .attr("cx", d => xScale(d[xMetric]))
                .attr("cy", d => yScale(d[yMetric]))
                .attr("r", d => bubbleScale(d[bubbleMetric]));

            // Exit
            circles.exit().remove();
        }

        // Event Listeners
        d3.select("#x-axis").on("change", function () {
            metrics.x = d3.select(this).property("value");
            updateChart();
        });

        d3.select("#y-axis").on("change", function () {
            metrics.y = d3.select(this).property("value");
            updateChart();
        });

        d3.select("#bubble-size").on("change", function () {
            metrics.bubbleSize = d3.select(this).property("value");
            updateChart();
        });

        updateChart();
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
});

//Linechart

document.addEventListener("DOMContentLoaded", () => {
    let selectedMetric = "Totals_PTS"; 

    const margin = { top: 50, right: 20, bottom: 80, left: 100 }; 
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const xGrid = svg.append("g")
        .attr("class", "x-grid")
        .attr("transform", `translate(0, ${height})`);
    const yGrid = svg.append("g").attr("class", "y-grid");

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis");
    const yAxis = svg.append("g").attr("class", "y-axis");

    // Append X Axis Label
    const xLabel = svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 50) // Position below the x-axis
        .attr("font-size", "14px")
        .text("Games");

    // Append Y Axis Label
    const yLabel = svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -60) // Position to the left of the y-axis
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Points"); // Default label for "Totals_PTS"

    const line = d3.line()
        .x(d => xScale(d.Game))
        .y(d => yScale(d[selectedMetric]));

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px");

    d3.csv("data/celtics_finals_categorized.csv").then(data => {
        data.forEach((d, i) => {
            d.Game = i + 1;
            d.Totals_PTS = +d.Totals_PTS;
            d.Totals_TRB = +d.Totals_TRB;
            d.Totals_AST = +d.Totals_AST;
        });

        xScale.domain([1, data.length]);
        yScale.domain([0, d3.max(data, d => d[selectedMetric])]);

        xGrid.call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''))
            .selectAll(".tick line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2");

        yGrid.call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
            .selectAll(".tick line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "2,2");

        const path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "hotpink")
            .attr("stroke-width", 2)
            .attr("d", line);

        xAxis.call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("fill", "#333")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        yAxis.call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("fill", "#333")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        const points = svg.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.Game))
            .attr("cy", d => yScale(d[selectedMetric]))
            .attr("r", 5)
            .attr("fill", "hotpink")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`
                        <strong>Game ${d.Game}</strong><br>
                        ${selectedMetric.replace("Totals_", "")}: ${d[selectedMetric]}
                    `);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY - 20}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));

        function updateChart() {
            yScale.domain([0, d3.max(data, d => d[selectedMetric])]);

            path.transition()
                .duration(1000)
                .attr("d", line);

            points.transition()
                .duration(1000)
                .attr("cy", d => yScale(d[selectedMetric]));

            yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

            
            const yLabelText = selectedMetric.replace("Totals_", "").replace(/_/g, " ");
            yLabel.text(yLabelText);
        }

        d3.selectAll("#game-trends .controls button").on("click", function () {
            d3.selectAll("#game-trends .controls button").classed("active", false);
            d3.select(this).classed("active", true);

            selectedMetric = d3.select(this).attr("data-metric");
            updateChart();
        });
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
});


function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    } else {
        console.error(`Section with ID "${sectionId}" not found.`);
    }
}
