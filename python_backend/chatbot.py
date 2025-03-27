import httpx
from openai import AzureOpenAI, BadRequestError
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Start flask app and load environment variables
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

# Receive chat messages and return response
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', "")
    index_name = data.get('index_name', '')
    # search_params = data.get('search_params', {})
    # model_params = data.get('model_params', {})

    response = client.chat.completions.create(
        model=os.environ.get('AZURE_AI_CHAT_DEPLOYMENT'),
        messages=[
                {"role": m["role"], "content": m["content"]}
                for m in messages
            ],
        extra_body={
            "data_sources": [{
                "type": "azure_search",
                "parameters": {
                    "endpoint": "https://shannon-search-ai.search.windows.net",
                    "index_name": index_name,
                    "semantic_configuration": f"{index_name}-semantic-configuration",
                    "query_type": "vector_semantic_hybrid",
                    "authentication": {
                        "type": "api_key",
                        "key": os.environ.get('AZURE_AI_SEARCH_API_KEY')
                    },
                    "fields_mapping": {
                            "content_fields_separator": "\\n",
                            "title_field": "title",
                            "url_field": "url"
                        },
                    "embedding_dependency": {
                        "type": "deployment_name",
                        "deployment_name": os.environ.get('AZURE_AI_EMBEDDING_NAME')
                    }
                }
            }]
        }
    )
    
    # Add citations and return response
    citation_list = [f"[{x['title']}]({x["url"]})" for x in response.choices[0].message.context['citations']]
    return jsonify({'role': 'assistant', 'content': response.choices[0].message.content, 'displayableContent': add_citations(response.choices[0].message.content, citation_list)})

# Add citations to the response
def add_citations(content, citation_list):
    def citation_replacer(res, citation_list):
        return re.sub(r"\[doc\d+\]", lambda x: '[' + citation_list[int(x.group()[4:-1]) - 1] + ']', res)
    def duplicate_citation_remover(res):
        return re.sub(r"(\[\[.+\]\(.+\)\])\1+", r'\1', res)
    return duplicate_citation_remover(citation_replacer(content, citation_list))

if __name__ == '__main__':
    app.run(debug=True)