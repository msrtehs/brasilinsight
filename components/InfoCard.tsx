
import React from 'react';

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center gap-3">
        <div className="text-blue-600">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
