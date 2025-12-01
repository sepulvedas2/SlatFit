import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function WeeklyBarChart({ data }) {
  const colors = ["#CEF17B", "#CEEDB2", "#86efac", "#4ade80", "#22c55e", "#16a34a"];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.5)" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)" 
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(8, 71, 52, 0.95)', 
              border: '1px solid rgba(206, 241, 123, 0.3)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="treinos" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}