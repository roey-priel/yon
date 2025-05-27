import os

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

# Initialize in-memory database
in_memory_db = {
    'jobs': {}  # Dictionary to store jobs
}

def update_job(job_id, updates):
    """Update job in the active database"""
    try:
        if FIREBASE:
            job_ref = db.collection('jobs').document(job_id)
            job_ref.update(updates)
        else:
            if job_id in in_memory_db['jobs']:
                in_memory_db['jobs'][job_id].update(updates)
    except Exception as e:
        print(f"Error updating job {job_id}: {e}")

def get_job(job_id):
    """Get job from the active database"""
    try:
        if FIREBASE:
            job_ref = db.collection('jobs').document(job_id)
            job_doc = job_ref.get()
            return job_doc.to_dict() if job_doc.exists else None
        else:
            return in_memory_db['jobs'].get(job_id)
    except Exception as e:
        print(f"Error getting job {job_id}: {e}")
        return None

def store_job(job_id, job_data):
    """Store job in the active database"""
    try:
        if FIREBASE:
            db.collection('jobs').document(job_id).set(job_data)
        else:
            in_memory_db['jobs'][job_id] = job_data
    except Exception as e:
        print(f"Error storing job {job_id}: {e}")

def delete_job_from_db(job_id):
    """Delete job from the active database"""
    try:
        if FIREBASE:
            db.collection('jobs').document(job_id).delete()
        else:
            if job_id in in_memory_db['jobs']:
                del in_memory_db['jobs'][job_id]
    except Exception as e:
        print(f"Error deleting job {job_id}: {e}")

def list_all_jobs():
    """List all jobs from the active database"""
    try:
        if FIREBASE:
            jobs_ref = db.collection('jobs')
            return [doc.to_dict() for doc in jobs_ref.stream()]
        else:
            return list(in_memory_db['jobs'].values())
    except Exception as e:
        print(f"Error listing jobs: {e}")
        return [] 