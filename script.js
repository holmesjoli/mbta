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

function createYScale(obj, height, margin) {
    return d3.scaleLinear()
        .domain([obj.ymin, obj.ymax])
        .range([height-margin.bottom, margin.top]);
};

function createXScale(obj, width, margin) {
    return d3.scaleLinear()
    .domain([obj.xmin, obj.xmax])
    .range([margin.left, width - margin.right]);
};

function pExit(points) {
    points.exit()
                .transition()
                .duration(2000)
                .delay(250)
                .attr("r",0)
                .remove();
}


let pth = "./data/processed/";

// d3.json(path.join(pth, "geo_station_connections.json")).then(function(edges) {
//     d3.json(path.join(pth, "geo_stations.json")).then(function(nodes) {
d3.json(pth + "beck_station_connections.json").then(function(links) {
    d3.json(pth + "stations.json").then(function(nodes) {

        //Define constants
        const height = window.innerHeight;
        const width = 900;
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
        console.log(nodes);
        const lines = unique_array(links, "line");

        // Define SVG Canvas and attributes

        let svg = d3.select("#chart")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        let yScale = createYScale(geo, height, margin);
        let xScale = createXScale(geo, width, margin);

        let colorScale = d3.scaleOrdinal()
        .domain(lines)
        .range(["#018447", "#018447", "#018447", "#018447", "#018447", "#E12D27", 
                "#E87200", "#2F5DA6"]);

        // svg.append("g").selectAll("line")
        //         .data(links)
        //         .enter()
        //         .append("line")
        //         .attr("x1", function(d) {return xScale(d.beck_x1);})
        //         .attr("x2", function(d) {return xScale(d.beck_x2);})
        //         .attr("y1", function(d) {return yScale(d.beck_y1);})
        //         .attr("y2", function(d) {return yScale(d.beck_y2);})
        //         .style("stroke", function(d) {return colorScale(d.line);})
        //         .style("stroke-width", 3);

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

            svg.selectAll("circle").on("mouseover", function(e, d) {

                let cx = +d3.select(this).attr("cx")+20;
                let cy = +d3.select(this).attr("cy")-10;

                console.log([cx, cy]);

                tooltip.style("visibility","visible") 
                    .style("left", `${cx}px`)
                    .style("top", `${cy}px`)
                    .html(`<b>${d.name}</b><br>${d.id}`);

                d3.select(this)
                    .attr("stroke","#F6C900")
                    .attr("stroke-width",2);

            }).on("mouseout", function() {

                tooltip.style("visibility","hidden");

                d3.select(this)
                    .attr("stroke","none")
                    .attr("stroke-width",0);
                    
            });

        d3.select("#diagram").on("click", function() {
            xScale.domain([beck.xmin, beck.xmax]);
            yScale.domain([beck.ymin, beck.ymax]);
            yScale.range([margin.top, height-margin.bottom]);

            points
                .transition()
                .duration(2000)
                .delay(250)
                .attr("cx", function(d) { return xScale(d.beck_x); })
                .attr("cy", function(d) { return yScale(d.beck_y); });
        
            pExit(points);
        });
    
        d3.select("#map").on("click", function() {
    
            xScale.domain([geo.xmin, geo.xmax]);
            yScale.domain([geo.ymin, geo.ymax]);
            yScale.range([height-margin.bottom, margin.top])

            points
                .transition()
                .duration(2000)
                .delay(250)
                .attr("cx", function(d) { return xScale(d.geo_x); })
                .attr("cy", function(d) { return yScale(d.geo_y); });
        
            pExit(points);
        });
    });
});
