import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export type AIProvider = 'auto' | 'openai' | 'perplexity';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onSelectProvider: (provider: AIProvider) => void;
}

export default function AIProviderSelector({ 
  selectedProvider, 
  onSelectProvider 
}: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full mb-4">
      <div 
        className="flex items-center justify-between p-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer border-b border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">AI Provider:</span>
          <span className="font-medium">
            {selectedProvider === 'auto' && 'Automatic (Try both)'}
            {selectedProvider === 'openai' && 'OpenAI'}
            {selectedProvider === 'perplexity' && 'Perplexity AI'}
          </span>
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <Card className="absolute top-10 left-0 right-0 z-10 bg-white shadow-lg border border-gray-200 rounded-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Select AI Provider</CardTitle>
            <CardDescription className="text-xs">
              Choose which AI service powers Donald Toad
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            <RadioGroup 
              defaultValue={selectedProvider} 
              onValueChange={(value) => {
                onSelectProvider(value as AIProvider);
                setIsOpen(false);
              }}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label 
                  htmlFor="auto" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Automatic (Try both)
                </Label>
              </div>
              <div className="text-xs text-gray-500 ml-6 -mt-1">
                First tries OpenAI, falls back to Perplexity if unavailable
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label 
                  htmlFor="openai" 
                  className="text-sm font-medium cursor-pointer"
                >
                  OpenAI
                </Label>
              </div>
              <div className="text-xs text-gray-500 ml-6 -mt-1">
                Uses OpenAI's API exclusively
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="perplexity" id="perplexity" />
                <Label 
                  htmlFor="perplexity" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Perplexity AI
                </Label>
              </div>
              <div className="text-xs text-gray-500 ml-6 -mt-1">
                Uses Perplexity's API exclusively
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}