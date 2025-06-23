import React from 'react';
import { Text } from "@canva/app-ui-kit";
import { ParsedData } from '../types';

interface CSVStatusProps {
  parsedData: ParsedData | null;
  isAnalyzing: boolean;
}

export const CSVStatus: React.FC<CSVStatusProps> = ({ parsedData, isAnalyzing }) => {
  if (!parsedData) return null;

  return (
    <>
      <Text variant="bold">
        CSV loaded: {parsedData.data.length} rows, {parsedData.headers.length} columns
      </Text>
      <Text variant="regular" size="small">
        Columns: {parsedData.headers.join(', ')}
      </Text>

      {isAnalyzing && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <Text variant="bold">Auto-analyzing your data...</Text>
          <Text size="small">
            AI is analyzing your CSV structure and generating smart chart recommendations.
          </Text>
        </div>
      )}
    </>
  );
}; 