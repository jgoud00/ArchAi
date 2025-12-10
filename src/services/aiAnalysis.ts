/**
 * AI Analysis Service
 * 
 * Provides functionality for analyzing project images using AI to detect progress, issues, and material usage.
 */

import { supabase } from './supabase'
import { logger } from '@/utils/logger'

/**
 * Represents the result of an AI analysis on a progress image.
 */
export interface AnalysisResult {
  /** The estimated completion percentage of the project. */
  progressPercent: number
  /** A list of potential issues detected in the image. */
  detectedIssues: string[]
  /** Estimated usage of various materials. */
  materialUsage: {
    concrete?: number
    steel?: number
    bricks?: number
  }
  /** A list of recommended actions based on the analysis. */
  recommendations: string[]
}

/**
 * Analyzes a progress image using AI (mock mode).
 * Returns simulated analysis results for development/testing.
 */
const analyzeImageMock = async (
  imageUrl: string,
  projectId: string
): Promise<AnalysisResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Generate random placeholder results
  const progressPercent = Math.floor(Math.random() * 40) + 40 // 40-80%
  const detectedIssues = [
    'Potential structural concern detected in foundation area',
    'Material delivery delay identified',
  ]
  const materialUsage = {
    concrete: Math.floor(Math.random() * 50) + 20,
    steel: Math.floor(Math.random() * 30) + 10,
    bricks: Math.floor(Math.random() * 1000) + 500,
  }
  const recommendations = [
    'Schedule foundation inspection',
    'Review material delivery timeline',
    'Consider weather impact on progress',
  ]

  // Store mock analysis in database
  const { error } = await supabase
    .from('scan_analyses')
    .insert({
      project_id: projectId,
      scan_url: imageUrl,
      progress_percent: progressPercent,
      detected_issues: detectedIssues,
      material_usage: materialUsage,
      recommendations: recommendations,
      created_at: new Date().toISOString(),
    })

  if (error) {
    logger.error('Failed to store analysis', error, { projectId, imageUrl })
  }

  return {
    progressPercent,
    detectedIssues,
    materialUsage,
    recommendations,
  }
}

/**
 * Analyzes a progress image using real AI service (Edge Function).
 * Calls external AI API for actual computer vision analysis.
 */
const analyzeImageReal = async (
  imageUrl: string,
  projectId: string
): Promise<AnalysisResult> => {
  try {
    // TODO: Replace with actual Edge Function endpoint
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, projectId }),
    })

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`)
    }

    const result = await response.json()

    // Store real analysis in database
    await supabase.from('scan_analyses').insert({
      project_id: projectId,
      scan_url: imageUrl,
      progress_percent: result.progressPercent,
      detected_issues: result.detectedIssues,
      material_usage: result.materialUsage,
      recommendations: result.recommendations,
      created_at: new Date().toISOString(),
    })

    return result
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to analyze image with AI service'
    )
  }
}

/**
 * Analyzes a progress image to estimate project status and detect issues.
 * 
 * Switches between mock and real AI based on AI_MOCK_MODE constant.
 * In production, set AI_MOCK_MODE=false in constants/index.ts.
 * 
 * @param imageUrl - The URL of the image to analyze.
 * @param projectId - The unique identifier of the project associated with the image.
 * @returns A promise that resolves to the analysis result.
 */
export const analyzeProgressImage = async (
  imageUrl: string,
  projectId: string
): Promise<AnalysisResult> => {
  const { AI_MOCK_MODE } = await import('../constants')

  if (AI_MOCK_MODE) {
    return analyzeImageMock(imageUrl, projectId)
  } else {
    return analyzeImageReal(imageUrl, projectId)
  }
}

/**
 * Retrieves the history of AI analyses for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of past analysis records.
 * @throws Will throw an error if the database query fails.
 */
export const getAnalysisHistory = async (projectId: string) => {
  const { data, error } = await supabase
    .from('scan_analyses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

