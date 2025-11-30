-- Migration: Add get_dashboard_stats RPC
-- Timestamp: 20251130124500

CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_projects', (SELECT count(*) FROM projects WHERE owner_id = user_uuid),
    'active_builds', (SELECT count(*) FROM projects WHERE owner_id = user_uuid AND status = 'active'),
    'tasks_pending', (
      SELECT count(*) 
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE p.owner_id = user_uuid AND t.status = 'pending'
    ),
    'team_members', (
      SELECT count(DISTINCT user_id)
      FROM team_members tm
      JOIN projects p ON p.id = tm.project_id
      WHERE p.owner_id = user_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
