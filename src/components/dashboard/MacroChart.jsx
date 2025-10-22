import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MacroChart({ protein, carbs, fats, proteinTarget, carbsTarget, fatsTarget }) {
  const data = [
    { 
      name: "Proteína", 
      value: Math.round(protein), 
      target: proteinTarget || 150,
      color: "#10b981"
    },
    { 
      name: "Carboidratos", 
      value: Math.round(carbs), 
      target: carbsTarget || 200,
      color: "#f59e0b"
    },
    { 
      name: "Gorduras", 
      value: Math.round(fats), 
      target: fatsTarget || 60,
      color: "#ef4444"
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value, name, props) => [
            `${value}g / ${props.payload.target}g`,
            name
          ]}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}