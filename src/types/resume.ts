export type AccessMode = "owner" | "public" | null;

export type Provider = "gemini" | "openrouter";

export type TailorStatus = "idle" | "tailoring" | "compiling" | "done" | "error";

export interface ModelInfo {
  id: string;
  name: string;
}

export interface ProviderConfig {
  apiKey: string;
}

export interface AuthResult {
  authorized: boolean;
  providers?: {
    gemini?: ProviderConfig;
    openrouter?: ProviderConfig;
  };
  defaultProvider?: Provider;
  error?: string;
}

export interface ResumeConfig {
  mode: AccessMode;
  provider: Provider;
  model: string;
  apiKey: string | null;
  baseLatex: string | null;
}
