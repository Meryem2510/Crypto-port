from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """
    Configure CORS middleware for the FastAPI application
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",  # Vite default
            "http://localhost:3000",  # React default
            "http://localhost:5174",  # Alternative Vite port
            # Add your production frontend URL here when deploying
        ],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
        allow_headers=["*"],  # Allows all headers
    )
    
    return app