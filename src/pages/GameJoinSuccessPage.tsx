import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GameJoinSuccessPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [gameTitle, setGameTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMessage("No session ID provided");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-game-payment", {
          body: { sessionId },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.success) {
          setStatus("success");
          setGameTitle(data.gameTitle || "the game");
          toast.success("Successfully joined the game!");
        } else {
          throw new Error(data.error || "Verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <Layout>
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <CardTitle>Verifying Payment...</CardTitle>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-600">You're In!</CardTitle>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-destructive">Something Went Wrong</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            )}
            {status === "success" && (
              <>
                <p className="text-muted-foreground">
                  Your payment was successful and you've been added to <strong>{gameTitle}</strong>.
                  See you on the field!
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <Link to={`/game/${id}`}>
                    <Button className="w-full">
                      View Game Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/games">
                    <Button variant="outline" className="w-full">
                      Browse More Games
                    </Button>
                  </Link>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <p className="text-muted-foreground">
                  {errorMessage || "We couldn't verify your payment. Please try again or contact support."}
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <Link to={`/game/${id}`}>
                    <Button className="w-full">
                      Back to Game
                    </Button>
                  </Link>
                  <Link to="/games">
                    <Button variant="outline" className="w-full">
                      Browse Games
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GameJoinSuccessPage;
