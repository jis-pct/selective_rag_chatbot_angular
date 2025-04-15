An Angular-based chatbot app that integrates with Azure OpenAI Foundry for RAG-powered conversations. 
Users can upload chosen documents to allow the chatbot to search these documents and answer questions about them. 
All parameters are fully customisable. Uses a Flask backend.

Ensure all parameters are added to `.env` (according to `.env.sample`), and relevant Python packages are installed from `requirements.txt`

Start Flask with:
```
cd flask --app ./python_backend/chatbot run 
```

Start the Angular app with:
```
cd angular_frontend
ng build
ng serve
```
