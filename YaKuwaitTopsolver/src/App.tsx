import { useState, useEffect, ReactNode, FormEvent, ChangeEvent, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Search, ArrowLeft, Check, Eye, Settings as SettingsIcon, LogOut, Plus, Edit2, Trash2, Upload, ChevronDown, ChevronUp, X, Maximize2, RotateCcw, Download, MessageCircle, PlusCircle, ChevronLeft, ExternalLink, Clock, ClipboardCheck, BookOpen, Calendar as CalendarIcon, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Rnd } from 'react-rnd';
import { io } from 'socket.io-client';
import { CustomizableWrapper } from './components/CustomizableWrapper';
import { BookingWizard } from './components/BookingWizard';
import { University, Subject, Plan, Settings, useSettings, InfoBox, PlanOutputItem } from './types';
import { cn } from './utils';
import { MapMode } from './components/MapMode';

import { WizardHeader } from './components/WizardHeader';

// --- Components ---

export const updateSettings = async (updates: Partial<Settings>) => {
  await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
};

const UIText = ({ id, defaultText, className, settings }: { id: string, defaultText: string, className?: string, settings: Settings }) => {
  const uiTexts = settings.ui_texts ? JSON.parse(settings.ui_texts) : {};
  return (
    <span className={className}>
      {uiTexts[id] || defaultText}
    </span>
  );
};

const StepTitle = ({ title, subtitle, onBack, dark = false, children }: { title: ReactNode, subtitle?: string, onBack?: () => void, dark?: boolean, children?: ReactNode }) => (
  <div className="flex justify-between items-center mt-8 mb-6" dir="rtl">
    <div className="text-right">
      <h2 className={cn("text-2xl font-black", dark ? "text-white" : "text-slate-800")}>{title}</h2>
      {subtitle && <p className={cn("text-sm font-bold mt-0.5", dark ? "text-white/60" : "text-slate-400")}>{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">
      {children}
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm bg-white shadow-sm active:scale-95 transition-all"
        >
          <ChevronDown size={18} className="rotate-90" />
          <span>رجوع</span>
        </button>
      )}
    </div>
  </div>
);

const Header = ({ title, logoUrl }: { title: string, logoUrl?: string }) => (
  <header className="header-gradient flex flex-col items-center justify-center gap-2 py-8">
    {logoUrl ? (
      <img src={logoUrl} alt="Logo" className="h-14 w-auto object-contain mb-1" referrerPolicy="no-referrer" />
    ) : (
      <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center mb-1 backdrop-blur-sm border border-white/10">
        <span className="text-white font-bold text-2xl">{title.charAt(0)}</span>
      </div>
    )}
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
  </header>
);

const Container = ({ children, className }: { children: ReactNode, className?: string }) => (
  <div className={cn("max-w-6xl mx-auto px-1.5 sm:px-5 pb-8 sm:pb-12 w-full", className)}>
    {children}
  </div>
);

// --- Pages ---

