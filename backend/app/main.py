from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.routes import auth, portfolio_entry, asset, transaction, wallet
from app.middlewares.cors import setup_cors
from fastapi.openapi.utils import get_openapi
import json
from fastapi.responses import Response, HTMLResponse
from typing import Optional

app = FastAPI()
setup_cors(app)

# Include your routers AFTER defining routes
app.include_router(auth.router)
app.include_router(portfolio_entry.router)
app.include_router(asset.router)
app.include_router(transaction.router)
app.include_router(wallet.router)

@app.get("/api-docs/pdf", include_in_schema=False)
async def get_api_pdf():
    """Generate PDF documentation from OpenAPI spec"""
    try:
        # Get the OpenAPI schema
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
        )
        
        # Convert to pretty HTML for PDF generation
        html_content = generate_html_from_openapi(openapi_schema)
        
        # For now, return HTML to verify it works
        return HTMLResponse(content=html_content, status_code=200)
        
    except Exception as e:
        return HTMLResponse(
            content=f"<h1>Error generating PDF</h1><p>{str(e)}</p>",
            status_code=500
        )

def generate_html_from_openapi(schema: dict) -> str:
    """Convert OpenAPI schema to HTML"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{schema.get('info', {}).get('title', 'API Documentation')}</title>
        <meta charset="utf-8">
        <style>
            body {{ 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.6;
            }}
            h1 {{ color: #333; }}
            h2 {{ 
                background-color: #f4f4f4; 
                padding: 10px; 
                border-left: 4px solid #007bff;
                margin-top: 30px;
            }}
            .endpoint {{ 
                background-color: #f9f9f9; 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 5px;
                border: 1px solid #ddd;
            }}
            .method {{ 
                display: inline-block; 
                padding: 3px 8px; 
                border-radius: 3px; 
                font-weight: bold; 
                margin-right: 10px;
            }}
            .get {{ background-color: #61affe; color: white; }}
            .post {{ background-color: #49cc90; color: white; }}
            .put {{ background-color: #fca130; color: white; }}
            .delete {{ background-color: #f93e3e; color: white; }}
            code {{ 
                background-color: #eee; 
                padding: 2px 5px; 
                border-radius: 3px; 
                font-family: monospace;
            }}
            pre {{ 
                background-color: #f5f5f5; 
                padding: 15px; 
                border-radius: 5px; 
                overflow-x: auto;
            }}
        </style>
    </head>
    <body>
        <h1>{schema.get('info', {}).get('title', 'API Documentation')}</h1>
        <p><strong>Version:</strong> {schema.get('info', {}).get('version', '1.0.0')}</p>
        <p>{schema.get('info', {}).get('description', '')}</p>
    """
    
    # Add paths
    if 'paths' in schema:
        html += "<h2>Endpoints</h2>"
        for path, methods in schema['paths'].items():
            html += f"<div class='endpoint'>"
            html += f"<h3>{path}</h3>"
            
            for method, details in methods.items():
                method_class = method.lower()
                html += f"<div>"
                html += f"<span class='method {method_class}'>{method.upper()}</span>"
                html += f"<strong>{details.get('summary', '')}</strong>"
                html += f"<p>{details.get('description', '')}</p>"
                
                # Add request body schema if exists
                if 'requestBody' in details:
                    html += "<p><strong>Request Body:</strong></p>"
                    try:
                        content = details['requestBody']['content']
                        html += f"<pre>{json.dumps(content, indent=2)}</pre>"
                    except:
                        pass
                
                # Add responses
                if 'responses' in details:
                    html += "<p><strong>Responses:</strong></p>"
                    for status_code, response in details['responses'].items():
                        html += f"<p><code>{status_code}</code>: {response.get('description', '')}</p>"
                
                html += "</div><hr>"
            
            html += "</div>"
    
    # Add schemas/models
    if 'components' in schema and 'schemas' in schema['components']:
        html += "<h2>Data Models</h2>"
        for model_name, model_schema in schema['components']['schemas'].items():
            html += f"<div class='endpoint'>"
            html += f"<h3>{model_name}</h3>"
            html += f"<pre>{json.dumps(model_schema, indent=2)}</pre>"
            html += "</div>"
    
    html += """
        <script>
            // Simple script to add print functionality
            document.addEventListener('DOMContentLoaded', function() {
                console.log('API Documentation loaded');
            });
        </script>
    </body>
    </html>
    """
    
    return html

@app.get("/api-docs/json")
async def get_openapi_json():
    """Get raw OpenAPI JSON"""
    return get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )

# Optional: Add a simple HTML documentation page
@app.get("/api-docs/html", response_class=HTMLResponse)
async def get_api_html():
    """View API documentation as HTML page"""
    schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )
    html = generate_html_from_openapi(schema)
    return HTMLResponse(content=html)