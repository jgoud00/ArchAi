import { memo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ChartDataPoint {
    name: string;
    projects: number;
    tasks: number;
}

interface DashboardChartProps {
    data: ChartDataPoint[];
}

/**
 * Custom tooltip component for better styling
 */
const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
            <p className="text-sm font-medium text-foreground mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground capitalize">{entry.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/**
 * Custom legend component
 */
const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    if (!payload?.length) return null;

    return (
        <div className="flex items-center justify-center gap-6 mt-4">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground capitalize">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/**
 * DashboardChart - Interactive area chart with tooltips
 * 
 * Features:
 * - Gradient fills for visual appeal
 * - Custom hover tooltips
 * - Animated transitions
 * - Custom legend
 */
export const DashboardChart = memo(({ data }: DashboardChartProps) => {
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No activity data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Monthly Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                        <defs>
                            <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: 'hsl(var(--primary))',
                                strokeWidth: 1,
                                strokeDasharray: '4 4'
                            }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Area
                            type="monotone"
                            dataKey="projects"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#projectsGradient)"
                            dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                            activeDot={{
                                r: 6,
                                fill: 'hsl(var(--primary))',
                                strokeWidth: 2,
                                stroke: 'white'
                            }}
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="tasks"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#tasksGradient)"
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                            activeDot={{
                                r: 6,
                                fill: '#10b981',
                                strokeWidth: 2,
                                stroke: 'white'
                            }}
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

DashboardChart.displayName = 'DashboardChart';
