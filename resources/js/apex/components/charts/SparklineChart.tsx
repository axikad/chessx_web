import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export interface SparklineChartProps {
  data: number[];
  color?: string;
  isPositive?: boolean;
  height?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color,
  isPositive = true,
  height = 36,
}) => {
  const chartData = data.map((val, idx) => ({ value: val, idx }));
  const strokeColor = color || (isPositive ? '#10b981' : '#f43f5e');

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
