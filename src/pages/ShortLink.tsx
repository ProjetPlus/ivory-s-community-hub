import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SlugConfig {
  table: "news" | "opportunities" | "projects" | "platform_documents";
  prefix: string;
  redirectBase: string;
}

const PREFIX_MAP: Record<string, SlugConfig> = {
  n: { table: "news", prefix: "art", redirectBase: "/news" },
  o: { table: "opportunities", prefix: "opp", redirectBase: "/opportunities" },
  p: { table: "projects", prefix: "prj", redirectBase: "/projects" },
  d: { table: "platform_documents", prefix: "doc", redirectBase: "/documents" },
};

export default function ShortLink() {
  const params = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Route is /:type/:a/:b/:c → join into slug "art003-04-026"
  const type = (params as any).type as string | undefined;
  const a = (params as any).a as string | undefined;
  const b = (params as any).b as string | undefined;
  const c = (params as any).c as string | undefined;

  useEffect(() => {
    const resolve = async () => {
      if (!type || !PREFIX_MAP[type]) {
        setError("Lien invalide");
        return;
      }
      const cfg = PREFIX_MAP[type];
      const segments = [a, b, c].filter(Boolean) as string[];
      if (segments.length === 0) {
        setError("Lien incomplet");
        return;
      }
      const slug = segments.join("-").toLowerCase();
      try {
        const { data, error } = await supabase
          .from(cfg.table)
          .select("id")
          .eq("short_slug", slug)
          .maybeSingle();
        if (error || !data) {
          setError("Contenu introuvable");
          return;
        }
        navigate(`${cfg.redirectBase}/${(data as any).id}`, { replace: true });
      } catch (e) {
        setError("Erreur de résolution du lien");
      }
    };
    resolve();
  }, [type, a, b, c, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-3">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Redirection en cours…</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">{error}</h1>
            <a href="/" className="text-primary underline">Retour à l'accueil</a>
          </>
        )}
      </div>
    </div>
  );
}
