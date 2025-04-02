import httpx
from openai import AzureOpenAI, BadRequestError
from azure.storage.blob import BlobServiceClient
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
def get_openai_client():
    return AzureOpenAI(  
        azure_endpoint=os.environ.get('AZURE_AI_ENDPOINT'),  
        api_key=os.environ.get('AZURE_AI_API_KEY'),  
        api_version=os.environ.get('AZURE_AI_API_VERSION'),
        http_client = httpx.Client(verify=False)
    )

def get_blob_service_client():
    return BlobServiceClient.from_connection_string(os.environ.get("AZURE_STORAGE_CONNECTION_STRING"))

openai_client = get_openai_client()
blob_service_client = get_blob_service_client()

# Chat functions
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data["messages"]
    m_params = data["parameters"]["model"]
    s_params = data["parameters"]["search"]

    # Add system message if present
    if m_params["systemMessage"].strip() != "":
        messages.insert(0, {"role": "system", "content": m_params["systemMessage"]})

    try:
        response = openai_client.chat.completions.create(
            model=os.environ.get('AZURE_AI_CHAT_DEPLOYMENT'),
            messages=[
                    {"role": m["role"], "content": m["content"]}
                    for m in messages
                ],
            max_tokens=m_params["maxResponse"],
            temperature=m_params["temperature"],
            stop=None if m_params["stopPhrase"] == "" else [m_params["stopPhrase"]],
            top_p=m_params["topP"],
            frequency_penalty=m_params["frequencyPenalty"],
            presence_penalty=m_params["presencePenalty"],
            extra_body={
                "data_sources": [{
                    "type": "azure_search",
                    "parameters": {
                        "endpoint": os.environ.get('AZURE_AI_SEARCH_ENDPOINT'),
                        "index_name": s_params["indexName"],
                        "semantic_configuration": f"{s_params["indexName"]}-semantic-configuration",
                        "query_type": "vector_semantic_hybrid",
                        "in_scope": s_params["limitScope"],
                        "strictness": s_params["strictness"],
                        "top_n_documents": s_params["topNDocuments"],
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
    
    except BadRequestError as e:
        return jsonify({'error': 'Bad request error occurred.', 'details': str(e)})
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.', 'details': str(e)})
    
    # Add citations and return response
    citation_list = [f"[{x['title']}]({x["url"]})" for x in response.choices[0].message.context['citations']]
    return jsonify({'role': 'assistant', 'content': response.choices[0].message.content, 'displayableContent': add_citations(response.choices[0].message.content, citation_list)})

@app.route('/validate-index', methods=['POST'])
def validate_index():
    name = request.json['indexName']
    try:
        openai_client.chat.completions.create(
            model=os.environ.get('AZURE_AI_CHAT_DEPLOYMENT'),
            messages=[{"role": "user", "content": "What is in your database?"}],
            max_tokens=1,
            extra_body={  
                "data_sources": [{  
                    "type": "azure_search",  
                    "parameters": {  
                        "endpoint": os.environ.get('AZURE_AI_SEARCH_ENDPOINT'),  
                        "index_name": name,  
                        "authentication": {  
                            "type": "api_key",  
                            "key": os.environ.get('AZURE_AI_SEARCH_API_KEY')
                        }
                    }  
                }]
            } 
        )
        return jsonify({'valid': True})
    except BadRequestError as e:
        return jsonify({'valid': False})

def add_citations(content, citation_list):
    def citation_replacer(res, citation_list):
        return re.sub(r"\[doc\d+\]", lambda x: '[' + citation_list[int(x.group()[4:-1]) - 1] + ']', res)
    def duplicate_citation_remover(res):
        return re.sub(r"(\[\[.+\]\(.+\)\])\1+", r'\1', res)
    return duplicate_citation_remover(citation_replacer(content, citation_list))

# Storage functions
@app.route('/list-containers', methods=['GET'])
def list_containers():
    return [x['name'] for x in blob_service_client.list_containers()]

@app.route('/<container>/list-files', methods=['GET'])
def list_blobs(container):
    container_client = blob_service_client.get_container_client(container)
    blob_list = container_client.list_blobs()
    return [blob.name for blob in blob_list]

@app.route('/upload-file', methods=['POST'])
def upload_blob():
    container = request.form.get("container")
    file = request.files.get('file')
    try:
        blob_client = blob_service_client.get_blob_client(container=container, blob=file.filename)
        blob_client.upload_blob(file, overwrite=True)
        return jsonify({'success': True })
    except Exception as e:
        return jsonify({'success': False })

@app.route('/delete-file', methods=['POST'])
def delete_blob():
    container = request.json.get("container")
    filename = request.json.get("filename")
    try:
        blob_client = blob_service_client.get_blob_client(container=container, blob=filename)
        blob_client.delete_blob()
        return jsonify({'success': True })
    except Exception as e:
        return jsonify({'success': False })

if __name__ == '__main__':
    app.run(debug=True)