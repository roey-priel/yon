from flask import request, jsonify
import threading
import time
import uuid
from datetime import datetime
import os
from enum import Enum
from marshmallow import Schema, fields, ValidationError
from ..app import app
from utils.database import update_job, get_job, store_job, delete_job_from_db, list_all_jobs

# Configuration
FIREBASE = os.getenv('FIREBASE', 'False').lower() == 'true'

# Initialize Firebase if enabled
if FIREBASE:
    import firebase_admin
    from firebase_admin import credentials, firestore
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        FIREBASE = False

class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class JobInputSchema(Schema):
    """Schema for validating job input data"""
    input1 = fields.Str(required=True, allow_none=False, 
                       validate=lambda x: len(x.strip()) > 0 if isinstance(x, str) else True,
                       error_messages={"required": "input1 is required",
                                     "null": "input1 cannot be null"})
    input2 = fields.Raw(required=True, allow_none=False,
                       error_messages={"required": "input2 is required", 
                                     "null": "input2 cannot be null"})
    
    class Meta:
        # Reject unknown fields
        unknown = "EXCLUDE"

def long_running_job(input1, input2):
    """
    Abstract job function - replace with your actual job logic
    """
    # Simulate work with the inputs
    time.sleep(10)
    return {
        "result": "Job completed successfully", 
        "processed_input1": input1,
        "processed_input2": input2,
        "combined_result": f"{input1} + {input2}"
    }

def execute_job(job_id):
    """Execute job in background thread"""
    try:
        # Get job from database
        job_data = get_job(job_id)
        if not job_data:
            print(f"Job {job_id} not found")
            return
            
        # Update status to running
        started_at = datetime.utcnow().isoformat()
        update_job(job_id, {
            "status": JobStatus.RUNNING.value,
            "started_at": started_at
        })
        
        # Call the actual job function
        result = long_running_job(
            job_data["input_data"]["input1"], 
            job_data["input_data"]["input2"]
        )
        
        # Update with completion
        completed_at = datetime.utcnow().isoformat()
        update_job(job_id, {
            "status": JobStatus.COMPLETED.value,
            "result": result,
            "completed_at": completed_at
        })
        
    except Exception as e:
        # Update with error
        completed_at = datetime.utcnow().isoformat()
        update_job(job_id, {
            "status": JobStatus.FAILED.value,
            "error": str(e),
            "completed_at": completed_at
        })

def validate_job_inputs(data):
    """Validate incoming request body using Marshmallow schema"""
    schema = JobInputSchema()
    try:
        # This will validate and deserialize the data
        validated_data = schema.load(data)
        return True, None, validated_data
    except ValidationError as err:
        # Format error messages nicely
        error_messages = []
        for field, messages in err.messages.items():
            if isinstance(messages, list):
                error_messages.extend([f"{field}: {msg}" for msg in messages])
            else:
                error_messages.append(f"{field}: {messages}")
        
        return False, "; ".join(error_messages), None

@app.route('/job1', methods=['POST'])
def create_job():
    """Create a new long-running job"""
    # Validate request content type
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    # Get and validate input data
    input_data = request.get_json()
    is_valid, error_message, validated_data = validate_job_inputs(input_data)
    
    if not is_valid:
        return jsonify({"error": error_message}), 400
    
    job_id = str(uuid.uuid4())
    run_id = str(uuid.uuid4())  # Unique run ID for DB storage
    
    job_data = {
        "job_id": job_id,
        "run_id": run_id,
        "type": "job1",
        "status": JobStatus.PENDING.value,
        "input_data": validated_data,  # Use validated data
        "created_at": datetime.utcnow().isoformat(),
        "started_at": None,
        "completed_at": None,
        "result": None,
        "error": None
    }
    
    try:
        # Store job in database
        store_job(job_id, job_data)
        
        # Start job in background thread
        thread = threading.Thread(target=execute_job, args=(job_id,))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "message": "Job created successfully",
            "input_data": validated_data
        }), 202
        
    except Exception as e:
        return jsonify({"error": f"Failed to create job: {str(e)}"}), 500

@app.route('/job1/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status and details"""
    try:
        job = get_job(job_id)
        if not job or job.get('type') != 'job1':
            return jsonify({"error": "Job not found"}), 404
        
        # Calculate runtime if job has started
        runtime = None
        if job.get("started_at"):
            start_time = datetime.fromisoformat(job["started_at"])
            end_time = datetime.fromisoformat(job["completed_at"]) if job.get("completed_at") else datetime.utcnow()
            runtime = (end_time - start_time).total_seconds()
        
        response = {
            "job_id": job["job_id"],
            "run_id": job["run_id"],
            "type": job["type"],
            "status": job["status"],
            "input_data": job["input_data"],
            "created_at": job["created_at"],
            "started_at": job.get("started_at"),
            "completed_at": job.get("completed_at"),
            "runtime": runtime,
            "result": job.get("result"),
            "error": job.get("error")
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": f"Failed to get job: {str(e)}"}), 500

@app.route('/job1', methods=['GET'])
def list_jobs():
    """List all jobs with optional filtering"""
    try:
        jobs = [job for job in list_all_jobs() if job.get('type') == 'job1']
        
        # Optional filtering by status
        status_filter = request.args.get('status')
        if status_filter:
            jobs = [job for job in jobs if job['status'] == status_filter]
            
        # Optional pagination
        limit = int(request.args.get('limit', 50))
        jobs = jobs[:limit]
        
        # Order by creation time (newest first)
        jobs.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify(jobs)
        
    except Exception as e:
        return jsonify({"error": f"Failed to list jobs: {str(e)}"}), 500

@app.route('/job1/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Delete a job"""
    try:
        job = get_job(job_id)
        if not job or job.get('type') != 'job1':
            return jsonify({"error": "Job not found"}), 404
            
        delete_job_from_db(job_id)
        return jsonify({"message": "Job deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to delete job: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "firebase" if FIREBASE else "in-memory"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)