import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import CalculatorComponent from './Calculator';

/**
 * A component that toggles the calculator visibility
 */
export default function CalculatorToggle() {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end gap-4">
      {showCalculator && (
        <div className="mr-2 mb-2 animate-fade-in">
          <CalculatorComponent />
        </div>
      )}
      
      <Button
        onClick={() => setShowCalculator(!showCalculator)}
        className="rounded-full h-14 w-14 bg-yellow-500 hover:bg-yellow-600 shadow-lg p-0 flex items-center justify-center"
        title={showCalculator ? "Hide Calculator" : "Show Calculator"}
      >
        <Calculator className="h-6 w-6" />
      </Button>
    </div>
  );
}