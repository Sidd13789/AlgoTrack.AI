# AlgoTrack.AI

**AI-powered LeetCode Tracker & Adaptive Coding Coach**

AlgoTrack.AI is a full-stack web application that helps developers track their LeetCode progress, analyze coding performance, monitor skill growth, and receive personalized problem recommendations.

## 🚀 Features

* 🔐 User Registration & Login
* 📊 Personalized coding dashboard
* 🧠 AI-powered problem recommendations
* 📈 Skill-wise performance tracking
* 📝 LeetCode problem tracking
* ⏱️ Submission and solving-time analysis
* 🎯 Adaptive recommendations based on user performance
* 📊 Interactive charts and progress visualization
* 🔄 Skill updates based on coding activity
* 👤 User profile management

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Recharts
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST API

### AI / ML

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn

## 📁 Project Structure

```text
AlgoTrack.AI/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── ...
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── package-lock.json
│
├── ml_service/
│   ├── scripts/
│   └── ...
│
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sidd13789/ALGOTRACK.AI.git
cd ALGOTRACK.AI
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Setup ML Service

Create and activate a Python virtual environment:

```bash
cd ../ml_service
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install required Python packages:

```bash
pip install -r scripts/require.txt
```

### 5. Environment Variables

Create a `.env` file in the backend directory and add your local configuration.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Never commit your `.env` file or expose API keys and secrets publicly.

## ▶️ Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

### Start ML Service

Run the ML service using the Python configuration provided in the `ml_service` directory.

The frontend, backend, and ML service should be running simultaneously for the complete application workflow.

## 🧠 How It Works

```text
User
  │
  ▼
React Frontend
  │
  ▼
Node.js + Express Backend
  │
  ├──────────────► MongoDB
  │
  ▼
ML Recommendation Service
  │
  ▼
Personalized Coding Recommendations
```

The application collects coding activity and performance information, processes the data through the backend and ML service, and uses the resulting insights to provide personalized recommendations.

## 📊 Core Modules

### Dashboard

Provides an overview of the user's coding activity, progress, skills, and performance.

### Problems

Allows users to explore and track coding problems and monitor their solving progress.

### Skill Tracking

Tracks performance across different DSA concepts and updates skill levels based on coding activity.

### AI Recommendations

Generates personalized problem recommendations based on the user's current performance and skill profile.

## 🔮 Future Improvements

* LeetCode API integration
* Advanced recommendation models
* Difficulty prediction
* Contest performance analytics
* Streak tracking
* More detailed learning paths
* Deployment with production infrastructure
* Real-time performance insights

## 👨‍💻 Author

**Siddhartha Dwivedi**

Computer Science & Engineering
Specialization: Artificial Intelligence & Machine Learning

GitHub: [Sidd13789](https://github.com/Sidd13789)

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
