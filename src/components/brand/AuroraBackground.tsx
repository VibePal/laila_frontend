import React from "react";

const AuroraBackground: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-aurora" />
    </div>
  );
};

export default AuroraBackground;
