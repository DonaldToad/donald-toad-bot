import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * Simple Calculator Component for Donald Toad Chat
 * Provides basic arithmetic operations
 */
export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [storedNumber, setStoredNumber] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const { toast } = useToast();

  // Handle number button clicks
  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  // Handle decimal point
  const handleDecimalPoint = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle operator button clicks
  const handleOperatorClick = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (storedNumber === null) {
      setStoredNumber(currentValue);
    } else if (operator) {
      const result = calculate(storedNumber, currentValue, operator);
      setDisplay(String(result));
      setStoredNumber(result);
    }
    
    setWaitingForOperand(true);
    setOperator(op);
  };

  // Handle equals button
  const handleEquals = () => {
    if (storedNumber === null || operator === null) {
      return;
    }
    
    const currentValue = parseFloat(display);
    const result = calculate(storedNumber, currentValue, operator);
    
    setDisplay(String(result));
    setStoredNumber(null);
    setOperator(null);
    setWaitingForOperand(true);
    
    // Generate a Donald Toad response after calculation
    const randomResponse = getToadResponse(storedNumber, currentValue, operator, result);
    toast({
      title: "Donald Toad says:",
      description: randomResponse,
      duration: 5000,
    });
  };

  // Clear calculator
  const handleClear = () => {
    setDisplay('0');
    setStoredNumber(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  // Perform calculation based on the operator
  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        if (b === 0) {
          toast({
            title: "Donald Toad says:",
            description: "Even I can't divide by ZERO, folks! That's like trying to build a wall with NO FUNDING! Try a different calculation! 🐸",
            duration: 5000,
          });
          return 0;
        }
        return a / b;
      default:
        return b;
    }
  };

  // Generate a Donald Toad-style response for a calculation
  const getToadResponse = (a: number, b: number, op: string, result: number): string => {
    const responses = [
      `${a} ${op} ${b} = ${result}! I calculated that INSTANTLY! I've got the best brain for numbers, really tremendous calculations! That I can tell you! 🐸`,
      `The answer is ${result}! I did that math faster than anyone, believe me! Some people - very smart people - they take calculators everywhere, but I just KNOW these things! 🐸`,
      `${a} ${op} ${b} equals ${result}! I've always been a MATH GENIUS! My uncle was at MIT, very good genes! I did this calculation in my head - no calculator needed! 🐸`,
      `${result} is the answer - calculated it faster than any computer! I'm very good with numbers, the best really. I understand numbers better than anybody! 🐸`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <Card className="w-[300px] shadow-lg border-2 border-yellow-500">
      <CardHeader className="bg-yellow-500 text-white p-4">
        <CardTitle className="text-center text-white">Donald Toad Calculator</CardTitle>
        <CardDescription className="text-center text-white">Make Calculations Great Again!</CardDescription>
      </CardHeader>
      <CardContent className="p-4 bg-white">
        <div className="flex flex-col gap-y-2">
          <div className="calculator-display">
            <Input 
              value={display} 
              readOnly 
              className="text-right text-xl font-bold mb-2 bg-gray-100"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button 
              onClick={handleClear} 
              className="col-span-2 bg-red-500 hover:bg-red-600"
            >
              CLEAR
            </Button>
            <Button 
              onClick={() => handleOperatorClick('÷')} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              ÷
            </Button>
            <Button 
              onClick={() => handleOperatorClick('×')} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              ×
            </Button>
            
            {/* Number buttons */}
            {[7, 8, 9].map(num => (
              <Button 
                key={num} 
                onClick={() => handleNumberClick(num.toString())} 
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                {num}
              </Button>
            ))}
            <Button 
              onClick={() => handleOperatorClick('-')} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              -
            </Button>
            
            {[4, 5, 6].map(num => (
              <Button 
                key={num} 
                onClick={() => handleNumberClick(num.toString())} 
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                {num}
              </Button>
            ))}
            <Button 
              onClick={() => handleOperatorClick('+')} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              +
            </Button>
            
            {[1, 2, 3].map(num => (
              <Button 
                key={num} 
                onClick={() => handleNumberClick(num.toString())} 
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                {num}
              </Button>
            ))}
            <Button 
              onClick={handleEquals} 
              className="bg-green-500 hover:bg-green-600 row-span-2"
            >
              =
            </Button>
            
            <Button 
              onClick={() => handleNumberClick('0')} 
              className="bg-gray-200 text-black hover:bg-gray-300 col-span-2"
            >
              0
            </Button>
            <Button 
              onClick={handleDecimalPoint} 
              className="bg-gray-200 text-black hover:bg-gray-300"
            >
              .
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}