export interface Skill {
  name: string;
  description: string;
}

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "ML / AI",
    skills: [
      { name: "PyTorch", description: "Deep learning framework for research & production" },
      { name: "TensorFlow", description: "End-to-end ML platform" },
      { name: "Hugging Face", description: "Transformers, datasets & model hub" },
      { name: "LangChain", description: "LLM application framework" },
      { name: "OpenAI API", description: "GPT, embeddings & fine-tuning" },
      { name: "scikit-learn", description: "Classical ML & feature engineering" },
      { name: "JAX", description: "High-performance numerical computing" },
      { name: "ONNX", description: "Model interoperability & optimization" },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Python", description: "Primary language for ML & backend" },
      { name: "FastAPI", description: "High-performance async API framework" },
      { name: "Node.js", description: "JavaScript runtime for services" },
      { name: "PostgreSQL", description: "Relational database for structured data" },
      { name: "Redis", description: "In-memory cache & message broker" },
      { name: "Docker", description: "Containerization & reproducibility" },
      { name: "Kubernetes", description: "Container orchestration at scale" },
      { name: "GraphQL", description: "Flexible API query language" },
    ],
  },
  {
    category: "Frontend",
    skills: [
      { name: "React", description: "Component-based UI framework" },
      { name: "Next.js", description: "Full-stack React framework" },
      { name: "TypeScript", description: "Type-safe JavaScript" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework" },
      { name: "Three.js", description: "3D graphics & WebGL" },
      { name: "D3.js", description: "Data visualization library" },
    ],
  },
  {
    category: "Cloud / MLOps",
    skills: [
      { name: "AWS", description: "SageMaker, Lambda, S3, EC2" },
      { name: "GCP", description: "Vertex AI, BigQuery, Cloud Run" },
      { name: "MLflow", description: "ML experiment tracking & registry" },
      { name: "Weights & Biases", description: "Experiment tracking & visualization" },
      { name: "CI/CD", description: "GitHub Actions, Jenkins, ArgoCD" },
      { name: "Terraform", description: "Infrastructure as code" },
    ],
  },
];
