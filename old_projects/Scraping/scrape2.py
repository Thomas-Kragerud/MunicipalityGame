import pandas as pd
import os
import requests
from bs4 import BeautifulSoup
import time


# Ensure the 'kommunevåpen' directory exists
if not os.path.exists('kommunevåpen'):
    os.makedirs('kommunevåpen')

base_url = "https://lokalhistoriewiki.no"
page_url = "/wiki/Kommunev%C3%A5pen_(tabell)"

response = requests.get(base_url + page_url)

soup = BeautifulSoup(response.text, 'html.parser')
rows = soup.find_all('tr')
counter = 1

for row in rows:
    imgs = row.find_all('img')

    for img in imgs:
        src = img.get('src')

        if src and (src.endswith('.jpg') or src.endswith('.png') or src.endswith('.jpeg')):
            img_url = base_url + src if not src.startswith('http') else src
            file_name = os.path.basename(img_url)
            img_response = requests.get(img_url, stream=True)

            if img_response.status_code == 200:
                with open(os.path.join('kommunevåpen', file_name), 'wb') as f:
                    f.write(img_response.content)
                    print(f'Saved {file_name} {counter}/356')
                    counter += 1

            # Introduce a small delay between requests
            time.sleep(1)