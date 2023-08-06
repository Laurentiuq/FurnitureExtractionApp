from flask import Flask, request, jsonify, send_from_directory
from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch
from utils import get_text_content, number_of_occurrences, crawl_page
import json
import os

app = Flask(__name__)



entity_labels = {
    "OTHER": 0,
    "PRODUCT": 1
}

label_list = list(entity_labels.keys())

model = AutoModelForTokenClassification.from_pretrained("best-model")
tokenizer = AutoTokenizer.from_pretrained("best-model")

def predictOnData(text_content):
    # A dict with the data identified as PRODUCT
    products = dict()
    # make a prediction for each sequence separated in text_content
    for sequence in text_content:
        sequence = sequence[:120]
        tokens = tokenizer.tokenize(tokenizer.decode(tokenizer.encode(sequence)))
        inputs = tokenizer.encode(sequence, return_tensors="pt")
        outputs = model(inputs)[0]
        predictions = torch.argmax(outputs, dim=2)
        token_pred = [(token, label_list[prediction]) for token, prediction in zip (tokens, predictions[0].tolist())]

        product = ""
        for token, pred_label in token_pred:
            if pred_label == 'PRODUCT':
                if token not in ["[CLS]", "", "[SEP]"]:
                    if token[0] == "#" and token[1] == "#":
                        product += token[2:]
                    else:
                        product += " " + token
                
        if product:
            print(product)
            products[product] = product
      
    return products

@app.route('/home', methods=["POST", "GET"])
def post_link():
    try:
        if request.method == 'POST':
            # holds data received from the user, url and option
            link_data = request.get_json()
            # initialize text_content to 0 so that it can be verified if any content was found on the url
            text_content = 0

            print(link_data)

            # data predicted as "PRODUCT" by the model, for multiple pages parsed it updates itself with the new found entities (with the products from predictOnData function)
            products = {}
            try:
                # If option2, find all the links inside the given url and predict on text extracted separately from them

                if(link_data['selectedOption'] == "option2"):
                    # get all urls found in the page
                    links = crawl_page(link_data['link'])
                    # due to time constraints parse only the first few urls
                    for link in links[:10]:
                        # there may be urls that are not accesible
                        try:
                            text_content = get_text_content(link)
                            products.update(predictOnData(text_content))
                        except:
                            continue
                else:
                    # if parsing one product page only, get the data and predict on it
                    text_content = get_text_content(link_data['link'])
                    products = predictOnData(text_content)
                # if no data was found return a message 
                if text_content == 0:
                    return jsonify({"Invalid":"Invalid"})
            
            except Exception as e:
                print(e)
                return "Invalid"
            
            # count the number of occurrences of some predifined products
            nr_occ = number_of_occurrences(products)
            result = {"nr_occ": nr_occ, "products": products}
            # print(result)

            return jsonify(result)
        
        elif request.method == "GET":
            with open('occurences.json', 'r') as occ_file:
                occ_dict = json.load(occ_file)
                # print(occ_dict)                    
                return number_of_occurrences(occ_dict)
    except Exception as e:
        return {"error": str(e)}



react_folder = ''
directory= os.getcwd()+ f'/{react_folder}/build/static'


@app.route('/')
def index():
    print("HELLO")
    ''' User will call with with thier id to store the symbol as registered'''
    path= os.getcwd()+ f'/{react_folder}/build'
    print(path)
    return send_from_directory(directory=path,path='index.html')

#
@app.route('/static/<folder>/<file>')
def css(folder,file):
    ''' User will call with with thier id to store the symbol as registered'''
    
    path = folder+'/'+file
    return send_from_directory(directory=directory,path=path)




if __name__ == '__main__':
    app.run(debug=True)