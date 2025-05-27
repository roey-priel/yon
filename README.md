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

## Backend Setup

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

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd job-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. In a separate terminal, start the CSS watcher for Tailwind:
```bash
npm run dev:css
```

The frontend will be available at `http://localhost:3000`

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