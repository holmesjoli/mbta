nodes <- sf::read_sf("./data/raw/MBTA_NODE.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley") %>%
  dplyr::mutate(id = paste(STATION, ROUTE, sep = "-"))

geo <- sapply(1:nrow(nodes), function(j) {

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
      id <- NA
    }
  }
  return(id)
}, simplify = T)

nodes <- nodes %>%
  dplyr::bind_cols(name = geo) %>%
  dplyr::filter(!is.na(name))

lines <- sf::read_sf("./data/raw/MBTA_ARC.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley") %>%
  sf::st_as_sf() %>%
  sf::st_coordinates() %>%
  as.data.frame()

sfc <- lapply(1:nrow(lines), function(i) {
  b <- lines %>%
    dplyr::slice(i)
  st_point(c(b$X, b$Y))
})

sfc <- st_sfc(sfc)
st_crs(sfc) <- st_crs(nodes)

st_geometry(sfc)
st_geometry(lines) <- sfc

dist <- as.data.frame(st_distance(nodes, lines))

close_stations <- lapply(1:113, function(j) {

  opts <- dist %>%
    dplyr::slice(j) %>% 
    as.integer()

  i <- match(min(opts), opts)

  n <- nodes %>%
    dplyr::slice(j) %>%
    sf::st_coordinates() %>%
    as.data.frame() %>% 
    dplyr::bind_cols(nodes %>%
                       dplyr::slice(j) %>%
                       sf::st_drop_geometry())

  l <- lines %>% dplyr::slice(i) %>%
    dplyr::select(X, Y, L2) %>%
    dplyr::rename(line_x = X, line_y = Y, group = L2) %>%
    sf::st_drop_geometry()

  n %>% dplyr::bind_cols(l)

}) %>%
  dplyr::bind_rows()

lines <- sf::read_sf("./data/raw/MBTA_ARC.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley") 

lines <- lines %>%
  sf::st_coordinates() %>%
  as.data.frame() %>%
  dplyr::distinct() %>%
  dplyr::group_by(L2) %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::inner_join(lines %>% dplyr::mutate(L2 = seq(1, dplyr::n(), 1))) %>%
  dplyr::rename(x = X, y = Y, group = L2) %>% 
  dplyr::select(x, y, LINE, group, order) %>%
  dplyr::left_join(close_stations %>%
                     dplyr::select(line_x, line_y, name) %>%
                     dplyr::rename(x = line_x, y = line_y)) %>%
  dplyr::filter(LINE %in% c("ORANGE", "BLUE")) %>%
  readr::write_csv(file.path(pth, "station_connections.csv"))
