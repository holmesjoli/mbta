let pth = "./data/processed/";

// d3.json(path.join(pth, "geo_station_connections.json")).then(function(edges) {
//     d3.json(path.join(pth, "geo_stations.json")).then(function(nodes) {
d3.json(pth +"geo_station_connections.json").then(function(geo_edges) {
    d3.json(pth +"geo_stations.json").then(function(geo_nodes) {

        console.log("geo_edges", geo_edges);
        console.log("geo_nodes", geo_nodes);
    });
});
