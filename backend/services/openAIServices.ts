import OpenAI from "openai";
import { ChartSuggestion } from '../types';
import { OPENAI_MODEL, MAX_TOKENS, SAMPLE_DATA_SIZE } from '../constants';
import { findTimeColumns, selectChartType, generateInsights } from '../utils/dataAnalysis';

export function generateFakeOpenAIResponse(fileName: string, headers: string[], data: Record<string, any>[]): ChartSuggestion {
  console.log("Using fake OpenAI response for testing...");

  const numericColumns = headers.filter(header =>
    data.some(row => typeof row[header] === 'number')
  );
  const textColumns = headers.filter(header =>
    data.some(row => typeof row[header] === 'string')
  );
  const timeColumns = findTimeColumns(headers);

  const { type: recommendedChartType, reasoning } = selectChartType(numericColumns, textColumns, timeColumns);
  const xAxis = textColumns[0] || timeColumns[0] || headers[0];
  const yAxis = numericColumns[0] || headers[1] || headers[0];
  const title = `${yAxis} by ${xAxis}`;
  const insights = generateInsights(data, headers, numericColumns, textColumns, timeColumns);

  const suggestion: ChartSuggestion = {
    recommendedChartType,
    xAxis,
    yAxis,
    reasoning,
    title,
    insights,
    chartjsConfig: {
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      borderColor: "#FFFFFF",
      responsive: true
    }
  };

  console.log("Fake OpenAI suggestion generated:", suggestion);
  return suggestion;
}

function buildOpenAIPrompt(fileName: string, headers: string[], data: Record<string, any>[], userFeedback?: string, currentSuggestion?: ChartSuggestion): string {
  const sampleData = data.slice(0, SAMPLE_DATA_SIZE);

  let prompt = `
Analyze this CSV data and recommend a Chart.js configuration:

File: ${fileName}
Headers: ${headers.join(', ')}
Sample Data: ${JSON.stringify(sampleData, null, 2)}
Total rows: ${data.length}`;

  if (userFeedback && currentSuggestion) {
    prompt += `

CURRENT SUGGESTION:
${JSON.stringify(currentSuggestion, null, 2)}

USER FEEDBACK: "${userFeedback}"

Please modify the chart configuration based on the user's feedback. Consider their preferences and adjust the chart type, axes, styling, or other aspects accordingly.`;
  }

  prompt += `

Respond with JSON containing:
{
  "recommendedChartType": "bar" | "line" | "pie" | "doughnut" | "scatter",
  "xAxis": "column_name_for_x_axis",
  "yAxis": "column_name_for_y_axis",
  "reasoning": "why this chart type fits the data",
  "title": "descriptive chart title",
  "insights": ["key insight 1", "insight 2", "insight 3"],
  "chartjsConfig": {
    "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"],
    "borderColor": "#FFFFFF",
    "responsive": true
  }
}

Chart selection rules:
- Bar: categorical vs numerical data
- Line: time series, continuous trends  
- Pie/Doughnut: parts of a whole (max 8 categories)
- Scatter: correlation between two numerical variables

Only valid JSON response.`;

  return prompt;
}

function cleanOpenAIResponse(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

function handleOpenAIError(error: unknown): void {
  console.error("Error calling OpenAI API:", error);

  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      console.error("OpenAI API key issue - check your OPENAI_API_KEY environment variable");
    } else if (error.message.includes('rate limit')) {
      console.error("OpenAI API rate limit exceeded - try again later");
    } else if (error.message.includes('JSON')) {
      console.error("Failed to parse OpenAI response as JSON");
    }
  }
}

export async function generateChartConfigWithOpenAI(
  fileName: string,
  headers: string[],
  data: Record<string, any>[],
  userFeedback?: string,
  currentSuggestion?: ChartSuggestion
): Promise<ChartSuggestion | null> {
  try {
    console.log("Calling OpenAI to analyze CSV data...");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildOpenAIPrompt(fileName, headers, data, userFeedback, currentSuggestion);

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a data visualization expert. Analyze CSV data and recommend optimal chart configurations. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response content from OpenAI');
    }

    const cleanedResponse = cleanOpenAIResponse(aiResponse);
    console.log("Raw OpenAI response:", aiResponse);
    console.log("Cleaned response for parsing:", cleanedResponse);

    const chartSuggestion: ChartSuggestion = JSON.parse(cleanedResponse);
    console.log("OpenAI chart suggestion received:", chartSuggestion);

    return chartSuggestion;
  } catch (error) {
    handleOpenAIError(error);
    return null;
  }
} 