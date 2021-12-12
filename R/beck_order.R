orange <- paste("place",
                c("forhl", "grnst", "sbmnl" ,"jaksn", "rcmnl", "rugg", "masta",
                  "bbsta", "tumnl", "chncl", "dwnxg", "state", "ccmnl", "sull",
                  "welln", "mlmnl", "ogmnl"), sep="-")

blue <- paste("place",
              c("wondl", "rbmnl", "bmmnl", "sdmnl", "orhte", "wimnl", "aport",
                "mvbcl", "aqucl", "state", "gover", "bomnl"), sep="-")


dm_lat_long <- function(network, green = FALSE) {
  
  df <- network$lat_long %>% do.call(rbind, .) %>%
    as.data.frame() %>%
    dplyr::rename(x = V1,
                  y = V2) %>%
    dplyr::mutate(name = names(network$lat_long))
  
  if (green) {
    
    df <- df %>%
      dplyr::mutate(x = x - 12.24264,
                    y = y + 1.050253
      )
    
  } else {

    ord <- c(paste0("orange-", orange), paste0("blue-", blue))

    df <- df %>%
      dplyr::mutate(orange = name %in% orange,
                    blue = name %in% blue) %>%
      tidyr::pivot_longer(names_to = "line", values_to = "values", -c(x, y, name)) %>%
      dplyr::filter(values) %>%
      dplyr::select(-values) %>%
      dplyr::mutate(order = paste(line, name, sep = "-"))

    df <- df[match(ord, df$order),]
    
    df <- df %>%
      dplyr::mutate(seq = seq(1, dplyr::n(), 1))

  }

  return(df)
}


other <- dm_lat_long(other_network)
green <- dm_lat_long(green_network, green = TRUE)

beck_links <- other %>% 
  # dplyr::bind_rows(green) %>%
  # dplyr::left_join(lines %>% dplyr::select(-c(x, y, order))) %>%
  dplyr::filter(line %in% c("blue", "orange"))

readr::write_csv(beck_links,
                 file.path(pth, "beck_lines.csv"))
