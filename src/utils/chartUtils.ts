import { ChartSuggestion, ParsedData } from '../types';
import { CHART_COLORS } from '../constants';

export function createChartData(suggestion: ChartSuggestion, parsedData: ParsedData) {
  const labels = parsedData.data.map(row => String(row[suggestion.xAxis] || ''));
  const values = parsedData.data.map(row => Number(row[suggestion.yAxis]) || 0);

  if (suggestion.recommendedChartType === 'pie' || suggestion.recommendedChartType === 'doughnut') {
    return {
      labels,
      datasets: [{
        label: suggestion.yAxis,
        data: values,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderColor: CHART_COLORS.slice(0, labels.length).map(color => color + 'CC'),
        borderWidth: 2
      }]
    };
  }

  if (suggestion.recommendedChartType === 'scatter') {
    const scatterData = parsedData.data.map(row => ({
      x: Number(row[suggestion.xAxis]) || 0,
      y: Number(row[suggestion.yAxis]) || 0
    }));

    return {
      datasets: [{
        label: `${suggestion.yAxis} vs ${suggestion.xAxis}`,
        data: scatterData,
        backgroundColor: CHART_COLORS[0] + '80',
        borderColor: CHART_COLORS[0],
        borderWidth: 2
      }]
    };
  }

  return {
    labels,
    datasets: [{
      label: suggestion.yAxis,
      data: values,
      backgroundColor: suggestion.recommendedChartType === 'bar' ? CHART_COLORS[0] + '80' : CHART_COLORS[0] + '20',
      borderColor: CHART_COLORS[0],
      borderWidth: 2,
      tension: suggestion.recommendedChartType === 'line' ? 0.4 : undefined,
      fill: suggestion.recommendedChartType === 'line' ? false : undefined
    }]
  };
}

export function createChartOptions(suggestion: ChartSuggestion) {
  const showScales = suggestion.recommendedChartType !== 'pie' && suggestion.recommendedChartType !== 'doughnut';
  const showLegend = suggestion.recommendedChartType === 'pie' || suggestion.recommendedChartType === 'doughnut';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: suggestion.title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
    },
    scales: showScales ? {
      x: {
        title: {
          display: true,
          text: suggestion.xAxis
        }
      },
      y: {
        title: {
          display: true,
          text: suggestion.yAxis
        }
      }
    } : undefined
  };
} 