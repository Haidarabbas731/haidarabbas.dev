export const BASE_RESUME_LATEX = `\\documentclass[letterpaper,10pt]{article}

% ──────────────────────────────────────────────
% ATS-Friendly Resume — No graphics, no columns,
% no tables-within-tables, clean text extraction.
% ──────────────────────────────────────────────

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=0.45in, top=0.35in, bottom=0.35in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}

% ── Colors ────────────────────────────────────
\\definecolor{accent}{HTML}{1A73E8}
\\definecolor{darktext}{HTML}{202124}
\\definecolor{graytext}{HTML}{5F6368}

\\hypersetup{
  colorlinks=true,
  urlcolor=accent,
  linkcolor=accent,
  pdfborder={0 0 0}
}

% ── Typography ────────────────────────────────
\\color{darktext}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\pagestyle{empty}

\\titleformat{\\section}
  {\\large\\bfseries\\color{darktext}\\scshape}
  {}{0em}{}[\\vspace{-6pt}\\textcolor{accent}{\\rule{\\textwidth}{0.8pt}}\\vspace{-5pt}]
\\titlespacing*{\\section}{0pt}{5pt}{2pt}

\\setlist[itemize]{
  leftmargin=14pt,
  itemsep=1pt,
  parsep=0pt,
  topsep=1pt,
  label=\\textcolor{accent}{\\textbullet}
}

% ── Custom Commands ───────────────────────────
\\newcommand{\\resumeheader}[5]{%
  \\begin{center}
    {\\LARGE\\bfseries #1}\\\\[4pt]
    {\\small\\color{graytext} #2 \\,$\\vert$\\, #3 \\,$\\vert$\\, #4 \\,$\\vert$\\, #5}
  \\end{center}
  \\vspace{-2pt}
}

\\newcommand{\\experienceentry}[4]{%
  \\vspace{2pt}
  {\\textbf{#1}\\hfill\\textbf{\\small #2}}\\\\
  {\\textit{\\color{graytext}#3\\hfill #4}}
  \\vspace{1pt}
}

\\newcommand{\\projectentry}[1]{%
  \\vspace{2pt}
  {\\textbf{#1}}
  \\vspace{1pt}
}

% ══════════════════════════════════════════════
\\begin{document}

\\resumeheader
  {Haidarabbas Balospura}
  {haidarabbasbalospura@gmail.com}
  {+91\\,955\\,861\\,4908}
  {\\href{https://www.linkedin.com/in/haidarabbas-balospura/}{LinkedIn}}
  {\\href{https://github.com/haidarabbas731}{GitHub}}

\\section{Summary}
AI/ML Engineer with expertise in fine-tuning Large Language Models, building multi-agent systems, and deploying end-to-end ML pipelines at scale. Specialized in NLP, generative AI, and workflow automation with a proven track record of reducing manual effort through intelligent automation. Strong foundations in transformer architectures, model optimization, and production ML systems.

\\section{Professional Experience}

\\experienceentry
  {AI/ML Engineer --- Contractor}
  {PopAI Agency}
  {Remote}
  {Mar 2025 -- Present}
\\begin{itemize}
  \\item Designed and deployed \\textbf{autonomous AI agents across multiple categories} (data analysis, SEO, market research, content QA, and more) using Python and n8n, automating end-to-end workflows and significantly reducing manual effort.
  \\item Built and optimized intelligent task-handling systems by fine-tuning LLMs, achieving \\textbf{40\\% faster processing time} for complex natural language queries.
  \\item Developed synthetic data generation and benchmarking pipelines to accelerate model evaluation and ensure robust performance across diverse use cases.
\\end{itemize}

\\experienceentry
  {AI Engineer}
  {MantiQ Infotech}
  {Remote}
  {Jan 2025 -- Mar 2025}
\\begin{itemize}
  \\item Fine-tuned Large Language Models for text generation tasks, enhancing output accuracy and relevance using frameworks such as PyTorch, Hugging Face, and Unsloth.
  \\item Developed AI-driven chatbot and automation solutions; deployed models on \\textbf{AWS and GCP} for scalable, low-latency inference.
\\end{itemize}

\\experienceentry
  {Full-Stack Developer \\& AI Researcher}
  {MantiQ Infotech}
  {Remote}
  {Apr 2023 -- Dec 2024}
\\begin{itemize}
  \\item Engineered backend services using \\textbf{Node.js and Express}, optimizing REST API performance and enhancing system scalability with MongoDB integration.
  \\item Implemented secure authentication systems (JWT/OAuth) and integrated ML-driven features into backend pipelines to enhance automation and data analysis.
\\end{itemize}

\\section{Projects}

\\projectentry{Multi-Agent Orchestration Platform (Agno Framework)}
\\begin{itemize}
  \\item Architected a \\textbf{multi-agent system} using Agno with \\textbf{multi-tenant support}, enabling sandboxed agent orchestration with tenant-level isolation across concurrent users.
  \\item Implemented dynamic query-based agent routing, shared memory/context passing, tool/API integrations, and custom role-based agent personas for customer support, data pipelines, and research automation use cases.
\\end{itemize}

\\projectentry{Generative AI Applications \\& Model Development}
\\begin{itemize}
  \\item Developed and fine-tuned transformer-based models for text generation and predictive analytics; researched and implemented state-of-the-art NLP techniques.
  \\item Built multi-source RAG chatbot, data analyst agent, SEO specialist agent, market research agent, and content quality checker agent---each deployed as autonomous AI-driven tools.
\\end{itemize}

\\section{Technical Skills}
\\textbf{Languages:} Python, JavaScript, TypeScript, SQL \\\\
\\textbf{ML/AI:} PyTorch, Hugging Face Transformers, Unsloth, Agno, LangChain, LLM Fine-Tuning (LoRA/QLoRA), RAG, NLP, Generative AI \\\\
\\textbf{Tools \\& Platforms:} n8n, Jupyter, Git, Docker, AWS, GCP, MongoDB, Node.js, Express \\\\
\\textbf{Core Competencies:} Large Language Models, Multi-Agent Systems, AI Agent Design, Workflow Automation, Model Optimization, Scalable ML Deployment

\\section{Education}
\\experienceentry
  {Bachelor of Computer Applications (BCA)}
  {D.L. Patel Institute of Management \\& Technology}
  {Himmatnagar, Gujarat}
  {Jun 2023 -- Apr 2026}

\\end{document}`;
