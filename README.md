# Haidarabbas Balospura - Portfolio

> Personal portfolio and AI resume tailoring tool built with React, TypeScript, and Vite.

---

## Features

- **Portfolio**: About, Skills, Projects, Experience, Contact sections with particle network and typewriter animations
- **Resume AI**: AI-powered resume tailoring at `/resume`
  - Dual-mode: **Owner** (password-protected, uses server-side API keys) and **Public** (users bring their own key)
  - **Multi-provider**: Gemini (Google AI) and OpenRouter (200+ models including Claude, GPT, Llama)
  - Dynamic model selection fetched live from each provider's API
  - Upload a PDF or paste text (LaTeX is also supported); no LaTeX knowledge needed
  - Tailored ATS-friendly PDF built in the browser, with a change diff, warnings for invented facts, and one-page fit
  - Switch models in place if a request fails or is slow
  - Privacy-first: public users' API keys are stored only in their browser's `localStorage`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Serverless | Serverless function for owner auth |
| Package Manager | Bun |
| AI Providers | Gemini API, OpenRouter API |
| PDF | @react-pdf/renderer (build), pdf.js (read) |
| Fonts | Playfair Display, JetBrains Mono, DM Sans |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A [Gemini API key](https://aistudio.google.com/apikey) or [OpenRouter key](https://openrouter.ai/keys) for testing the Resume AI page

### Installation

```bash
# Clone the repository
git clone https://github.com/haidarabbas731/Haidarabbas.dev.git
cd Haidarabbas.dev

# Install dependencies
bun install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
OWNER_PASSWORD=your_password_here
GEMINI_API_KEY=AIzaSy...        # optional
OPENROUTER_API_KEY=sk-or-...   # optional
```

> **Note:** These variables are server-side only (no `VITE_` prefix). They are only read by the serverless auth function and are never exposed to the browser bundle.

### Running Locally

```bash
bun run dev
```

Open [http://localhost:8080](http://localhost:8080).

---

## Project Structure

```
Haidarabbas.dev/
├── src/
│   ├── components/
│   │   ├── resume/           # Resume AI sub-components
│   │   │   ├── AccessModeSelector.tsx
│   │   │   ├── OwnerLogin.tsx
│   │   │   ├── PublicConfig.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── ResumeSourceInput.tsx
│   │   │   ├── ResumeDocument.tsx
│   │   │   ├── ResultTabs.tsx
│   │   │   ├── ChangesView.tsx
│   │   │   ├── ResumeWarnings.tsx
│   │   │   ├── JobDescriptionInput.tsx
│   │   │   ├── PdfPreview.tsx
│   │   │   ├── ResumeActions.tsx
│   │   │   └── TrustBadge.tsx
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   └── ...
│   ├── data/
│   │   └── baseResume.ts     # Owner's base resume
│   ├── hooks/
│   │   └── useResumeTailor.ts
│   ├── pages/
│   │   ├── Index.tsx         # Main portfolio page
│   │   └── ResumePage.tsx    # /resume page
│   ├── services/
│   │   ├── authService.ts    # Owner auth call + localStorage
│   │   ├── modelService.ts   # Gemini + OpenRouter model fetching
│   │   └── resumeService.ts  # AI tailoring (+ structuredTailor, renderResumePdf, pdfText)
│   └── types/
│       └── resume.ts         # TypeScript types
├── .env.example
└── vite.config.ts
```

---

## Resume AI: How It Works

### Dual-Mode Access

```
Owner Mode                          Public Mode
──────────                          ───────────
Enter password                      Select provider (Gemini / OpenRouter)
     ↓                                        ↓
Server function verifies            Enter your own API key (saved in localStorage)
     ↓                                        ↓
Returns server-side API keys        Upload a PDF or paste your resume
     ↓                                        ↓
Select provider + model             Select model from live list
     ↓                                        ↓
             ── Same tailoring pipeline ──
                Job description input
                        ↓
        AI returns structured resume JSON
                        ↓
   Checks: invented facts, diff, one-page fit
                        ↓
        ATS-friendly PDF built in the browser
                        ↓
               Preview + Download PDF
```

### Privacy

- Owner API keys live in server-side environment variables, never in the browser bundle
- Public users' API keys are stored only in `localStorage`, never sent to any server
- All AI calls are made directly from the browser to the provider (Google / OpenRouter)
