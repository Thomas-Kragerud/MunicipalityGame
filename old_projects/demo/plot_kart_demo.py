import geopandas as gpd
import matplotlib.pyplot as plt

# Load GeoJSON file
gdf = gpd.read_file('/fylker-og-kommuner-2020-master/Kommuner-small.json')

# Plot
fig, ax = plt.subplots(figsize=(10, 10))
gdf.plot(ax=ax)
plt.show()