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

# use data cleaning script from exploration plots assignment to load and clean data
source(here("data_cleaning.R"))

### Create SDG Ghana Data, selecting max sdg by funding###

data_sdg_Ghana <- data_sdg %>%
  filter(country_name == "Ghana" & completion_year > 2000) %>%
  select(aiddata_id, wb_project_id, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17, six_overall_rating, performance_cat, satisfactory, donor) %>%
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


data_wb_ghana <- ppd_wb %>% select(project_id, six_overall_rating, performance_cat, project_title, start_actual_isodate, end_actual_isodate, total_commitments,
                                   total_disbursements, even_split_commitments, even_split_disbursements, goal, goal_name, latitude, longitude, geoname_id) %>% 
  filter(!is.na(latitude) & !is.na(longitude)) %>% arrange(desc(total_commitments))

data_wb_ghana %>% 
  toJSON() %>%
  write_lines('d3_ghana_data.json')


data_gj <-  geojson_write(data_wb_ghana, lat = 'latitude', lon = 'longitude',  file = "ghana_wb.geojson")


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
  write_lines('d3_ghana_priority.json')


data_gp_rating <- data_sdg_Ghana %>% filter(donor == "WB") %>% group_by(wb_project_id) %>% group_by(six_overall_rating) %>% summarise(count= n())
data_gp_rating %>% 
  toJSON() %>%
  write_lines('d3_ghana_perf_count.json')


############################
#########SCRATCH############
#############################


(country_name == "Ghana") %>% select(project_id, precision_code, place_name, latitude, longitude, 
                                     project_title, start_actual_isodate, end_actual_isodate, total_commitments,
                                     total_disbursements, even_split_commitments, even_split_disbursements,
                                     six_overall_rating, performance_cat, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
                                     goal_14, goal_15, goal_16, goal_17, six_overall_rating) %>%
  gather(key = "goal", value, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17) %>% select(-value) %>% 

  ### Rename SDGs ###
  
  #precision_code, place_name, latitude, longitude, 
  
  data_sdg_ghana <- data_sdg %>% filter(country_name == "Ghana") %>% select(wb_project_id, six_overall_rating, performance_cat, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6,
                                                                            goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
                                                                            goal_14, goal_15, goal_16, goal_17, six_overall_rating) %>%
  gather(key = "goal", value, goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, goal_9, goal_10, goal_11, goal_12, goal_13,
         goal_14, goal_15, goal_16, goal_17) %>% select(-value) 


# rename goal numbers to goal names
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_1"] <- "No poverty"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_2"] <- "Zero hunger"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_3"] <- "Good health"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_4"] <- "Quality education"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_5"] <- "Gender equality"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_6"] <- "Clean water/sanitation"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_7"] <- "Affordable/clean energy"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_8"] <- "Economic growth"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_9"] <- "Industry/infra."
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_10"] <- "Reduced inequalities"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_11"] <- "Sustainable cities"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_12"] <- "Responsible consumption"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_13"] <- "Climate Action"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_14"] <- "Life below water"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_15"] <- "Life on land"
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_16"] <- "Peace/justice & strong inst."
data_sdg_ghana$goal[data_sdg_ghana$goal == "goal_17"] <- "Partnerships for the goals"





### Merge in World Bank Data ###

wb_geo <- read.csv(here("data/WorldBank_Geocoded/data","level_1a.csv"), header = TRUE, sep= ",", fill = TRUE)

# generate date and year variables #
ppd_wb <- merge(x=wb_geo, y=data_sdg_ghana, by.x="project_id", by.y="wb_project_id", all.x = FALSE, all.y = FALSE)
length(unique(ppd_wb[["project_id"]]))
#ppd_wb_country <-ppd_wb %>% group_by(country_code) %>% summarize(count = n())


