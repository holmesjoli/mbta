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
  dplyr::filter(!is.na(name)) %>%
  dplyr::mutate(n = seq(1, dplyr::n(), 1))

lines1 <- sf::read_sf("./data/raw/MBTA_ARC.shp") %>%
  dplyr::filter(LINE != "SILVER") %>%
  dplyr::filter(ROUTE != "Mattapan Trolley")

# lines <- rmapshaper::ms_simplify(input = as(lines, 'Spatial')) %>%
#   sf::st_as_sf() 

lines <- lines1 %>%
  sf::st_coordinates() %>%
  as.data.frame() %>%
  dplyr::mutate(n = seq(1, dplyr::n(), 1))

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
                       sf::st_drop_geometry()) %>%
    dplyr::select(-n)

  l <- lines %>% dplyr::slice(i) %>%
    dplyr::select(X, Y, L2, n) %>%
    dplyr::rename(line_x = X, line_y = Y, group = L2) %>%
    sf::st_drop_geometry()

  df <- n %>% dplyr::bind_cols(l)

  row.names(df) <- NULL
  df
}) %>%
  dplyr::bind_rows()

lines <- lines %>%
  dplyr::group_by(L2) %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::inner_join(lines1 %>% dplyr::mutate(L2 = seq(1, dplyr::n(), 1))) %>%
  dplyr::rename(x = X, y = Y, group = L2) %>% 
  dplyr::select(x, y, LINE, group, order, n) %>%
  dplyr::left_join(close_stations %>%
                     dplyr::select(n, name)) 

lines %>%
  readr::write_csv(file.path(pth, "station_connections.csv"))

# Blue order 31, 32, 33, 34, 35, 44
# Orange order 2,5, 10, 12,13, 15, 46, 1, 40, 38, 36

# Orageg extra 4,5,6,7,8,9,11,14,16,39,37

# Red 26, 43, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59

# Red 26, 50, 49, 47, 56, 57

# Red2 43, 47, 49

orange_group <- data.frame(
  group = c(2,5, 10, 12,13, 15, 46, 1, 40, 38, 36),
  line = "orange") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

blue_group <- data.frame(
  group = c(31, 32, 33, 34, 35, 44),
  line = "blue") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

red_group <- data.frame(
  group = c(57, 56, 47, 49, 50, 26),
  line = "red") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

red2_group <- data.frame(
  group = c(43, 55, 54),
  line = "red2") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

green_group <- data.frame(
  group = c(28, 25, 27, 42, 48),
  line = "green") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

green_e_group <- data.frame(
  group = c(22, 23, 25),
  line = "green_e") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

green_d_group <- data.frame(
  group = c(30, 17, 28),
  line = "green_d") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

green_c_group <- data.frame(
  group = c(41, 28),
  line = "green_c") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

green_b_group <- data.frame(
  group = c(29, 28),
  line = "green_b") %>%
  dplyr::mutate(group_order = seq(1, dplyr::n(), 1))

orange_line <- lines %>%
  dplyr::inner_join(orange_group) %>%
  dplyr::arrange(group_order)

blue_line <- lines %>%
  dplyr::inner_join(blue_group) %>%
  dplyr::arrange(group_order)

red_line <- lines %>%
  dplyr::inner_join(red_group) %>%
  dplyr::arrange(group_order) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

red2_line <- lines %>%
  dplyr::inner_join(red2_group) %>%
  dplyr::arrange(group_order) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

green_line <- lines %>%
  dplyr::inner_join(green_group) %>%
  dplyr::arrange(group_order) #%>%
  # dplyr::ungroup() %>%
  # dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  # dplyr::arrange(desc(order))

green_e_line <- lines %>%
  dplyr::inner_join(green_e_group) %>%
  dplyr::arrange(group_order) #%>%
  # dplyr::ungroup() %>%
  # dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  # dplyr::arrange(desc(order))

green_d_line <- lines %>%
  dplyr::inner_join(green_d_group) %>%
  dplyr::arrange(group_order) #%>%
  # dplyr::ungroup() %>%
  # dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  # dplyr::arrange(desc(order))

green_c_line <- lines %>%
  dplyr::inner_join(green_c_group) %>%
  dplyr::arrange(group_order) #%>%
  # dplyr::ungroup() %>%
  # dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  # dplyr::arrange(desc(order))

green_b_line <- lines %>%
  dplyr::inner_join(green_b_group) %>%
  dplyr::arrange(group_order) #%>%
  # dplyr::ungroup() %>%
  # dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  # dplyr::arrange(desc(order))

red_line %>%
  dplyr::bind_rows(red2_line) %>%
  dplyr::bind_rows(blue_line) %>%
  dplyr::bind_rows(orange_line) %>%
  dplyr::bind_rows(green_e_line) %>%
  dplyr::bind_rows(green_d_line) %>%
  dplyr::bind_rows(green_c_line) %>%
  dplyr::bind_rows(green_b_line) %>%
  dplyr::bind_rows(green_line) %>%
  readr::write_csv(file.path(pth, "station_connections2.csv"))

df <- lines %>% 
  dplyr::filter(!is.na(name))
  
df <- df[match(green_b, df$name),] %>% 
  tidyr::drop_na()
