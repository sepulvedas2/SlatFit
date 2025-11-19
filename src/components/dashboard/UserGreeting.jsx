import React from "react";

export default function UserGreeting({ userName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
        {getGreeting()}, {userName}! 👋
      </h1>
      <p className="text-xl text-[#CEEDB2]">
        Vamos evoluir hoje?
      </p>
    </div>
  );
}