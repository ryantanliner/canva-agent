import React from 'react';
import { Button, Text } from "@canva/app-ui-kit";
import { Bar, Line, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import { ChartConfig } from '../types';
import { CHART_HEIGHT } from '../constants';

interface ChartRendererProps {
  chartConfig: ChartConfig | null;
  chartRef: React.RefObject<any>;
  onUploadToCanva: () => void;
  isGeneratingChart: boolean;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartConfig,
  chartRef,
  onUploadToCanva,
  isGeneratingChart
}) => {
  if (!chartConfig) return null;

  const chartProps = {
    ref: chartRef,
    data: chartConfig.data,
    options: chartConfig.options
  };

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Pie, // Doughnut uses Pie component
    scatter: Scatter
  }[chartConfig.type];

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <Text variant="bold">Generated Chart Preview</Text>
      <div style={{
        height: CHART_HEIGHT,
        marginTop: '12px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '4px'
      }}>
        <ChartComponent {...chartProps} />
      </div>

      <Button
        variant="primary"
        onClick={onUploadToCanva}
        stretch
        loading={isGeneratingChart}
        disabled={isGeneratingChart}
      >
        {isGeneratingChart ? 'Uploading to Canva...' : 'Add Chart to Canva Design'}
      </Button>
    </div>
  );
}; 