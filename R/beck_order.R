orange <- paste("place",
                c("forhl", "grnst", "sbmnl" ,"jaksn", "rcmnl", "rugg", "masta",
                  "bbsta", "tumnl", "chncl", "dwnxg", "state", "haecl", "north",
                  "ccmnl", "sull", "welln", "mlmnl", "ogmnl"), sep="-")

blue <- paste("place",
              c("wondl", "rbmnl", "bmmnl", "sdmnl", "orhte", "wimnl", "aport",
                "mvbcl", "aqucl", "state", "gover", "bomnl"), sep="-")

red <- paste("place", 
             c("alfcl", "davis", "portr", "harsq", "cntsq", "knncl", "chmnl",
              "sstat", "brdwy", "andrw", "jfk", "shmnl", "fldcr", "smmnl", "asmnl"), sep = "-")

red2 <- paste("place", rev(c("jfk", "nqncy", "wlsta", "qnctr", "qamnl", "brntn")), sep = "-")

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

    ord <- c(paste0("orange-", orange), paste0("blue-", blue), paste0("red-", red), paste0("red2-", red2))

    df <- df %>%
      dplyr::mutate(orange = name %in% orange,
                    blue = name %in% blue,
                    red = name %in% red,
                    red2 = name %in% red2) %>%
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
# orange <- other %>%
#   dplyr::filter(line %in% c("orange"))



beck_links <- other #%>% 
  # dplyr::bind_rows(green) %>%
 
readr::write_csv(beck_links,
                 file.path(pth, "beck_lines.csv"))
