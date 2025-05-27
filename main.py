import os
from flask import Flask
from flask_cors import CORS
from backend.v1 import job1, job2

# Create Flask app
app = Flask(__name__)
CORS(app)

# Register routes from job type modules
app.register_blueprint(job1.bp)
app.register_blueprint(job2.bp)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "firebase" if os.getenv('FIREBASE', 'False').lower() == 'true' else "in-memory"
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 