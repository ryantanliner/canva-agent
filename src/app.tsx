import { Button, Rows, Text, Alert } from "@canva/app-ui-kit";
import { FormattedMessage } from "react-intl";
import { useRef } from "react";
import Papa from "papaparse";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as styles from "styles/components.css";
import { useAddElement } from "utils/use_add_element";
import { addElementAtPoint, createRichtextRange } from "@canva/design";

// Local imports
import { ParsedData, ChartConfig, ChartSuggestion } from './types';
import { MAX_CHAT_REQUESTS } from './constants';
import { validateFile } from './utils/fileUtils';
import { createChartData, createChartOptions } from './utils/chartUtils';
import { makeAPIRequest } from './services/apiService';
import { useAppState } from './hooks/useAppState';
import { ChartRenderer } from './components/ChartRenderer';
import { CSVStatus } from './components/CSVStatus';
import { AISuggestion } from './components/AISuggestion';
import { InsightsSection } from './components/InsightsSection';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const App = () => {
  const addElement = useAddElement();
  const state = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<any>(null);

  // Step 1: Auto-analyze CSV data after upload
  const analyzeCSVData = async (fileName: string, headers: string[], data: Record<string, any>[]) => {
    try {
      state.setIsAnalyzing(true);
      console.log("Auto-analyzing CSV data...");

      const result = await makeAPIRequest('/api/upload-csv', {
        fileName,
        headers,
        data,
        rowCount: data.length
      });

      console.log("Auto-analysis complete! AI suggestion received:", result.aiSuggestion);
      state.setAiSuggestion(result.aiSuggestion);
      state.setShowConfirmation(true);

      return result;
    } catch (error) {
      console.error("Failed to analyze CSV data:", error);
      state.setError("Failed to analyze CSV data. You can still proceed manually.");
      throw error;
    } finally {
      state.setIsAnalyzing(false);
    }
  };

  // Step 2: User confirms and generates chart
  const confirmAndGenerateChart = () => {
    if (!state.aiSuggestion || !state.parsedData) {
      state.setError("No AI suggestion available to generate chart");
      return;
    }

    console.log("User confirmed - generating chart with OpenAI recommendation:");
    console.log("AI Suggestion:", {
      chartType: state.aiSuggestion.recommendedChartType,
      xAxis: state.aiSuggestion.xAxis,
      yAxis: state.aiSuggestion.yAxis,
      title: state.aiSuggestion.title
    });

    const config = generateChartConfigFromSuggestion(state.aiSuggestion);
    if (config) {
      state.setChartConfig(config);
      state.setShowConfirmation(false);
      console.log("Chart generated successfully using OpenAI recommendations!");
    } else {
      state.setError("Failed to generate chart from AI suggestion");
    }
  };

  // Handle chat feedback and regenerate configuration
  const handleChatSubmit = async () => {
    if (!state.chatInput.trim() || state.chatRequestCount >= MAX_CHAT_REQUESTS || !state.parsedData || !state.fileName) {
      return;
    }

    state.setIsRegenerating(true);
    state.setChatMessages(prev => [...prev, state.chatInput]);
    state.setChatRequestCount(prev => prev + 1);

    try {
      const result = await makeAPIRequest('/api/upload-csv', {
        fileName: state.fileName,
        headers: state.parsedData.headers,
        data: state.parsedData.data,
        rowCount: state.parsedData.data.length,
        userFeedback: state.chatInput
      });

      console.log("Regenerated AI suggestion received:", result.aiSuggestion);
      state.setAiSuggestion(result.aiSuggestion);
      state.setChatInput("");

    } catch (error) {
      console.error("Failed to regenerate configuration:", error);
      state.setError("Failed to regenerate configuration. Please try again.");
    } finally {
      state.setIsRegenerating(false);
    }
  };

  // Handle adding insights to Canva
  const handleAddInsight = async () => {
    if (!state.selectedInsight.trim()) {
      state.setError("Please select an insight to add");
      return;
    }

    state.setIsAddingInsight(true);
    try {
      const range = createRichtextRange();
      range.appendText(state.selectedInsight, {
        fontWeight: "bold"
      });

      await addElementAtPoint({
        type: "richtext",
        range,
      });

      console.log("Insight added to Canva successfully:", state.selectedInsight);
      state.setSelectedInsight("");

    } catch (error) {
      console.error("Failed to add insight to Canva:", error);
      state.setError("Failed to add insight to Canva. Please try again.");
    } finally {
      state.setIsAddingInsight(false);
    }
  };

  const generateChartConfigFromSuggestion = (suggestion: ChartSuggestion): ChartConfig | null => {
    if (!state.parsedData) return null;

    console.log("Applying OpenAI chart configuration:");
    console.log(`Chart Type: ${suggestion.recommendedChartType}`);
    console.log(`X-Axis (${suggestion.xAxis}): Extracting labels from data`);
    console.log(`Y-Axis (${suggestion.yAxis}): Extracting values from data`);
    console.log(`Title: "${suggestion.title}"`);

    const labels = state.parsedData.data.map(row => String(row[suggestion.xAxis] || ''));
    const values = state.parsedData.data.map(row => Number(row[suggestion.yAxis]) || 0);
    console.log(`Extracted ${labels.length} labels and ${values.length} values from CSV data`);

    const chartData = createChartData(suggestion, state.parsedData);
    const options = createChartOptions(suggestion);

    return {
      type: suggestion.recommendedChartType,
      data: chartData,
      options,
      title: suggestion.title
    };
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    state.setError("");
    state.setIsUploading(true);
    state.setChartConfig(null);

    const validationError = validateFile(file);
    if (validationError) {
      state.setError(validationError);
      state.setIsUploading(false);
      return;
    }

    state.setFileName(file.name);

    Papa.parse(file as any, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: async (results) => {
        state.setIsUploading(false);

        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
          const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
          if (criticalErrors.length > 0) {
            state.setError('Could not parse CSV file. Please check the format.');
            return;
          }
        }

        if (results.data.length === 0) {
          state.setError('CSV file appears to be empty');
          return;
        }

        const headers = results.meta.fields || [];
        const processedData: ParsedData = {
          headers,
          data: results.data as Record<string, any>[],
          meta: results.meta
        };

        state.setParsedData(processedData);
        console.log('CSV parsed successfully:', processedData);

        try {
          await analyzeCSVData(file.name, headers, processedData.data);
        } catch (error) {
          console.warn('Auto-analysis failed, but CSV data is still loaded');
        }
      },
      error: (error) => {
        state.setIsUploading(false);
        state.setError(`Failed to parse CSV: ${error.message}`);
        console.error('Papa Parse error:', error);
      }
    });
  };

  const handleUploadToCanva = async () => {
    if (!chartRef.current) {
      state.setError('No chart available to upload');
      return;
    }

    state.setIsGeneratingChart(true);
    try {
      const canvas = chartRef.current.canvas;
      if (!canvas) {
        throw new Error('Could not access chart canvas');
      }

      const dataURL = canvas.toDataURL('image/png', 1.0);

      await addElement({
        type: "image",
        dataUrl: dataURL,
        altText: {
          text: "Generated Chart",
          decorative: false
        },
      });

      console.log('Chart uploaded to Canva successfully');
    } catch (error) {
      console.error('Failed to upload chart to Canva:', error);
      state.setError('Failed to upload chart to Canva. Please try again.');
    } finally {
      state.setIsGeneratingChart(false);
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          <FormattedMessage
            defaultMessage="Upload CSV and generate charts with Chart.js"
          />
        </Text>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        <Button
          variant="primary"
          onClick={handleFileUpload}
          stretch
          loading={state.isUploading}
          disabled={state.isUploading}
        >
          {state.isUploading
            ? 'Processing...'
            : state.fileName
              ? `Uploaded: ${state.fileName}`
              : 'Upload CSV File'
          }
        </Button>

        {state.error && (
          <Alert tone="critical">
            {state.error}
          </Alert>
        )}

        <CSVStatus
          parsedData={state.parsedData}
          isAnalyzing={state.isAnalyzing}
        />

        <AISuggestion
          showConfirmation={state.showConfirmation}
          aiSuggestion={state.aiSuggestion}
          onConfirmGenerate={confirmAndGenerateChart}
          chatMessages={state.chatMessages}
          chatInput={state.chatInput}
          onChatInputChange={state.setChatInput}
          chatRequestCount={state.chatRequestCount}
          isRegenerating={state.isRegenerating}
          onChatSubmit={handleChatSubmit}
        />

        <InsightsSection
          aiSuggestion={state.aiSuggestion}
          selectedInsight={state.selectedInsight}
          onInsightChange={state.setSelectedInsight}
          onAddInsight={handleAddInsight}
          isAddingInsight={state.isAddingInsight}
        />

        <ChartRenderer
          chartConfig={state.chartConfig}
          chartRef={chartRef}
          onUploadToCanva={handleUploadToCanva}
          isGeneratingChart={state.isGeneratingChart}
        />
      </Rows>
    </div>
  );
};