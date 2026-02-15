import { useState, useEffect } from "react";

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinished, 500); // wait for fade-out
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo mark */}
      <div className="flex flex-col items-center gap-4">
        <img 
          src="/favicon.png" 
          alt="Sportsbnb" 
          className="w-16 h-16 rounded-2xl shadow-lg"
        />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sportsbnb
        </h1>
      </div>

      {/* Loading indicator */}
      <div className="mt-10">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;
