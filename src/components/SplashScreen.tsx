
"use client";

import React from 'react';
import { Landmark } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"; // Optional: Wrap in a card for consistency

export function SplashScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
       {/* Optional Card Styling */}
      {/* <Card className="w-full max-w-sm shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-10 gap-4"> */}
          <div className="flex flex-col items-center justify-center gap-4">
            <Landmark className="w-16 h-16 text-primary animate-pulse" /> {/* Increased size and added pulse */}
            <h1 className="text-3xl font-bold text-primary">Local Ledger</h1>
            <p className="text-muted-foreground">Loading your finances...</p>
          </div>
        {/* </CardContent>
      </Card> */}
    </div>
  );
}