const Home = ({ 
  onOpenAdmin, 
  isLoggedIn, 
  showSuccess,
  wizardStep,
  setWizardStep,
  wizardSubjectId,
  setWizardSubjectId,
  wizardPlanId,
  setWizardPlanId,
  wizardUniId,
  setWizardUniId,
  isAddingSubject,
  setIsAddingSubject,
  selectedSubject,
  setSelectedSubject
}: any) => {
  const [unis, setUnis] = useState<University[]>([]);
  const [infoBoxes, setInfoBoxes] = useState<InfoBox[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBoxId, setEditingBoxId] = useState<number | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAddInfoBoxModalOpen, setIsAddInfoBoxModalOpen] = useState(false);
  const [newInfoBoxData, setNewInfoBoxData] = useState({ title: '', text: '' });
  const [whatsappData, setWhatsappData] = useState({ number: '', prefix: '', buttonText: '' });
  const navigate = useNavigate();
  const settings = useSettings();

  const fetchData = () => {
    fetch('/api/universities').then(res => res.json()).then(setUnis);
    fetch('/api/info-boxes').then(res => res.json()).then(setInfoBoxes);
  };

  useEffect(() => {
    fetchData();

    const socket = io();
    socket.on('data_updated', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (settings) {
      setWhatsappData({
        number: settings.whatsapp_number || '',
        prefix: settings.whatsapp_prefix || '',
        buttonText: settings.whatsapp_button_text || ''
      });
    }
  }, [settings]);

  const handleUpdateSetting = async (key: string, value: string) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleUpdateUni = async (id: number, field: string, value: string) => {
    const uni = unis.find(u => u.id === id);
    if (!uni) return;
    const updated = { ...uni, [field]: value };
    await fetch(`/api/admin/universities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setUnis(prev => prev.map(u => u.id === id ? updated : u));
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleReorderUnis = async (direction: 'up' | 'down', index: number) => {
    const newUnis = [...unis];
    if (direction === 'up' && index > 0) {
      [newUnis[index], newUnis[index - 1]] = [newUnis[index - 1], newUnis[index]];
    } else if (direction === 'down' && index < unis.length - 1) {
      [newUnis[index], newUnis[index + 1]] = [newUnis[index + 1], newUnis[index]];
    } else {
      return;
    }
    setUnis(newUnis);
    await fetch('/api/admin/reorder-universities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newUnis.map(u => u.id) })
    });
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleDeleteUni = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الجامعة؟')) {
      await fetch(`/api/admin/universities/${id}`, { method: 'DELETE' });
      setUnis(prev => prev.filter(u => u.id !== id));
      showSuccess('تم حفظ التغييرات بنجاح ✅');
    }
  };

  const handleAddUni = async () => {
    const name = window.prompt('اسم الجامعة الجديدة:');
    if (!name) return;
    await fetch('/api/admin/universities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: 'وصف الجامعة' })
    });
    fetch('/api/universities').then(res => res.json()).then(setUnis);
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleAddInfoBox = () => {
    setNewInfoBoxData({ title: '', text: '' });
    setIsAddInfoBoxModalOpen(true);
  };

  const submitNewInfoBox = async () => {
    if (!newInfoBoxData.text) return;
    const res = await fetch('/api/admin/info-boxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: newInfoBoxData.title,
        text: newInfoBoxData.text, 
        bg_color: '#ffffff', 
        text_color: '#000000',
        text_size: '24',
        font_family: 'sans',
        shape: '16',
        is_bold: false,
        has_3d_shadow: true,
        width: 300,
        height: 150,
        pos_x: 0,
        pos_y: 0
      })
    });
    const data = await res.json();
    await fetch('/api/info-boxes').then(res => res.json()).then(setInfoBoxes);
    setIsAddInfoBoxModalOpen(false);
    
    // Automatically enter edit mode for the new box
    if (data.success && data.id) {
      setIsEditMode(true);
      setEditingBoxId(data.id);
      showSuccess('تم حفظ التغييرات بنجاح ✅');
    }
  };

  const handleUpdateInfoBox = async (id: number, field: string, value: any) => {
    const box = infoBoxes.find(b => b.id === id);
    if (!box) return;
    const updated = { ...box, [field]: value };
    await fetch(`/api/admin/info-boxes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setInfoBoxes(prev => prev.map(b => b.id === id ? updated : b));
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleUpdateInfoBoxMultiple = async (id: number, updates: Partial<InfoBox>) => {
    const box = infoBoxes.find(b => b.id === id);
    if (!box) return;
    const updated = { ...box, ...updates };
    await fetch(`/api/admin/info-boxes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setInfoBoxes(prev => prev.map(b => b.id === id ? updated : b));
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleDeleteInfoBox = async (id: number) => {
    await fetch(`/api/admin/info-boxes/${id}`, {
      method: 'DELETE'
    });
    setInfoBoxes(prev => prev.filter(b => b.id !== id));
    if (editingBoxId === id) setEditingBoxId(null);
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    await fetch('/api/admin/logo', {
      method: 'POST',
      body: formData
    });
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleFileUpload = async (boxId: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      handleUpdateInfoBox(boxId, 'file_url', data.file_url);
    }
  };

  if (!settings) return null;

  const modalsAndPanels = (
    <>
      <AnimatePresence>
        {isAddInfoBoxModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <PlusCircle className="text-[var(--color-primary)]" />
                  إضافة مربع نص جديد
                </h3>
                <button onClick={() => setIsAddInfoBoxModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">العنوان (اختياري)</label>
                  <input 
                    type="text" 
                    value={newInfoBoxData.title}
                    onChange={(e) => setNewInfoBoxData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المربع"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">النص</label>
                  <textarea 
                    value={newInfoBoxData.text}
                    onChange={(e) => setNewInfoBoxData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="أدخل محتوى المربع"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[100px] resize-none"
                  />
                </div>

                <button 
                  onClick={submitNewInfoBox}
                  disabled={!newInfoBoxData.text.trim()}
                  className="w-full py-4 bg-[var(--color-primary)] hover:bg-[#14b8a6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg shadow-lg shadow-[var(--color-primary)]/30 transition-all mt-4"
                >
                  إضافة المربع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <MessageCircle className="text-[#22c55e]" />
                  إعدادات الواتساب
                </h3>
                <button onClick={() => setIsWhatsAppModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الواتساب الجديد</label>
                  <input 
                    type="text" 
                    value={whatsappData.number}
                    onChange={(e) => setWhatsappData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="مثال: 96512345678"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-[#22c55e] font-mono text-left"
                    dir="ltr"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">الرجاء إدخال الرقم مع مفتاح الدولة (بدون + أو أصفار)</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رسالة الترحيب / البداية</label>
                  <textarea 
                    value={whatsappData.prefix}
                    onChange={(e) => setWhatsappData(prev => ({ ...prev, prefix: e.target.value }))}
                    placeholder="مثال: مرحباً، أود الاستفسار عن..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-[#22c55e] min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نص زر الواتساب</label>
                  <input 
                    type="text" 
                    value={whatsappData.buttonText}
                    onChange={(e) => setWhatsappData(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="مثال: اطلب عبر واتساب"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-right outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>

                <button 
                  onClick={async () => {
                    await handleUpdateSetting('whatsapp_number', whatsappData.number);
                    await handleUpdateSetting('whatsapp_prefix', whatsappData.prefix);
                    await handleUpdateSetting('whatsapp_button_text', whatsappData.buttonText);
                    setIsWhatsAppModalOpen(false);
                    window.location.reload();
                  }}
                  className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#22c55e]/30 transition-all mt-4"
                >
                  حفظ التعديلات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Box Settings Floating Panel */}
      <AnimatePresence>
        {isEditMode && editingBoxId && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-1/2 right-4 -translate-y-1/2 z-[110] w-80 bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 max-h-[90vh] overflow-y-auto custom-scrollbar" 
            dir="rtl"
          >
            {(() => {
              const box = infoBoxes.find(b => b.id === editingBoxId);
              if (!box) return null;
              
              const fontSize = parseInt(box.text_size) || 18;
              const borderRadius = parseInt(box.shape) || 16;

              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-slate-800">إعدادات المربع</h3>
                    <button onClick={() => setEditingBoxId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">العنوان (اختياري)</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-right outline-none focus:ring-2 focus:ring-primary text-sm mb-3"
                      defaultValue={box.title || ''}
                      onBlur={(e) => handleUpdateInfoBox(box.id, 'title', e.target.value)}
                      placeholder="عنوان المربع"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">النص</label>
                    <textarea
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-right outline-none focus:ring-2 focus:ring-primary min-h-[80px] text-sm"
                      defaultValue={box.text}
                      onBlur={(e) => handleUpdateInfoBox(box.id, 'text', e.target.value)}
                    />
                  </div>

                  {/* Font Size Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">حجم الخط</label>
                      <span className="text-xs text-slate-500 font-mono">{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" max="72" 
                      value={fontSize}
                      onChange={(e) => handleUpdateInfoBox(box.id, 'text_size', e.target.value)}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Border Radius Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">انحناء الزوايا</label>
                      <span className="text-xs text-slate-500 font-mono">{borderRadius}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={borderRadius}
                      onChange={(e) => handleUpdateInfoBox(box.id, 'shape', e.target.value)}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">لون الخلفية</label>
                      <input
                        type="color"
                        className="w-full h-10 rounded-xl cursor-pointer border-none p-0"
                        value={box.bg_color || '#ffffff'}
                        onChange={(e) => handleUpdateInfoBox(box.id, 'bg_color', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">لون النص</label>
                      <input
                        type="color"
                        className="w-full h-10 rounded-xl cursor-pointer border-none p-0"
                        value={box.text_color || '#000000'}
                        onChange={(e) => handleUpdateInfoBox(box.id, 'text_color', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">الخط</label>
                      <select
                        className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none"
                        defaultValue={box.font_family || 'sans'}
                        onChange={(e) => handleUpdateInfoBox(box.id, 'font_family', e.target.value)}
                      >
                        <option value="sans">Sans</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Mono</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 justify-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          defaultChecked={box.is_bold} 
                          onChange={(e) => handleUpdateInfoBox(box.id, 'is_bold', e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-slate-600">عريض</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          defaultChecked={box.has_3d_shadow} 
                          onChange={(e) => handleUpdateInfoBox(box.id, 'has_3d_shadow', e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-slate-600">ظل 3D</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">إرفاق ملف</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all text-sm font-bold text-slate-600">
                        <Upload size={16} />
                        <span>{box.file_url ? 'تغيير الملف' : 'رفع ملف'}</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(box.id, e)} />
                      </label>
                      {box.file_url && (
                        <button 
                          onClick={() => handleUpdateInfoBox(box.id, 'file_url', '')}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {box.file_url && (
                      <a href={box.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary mt-1 block truncate" dir="ltr">
                        {box.file_url.split('/').pop()}
                      </a>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      handleDeleteInfoBox(box.id);
                      setEditingBoxId(null);
                    }}
                    className="w-full py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Trash2 size={16} />
                    حذف المربع
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (settings.layout_mode === 'map') {
    return (
      <>
        {modalsAndPanels}
        <MapMode 
          unis={unis} 
          settings={settings} 
          isLoggedIn={isLoggedIn} 
          onOpenAdmin={onOpenAdmin}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          setIsWhatsAppModalOpen={setIsWhatsAppModalOpen}
          infoBoxes={infoBoxes}
          handleAddInfoBox={handleAddInfoBox}
          editingBoxId={editingBoxId}
          setEditingBoxId={setEditingBoxId}
          handleUpdateInfoBox={handleUpdateInfoBox}
          handleUpdateInfoBoxMultiple={handleUpdateInfoBoxMultiple}
          handleDeleteInfoBox={handleDeleteInfoBox}
          handleFileUpload={handleFileUpload}
          handleUpdateUni={handleUpdateUni}
          setIsAddingSubject={setIsAddingSubject}
          setWizardStep={setWizardStep}
          setWizardSubjectId={setWizardSubjectId}
          setWizardPlanId={setWizardPlanId}
          setWizardUniId={setWizardUniId}
          setSelectedSubject={setSelectedSubject}
          isAddingSubject={isAddingSubject}
          showSuccess={showSuccess}
          onUpdateSettings={updateSettings}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      <style>{`
        :root {
          --primary-color: ${settings.primary_color || '#000000'};
        }
        .react-draggable-dragging {
          border: 2px dashed #60a5fa !important;
          background-color: rgba(239, 246, 255, 0.5) !important;
          opacity: 0.8;
        }
        .react-draggable-dragging > div {
          opacity: 0.5;
        }
      `}</style>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <WizardHeader step={1} totalSteps={7} title={settings.site_name} transparent hideProgress />
      
      {modalsAndPanels}

      {isLoggedIn && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-wrap gap-2 w-full max-w-md justify-center px-4" dir="rtl">
          <button 
            onClick={() => {
              setIsEditMode(!isEditMode);
              setEditingBoxId(null);
            }}
            className={cn(
              "px-4 md:px-6 py-2.5 rounded-full font-bold text-white shadow-lg transition-all flex-1 min-w-[100px] text-xs md:text-sm whitespace-nowrap",
              isEditMode ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-[#d946ef] hover:bg-[#c026d3] shadow-[#d946ef]/30"
            )}
          >
            {isEditMode ? "إغلاق التعديل" : "تعديل حر"}
          </button>
          <button 
            onClick={handleAddInfoBox}
            className="px-4 md:px-6 py-2.5 rounded-full font-bold text-white bg-[var(--color-primary)] hover:bg-[#14b8a6] shadow-lg shadow-[var(--color-primary)]/30 transition-all flex-1 min-w-[100px] text-xs md:text-sm whitespace-nowrap"
          >
            إضافة مربع نص
          </button>
          <button 
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-4 md:px-6 py-2.5 rounded-full font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] shadow-lg shadow-[#22c55e]/30 transition-all flex-1 min-w-[100px] text-xs md:text-sm whitespace-nowrap"
          >
            تعديل بيانات الواتس
          </button>
        </div>
      )}

      <Container>
        <div className="text-center py-16 relative z-10" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            The Best Solution
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-slate-900 mb-4 leading-[1.1] tracking-tight"
          >
            {isEditMode ? (
              <div className="space-y-2">
                <input 
                  className="w-full bg-transparent text-center outline-none border-b-2 border-primary/20 focus:border-primary"
                  defaultValue={settings.hero_title || "Yakuwait"}
                  onBlur={(e) => handleUpdateSetting('hero_title', e.target.value)}
                />
                <input 
                  className="w-full bg-transparent text-center outline-none border-b-2 border-primary/20 focus:border-primary text-primary"
                  defaultValue={settings.hero_subtitle || "Top Solver"}
                  onBlur={(e) => handleUpdateSetting('hero_subtitle', e.target.value)}
                />
              </div>
            ) : (
              <>
                {settings.hero_title || "Yakuwait"} <br />
                <span className="text-primary">{settings.hero_subtitle || "Top Solver"}</span>
              </>
            )}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-bold text-base max-w-[280px] mx-auto leading-relaxed"
          >
            {isEditMode ? (
              <textarea 
                className="w-full bg-transparent text-center outline-none border-b-2 border-primary/20 focus:border-primary min-h-[80px]"
                defaultValue={settings.hero_description || "الحل الأمثل لجميع مهامك الدراسية بأعلى جودة ودقة متناهية"}
                onBlur={(e) => handleUpdateSetting('hero_description', e.target.value)}
              />
            ) : (
              settings.hero_description || "الحل الأمثل لجميع مهامك الدراسية بأعلى جودة ودقة متناهية"
            )}
          </motion.div>

          {isEditMode && (
            <div className="mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-[32px] border border-slate-100 text-right space-y-4">
              <h4 className="font-black text-slate-800 text-sm mb-2">إعدادات عامة</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">اسم الموقع</label>
                  <input 
                    className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={settings.site_name || "Yakuwait Top Solver"}
                    onBlur={(e) => handleUpdateSetting('site_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">حجم الشعار (px)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={settings.logo_size || "56"}
                    onBlur={(e) => handleUpdateSetting('logo_size', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">اللون الأساسي</label>
                  <input 
                    type="color"
                    className="w-full h-12 p-1 bg-white border border-slate-100 rounded-xl outline-none cursor-pointer"
                    defaultValue={settings.primary_color || "#000000"}
                    onBlur={(e) => handleUpdateSetting('primary_color', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">تغيير الشعار</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary hover:text-primary transition-all">
                      <Upload size={20} />
                      <span className="text-sm font-bold">رفع شعار جديد</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {settings.logo_url && (
                      <button 
                        onClick={() => handleUpdateSetting('logo_url', '')}
                        className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10">
          <StepTitle 
            title={<UIText id="choose_uni" defaultText="اختر الجامعة" settings={settings} />}
            subtitle="يرجى اختيار جامعتك للمتابعة" 
          />

          <div className="grid grid-cols-1 gap-5 max-w-4xl mx-auto">
            {(() => {
              const seen = new Set();
              return unis.map((uni, idx) => {
                if (!uni.id || seen.has(uni.id)) return null;
                seen.add(uni.id);
                return (
                  <CustomizableWrapper 
                    key={`home-uni-wrapper-${uni.id}`}
                    id={`uni-${uni.id}`}
                    isEnabled={isLoggedIn}
                    className="w-full"
                  >
                    <motion.div
                      key={`home-uni-${uni.id}`}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      whileHover={!isEditMode ? { y: -4, scale: 1.01 } : {}}
                      whileTap={!isEditMode ? { scale: 0.98 } : {}}
                      onClick={() => !isEditMode && navigate(`/university/${uni.id}/services`)}
                      className={cn(
                        "bg-white/70 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center justify-between group transition-all w-full",
                        settings.uni_card_size === 'small' ? "p-4" : settings.uni_card_size === 'large' ? "p-8" : "p-6",
                        !isEditMode && "cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-primary/30 hover:bg-white"
                      )}
                    >
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-14 h-14 bg-slate-50 rounded-[22px] flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                    {uni.name.charAt(0)}
                  </div>
                  <div className="text-right flex-1">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full p-2 border border-slate-100 rounded-lg text-right font-black text-lg"
                          defaultValue={uni.name}
                          onBlur={(e) => handleUpdateUni(uni.id, 'name', e.target.value)}
                        />
                        <input 
                          className="w-full p-2 border border-slate-100 rounded-lg text-right text-xs"
                          defaultValue={uni.description || ''}
                          onBlur={(e) => handleUpdateUni(uni.id, 'description', e.target.value)}
                          placeholder="وصف الجامعة..."
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-primary transition-colors">{uni.name}</h3>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{uni.description || 'Explore'}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Available</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {isEditMode ? (
                  <div className="flex items-center gap-2 mr-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleReorderUnis('up', idx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronUp size={16} /></button>
                      <button onClick={() => handleReorderUnis('down', idx)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronDown size={16} /></button>
                    </div>
                    <button onClick={() => handleDeleteUni(uni.id)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ChevronDown className="text-slate-300 -rotate-90 group-hover:translate-x-0.5 transition-transform" size={20} />
                  </div>
                )}
              </motion.div>
                  </CustomizableWrapper>
                );
              });
            })()}
          </div>

          {/* Info Boxes Section */}
          <div 
            className={cn(
              "mt-12 w-full transition-all duration-300 pb-12",
              (isLoggedIn && isEditMode) ? "relative" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            )}
            style={(isLoggedIn && isEditMode) ? { height: Math.max(400, ...infoBoxes.map(b => (b.pos_y || 0) + (b.height || 100))) + 100 } : {}}
          >
            {(() => {
              const seen = new Set();
              return infoBoxes.map((box, idx) => {
                if (!box.id || seen.has(box.id)) return null;
                seen.add(box.id);
                const fontSize = parseInt(box.text_size) || 18;
                const borderRadius = parseInt(box.shape) || 16;
              const boxContent = (
                <div
                  onClick={() => {
                    if (isLoggedIn) {
                      setIsEditMode(true);
                      setEditingBoxId(box.id);
                    }
                  }}
                  className={cn(
                    "w-full h-full p-6 shadow-sm relative group overflow-hidden flex items-center justify-center transition-all duration-300",
                    box.has_3d_shadow ? 'shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-b-4 border-black/10' : '',
                    editingBoxId === box.id ? 'ring-4 ring-primary ring-offset-2' : '',
                    isLoggedIn ? 'cursor-pointer' : ''
                  )}
                  style={{ 
                    backgroundColor: box.bg_color || '#ffffff',
                    borderRadius: `${borderRadius}px`
                  }}
                >
                  {isLoggedIn && isEditMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingBoxId(box.id); }}
                      className={cn(
                        "absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-primary hover:bg-white rounded-xl shadow-md transition-all",
                        editingBoxId === box.id ? "bg-primary text-white" : "bg-white/50"
                      )}
                    >
                      <SettingsIcon size={18} className={editingBoxId === box.id ? "animate-[spin_3s_linear_infinite]" : ""} />
                    </button>
                  )}
                  
                  <div 
                    className={cn("text-center relative z-10 leading-relaxed whitespace-pre-wrap w-full h-full flex flex-col items-center justify-center", box.is_bold ? 'font-black' : 'font-bold')}
                    style={{ 
                      color: box.text_color || '#000000', 
                      fontFamily: box.font_family || 'sans',
                      fontSize: `${fontSize}px`
                    }}
                    dir="rtl"
                  >
                    {box.title && (
                      <div className="font-black mb-2 opacity-90" style={{ fontSize: `${fontSize * 1.2}px` }}>
                        {box.title}
                      </div>
                    )}
                    <div>{box.text}</div>
                    {box.file_url && (
                      <a 
                        href={box.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={16} />
                        تحميل المرفق
                      </a>
                    )}
                  </div>
                </div>
              );

              if (isLoggedIn && isEditMode) {
                return (
                  <Rnd
                    key={`rnd-box-${box.id}`}
                    position={{
                      x: box.pos_x || 0,
                      y: box.pos_y || 0
                    }}
                    size={{
                      width: box.width || 300,
                      height: box.height || 100
                    }}
                    disableDragging={!isEditMode || editingBoxId !== box.id}
                    enableResizing={isEditMode && editingBoxId === box.id}
                    onDragStop={(e, d) => {
                      handleUpdateInfoBoxMultiple(box.id, { pos_x: d.x, pos_y: d.y });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      handleUpdateInfoBoxMultiple(box.id, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        pos_x: position.x,
                        pos_y: position.y
                      });
                    }}
                    className={cn("z-10", editingBoxId === box.id ? "z-50" : "")}
                    resizeHandleStyles={{
                      bottomRight: { width: 16, height: 16, background: '#3b82f6', borderRadius: '50%', right: -8, bottom: -8, border: '2px solid white' },
                      bottomLeft: { width: 16, height: 16, background: '#3b82f6', borderRadius: '50%', left: -8, bottom: -8, border: '2px solid white' },
                      topRight: { width: 16, height: 16, background: '#3b82f6', borderRadius: '50%', right: -8, top: -8, border: '2px solid white' },
                      topLeft: { width: 16, height: 16, background: '#3b82f6', borderRadius: '50%', left: -8, top: -8, border: '2px solid white' },
                    }}
                  >
                    {boxContent}
                  </Rnd>
                );
              }

              return (
                <motion.div
                  key={`motion-box-${box.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="min-h-[220px]"
                >
                  {boxContent}
                </motion.div>
              );
            });
          })()}
        </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-300 text-[10px] font-black tracking-[0.3em] mt-20 py-8 cursor-pointer hover:text-primary transition-all uppercase flex flex-col items-center gap-2 opacity-10 hover:opacity-100"
          onClick={onOpenAdmin}
        >
          <div className="w-8 h-[1px] bg-slate-100" />
          Admin Access
        </motion.div>
      </Container>
    </div>
  );
};

