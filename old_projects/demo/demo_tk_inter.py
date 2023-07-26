from tkinter import *
import geopandas as gpd
import matplotlib.pyplot as plt
def show_kommune():
    print(f'You clikked on the municipality ')


root = Tk()
canvas = Canvas(root, width=500, height=500)
canvas.pack()

gdf = gpd.read_file('/fylker-og-kommuner-2020-master/Kommuner-small.json')
fig, ax = plt.subplots(figsize=(5, 5))
gdf.plot(ax=ax)
plt.savefig('map.png')
plt.close()

img = PhotoImage(file='../../map.png')
canvas.create_image(0, 0, anchor=NW, image=img)
#poly = gdf.loc[gdf['navn'] == 'Oslo']['geometry'].values[0]


canvas.create_polygon(10, 10, 10, 60, 50, 35, fill='red', activefill='blue', tags='kommune')
canvas.tag_bind('kommune', '<ButtonPress-1>', show_kommune)
root.mainloop()
