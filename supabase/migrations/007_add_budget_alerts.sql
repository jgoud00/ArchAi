-- Migration: Add budget alert threshold
-- Adds threshold field to budgets table for automated alerts

-- Add threshold column to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS alert_threshold DECIMAL(12, 2) DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_budgets_alert_threshold ON public.budgets(alert_threshold);

-- Add comment
COMMENT ON COLUMN public.budgets.alert_threshold IS 'Budget threshold percentage (0-100) for triggering alerts when actual_cost exceeds threshold';

