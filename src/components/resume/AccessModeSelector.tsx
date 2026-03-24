import { useState, useEffect } from "react";
import { CheckCircle2, Shield, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OwnerLogin } from "./OwnerLogin";
import { PublicConfig } from "./PublicConfig";
import { ProviderSelector } from "./ProviderSelector";
import { ModelSelector } from "./ModelSelector";
import { fetchModels, getDefaultModel } from "@/services/modelService";
import { clearStoredData, saveLastModel, getLastModel } from "@/services/authService";
import { BASE_RESUME_LATEX } from "@/data/baseResume";
import { toast } from "sonner";
import type { AuthResult, Provider, ModelInfo } from "@/types/resume";

interface AccessModeSelectorProps {
  onReady: (apiKey: string, provider: Provider, model: string, baseLatex: string) => void;
}

export function AccessModeSelector({ onReady }: AccessModeSelectorProps) {
  const [activeTab, setActiveTab] = useState<"owner" | "public">("public");

  // Owner state
  const [ownerAuth, setOwnerAuth] = useState<AuthResult | null>(null);
  const [ownerProvider, setOwnerProvider] = useState<Provider>("openrouter");
  const [ownerModel, setOwnerModel] = useState(getDefaultModel("openrouter"));
  const [ownerModels, setOwnerModels] = useState<ModelInfo[]>([]);
  const [ownerModelsLoading, setOwnerModelsLoading] = useState(false);

  // Load models when owner authenticates or changes provider
  useEffect(() => {
    if (!ownerAuth?.providers) return;
    const providerConfig = ownerAuth.providers[ownerProvider];
    const apiKey = providerConfig?.apiKey;

    setOwnerModelsLoading(true);
    setOwnerModel(getLastModel(ownerProvider) ?? getDefaultModel(ownerProvider));
    fetchModels(ownerProvider, apiKey)
      .then((m) => setOwnerModels(m))
      .finally(() => setOwnerModelsLoading(false));
  }, [ownerAuth, ownerProvider]);

  function handleOwnerAuthenticated(result: AuthResult) {
    setOwnerAuth(result);
    const defaultProv = result.defaultProvider ?? "openrouter";
    setOwnerProvider(defaultProv);
  }

  function handleOwnerLaunch() {
    if (!ownerAuth?.providers) return;
    const apiKey = ownerAuth.providers[ownerProvider]?.apiKey;
    if (!apiKey) return;
    onReady(apiKey, ownerProvider, ownerModel, BASE_RESUME_LATEX);
  }

  function handleOwnerModelChange(m: string) {
    setOwnerModel(m);
    saveLastModel(ownerProvider, m);
  }

  function handlePublicReady(
    apiKey: string,
    provider: Provider,
    model: string,
    baseLatex: string
  ) {
    onReady(apiKey, provider, model, baseLatex);
  }

  function handleClearData() {
    clearStoredData();
    toast.success("Data cleared", {
      description: "All saved API keys and settings have been removed.",
    });
  }

  const ownerHasKey =
    ownerAuth?.providers &&
    !!(ownerAuth.providers[ownerProvider]?.apiKey);

  return (
    <div
      className="w-full max-w-xl mx-auto rounded-xl border overflow-hidden"
      style={{
        background: "hsl(var(--card) / 0.6)",
        borderColor: "hsl(var(--primary) / 0.15)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px hsl(0 0% 0% / 0.3)",
      }}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "owner" | "public")}>
        <TabsList
          className="w-full rounded-none border-b h-auto p-0"
          style={{
            background: "transparent",
            borderColor: "hsl(var(--border) / 0.5)",
          }}
        >
          <TabsTrigger
            value="public"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/8 data-[state=inactive]:text-muted-foreground transition-all font-mono-jb"
          >
            <Users size={13} />
            Public
          </TabsTrigger>
          <TabsTrigger
            value="owner"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/8 data-[state=inactive]:text-muted-foreground transition-all font-mono-jb"
          >
            <Shield size={13} />
            Owner
            {ownerAuth?.authorized && (
              <CheckCircle2 size={11} style={{ color: "hsl(175 80% 50%)" }} />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="p-4 sm:p-5 mt-0">
          <PublicConfig onReady={handlePublicReady} onClear={handleClearData} />
        </TabsContent>

        <TabsContent value="owner" className="p-4 sm:p-5 mt-0">
          <div className="space-y-5">
            {!ownerAuth?.authorized ? (
              <OwnerLogin onAuthenticated={handleOwnerAuthenticated} />
            ) : (
              <div className="space-y-5">
                {/* Authenticated badge */}
                <div
                  className="flex items-center gap-2 text-xs py-2 px-3 rounded-md font-mono-jb"
                  style={{
                    color: "hsl(175 80% 50%)",
                    background: "hsl(175 80% 50% / 0.08)",
                    border: "1px solid hsl(175 80% 50% / 0.25)",
                  }}
                >
                  <CheckCircle2 size={12} />
                  Authenticated — using your API keys
                </div>

                {/* Provider selector */}
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-widest font-mono-jb"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Provider
                  </label>
                  <ProviderSelector
                    value={ownerProvider}
                    onChange={setOwnerProvider}
                    disabled={!ownerAuth.providers?.gemini && !ownerAuth.providers?.openrouter}
                  />
                  {!ownerAuth.providers?.[ownerProvider] && (
                    <p className="text-xs font-mono-jb" style={{ color: "hsl(var(--destructive))" }}>
                      No {ownerProvider} API key configured
                    </p>
                  )}
                </div>

                {/* Model selector */}
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-widest font-mono-jb"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Model
                  </label>
                  <ModelSelector
                    models={ownerModels}
                    value={ownerModel}
                    onChange={handleOwnerModelChange}
                    isLoading={ownerModelsLoading}
                    disabled={!ownerHasKey}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOwnerLaunch}
                  disabled={!ownerHasKey || !ownerModel}
                  className="w-full py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono-jb"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.35)",
                  }}
                >
                  Load My Resume →
                </button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
