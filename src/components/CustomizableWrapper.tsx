import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Move, Maximize2, RotateCcw, Check } from 'lucide-react';
import { cn } from '../utils';

interface LayoutData {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

interface CustomizableWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isEnabled?: boolean;
}

export const CustomizableWrapper: React.FC<CustomizableWrapperProps> = ({ id, children, className, isEnabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<LayoutData>(() => {
    const saved = localStorage.getItem(`layout_${id}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.scale !== undefined && data.scaleX === undefined) {
        return { ...data, scaleX: data.scale, scaleY: data.scale, x: data.x || 0, y: data.y || 0 };
      }
      return data;
    }
    return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  });

  const saveLayout = (newLayout: LayoutData) => {
    setLayout(newLayout);
    localStorage.setItem(`layout_${id}`, JSON.stringify(newLayout));
  };

  const handleSyncGlobal = () => {
    // Extract prefix (e.g., 'plan' from 'plan-123')
    const prefix = id.split('-')[0];
    if (!prefix) return;

    // Find all layout keys in localStorage with this prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`layout_${prefix}-`)) {
        localStorage.setItem(key, JSON.stringify({
          ...layout,
          // We usually don't want to sync absolute X/Y precisely if they are in different scroll containers,
          // but for the sake of the request "apply to all similar", we sync everything.
          // User might want to reset X/Y locally after.
        }));
      }
    });

    // Notify user or just show success state
    alert("تم تطبيق التصميم على جميع المربعات المماثلة! يرجى تحديث الصفحة لرؤية النتائج كاملة.");
    window.location.reload();
  };

  if (!isEnabled) return <div className={className}>{children}</div>;

  return (
    <div className={cn("relative group/wrapper", className)}>
      {/* Edit Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(!isEditing);
        }}
        className={cn(
          "absolute -top-3 -right-3 z-[100] p-2.5 rounded-full shadow-xl transition-all border shrink-0",
          isEditing 
            ? "bg-emerald-500 text-white border-emerald-400 scale-125" 
            : "bg-white text-primary border-primary/20 hover:scale-125 lg:opacity-30 hover:opacity-100 opacity-100"
        )}
      >
        {isEditing ? <Check size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Control Panel when editing */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 z-[101] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 flex flex-col gap-4 min-w-[320px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">العرض (Width)</span>
              <input 
                type="range" 
                min="0.2" 
                max="3" 
                step="0.05" 
                value={layout.scaleX}
                onChange={(e) => saveLayout({ ...layout, scaleX: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">الطول (Height)</span>
              <input 
                type="range" 
                min="0.2" 
                max="3" 
                step="0.05" 
                value={layout.scaleY}
                onChange={(e) => saveLayout({ ...layout, scaleY: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
            <button 
              onClick={handleSyncGlobal}
              className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2"
              title="تطبيق على الكل"
            >
              <Check size={12} />
              تطبيق هذا التصميم على جميع المربعات المماثلة
            </button>
            <button 
              onClick={() => saveLayout({ x: 0, y: 0, scaleX: 1, scaleY: 1 })}
              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
              title="إعادة ضبط"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* The Draggable Content */}
      <motion.div
        drag={isEditing}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          saveLayout({ 
            ...layout, 
            x: layout.x + info.offset.x, 
            y: layout.y + info.offset.y 
          });
        }}
        style={{
          x: layout.x,
          y: layout.y,
          scaleX: layout.scaleX,
          scaleY: layout.scaleY,
          cursor: isEditing ? 'move' : 'inherit',
          touchAction: isEditing ? 'none' : 'auto',
          transformOrigin: 'center center'
        }}
        className={cn("w-full transition-shadow relative", isEditing && "shadow-2xl z-[90] ring-4 ring-primary/20 rounded-[inherit]")}
      >
        {isEditing && (
          <>
            {/* Movement Overlay Label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-[102] flex items-center gap-2 whitespace-nowrap">
              <Move size={12} />
              <span>اسحب للتحريك</span>
            </div>

            <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 border-dashed rounded-[inherit] z-10" />
            
            {/* Corner Resize Handle - Bottom Right */}
            <motion.div
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newScaleX = Math.max(0.2, layout.scaleX + info.delta.x / 100);
                const newScaleY = Math.max(0.2, layout.scaleY + info.delta.y / 100);
                setLayout({ ...layout, scaleX: newScaleX, scaleY: newScaleY });
              }}
              onDragEnd={() => saveLayout(layout)}
              className="absolute -bottom-4 -right-4 w-10 h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary shadow-xl cursor-nwse-resize z-[110] hover:scale-110 active:scale-95 transition-transform"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="w-4 h-4 border-r-2 border-b-2 border-primary rounded-sm" />
            </motion.div>

            {/* Corner Resize Handle - Top Left */}
            <motion.div
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newScaleX = Math.max(0.2, layout.scaleX - info.delta.x / 100);
                const newScaleY = Math.max(0.2, layout.scaleY - info.delta.y / 100);
                setLayout({ ...layout, scaleX: newScaleX, scaleY: newScaleY });
              }}
              onDragEnd={() => saveLayout(layout)}
              className="absolute -top-4 -left-4 w-10 h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center text-primary shadow-xl cursor-nwse-resize z-[110] hover:scale-110 active:scale-95 transition-transform"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="w-4 h-4 border-l-2 border-t-2 border-primary rounded-sm" />
            </motion.div>
          </>
        )}
        {children}
      </motion.div>
    </div>
  );
};
