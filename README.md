# Job Manager Application

A full-stack application for managing long-running jobs, built with React frontend and Python Flask backend.

## Project Structure

```
.
├── job-manager/          # React frontend application
│   ├── src/             # React source code
│   ├── public/          # Static files
│   └── package.json     # Frontend dependencies
├── main.py              # Flask backend server
└── requirements.txt     # Python dependencies
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## Running the Application

The application consists of two parts that need to run simultaneously:

### Backend (Flask Server)

1. Create and activate a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python main.py
```

The backend server will start on `http://localhost:5000`

### Frontend (React App)

1. Open a new terminal window (keep the backend running in the first terminal)

2. Navigate to the frontend directory:
```bash
cd job-manager
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

5. In a third terminal window, start the CSS watcher for Tailwind:
```bash
cd job-manager
npm run dev:css
```

The frontend will be available at `http://localhost:3000`

> **Note**: You need to have both the backend (Flask) and frontend (React) servers running simultaneously for the application to work properly. The React app makes API calls to the Flask backend.

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /jobs` - Create a new job
- `GET /jobs` - List all jobs
- `GET /jobs/<job_id>` - Get job status
- `DELETE /jobs/<job_id>` - Delete a job
- `GET /health` - Health check endpoint

## Development

### Backend Development

The backend uses:
- Flask for the web server
- In-memory database (can be replaced with Firebase or other database)
- Marshmallow for input validation

### Frontend Development

The frontend uses:
- React for the UI
- Tailwind CSS for styling
- Lucide React for icons

## Building for Production

### Backend
The backend is ready for production. You can run it with:
```bash
python main.py
```

### Frontend
To build the frontend for production:
```bash
cd job-manager
npm run build
```

This will create optimized production files in the `build` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
