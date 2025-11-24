import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export const ConfigError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Configuration Error</CardTitle>
          </div>
          <CardDescription>
            Supabase environment variables are missing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please create a <code className="px-1 py-0.5 bg-muted rounded">.env.local</code> file in the root directory with the following:
          </p>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-xs overflow-x-auto">
              {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Get these values from your Supabase project settings:
          </p>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> and create a project</li>
            <li>Navigate to Project Settings → API</li>
            <li>Copy the Project URL and anon/public key</li>
            <li>Create <code className="px-1 py-0.5 bg-muted rounded">.env.local</code> with the values above</li>
            <li>Restart the dev server</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
