import httpx
from openai import AzureOpenAI, BadRequestError
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

# Connect to client
def get_client():
    return AzureOpenAI(  
        azure_endpoint=os.environ.get('AZURE_AI_ENDPOINT'),  
        api_key=os.environ.get('AZURE_AI_API_KEY'),  
        api_version=os.environ.get('AZURE_AI_API_VERSION'),
        http_client = httpx.Client(verify=False)
    )
client = get_client()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', "")
    index_name = data.get('index_name', 'rag-storage')
    # search_params = data.get('search_params', {})
    # model_params = data.get('model_params', {})

    response = client.chat.completions.create(
        model="gpt-35-turbo-16k",
        messages=messages,
        extra_body={
            "data_sources": [{
                "type": "azure_search",
                "parameters": {
                    "endpoint": "https://shannon-search-ai.search.windows.net",
                    "index_name": 'rag-storage',
                    "authentication": {
                        "type": "api_key",
                        "key": os.environ.get('AZURE_AI_SEARCH_API_KEY')
                    },
                    "embedding_dependency": {
                        "type": "deployment_name",
                        "deployment_name": "text-embedding-3-large"
                    }
                }
            }]
        }
    )
    print(response)
    return jsonify(response.choices[0].message.content)

if __name__ == '__main__':
    app.run(debug=True)