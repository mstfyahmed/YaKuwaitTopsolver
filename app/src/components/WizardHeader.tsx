import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';
import { useSettings } from '../types';

export const WizardHeader = ({ step, totalSteps = 7, title = "إنشاء مهمة جديدة", transparent = false, hideProgress = false }: { step: number, totalSteps?: number, title?: string, transparent?: boolean, hideProgress?: boolean }) => {
  const progress = (step / totalSteps) * 100;
  const settings = useSettings();
  
  return (
    <div className={cn(
      "pt-2 sm:pt-6 pb-2 sm:pb-4 px-2 sm:px-5 border-b sticky top-0 z-50 transition-all duration-300 w-full",
      transparent ? "bg-transparent border-transparent" : "bg-white border-slate-100"
    )} dir="rtl">
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div className="text-right flex items-center gap-2 sm:gap-4">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-lg shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div>
            <h1 className={cn("text-lg sm:text-2xl font-black", transparent ? "text-white" : "text-slate-800")}>{title}</h1>
            {!hideProgress && <p className={cn("text-[10px] sm:text-sm font-bold mt-0.5", transparent ? "text-white/60" : "text-slate-400")}>الخطوة {step} من {totalSteps}</p>}
          </div>
        </div>
        {!hideProgress && (
          <div className="text-left">
            <p className={cn("text-[10px] uppercase mb-0.5", transparent ? "text-white/40" : "text-slate-400")}>التقدم</p>
            <p className={cn("font-black text-sm sm:text-xl", transparent ? "text-cyan-400" : "text-primary")}>{Math.round(progress)}%</p>
          </div>
        )}
      </div>
      {!hideProgress && (
        <div className="w-full h-1 sm:h-2 bg-slate-100/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full", transparent ? "bg-gradient-to-r from-cyan-400 to-purple-500" : "bg-primary")}
          />
        </div>
      )}
    </div>
  );
};
