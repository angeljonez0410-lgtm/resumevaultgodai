import React from 'react';

export default function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      {subtitle && <p className="text-slate-500 text-sm md:text-base ml-[52px]">{subtitle}</p>}
    </div>
  );
}