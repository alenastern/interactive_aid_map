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
library(geojsonio)

# use data cleaning script from static portfolio to load and clean data

# assumes running from exploring-aid-performance r project
source(here("data_cleaning.R"))

# assumes that static portfolio directory and interactive directory are sibling directories
wd <- getwd()
setwd("..")
parent <- getwd()
setwd(wd)

### Create SDG Ghana Data, selecting max sdg by funding###

data_sdg_Ghana <- data_sdg %>%
  filter(country_name == "Ghana" & completion_year > 2000) %>%
  select(aiddata_id, wb_project_id, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17, six_overall_rating, performance_cat, coalesced_purpose_code, satisfactory, donor) %>%
  gather(key = "goal", value = "funding", goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17) %>%
  filter(funding > 0 & !is.na(satisfactory))

data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_1"] <- "No poverty"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_2"] <- "Zero hunger"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_3"] <- "Good health"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_4"] <- "Quality education"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_5"] <- "Gender equality"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_6"] <- "Clean water/sanitation"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_7"] <- "Affordable/clean energy"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_8"] <- "Economic growth"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_9"] <- "Industry/infra."
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_10"] <- "Reduced inequalities"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_11"] <- "Sustainable cities"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_12"] <- "Responsible consumption"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_13"] <- "Climate Action"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_14"] <- "Life below water"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_15"] <- "Life on land"
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_16"] <- "Peace/justice & strong inst."
data_sdg_Ghana$goal_name[data_sdg_Ghana$goal == "goal_17"] <- "Partnerships for the goals"


data_sdg_Ghana <- data_sdg_Ghana %>% group_by(wb_project_id) %>% slice(which.max(funding))
  #filter(funding == max(funding))


# read in LTL data#

ltl_Ghana <- ltl %>% filter(CountryID == "Ghana") %>%
  mutate(rank = rank(-p, ties.method = "random"))

### CREATE MAIN DATA ###

# read in geocoded data
wb_geo <- read.csv(here("data/WorldBank_Geocoded/data","level_1a.csv"), header = TRUE, sep= ",", fill = TRUE)

# merge geocoded and sdg data
ppd_wb <- merge(x=wb_geo, y=data_sdg_Ghana, by.x="project_id", by.y="wb_project_id")

nationwide_lat = 5.4
nationwide_long = 2.2

# Map nation-wide projects to the capital
ppd_wb['latitude'][is.na(ppd_wb['latitude'])] <- nationwide_lat
ppd_wb['longitude'][is.na(ppd_wb['longitude'])] <- nationwide_long

data_wb_ghana <- ppd_wb %>% select(project_id, six_overall_rating, performance_cat, project_title, start_actual_isodate, end_actual_isodate, total_commitments,
                                  even_split_commitments, place_name, goal, goal_name, latitude, longitude, geoname_id) %>% 
  mutate(funding_cat = cut(total_commitments, breaks = c(0, 50000000, 100000000, 150000000, 200000000, 250000000, 300000000), 
                           labels = c(1, 2, 3, 4, 5, 6))) %>%
  filter(!is.na(latitude) & !is.na(longitude)) %>% arrange(desc(total_commitments))

data_wb_ghana %>% 
  toJSON() %>%
  write_lines(paste(parent,'/interactive_aid_map/d3_ghana_data.json', sep = ''))


data_gj <-  geojson_write(data_wb_ghana, lat = 'latitude', lon = 'longitude',  file = paste(parent,'/interactive_aid_map/ghana_wb.geojson', sep = ''))


### LTL Data ###

# reshape data for ghana and rank SDGs by total funding
data_wb_ghana_priority <- data_wb_ghana %>%
  group_by_at(c("project_id", "goal", "goal_name")) %>%
  summarise(
    project_funding = mean(total_commitments, na.rm = TRUE),
    performance = mean(six_overall_rating, na.rm = TRUE)
  )

