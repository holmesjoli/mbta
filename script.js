//Title Unique Array
//Description the unique value of a variable from the data
//Return array
function unique_array(data, variable) {

    const u = [];

    data.forEach(function(d) {
        if (u.indexOf(d[variable]) === -1) {
            u.push(d[variable]);
        }
    });

    return u;
};

//Title tooltip past
function ttPast(svg, tooltip, points) {

    svg.selectAll("circle").on("mouseover", function(e, d) {

        let cx = +d3.select(this).attr("cx")+20;
        let cy = +d3.select(this).attr("cy")-10;

        tooltip.style("visibility","visible") 
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>${d.name}</b><br>`);

        points.attr("stroke-opacity", 0.5);

        d3.select(this)
            .attr("fill", "#000000")
            .attr("r", 5)
            .attr("stroke-opacity", 1);

    }).on("mouseout", function() {

        tooltip.style("visibility","hidden");

        d3.select(this)
            .attr("fill", "#000000")
            .attr("r", 2);

        points.attr("stroke-opacity", 1);
    });
};

//Title tooltip present
function ttPresent(svg, tooltip, points) {

    svg.selectAll("circle").on("mouseover", function(e, d) {

        let cx = +d3.select(this).attr("cx")+20;
        let cy = +d3.select(this).attr("cy")-10;

        tooltip.style("visibility","visible") 
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>${d.name}</b><br>`);

        points.attr("stroke-opacity", 0.5);

        d3.select(this)
            .attr("fill", "grey")
            .attr("stroke", "#000000")
            .attr("stroke-weight", 2)
            .attr("stroke-opacity", 1);

    }).on("mouseout", function() {

        tooltip.style("visibility","hidden");

        d3.select(this)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", 1);

        points.attr("stroke-opacity", 1);
            
    });
};

// Generate the grouped color scale for the map/
function groupedColorScale(data, group) {

    const uniqueGroup = unique_array(data, group);    
    const lineColors = [];

    uniqueGroup.forEach(function(d) {
        z = data.filter(function(i) {
            return i[group] === d;
        });

        line = unique_array(z, "LINE")[0]
        
        if (line === "GREEN") {
            lineColors.push("#018447");
        } else if (line === "RED") {
            lineColors.push("#E12D27");
        } else if (line === "ORANGE") {
            lineColors.push("#E87200")
        } else if (line === "BLUE") {
            lineColors.push("#2F5DA6")
        }
    });

    return {uniqueGroup: uniqueGroup,
            lineColors: lineColors};
};

let pth = "./data/processed/";

let trainLines = [
            {line: "Green", color: "#018447"},
            {line: "Red", color: "#E12D27"},
            {line: "Orange", color: "#E87200"},
            {line: "Blue", color: "#2F5DA6"}
]

