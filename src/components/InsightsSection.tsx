import React from 'react';
import { Button, Text, Select } from "@canva/app-ui-kit";
import { ChartSuggestion } from '../types';

interface InsightsSectionProps {
  aiSuggestion: ChartSuggestion | null;
  selectedInsight: string;
  onInsightChange: (value: string) => void;
  onAddInsight: () => void;
  isAddingInsight: boolean;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  aiSuggestion,
  selectedInsight,
  onInsightChange,
  onAddInsight,
  isAddingInsight
}) => {
  if (!aiSuggestion || aiSuggestion.insights.length === 0) return null;

  return (
    <div style={{
      marginTop: '16px',
      padding: '12px',
      backgroundColor: '#fff8e1',
      borderRadius: '6px',
      border: '1px solid #ffcc02'
    }}>
      <Text variant="bold" size="small">Add Insights to Canva:</Text>

      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
        <Select
          value={selectedInsight}
          onChange={onInsightChange}
          placeholder="Select an insight to add"
          options={aiSuggestion.insights.map((insight, idx) => ({
            value: insight,
            label: `${idx + 1}. ${insight.length > 50 ? insight.substring(0, 50) + '...' : insight}`
          }))}
        />
      </div>

      <Button
        variant="secondary"
        onClick={onAddInsight}
        disabled={!selectedInsight.trim() || isAddingInsight}
        loading={isAddingInsight}
        stretch
      >
        {isAddingInsight ? 'Adding to Canva...' : 'Add Selected Insight to Canva'}
      </Button>
    </div>
  );
}; 