data_wb_ghana_priority <- data_wb_ghana_priority %>%
  group_by_at(c("goal", "goal_name")) %>%
  summarise(
    goal_funding = sum(project_funding, na.rm = TRUE),
    goal_performance = mean(performance, na.rm = TRUE)
  )  


data_final <- data.frame(data_wb_ghana_priority)
data_wb_ghana_priority <- data_wb_ghana_priority %>%
   mutate(rank = dense_rank(-goal_funding)
  )

data_final <- data_final %>% mutate(rank = rank(-goal_funding))
  

# merge in Listening to Leaders survey data

ltl_ghana <- ltl %>% filter(CountryID == "Ghana") %>%
  mutate(rank = rank(-p, ties.method = "random"))

data_sdg_ghana_priority <- merge(x=data_final, y=ltl_ghana,by.x="goal_name", by.y="q8_response", all.x = TRUE, all.y = TRUE)
data_sdg_ghana_priority$rank.x[is.na(data_sdg_ghana_priority$rank.x)] <- 17
data_sdg_ghana_priority$rank.y[is.na(data_sdg_ghana_priority$rank.y)] <- 17
data_sdg_ghana_priority$discrete_performance = cut(data_sdg_ghana_priority$goal_performance, breaks= c(3, 3.5, 4, 4.5, 5, 5.5, 6))
data_sdg_ghana_priority$performance_cat <-cut(data_sdg_ghana_priority$goal_performance, seq(1,7,1), right = FALSE, labels=c("highly unsatisfactory", "unsatisfactory", 
                                                                                        "marginally unsatisfactory", "marginally satisfactory", 
                                                                                        "satisfactory", "highly satisfactory"))
data_sdg_ghana_priority <- data_sdg_ghana_priority %>% mutate(six_overall_rating = floor(goal_performance))

data_sdg_ghana_priority <- data_sdg_ghana_priority %>% rename(donor_priority = rank.x, leader_priority = rank.y)

data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "No poverty"] <- "goal_1"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name ==  "Zero hunger" ] <-"goal_2"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Good health"] <- "goal_3"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Quality education"] <- "goal_4"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Gender equality"] <- "goal_5"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Clean water/sanitation"] <- "goal_6"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Affordable/clean energy"] <- "goal_7"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Economic growth"] <- "goal_8"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Industry/infra."] <- "goal_9"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Reduced inequalities"] <- "goal_10"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Sustainable cities"] <- "goal_11"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Responsible consumption"] <- "goal_12"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Climate action"] <- "goal_13"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Life below water"] <- "goal_14"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Life on land"] <- "goal_15"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Peace/justice & strong inst."] <- "goal_16"
data_sdg_ghana_priority$goal[data_sdg_ghana_priority$goal_name == "Partnerships for the goals"] <- "goal_17"

data_sdg_ghana_priority %>% 
  toJSON() %>%
  write_lines(paste(parent,'/interactive_aid_map/d3_ghana_priority.json', sep = ''))


data_gp_rating <- data_sdg_Ghana %>% filter(donor == "WB") %>% group_by(wb_project_id) %>% group_by(six_overall_rating) %>% summarise(count= n())
data_gp_rating <- data_gp_rating %>% rename(category = six_overall_rating)
data_gp_rating %>% 
  toJSON() %>%
  write_lines(paste(parent,'/interactive_aid_map/d3_ghana_perf_count.json', sep = ''))

data_gp_funding <- data_wb_ghana %>% group_by(project_id) %>% summarise(proj_commitment = mean(total_commitments)) %>% 
  mutate(funding_cat = cut(proj_commitment, breaks = c(0, 50000000, 100000000, 150000000, 200000000, 250000000, 300000000), 
                           labels = c(1, 2, 3, 4, 5, 6))) %>% 
  group_by(funding_cat) %>% summarise(count = n()) %>% rename(category = funding_cat)
  data_gp_funding %>% 
    toJSON() %>%
    write_lines(paste(parent,'/interactive_aid_map/d3_ghana_fund_count.json', sep = ''))


