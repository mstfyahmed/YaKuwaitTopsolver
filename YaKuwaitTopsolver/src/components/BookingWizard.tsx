import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Check, FileUp, Clock, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { Subject, University, Settings } from '../types';
import { cn } from '../utils';
import { WizardHeader } from './WizardHeader';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => (
  <div className={cn("max-w-6xl mx-auto w-full px-1 sm:px-6", className)}>
    {children}
  </div>
);

const StepTitle = ({ title, subtitle, onBack }: { title: React.ReactNode, subtitle?: string, onBack?: () => void }) => (
  <div className="flex items-center justify-between py-2 sm:py-6">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
          <ArrowLeft size={24} className="text-slate-400 rotate-180" />
        </button>
      )}
      <div className="text-right">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-sm font-bold text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const UIText = ({ id, defaultText, className, settings, isEditMode, onUpdateSettings }: { id: string, defaultText: string, className?: string, settings: Settings, isEditMode?: boolean, onUpdateSettings?: (updates: Partial<Settings>) => Promise<any> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const uiTexts = settings.ui_texts ? JSON.parse(settings.ui_texts) : {};
  const text = uiTexts[id] || defaultText;

  const handleSave = async (newVal: string) => {
    if (!onUpdateSettings || newVal === text) {
      setIsEditing(false);
      return;
    }
    const newTexts = { ...uiTexts, [id]: newVal };
    await onUpdateSettings({ ui_texts: JSON.stringify(newTexts) });
    setIsEditing(false);
  };
  
  if (isEditMode && isEditing) {
    return (
      <input 
        autoFocus
        defaultValue={text}
        onBlur={(e) => handleSave(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave(e.currentTarget.value)}
        className="bg-white text-slate-900 p-1 px-2 rounded-lg border-2 border-primary text-sm shadow-xl inline-block"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span 
      className={cn(
        className, 
        isEditMode && "cursor-help ring-1 ring-primary/20 ring-offset-2 hover:ring-primary hover:bg-primary/5 rounded px-1 transition-all relative group/ui-text mx-1"
      )}
      onClick={(e) => {
        if (isEditMode) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {text}
      {isEditMode && (
        <span className="absolute -top-6 left-0 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-md opacity-0 group-hover/ui-text:opacity-100 uppercase font-black shadow-lg shadow-primary/20 whitespace-nowrap z-50">
          تعديل النص
        </span>
      )}
    </span>
  );
};

interface BookingWizardProps {
  showSuccess: (m: string) => void;
  settings: Settings;
  isInsideModal?: boolean;
  modalUniId?: number;
  onClose?: () => void;
  isEditMode?: boolean;
  onUpdateSettings?: (updates: Partial<Settings>) => Promise<void>;
}

export const BookingWizard = ({ 
  showSuccess, 
  settings, 
  isInsideModal, 
  modalUniId, 
  onClose,
  isEditMode,
  onUpdateSettings
}: BookingWizardProps) => {
  const params = useParams();
  const uniId = isInsideModal ? modalUniId : params.uniId;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uni, setUni] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [manualSubject, setManualSubject] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(subjectSearch.toLowerCase())
  );
  const [testType, setTestType] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Configurable content
  const typesText = useMemo(() => {
    try {
      if (!settings.booking_test_types) return ['Quiz', 'Midterm', 'Final', 'GSA', 'Lab Test'];
      const parsed = JSON.parse(settings.booking_test_types);
      return Array.isArray(parsed) ? parsed : ['Quiz', 'Midterm', 'Final', 'GSA', 'Lab Test'];
    } catch {
      return ['Quiz', 'Midterm', 'Final', 'GSA', 'Lab Test'];
    }
  }, [settings.booking_test_types]);

  const slotsConfig = useMemo(() => {
    try {
      if (!settings.booking_slots) return {
        morning: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'],
        afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'],
        evening: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']
      };
      const parsed = JSON.parse(settings.booking_slots);
      return typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }, [settings.booking_slots]);

  useEffect(() => {
    if (!uniId) return;
    const load = async () => {
      try {
        const resSubs = await fetch(`/api/subjects/${uniId}`);
        const dataSubs = await resSubs.json();
        setSubjects(dataSubs);
        
        const resUnis = await fetch('/api/universities');
        const dataUnis = await resUnis.json();
        setUni(dataUnis.find((u: any) => u.id === Number(uniId)));
      } catch (err) {
        console.error("Load failed", err);
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) {
    return (
      <div className={cn(isInsideModal ? "h-[500px]" : "h-screen", "flex items-center justify-center bg-white rounded-[40px]")}>
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
    const msg = `${prefix}\n\n*طلب حجز جلسة اختبار*\n------------------\n📍 الجامعة: ${uni?.name}\n📚 المادة: ${selectedSubject?.name || manualSubject}\n📝 نوع الاختبار: ${testType}\n📅 الموعد: ${selectedDate} في ${selectedTimeSlot}\n\nيرجى التواصل لتأكيد السعر النهائي.`;
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
      if (onClose) onClose();
      else navigate('/');
      showSuccess('تم إرسال طلب الحجز بنجاح ✅');
    } else {
      const data = await res.json();
      alert(data.error || 'حدث خطأ ما');
    }
  };

  const content = (
    <div className={cn("flex flex-col bg-white overflow-hidden h-full", isInsideModal ? "rounded-[40px]" : "min-h-screen")}>
      {!isInsideModal && <WizardHeader step={step + 2} totalSteps={6} />}
      <Container className="flex-1 flex flex-col overflow-hidden pb-0">
        <div className="flex-none">
          <StepTitle 
            title={
              step === 1 ? <UIText id="booking_step1_title" defaultText="بيانات الاختبار" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} /> :
              step === 2 ? <UIText id="booking_step2_title" defaultText="اختيار التوقيت" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} /> :
              <UIText id="booking_step3_title" defaultText="مراجعة الطلب" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
            }
            subtitle={!isInsideModal ? uni?.name : undefined}
            onBack={step > 1 ? () => setStep(step - 1) : (isInsideModal ? onClose : () => navigate(`/university/${uniId}/services`))}
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
                  <label className="block text-slate-800 font-black text-lg mb-4">
                    <UIText id="booking_label_subject" defaultText="اختر المادة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                  </label>
                  <div className="relative group">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary z-10">
                      <Search size={20} />
                    </div>
                    <input 
                      type="text"
                      placeholder={settings.ui_texts ? (JSON.parse(settings.ui_texts).booking_placeholder_subject || "ابحث عن المادة أو اكتبها يدوياً...") : "ابحث عن المادة أو اكتبها يدوياً..."}
                      value={selectedSubject ? selectedSubject.name : manualSubject}
                      onFocus={() => setIsSearching(true)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (selectedSubject) {
                          setSelectedSubject(null);
                        }
                        setManualSubject(val);
                        setSubjectSearch(val);
                        setIsSearching(true);
                      }}
                      className="w-full p-5 pr-14 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                    />

                    <AnimatePresence>
                      {isSearching && (subjectSearch.length > 0 || filteredSubjects.length > 0) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[24px] shadow-2xl overflow-hidden z-[50] max-h-[300px] overflow-y-auto custom-scrollbar"
                        >
                          {filteredSubjects.length > 0 ? (
                            <div className="p-2">
                              {filteredSubjects.map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setSelectedSubject(s);
                                    setManualSubject('');
                                    setSubjectSearch('');
                                    setIsSearching(false);
                                  }}
                                  className="w-full text-right p-4 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between group"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{s.name}</span>
                                    <span className="text-xs text-slate-400">{s.category}</span>
                                  </div>
                                  <BookOpen size={16} className="text-slate-200 group-hover:text-primary transition-colors" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center">
                              <p className="text-sm font-bold text-slate-400">
                                <UIText id="booking_no_results" defaultText="لا يوجد نتائج تطابق بحثك" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                              </p>
                              <button 
                                onClick={() => setIsSearching(false)}
                                className="mt-2 text-primary font-black text-xs uppercase underline tracking-widest"
                              >
                                <UIText id="booking_use_manual" defaultText="استخدام الكتابة اليدوية فقط" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {isSearching && (
                    <div 
                      className="fixed inset-0 z-[40]" 
                      onClick={() => setIsSearching(false)}
                    />
                  )}
                </div>

                <div dir="rtl" className="space-y-4">
                  <label className="block text-slate-800 font-black text-xs sm:text-lg mb-1 sm:mb-4">
                    <UIText id="booking_label_test_type" defaultText="نوع الاختبار" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                  </label>
                  <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3">
                    {typesText.map((type: string) => (
                      <button
                        key={type}
                        onClick={() => setTestType(type)}
                        className={cn(
                          "py-3 sm:py-4 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all border-2",
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

                <div dir="rtl" className="space-y-4">
                  <label className="block text-slate-800 font-black text-xs sm:text-lg mb-1 sm:mb-4">
                    <UIText id="booking_label_attachments" defaultText="المرفقات (اختياري)" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                  </label>
                  <div className="relative">
                    <label className={cn(
                      "flex flex-col items-center justify-center p-4 sm:p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all bg-slate-50/50",
                      syllabusUrl ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 hover:border-primary"
                    )}>
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                        syllabusUrl ? "bg-emerald-500 text-white" : "bg-white text-slate-400 group-hover:text-primaryShadow"
                      )}>
                        {syllabusUrl ? <Check size={28} /> : <FileUp size={28} />}
                      </div>
                      <span className="font-bold text-slate-800">
                        {syllabusUrl ? (
                          <UIText id="booking_upload_success" defaultText="تم الرفع بنجاح" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                        ) : (
                          <UIText id="booking_upload_label" defaultText="ارفع جدول الاختبار أو السيلبس" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                        )}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        <UIText id="booking_upload_hint" defaultText="يساعد المدرس في فهم المحتوى بدقة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                      </span>
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
                  <label className="block text-slate-800 font-black text-lg mb-4">
                    <UIText id="booking_label_date" defaultText="اختر التاريخ" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                  </label>
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
                    {(Object.entries(slotsConfig) as [string, string[]][]).map(([period, slots]) => (
                      <div key={period}>
                        <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2 mr-1">
                          {period === 'morning' ? <UIText id="booking_period_morning" defaultText="الفترة الصباحية" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} /> : 
                           period === 'afternoon' ? <UIText id="booking_period_afternoon" defaultText="فترة الظهيرة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} /> : 
                           <UIText id="booking_period_evening" defaultText="الفترة المسائية" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />}
                        </h4>
                        <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                          {slots.map(slot => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedTimeSlot === slot;
                            return (
                              <button
                                key={slot}
                                disabled={isBooked}
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={cn(
                                  "py-3 sm:py-4 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all border-2 flex items-center justify-center gap-1.5 sm:gap-2",
                                  isBooked ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50" :
                                  isSelected ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" :
                                  "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                )}
                              >
                                <Clock size={14} className={cn("sm:w-4 sm:h-4", isSelected ? "text-white" : "text-slate-300")} />
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
                    <UIText id="booking_selected_time_prefix" defaultText="الوقت المختار: الساعة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} /> {selectedTimeSlot}
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
                    <span className="text-slate-400 font-bold">
                      <UIText id="booking_summary_uni" defaultText="الجامعة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                    </span>
                    <span className="text-slate-800 font-black">{uni?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold">
                      <UIText id="booking_summary_subject" defaultText="المادة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                    </span>
                    <span className="text-slate-800 font-black">{selectedSubject?.name || manualSubject}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <span className="text-slate-400 font-bold">
                      <UIText id="booking_summary_type" defaultText="النوع" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                    </span>
                    <span className="text-slate-800 font-black">{testType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">
                      <UIText id="booking_summary_date" defaultText="الموعد" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                    </span>
                    <div className="text-right">
                      <div className="text-slate-800 font-black">{selectedDate}</div>
                      <div className="text-primary font-black text-sm">{selectedTimeSlot}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-3xl" dir="rtl">
                  <p className="text-amber-800 text-sm font-bold leading-relaxed text-center">
                    <UIText id="booking_price_notice" defaultText="سيتم تحديد السعر النهائي بالاتفاق عبر الواتساب بناءً على نوع الاختبار ومحتواه." settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-none p-6 pt-2 bg-white overflow-hidden">
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleConfirmBooking()}
            disabled={(step === 1 && (!(selectedSubject || manualSubject) || !testType)) || (step === 2 && (!selectedDate || !selectedTimeSlot))}
            className={cn(
              "w-full py-5 rounded-[24px] font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3",
              (step === 1 && (selectedSubject || manualSubject) && testType) || (step === 2 && selectedDate && selectedTimeSlot) || step === 3
                ? "bg-primary text-white shadow-primary/20" 
                : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
            )}
          >
            {step === 3 ? (
              <>
                <MessageCircle size={24} />
                <span>
                  <UIText id="booking_btn_confirm" defaultText="تأكيد الموعد عبر WhatsApp" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                </span>
              </>
            ) : (
              <span>
                <UIText id="booking_btn_continue" defaultText="استمرار" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
              </span>
            )}
          </button>
          
          {isInsideModal && (
            <button 
              onClick={onClose}
              className="w-full mt-3 py-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
              <UIText id="booking_btn_cancel" defaultText="إلغاء وإغلاق" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
            </button>
          )}
        </div>
      </Container>
    </div>
  );

  return content;
};
