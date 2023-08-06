import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import requests
from collections import Counter
from urllib.parse import urljoin

def get_text_content(url):
    try:
        print("url: ", url)
        response = requests.get(url)
    except Exception as e:
        print(e)
        return e
    if response.status_code != 200:
        return 0
    
    try:
        soup = BeautifulSoup(response.text, 'html.parser')
    
    
        body_text = soup.find('body')
        text_content = body_text.get_text()
        cleaned_text = re.sub(r'\n\s*\n*', '\n', text_content.strip(), flags=re.M)
        text_to_predict = cleaned_text.split('\n')

        return text_to_predict
    except Exception as e:
        print(e)

def crawl_page(url):
    try:
        response = requests.get(url)
        response.raise_for_status()

        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            try:
                print(urljoin(url, href))
                links.append(urljoin(url, href))
            except:
                pass
        return links
    except Exception as e:
        print(e)
        print("Link error")
        return []

def number_of_occurrences(predicted_products):
    most_common = ['bed', "sofa", "table", "chair", "bed", "wardrobe", "desk", "lamp", "shelf", "couch", "chest", "mirror", "carpet"]
    all_words = ' '.join(predicted_products).split()
    nr_occurrences = Counter(all_words)
    most_common_occ = {}
    for obj in most_common:
        most_common_occ[obj] = nr_occurrences.get(obj, 0)
    
    print(most_common_occ)
    return most_common_occ
        



#TODO
def get_text_from_multiple_links(url):
    pass
