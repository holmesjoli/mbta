let pth = "./data/processed/";

// d3.json(path.join(pth, "geo_station_connections.json")).then(function(edges) {
//     d3.json(path.join(pth, "geo_stations.json")).then(function(nodes) {
d3.json(pth + "beck_station_connections.json").then(function(beck_links) {
    d3.json(pth + "beck_stations.json").then(function(beck_nodes) {

        console.log("beck_edges", beck_links);
        console.log("beck_nodes", beck_nodes);

        const width = 1000;
        const height = window.innerHeight;
        const margin = {top: 100, left: 100, right: 200, bottom: 125};

        const x = {
            max: d3.max(beck_nodes, function(d) {return d.x;}),
            min: d3.min(beck_nodes, function(d) {return d.x;})
        };

        console.log(x);

        const y = {
            max: d3.max(beck_nodes, function(d) {return d.y;}),
            min: d3.min(beck_nodes, function(d) {return d.y;})
        };

        console.log(y);

        let svg = d3.select("#chart")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        let yScale = d3.scaleLinear()
                    .domain([y.min, y.max])
                    .range([margin.top, height-margin.bottom]);

        let xScale = d3.scaleLinear()
                    .domain([x.min, x.max])
                    .range([margin.left, width - margin.right]);

        svg.append("g").selectAll('circle')
                    .data(beck_nodes)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {return xScale(d.x);})
                    .attr("cy", function(d) {return yScale(d.y);})
                    .attr("r", 5);

        svg.append("g").selectAll("line")
            .data(beck_links)
            .enter()
            .append("line")
            .attr("x1", function(d) {return xScale(d.x1);})
            .attr("x2", function(d) {return xScale(d.x2);})
            .attr("y1", function(d) {return yScale(d.y1);})
            .attr("y2", function(d) {return yScale(d.y2);})
            .style("stroke", "#018447")
            .style("stroke-width", 3);

    });
});
