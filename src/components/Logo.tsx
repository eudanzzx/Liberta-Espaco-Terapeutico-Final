
import React from 'react';

interface LogoProps {
  height?: number;
  width?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ height = 60, width = 60, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/2f13fdd4-2f35-434b-9e00-fdd31d16ef3d.png" 
        alt="Libertá - Espaço Terapêutico" 
        height={height} 
        width={width} 
        className="object-contain" 
      />
    </div>
  );
};

export default Logo;
