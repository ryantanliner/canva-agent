export interface ParsedData {
  headers: string[];
  data: Record<string, any>[];
  meta: {
    fields?: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  data: any;
  options: any;
  title: string;
}

export interface ChartSuggestion {
  recommendedChartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  xAxis: string;
  yAxis: string;
  reasoning: string;
  title: string;
  insights: string[];
}

export interface AppState {
  parsedData: ParsedData | null;
  fileName: string;
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string;
  chartConfig: ChartConfig | null;
  isGeneratingChart: boolean;
  aiSuggestion: ChartSuggestion | null;
  showConfirmation: boolean;
  chatMessages: string[];
  chatInput: string;
  chatRequestCount: number;
  isRegenerating: boolean;
  selectedInsight: string;
  isAddingInsight: boolean;
} 