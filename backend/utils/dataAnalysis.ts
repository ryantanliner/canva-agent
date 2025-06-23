import { DataAnalysis, ChartSuggestion } from '../types';

export function analyzeDataColumns(headers: string[], data: Record<string, any>[]): DataAnalysis {
  return {
    numericColumns: headers.filter(header =>
      data.some(row => typeof row[header] === 'number')
    ),
    textColumns: headers.filter(header =>
      data.some(row => typeof row[header] === 'string')
    ),
    hasEmptyValues: data.some(row =>
      Object.values(row).some(value => value === null || value === undefined || value === '')
    )
  };
}

export function findTimeColumns(headers: string[]): string[] {
  return headers.filter(header =>
    header.toLowerCase().includes('date') ||
    header.toLowerCase().includes('time') ||
    header.toLowerCase().includes('month') ||
    header.toLowerCase().includes('year')
  );
}

export function selectChartType(numericColumns: string[], textColumns: string[], timeColumns: string[]): {
  type: ChartSuggestion['recommendedChartType'];
  reasoning: string;
} {
  if (timeColumns.length > 0) {
    return {
      type: 'line',
      reasoning: `Line chart recommended because "${timeColumns[0]}" appears to be time-series data, perfect for showing trends over time.`
    };
  }

  if (numericColumns.length === 1 && textColumns.length >= 1) {
    return {
      type: 'bar',
      reasoning: `Bar chart recommended for comparing ${numericColumns[0]} across different ${textColumns[0]} categories.`
    };
  }

  if (numericColumns.length >= 2) {
    return {
      type: 'bar',
      reasoning: `Bar chart recommended for comparing multiple numeric values across categories.`
    };
  }

  return {
    type: 'bar',
    reasoning: 'Bar chart recommended as default visualization for this data structure.'
  };
}

export function generateInsights(data: Record<string, any>[], headers: string[], numericColumns: string[], textColumns: string[], timeColumns: string[]): string[] {
  const insights = [
    `Dataset contains ${data.length} records across ${headers.length} columns`,
    `${numericColumns.length} numeric columns detected: ${numericColumns.join(', ')}`,
    `${textColumns.length} categorical columns found: ${textColumns.join(', ')}`
  ];

  if (timeColumns.length > 0) {
    insights.push(`Time series data detected - consider trend analysis`);
  }
  if (numericColumns.length > 2) {
    insights.push(`Multiple metrics available - consider multi-series charts`);
  }

  return insights;
} 