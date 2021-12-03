library(magrittr)

read <- function(network, lat_long) {
  network <- rjson::fromJSON(httr::GET(network) %>% httr::content())
  lat_long <- rjson::fromJSON(httr::GET(lat_long) %>% httr::content())

  return(list(network = network, lat_long = lat_long))
}

#' @title Data management steps for nodes
#' @return object
dm_nodes <- function(network) {

  nodes <- network$nodes
  lat_long <- network$lat_long
  
  network$nodes <- lapply(nodes, function(station) {

    ll <- lat_long[[station$id]]
    station$x <- ll[1]
    station$y <- ll[2]
    return(station)
  })
  
  return(network)
}

#' @title Data management steps for links
#' @return object
dm_links <- function(network) {

  links <- network$links
  nodes <- network$nodes

  network$links <- lapply(1:length(links), function(i) {

    link <- links[[i]]
    
    source <- link$source + 1
    target <- link$target + 1
    
    link$x1 <- nodes[[source]]$x
    link$y1 <- nodes[[source]]$y
    
    link$x2 <- nodes[[target]]$x
    link$y2 <- nodes[[target]]$y 
    
    return(link)
  })
  
  return(network)
}

pth <- "./data/processed/"

green_line <- "https://raw.githubusercontent.com/mbtaviz/green-line-release/gh-pages/data/station-network.json"
green_lat_long <- "https://raw.githubusercontent.com/mbtaviz/green-line-release/gh-pages/data/spider.json"
other_lines <- "https://raw.githubusercontent.com/mbtaviz/mbtaviz.github.io/master/data/station-network.json"
other_lat_long <- "https://raw.githubusercontent.com/mbtaviz/mbtaviz.github.io/master/data/spider.json"

green_network <- rjson::fromJSON(httr::GET(green_line) %>% httr::content())
other_network <- rjson::fromJSON(httr::GET(other_lines) %>% httr::content())

green_network$lat_long <- rjson::fromJSON(httr::GET(green_lat_long) %>% httr::content())
other_network$lat_long <- rjson::fromJSON(httr::GET(other_lat_long) %>% httr::content())

green_network <- dm_nodes(network = green_network)
green_network <- dm_links(network = green_network)

other_network <- dm_nodes(network = other_network)
other_network <- dm_links(network = other_network)


c(green_network$nodes, other_network$nodes) %>%
  rjson::toJSON() %>%
  write(file.path(pth, "beck_stations.json"))

c(green_network$links, other_network$links) %>%
  rjson::toJSON() %>%
  write(file.path(pth, "beck_station_connections.json"))

lines <- readr::read_csv("./data/raw/lines.txt") %>%
  dplyr::filter(line_sort_order %in% c("10010", "10020", "10032", "10040", "10051"))

shapes <- readr::read_csv("./data/raw/shapes.txt")
pathways <- readr::read_csv("./data/raw/pathways.txt") 

#https://www.mass.gov/info-details/massgis-data-mbta-rapid-transit
sf::read_sf("./data/raw/MBTA_NODE.shp") %>%
  geojsonio::geojson_json() %>%
  geojsonio::geojson_write(file = file.path(pth, "geo_stations.json"))

sf::read_sf("./data/raw/MBTA_ARC.shp") %>%
  geojsonio::geojson_json() %>%
  geojsonio::geojson_write(file = file.path(pth, "geo_station_connections.json"))

ggplot() +
  geom_sf(data = nodes, aes(geometry = geometry)) +
  geom_sf(data = lines, aes(geometry = geometry, color = LINE))
