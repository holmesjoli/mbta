get_geo <- function(county_name, key, value, geo_type) {
  Sys.sleep(10)
  
  osmdata::getbb(county_name) %>%
    osmdata::opq() %>%
    osmdata::add_osm_feature(key = key, value = c(value)) %>%
    osmdata::osmdata_sf() %>% 
    purrr::pluck(geo_type)
}

#' @title Get Geo highways
get_geo.highway <- function(county_name, key = "highway", value = "motorway",
                            geo_type = "osm_lines") {
  get_geo(county_name = county_name, key = key, value = value, 
          geo_type = geo_type) %>%
    dplyr::select(name, geometry)
}

#' @title Get public transport
get_geo.pt <- function(county_name, key = "public_transport", value = "station",
                            geo_type = "osm_points") {
  get_geo(county_name = county_name, key = key, value = value, 
          geo_type = geo_type) %>%
    dplyr::select(name, geometry)
}

#' @title Get Geo waterways
get_geo.waterway <- function(county_name, key = "waterway", value = "river",
                             geo_type = "osm_lines") {
  get_geo(county_name = county_name, key = key, value = value, 
          geo_type = geo_type) %>% 
    dplyr::select(geometry)
}

#' @title Get Geo waterways
get_geo.coastline <- function(county_name, key = "natural", value = c("water", "coastline"),
                             geo_type = "osm_polygons") {
  get_geo(county_name = county_name, key = key, value = value, 
          geo_type = geo_type) %>% 
    dplyr::select(geometry)
}

#' @title Get Geo park
get_geo.park <- function(county_name, key = "leisure", value = "park",
                         geo_type = "osm_polygons") {
  get_geo(county_name = county_name, key = key, value = value, 
          geo_type = geo_type) %>% 
    dplyr::select(geometry)
}
