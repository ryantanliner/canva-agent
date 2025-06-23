import { useState } from "react";
import { ParsedData, ChartConfig, ChartSuggestion } from '../types';

export function useAppState() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<ChartSuggestion | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatRequestCount, setChatRequestCount] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [selectedInsight, setSelectedInsight] = useState<string>("");
  const [isAddingInsight, setIsAddingInsight] = useState<boolean>(false);

  return {
    parsedData, setParsedData,
    fileName, setFileName,
    isUploading, setIsUploading,
    isAnalyzing, setIsAnalyzing,
    error, setError,
    chartConfig, setChartConfig,
    isGeneratingChart, setIsGeneratingChart,
    aiSuggestion, setAiSuggestion,
    showConfirmation, setShowConfirmation,
    chatMessages, setChatMessages,
    chatInput, setChatInput,
    chatRequestCount, setChatRequestCount,
    isRegenerating, setIsRegenerating,
    selectedInsight, setSelectedInsight,
    isAddingInsight, setIsAddingInsight,
  };
} 