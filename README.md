# Nexora — AI Personal Knowledge & Decision Assistant

**Your knowledge, connected. Your decisions, clearer.**

Nexora is an AI-powered personal knowledge and decision assistant designed to help users organize information, retrieve relevant knowledge, and turn scattered notes into meaningful insights. It combines a centralized knowledge library with an AI-powered question-answering interface to make personal information easier to explore and use.

## Problem Statement

People often store useful information across scattered notes and documents, making it difficult to find relevant details, connect ideas, and make informed decisions. Traditional note-taking systems primarily store information but may not help users actively explore it.

## Solution

Nexora brings personal knowledge into one place and provides a conversational interface for interacting with saved information. Users can manage knowledge sources, ask questions, and receive responses that reference relevant sources.

## Key Features

- **Knowledge Library:** Organize and manage saved knowledge sources.
- **AI Question Answering:** Ask questions through a conversational interface.
- **Source References:** Display source identifiers or references alongside answers where available.
- **Simple User Interface:** Navigate the knowledge library and assistant through a clean, responsive interface.
- **Persistent Storage:** Use a database to store application data.
- **Error Handling:** Communicate issues when AI requests fail or the service is temporarily unavailable.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Build Tool | Vite |
| Backend | Node.js, Express |
| Database | SQLite |
| AI Integration | Google Gemini API |

## Project Structure

```text
Nexora/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   └── database.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

*The structure above is representative; your actual repository may contain additional configuration files.*

## Getting Started

### Prerequisites

- Node.js and npm
- A Google Gemini API key
- Git (optional, for cloning the repository)

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd Nexora
```

Replace `YOUR_REPOSITORY_URL` with your GitHub repository URL.

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Add any other environment variables required by your backend configuration.

Start the backend using the script defined in `backend/package.json`. For example, if your project uses `tsx` and a `dev` script:

```bash
npm run dev
```

The backend is expected to run on `http://localhost:3001` if configured with that port.

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, commonly `http://localhost:5173`.

Ensure the frontend API URL matches the backend address and port.

## Environment Variables and Security

- Never commit your real `.env` file or API keys.
- Keep `.env` in `.gitignore`.
- Use `.env.example` with placeholder values when documenting required variables.
- Do not commit `node_modules` or generated build directories.
- Rotate exposed API keys immediately if they have been published.

## Current Scope and Limitations

Nexora is a prototype intended to demonstrate a personal knowledge management workflow with conversational AI.

- AI availability depends on the configured provider and its service limits.
- Answer accuracy depends on the information retrieved and provided to the model.
- Source references should be verified against the actual stored sources.
- Full document-content retrieval, reliable evidence citations, and production deployment should be considered complete only after testing and validation.



## Security

Nexora is intended to keep API credentials on the backend rather than expose them in frontend code. Do not publish private notes, credentials, or other sensitive information in a public repository.

## Acknowledgements

Built using open-source web technologies and the Google Gemini API.

---

**Nexora — Turn information into understanding, and understanding into action.**
