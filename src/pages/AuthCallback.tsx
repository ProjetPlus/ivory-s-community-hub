import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    document.title = "Confirmation | MIPROJET";

    const handleCallback = async () => {
      // Supabase handles the token exchange automatically via onAuthStateChange
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setConfirmed(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        // Wait for auth state to settle
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN') {
            setConfirmed(true);
            setTimeout(() => navigate('/dashboard'), 3000);
            subscription.unsubscribe();
          }
        });

        // Fallback redirect after 5s
        setTimeout(() => navigate('/auth'), 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        {confirmed ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">✅ Email confirmé avec succès</h1>
            <p className="text-muted-foreground">
              Votre compte a été activé. Vous allez être redirigé vers votre tableau de bord...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Vérification en cours...</h1>
            <p className="text-muted-foreground">Nous confirmons votre adresse email.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
