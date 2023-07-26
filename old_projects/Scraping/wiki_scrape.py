import pandas as pd
import os
import requests
from bs4 import BeautifulSoup


def scrape_wiki_table(url):
    tables = pd.read_html(url, header=0)
    for i in range(len(tables)):
        if not tables[i].empty:
            tables[i].to_csv(f'table_{i}.csv', sep=',', index=False)

# You can call the function with the URL of the Wikipedia page as follows:
#scrape_wiki_table('https://en.wikipedia.org/wiki/List_of_municipalities_of_Norway')



# The base URL for the website
base_url = "https://lokalhistoriewiki.no"

# The page with the table
page_url = "/wiki/Kommunev%C3%A5pen_(tabell)"

# Send a GET request to the page
response = requests.get(base_url + page_url)

# Parse the HTML of the page with BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')

# Find all table row elements
rows = soup.find_all('tr')

# Iterate over each row
for row in rows:
    # Find all img elements in the row
    imgs = row.find_all('img')

    # Iterate over each img
    for img in imgs:
        # Get the source URL of the img
        src = img.get('old_projects')

        # Check if old_projects is not None
        if src is not None:
            # Get the name of the image file
            file_name = os.path.basename(src)

            # Send a GET request to the image URL
            img_response = requests.get(base_url + src, stream=True)

            # Check if the GET request is successful
            if img_response.status_code == 200:
                # Open the image file in write-binary mode
                with open(file_name, 'wb') as f:
                    # Write the content of the response to the file
                    f.write(img_response.content)
