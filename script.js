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
            max: d3.max(beck_nodes, function(d) {return d.beck_x;}),
            min: d3.min(beck_nodes, function(d) {return d.beck_x;})
        };

        console.log(x);

        const y = {
            max: d3.max(beck_nodes, function(d) {return d.beck_y;}),
            min: d3.min(beck_nodes, function(d) {return d.beck_y;})
        };

        const lines = unique_array(beck_links, "line");

        console.log(lines);

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

        let colorScale = d3.scaleOrdinal()
        .domain(lines)
        .range(["#018447", "#018447", "#018447", "#018447", "#018447", "#E12D27", 
                "#E87200", "#2F5DA6"]);

        svg.append("g").selectAll("line")
                .data(beck_links)
                .enter()
                .append("line")
                .attr("x1", function(d) {return xScale(d.beck_x1);})
                .attr("x2", function(d) {return xScale(d.beck_x2);})
                .attr("y1", function(d) {return yScale(d.beck_y1);})
                .attr("y2", function(d) {return yScale(d.beck_y2);})
                .style("stroke", function(d) {return colorScale(d.line);})
                .style("stroke-width", 3);

        svg.append("g").selectAll('circle')
                    .data(beck_nodes)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {return xScale(d.beck_x);})
                    .attr("cy", function(d) {return yScale(d.beck_y);})
                    .attr("r", 5);

        console.log(beck_nodes);
        let tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "tooltip");
        
        //only selecting circles which have already be drawn for the first data join
        function tt() {
        svg.selectAll("circle").on("mouseover", function(e, d) {
    
        let cx = +d3.select(this).attr("cx")+20;
        let cy = +d3.select(this).attr("cy")-10;
    
        tooltip.style("visibility","visible") 
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Id:</b> ${d.name}`);
    
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

        tt();

    });
});
