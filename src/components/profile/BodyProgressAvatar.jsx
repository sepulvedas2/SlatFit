import React from "react";

export default function BodyProgressAvatar({ gender = "male" }) {
  const isFemale = gender === "female";

  return (
    <div
      className="mx-auto flex items-center justify-center rounded-3xl p-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(206,241,123,0.12)" }}
    >
      <svg viewBox="0 0 180 320" className="h-64 w-40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#CEF17B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="90" cy="34" r="20" fill="rgba(206,241,123,0.08)" />
          <path d={isFemale ? "M72 62C76 54 104 54 108 62L118 104C121 113 116 122 107 124L104 150C103 159 98 166 90 166C82 166 77 159 76 150L73 124C64 122 59 113 62 104L72 62Z" : "M68 62C73 54 107 54 112 62L120 106C123 117 116 126 106 128L102 156C101 165 96 172 90 172C84 172 79 165 78 156L74 128C64 126 57 117 60 106L68 62Z"} fill="rgba(206,241,123,0.08)" />
          <path d={isFemale ? "M62 82L40 128M118 82L140 128" : "M60 82L34 138M120 82L146 138"} />
          <path d={isFemale ? "M48 124L42 172M132 124L138 172" : "M38 134L34 188M142 134L146 188"} />
          <path d={isFemale ? "M78 166L68 240M102 166L112 240" : "M80 172L72 252M100 172L108 252"} />
          <path d={isFemale ? "M68 240L62 298M112 240L118 298" : "M72 252L68 304M108 252L112 304"} />
          <path d={isFemale ? "M74 92H106M76 118H104M77 142H103" : "M72 92H108M74 118H106M76 144H104"} opacity="0.7" />
          <path d={isFemale ? "M78 184H102" : "M76 190H104"} opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}