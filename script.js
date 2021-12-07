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
        .range([margin.top, height-margin.bottom]);
};

function createXScale(obj, width, margin) {
    return d3.scaleLinear()
    .domain([obj.xmin, obj.xmax])
    .range([margin.left, width - margin.right]);
};

let pth = "./data/processed/";

// d3.json(path.join(pth, "geo_station_connections.json")).then(function(edges) {
//     d3.json(path.join(pth, "geo_stations.json")).then(function(nodes) {
d3.json(pth + "beck_station_connections.json").then(function(beck_links) {
    d3.json(pth + "stations.json").then(function(nodes) {
        d3.csv(pth + "station_connections.csv").then(function(geo_links) {

        console.log("beck_links", beck_links);
        console.log("nodes", nodes);
        console.log("geo_links", geo_links)

        const width = 1000;
        const height = window.innerHeight;
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

        console.log(geo);

        const lines = unique_array(beck_links, "line");

        console.log(lines);

        let svg = d3.select("#chart")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        let yScale = createYScale(beck, height, margin);
        let xScale = createXScale(beck, width, margin);

        let colorScale = d3.scaleOrdinal()
        .domain(lines)
        .range(["#018447", "#018447", "#018447", "#018447", "#018447", "#E12D27", 
                "#E87200", "#2F5DA6"]);

        // svg.append("g").selectAll("line")
        //         .data(beck_links)
        //         .enter()
        //         .append("line")
        //         .attr("x1", function(d) {return xScale(d.beck_x1);})
        //         .attr("x2", function(d) {return xScale(d.beck_x2);})
        //         .attr("y1", function(d) {return yScale(d.beck_y1);})
        //         .attr("y2", function(d) {return yScale(d.beck_y2);})
        //         .style("stroke", function(d) {return colorScale(d.line);})
        //         .style("stroke-width", 3);

        svg.append("g").selectAll('circle')
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {return xScale(d.beck_x);})
                    .attr("cy", function(d) {return yScale(d.beck_y);})
                    .attr("r", 5);

        console.log(nodes);

        });

    });
});
