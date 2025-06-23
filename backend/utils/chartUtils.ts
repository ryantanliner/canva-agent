import { StoredChartConfig, ChartSuggestion } from '../types';

export function findUserConfig(userId: string, fileName: string, chartConfigurations: StoredChartConfig[]): { suggestion?: ChartSuggestion; feedbackCount: number } {
  const userConfigs = chartConfigurations
    .filter(config => config.userId === userId && config.fileName === fileName)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (userConfigs.length > 0) {
    return {
      suggestion: userConfigs[0].suggestion,
      feedbackCount: userConfigs[0].feedbackCount || 0
    };
  }

  return { feedbackCount: 0 };
}

export function createChartConfig(userId: string, fileName: string, suggestion: ChartSuggestion, feedbackCount: number): StoredChartConfig {
  return {
    id: `chart_${Date.now()}_${userId}`,
    userId,
    fileName,
    suggestion,
    createdAt: new Date().toISOString(),
    feedbackCount
  };
} 