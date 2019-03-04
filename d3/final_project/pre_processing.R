library(countrycode)
library(extrafont)
library(RColorBrewer)
library(lubridate)
library(tidyverse)
library(readxl)
library(scales)
library(devtools)
library(aidtools)
library(ggalluvial)
library(here)
library(dplyr)
library(treemapify)
library(sf)
library(lwgeom)
library(grid)
library(gridExtra)
library(ggplot2)
library(jsonlite)

# use data cleaning script from exploration plots assignment to load and clean data
source(here("data_cleaning.R"))

### Exploring new PPD database + Geocoded World Bank data ###

wb_geo <- read.csv(here("data/WorldBank_Geocoded/data","level_1a.csv"), header = TRUE, sep= ",", fill = TRUE)

# generate date and year variables #
ppd_wb <- merge(x=wb_geo, y=data_sdg, by.x="project_id", by.y="wb_project_id", all.x = FALSE, all.y = FALSE)
length(unique(ppd_wb[["project_id"]]))
ppd_wb_country <-ppd_wb %>% group_by(country_code) %>% summarize(count = n())


data_wb_Ghana <- ppd_wb %>% filter(country_name == "Ghana") %>% select(project_id, precision_code, place_name, latitude, longitude, 
                                                                       project_title, start_actual_isodate, end_actual_isodate, total_commitments,
                                                                       total_disbursements, even_split_commitments, even_split_disbursements,
                                                                       six_overall_rating, performance_cat, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
                                                                       goal_14, goal_15, goal_16, goal_17, six_overall_rating) %>%
  gather(key = "goal", value, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17) %>% select(-value) %>% filter(!is.na(latitude) & !is.na(longitude)) %>% arrange(desc(total_commitments))

data_wb_Ghana %>% 
  toJSON() %>%
  write_lines('d3/final_project/d3_ghana_data.json')


