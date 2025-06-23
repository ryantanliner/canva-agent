export interface ChartSuggestion {
  recommendedChartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  xAxis: string;
  yAxis: string;
  reasoning: string;
  title: string;
  insights: string[];
  chartjsConfig: {
    backgroundColor: string[];
    borderColor: string;
    responsive: boolean;
    [key: string]: any;
  };
}

export interface StoredChartConfig {
  id: string;
  userId: string;
  fileName: string;
  suggestion: ChartSuggestion;
  createdAt: string;
  feedbackCount: number;
}

export interface DataAnalysis {
  numericColumns: string[];
  textColumns: string[];
  hasEmptyValues: boolean;
} 