from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
import random
from bs4 import BeautifulSoup
import os
import requests
import time
import pandas as pd

names = []
links = []
ids = []
texts = []
fylke = []

base_url = "https://no.m.wikipedia.org/wiki/Kommunev%C3%A5pen_i_Norge"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Referer": "https://no.m.wikipedia.org/"
}
main_directory = 'kommuner'
if not os.path.exists(main_directory):
    os.makedirs(main_directory)

# Initialize the Selenium driver
driver = webdriver.Chrome()

# Navigate to the Wikipedia page
driver.get(base_url)

# Scroll down to load all content
actions = ActionChains(driver)
for _ in range(50):  # Adjust the range based on the length of the page
    actions.send_keys(Keys.PAGE_DOWN).perform()
    time.sleep(0.3)

# Extract the content and parse it
page_content = driver.page_source
soup = BeautifulSoup(page_content, 'html.parser')
sections = soup.find_all('section', class_=lambda x: x and 'mf-section-' in x)
max_iter = 1000
i = 0
unnamed_iter = 1
for section in sections:
    folder_name_element = section.find('li', class_='gallerycaption')
    if folder_name_element:
        folder_name = os.path.join(main_directory, folder_name_element.text.strip()).split(' ')[-2]
        print(folder_name)
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)
    else:
        folder_name = 'TBD' + str(unnamed_iter)
        unnamed_iter += 1
        print(folder_name)
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        # Extract images from the gallery boxes within the section
        gallery_boxes = section.find_all('li', class_='gallerybox')
        for box in gallery_boxes:
            name = "TBD"
            id = "TBD"
            if i >= max_iter:
                break
            # name
            p_tag = box.find('p')
            if p_tag:
                # Extract name
                a_tag = p_tag.find('a')
                if a_tag:
                    temp = a_tag.text.strip().split(' ')
                    name = temp[-1]
                    names.append(name)
                    links.append("https://no.m.wikipedia.org" + a_tag['href'])

                    # Extract ID from the title (assuming the ID format is always digits followed by a space)
                    id = temp[0]
                    ids.append(id)

                    # Extract text (remove the name and ID from the text)
                    text = p_tag.text.replace(a_tag.text, '').strip()
                    texts.append(text)
                    fylke.append(folder_name)
                    print(f"Name: {a_tag.text.strip()}")
                    print(f"ID: {a_tag['title'].split(' ')[0]}")
                    print(f"Text: {text}")
                    print(f"Fylke: {folder_name}")
                    print()

            # image
            a_tag = box.find('a', class_='mw-file-description')
            if a_tag and a_tag.has_attr('href'):
                img_page_url = "https://no.m.wikipedia.org" + a_tag['href']
                driver.get(img_page_url)

                raw = driver.page_source
                content = BeautifulSoup(raw, 'html.parser')
                body = content.find('div', class_='fullImageLink')
                if body:
                    a_tag = body.find('a')
                    if a_tag and a_tag.has_attr('href'):
                        img_url = "https:" + a_tag['href']
                        print(img_url)

                        img_response = requests.get(img_url, stream=True, headers=HEADERS)
                        time.sleep(1 + random.random())  # wait for 2 seconds
                        print(f"Response code: {img_response.status_code}")
                        file_ext = os.path.basename(img_url).split('.')[-1]
                        save_path = os.path.join(folder_name, f"{id}_{name}.{file_ext}")
                        print(f"Saving to: {save_path}")

                        if img_response.status_code == 200:
                            with open(save_path, 'wb') as f:
                                f.write(img_response.content)
                                print(f'Saved {img_url} {i}/{max_iter}')
                                i += 1

driver.quit()  # Close the driver at the end

df = pd.DataFrame({
    'name': names,
    'link': links,
    'id': ids,
    'text': texts,
    'fylke': fylke
})