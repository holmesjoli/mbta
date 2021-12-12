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

//Title Create Y Scale
function createYScale(obj, height, margin) {
    return d3.scaleLinear()
        .domain([obj.ymin, obj.ymax])
        .range([height-margin.bottom, margin.top]);
};

//Title Create X Scale
function createXScale(obj, width, margin) {
    return d3.scaleLinear()
    .domain([obj.xmin, obj.xmax])
    .range([margin.left, width - margin.right]);
};

//Title tooltip
function tt(svg, tooltip) {

    svg.selectAll("circle").on("mouseover", function(e, d) {

        let cx = +d3.select(this).attr("cx")+20;
        let cy = +d3.select(this).attr("cy")-10;

        tooltip.style("visibility","visible") 
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>${d.name}</b><br> ${d.id}`);

        d3.select(this)
            .attr("stroke","#F6C900")
            .attr("stroke-width",2);

    }).on("mouseout", function() {

        tooltip.style("visibility","hidden");

        d3.select(this)
            .attr("stroke","none")
            .attr("stroke-width",0);
            
    });
};

//
function groupedColorScale(data, group) {

    // Generate the grouped color scale for the map
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

function groupedLine(d, xScale, yScale) {

    return d3.line()
    .x(function(d) { return xScale(+d.x); })
    .y(function(d) { return yScale(+d.y); })
    (d[1])
}

let pth = "./data/processed/";


// grouped line chart https://www.d3-graph-gallery.com/graph/line_several_group.html

d3.csv(pth + "beck_lines.csv").then(function(beckLinks) {
    d3.json(pth + "stations.json").then(function(nodes) {
        d3.csv(pth + "station_connections.csv").then(function(geoLinks) {

            console.log(beckLinks);

            //Define constants
            const height = window.innerHeight;
            const width = height*1.3;
            const margin = {top: 100, left: 100, right: 200, bottom: 125};

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

            console.log(geoLinks);
            // Define SVG Canvas and attributes

            let svg = d3.select("#chart")
                        .append("svg")
                        .attr("height", height)
                        .attr("width", width);

            let yScale = createYScale(geo, height, margin);
            let xScale = createXScale(geo, width, margin);

            // Generate the grouped color scale for the map
            let g = groupedColorScale(geoLinks, "group_name");

            let colorScale = d3.scaleOrdinal()
            .domain(g["uniqueGroup"])
            .range(g["lineColors"]);

            // Generate the lines for the map
            const geoLineGroup = d3.group(geoLinks, d => d.group_name);

            console.log(geoLineGroup);

            let path = svg.selectAll(".line")
            .data(geoLineGroup)
            .join("path")
                .attr("fill", "none")
                .attr("stroke", function(d){ return colorScale(d[0]);})
                .attr("stroke-width", 2)
                .attr("d", function(d){return groupedLine(d, xScale, yScale);})

            let points = svg.selectAll('circle')
                        .data(nodes)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {return xScale(d.geo_x);})
                        .attr("cy", function(d) {return yScale(d.geo_y);})
                        .attr("r", 5);

            let tooltip = d3.select("#chart")
                        .append("div")
                        .attr("class", "tooltip");

            tt(svg, tooltip);

            d3.select("#diagram").on("click", function() {

                xScale.domain([beck.xmin, beck.xmax]);
                yScale.domain([beck.ymin, beck.ymax]);
                yScale.range([margin.top, height-margin.bottom]);

                const beckLineGroup = d3.group(beckLinks, d => d.line);
                console.log(beckLineGroup);

                let c = svg.selectAll("path")
                .data(beckLineGroup, function(d) { return d.name; });

                c.enter().append("path")
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    .attr("d", function(d){return groupedLine(d, xScale, yScale);})
                .merge(c)   
                    .transition()
                    .duration(2000)
                    .delay(250)
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    // .attrTween('d', function (d) {
                    //     var previous = d3.select(this).attr('d');
                    //     console.log(d3.select(this).attr('d'))
                    //     var current = groupedLine(d, xScale, yScale);
                    //     return d3.interpolatePath(previous, current);
                    // });
                    .attr("d", function(d){return groupedLine(d, xScale, yScale);})

                c.exit()
                .transition()
                .duration(1500)
                .remove();

                points
                    .transition()
                    .duration(2000)
                    .delay(250)
                    .attr("cx", function(d) { return xScale(d.beck_x); })
                    .attr("cy", function(d) { return yScale(d.beck_y); });

                d3.select("#diagram").attr("class", "active");
                document.getElementById("map").classList.remove("active");
            });
        
            d3.select("#map").on("click", function() {
                xScale.domain([geo.xmin, geo.xmax]);
                yScale.domain([geo.ymin, geo.ymax]);
                yScale.range([height-margin.bottom, margin.top])

                let c = svg.selectAll("path")
                .data(geoLineGroup, function(d) { return d.name;});

                c.enter().append("path")
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    .attr("d", function(d){return groupedLine(d, xScale, yScale);})
                .merge(c)   
                    .transition()
                    .duration(2000)
                    .delay(250)
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    .attr("stroke", function(d){ return colorScale(d[0]);})
                    .attr("d", function(d){return groupedLine(d, xScale, yScale);})

                c.exit()
                .transition()
                .duration(1500)
                .remove();

                points
                    .transition()
                    .duration(2000)
                    .delay(250)
                    .attr("cx", function(d) { return xScale(d.geo_x);})
                    .attr("cy", function(d) { return yScale(d.geo_y);});

                document.getElementById("diagram").classList.remove("active");
                d3.select("#map").attr("class", "active");
            });
        });
    });
});
