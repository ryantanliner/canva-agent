import React from 'react';
import { Button, Text } from "@canva/app-ui-kit";
import { ChartSuggestion } from '../types';
import { MAX_CHAT_REQUESTS } from '../constants';

interface AISuggestionProps {
  showConfirmation: boolean;
  aiSuggestion: ChartSuggestion | null;
  onConfirmGenerate: () => void;
  chatMessages: string[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  chatRequestCount: number;
  isRegenerating: boolean;
  onChatSubmit: () => void;
}

export const AISuggestion: React.FC<AISuggestionProps> = ({
  showConfirmation,
  aiSuggestion,
  onConfirmGenerate,
  chatMessages,
  chatInput,
  onChatInputChange,
  chatRequestCount,
  isRegenerating,
  onChatSubmit
}) => {
  if (!showConfirmation || !aiSuggestion) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChatSubmit();
    }
  };

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#e8f5e8',
      borderRadius: '8px',
      border: '1px solid #81c784'
    }}>
      <Text variant="bold">AI Chart Recommendation</Text>

      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '6px'
      }}>
        <Text variant="bold" size="small">
          {aiSuggestion.title}
        </Text>

        <Text size="small">
          <strong>Chart Type:</strong> {aiSuggestion.recommendedChartType}
        </Text>
        <Text size="small">
          <strong>X-Axis:</strong> {aiSuggestion.xAxis}
        </Text>
        <Text size="small">
          <strong>Y-Axis:</strong> {aiSuggestion.yAxis}
        </Text>

        <Text size="small">
          <strong>Why this works:</strong> {aiSuggestion.reasoning}
        </Text>

        {aiSuggestion.insights.length > 0 && (
          <div>
            <Text size="small" variant="bold">Key Insights:</Text>
            {aiSuggestion.insights.slice(0, 3).map((insight, idx) => (
              <Text key={idx} size="small">
                • {insight}
              </Text>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <Button
          variant="primary"
          onClick={onConfirmGenerate}
          stretch
        >
          Generate Chart with AI Suggestion
        </Button>
      </div>

      {/* Chat feedback section */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <Text variant="bold" size="small">
          Don't like this suggestion? ({MAX_CHAT_REQUESTS - chatRequestCount} requests remaining)
        </Text>

        {chatMessages.length > 0 && (
          <div style={{ marginTop: '8px', marginBottom: '8px' }}>
            {chatMessages.map((message, idx) => (
              <div key={idx} style={{
                padding: '6px 8px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '12px'
              }}>
                {message}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            placeholder="Tell us what you'd prefer..."
            disabled={chatRequestCount >= MAX_CHAT_REQUESTS || isRegenerating}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="secondary"
            onClick={onChatSubmit}
            disabled={!chatInput.trim() || chatRequestCount >= MAX_CHAT_REQUESTS || isRegenerating}
            loading={isRegenerating}
          >
            {isRegenerating ? 'Regenerating...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 