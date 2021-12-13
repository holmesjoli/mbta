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

green <- paste("place",
               c("lech", "spmnl", "north", "haecl", "gover", "pktrm", "boyls", "armnl", 
                 "coecl", "hymnl", "kencl"), sep = "-")

green_e <- paste("place",
                 c("coecl", "prmnl", "symcl", "nuniv", "mfa", "lngmd", "brmnl",
                   "fenwd", "mispk", "rvrwy", "bckhl", "hsmnl"), sep = "-")

green_d <- paste("place",
                 c("kencl", "fenwy", "longw", "bvmnl", "brkhl", "bcnfd", "rsmnl",
                   "chhil", "newto", "newtn", "eliot", "waban", "woodl", "river"),
                 sep = "-")

green_c <- paste("place",
                 c("kencl", "smary", "hwsst", "kntst", "stpul", "cool", "sumav",
                   "bndhl", "fbkst", "bcnwa", "tapst", "denrd", "engav", "clmnl"),
                 sep = "-")


green_b <- paste("place",
                 c("kencl", "bland", "buest", "bucen", "buwst", "stplb", "plsgr",
                   "babck", "brico", "harvd", "grigg", "alsgr", "wrnst", "wascm",
                   "sthld", "chswk", "chill", "sougr", "lake"),
                 sep = "-")

dm_lat_long <- function(network, green_net = FALSE) {
  
  df <- network$lat_long %>% do.call(rbind, .) %>%
    as.data.frame() %>%
    dplyr::rename(x = V1,
                  y = V2) %>%
    dplyr::mutate(name = names(network$lat_long))
  
  if (green_net) {

    df <- df %>%
      dplyr::mutate(x = x - 12.24264,
                    y = y + 1.050253
      )
    
    ord <- c(paste0("green-", green), paste0("green_e-", green_e),  
             paste0("green_d-", green_d), paste0("green_c-", green_c),
             paste0("green_b-", green_b))
    
    df <- df %>%
      dplyr::mutate(green = name %in% green,
                    green_e = name %in% green_e, 
                    green_d = name %in% green_d,
                    green_c = name %in% green_c,
                    green_b = name %in% green_b) %>%
      tidyr::pivot_longer(names_to = "line", values_to = "values", -c(x, y, name)) %>%
      dplyr::filter(values) %>%
      dplyr::select(-values) %>%
      dplyr::mutate(order = paste(line, name, sep = "-"))
    
    # df$x <- ifelse(df$name == "place-haecl", 8.49, df$x)
    # df$y <- ifelse(df$name == "place-haecl", 6, df$y)
    # 
    # df$x <- ifelse(df$name == "place-north", 8.49, df$x)
    # df$y <- ifelse(df$name == "place-north", 5, df$y)
    # 
    # df$x <- ifelse(df$name == "place-gover", 7.07, df$x)
    # df$y <- ifelse(df$name == "place-gover", 6, df$y)
    
  } else {
    
    ord <- c(paste0("orange-", orange), paste0("blue-", blue), paste0("red-", red), 
             paste0("red2-", red2))

    df <- df %>%
      dplyr::mutate(orange = name %in% orange,
                    blue = name %in% blue,
                    red = name %in% red,
                    red2 = name %in% red2) %>%
      tidyr::pivot_longer(names_to = "line", values_to = "values", -c(x, y, name)) %>%
      dplyr::filter(values) %>%
      dplyr::select(-values) %>%
      dplyr::mutate(order = paste(line, name, sep = "-"))
  }

  df <- df[match(ord, df$order),]

  df <- df %>%
    dplyr::mutate(seq = seq(1, dplyr::n(), 1))

  return(df)
}

other <- dm_lat_long(other_network) %>%
  dplyr::arrange(desc(seq))
green_pt <- dm_lat_long(green_network, green_net = TRUE)

beck_links <- other %>%
  dplyr::bind_rows(green_pt) %>%
  dplyr::select(-order)
 
readr::write_csv(beck_links,
                 file.path(pth, "beck_lines.csv"))


r <- lapply(1:13, function(z) {

  beck_links %>%
    dplyr::filter(line == "red") %>%
    dplyr::arrange(seq)
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(seq) 

r2 <-lapply(1:33, function(z) {
    
    beck_links %>%
      dplyr::filter(line == "red2") %>%
      dplyr::arrange(seq) %>%
      dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
    
  }) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

b <-lapply(1:20, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "blue") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

o <-lapply(1:14, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "orange") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(seq)

g <-lapply(1:20, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "green") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

ge <-lapply(1:20, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "green_e") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))


gd <-lapply(1:29, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "green_d") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

gc <-lapply(1:9, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "green_c") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

gb <-lapply(1:15, function(z) {
  
  beck_links %>%
    dplyr::filter(line == "green_b") %>%
    dplyr::arrange(seq) %>%
    dplyr::mutate(order2 = seq(1, dplyr::n(), 1))
  
}) %>% dplyr::bind_rows() %>% dplyr::arrange(order2) %>%
  dplyr::ungroup() %>%
  dplyr::mutate(order = seq(1, dplyr::n(), 1)) %>%
  dplyr::arrange(desc(order))

r %>%
  dplyr::bind_rows(r2) %>%
  dplyr::bind_rows(b) %>%
  dplyr::bind_rows(o) %>%
  dplyr::bind_rows(ge) %>%
  dplyr::bind_rows(gd) %>%
  dplyr::bind_rows(gc) %>%
  dplyr::bind_rows(gb) %>%
  dplyr::bind_rows(g) %>%
  readr::write_csv(file.path(pth, "beck_lines2.csv"))



