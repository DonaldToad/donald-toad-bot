import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalculatorProps {
  onResult: (expression: string, result: string) => void;
}

export function Calculator({ onResult }: CalculatorProps) {
  const [display, setDisplay] = useState('');

  const appendToDisplay = (value: string) => {
    setDisplay(prev => prev + value);
  };

  const clearDisplay = () => {
    setDisplay('');
  };

  const calculate = () => {
    try {
      // Replace 'x' with '*' for JavaScript eval
      const sanitizedExpression = display.replace(/x/gi, '*');
      
      // Use Function constructor instead of eval for better security
      // This is still safe as we're only allowing numeric input and operators
      const result = new Function(`return ${sanitizedExpression}`)();
      
      // Format the result
      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : result.toFixed(2).replace(/\.00$/, '');
        
      // Pass the result back to the parent component
      onResult(display, formattedResult);
      
      // Clear the display for the next calculation
      setDisplay('');
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay(''), 1000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-extrabold">Donald Toad's Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Input 
            value={display} 
            readOnly 
            className="text-xl h-12 text-right font-bold"
          />
          
          <div className="grid grid-cols-4 gap-2">
            {/* First row */}
            <Button variant="outline" onClick={() => appendToDisplay('7')}>7</Button>
            <Button variant="outline" onClick={() => appendToDisplay('8')}>8</Button>
            <Button variant="outline" onClick={() => appendToDisplay('9')}>9</Button>
            <Button variant="default" onClick={() => appendToDisplay('/')}>÷</Button>
            
            {/* Second row */}
            <Button variant="outline" onClick={() => appendToDisplay('4')}>4</Button>
            <Button variant="outline" onClick={() => appendToDisplay('5')}>5</Button>
            <Button variant="outline" onClick={() => appendToDisplay('6')}>6</Button>
            <Button variant="default" onClick={() => appendToDisplay('*')}>×</Button>
            
            {/* Third row */}
            <Button variant="outline" onClick={() => appendToDisplay('1')}>1</Button>
            <Button variant="outline" onClick={() => appendToDisplay('2')}>2</Button>
            <Button variant="outline" onClick={() => appendToDisplay('3')}>3</Button>
            <Button variant="default" onClick={() => appendToDisplay('-')}>-</Button>
            
            {/* Fourth row */}
            <Button variant="outline" onClick={() => appendToDisplay('0')}>0</Button>
            <Button variant="outline" onClick={() => appendToDisplay('.')}>.</Button>
            <Button variant="secondary" onClick={clearDisplay}>C</Button>
            <Button variant="default" onClick={() => appendToDisplay('+')}>+</Button>
            
            {/* Fifth row - Calculate button spans entire width */}
            <Button 
              variant="destructive" 
              className="col-span-4 bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700"
              onClick={calculate}
            >
              Calculate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}