const ActionModal = ({ isOpen, onClose, onNext, onEdit, title, showEdit = false }: { isOpen: boolean, onClose: () => void, onNext: () => void, onEdit: () => void, title: string, showEdit?: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-white w-full max-w-[500px] rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          dir="rtl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
          <div className={cn("grid gap-4", showEdit ? "grid-cols-2" : "grid-cols-1")}>
            <button 
              onClick={onNext}
              className="py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>التالي</span>
              <ArrowLeft size={20} className="rotate-180" />
            </button>
            {showEdit && (
              <button 
                onClick={onEdit}
                className="py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={20} />
                <span>تعديل</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ServiceSelection = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { uniId } = useParams();
  const navigate = useNavigate();
  const [uni, setUni] = useState<University | null>(null);
  const settings = useSettings();

  useEffect(() => {
    if (!uniId) return;
    fetch('/api/universities').then(res => res.json()).then(unis => {
      const found = unis.find((u: any) => u.id === Number(uniId));
      setUni(found);
    });
  }, [uniId]);

  if (!settings || !uni) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <WizardHeader step={1.5} totalSteps={7} />
      <Container className="flex-1 flex flex-col justify-center py-0">
        <StepTitle 
          title={<UIText id="choose_service" defaultText="اختر نوع الخدمة" settings={settings} />}
          subtitle={uni.name}
          onBack={() => navigate('/')}
        />

        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto w-full">
          <CustomizableWrapper id={`service-cost-${uniId}`} isEnabled={isLoggedIn} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/university/${uniId}/subjects`)}
              className="group relative bg-white border-2 border-slate-100 p-8 rounded-[32px] cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-center w-full"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                <ClipboardCheck size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                <UIText id="service_cost_title" defaultText="مساعدة في التكاليف" settings={settings} />
              </h3>
              <p className="text-slate-500 font-bold text-sm">
                <UIText id="service_cost_desc" defaultText="حل الواجبات والمشاريع والتقارير" settings={settings} />
              </p>
            </motion.div>
          </CustomizableWrapper>

          <CustomizableWrapper id={`service-booking-${uniId}`} isEnabled={isLoggedIn} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/university/${uniId}/booking`)}
              className="group relative bg-white border-2 border-slate-100 p-8 rounded-[32px] cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-center w-full"
            >
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-500 mx-auto mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                <UIText id="service_booking_title" defaultText="حجز جلسة اختبار" settings={settings} />
              </h3>
              <p className="text-slate-500 font-bold text-sm">
                <UIText id="service_booking_desc" defaultText="احجز موعداً للمساعدة في اختبارك القادم" settings={settings} />
              </p>
              <div className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">NEW</div>
            </motion.div>
          </CustomizableWrapper>
        </div>
      </Container>
    </div>
  );
};

