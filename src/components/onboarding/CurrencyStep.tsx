
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Euro, Globe } from 'lucide-react';

interface CurrencyStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', symbol: '€', name: 'Euro', icon: Euro },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', icon: Globe },
  { code: 'GBP', symbol: '£', name: 'British Pound', icon: Globe },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', icon: Globe },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', icon: Globe },
];

const CurrencyStep = ({ data, onNext, onBack }: CurrencyStepProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(data.currency || 'USD');

  const handleNext = () => {
    onNext({ currency: selectedCurrency });
  };

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Choose Your Currency</h2>
        <p className="text-muted-foreground">
          In which currency would you like to manage your money?
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Select Currency</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => {
                const IconComponent = currency.icon;
                return (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{currency.symbol} {currency.name} ({currency.code})</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedCurrencyData && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <selectedCurrencyData.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {selectedCurrencyData.symbol} {selectedCurrencyData.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All amounts will be displayed in {selectedCurrencyData.name}
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CurrencyStep;
