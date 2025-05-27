import os
from flask import Flask
from flask_cors import CORS

FIREBASE = os.getenv('FIREBASE', 'False').lower() == 'true'

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "firebase" if FIREBASE else "in-memory"
    } 