const TestBookingWizard = ({ showSuccess }: { showSuccess: (m: string) => void }) => {
  const { uniId } = useParams();
  const navigate = useNavigate();
  const settings = useSettings();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uni, setUni] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [testType, setTestType] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!uniId) return;
    const load = async () => {
      const resSubs = await fetch(`/api/subjects/${uniId}`);
      const dataSubs = await resSubs.json();
      setSubjects(dataSubs);
      
      const resUnis = await fetch('/api/universities');
      const dataUnis = await resUnis.json();
      setUni(dataUnis.find((u: any) => u.id === Number(uniId)));
      
      setIsLoading(false);
    };
    load();
  }, [uniId]);

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/bookings/available?date=${selectedDate}`)
        .then(res => res.json())
        .then(setBookedSlots);
    }
  }, [selectedDate]);

  if (!settings || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      setSyllabusUrl(data.file_url);
      showSuccess('تم رفع الملف بنجاح ✅');
    }
  };

  const generateWhatsAppLink = () => {
    const num = settings.whatsapp_number;
    const prefix = settings.whatsapp_prefix || 'السلام عليكم';
    const msg = `${prefix}\n\n*طلب حجز جلسة اختبار*\n------------------\n📍 الجامعة: ${uni?.name}\n📚 المادة: ${selectedSubject?.name}\n📝 نوع الاختبار: ${testType}\n📅 الموعد: ${selectedDate} في ${selectedTimeSlot}\n\nيرجى التواصل لتأكيد السعر النهائي.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  const handleConfirmBooking = async () => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        university_id: Number(uniId),
        subject_id: selectedSubject?.id,
        test_type: testType,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        syllabus_url: syllabusUrl
      })
    });
    
    if (res.ok) {
      window.open(generateWhatsAppLink(), '_blank');
      navigate('/');
      showSuccess('تم إرسال طلب الحجز بنجاح ✅');
    } else {
      const data = await res.json();
      alert(data.error || 'حدث خطأ ما');
    }
  };

  const timeSlots = {
    morning: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'],
    evening: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <WizardHeader step={step + 2} totalSteps={6} />
      <Container className="flex-1 flex flex-col overflow-hidden pb-0">
        <div className="flex-none">
          <StepTitle 
            title={
              step === 1 ? <UIText id="booking_step1_title" defaultText="بيانات الاختبار" settings={settings} /> :
              step === 2 ? <UIText id="booking_step2_title" defaultText="اختيار التوقيت" settings={settings} /> :
              <UIText id="booking_step3_title" defaultText="مراجعة الطلب" settings={settings} />
            }
            subtitle={uni?.name}
            onBack={() => step > 1 ? setStep(step - 1) : navigate(`/university/${uniId}/services`)}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="booking-step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pb-12"
              >
                <div dir="rtl">
                  <label className="block text-slate-800 font-black text-lg mb-4">اختر المادة</label>
                  <div className="relative group">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity">
                      <BookOpen size={20} />
                    </div>
                    <select 
                      value={selectedSubject?.id || ''}
                      onChange={(e) => setSelectedSubject(subjects.find(s => s.id === Number(e.target.value)) || null)}
                      className="w-full p-5 pr-14 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all appearance-none shadow-sm"
                    >
                      <option value="">ابحث عن رمز المادة أو اسمها...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div dir="rtl">
                  <label className="block text-slate-800 font-black text-lg mb-4">نوع الاختبار</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Quiz', 'Midterm', 'Final', 'GSA', 'Lab Test'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setTestType(type)}
                        className={cn(
                          "py-4 rounded-2xl font-black text-sm transition-all border-2",
                          testType === type 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div dir="rtl">
                  <label className="block text-slate-800 font-black text-lg mb-4">المرفقات (اختياري)</label>
                  <div className="relative">
                    <label className={cn(
                      "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all bg-slate-50/50",
                      syllabusUrl ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 hover:border-primary"
                    )}>
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                        syllabusUrl ? "bg-emerald-500 text-white" : "bg-white text-slate-400 group-hover:text-primaryShadow"
                      )}>
                        {syllabusUrl ? <Check size={28} /> : <FileUp size={28} />}
                      </div>
                      <span className="font-bold text-slate-800">
                        {syllabusUrl ? 'تم الرفع بنجاح' : 'ارفع جدول الاختبار أو السيلبس'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">يساعد المدرس في فهم المحتوى بدقة</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="booking-step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 pb-12"
              >
                <div dir="rtl">
                  <label className="block text-slate-800 font-black text-lg mb-4">اختر التاريخ</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-700 outline-none focus:border-primary transition-all text-center"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-8" dir="rtl">
                    {(Object.entries(timeSlots) as [string, string[]][]).map(([period, slots]) => (
                      <div key={period}>
                        <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4 mr-1">
                          {period === 'morning' ? 'الفترة الصباحية' : period === 'afternoon' ? 'فترة الظهيرة' : 'الفترة المسائية'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {slots.map(slot => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedTimeSlot === slot;
                            return (
                              <button
                                key={slot}
                                disabled={isBooked}
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={cn(
                                  "py-4 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-2",
                                  isBooked ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50" :
                                  isSelected ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" :
                                  "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                )}
                              >
                                <Clock size={16} className={isSelected ? "text-white" : "text-slate-300"} />
                                <span>{slot}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTimeSlot && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500 text-white p-4 rounded-2xl text-center font-black shadow-lg shadow-emerald-500/20"
                  >
                    الوقت المختار: الساعة {selectedTimeSlot}
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="booking-step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 pb-12"
              >
                <div className="bg-slate-50 border-2 border-slate-100 rounded-[40px] p-8 space-y-6" dir="rtl">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold">الجامعة</span>
                    <span className="text-slate-800 font-black">{uni?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold">المادة</span>
                    <span className="text-slate-800 font-black">{selectedSubject?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold">النوع</span>
                    <span className="text-slate-800 font-black">{testType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">الموعد</span>
                    <div className="text-right">
                      <div className="text-slate-800 font-black">{selectedDate}</div>
                      <div className="text-primary font-black text-sm">{selectedTimeSlot}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-3xl" dir="rtl">
                  <p className="text-amber-800 text-sm font-bold leading-relaxed text-center">
                    سيتم تحديد السعر النهائي بالاتفاق عبر الواتساب بناءً على نوع الاختبار ومحتواه.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-none p-6 pt-2 bg-slate-50 overflow-hidden">
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleConfirmBooking()}
            disabled={(step === 1 && (!selectedSubject || !testType)) || (step === 2 && (!selectedDate || !selectedTimeSlot))}
            className={cn(
              "w-full py-5 rounded-[24px] font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3",
              (step === 1 && selectedSubject && testType) || (step === 2 && selectedDate && selectedTimeSlot) || step === 3
                ? "bg-primary text-white shadow-primary/20" 
                : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
            )}
          >
            {step === 3 ? (
              <>
                <MessageCircle size={24} />
                <span>تأكيد الموعد عبر WhatsApp</span>
              </>
            ) : (
              <span>استمرار</span>
            )}
          </button>
        </div>
      </Container>
    </div>
  );
};

const SubjectSearch = ({ 
  onOpenAdmin, 
  isLoggedIn, 
  showSuccess,
  wizardStep,
  setWizardStep,
  wizardSubjectId,
  setWizardSubjectId,
  wizardPlanId,
  setWizardPlanId,
  wizardUniId,
  setWizardUniId,
  isAddingSubject,
  setIsAddingSubject,
  selectedSubject,
  setSelectedSubject
}: any) => {
  const { uniId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uni, setUni] = useState<University | null>(null);
  const [search, setSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const wizardSubject = wizardSubjectId ? subjects.find(s => s.id === wizardSubjectId) : null;
  const settings = useSettings();

  const fetchData = () => {
    if (!uniId) return;
    fetch(`/api/subjects/${uniId}`).then(res => res.json()).then(setSubjects);
    fetch('/api/universities').then(res => res.json()).then(unis => {
      const found = unis.find((u: any) => u.id === Number(uniId));
      setUni(found);
    });
  };

  useEffect(() => {
    if (!uniId) return;
    fetchData();

    const socket = io();
    socket.on('data_updated', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [uniId]);

  if (!settings) return null;

  const handleUpdateSubject = async (id: number, field: string, value: string) => {
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;
    const updated = { ...sub, [field]: value };
    await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setSubjects(prev => prev.map(s => s.id === id ? updated : s));
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteSelected = async () => {
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} مادة؟`)) {
      for (const id of selectedIds) {
        await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      }
      fetch(`/api/subjects/${uniId}`).then(res => res.json()).then(setSubjects);
      setSelectedIds([]);
      setIsEditMode(false);
      showSuccess('تم حفظ التغييرات بنجاح ✅');
    }
  };

  if (!settings) return null;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <WizardHeader step={2} totalSteps={7} />
      <Container className="flex-1 flex flex-col overflow-hidden pb-0">
        <div className="flex-none">
          <StepTitle 
            title={<UIText id="choose_subject" defaultText="اختر المادة" settings={settings} />}
            subtitle={uni?.name} 
            onBack={() => navigate(`/university/${uniId}/services`)} 
          >
            {isLoggedIn && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setWizardStep('subject');
                    setIsAddingSubject(true);
                  }}
                  className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1 sm:gap-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">إضافة مادة</span>
                </button>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={cn(
                    "px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all",
                    isEditMode ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  {isEditMode ? "إلغاء التعديل" : "تعديل"}
                </button>
              </div>
            )}
          </StepTitle>
          
          <div className="relative mb-6 max-w-4xl mx-auto" dir="rtl">
            <label className="block text-slate-400 text-sm font-bold mb-2 mr-1">البحث عن المواد</label>
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب اسم أو رمز المادة..."
                className="w-full pl-6 pr-14 py-4.5 rounded-2xl border-2 border-primary/20 focus:border-primary outline-none text-right text-lg font-medium placeholder:text-slate-300 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
          <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
            {(() => {
              const seen = new Set();
              return filtered.map((sub, idx) => {
                if (!sub.id || seen.has(sub.id)) return null;
                seen.add(sub.id);
                return (
                  <CustomizableWrapper
                    key={`search-sub-wrapper-${sub.id}`}
                    id={`sub-search-${sub.id}`}
                    isEnabled={isLoggedIn}
                    className="w-full"
                  >
                    <motion.div
                      key={`search-sub-${sub.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        if (isEditMode) {
                          setSelectedIds(prev => prev.includes(sub.id) ? prev.filter(id => id !== sub.id) : [...prev, sub.id]);
                        } else if (isLoggedIn) {
                          setSelectedSubject(sub);
                        } else {
                          navigate(`/subject/${sub.id}`);
                        }
                      }}
                      className={cn(
                        "bg-white text-right border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100 w-full",
                        settings.subject_card_size === 'small' ? "p-3 rounded-xl" : settings.subject_card_size === 'large' ? "p-8 rounded-3xl" : "p-5 rounded-2xl",
                        selectedIds.includes(sub.id) && "bg-red-50 border-red-200"
                      )}
                    >
                    <div className="flex justify-between items-center">
                      <div className="text-left flex items-center gap-3">
                        {isEditMode ? (
                          <div className={cn(
                            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                            selectedIds.includes(sub.id) ? "bg-red-500 border-red-500" : "border-slate-200 bg-white"
                          )}>
                            {selectedIds.includes(sub.id) && <Check size={16} className="text-white" />}
                          </div>
                        ) : (
                          <ChevronDown className="-rotate-90 text-slate-200" size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <input 
                              className="w-full p-2 border border-slate-200 rounded-lg text-right font-bold"
                              value={sub.name}
                              onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <input 
                              className="w-full p-2 border border-slate-100 rounded-lg text-right text-xs"
                              value={sub.category}
                              onChange={(e) => handleUpdateSubject(sub.id, 'category', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: sub.font }}>{sub.name}</h3>
                            <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-400">
                              <span>{sub.category}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-primary/60">خطة متاحة</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  </CustomizableWrapper>
                );
              });
            })()}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold">
                لا توجد مواد تطابق بحثك
              </div>
            )}
          </div>
        </div>

        {isEditMode && selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-5"
          >
            <button 
              onClick={handleDeleteSelected}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              <span>حذف {selectedIds.length} مادة</span>
            </button>
          </motion.div>
        )}

        <ActionModal 
          isOpen={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          title={selectedSubject?.name || ''}
          showEdit={isLoggedIn}
          onNext={() => {
            navigate(`/subject/${selectedSubject?.id}`);
            setSelectedSubject(null);
          }}
          onEdit={() => {
            if (selectedSubject) {
              setWizardSubjectId(selectedSubject.id);
              setWizardStep('subject');
              setIsAddingSubject(true);
              setSelectedSubject(null);
            }
          }}
        />

        {/* Redundant modal removed */}
      </Container>
    </div>
  );
};

const PlanOutputsEditor = ({ defaultValue, onChange }: { defaultValue?: string, onChange?: (json: string) => void }) => {
  const [outputs, setOutputs] = useState<PlanOutputItem[]>(() => {
    try {
      if (!defaultValue) return [];
      const parsed = JSON.parse(defaultValue);
      if (Array.isArray(parsed)) {
        const seenIds = new Set<string>();
        return parsed.map((item: any, i) => {
          let id = '';
          let name = '';
          let price = 0;
          if (typeof item === 'string') {
            id = `legacy-str-${i}`;
            name = item;
          } else {
            id = item.id || `legacy-obj-${i}`;
            name = item.name || '';
            price = item.price || 0;
          }
          if (seenIds.has(id)) { id = `${id}-dup-${i}`; }
          seenIds.add(id);
          return { id, name, price } as PlanOutputItem;
        });
      }
      return [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    if (onChange) {
      onChange(JSON.stringify(outputs));
    }
  }, [outputs, onChange]);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(0);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setOutputs([...outputs, { id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: newName.trim(), price: newPrice }]);
    setNewName('');
    setNewPrice(0);
  };

  const handleRemove = (id: string) => {
    setOutputs(outputs.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="outputs" value={JSON.stringify(outputs)} />
      
      <div className="flex flex-col gap-2">
        {outputs.map((out) => (
          <div key={`editor-out-${out.id}`} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
            <div>
              <span className="font-bold text-slate-700">{out.name}</span>
              {out.price > 0 && <span className="mr-2 text-xs font-bold text-emerald-500">(+{out.price} KWD)</span>}
            </div>
            <button type="button" onClick={() => handleRemove(out.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start mt-2 border-t border-slate-100 pt-4">
        <div className="flex-1 space-y-2">
          <input 
            type="text" 
            placeholder="اسم المخرج الجديد" 
            className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          />
        </div>
        <div className="w-24 space-y-2">
          <input 
            type="number" 
            placeholder="السعر" 
            className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none"
            value={newPrice || ''}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          />
        </div>
        <button 
          type="button" 
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="bg-primary text-white p-3 rounded-xl disabled:bg-slate-300 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

const PlanList = ({ 
  onOpenAdmin, 
  isLoggedIn, 
  showSuccess,
  wizardStep,
  setWizardStep,
  wizardSubjectId,
  setWizardSubjectId,
  wizardPlanId,
  setWizardPlanId,
  wizardUniId,
  setWizardUniId,
  isAddingSubject,
  setIsAddingSubject,
  selectedSubject,
  setSelectedSubject
}: any) => {
  const { subId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const settings = useSettings();

  const fetchData = () => {
    fetch(`/api/plans/${subId}`).then(res => res.json()).then(setPlans);
    fetch('/api/admin/all-subjects').then(res => res.json()).then(subs => {
      const found = subs.find((s: any) => s.id === Number(subId));
      setSubject(found);
    });
  };

  useEffect(() => {
    fetchData();

    const socket = io();
    socket.on('data_updated', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [subId]);

  const handleUpdatePlan = async (id: number, field: string, value: string | number) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    const updated = { ...plan, [field]: value };
    await fetch(`/api/admin/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setPlans(prev => prev.map(p => p.id === id ? updated : p));
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleAddPlan = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlan = {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      features: formData.get('features') || '[]',
      outputs: '[]',
      outputs_label: formData.get('outputs_label') || 'المخرجات',
      delivery_date: formData.get('delivery_date'),
      subject_id: Number(subId)
    };
    
    const res = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    });
    const data = await res.json();
    
    fetch(`/api/plans/${subId}`).then(res => res.json()).then(setPlans);
    if (data.success) {
      setWizardPlanId(data.id);
      setWizardStep('plan_saved');
    } else {
      setIsAddingPlan(false);
    }
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleUpdateWizardOutputs = async (outputsJson: string) => {
    if (!wizardPlanId) return;
    await fetch(`/api/admin/plans/${wizardPlanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outputs: outputsJson })
    });
    showSuccess('تم تحديث المخرجات بنجاح ✅');
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} خطة؟`)) {
      for (const id of selectedIds) {
        await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
      }
      fetch(`/api/plans/${subId}`).then(res => res.json()).then(setPlans);
      setSelectedIds([]);
      setIsEditMode(false);
      showSuccess('تم حفظ التغييرات بنجاح ✅');
    }
  };

  const getParsedOutputs = (outputsString: string | null): PlanOutputItem[] => {
    try {
      if (!outputsString) return [];
      const parsed = JSON.parse(outputsString);
      if (Array.isArray(parsed)) {
        const seenIds = new Set<string>();
        return parsed.map((item: any, i) => {
          let id = '';
          let name = '';
          let price = 0;
          if (typeof item === 'string') {
             id = `legacy-str-${i}`;
             name = item;
          } else {
             id = item.id || `legacy-obj-${i}`;
             name = item.name || '';
             price = item.price || 0;
          }
          if (seenIds.has(id)) {
             id = `${id}-dup-${i}`;
          }
          seenIds.add(id);
          return { id, name, price } as PlanOutputItem;
        });
      }
    } catch {}
    return [];
  };

  if (!settings) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
      <WizardHeader step={selectedPlan ? 3 : 2} totalSteps={7} />
      <Container className="flex-1 flex flex-col overflow-hidden pb-0">
        <div className="flex-none">
          <StepTitle 
            title={selectedPlan ? <UIText id="work_sample" defaultText="نموذج العمل" settings={settings} /> : <UIText id="choose_plan" defaultText="اختر الخطة" settings={settings} />}
            subtitle={selectedPlan ? selectedPlan.name : subject?.name} 
            onBack={() => selectedPlan ? setSelectedPlan(null) : window.history.back()} 
          >
            {isLoggedIn && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setWizardStep('plan');
                    setIsAddingPlan(true);
                  }}
                  className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1 sm:gap-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">إضافة خطة</span>
                </button>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={cn(
                    "px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all",
                    isEditMode ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  {isEditMode ? "إلغاء التعديل" : "تعديل"}
                </button>
              </div>
            )}
          </StepTitle>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <CustomizableWrapper key={`home-plan-wrapper-${plan.id}`} id={`plan-${plan.id}`} isEnabled={isLoggedIn} className="w-full">
                <motion.div 
                  key={`home-plan-${plan.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (isEditMode) {
                      setSelectedIds(prev => prev.includes(plan.id) ? prev.filter(id => id !== plan.id) : [...prev, plan.id]);
                    } else {
                      setSelectedPlan(plan);
                    }
                  }}
                  className={cn(
                    "bg-white shadow-sm border border-slate-100 relative overflow-hidden transition-all w-full",
                    settings.plan_card_size === 'small' ? "rounded-2xl p-4" : settings.plan_card_size === 'large' ? "rounded-[32px] p-8" : "rounded-3xl p-6",
                    selectedIds.includes(plan.id) && "border-red-500 bg-red-50"
                  )}
                  dir="rtl"
                >
                {isEditMode && (
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                      selectedIds.includes(plan.id) ? "bg-red-500 border-red-500" : "border-slate-200 bg-white"
                    )}>
                      {selectedIds.includes(plan.id) && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="text-right flex-1">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full p-2 border border-slate-200 rounded-lg text-right font-black text-xl"
                          defaultValue={plan.name}
                          onBlur={(e) => handleUpdatePlan(plan.id, 'name', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input 
                          className="w-32 p-2 border border-slate-200 rounded-lg text-right text-xs font-bold bg-purple-50 text-purple-600"
                          defaultValue={plan.label || 'مشروع'}
                          onBlur={(e) => handleUpdatePlan(plan.id, 'label', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className={cn("font-black text-slate-800 mb-2", settings.plan_card_size === 'small' ? "text-lg" : "text-xl")} style={{ fontFamily: plan.font }}>{plan.name}</h3>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold">{plan.label || 'مشروع'}</span>
                      </>
                    )}
                  </div>
                  <div className="text-left">
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          className="w-20 p-2 border border-slate-200 rounded-lg text-left font-black text-xl text-emerald-500"
                          defaultValue={plan.price}
                          onBlur={(e) => handleUpdatePlan(plan.id, 'price', Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-emerald-500 font-bold text-sm">KWD</span>
                      </div>
                    ) : (
                      <>
                        <span className={cn("font-black text-emerald-500", settings.plan_card_size === 'small' ? "text-xl" : "text-2xl")}>
                          {plan.price}
                        </span>
                        <span className="text-emerald-500 font-bold text-sm mr-1">KWD</span>
                      </>
                    )}
                  </div>
                </div>

                {isEditMode ? (
                  <textarea 
                    className="w-full p-4 border border-slate-200 rounded-2xl text-right text-sm font-medium mb-4 min-h-[100px]"
                    defaultValue={plan.description || ''}
                    onBlur={(e) => handleUpdatePlan(plan.id, 'description', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="وصف الخطة..."
                  />
                ) : (
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 font-medium">
                    {plan.description || subject?.description || `تفاصيل الخطة المتاحة لهذه المادة تشمل كافة المتطلبات و${plan.outputs_label || 'المخرجات'} المتوقعة.`}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{plan.outputs_label || 'المخرجات'}</span>
                  {isEditMode ? (
                    <input 
                      type="date"
                      className="p-1 border border-slate-200 rounded text-right text-xs"
                      defaultValue={plan.delivery_date || ''}
                      onBlur={(e) => handleUpdatePlan(plan.id, 'delivery_date', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : plan.delivery_date ? (
                    <span>تاريخ التسليم: {new Date(plan.delivery_date).toLocaleDateString('ar-KW')}</span>
                  ) : null}
                </div>

                <button
                  className="w-full mt-6 py-4 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-[0.98]"
                >
                  اختر الخطة
                </button>
              </motion.div>
              </CustomizableWrapper>
            ))}
          </div>
        </div>

        {isEditMode && selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-5"
          >
            <button 
              onClick={handleDeleteSelected}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              <span>حذف {selectedIds.length} خطة</span>
            </button>
          </motion.div>
        )}

        {/* Step 3: Sample Preview Modal */}
        <AnimatePresence>
          {selectedPlan && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-full max-h-[92vh]"
                dir="rtl"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white relative">
                  <CustomizableWrapper id={`sample-modal-header-${selectedPlan.id}`} isEnabled={isLoggedIn} className="flex-1">
                    <div className="text-right">
                      <h3 className="text-lg font-black text-slate-800">{selectedPlan.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">الخطوة 3: استعراض العينة</p>
                    </div>
                  </CustomizableWrapper>
                  <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-black text-slate-400 shrink-0">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center min-h-[450px]">
                  <CustomizableWrapper id={`sample-modal-body-${selectedPlan.id}`} isEnabled={isLoggedIn} className="w-full h-full flex items-center justify-center">
                    {selectedPlan.sample ? (
                      selectedPlan.sample.file_type === 'pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <embed 
                            src={selectedPlan.sample.file_path} 
                            type="application/pdf"
                            className="w-full h-full rounded-xl border border-slate-200 shadow-sm"
                          />
                          <button 
                            onClick={() => window.open(selectedPlan.sample!.file_path, '_blank')}
                            className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink size={14} />
                            <span>إذا لم يظهر الملف، اضغط هنا للفتح في نافذة مستقلة</span>
                          </button>
                        </div>
                      ) : (
                        <img src={selectedPlan.sample.file_path} alt="Sample" className="max-w-full max-h-full object-contain p-4 shadow-sm" referrerPolicy="no-referrer" />
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-slate-300 p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                          <Maximize2 size={32} className="opacity-20" />
                        </div>
                        <p className="font-bold text-slate-400">لا يوجد نموذج عمل مرفق حالياً</p>
                        {isLoggedIn && (
                          <button 
                            onClick={() => {
                              navigate(`/preview/${selectedPlan.id}`);
                              setSelectedPlan(null);
                            }}
                            className="text-xs text-primary font-bold underline"
                          >
                            انتقل للتعديل وإضافة ملف
                          </button>
                        )}
                      </div>
                    )}
                  </CustomizableWrapper>
                </div>

                <div className="p-8 bg-white border-t border-slate-100 text-center">
                  <CustomizableWrapper id={`sample-modal-footer-${selectedPlan.id}`} isEnabled={isLoggedIn} className="w-full">
                    <h4 className="text-xl font-black text-slate-800 mb-2">هل يتطابق هذا النموذج مع مهمتك؟</h4>
                    <p className="text-sm text-slate-400 mb-8 font-medium">يرجى تأكيد تطابق النموذج مع متطلباتك للمتابعة إلى التخصيص والدفع.</p>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          navigate(`/preview/${selectedPlan.id}`);
                          setSelectedPlan(null);
                        }}
                        className="flex-1 bg-emerald-500 text-white py-4.5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>نعم، أؤكد</span>
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => setSelectedPlan(null)}
                        className="flex-1 bg-white border-2 border-slate-100 text-slate-400 py-4.5 rounded-2xl font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={20} />
                        <span>لا، اختر غيرها</span>
                      </button>
                    </div>

                    {selectedPlan.sample && (
                      <button 
                        onClick={() => window.open(selectedPlan.sample!.file_path, '_blank')}
                        className="text-primary font-bold text-xs underline mt-6 block mx-auto hover:opacity-80 transition-opacity"
                      >
                        فتح النموذج في نافذة مستقلة
                      </button>
                    )}
                  </CustomizableWrapper>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddingPlan && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                dir="rtl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    {wizardStep === 'plan' && 'إضافة خطة جديدة'}
                    {wizardStep === 'plan_saved' && 'تم حفظ الخطة'}
                    {wizardStep === 'outputs' && 'إضافة مخرجات الخطة'}
                  </h3>
                  <button onClick={() => setIsAddingPlan(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {wizardStep === 'plan' && (
                  <form onSubmit={handleAddPlan} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">اسم الخطة</label>
                      <input name="name" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">السعر</label>
                      <input name="price" type="number" step="0.01" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">المميزات (JSON)</label>
                      <input name="features" defaultValue='["ميزة 1", "ميزة 2"]' className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" placeholder='["Item 1", "Item 2"]' />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">تسمية المخرجات (اختياري)</label>
                      <input name="outputs_label" defaultValue='المخرجات' className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" placeholder='المخرجات' />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">تاريخ التسليم (اختياري)</label>
                      <input name="delivery_date" type="date" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-4">إضافة الخطة</button>
                  </form>
                )}

                {wizardStep === 'plan_saved' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} strokeWidth={3} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">تم حفظ الخطة بنجاح!</h4>
                    <p className="text-slate-500 mb-8 font-medium">هل تود إضافة مخرجات لهذه الخطة الآن؟</p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setWizardStep('outputs')}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                      >
                        <Plus size={20} />
                        <span>نعم، إضافة مخرجات</span>
                      </button>
                      <button 
                        onClick={() => setIsAddingPlan(false)}
                        className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 'outputs' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <PlanOutputsEditor 
                        defaultValue='[]' 
                        onChange={(json) => handleUpdateWizardOutputs(json)}
                      />
                    </div>
                    <button 
                      onClick={() => setIsAddingPlan(false)}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      تم الانتهاء من العمل
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
};

const Preview = ({ onOpenAdmin, isLoggedIn, showSuccess }: { onOpenAdmin: () => void, isLoggedIn: boolean, showSuccess: (msg: string) => void }) => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOutputIds, setSelectedOutputIds] = useState<string[]>([]);
  const settings = useSettings();

  const fetchData = () => {
    fetch(`/api/plan/${planId}`).then(res => res.json()).then(setPlan);
  };

  useEffect(() => {
    fetchData();

    const socket = io();
    socket.on('data_updated', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [planId]);

  useEffect(() => {
    if (!plan) return;
    setSelectedOutputIds([]); 
    setPreviewStep(0);
  }, [plan]);

  const calculatedOutputs = useMemo(() => {
    try {
      if (!plan?.outputs) return [];
      const parsed = JSON.parse(plan.outputs);
      let items: PlanOutputItem[] = [];
      if (Array.isArray(parsed)) {
        const seenIds = new Set<string>();
        items = parsed.map((item: any, i) => {
          let id = ''; let name = ''; let price = 0;
          if (typeof item === 'string') { id = `legacy-str-${i}`; name = item; }
          else { id = item.id || `legacy-obj-${i}`; name = item.name || ''; price = item.price || 0; }
          if (seenIds.has(id)) { id = `${id}-dup-${i}`; }
          seenIds.add(id);
          return { id, name, price } as PlanOutputItem;
        });
      }
      const N = items.length;
      if (N === 0) return [];
      const P = Number(plan.price) || 0;
      const specifiedSum = items.reduce((acc, o) => acc + o.price, 0);
      if (specifiedSum > 0) {
         return items.map(o => ({ ...o, price: Math.round(o.price) }));
      } else {
         const base = Math.floor(P / N);
         let rem = P % N;
         return items.map(o => {
             let p = base;
             if (rem > 0) { p += 1; rem -= 1; }
             return { ...o, price: p };
         });
      }
    } catch { return []; }
  }, [plan]);

  const steps = useMemo(() => ['customize', 'delivery', 'confirm'], []);

  const selectedOutputs = plan ? calculatedOutputs.filter(o => selectedOutputIds.includes(o.id)) : [];

  const finalPrice = useMemo(() => {
    if (!plan || selectedOutputIds.length === 0) return null;
    return selectedOutputs.reduce((sum, item) => sum + item.price, 0);
  }, [plan, selectedOutputs, selectedOutputIds]);

  if (!plan || !settings) return null;

  const currentStepName = steps[previewStep];
  const wizardStep = 4 + previewStep; 
  const totalWizardSteps = 7;

  const toggleOutput = (out: PlanOutputItem) => {
    setSelectedOutputIds(prev => 
      prev.includes(out.id) ? prev.filter(id => id !== out.id) : [...prev, out.id]
    );
  };

  const handleNext = () => {
    if (currentStepName === 'customize' && calculatedOutputs.length > 0 && selectedOutputIds.length === 0) {
      return; // Do not proceed if outputs exist but none selected
    }
    if (previewStep < steps.length - 1) {
      setPreviewStep(prev => prev + 1);
    } else {
      handleApprove();
    }
  };

  const handleBack = () => {
    if (previewStep > 0) {
      setPreviewStep(prev => prev - 1);
    } else {
      window.history.back();
    }
  };

  const handleApprove = () => {
    const outputsText = selectedOutputs.length > 0 ? `\n${plan.outputs_label || 'المخرجات'}:\n${selectedOutputs.map(o => `- ${o.name}`).join('\n')}` : '';
    const dateText = selectedDate ? `\nتاريخ التسليم المطلوب: ${selectedDate}` : '';
    const uniText = plan.university_name ? `الجامعة: ${plan.university_name}\n` : '';
    const text = `${settings.whatsapp_prefix}\n${uniText}المادة: ${plan.subject_name}\nالخطة: ${plan.name}${outputsText}\n\nإجمالي السعر: ${finalPrice} KWD${dateText}`;
    const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleUpdatePlan = async (field: string, value: string | number) => {
    const updated = { ...plan, [field]: value };
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setPlan(updated);
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
      <WizardHeader step={wizardStep} totalSteps={totalWizardSteps} />
      <Container className="flex-1 flex flex-col overflow-hidden pb-0">
        <div className="flex-none">
          <StepTitle 
            title={
              currentStepName === 'delivery' ? <UIText id="delivery_date" defaultText="مدة التسليم" settings={settings} /> :
              currentStepName === 'customize' ? <UIText id="work_outputs" defaultText={plan.outputs_label || 'المخرجات'} settings={settings} /> :
              <UIText id="confirm_order" defaultText="تأكيد الطلب" settings={settings} />
            } 
            subtitle={plan.subject_name} 
            onBack={handleBack} 
          >
            {isLoggedIn && currentStepName !== 'confirm' && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all",
                  isEditMode ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                )}
              >
                {isEditMode ? "إلغاء التعديل" : "تعديل"}
              </button>
            )}
          </StepTitle>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          <CustomizableWrapper id={`preview-main-card-${plan.id}`} isEnabled={isLoggedIn} className="w-full">
            <motion.div 
              key={currentStepName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "bg-white shadow-sm border border-slate-100 mb-6",
                settings.plan_card_size === 'small' ? "rounded-2xl p-4" : settings.plan_card_size === 'large' ? "rounded-[32px] p-8" : "rounded-3xl p-6"
              )}
              dir="rtl"
            >
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
              <div className="text-right flex-1">
                {isEditMode ? (
                  <div className="space-y-2">
                    <input 
                      className="w-full p-2 border border-slate-200 rounded-lg text-right font-black text-xl"
                      defaultValue={plan.name}
                      onBlur={(e) => handleUpdatePlan('name', e.target.value)}
                    />
                    <input 
                      className="w-32 p-2 border border-slate-200 rounded-lg text-right text-xs font-bold bg-purple-50 text-purple-600"
                      defaultValue={plan.label || 'مشروع'}
                      onBlur={(e) => handleUpdatePlan('label', e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className={cn("font-black text-slate-800 mb-1", settings.plan_card_size === 'small' ? "text-lg" : "text-xl")}>{plan.name}</h3>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold">{plan.label || 'مشروع'}</span>
                  </>
                )}
              </div>
              <div className="text-left min-w-[80px] flex justify-end">
                {isEditMode ? (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      className="w-20 p-2 border border-slate-200 rounded-lg text-left font-black text-xl text-emerald-500"
                      defaultValue={plan.price}
                      onBlur={(e) => handleUpdatePlan('price', Number(e.target.value))}
                    />
                    <span className="text-emerald-500 font-bold text-sm">KWD</span>
                  </div>
                ) : (
                  finalPrice !== null && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-baseline gap-1"
                    >
                      <span className={cn("font-black text-emerald-500", settings.plan_card_size === 'small' ? "text-xl" : "text-2xl")}>
                        {finalPrice}
                      </span>
                      <span className="text-emerald-500 font-bold text-sm uppercase">KWD</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            {currentStepName === 'customize' && (
              <div>
                {(plan.description || isLoggedIn) && (
                  <div className="mb-8">
                    {isEditMode ? (
                      <textarea 
                        className="w-full p-4 border border-slate-200 rounded-2xl text-right text-sm font-medium mb-6 min-h-[100px]"
                        defaultValue={plan.description || ''}
                        onBlur={(e) => handleUpdatePlan('description', e.target.value)}
                        placeholder="وصف الخطة..."
                      />
                    ) : (
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                        {plan.description}
                      </p>
                    )}
                  </div>
                )}

                {calculatedOutputs.length > 0 && (
                  <div>
                    {isEditMode ? (
                      <div className="flex items-center gap-2 mb-6">
                        <span className="font-black text-slate-800">اختر</span>
                        <input
                          defaultValue={plan.outputs_label || 'المخرجات'}
                          onBlur={(e) => handleUpdatePlan('outputs_label', e.target.value)}
                          className="font-black text-slate-800 bg-transparent border-b border-slate-300 outline-none w-32 px-1"
                          placeholder="المخرجات"
                        />
                        <span className="font-black text-slate-800">:</span>
                      </div>
                    ) : (
                      <h4 className="font-black text-slate-800 mb-6 text-lg">اختر {plan.outputs_label || 'المخرجات'}:</h4>
                    )}
                    <div className="space-y-4">
                      {calculatedOutputs.map((out: PlanOutputItem) => {
                        const isSel = selectedOutputIds.includes(out.id);
                        return (
                          <div key={`preview-out-${out.id}`} className="flex items-center justify-between group p-4 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer bg-white" onClick={() => !isEditMode && toggleOutput(out)}>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-600 group-hover:text-primary transition-colors">{out.name}</span>
                              {isSel ? (
                                <span className="text-sm text-emerald-500 font-bold">( {out.price} KWD)</span>
                              ) : (
                                <button className="text-[10px] text-slate-400 font-bold underline mt-1 hover:text-primary">عينات أخرى</button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div 
                                className={cn(
                                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                                  isSel ? "bg-primary border-primary" : "border-slate-200 bg-white",
                                  isEditMode && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {isSel && <Check size={16} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStepName === 'delivery' && (
              <div className="py-4">
                <h4 className="font-black text-slate-800 mb-4 text-lg">حدد تاريخ التسليم المطلوب:</h4>
                <p className="text-slate-500 text-sm mb-6">الرجاء اختيار التاريخ الذي ترغب باستلام العمل فيه.</p>
                <input 
                  type="date"
                  className="w-full p-4 border-2 border-slate-200 rounded-2xl text-right font-bold text-slate-700 outline-none focus:border-primary transition-colors"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {currentStepName === 'confirm' && (
              <div className="py-2 space-y-4">
                <h4 className="font-black text-slate-800 mb-6 text-lg text-center">ملخص الطلب</h4>
                
                <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold text-sm">الجامعة</span>
                    <span className="font-black text-slate-800">{plan.university_name || '...'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold text-sm">المادة</span>
                    <span className="font-black text-slate-800">{plan.subject_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold text-sm">الخطة</span>
                    <span className="font-black text-slate-800">{plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold text-sm">السعر الإجمالي</span>
                    <span className="font-black text-emerald-500">{finalPrice} KWD</span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-slate-500 font-bold text-sm">تاريخ التسليم</span>
                      <span className="font-black text-slate-800 text-sm">
                        {new Date(selectedDate).toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {selectedOutputs.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1 text-right">
                      <span className="text-slate-500 font-bold text-sm">{plan.outputs_label || 'المخرجات المختارة'}:</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {selectedOutputs.map(out => (
                              <span key={`confirm-out-${out.id}`} className="font-black text-slate-800 text-[11px] bg-white px-2 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                {out.name} {out.price > 0 ? `( ${out.price} KWD)` : ''}
                              </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </CustomizableWrapper>
        </div>

        <div className="flex-none pt-4 pb-6 bg-slate-50/50">
          <div className="flex gap-3" dir="rtl">
            <button 
              onClick={handleNext}
              disabled={currentStepName === 'customize' && calculatedOutputs.length > 0 && selectedOutputIds.length === 0}
              className={cn(
                "flex-1 py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white",
                (currentStepName === 'confirm' || (currentStepName === 'customize' && selectedOutputIds.length > 0) || (currentStepName === 'delivery')) ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-200 shadow-none cursor-not-allowed"
              )}
            >
              {currentStepName === 'confirm' ? (
                <UIText id="whatsapp_btn" defaultText={settings?.whatsapp_button_text || 'اطلب عبر واتساب'} settings={settings} />
              ) : (
                <UIText id="continue_btn" defaultText="استمرار" settings={settings} />
              )}
              {currentStepName !== 'confirm' && <ArrowLeft size={20} className="rotate-180" />}
            </button>
            <div className="bg-primary text-white px-6 py-5 rounded-2xl font-black text-lg flex items-center justify-center shadow-lg shadow-primary/20">
              محدد
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

// --- Admin Panel ---

const AdminPanel = ({ onClose, showSuccess }: { onClose: () => void, showSuccess: (msg: string) => void }) => {
  const [activeMenu, setActiveMenu] = useState<'edit' | 'add' | 'map' | 'texts' | 'bookings' | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [unis, setUnis] = useState<University[]>([]);
  const [subjects, setSubjects] = useState<(Subject & { university_name: string })[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [designMode, setDesignMode] = useState<boolean>(false);
  const navigate = useNavigate();

  const refreshData = () => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/universities').then(res => res.json()).then(setUnis);
    fetch('/api/admin/all-subjects').then(res => res.json()).then(setSubjects);
  };

  useEffect(() => {
    refreshData();

    const socket = io();
    socket.on('data_updated', () => {
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setSettings(prev => prev ? { ...prev, ...updates } : null);
    showSuccess('تم حفظ التغييرات بنجاح ✅');
    // Reload to apply primary color if changed
    if (updates.primary_color) window.location.reload();
  };

  const reorderSubjects = async (index: number, direction: 'up' | 'down') => {
    const newSubjects = [...subjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSubjects.length) return;
    
    [newSubjects[index], newSubjects[targetIndex]] = [newSubjects[targetIndex], newSubjects[index]];
    setSubjects(newSubjects);
    
    await fetch('/api/admin/reorder-subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newSubjects.map(s => s.id) })
    });
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const reorderPlans = async (index: number, direction: 'up' | 'down') => {
    const newPlans = [...plans];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPlans.length) return;
    
    [newPlans[index], newPlans[targetIndex]] = [newPlans[targetIndex], newPlans[index]];
    setPlans(newPlans);
    
    await fetch('/api/admin/reorder-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newPlans.map(p => p.id) })
    });
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-800">لوحة التحكم</h3>
        <button onClick={onClose} className="text-slate-400"><X size={24} /></button>
      </div>

      {settings && (
        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800">وضع العرض</h4>
            <p className="text-xs text-slate-500 mt-1">اختر بين الخريطة والبطاقات</p>
          </div>
          <div className="flex bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => updateSettings({ layout_mode: 'card' })}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", settings.layout_mode !== 'map' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              بطاقات
            </button>
            <button
              onClick={() => updateSettings({ layout_mode: 'map' })}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", settings.layout_mode === 'map' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              خريطة
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button 
          onClick={() => {
            setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            setEditingSubject(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", activeMenu === 'edit' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          <SettingsIcon size={16} /> ⚙️ إدارة المواد
        </button>
        <button 
          onClick={() => {
            setActiveMenu(activeMenu === 'add' ? null : 'add');
            setEditingSubject(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", activeMenu === 'add' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          <Plus size={16} /> ➕ إضافة جديد
        </button>
        <button 
          onClick={() => {
            setActiveMenu(activeMenu === 'map' ? null : 'map');
            setEditingSubject(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", activeMenu === 'map' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          🎨 إعدادات الخريطة
        </button>
        <button 
          onClick={() => {
            setActiveMenu(activeMenu === 'texts' ? null : 'texts');
            setEditingSubject(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", activeMenu === 'texts' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          📝 نصوص الواجهة
        </button>
        <button 
          onClick={() => {
            setActiveMenu(activeMenu === 'bookings' ? null : 'bookings');
            setEditingSubject(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", activeMenu === 'bookings' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          📅 الحجوزات
        </button>
        <button 
          onClick={() => {
            setDesignMode(!designMode);
            setActiveMenu(null);
          }}
          className={cn("py-4.5 rounded-[20px] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", designMode ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "bg-slate-100 text-slate-600 border border-slate-200")}
        >
          🎨 تصميم القوالب
        </button>
      </div>

      <AnimatePresence>
        {designMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-6 mb-8"
          >
            <div className="bg-slate-50 p-6 sm:p-8 rounded-[40px] border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h4 className="font-black text-xl text-slate-800">التصميم الموحد للقوالب</h4>
                  <p className="text-slate-400 text-sm font-bold">عدل التصميم هنا وسيتم تطبيقه على جميع المربعات المماثلة عند الضغط على "تطبيق التصميم"</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-600 p-3 rounded-2xl border border-amber-100">
                  <Maximize2 size={18} />
                  <span className="text-xs font-black">استخدم زر (تطبيق التصميم) داخل شريط التعديل للمزامنة</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subject Component Preview */}
                <div className="space-y-4">
                  <h5 className="font-black text-slate-400 text-xs uppercase tracking-widest mr-1">قالب المادة (Subject Card)</h5>
                  <div className="bg-white/50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
                    <CustomizableWrapper id="sub-global" isEnabled={true} className="w-full max-w-sm">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <BookOpen size={24} />
                          </div>
                          <div className="text-right">
                            <h3 className="font-black text-slate-800 text-lg">اسم المادة النموذجي</h3>
                            <p className="text-slate-400 text-xs font-bold">تصنيف المادة</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-slate-300" />
                      </div>
                    </CustomizableWrapper>
                  </div>
                </div>

                {/* Plan Component Preview */}
                <div className="space-y-4">
                  <h5 className="font-black text-slate-400 text-xs uppercase tracking-widest mr-1">قالب الخطة (Plan Card)</h5>
                  <div className="bg-white/50 p-8 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
                    <CustomizableWrapper id="plan-global" isEnabled={true} className="w-full max-w-sm">
                      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 w-full text-right">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-black text-slate-800 text-xl">خطة المشروع المتكامل</h3>
                          <span className="text-primary font-black text-2xl">25 KWD</span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-6">هذا مثال لوصف الخطة وتصميمها العام الذي سيظهر لجميع المستخدمين.</p>
                        <button className="w-full py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-400">زر الاختيار</button>
                      </div>
                    </CustomizableWrapper>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMenu === 'bookings' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 mb-8"
          >
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h4 className="font-bold text-sm text-slate-400 mb-6">سجل حجوزات الجلسات</h4>
              <BookingsManager />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMenu === 'texts' && settings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 mb-8"
          >
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-sm text-slate-400 mb-4">تعديل نصوص الواجهة</h4>
              
              {[
                { id: 'choose_uni', label: 'عنوان اختيار الجامعة', default: 'اختر الجامعة' },
                { id: 'choose_service', label: 'عنوان اختيار الخدمة', default: 'اختر نوع الخدمة' },
                { id: 'service_cost_title', label: 'عنوان (مساعدة في التكاليف)', default: 'مساعدة في التكاليف' },
                { id: 'service_cost_desc', label: 'وصف (مساعدة في التكاليف)', default: 'حل الواجبات والمشاريع والتقارير' },
                { id: 'service_booking_title', label: 'عنوان (حجز جلسة اختبار)', default: 'حجز جلسة اختبار' },
                { id: 'service_booking_desc', label: 'وصف (حجز جلسة اختبار)', default: 'احجز موعداً للمساعدة في اختبارك القادم' },
                { id: 'booking_step1_title', label: 'عنوان خطوة الحجز 1', default: 'بيانات الاختبار' },
                { id: 'booking_step2_title', label: 'عنوان خطوة الحجز 2', default: 'اختيار التوقيت' },
                { id: 'booking_step3_title', label: 'عنوان خطوة الحجز 3', default: 'مراجعة الطلب' },
                { id: 'booking_label_subject', label: 'تسمية (اختر المادة)', default: 'اختر المادة' },
                { id: 'booking_placeholder_subject', label: 'نص تلميح المادة', default: 'ابحث عن المادة أو اكتبها يدوياً...' },
                { id: 'booking_no_results', label: 'نص لا توجد نتائج بحث', default: 'لا يوجد نتائج تطابق بحثك' },
                { id: 'booking_use_manual', label: 'زر استخدام الكتابة اليدوية', default: 'استخدام الكتابة اليدوية فقط' },
                { id: 'booking_label_test_type', label: 'تسمية (نوع الاختبار)', default: 'نوع الاختبار' },
                { id: 'booking_label_attachments', label: 'تسمية (المرفقات)', default: 'المرفقات (اختياري)' },
                { id: 'booking_upload_success', label: 'نجاح الرفع', default: 'تم الرفع بنجاح' },
                { id: 'booking_upload_label', label: 'نص زر الرفع', default: 'ارفع جدول الاختبار أو السيلبس' },
                { id: 'booking_upload_hint', label: 'تلميح الرفع', default: 'يساعد المدرس في فهم المحتوى بدقة' },
                { id: 'booking_label_date', label: 'تسمية (اختر التاريخ)', default: 'اختر التاريخ' },
                { id: 'booking_period_morning', label: 'تسمية الفترة الصباحية', default: 'الفترة الصباحية' },
                { id: 'booking_period_afternoon', label: 'تسمية فترة الظهيرة', default: 'فترة الظهيرة' },
                { id: 'booking_period_evening', label: 'تسمية الفترة المسائية', default: 'الفترة المسائية' },
                { id: 'booking_selected_time_prefix', label: 'نص الوقت المختار', default: 'الوقت المختار: الساعة' },
                { id: 'booking_summary_uni', label: 'ملخص الحجز - الجامعة', default: 'الجامعة' },
                { id: 'booking_summary_subject', label: 'ملخص الحجز - المادة', default: 'المادة' },
                { id: 'booking_summary_type', label: 'ملخص الحجز - النوع', default: 'النوع' },
                { id: 'booking_summary_date', label: 'ملخص الحجز - الموعد', default: 'الموعد' },
                { id: 'booking_price_notice', label: 'تنبيه السعر النهائي', default: 'سيتم تحديد السعر النهائي بالاتفاق عبر الواتساب بناءً على نوع الاختبار ومحتواه.' },
                { id: 'booking_btn_confirm', label: 'زر تأكيد الحجز', default: 'تأكيد الموعد عبر WhatsApp' },
                { id: 'booking_btn_continue', label: 'زر استمرار الحجز', default: 'استمرار' },
                { id: 'booking_btn_cancel', label: 'زر إلغاء الحجز', default: 'إلغاء وإغلاق' },
                { id: 'choose_subject', label: 'عنوان اختيار المادة', default: 'اختر المادة' },
                { id: 'choose_plan', label: 'عنوان اختيار الخطة', default: 'اختر الخطة' },
                { id: 'work_sample', label: 'عنوان نموذج العمل', default: 'نموذج العمل' },
                { id: 'delivery_date', label: 'عنوان مدة التسليم', default: 'مدة التسليم' },
                { id: 'work_outputs', label: 'عنوان مخرجات العمل', default: 'المخرجات' },
                { id: 'confirm_order', label: 'عنوان تأكيد الطلب', default: 'تأكيد الطلب' },
                { id: 'continue_btn', label: 'زر الاستمرار', default: 'استمرار' },
                { id: 'whatsapp_btn', label: 'زر الواتساب', default: settings.whatsapp_button_text || 'اطلب عبر واتساب' }
              ].map(item => {
                const uiTexts = settings.ui_texts ? JSON.parse(settings.ui_texts) : {};
                return (
                  <div key={`setting-txt-${item.id}`} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">{item.label}</label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
                      defaultValue={uiTexts[item.id] || item.default}
                      onBlur={(e) => {
                        const newTexts = { ...uiTexts, [item.id]: e.target.value };
                        updateSettings({ ui_texts: JSON.stringify(newTexts) });
                      }}
                    />
                  </div>
                );
              })}

              <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-primary" />
                  إعدادات الحجز والاختبارات
                </h4>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex justify-between">
                    <span>أنواع الاختبارات (Array JSON)</span>
                    <button 
                      onClick={() => updateSettings({ booking_test_types: '["كويز", "ميدتيرم", "فاينل", "GSA", "Lab Test", "تقرير"]' })}
                      className="text-primary hover:underline text-[9px]"
                    >
                      استخدام القالب العربي
                    </button>
                  </label>
                  <textarea 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                    defaultValue={settings.booking_test_types || '["Quiz", "Midterm", "Final", "GSA", "Lab Test"]'}
                    onBlur={(e) => {
                      try { JSON.parse(e.target.value); updateSettings({ booking_test_types: e.target.value }); } 
                      catch { alert("تنسيق JSON غير صحيح للأنواع"); }
                    }}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex justify-between">
                    <span>مواعيد الحجز (Object JSON)</span>
                    <button 
                      onClick={() => {
                        const kuwaitPreset = {
                          "صباح": ["08:00 صباحاً", "09:00 صباحاً", "10:00 صباحاً", "11:00 صباحاً"],
                          "بعد الظهر": ["12:00 ظهراً", "01:00 مساءً", "02:00 مساءً", "03:00 مساءً"],
                          "المساء": ["04:00 مساءً", "05:00 مساءً", "06:00 مساءً"]
                        };
                        updateSettings({ booking_slots: JSON.stringify(kuwaitPreset, null, 2) });
                      }}
                      className="text-primary hover:underline text-[9px]"
                    >
                      استخدام قالب مواعيد الكويت
                    </button>
                  </label>
                  <textarea 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                    defaultValue={settings.booking_slots || '{"morning": ["08:00 AM", "09:00 AM"], "afternoon": ["12:00 PM"]}'}
                    onBlur={(e) => {
                      try { JSON.parse(e.target.value); updateSettings({ booking_slots: e.target.value }); } 
                      catch { alert("تنسيق JSON غير صحيح للمواعيد"); }
                    }}
                    rows={5}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                {/* Redundant sections removed */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMenu === 'map' && settings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 mb-8"
          >
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
              <h4 className="font-black text-slate-800 text-sm mb-4">تخصيص الخريطة</h4>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">عنوان الخريطة</label>
                <input 
                  className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={settings.map_title || "Yakuwait Top Solver"}
                  onBlur={(e) => updateSettings({ map_title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">نوع الخط</label>
                <select 
                  className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={settings.map_font_family || "Tajawal"}
                  onChange={(e) => updateSettings({ map_font_family: e.target.value })}
                >
                  <option value="Tajawal">Tajawal</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Inter">Inter</option>
                  <option value="sans-serif">Sans Serif</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">لون حدود الخريطة</label>
                  <input 
                    type="color"
                    className="w-full h-12 rounded-xl cursor-pointer border-none p-0"
                    defaultValue={settings.map_border_color || "#06b6d4"}
                    onBlur={(e) => updateSettings({ map_border_color: e.target.value, primary_color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">لون تعبئة الخريطة</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={settings.map_fill_color || "rgba(6, 182, 212, 0.05)"}
                    onBlur={(e) => updateSettings({ map_fill_color: e.target.value })}
                    placeholder="rgba(0,0,0,0.5) أو #hex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">لون الخلفية</label>
                <input 
                  type="color"
                  className="w-full h-12 rounded-xl cursor-pointer border-none p-0"
                  defaultValue={settings.map_bg_color || "#050510"}
                  onBlur={(e) => updateSettings({ map_bg_color: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-bold text-slate-700">تفعيل وضع 3D</label>
                <button 
                  onClick={() => updateSettings({ map_is_3d: settings.map_is_3d === 'true' ? 'false' : 'true' })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    settings.map_is_3d === 'true' ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                    settings.map_is_3d === 'true' ? "left-1" : "right-1"
                  )} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMenu === 'add' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 mb-8"
          >
            <button onClick={() => setEditingSubject({ id: 0 } as any)} className="w-full text-right py-4.5 px-6 hover:bg-slate-50 rounded-[22px] text-sm font-bold text-slate-600 border border-slate-100 transition-all active:scale-[0.99] flex items-center justify-between">
              <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              <span>إضافة مادة جديدة</span>
            </button>
            <button onClick={() => {
              const val = window.prompt("أدخل اسم الجامعة الجديدة:");
              if(val) {
                fetch('/api/admin/universities', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: val })
                }).then(() => refreshData());
              }
            }} className="w-full text-right py-4.5 px-6 hover:bg-slate-50 rounded-[22px] text-sm font-bold text-slate-600 border border-slate-100 transition-all active:scale-[0.99] flex items-center justify-between">
              <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              <span>إضافة جامعة جديدة</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeMenu === 'edit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-slate-400">إدارة المواد والخطط</h4>
            <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
              {subjects.length} مادة
            </div>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map((sub, idx) => (
              <div key={`admin-manage-sub-${sub.id}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => reorderSubjects(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-white rounded border disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button onClick={() => reorderSubjects(idx, 'down')} disabled={idx === subjects.length - 1} className="p-1 hover:bg-white rounded border disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <button onClick={() => {
                    setEditingSubject(sub);
                    fetch(`/api/plans/${sub.id}`).then(res => res.json()).then(setPlans);
                  }} className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:border-primary transition-all"><Edit2 size={16} /></button>
                  <button onClick={async () => {
                    if(window.confirm('هل أنت متأكد من حذف هذه المادة وجميع خططها؟')) {
                      await fetch(`/api/admin/subjects/${sub.id}`, { method: 'DELETE' });
                      refreshData();
                    }
                  }} className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-800">{sub.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{sub.university_name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3">
             <h4 className="font-bold text-sm text-slate-400 text-right mb-2">إعدادات الموقع</h4>
             <button onClick={() => {
              const val = window.prompt("أدخل اسم الموقع الجديد:", settings?.site_name || "");
              if (val !== null) updateSettings({ site_name: val });
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              <span>تعديل اسم الموقع</span>
            </button>
            <button onClick={() => {
              const color = window.prompt("أدخل كود اللون الأساسي (مثال: #2563eb):", settings?.primary_color || "");
              if (color !== null) updateSettings({ primary_color: color });
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              <span>تعديل اللون الأساسي</span>
            </button>
            <button onClick={() => {
              const num = window.prompt("أدخل رقم الواتساب الجديد:", settings?.whatsapp_number || "");
              const msg = window.prompt("أدخل وصف البداية:", settings?.whatsapp_prefix || "");
              const btnText = window.prompt("أدخل نص زر الواتساب:", settings?.whatsapp_button_text || "اطلب عبر واتساب");
              if (num !== null || msg !== null || btnText !== null) {
                updateSettings({ 
                  whatsapp_number: num !== null ? num : (settings?.whatsapp_number || ""), 
                  whatsapp_prefix: msg !== null ? msg : (settings?.whatsapp_prefix || ""),
                  whatsapp_button_text: btnText !== null ? btnText : (settings?.whatsapp_button_text || "")
                });
              }
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <ChevronDown size={16} className="-rotate-90 text-slate-300" />
              <span>تعديل بيانات التواصل</span>
            </button>
            <button onClick={() => {
              const sizes = ['small', 'medium', 'large'];
              const current = settings?.uni_card_size || 'medium';
              const nextSize = sizes[(sizes.indexOf(current) + 1) % sizes.length];
              updateSettings({ uni_card_size: nextSize });
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                {settings?.uni_card_size === 'small' ? 'صغير' : settings?.uni_card_size === 'large' ? 'كبير' : 'متوسط'}
              </span>
              <span>حجم مربعات الجامعات</span>
            </button>
            <button onClick={() => {
              const sizes = ['small', 'medium', 'large'];
              const current = settings?.subject_card_size || 'medium';
              const nextSize = sizes[(sizes.indexOf(current) + 1) % sizes.length];
              updateSettings({ subject_card_size: nextSize });
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                {settings?.subject_card_size === 'small' ? 'صغير' : settings?.subject_card_size === 'large' ? 'كبير' : 'متوسط'}
              </span>
              <span>حجم مربعات المواد</span>
            </button>
            <button onClick={() => {
              const sizes = ['small', 'medium', 'large'];
              const current = settings?.plan_card_size || 'medium';
              const nextSize = sizes[(sizes.indexOf(current) + 1) % sizes.length];
              updateSettings({ plan_card_size: nextSize });
            }} className="w-full text-right py-4 px-6 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100 flex items-center justify-between">
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                {settings?.plan_card_size === 'small' ? 'صغير' : settings?.plan_card_size === 'large' ? 'كبير' : 'متوسط'}
              </span>
              <span>حجم مربعات الخطط</span>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingSubject && editingSubject.id >= 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[110]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingSubject.id === 0 ? 'إضافة مادة' : 'تعديل مادة'}</h3>
                <button onClick={() => setEditingSubject(null)} className="text-slate-400"><X size={24} /></button>
              </div>
              <form className="space-y-5" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                const method = editingSubject.id === 0 ? 'POST' : 'PUT';
                const url = editingSubject.id === 0 ? '/api/admin/subjects' : `/api/admin/subjects/${editingSubject.id}`;
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                refreshData();
                setEditingSubject(null);
                showSuccess('تم حفظ التغييرات بنجاح ✅');
              }}>
                {editingSubject.id === 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">الجامعة</label>
                    <select name="university_id" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50">
                      {unis.map(u => <option key={`opt-uni-${u.id}`} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">اسم المادة</label>
                  <input name="name" defaultValue={editingSubject.name} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">التصنيف</label>
                  <input name="category" defaultValue={editingSubject.category} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">الوصف</label>
                  <input name="description" defaultValue={editingSubject.description} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">اللون</label>
                    <input name="color" type="color" defaultValue={editingSubject.color || '#000000'} className="w-full h-12 rounded-2xl cursor-pointer border-none p-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">الخط</label>
                    <input name="font" defaultValue={editingSubject.font} placeholder="Arial, sans-serif" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">حفظ التغييرات</button>
              </form>

              {editingSubject.id > 0 && (
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setEditingPlan({ id: 0, subject_id: editingSubject.id } as any)} className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20"><Plus size={18} /></button>
                    <h4 className="font-bold text-slate-800">الخطط المتاحة لهذه المادة</h4>
                  </div>
                  <div className="space-y-3">
                    {plans.map((p, pIdx) => (
                      <div key={`admin-manage-plan-${p.id}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div className="flex gap-2">
                          <div className="flex flex-col gap-1">
                            <button onClick={() => reorderPlans(pIdx, 'up')} disabled={pIdx === 0} className="p-1 hover:bg-white rounded border disabled:opacity-30"><ChevronUp size={12} /></button>
                            <button onClick={() => reorderPlans(pIdx, 'down')} disabled={pIdx === plans.length - 1} className="p-1 hover:bg-white rounded border disabled:opacity-30"><ChevronDown size={12} /></button>
                          </div>
                          <button onClick={() => setEditingPlan(p)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600"><Edit2 size={14} /></button>
                          <button onClick={async () => {
                            if(window.confirm('حذف الخطة؟')) {
                              await fetch(`/api/admin/plans/${p.id}`, { method: 'DELETE' });
                              fetch(`/api/plans/${editingSubject.id}`).then(res => res.json()).then(setPlans);
                              showSuccess('تم حفظ التغييرات بنجاح ✅');
                            }
                          }} className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-xl"><Trash2 size={14} /></button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-emerald-500 font-bold">{p.price} KD</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {editingPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[120]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">{editingPlan.id === 0 ? 'إضافة خطة' : 'تعديل خطة'}</h3>
                <button onClick={() => setEditingPlan(null)} className="text-slate-400"><X size={24} /></button>
              </div>
              <form className="space-y-5" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                const method = editingPlan.id === 0 ? 'POST' : 'PUT';
                const url = editingPlan.id === 0 ? '/api/admin/plans' : `/api/admin/plans/${editingPlan.id}`;
                await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...data, subject_id: editingPlan.subject_id })
                });
                fetch(`/api/plans/${editingPlan.subject_id}`).then(res => res.json()).then(setPlans);
                setEditingPlan(null);
                showSuccess('تم حفظ التغييرات بنجاح ✅');
              }}>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">اسم الخطة</label>
                  <input name="name" defaultValue={editingPlan.name} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">نوع العمل (مثال: مشروع، واجب)</label>
                  <input name="label" defaultValue={editingPlan.label || 'مشروع'} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">الوصف</label>
                  <textarea name="description" defaultValue={editingPlan.description} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50 min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">السعر (KD)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingPlan.price} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">اللون</label>
                    <input name="color" type="color" defaultValue={editingPlan.color || '#000000'} className="w-full h-12 rounded-2xl cursor-pointer border-none p-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">الخط</label>
                    <input name="font" defaultValue={editingPlan.font} placeholder="Arial, sans-serif" className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">المخرجات</label>
                  <PlanOutputsEditor defaultValue={editingPlan.outputs || '[]'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">تسمية المخرجات (اختياري)</label>
                  <input name="outputs_label" defaultValue={editingPlan.outputs_label || 'المخرجات'} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" placeholder='المخرجات' />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 mr-1">تاريخ التسليم (اختياري)</label>
                  <input name="delivery_date" defaultValue={editingPlan.delivery_date || ''} className="w-full p-4 border border-slate-100 rounded-2xl outline-none bg-slate-50" placeholder='مثال: 2024-05-20 أو "خلال يومين"' />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">حفظ الخطة</button>
              </form>

              {editingPlan.id > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-8">
                  <label className="block text-xs font-bold text-slate-400 mb-4 mr-1">رفع عينة (PDF أو صورة)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('plan_id', String(editingPlan.id));
                        await fetch('/api/admin/samples', { method: 'POST', body: formData });
                        showSuccess('تم رفع العينة بنجاح ✅');
                      }}
                      className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BookingsManager = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="text-center py-8 text-slate-400">جاري التحميل...</div>;

  return (
    <div className="space-y-4" dir="rtl">
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl text-slate-400 border border-dashed border-slate-200">
          لا يوجد حجوزات حالياً
        </div>
      ) : (
        bookings.map(b => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <div className="font-black text-slate-800">{b.subject_name}</div>
                <div className="text-xs text-slate-400 font-bold">{b.university_name}</div>
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase">
                {b.test_type}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <CalendarIcon size={14} className="text-slate-300" />
                <span>{b.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-slate-300" />
                <span>{b.time_slot}</span>
              </div>
            </div>
            {b.syllabus_url && (
              <a 
                href={b.syllabus_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-bold text-primary underline flex items-center gap-1"
              >
                <ExternalLink size={12} />
                عرض الملف المرفق
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const UniversityRedirect = () => {
  const { uniId } = useParams();
  return <Navigate to={`/university/${uniId}/services`} replace />;
};

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const settings = useSettings();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Global Wizard State
  const [wizardStep, setWizardStep] = useState<'subject' | 'subject_saved' | 'plan' | 'plan_saved' | 'outputs'>('subject');
  const [wizardSubjectId, setWizardSubjectId] = useState<number | null>(null);
  const [wizardPlanId, setWizardPlanId] = useState<number | null>(null);
  const [wizardUniId, setWizardUniId] = useState<number | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleAddSubject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSubject = {
      name: formData.get('name'),
      category: formData.get('category'),
      description: formData.get('description'),
      color: formData.get('color') || '#000000',
      font: formData.get('font') || 'sans',
      university_id: Number(wizardUniId)
    };
    
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubject)
    });
    const data = await res.json();
    
    if (data.success) {
      setWizardSubjectId(data.id);
      setWizardStep('subject_saved');
    } else {
      setIsAddingSubject(false);
    }
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleWizardAddPlan = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlan = {
      name: formData.get('name'),
      price: formData.get('price'),
      description: formData.get('description'),
      outputs: '[]',
      outputs_label: formData.get('outputs_label') || 'المخرجات',
      delivery_date: formData.get('delivery_date'),
      subject_id: wizardSubjectId
    };
    
    const res = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    });
    const data = await res.json();
    
    if (data.success) {
      setWizardPlanId(data.id);
      setWizardStep('plan_saved');
    }
    showSuccess('تم حفظ التغييرات بنجاح ✅');
  };

  const handleUpdateWizardOutputs = async (outputsJson: string) => {
    if (!wizardPlanId) return;
    await fetch(`/api/admin/plans/${wizardPlanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outputs: outputsJson })
    });
    showSuccess('تم حفظ المخرجات بنجاح ✅');
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  useEffect(() => {
    if (settings?.primary_color) {
      document.documentElement.style.setProperty('--primary-color', settings.primary_color);
    }
  }, [settings?.primary_color]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setIsLoggedIn(true);
      localStorage.setItem('isAdmin', 'true');
    }
    else alert('بيانات خاطئة!');
  };

  return (
    <BrowserRouter>
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            dir="rtl"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={
          <Home 
            onOpenAdmin={() => setIsAdminOpen(true)} 
            isLoggedIn={isLoggedIn} 
            showSuccess={showSuccess} 
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            wizardSubjectId={wizardSubjectId}
            setWizardSubjectId={setWizardSubjectId}
            wizardPlanId={wizardPlanId}
            setWizardPlanId={setWizardPlanId}
            wizardUniId={wizardUniId}
            setWizardUniId={setWizardUniId}
            isAddingSubject={isAddingSubject}
            setIsAddingSubject={setIsAddingSubject}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />
        } />
        <Route path="/university/:uniId" element={<UniversityRedirect />} />
        <Route path="/university/:uniId/services" element={<ServiceSelection isLoggedIn={isLoggedIn} />} />
        <Route path="/university/:uniId/booking" element={<BookingWizard showSuccess={showSuccess} settings={settings} />} />
        <Route path="/university/:uniId/subjects" element={
          <SubjectSearch 
            onOpenAdmin={() => setIsAdminOpen(true)} 
            isLoggedIn={isLoggedIn} 
            showSuccess={showSuccess}
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            wizardSubjectId={wizardSubjectId}
            setWizardSubjectId={setWizardSubjectId}
            wizardPlanId={wizardPlanId}
            setWizardPlanId={setWizardPlanId}
            wizardUniId={wizardUniId}
            setWizardUniId={setWizardUniId}
            isAddingSubject={isAddingSubject}
            setIsAddingSubject={setIsAddingSubject}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />
        } />
        <Route path="/subject/:subId" element={
          <PlanList 
            onOpenAdmin={() => setIsAdminOpen(true)} 
            isLoggedIn={isLoggedIn} 
            showSuccess={showSuccess}
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            wizardSubjectId={wizardSubjectId}
            setWizardSubjectId={setWizardSubjectId}
            wizardPlanId={wizardPlanId}
            setWizardPlanId={setWizardPlanId}
            wizardUniId={wizardUniId}
            setWizardUniId={setWizardUniId}
            isAddingSubject={isAddingSubject}
            setIsAddingSubject={setIsAddingSubject}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />
        } />
        <Route path="/preview/:planId" element={<Preview onOpenAdmin={() => setIsAdminOpen(true)} isLoggedIn={isLoggedIn} showSuccess={showSuccess} />} />
      </Routes>

      <AnimatePresence>
        {isAddingSubject && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-0 sm:p-1">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white w-full max-w-[99%] rounded-[16px] sm:rounded-[40px] shadow-2xl h-[99dvh] flex flex-col overflow-hidden"
              dir="rtl"
            >
              <div className="flex justify-between items-center p-3 sm:p-8 pb-2 sm:pb-4 border-b border-slate-100 shrink-0 relative">
                <WizardHeader 
                   step={wizardStep === 'subject' ? 1 : wizardStep === 'subject_saved' ? 2 : wizardStep === 'plan' ? 3 : wizardStep === 'plan_saved' ? 4 : 5} 
                   totalSteps={5} 
                   title={wizardSubjectId ? "تعديل مادة" : "إضافة مادة جديدة"} 
                />
                <button onClick={() => setIsAddingSubject(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-8">
                {wizardStep === 'subject' && (
                  <form id="subject-form" onSubmit={handleAddSubject} className="space-y-6">
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">اسم المادة</label>
                        <input name="name" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">التصنيف</label>
                        <input name="category" placeholder="مثال: هندسة، طب..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الوصف</label>
                        <textarea name="description" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary min-h-[100px]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">اللون</label>
                          <input name="color" type="color" defaultValue={settings.primary_color} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-pointer p-1" />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الخط</label>
                          <select name="font" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary">
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {wizardStep === 'subject_saved' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">تم حفظ المادة!</h3>
                    <p className="text-slate-500 mb-8 font-bold">هل ترغب في إضافة خطة اشتراك لهذه المادة الآن؟</p>
                  </div>
                )}

                {wizardStep === 'plan' && (
                  <form id="plan-form" onSubmit={handleWizardAddPlan} className="space-y-6">
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">اسم الخطة</label>
                        <input name="name" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">السعر (KWD)</label>
                        <input name="price" type="number" step="0.1" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">الوصف</label>
                        <textarea name="description" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary min-h-[100px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-1">تاريخ التسليم</label>
                        <input name="delivery_date" placeholder="مثال: خلال 24 ساعة" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                  </form>
                )}

                {wizardStep === 'plan_saved' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">تم حفظ الخطة!</h3>
                    <p className="text-slate-500 mb-8 font-bold">هل تود إضافة مخرجات (ملفات/خدمات) إضافية لهذه الخطة؟</p>
                  </div>
                )}

                {wizardStep === 'outputs' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <PlanOutputsEditor 
                        defaultValue="[]" 
                        onChange={handleUpdateWizardOutputs} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer for Buttons */}
              <div className="p-8 pt-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                {wizardStep === 'subject' && (
                  <button type="submit" form="subject-form" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">حفظ المادة</button>
                )}
                {wizardStep === 'subject_saved' && (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setWizardStep('plan')} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20">نعم، إضافة خطة</button>
                    <button onClick={() => setIsAddingSubject(false)} className="w-full py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-lg">لاحقاً</button>
                  </div>
                )}
                {wizardStep === 'plan' && (
                  <button type="submit" form="plan-form" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">حفظ الخطة</button>
                )}
                {wizardStep === 'plan_saved' && (
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setWizardStep('outputs')} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20">نعم، إضافة مخرجات</button>
                    <button onClick={() => setIsAddingSubject(false)} className="w-full py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-lg">إنهاء</button>
                  </div>
                )}
                {wizardStep === 'outputs' && (
                  <button onClick={() => setIsAddingSubject(false)} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20">إنهاء</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-0 sm:p-1">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="admin-panel-slide w-full max-w-[99%] relative h-[99dvh] overflow-y-auto custom-scrollbar bg-white rounded-[16px] sm:rounded-[40px] p-4 sm:p-8"
              dir="rtl"
            >
              {!isLoggedIn ? (
                <div className="py-4">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-800">تسجيل دخول المشرف</h3>
                    <button onClick={() => setIsAdminOpen(false)} className="text-slate-400"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        className="w-full p-4 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">كلمة المرور</label>
                      <input
                        type="password"
                        className="w-full p-4 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">دخول</button>
                  </form>
                </div>
              ) : (
                <AdminPanel onClose={() => setIsAdminOpen(false)} showSuccess={showSuccess} />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
