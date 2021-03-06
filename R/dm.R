library(magrittr)

read <- function(network, lat_long) {
  network <- rjson::fromJSON(httr::GET(network) %>% httr::content())
  lat_long <- rjson::fromJSON(httr::GET(lat_long) %>% httr::content())

  return(list(network = network, lat_long = lat_long))
}

#' @title Data management steps for nodes
#' @return object
dm_nodes <- function(network, green= FALSE) {

  nodes <- network$nodes
  lat_long <- network$lat_long
  ids <- c()
  
  
  network$nodes <- lapply(nodes, function(station) {

    ids <- c(ids, station$id)
    ll <- lat_long[[station$id]]
    
    if (green) {
      station$beck_x <- ll[1] - 12.24264
      station$beck_y <- ll[2] + 1.050253
      
      # station$beck_x <- ifelse(station$id == "place-haecl", 8.49, station$beck_x)
      # station$beck_y <- ifelse(station$id == "place-haecl", 6, station$beck_x)
      # 
      # station$beck_x <- ifelse(station$id == "place-north", 8.49, station$beck_x)
      # station$beck_y <- ifelse(station$id == "place-north", 5, station$beck_y)
      # 
      # station$beck_x <- ifelse(station$id == "place-gover", 7.07, station$beck_x)
      # station$beck_y <- ifelse(station$id == "place-gover", 6, station$beck_y)
      
    } else {
      station$beck_x <- ll[1]
      station$beck_y <- ll[2]
    }
    
    return(station)
  })
  
  names(network$nodes) <- ids
  
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
    
    link$beck_x1 <- nodes[[source]]$beck_x
    link$beck_y1 <- nodes[[source]]$beck_y
    
    link$beck_x2 <- nodes[[target]]$beck_x
    link$beck_y2 <- nodes[[target]]$beck_y 
    
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

green_network <- dm_nodes(network = green_network, green = TRUE)
green_network <- dm_links(network = green_network)

other_network <- dm_nodes(network = other_network)
other_network <- dm_links(network = other_network)

c(green_network$nodes, other_network$nodes) %>%
  rjson::toJSON() %>%
  write(file.path(pth, "beck_stations.json"))

c(green_network$links, other_network$links) %>%
  rjson::toJSON() %>%
  write(file.path(pth, "beck_station_connections.json"))

beck <- c(green_network$nodes, other_network$nodes) 

names(beck) <- beck %>% purrr::transpose() %>% purrr::pluck("id") %>% unlist()

beck_names <- beck %>%
  purrr::transpose() %>%
  purrr::pluck("name") %>%
  tolower()

#https://www.mass.gov/info-details/massgis-data-mbta-rapid-transit
nodes <- sf::read_sf("./data/raw/MBTA_NODE.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley") 

nodes <- nodes %>%
  sf::st_coordinates() %>%
  as.data.frame() %>%
  dplyr::bind_cols(nodes) %>%
  dplyr::mutate(id = paste(STATION, ROUTE, sep = "-"),
                row = seq(1, dplyr::n(), 1))

# bb <- nodes %>% sf::st_bbox()

# nodes %>%
#   geojsonio::geojson_json() %>%
#   geojsonio::geojson_write(file = file.path(pth, "geo_stations.json"))

geo <- lapply(1:nrow(nodes), function(j) {

  x <- nodes %>% dplyr::slice(j) %>% dplyr::pull(STATION)
  
  id2 <- nodes %>% dplyr::slice(j) %>% dplyr::pull(id)
  
  i <- grep(tolower(x), beck_names)
  
  if (length(i) == 1) {
    id <- beck[[i]]$id
  } else {
    
    if (x == "Harvard") {
      id <- "place-harsq"
    }
    
    if (x == "Haymarket") {
      id <- "place-haecl"
    }
    
    if (x == "Sullivan Square") {
      id <- "place-sull"
    }
  
    if (x == "Central") {
      id <- "place-cntsq"
    }
    
    if (x == "Green Street") {
      id <- "place-grnst"
    }
    
    if (x == "Government Center") {
      id <- "place-gover"
    }
    
    if (x == "Saint Paul Street") {

      if (id2 == "Saint Paul Street-C - Cleveland Circle") {
        id <- "place-stpul"
      } else {
        id <- "place-stplb"
      }
    }

    if (x == "Summit Ave/Winchester St") {
      id <- "place-sumav"
    }
    
    if (x == "Saint Marys Street") {
      id <- "place-smary"
    }

    if (x == "Fenway Park") {
      id <- "place-fenwy"
    }
    
    if (x == "Longwood") {
      id <- "place-longw"
    }
    
    if (x == "Chestnut Hill") {
      id <- "place-chhil"
    }
    
    if (x == "North Station") {
      id <- "place-north"
    }
    
    if (x == "Assembly") {
      id <- NULL
    }

  }

  if(is.null(id)) return(NULL)

  l <- beck[[id]]
  l$station <- x
  l$geo_x <- nodes %>% dplyr::filter(id == id2) %>% dplyr::pull(X)
  l$geo_y <- nodes %>% dplyr::filter(id == id2) %>% dplyr::pull(Y)

  # if ()
  
  return(l)

}) %>% plyr::compact()

geo %>%
  rjson::toJSON() %>%
  write(file.path(pth, "stations.json"))

beck_id <- beck %>% purrr::transpose() %>% purrr::pluck("id") %>% plyr::compact() %>% unlist() %>% unique()
geo_id <- geo %>% purrr::transpose() %>% purrr::pluck("id") %>% unlist()

names(geo) <- geo_id

setdiff(beck_id, geo_id)
setdiff(geo_id, beck_id)

lines <- sf::read_sf("./data/raw/MBTA_ARC.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley") 

lines <- 
  # rmapshaper::ms_simplify(input = as(lines, 'Spatial')) %>%
  # sf::st_as_sf() %>%
  sf::st_coordinates() %>%
  as.data.frame() %>%
  dplyr::group_by(L2) %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::inner_join(lines %>% dplyr::mutate(L2 = seq(1, dplyr::n(), 1))) %>%
  dplyr::rename(x = X, y = Y, group = L2) %>% 
  dplyr::select(x, y, LINE, group, order) 

z <- lines %>%
  dplyr::filter(LINE == "ORANGE") %>%
  dplyr::filter(group %in% c(2, 3, 4, 5, 6, 7, 8, 9, 10, 11)) %>%
  # dplyr::slice(2) %>%
  readr::write_csv(file.path(pth, "station_connections.csv"))

parks <- get_geo.park("Boston, MA")
waterway <- get_geo.waterway("Boston, MA")
highway <- get_geo.highway("Boston, MA")
coast <- get_geo.coastline("Boston, MA")

pt <- get_geo.pt("Boston, MA")

ggplot() +
  geom_line(data = lines, aes(x = x_geo, y = y_geo, group = group))

ggplot() +
  geom_sf(data = nodes, aes(geometry = geometry), size = 2) +
  geom_sf(data = lines, aes(geometry = geometry, color = LINE), size = 1) +
  geom_sf(data = waterway,
          inherit.aes = FALSE,
          color = "steelblue",
          size = 1,
          alpha = 1) +
  geom_sf(data = highway,
          inherit.aes = FALSE,
          color = "black",
          size = .6,
          alpha = 1) +
  geom_sf(data = parks,
          inherit.aes = FALSE,
          fill = "#a8dab5",
          alpha = 1) +
  geom_sf(data = coast,
          inherit.aes = FALSE,
          fill = "lightblue",
          alpha = 1) +
  coord_sf(xlim = c(bb[[1]], bb[[3]]),
           ylim = c(bb[[2]], bb[[4]])) +
  theme_void()

z <- lapply(geo, function(x) {
  if(length(x) == 1) {return(x)}
  else {return(NULL)}
}) %>% plyr::compact()

which(lapply(beck %>% purrr::transpose() %>% purrr::pluck("id"), 
       function(x) {return (x == "place-stpul")}) %>% unlist())

beck <- c(green_network$nodes, other_network$nodes) 
