from selenium import webdriver
from selenium.webdriver.common.by import By
import os
import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


base_url = "https://lokalhistoriewiki.no"
page_url = "/wiki/Kommunev%C3%A5pen_(tabell)"

# Setup the Selenium driver (you might need to adjust this based on your setup)
if not os.path.exists('kommunevåpen2'):
    os.makedirs('kommunevåpen2')


# Setup the Selenium driver (adjust based on your setup)
driver = webdriver.Chrome()

driver.get(base_url + page_url)

# Wait for the page to load initially
driver.implicitly_wait(10)

# To scroll the page
actions = ActionChains(driver)

# Set to store unique image URLs
image_urls = set()

# Scroll the page several times to load all images
counter = 1
for _ in range(50):  # adjust the range based on how long the page is
    # Collect images after each scroll
    img_elements = driver.find_elements(By.TAG_NAME, 'img')

    for img_elem in img_elements:
        src = img_elem.get_attribute('src')
        if src and (src.endswith('.jpg') or src.endswith('.png') or src.endswith('.jpeg') or src.endswith('.svg')):
            image_urls.add(src)
            print(f'image {src} {counter}/356')

    # Scroll down
    actions.send_keys(Keys.PAGE_DOWN).perform()
    time.sleep(1)

# Now download the images
counter = 1
for img_url in image_urls:
    file_name = os.path.basename(img_url)
    img_response = requests.get(img_url, stream=True)

    if img_response.status_code == 200:
        with open(os.path.join('kommunevåpen2', file_name), 'wb') as f:
            f.write(img_response.content)
            print(f'Saved {file_name} {counter}/{len(image_urls)}')
            print(f'Saved {file_name} {counter}/356')

    time.sleep(1)

driver.quit()