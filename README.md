# AI Gmail Generator ✉️✨

An AI-powered web application that drafts high-quality, professional, and context-tailored emails in seconds using Google Gemini.

Designed with a modern, responsive React interface and a high-performance Python FastAPI backend.

---

## 🌟 Key Features

- 🎯 **Targeted Context & Roles**: Select your recipient (Professor, HR Manager, Team Lead, etc.) and email purpose.
- ⚡ **9 Email Purpose Categories**:
  - Leave Request
  - Internship
  - Job Application
  - Follow-up
  - Meeting Request
  - Complaint
  - Thank You
  - College
  - General
- 🎨 **Adaptive Tone & Length**:
  - **Tones**: Formal, Professional, Friendly, Simple
  - **Lengths**: Short (1-2 paragraphs), Medium (balanced), Detailed (thorough)
- 🚀 **1-Click Actions**:
  - **Copy Email**: Copies full Subject + Body to clipboard with instant confirmation.
  - **Open in Gmail**: Opens the official Gmail web composer pre-filled with the generated subject and body.
  - **Regenerate**: Instantly generates an alternative draft with the same input criteria.
  - **Inline Editing**: Polish and edit the generated email directly in the app before copying or opening.
- 💡 **Quick Presets**: 1-click sample templates (Sick Leave, Internship Application, Meeting Request, Interview Follow-up) for instant testing.
- 🔒 **Secure Architecture**: API keys are strictly kept on the backend in `.env` and never exposed to the client.

---

## 🛠️ Technologies Used

- **Frontend**: React 19, Vite, Lucide Icons, Modern Responsive CSS
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, Python-Dotenv
- **AI**: Google Gemini API (`google-genai` / Gemini 2.5 & 1.5 Flash models)

---

## 📁 Project Structure

```text
ai-gmail-generator/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # App header & backend connection status
│   │   │   ├── EmailForm.jsx     # Input form, purpose dropdown & preset chips
│   │   │   └── EmailPreview.jsx  # Email preview card, copy & Gmail compose button
│   │   ├── App.jsx               # Main container & state management
│   │   ├── App.css               # Modern glassmorphism & responsive styles
│   │   ├── index.css             # Base reset & utility styles
│   │   └── main.jsx              # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py                   # FastAPI application & Gemini API integration
│   ├── requirements.txt          # Python backend dependencies
│   ├── .env.example              # Example environment variables template
│   └── .env                      # Local environment configuration (API keys)
│
├── .gitignore                    # Git ignore file
└── README.md                     # Project documentation
```

---

## 🔑 How to Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click on **"Create API Key"** and copy the generated key.

---

## ⚙️ Backend Setup & Configuration

### 1. Configure Environment Variables

Navigate to the `backend/` directory and configure `.env`:

```bash
cd backend
```

Open `.env` (or copy `.env.example` to `.env`):

```ini
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
PORT=8001
HOST=0.0.0.0
```

### 2. Install Python Dependencies

Make sure you have Python 3.10+ installed:

```bash
pip install -r requirements.txt
```

### 3. Start the Backend Server

```bash
python -m uvicorn main:app --reload --port 8001
```

The backend server will run on: `http://127.0.0.1:8001`
Interactive API documentation will be available at: `http://127.0.0.1:8001/docs`

---

## 💻 Frontend Setup

### 1. Install Node Dependencies

Navigate to the `frontend/` directory:

```bash
cd frontend
npm install
```

### 2. Start the Frontend Development Server

```bash
npm run dev
```

Open your browser and navigate to the displayed local address (usually `http://localhost:5173`).

---

## 🔄 How the Application Works

```
 ┌──────────────────────┐             ┌──────────────────────┐             ┌──────────────────────┐
 │    React Frontend    │  POST JSON  │   FastAPI Backend    │ API Prompt  │  Google Gemini API   │
 │ (Form / Tone / Preset)│ ──────────> │ (main:generate_email)│ ──────────> │ (gemini-2.5-flash)   │
 │                      │ <────────── │                      │ <────────── │                      │
 └──────────────────────┘  JSON Resp  └──────────────────────┘  JSON Resp  └──────────────────────┘
            │
            ├─► "Copy Email" (Copies subject + body to clipboard)
            └─► "Open in Gmail" (Opens https://mail.google.com/mail/?view=cm...)
```

1. **User Input**: The user enters the recipient, picks a purpose (e.g. *Leave Request*), describes their situation, and selects tone and length.
2. **API Request**: The React application sends a `POST` request to `/generate-email`.
3. **AI Generation**: FastAPI constructs an engineered prompt instructing Google Gemini to return a structured JSON response with `subject` and `body`.
4. **Interactive Preview**: The frontend renders the subject and formatted body with rich options:
   - Edit inline
   - Copy to clipboard with 1 click
   - Open in Gmail's official compose window with subject and body pre-populated for final review and sending!

---

## 📝 License

MIT License. Feel free to use and adapt for college mini-projects, portfolios, or personal productivity!
