import geopandas as gpd
import folium
from config import PROJECT_ROOT
import sys
import os
#sys.path.append(os.getcwd().split('old_projects')[0])
map_path = os.path.join(PROJECT_ROOT, 'old_projects/data/fylker-og-kommuner-2020-master/Kommuner-small.json')

gdf = gpd.read_file(map_path)

# Initial map centered around Norway
m = folium.Map(location=[60.472, 8.4689], zoom_start=6)

# Add GeoDataFrame to map
for _, r in gdf.iterrows():
    # Generate a popup message that's shown when you click on a shape
    popup = folium.Popup(f"Municipality: {r['navn']}", max_width=300)

    # Create a GeoJson object for each row (each municipality)
    geojson = folium.GeoJson(r['geometry'], control=False)

    # Add the GeoJson object to the map, and bind the popup to it
    geojson.add_child(popup).add_to(m)

# Create map
m.save(os.path.join(PROJECT_ROOT, 'old_projects/html/map.html'))
