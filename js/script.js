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
            .attr("fill", "grey")
            .attr("r", 4)
            .attr("stroke-opacity", 1);

    }).on("mouseout", function() {

        tooltip.style("visibility","hidden");

        d3.select(this)
            .attr("fill", "#000000")
            .attr("r", 1);

        points.attr("stroke-opacity", 1);
    });
};

//Title tooltip present
function ttPresent(svg, tooltip, points, beckColorScale) {

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

        points
            .attr("stroke-opacity", 1)
            .attr("stroke", function(d) {return beckColorScale(d.line);});
            
    });
};

const pth = "./data/processed/";

const trainLines = [
            {line: "Green", beckColor: "#018447", geoColor: "#87c65b"},
            {line: "Red", beckColor: "#E12D27", geoColor: "#ef4850"},
            {line: "Orange", beckColor: "#E87200", geoColor: "#f57f4a"},
            {line: "Blue", beckColor: "#2F5DA6", geoColor: "#70c2d6"}
];

const titleData = [
            {geo: "Massachusetts", beck: "Massachusetts Bay"},
            {geo: "Bay", beck: "Transportation Authority"},
            {geo: "Trans", beck: "Rapid Transit/"},
            {geo: "Authority", beck: "Key Bus Routes Map"}
];

d3.csv(pth + "beck_lines2.csv").then(function(beckLinks) {
    d3.json(pth + "stations2.json").then(function(nodes) {
        d3.csv(pth + "station_connections2.csv").then(function(geoLinks) {
            d3.xml('./images/mbtaIcon.svg').then(function(mbtaIcon) {

                //Define constants
                const height = window.innerHeight;
                const width = height*1.3;
                const margin = {top: 100, left: 75, right: 100, bottom: 25};

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

                const railColors = ["red", "red2", "blue", "orange", "green", "green_b", "green_c", "green_d", "green_e"];

                const geoColors = ["#ef4850", "#ef4850", "#70c2d6", "#f57f4a", "#87c65b", "#87c65b", "#87c65b", "#87c65b", "#87c65b"];

                const beckColors = ["#E12D27", "#E12D27", "#2F5DA6", "#E87200", "#018447", "#018447", "#018447", "#018447", "#018447"];

                let geoColorScale = d3.scaleOrdinal()
                .domain(railColors)
                .range(geoColors);

                let beckColorScale = d3.scaleOrdinal()
                .domain(railColors)
                .range(beckColors);

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
                    .attr("stroke", function(d){ return geoColorScale(d[0]);})
                    .attr("stroke-width", 5)
                    .attr("d", function(d) { return line(d[1]); });

                // Add the points
                let points = svg.selectAll('circle')
                            .data(nodes)
                            .enter()
                            .append("circle")
                            .attr("cx", function(d) {return xScale(d.geo_x);})
                            .attr("cy", function(d) {return yScale(d.geo_y);})
                            .attr("r", 1)
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

                const xStart = margin.left/2;
                const yStart = margin.top/2
                const yStart_mid = (height - margin.bottom - margin.top)*.75
                const r = 35;

                let legendRect = svg
                .append("rect")
                .attr("width", 120)
                .attr("height", 60)
                .attr("x", xStart)
                .attr("y", yStart_mid -25)
                .attr("fill", "none")
                .attr("stroke", "#000000")
                .attr("stroke-weight", 2)
                .attr("opacity", 0);

                let rtl_title = svg
                .append("text")
                .attr("x", xStart)
                .attr("y", yStart)
                .text("key")
                .style("font-weight", "bold")
                .style("text-transform", "uppercase");

                let rtl = svg.selectAll("trainLegend")
                .data(trainLines)
                .enter()
                .append("rect")
                    .attr("width", 50)
                    .attr("height", 5)
                    .attr("x", xStart)
                    .attr("y", function(d, i) {return 8*i + yStart + 10;})
                    .attr("fill", function(d) {return d.geoColor});

                let rtl_text = svg
                    .append("text")
                    .attr("x", xStart)
                    .attr("y", yStart + 8*trainLines.length + 25)
                    .text("Rapid transit lines")
                    .style("text-transform", "uppercase");

                // Add title and T-Icon
                let title = svg
                    .selectAll("title-text")
                    .data(titleData)
                    .enter()
                    .append("text")
                    .attr("x", xStart + r*2 + 10)
                    .attr("y", function(d, i) {return i*20 + yStart_mid - 25;})
                    .text(function(d) {return d.geo;})
                    .style("font-size", "14pt")
                    .style("font-weight", "bold")
                    .style("text-transform", "uppercase");

                let iconCircle = svg
                    .append("circle")
                    .attr("cx", xStart*2)
                    .attr("cy", yStart_mid)
                    .attr("r", r)
                    .attr("fill", "#FFFFFF")
                    .attr("stroke", "#000000")
                    .attr("stroke-width", 3);

                let iconRect1 = svg
                    .append("rect")
                    .attr("x", xStart + 13)
                    .attr("y", yStart_mid - 20)
                    .attr("width", 50)
                    .attr("height", 12)
                    .attr("fill", "#000000");

                let iconRect2 = svg
                    .append("rect")
                    .attr("x", xStart + 32)
                    .attr("y", yStart_mid - 20)
                    .attr("width", 12)
                    .attr("height", 45)
                    .attr("fill", "#000000");

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
                        .attr("stroke", function(d){ return beckColorScale(d[0]);})
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
                        .attr("stroke", function(d) {return beckColorScale(d.line);});

                    ann
                        .transition()
                        .duration(1500)
                        .delay(250)
                        .attr("x", function(d) {return xScale(d.beck_x) - 6;})
                        .attr("y", function(d) {return yScale(d.beck_y) + 6;});

                    legendRect
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("fill", "#FFFFFF")
                        .attr("opacity", 1);

                    rtl_title 
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart + 10)
                        .attr("y", yStart_mid)
                        .text("legend")
                        .style("font-weight", "bold")
                        .style("text-transform", "uppercase");

                    rtl
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("y", yStart_mid + 20)
                        .attr("x", function(d, i) {return 12*i + xStart + 10;})
                        .attr("fill", function(d) {return d.beckColor});

                    rtl_text
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart + 12*trainLines.length + 15)
                        .attr("y", yStart_mid + 27)
                        .text("Subway")
                        .style("font-size", "8pt")
                        .style("text-transform", "none");

                    title
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("y", function(d, i) {return i*20 + 30;})
                        .text(function(d) {return d.beck;});

                    iconCircle
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("cy", 55);

                    iconRect1
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("y", 35);

                    iconRect2
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("y", 35);

                    d3.select("#diagram").attr("class", "active");
                    document.getElementById("map").classList.remove("active");

                    ttPresent(svg, tooltip, points, beckColorScale);
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
                        .attr("stroke", function(d){ return geoColorScale(d[0]);})
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
                        .attr("r", 1)
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

                    rtl
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("width", 50)
                        .attr("height", 5)
                        .attr("x", xStart)
                        .attr("y", function(d, i) {return 8*i + yStart + 10;})
                        .attr("fill", function(d) {return d.geoColor});

                    rtl_text
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart)
                        .attr("y", yStart + 8*trainLines.length + 25)
                        .text("Rapid transit lines")
                        .style("font-size", "12pt")
                        .style("text-transform", "uppercase");

                    rtl_title 
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart)
                        .attr("y", yStart)
                        .text("key")
                        .style("font-weight", "bold")
                        .style("text-transform", "uppercase");

                    legendRect
                        .transition()
                        .attr("fill", "none")
                        .attr("opacity", 0);

                    title
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart + r*2 + 10)
                        .attr("y", function(d, i) {return i*20 + yStart_mid - 25;})
                        .text(function(d) {return d.geo;});

                    iconCircle.attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("cx", xStart*2)
                        .attr("cy", yStart_mid);

                    iconRect1
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart + 13)
                        .attr("y", yStart_mid - 20);

                    iconRect2 
                        .attr("opacity", 0)
                        .transition()
                        .duration(0)
                        .delay(1000)
                        .attr("opacity", 1)
                        .attr("x", xStart + 31)
                        .attr("y", yStart_mid - 20);

                    document.getElementById("diagram").classList.remove("active");
                    d3.select("#map").attr("class", "active");

                    ttPast(svg, tooltip, points);
                });
            });
        });
    });
});