d3.csv(pth + "beck_lines2.csv").then(function(beckLinks) {
    d3.json(pth + "stations2.json").then(function(nodes) {
        d3.csv(pth + "station_connections2.csv").then(function(geoLinks) {

            //Define constants
            const height = window.innerHeight;
            const width = height*1.3;
            const margin = {top: 25, left: 75, right: 100, bottom: 25};

            const beck = {
                xmax: d3.max(nodes, function(d) {return d.beck_x;}),
                xmin: d3.min(nodes, function(d) {return d.beck_x;}),
                ymax: d3.max(nodes, function(d) {return d.beck_y;}),
                ymin: d3.min(nodes, function(d) {return d.beck_y;})
            }

            const geo = {
                xmax: d3.max(nodes, function(d) {return d.geo_x;}),
                xmin: d3.min(nodes, function(d) {return d.geo_x;}),
                ymax: d3.max(nodes, function(d) {return d.geo_y;}),
                ymin: d3.min(nodes, function(d) {return d.geo_y;})
            }

            const groupingVar = "line";

            // Generate the lines groups for the map and diagram
            const geoLineGroup = d3.groups(geoLinks, d => d[groupingVar]);
            const beckLineGroup = d3.groups(beckLinks, d => d[groupingVar]);

            // Define scales
            let yScale = d3.scaleLinear()
                .domain([geo.ymin, geo.ymax])
                .range([height-margin.bottom, margin.top]);

            let xScale = d3.scaleLinear()
                .domain([geo.xmin, geo.xmax])
                .range([margin.left, width - margin.right]);

            // Generate the grouped color scale for the map
            let g = groupedColorScale(geoLinks, groupingVar);

            let colorScale = d3.scaleOrdinal()
            .domain(g["uniqueGroup"])
            .range(g["lineColors"]);

            console.log(g["uniqueGroup"]);
            console.log(g["lineColors"]);

            let terminalScale = d3.scaleOrdinal()
            .domain(["terminal", "not-terminal"])
            .range([10, 5]);

            let lineScale = d3.scaleOrdinal()
            .domain(["place-lake", "place-clmnl", "place-river", "place-hsmnl"])
            .range(["B", "C", "D", "E"])

            // Define SVG Canvas and attributes

            let svg = d3.select("#chart")
                        .append("svg")
                        .attr("height", height)
                        .attr("width", width);

            // Add the line
            let line = d3.line()
            .x(function(d) { return xScale(+d.x); })
            .y(function(d) { return yScale(+d.y); });

            svg.selectAll(".line")
            .data(geoLineGroup)
            .join("path")
                .attr("fill", "none")
                .attr("stroke", function(d){ return colorScale(d[0]);})
                .attr("stroke-width", 5)
                .attr("d", function(d) { return line(d[1]); });

            // Add the points
            let points = svg.selectAll('circle')
                        .data(nodes)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {return xScale(d.geo_x);})
                        .attr("cy", function(d) {return yScale(d.geo_y);})
                        .attr("r", 2)
                        .attr("fill", "black")
                        .attr("stroke", "black")
                        .attr("stroke-width", 1);

            // Add the tooltip
            let tooltip = d3.select("#chart")
                        .append("div")
                        .attr("class", "tooltip");

            ttPast(svg, tooltip, points);

            // Annotations
            let data = nodes.filter(function(d) {
                return d.id === "place-lake" || d.id === "place-clmnl" || d.id === "place-river" || d.id === "place-hsmnl";
            })

            let ann = svg
                .selectAll("text")
                .data(data)
                .enter()
                .append("text")
                .attr("x", function(d) {return xScale(d.geo_x) - 20;})
                .attr("y", function (d) {return yScale(d.geo_y) + 9;})
                .attr("fill", "black")
                .style("font-weight", "bold")
                .text(function(d) {return lineScale(d.id);});

            // Add legend

            svg.selectAll("trainLegend")
            .data(trainLines)
            .enter()
            .append("rect")
                .attr("width", 30)
                .attr("height", 7)
                .attr("x", 25)
                .attr("y", function(d, i) {return 30*i + 40;})
                .attr("fill", function(d) {return d.color});

            svg.selectAll("trainLegend-text")
                .data(trainLines)
                .enter()
                .append("text")
                .attr("x", 65)
                .attr("y", function(d, i) {return 30*i + 48;})
                .text(function(d) {return d.line;})
                .style("font-weight", "bold");

            // Chart transitions
            d3.select("#diagram").on("click", function() {

                xScale.domain([beck.xmin, beck.xmax]);
                yScale.domain([beck.ymin, beck.ymax]);
                yScale.range([margin.top, height-margin.bottom]);

                u = svg.selectAll("path")
                .data(beckLineGroup, function(d) {return d[0];})

                u.enter().append("path")
                    .attr("opacity", 0)
                .merge(u)   
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("stroke-width", 10)
                    .attr("opacity", 1)
                    .attrTween('d', function (d) {
                        var previous = d3.select(this).attr('d');
                        var current = line(d[1]);
                        return d3.interpolatePath(previous, current);
                    });

                u.exit()
                .transition()
                .duration(1500)
                .remove();

                points
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("r", function(d) {return terminalScale(d.terminal);})
                    .attr("fill", "white")
                    .attr("cx", function(d) { return xScale(d.beck_x); })
                    .attr("cy", function(d) { return yScale(d.beck_y); })
                    .attr("stroke", function(d) {return colorScale(d.line);});

                ann
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("x", function(d) {return xScale(d.beck_x) - 6;})
                    .attr("y", function(d) {return yScale(d.beck_y) + 6;});

                d3.select("#diagram").attr("class", "active");
                document.getElementById("map").classList.remove("active");

                ttPresent(svg, tooltip, points);
            });

            d3.select("#map").on("click", function() {
                xScale.domain([geo.xmin, geo.xmax]);
                yScale.domain([geo.ymin, geo.ymax]);
                yScale.range([height-margin.bottom, margin.top])

                u = svg.selectAll("path")
                .data(geoLineGroup, function(d) {return d[0];})

                u.enter().append("path")
                    .attr("opacity", 0)
                .merge(u)   
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("stroke-width", 5)
                    .attr("opacity", 1)
                    .attrTween('d', function (d) {
                        var previous = d3.select(this).attr('d');
                        var current = line(d[1]);
                        return d3.interpolatePath(previous, current);
                    });

                u.exit()
                .transition()
                .duration(1500)
                .remove();

                points
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("r", 2)
                    .attr("fill", "black")
                    .attr("stroke", "black")
                    .attr("cx", function(d) { return xScale(d.geo_x);})
                    .attr("cy", function(d) { return yScale(d.geo_y);});

                ann
                    .transition()
                    .duration(1500)
                    .delay(250)
                    .attr("x", function(d) {return xScale(d.geo_x) - 20;})
                    .attr("y", function(d) {return yScale(d.geo_y) + 9;});

                document.getElementById("diagram").classList.remove("active");
                d3.select("#map").attr("class", "active");

                ttPast(svg, tooltip, points);
            });
        });
    });
});
