import * as express from "express";
import { StoredChartConfig, ChartSuggestion } from '../types';
import { MAX_FEEDBACK_REQUESTS, USE_FAKE_OPENAI_FOR_TESTING } from '../constants';
import { analyzeDataColumns } from '../utils/dataAnalysis';
import { generateFakeOpenAIResponse, generateChartConfigWithOpenAI } from '../services/openAIServices';
import { findUserConfig, createChartConfig } from '../utils/chartUtils';

// In-memory store
const chartConfigurations: StoredChartConfig[] = [];

export async function handleCSVUpload(req: express.Request, res: express.Response) {
  console.log("POST /api/upload-csv - request received from user:", req.canva.userId);

  try {
    const { fileName, headers, data, rowCount, userFeedback } = req.body;

    console.log("File name:", fileName);
    console.log("Headers:", headers);
    console.log("Row count:", rowCount);
    console.log("First 3 rows:", data.slice(0, 3));
    if (userFeedback) {
      console.log("User feedback:", userFeedback);
    }

    const analysis = analyzeDataColumns(headers, data);
    let currentSuggestion: ChartSuggestion | undefined;
    let currentFeedbackCount = 0;

    if (userFeedback) {
      const userConfig = findUserConfig(req.canva.userId, fileName, chartConfigurations);
      currentSuggestion = userConfig.suggestion;
      currentFeedbackCount = userConfig.feedbackCount;

      console.log("Found current suggestion for feedback:", currentSuggestion);
      console.log("Current feedback count:", currentFeedbackCount);

      if (currentFeedbackCount >= MAX_FEEDBACK_REQUESTS) {
        console.log(`User has exceeded maximum feedback requests (${MAX_FEEDBACK_REQUESTS})`);
        return res.status(400).json({
          success: false,
          message: `Maximum feedback requests reached (${MAX_FEEDBACK_REQUESTS} per CSV file)`,
          error: "FEEDBACK_LIMIT_EXCEEDED",
          maxFeedbackRequests: MAX_FEEDBACK_REQUESTS,
          currentFeedbackCount
        });
      }
    }

    const aiChartSuggestion = USE_FAKE_OPENAI_FOR_TESTING
      ? generateFakeOpenAIResponse(fileName, headers, data)
      : await generateChartConfigWithOpenAI(fileName, headers, data, userFeedback, currentSuggestion);

    let chartConfig: StoredChartConfig | null = null;

    if (aiChartSuggestion) {
      const feedbackCount = userFeedback ? currentFeedbackCount + 1 : 0;
      chartConfig = createChartConfig(req.canva.userId, fileName, aiChartSuggestion, feedbackCount);
      chartConfigurations.push(chartConfig);
    }

    const response = {
      success: true,
      message: "CSV data received and processed successfully",
      receivedAt: new Date().toISOString(),
      userId: req.canva.userId,
      appId: req.canva.appId,
      fileInfo: {
        name: fileName,
        headers,
        rowCount,
        columnCount: headers.length
      },
      analysis,
      aiSuggestion: aiChartSuggestion,
      hasAiSuggestion: aiChartSuggestion !== null,
      chartConfigId: chartConfig?.id || null
    };

    console.log("Sending response:", response);
    res.status(200).json(response);

  } catch (error) {
    console.error("Error processing CSV upload:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      message: "Failed to process CSV data",
      error: errorMessage
    });
  }
}

export async function handleGetChartConfigurations(req: express.Request, res: express.Response) {
  console.log("GET /api/chart-configurations - request received from user:", req.canva.userId);

  try {
    const userChartConfigs = chartConfigurations.filter(config => config.userId === req.canva.userId);
    console.log(`Found ${userChartConfigs.length} chart configurations for user ${req.canva.userId}`);

    res.status(200).json({
      success: true,
      userId: req.canva.userId,
      chartConfigurations: userChartConfigs,
      count: userChartConfigs.length
    });

  } catch (error) {
    console.error("Error retrieving chart configurations:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      message: "Failed to retrieve chart configurations",
      error: errorMessage
    });
  }
} 