import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rnd } from 'react-rnd';
import { University, Settings, Subject, Plan, InfoBox, PlanOutputItem } from '../types';
import { Plus, Minus, Maximize, Settings as SettingsIcon, User, X, FileText, ChevronDown, ChevronRight, ChevronLeft, GripHorizontal, Settings2, Crosshair, Map, Download, Search, MessageCircle, Calendar, Eye, Upload, Edit2, Edit3, PlusCircle, Check, ExternalLink, ClipboardCheck, ArrowLeft, Box, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';
import { CustomizableWrapper } from './CustomizableWrapper';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { BookingWizard } from './BookingWizard';
import { WizardHeader } from './WizardHeader';

const kuwaitPath = "M0,489.314L15.038,470.881L42.928,445.785L77.673,398.279L83.96,384.297L113.751,350.312L126.896,321.52L127.501,313.817L161.563,255.896L164.653,231.537L173.556,218.973L191.856,177.425L209.076,127.744L224.465,108.507L244.62,97.515L266.292,91.051L296.477,72.245L418.275,72.13L508.447,111.183L510.964,120.399L518.692,127.466L510.695,118.312L528.495,120.422L524.869,131.794L530.303,151.681L527.614,164.336L530.241,180.158L543.687,213.43L550.599,217.334L553.075,222.965L558.092,222.881L562.318,227.34L563.354,242.172L592.294,304.496L584.355,318.556L575.433,308.012L560.273,299.071L534.584,291.414L513.718,292.661L470.19,319.955L452.336,337.325L446.521,348.757L435.591,359.425L433.345,367.041L427.742,364.382L422.958,366.517L420.81,374.412L415.981,373.87L416.231,379.198L417.916,382.613L425.394,383.847L435.175,375.388L436.014,378.062L445.817,375.203L447.186,377.57L448.63,371.073L451.706,377.448L449.213,370.825L452.122,371.761L453.128,377.736L465.577,371.806L463.745,367.495L465.952,371.384L469.877,371.002L458.707,380.825L461.067,386.422L459.122,395.146L471.87,399.311L489.001,392.702L490.469,386.344L493.661,388.173L488.322,384.604L489.859,382.711L499.667,382.749L494.537,385.372L496.874,388.427L506.188,382.866L516.811,368.927L526.04,368.441L526.926,376.532L534.837,379.448L534.683,384.211L543.681,390.224L560.913,385.311L556.293,405.035L557.057,422.253L561.246,428.775L559.42,430.157L561.602,429.11L559.747,430.479L561.514,439.314L570.276,463.021L571.67,461.02L569.104,464.708L573.796,481.457L576.37,480.585L573.805,482.13L575.786,499.609L580.634,502.919L579.086,505.484L582.899,504.128L582.234,501.047L583.193,505.342L578.884,505.631L579.351,507.879L586.816,504.808L586.684,507.505L579.31,509.009L584.113,512.852L580.309,511.137L581.133,515.87L586.718,513.447L588.05,516.09L580.727,517.201L585.583,536.755L602.083,566.778L612.058,575.853L629.284,581.233L626.238,589.004L629.28,587.507L625.971,590.527L625.466,609.97L632.624,624.426L651.694,637.186L667.619,637.378L662.128,650.303L664.223,653.713L660.839,653.395L664.12,654.341L661.811,653.939L661.331,657.856L664.736,661.462L652.351,663.851L656.987,665.04L662.17,661.136L666.985,670.877L660.71,663.052L661.63,667.733L660.069,665.078L657.896,666.786L666.901,673.176L662.497,672.313L659.463,678.992L659.313,669.887L657.093,669.508L658.762,680.152L654.912,676.657L654.086,670.78L651.252,672.986L656.705,669.323L651.595,669.569L653.262,666.047L651.402,665.786L650.976,670.029L648.819,668.865L650.745,671.615L648.387,670.247L650.063,672.7L647.745,670.754L647.97,674.261L645.437,671.773L646.493,674.348L641.56,674.047L640.923,679.257L643.944,677.616L641.794,674.436L650.504,673.4L654.841,674.875L654.146,681.175L658.721,681.542L666.389,673.303L668.891,687.753L664.874,682.443L664.609,693.562L668.478,698.52L669.993,708.475L679.877,724.023L416.903,727.87L418.935,720.366L398.755,698.416L393.336,684.349L381.283,674.215L377.4,659.78L379.322,630.76L374.625,598.952L347.88,560.006L340.144,541.928L330.726,531.41ZM469.897,375.825L477.754,370.85L477.154,374.587ZM530.785,132.162L531.098,126.956L546.024,110.327L561.619,107.801L580.536,111.976L558.906,119.428L542.865,130.461ZM532.07,163.741L533.547,160.569L541.712,171.008L549.475,169.452L557.08,173.216L554.534,175.26L559.319,174.062L559.095,178.859L552.954,180.542L550.518,185.236L540.982,185.27L535.539,180.903L537.181,176.965L540.946,177.759L535.452,174.995L539.269,174.357L534.027,172.412ZM532.835,155.887L534.363,154.787L537.644,161.798ZM534.097,182.394L536.43,183.223L535.01,184.204ZM536.716,184.551L551.776,188.3L551.472,193.874L544.653,200.987ZM539.7,142.152L550.215,139.027L559.361,128.759L562.187,133.253L566.745,134.047L566.381,138.448L576.612,145.071L571.593,155.872L565.798,160.151L543.731,152.15ZM545.9,200.974L553.261,193.074L563.245,194.564L552.376,192.982L552.855,189.538L559.801,187.581L571.305,191.174L574.53,188.988L559.144,187.011L562.211,183.203L565.547,184.119L562.075,182.838L553.4,188.306L549.861,185.818L553.042,181.097L563.464,178.459L579.824,184.889L573.562,182.326L578.107,178.475L574.205,175.915L567.792,177.675L562.837,175.309L571.983,168.935L580.458,174.369L585.855,186.901L589.538,185.786L587.889,183.863L590.206,178.885L584.034,179.576L585.338,172.935L588.661,174.12L587.23,172.117L570.831,166.212L577.781,165.3L581.242,168.526L580.531,164.182L584.458,161.466L585.8,169.634L592.447,171.845L587.276,168.175L587.441,164.553L593.334,165.142L587.924,160.951L595.557,157.98L593.326,158.077L601.013,147.7L596.566,150.094L599.281,147.136L596.231,148.452L596.334,145.989L595.154,149.191L596.597,143.747L594.299,147.768L593.591,142.42L589.807,141.353L591.09,149.044L588.869,142.533L588.817,150.542L586.028,150.498L590.4,157.131L586.598,155.283L579.481,160.218L577.992,156.132L582.576,154.277L576.44,155.089L577.629,143.281L571.893,141.547L567.492,136.882L567.497,132.438L562.484,131.036L563.423,125.722L579.863,122.373L602.912,132.994L627.828,157.986L648.629,194.288L658.589,199.447L661.149,219.748L653.551,240.158L642.954,256.047L616.029,284.261L601.599,290.059L589.513,282.828L580.989,263.039L578.618,247.737L569.333,238.634L568.003,224.201L563.02,220.688L562.675,215.65L547.792,208.846L548.12,201.451L558.274,199.453L552.837,197.944ZM552.777,162.024L553.711,161.545L554.009,163.044ZM557.197,168.421L558.006,166.505L561.552,166.147ZM558.798,164.866L561.245,162.87L564.861,164.951ZM613.708,328.881L616.02,329.014L616.544,331.891ZM621.167,352.71L628.359,336.808L637.057,334.45L638.575,338.886L652.751,344.512L668.837,360.73L669.923,367.945L655.294,364.657L646.475,354.325ZM682.647,374.613L684.468,374.174L682.984,375.433ZM701.681,502.111L702.119,501.145L703.551,501.739ZM759.425,663.692L760.282,662.745L760.701,664.144ZM798.382,608.451L798.597,607.64L800,608.311Z";

const UIText = ({ id, defaultText, className, settings, isEditMode, onUpdateSettings }: { id: string, defaultText: string, className?: string, settings: Settings, isEditMode?: boolean, onUpdateSettings?: (updates: Partial<Settings>) => Promise<any> }) => {
  const [isEditing, setIsEditing] = useState(false);
  let uiTexts: any = {};
  try {
    uiTexts = settings.ui_texts ? JSON.parse(settings.ui_texts) : {};
  } catch (e) {
    uiTexts = {};
  }
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
        className="bg-white text-slate-900 p-1 px-2 rounded-lg border border-cyan-500 text-sm shadow-xl inline-block"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span 
      className={cn(className, isEditMode && "cursor-pointer ring-1 ring-cyan-500/20 hover:ring-cyan-500 hover:bg-cyan-500/10 rounded px-1 transition-all relative group/ui-text mx-1")}
      onClick={(e) => {
        if (isEditMode) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {text}
      {isEditMode && (
        <span className="absolute -top-6 left-0 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded-md opacity-0 group-hover/ui-text:opacity-100 uppercase font-black shadow-lg shadow-cyan-500/20 whitespace-nowrap z-50">
          تعديل النص
        </span>
      )}
    </span>
  );
};

const EditableText = ({ 
  id, 
  defaultText, 
  defaultSize, 
  className, 
  style,
  config = {},
  updateConfig,
  isEditMode
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const text = config[`${id}_text`] || defaultText;
  const size = config[`${id}_size`] || defaultSize;

  useEffect(() => {
    if (!isEditMode) setIsEditing(false);
  }, [isEditMode]);

  if (isEditMode && isEditing) {
    return (
      <div className="relative group/edit-text w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={text}
          onChange={(e) => updateConfig && updateConfig(`${id}_text`, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditing(false);
          }}
          className={cn("bg-transparent border-none outline-none text-center w-full pointer-events-auto min-w-[50px]", className)}
          style={{ ...style, fontSize: `${size}px` }}
        />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 rounded-lg p-1 flex gap-1 z-50" onMouseDown={e => e.preventDefault()}>
           <button onClick={() => updateConfig && updateConfig(`${id}_size`, Math.max(10, size - 2))} className="text-white p-1 hover:bg-white/20 rounded">-</button>
           <span className="text-white text-xs flex items-center">{size}</span>
           <button onClick={() => updateConfig && updateConfig(`${id}_size`, Math.min(100, size + 2))} className="text-white p-1 hover:bg-white/20 rounded">+</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(className, isEditMode ? "cursor-text hover:ring-1 hover:ring-white/50 rounded px-2" : "")} 
      style={{ ...style, fontSize: `${size}px` }}
      onClick={(e) => {
        if (isEditMode) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {text}
    </div>
  );
};

const DraggableNode = ({ 
  id, 
  defaultX, 
  defaultY, 
  children, 
  className, 
  width = 150, 
  height = 150,
  config = {},
  updateConfig,
  isEditMode
}: any) => {
  const pos = config[`${id}_pos`] || { x: defaultX, y: defaultY };
  
  return (
    <foreignObject
      id={id}
      x={pos.x - width / 2}
      y={pos.y - height / 2}
      width={width}
      height={height}
      className={cn("overflow-visible pointer-events-none", className)}
    >
      <motion.div
         key={`${id}-${pos.x}-${pos.y}`}
         drag={isEditMode}
         dragMomentum={false}
         whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
         onDragEnd={(e, info) => {
           const svg = (e.target as Element).closest('svg');
           if (svg && updateConfig) {
             const CTM = svg.getScreenCTM();
             if (CTM) {
               const deltaX = info.offset.x / CTM.a;
               const deltaY = info.offset.y / CTM.d;
               updateConfig(`${id}_pos`, { x: pos.x + deltaX, y: pos.y + deltaY });
             }
           }
         }}
         className={cn("w-full h-full flex items-center justify-center pointer-events-auto relative group/drag", isEditMode ? "cursor-grab" : "cursor-pointer")}
      >
        {isEditMode && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-cyan-400 hover:text-cyan-300 transition-colors bg-black/40 rounded-full p-1.5 backdrop-blur-sm cursor-grab active:cursor-grabbing z-50 shadow-lg shadow-cyan-500/20 border border-cyan-500/30">
            <GripHorizontal size={16} />
          </div>
        )}
        {children}
      </motion.div>
    </foreignObject>
  );
};

export const MapMode = ({ 
  unis, 
  settings, 
  isLoggedIn, 
  onOpenAdmin,
  isEditMode,
  setIsEditMode,
  setIsWhatsAppModalOpen,
  infoBoxes,
  handleAddInfoBox,
  editingBoxId,
  setEditingBoxId,
  handleUpdateInfoBox,
  handleUpdateInfoBoxMultiple,
  handleDeleteInfoBox,
  handleFileUpload,
  handleUpdateUni,
  setIsAddingSubject,
  isAddingSubject,
  setWizardStep,
  setWizardSubjectId,
  setWizardPlanId,
  setWizardUniId,
  setSelectedSubject: setGlobalSelectedSubject,
  mapColor,
  is3D,
  showSuccess,
  onUpdateSettings
}: { 
  unis: University[], 
  settings: Settings, 
  isLoggedIn: boolean, 
  onOpenAdmin: () => void,
  isEditMode: boolean,
  setIsEditMode?: (val: boolean) => void,
  setIsWhatsAppModalOpen?: (val: boolean) => void,
  infoBoxes?: InfoBox[],
  handleAddInfoBox?: () => void,
  editingBoxId?: number | null,
  setEditingBoxId?: (id: number | null) => void,
  handleUpdateInfoBox?: (id: number, field: string, value: any) => void,
  handleUpdateInfoBoxMultiple?: (id: number, updates: Partial<InfoBox>) => void,
  handleDeleteInfoBox?: (id: number) => void,
  handleFileUpload?: (boxId: number, e: React.ChangeEvent<HTMLInputElement>) => void,
  handleUpdateUni?: (id: number, field: string, value: string) => void,
  setIsAddingSubject?: (val: boolean) => void,
  isAddingSubject?: boolean,
  setWizardStep?: (val: any) => void,
  setWizardSubjectId?: (id: number | null) => void,
  setWizardPlanId?: (id: number | null) => void,
  setWizardUniId?: (id: number | null) => void,
  setSelectedSubject?: (sub: Subject | null) => void,
  mapColor?: string,
  is3D?: boolean,
  showSuccess: (m: string) => void,
  onUpdateSettings?: (updates: Partial<Settings>) => Promise<void>
}) => {
  const navigate = useNavigate();
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [uniSubjects, setUniSubjects] = useState<Subject[]>([]);
  const [uniPlans, setUniPlans] = useState<Record<number, Plan[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Modal State
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');
  const [modalStep, setModalStep] = useState<'description' | 'services' | 'subjects' | 'plans' | 'booking' | null>(null);
  
  const mapFinalStepIndex = 
    modalStep === 'description' ? 1 :
    modalStep === 'services' ? 2 :
    modalStep === 'subjects' ? 3 :
    modalStep === 'plans' ? 4 :
    modalStep === 'booking' ? 3 : 5; // Booking is logically part of step 3 transition

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [previewPlan, setPreviewPlan] = useState<Plan | null>(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedOutputs, setSelectedOutputs] = useState<PlanOutputItem[]>([]);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>('');
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [currentScale, setCurrentScale] = useState(1.2);

  useEffect(() => {
    if (!selectedUni) {
      setModalStep('description');
      setSelectedSubject(null);
      setSelectedPlan(null);
      setSearchQuery('');
      setIsDescriptionEditing(false);
    }
  }, [selectedUni]);

  // Load map elements config
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(settings.map_elements_config || '{}');
      
      // Sanity check for positions to ensure they are on screen
      let needsUpdate = false;
      const safeConfig = { ...parsed };
      
      unis.forEach(uni => {
        const posKey = `uni_card_${uni.id}_pos`;
        if (safeConfig[posKey]) {
          const { x, y } = safeConfig[posKey];
          if (isNaN(x) || isNaN(y) || x < -1000 || x > 3000 || y < -1000 || y > 3000) {
            delete safeConfig[posKey];
            needsUpdate = true;
          }
        }
      });

      setConfig(safeConfig);
      
      if (needsUpdate) {
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ map_elements_config: JSON.stringify(safeConfig) })
        });
      }
    } catch (e) {
      setConfig({});
    }
  }, [settings.map_elements_config, unis]);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ map_elements_config: JSON.stringify(newConfig) })
    });
  };

  const saveFullConfig = (newConfig: any) => {
    setConfig(newConfig);
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ map_elements_config: JSON.stringify(newConfig) })
    });
  };

  const addCustomText = () => {
    const newId = `custom_text_${Date.now()}`;
    const currentIds = config.custom_text_ids || [];
    updateConfig('custom_text_ids', [...currentIds, newId]);
  };

  useEffect(() => {
    if (selectedUni && !isAddingSubject) {
      setIsLoadingData(true);
      fetch(`/api/subjects/${selectedUni.id}`)
        .then(res => res.json())
        .then(async (subjects: Subject[]) => {
          setUniSubjects(subjects);
          const plansData: Record<number, Plan[]> = {};
          for (const sub of subjects) {
            const res = await fetch(`/api/plans/${sub.id}`);
            plansData[sub.id] = await res.json();
          }
          setUniPlans(plansData);
          setIsLoadingData(false);
        });
    }
  }, [isAddingSubject, selectedUni]);

  useEffect(() => {
    if (selectedUni) {
      setIsLoadingData(true);
      fetch(`/api/subjects/${selectedUni.id}`)
        .then(res => res.json())
        .then(async (subjects: Subject[]) => {
          setUniSubjects(subjects);
          const plansData: Record<number, Plan[]> = {};
          for (const sub of subjects) {
            const res = await fetch(`/api/plans/${sub.id}`);
            plansData[sub.id] = await res.json();
          }
          setUniPlans(plansData);
          setIsLoadingData(false);
        });
    } else {
      setUniSubjects([]);
      setUniPlans({});
      setExpandedSubject(null);
    }
  }, [selectedUni]);

  useEffect(() => {
    if (selectedPlan) {
      setSelectedOutputs([]);
    }
  }, [selectedPlan]);

  const handleEditSubject = (sub: Subject) => {
    if (setIsAddingSubject && setWizardStep && setWizardSubjectId && setWizardUniId) {
      setWizardUniId(selectedUni?.id || null);
      setWizardSubjectId(sub.id);
      setWizardStep('subject');
      setIsAddingSubject(true);
    }
  };

  const handleAddSubjectFromMap = () => {
    if (setIsAddingSubject && setWizardStep && setWizardSubjectId && setWizardUniId) {
      setWizardUniId(selectedUni?.id || null);
      setWizardSubjectId(null);
      setWizardStep('subject');
      setIsAddingSubject(true);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    if (setIsAddingSubject && setWizardStep && setWizardSubjectId && setWizardUniId && setWizardPlanId) {
      setWizardUniId(selectedUni?.id || null);
      setWizardSubjectId(selectedSubject?.id || null);
      setWizardPlanId(plan.id);
      setWizardStep('plan');
      setIsAddingSubject(true);
    }
  };

  const mapBgColor = settings.map_bg_color || '#050510';
  const mapBorderColor = mapColor || settings.map_border_color || '#00ffff';
  const mapFillColor = mapColor || settings.map_fill_color || 'rgba(0, 255, 255, 0.05)';
  const mapFontFamily = settings.map_font_family || 'Tajawal';
  const govBorderColor = settings.gov_border_color || mapBorderColor;
  const govBorderWidth = settings.gov_border_width ? parseFloat(settings.gov_border_width) : 2;
  const isMap3D = is3D || settings.map_is_3d === 'true';

  const cities = [
    { id: 'city_kuwait', name: 'مدينة الكويت', defaultX: 500, defaultY: 400 },
    { id: 'city_salmiya', name: 'السالمية', defaultX: 550, defaultY: 450 },
    { id: 'city_jahra', name: 'الجهراء', defaultX: 350, defaultY: 420 },
    { id: 'city_ahmadi', name: 'الأحمدي', defaultX: 520, defaultY: 600 },
  ];

  const colorPalette = ['#00ffff', '#ff00ff', '#00ff00', '#ffaa00', '#ff0000', '#ffffff'];

  const parsedOutputsMapMode: PlanOutputItem[] = useMemo(() => {
    try {
      if (!selectedPlan?.outputs) return [];
      const parsed = JSON.parse(selectedPlan.outputs);
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
      const P = Number(selectedPlan.price) || 0;
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
  }, [selectedPlan]);

  const mapFinalPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    if (parsedOutputsMapMode.length === 0) return Number(selectedPlan.price) || 0;
    return selectedOutputs.reduce((sum, item) => sum + item.price, 0);
  }, [selectedPlan, parsedOutputsMapMode, selectedOutputs]);

  return (
    <div className="relative w-full h-screen overflow-hidden text-white bg-slate-900"
         style={{ 
           backgroundColor: mapBgColor,
           fontFamily: mapFontFamily,
           '--MainColor': settings.primary_color || '#06b6d4' 
         } as React.CSSProperties}>
      
      {isLoggedIn && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-wrap gap-2 w-full max-w-md justify-center px-4" dir="rtl">
          <button 
            onClick={() => setIsEditMode && setIsEditMode(!isEditMode)}
            className={cn(
              "px-4 md:px-6 py-2.5 rounded-full font-bold text-white shadow-lg transition-all flex-1 min-w-[100px] text-xs md:text-sm whitespace-nowrap backdrop-blur-md border border-white/20",
              isEditMode ? "bg-red-500/80 hover:bg-red-600/80 shadow-red-500/30" : "bg-white/10 hover:bg-white/20 shadow-white/10"
            )}
          >
            {isEditMode ? "إغلاق التعديل" : "تعديل حر"}
          </button>
          <button 
            onClick={() => {
              if (!isEditMode && setIsEditMode) setIsEditMode(true);
              if (handleAddInfoBox) handleAddInfoBox();
            }}
            className="px-4 md:px-6 py-2.5 rounded-full font-bold text-white bg-cyan-500/80 hover:bg-cyan-400/80 shadow-lg shadow-cyan-500/30 transition-all flex-1 min-w-[100px] text-xs md:text-sm whitespace-nowrap backdrop-blur-md border border-white/20"
          >
            إضافة مربع نص
          </button>
        </div>
      )}

      {/* Deep Space Background with Starlight */}
      <div className="absolute inset-0 pointer-events-none bg-[#020617] overflow-hidden">
        {/* Stars Pattern */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)',
            backgroundSize: '550px 550px, 350px 350px, 250px 250px',
            backgroundPosition: '0 0, 40px 60px, 130px 270px'
        }}></div>
        
        {/* Nebula/Glow behind map */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[100px] pointer-events-none" 
             style={{ background: `radial-gradient(circle, ${mapBorderColor} 0%, transparent 70%)` }}></div>
      </div>

      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1.2}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        panning={{ disabled: isEditMode || !!selectedUni || currentScale <= 1.25 }}
        onTransformed={(ref) => setCurrentScale(ref.state.scale)}
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent 
          wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} 
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <svg 
            viewBox="-100 -100 1000 1000" 
            className="w-full h-full" 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Luxurious, strong neon glow for the outer border */}
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur1"/>
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur2"/>
                <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur3"/>
                <feMerge result="blurMerge">
                  <feMergeNode in="blur3"/>
                  <feMergeNode in="blur2"/>
                  <feMergeNode in="blur1"/>
                </feMerge>
                <feFlood floodColor={mapBorderColor} floodOpacity="1" result="color"/>
                <feComposite in="color" in2="blurMerge" operator="in" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Subtle, elegant glow for the inner governorate borders */}
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur1"/>
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur2"/>
                <feMerge result="blurMerge">
                  <feMergeNode in="blur2"/>
                  <feMergeNode in="blur1"/>
                </feMerge>
                <feFlood floodColor={govBorderColor} floodOpacity="0.7" result="color"/>
                <feComposite in="color" in2="blurMerge" operator="in" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Kuwait Map Path - Neon Style */}
            <g style={{ 
              transform: isMap3D ? 'rotateX(60deg) rotateZ(-30deg) translateZ(50px)' : 'rotateX(20deg) scale(1.1)', 
              transformOrigin: 'center center', 
              transition: 'transform 1s ease-out',
              transformStyle: 'preserve-3d'
            }}>
                
                {/* Outer Neon Glow Layer */}
                <path
                  d={kuwaitPath}
                  fill="none"
                  stroke={mapBorderColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'url(#neonGlow)' }}
                  className="opacity-60"
                />
                
                {/* Main Map Body */}
                <path
                  d={kuwaitPath}
                  fill={mapColor || "#000000"}
                  fillOpacity="0.8"
                  stroke={mapBorderColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 0 15px ${mapBorderColor}80)` }}
                />
                
                {/* Tech Grid Overlay (Subtle) */}
                <pattern id="techGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="40" height="40" fill="none" stroke={mapBorderColor} strokeWidth="0.5" strokeOpacity="0.05" />
                </pattern>
                <path
                  d={kuwaitPath}
                  fill="url(#techGrid)"
                  stroke="none"
                  className="pointer-events-none opacity-40"
                />

                {/* Internal Divisions - Stylized Governorate Borders */}
                <g className="city-borders pointer-events-none" style={{ filter: 'url(#softGlow)' }}>
                    {/* Inner borders removed as they don't match the real map shape */}
                </g>
            </g>

            {/* Draggable Logo */}
            {settings.logo_url && (
              <DraggableNode id="main_logo" defaultX={100} defaultY={100} width={200} height={100} config={config} updateConfig={updateConfig} isEditMode={isEditMode}>
                <img src={settings.logo_url} alt="Logo" className="h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" referrerPolicy="no-referrer" />
              </DraggableNode>
            )}

            {/* Centered Title */}
            <DraggableNode id="site_title_container" defaultX={400} defaultY={50} width={600} height={100} config={config} updateConfig={updateConfig} isEditMode={isEditMode}>
              <EditableText 
                id="site_title" 
                defaultText={settings.map_title || "Yakuwait Top Solver"} 
                defaultSize={48} 
                className="font-black tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] text-center w-full whitespace-nowrap"
                config={config} updateConfig={updateConfig} isEditMode={isEditMode}
              />
            </DraggableNode>

            {/* Custom Free Texts */}
            {(config.custom_text_ids || []).map((id: string) => (
              <DraggableNode key={`draggable-text-${id}`} id={id} defaultX={400} defaultY={400} width={300} height={50} config={config} updateConfig={updateConfig} isEditMode={isEditMode}>
                <div className="relative group/custom w-full text-center">
                  <EditableText
                    id={id}
                    defaultText="نص جديد (اضغط للتعديل)"
                    defaultSize={32}
                    className="font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] whitespace-nowrap"
                    config={config} updateConfig={updateConfig} isEditMode={isEditMode}
                  />
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIds = (config.custom_text_ids || []).filter((t: string) => t !== id);
                        updateConfig('custom_text_ids', newIds);
                      }}
                      className="absolute -top-6 -right-6 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/custom:opacity-100 transition-opacity pointer-events-auto"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </DraggableNode>
            ))}

            {/* Cities */}
            {cities.map(city => (
              <DraggableNode 
                key={`draggable-city-${city.id}`} 
                id={city.id} 
                defaultX={city.defaultX} 
                defaultY={city.defaultY} 
                width={150} 
                height={50}
                config={config}
                updateConfig={updateConfig}
                isEditMode={isEditMode}
              >
                <div className="relative group/city flex items-center justify-center">
                  <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                  <EditableText 
                    id={`${city.id}_text`} 
                    defaultText={city.name} 
                    defaultSize={24} 
                    className="absolute left-4 font-bold text-white/50 group-hover/city:text-white group-hover/city:drop-shadow-[0_0_10px_var(--MainColor)] transition-all whitespace-nowrap"
                    config={config}
                    updateConfig={updateConfig}
                    isEditMode={isEditMode}
                  />
                </div>
              </DraggableNode>
            ))}

            {/* University Nodes (Pins) */}
            {(() => {
              const seen = new Set();
              return unis.map((uni, idx) => {
                if (!uni.id || seen.has(uni.id)) return null;
                seen.add(uni.id);

                // Default positions logic
                const defaultPositions: Record<string, {x: number, y: number}> = {
                  'AUM': { x: 580, y: 620 }, // Egaila
                  'ACM': { x: 600, y: 630 }, // Egaila
                  'AU': { x: 560, y: 480 },   // Mishref
                  'AIU': { x: 380, y: 440 },  // Jahra
                };
                
                let pos = { x: 400, y: 400 };
                for (const key in defaultPositions) {
                  if (uni.name.includes(key)) {
                    pos = defaultPositions[key];
                    break;
                  }
                }
                if (pos.x === 400 && pos.y === 400) {
                   const idSum = uni.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                   const angle = (idSum % 360) * (Math.PI / 180);
                   const radius = 200 + (idSum % 50);
                   pos = { 
                     x: 400 + Math.cos(angle) * radius, 
                     y: 400 + Math.sin(angle) * radius 
                   };
                }

                const defaultColors = ['#f97316', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];
                const nodeColor = config[`uni_card_${uni.id}_color`] || defaultColors[idx % defaultColors.length];
                const cardScale = config[`uni_card_${uni.id}_scale`] || 1;

                return (
                  <DraggableNode 
                    key={`draggable-uni-${uni.id}`} 
                    id={`uni_card_${uni.id}`} 
                    defaultX={pos.x} 
                    defaultY={pos.y} 
                    width={100 * cardScale}
                    height={150 * cardScale}
                    className="z-50"
                    config={config}
                    updateConfig={updateConfig}
                    isEditMode={isEditMode}
                  >
                    <div 
                      className="relative flex flex-col items-center justify-center group w-full h-full"
                      onClick={(e) => {
                        if (!isEditMode) {
                          setSelectedUni(uni);
                          setViewMode('full');
                          setModalStep('services');
                          if (transformComponentRef.current) {
                            const node = document.getElementById(`uni_card_${uni.id}`);
                            if (node) {
                              transformComponentRef.current.zoomToElement(node, 2.5, 1000, 'easeOut');
                            }
                          }
                        }
                      }}
                    >
                      {/* Pulse Animation Ring - Always active but subtle, stronger on hover */}
                      <div 
                          className="absolute w-20 h-20 rounded-full opacity-20 animate-ping pointer-events-none"
                          style={{ backgroundColor: nodeColor, animationDuration: '3s' }}
                      ></div>

                      {/* Glowing Orb Container */}
                      <div 
                          className="relative w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 group-hover:scale-110 z-10"
                          style={{ 
                              borderColor: 'rgba(255,255,255,0.5)',
                              backgroundColor: `${nodeColor}15`, // Very subtle fill
                              boxShadow: `0 0 15px ${nodeColor}, inset 0 0 15px ${nodeColor}40`
                          }}
                      >
                          {/* Inner Core Glow */}
                          <div className="absolute inset-0 rounded-full opacity-30 blur-md" style={{ backgroundColor: nodeColor }}></div>
                          
                          {/* Rotating Ring (Tech Feel) */}
                          <div className="absolute inset-[-4px] rounded-full border border-dashed border-white/30 animate-[spin_10s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Logo/Text */}
                          <div className="relative z-20">
                              {uni.logo_url ? (
                                  <img src={uni.logo_url} alt={uni.name} className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" referrerPolicy="no-referrer" />
                              ) : (
                                  <span className="text-white font-bold text-lg drop-shadow-[0_0_5px_currentColor]" style={{ color: '#fff' }}>{uni.name.charAt(0)}</span>
                              )}
                          </div>
                      </div>

                      {/* Label */}
                      <EditableText 
                          id={`uni_title_${uni.id}`} 
                          defaultText={uni.name} 
                          defaultSize={14} 
                          className="absolute -bottom-8 font-bold text-white text-center whitespace-nowrap drop-shadow-[0_0_4px_rgba(0,0,0,1)] bg-black/40 px-3 py-0.5 rounded-full border border-white/10 backdrop-blur-sm transition-all duration-300 z-20 opacity-90 group-hover:opacity-100 group-hover:text-cyan-200"
                          config={config}
                          updateConfig={updateConfig}
                          isEditMode={isEditMode}
                      />
                      
                      {isEditMode && (
                        <div 
                          className="absolute top-0 right-0 bg-black/80 p-1 rounded-full cursor-pointer hover:bg-white/20 transition-colors z-50 pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newScale = cardScale === 1 ? 1.2 : cardScale === 1.2 ? 0.8 : 1;
                            updateConfig(`uni_card_${uni.id}_scale`, newScale);
                          }}
                        >
                          <Settings2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </DraggableNode>
                );
              });
            })()}
            
            {/* Info Boxes (Inside SVG for unified scaling) */}
            {(() => {
              const seen = new Set();
              return (infoBoxes || []).map((box, idx) => {
                if (!box.id || seen.has(box.id)) return null;
                seen.add(box.id);
                const fontSize = parseInt(box.text_size) || 18;
                const borderRadius = parseInt(box.shape) || 16;
              
              return (
                <foreignObject
                  key={`svg-box-${box.id}`}
                  x={box.pos_x || 0}
                  y={box.pos_y || 0}
                  width={box.width || 300}
                  height={box.height || 100}
                  className="overflow-visible"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
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
                    onClick={() => {
                      if (isLoggedIn && setEditingBoxId && setIsEditMode) {
                        setIsEditMode(true);
                        setEditingBoxId(box.id);
                      }
                    }}
                  >
                     {/* Content of InfoBox */}
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
                          <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                            <Download size={12} />
                            ملف مرفق
                          </div>
                        )}
                      </div>
                      
                      {/* Edit Controls for InfoBox */}
                      {isLoggedIn && isEditMode && (
                        <div className="absolute top-2 right-2 flex gap-1">
                           <button onClick={(e) => { e.stopPropagation(); if(handleDeleteInfoBox) handleDeleteInfoBox(box.id); }} className="p-1 bg-red-500 text-white rounded-full"><X size={12}/></button>
                           {/* Drag handle is the box itself if we implement drag logic here */}
                        </div>
                      )}
                  </motion.div>
                  
                  {/* Drag Logic for InfoBox */}
                  {isLoggedIn && isEditMode && (
                    <motion.div
                      key={`box-drag-${box.id}-${box.pos_x}-${box.pos_y}`}
                      className="absolute inset-0 z-50 cursor-move"
                      drag
                      dragMomentum={false}
                      onDragEnd={(e, info) => {
                         const svg = (e.target as Element).closest('svg');
                         if (svg && handleUpdateInfoBoxMultiple) {
                           const CTM = svg.getScreenCTM();
                           if (CTM) {
                             const deltaX = info.offset.x / CTM.a;
                             const deltaY = info.offset.y / CTM.d;
                             handleUpdateInfoBoxMultiple(box.id, { pos_x: (box.pos_x || 0) + deltaX, pos_y: (box.pos_y || 0) + deltaY });
                           }
                         }
                      }}
                      style={{ opacity: 0 }} // Invisible drag layer
                    />
                  )}
                  
                  {/* Resize Handles for InfoBox */}
                  {isLoggedIn && isEditMode && editingBoxId === box.id && (
                    <>
                      {/* Bottom Right Resize Handle */}
                      <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        dragElastic={0}
                        onDrag={(e, info) => {
                          const svg = (e.target as Element).closest('svg');
                          if (svg && handleUpdateInfoBoxMultiple) {
                            const CTM = svg.getScreenCTM();
                            if (CTM) {
                              const deltaX = info.delta.x / CTM.a;
                              const deltaY = info.delta.y / CTM.d;
                              handleUpdateInfoBoxMultiple(box.id, { 
                                width: Math.max(100, (box.width || 300) + deltaX),
                                height: Math.max(50, (box.height || 100) + deltaY)
                              });
                            }
                          }
                        }}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white cursor-nwse-resize z-50 translate-x-1/2 translate-y-1/2 shadow-md"
                      />
                    </>
                  )}
                </foreignObject>
              );
            });
          })()}

          </svg>
        </TransformComponent>
      </TransformWrapper>


      {/* Position Controls Panel (Edit Mode Only) - Refined Styling */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-24 md:left-8 md:top-28 z-40 bg-black/80 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl w-72 md:w-80 shadow-2xl max-h-[60vh] overflow-hidden flex flex-col"
            dir="rtl"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
              <Map size={20} className="text-cyan-400"/>
              تحكم بمواقع الجامعات
            </h3>
            <p className="text-xs text-white/50 mb-4">يمكنك سحب الجامعات على الخريطة، أو إدخال الإحداثيات بدقة هنا، أو إحضارها للمنتصف إذا اختفت.</p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pl-2">
              {unis.map(uni => {
                const posKey = `uni_card_${uni.id}_pos`;
                const currentPos = config[posKey] || { x: 500, y: 500 };
                return (
                  <div key={`pos-uni-${uni.id}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                    <div className="text-sm text-white font-bold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      {uni.name}
                    </div>
                    <div className="flex gap-3 mb-3" dir="ltr">
                      <div className="flex-1 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">X</span>
                        <input 
                          type="number" 
                          value={Math.round(currentPos.x)} 
                          onChange={e => updateConfig(posKey, { ...currentPos, x: Number(e.target.value) })} 
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-white text-sm font-mono focus:border-cyan-500 outline-none transition-colors" 
                        />
                      </div>
                      <div className="flex-1 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">Y</span>
                        <input 
                          type="number" 
                          value={Math.round(currentPos.y)} 
                          onChange={e => updateConfig(posKey, { ...currentPos, y: Number(e.target.value) })} 
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-white text-sm font-mono focus:border-cyan-500 outline-none transition-colors" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-white/50">لون الدبوس:</span>
                        <input 
                            type="color" 
                            value={config[`uni_card_${uni.id}_color`] || '#06b6d4'}
                            onChange={(e) => updateConfig(`uni_card_${uni.id}_color`, e.target.value)}
                            className="w-full h-8 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                        />
                    </div>

                    <button 
                      onClick={() => updateConfig(posKey, { x: 500, y: 500 })} 
                      className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 text-xs py-2 rounded-lg transition-colors border border-cyan-500/20"
                    >
                      <Crosshair size={14} />
                      إحضار للمنتصف
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => {
                if(confirm('هل أنت متأكد من إعادة ضبط جميع مواقع الجامعات؟')) {
                  const newConfig = { ...config };
                  unis.forEach(u => delete newConfig[`uni_card_${u.id}_pos`]);
                  saveFullConfig(newConfig);
                }
              }}
              className="w-full mt-4 bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-bold hover:bg-red-500/40 transition-colors border border-red-500/30"
            >
              إعادة ضبط مواقع الجامعات
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Editor Toolbar - Mobile Optimized */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-black/90 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl"
            dir="rtl"
          >
            <button
              onClick={addCustomText}
              className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-4 py-2 rounded-full font-bold transition-all border border-cyan-500/30"
            >
              <Plus size={18} />
              إضافة نص حر
            </button>

            <div className="w-px h-8 bg-white/20"></div>

            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm font-bold">ألوان الخريطة:</span>
              <div className="flex gap-2">
                {colorPalette.map(color => (
                  <button
                    key={`pal-map-${color}`}
                    onClick={() => {
                      fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ map_border_color: color, map_fill_color: `${color}10`, primary_color: color })
                      }).then(() => window.location.reload());
                    }}
                    className="w-8 h-8 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}80` }}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-8 bg-white/20"></div>

            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm font-bold">حدود المحافظات:</span>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  {colorPalette.map(color => (
                    <button
                      key={`gov-${color}`}
                      onClick={() => {
                        fetch('/api/admin/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ gov_border_color: color })
                        }).then(() => window.location.reload());
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform",
                        govBorderColor === color ? "ring-2 ring-white" : ""
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">السمك:</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="5" 
                    step="0.5"
                    value={govBorderWidth}
                    onChange={(e) => {
                      fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ gov_border_width: e.target.value })
                      }).then(() => window.location.reload());
                    }}
                    className="w-24 accent-cyan-500"
                  />
                  <span className="text-white/40 text-xs w-4">{govBorderWidth}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar Area */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 z-50 flex items-center justify-between pointer-events-none" dir="rtl">
        {/* Left: Extra Controls / Branding */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Logo or Title if needed on mobile */}
          <div className="md:hidden p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
            <span className="text-white font-black text-xs tracking-tighter">YAKUWAIT</span>
          </div>
        </div>

        {/* Right: Admin & Edit Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* 3D Toggle */}
          <button 
            onClick={() => {
              const newValue = isMap3D ? 'false' : 'true';
              fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ map_is_3d: newValue })
              }).then(() => window.location.reload());
            }}
            className={cn(
              "p-2.5 md:p-3 rounded-2xl backdrop-blur-md border transition-all flex items-center gap-2 px-3 md:px-4 shadow-lg group",
              isMap3D 
               ? "bg-purple-500/30 border-purple-500/50 text-purple-200 shadow-purple-500/20" 
               : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
            )}
            title="Toggle 3D View"
          >
            <Box size={18} className="md:w-5 md:h-5 text-purple-400 group-hover:text-purple-300" />
            <span className="hidden sm:inline font-bold text-xs md:text-sm">3D</span>
          </button>

          {isLoggedIn && setIsEditMode && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)} 
              className={cn(
                "p-2.5 md:p-3 rounded-2xl backdrop-blur-md border transition-all flex items-center gap-2 px-4 shadow-lg group",
                isEditMode 
                 ? "bg-cyan-500 border-cyan-400 text-white shadow-cyan-500/40" 
                 : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {isEditMode ? <Check size={18} className="md:w-5 md:h-5" /> : <Edit3 size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />}
              <span className="hidden sm:inline font-bold text-xs md:text-sm">
                {isEditMode ? "إنهاء التعديل" : "تعديل الخريطة"}
              </span>
            </button>
          )}
          
          <button 
            onClick={onOpenAdmin} 
            className="p-2.5 md:p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all border border-white/10 shadow-lg text-white group"
          >
            <User size={18} className="md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Floating View Controls (Zoom/Reset) - Desktop Only (Mobile uses pinch) */}
      <div className="absolute bottom-6 right-6 z-40 hidden md:flex flex-col gap-3">
        <button 
          onClick={() => transformComponentRef.current?.zoomIn()}
          className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/20 hover:border-white/30 transition-all shadow-lg group"
          title="Zoom In"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => transformComponentRef.current?.zoomOut()}
          className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/20 hover:border-white/30 transition-all shadow-lg group"
          title="Zoom Out"
        >
          <Minus size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => transformComponentRef.current?.resetTransform()}
          className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-white/20 hover:border-white/30 transition-all shadow-lg group"
          title="Reset View"
        >
          <Maximize size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
      {/* Summary Modal (Small Box) - Responsive positioning */}
      <AnimatePresence>
        {selectedUni && viewMode === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="absolute bottom-6 left-4 right-4 md:bottom-auto md:left-8 md:top-1/2 md:-translate-y-1/2 z-[60] w-auto max-w-[360px] md:w-[320px] pointer-events-none"
          >
            <div className="bg-[#020617]/80 backdrop-blur-3xl border border-cyan-500/30 p-6 rounded-[32px] shadow-[0_0_40px_rgba(0,0,0,0.4)] w-full pointer-events-auto relative text-center ring-1 ring-white/10" dir="rtl">
              
              {/* Close Button */}
              <button 
                onClick={() => {
                    setSelectedUni(null);
                    transformComponentRef.current?.resetTransform();
                }}
                className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={16} />
              </button>

              {/* Edit Button (Admin Only) */}
              {isLoggedIn && (
                <button 
                  onClick={() => setIsDescriptionEditing(!isDescriptionEditing)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-full transition-colors text-white",
                    isDescriptionEditing ? "bg-cyan-500 hover:bg-cyan-400" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <Edit2 size={16} />
                </button>
              )}

              <div className="mb-4 flex justify-center mt-2">
                {selectedUni.logo_url ? (
                  <img src={selectedUni.logo_url} alt={selectedUni.name} className="w-20 h-20 object-contain bg-white/5 rounded-2xl p-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-3xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    {selectedUni.name.charAt(0)}
                  </div>
                )}
              </div>

              {isDescriptionEditing ? (
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-cyan-400 uppercase mb-1 text-right">تغيير الشعار</label>
                    <label className="flex items-center justify-center gap-2 p-2 bg-white/5 border border-dashed border-cyan-500/30 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-xs text-white/70">
                      <Upload size={14} />
                      <span>رفع صورة جديدة</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.success && handleUpdateUni) {
                            handleUpdateUni(selectedUni.id, 'logo_url', data.file_url);
                            setSelectedUni({ ...selectedUni, logo_url: data.file_url });
                          }
                        }} 
                      />
                    </label>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-[10px] font-black text-cyan-400 uppercase text-right">حجم النص</label>
                      <span className="text-[10px] text-white/50">{config[`uni_desc_size_${selectedUni.id}`] || 14}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" max="30" 
                      value={config[`uni_desc_size_${selectedUni.id}`] || 14}
                      onChange={(e) => updateConfig(`uni_desc_size_${selectedUni.id}`, parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-cyan-400 uppercase mb-1 text-right">الوصف</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white leading-relaxed outline-none focus:border-cyan-500 min-h-[80px] text-right resize-none"
                      style={{ fontSize: `${config[`uni_desc_size_${selectedUni.id}`] || 14}px` }}
                      defaultValue={selectedUni.description || ''}
                      id="summary-desc-input"
                      placeholder="أضف وصفاً للجامعة هنا..."
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const val = (document.getElementById('summary-desc-input') as HTMLTextAreaElement).value;
                      if (handleUpdateUni) handleUpdateUni(selectedUni.id, 'description', val);
                      setSelectedUni({ ...selectedUni, description: val });
                      setIsDescriptionEditing(false);
                    }}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{selectedUni.name}</h2>
                  <p 
                    className="text-white/70 leading-relaxed line-clamp-3 mb-6"
                    style={{ fontSize: `${config[`uni_desc_size_${selectedUni.id}`] || 14}px` }}
                  >
                    {selectedUni.description || 'لا يوجد وصف متاح حالياً.'}
                  </p>
                </>
              )}

              <button
                onClick={() => {
                  setViewMode('full');
                  setModalStep('services');
                }}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-white rounded-xl font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <EditableText settingKey="map_btn_browse_subjects" defaultText="استعراض المواد" settings={settings} isLoggedIn={isLoggedIn} />
                <ChevronLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Pop-up (Multi-Step Modal) */}
      <AnimatePresence>
        {selectedUni && viewMode === 'full' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-0.5 sm:p-1 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setSelectedUni(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[99%] h-[99dvh] bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[16px] sm:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Header section with WizardHeader and Navigation */}
              <div className="flex-none p-2 sm:p-6 pb-0 space-y-1 sm:space-y-4">
                <div className={cn(
                  "flex items-center justify-between gap-4 transition-all duration-300",
                  modalStep === 'booking' ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
                )}>
                  <div className="flex items-center gap-3">
                    {mapFinalStepIndex > 1 && (
                      <button 
                        onClick={() => {
                          if (modalStep === 'details') setModalStep('plans');
                          else if (modalStep === 'plans') setModalStep('subjects');
                          else if (modalStep === 'subjects') setModalStep('services');
                          else if (modalStep === 'booking') setModalStep('services');
                          else if (modalStep === 'services') setModalStep('description');
                        }}
                        className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl transition-all border border-white/10"
                      >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                      </button>
                    )}
                    <div className="flex-1">
                      <WizardHeader 
                        step={mapFinalStepIndex} 
                        totalSteps={5} 
                        title={selectedUni.name} 
                        transparent 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUni(null)}
                    className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl transition-all border border-white/10"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className={cn(
                  "flex justify-center gap-1 sm:gap-2 transition-all duration-300",
                  modalStep === 'booking' ? "opacity-0 h-0 overflow-hidden" : "opacity-100 pt-2"
                )}>
                  {[
                    { id: 'description', label: 'عن الجامعة' },
                    { id: 'services', label: 'الخدمات' },
                    { id: 'subjects', label: 'المواد' },
                    { id: 'plans', label: 'الخطط' },
                    { id: 'details', label: 'التفاصيل' }
                  ].map((step, idx) => (
                    <button
                      key={step.id}
                      disabled={idx + 1 > mapFinalStepIndex && !selectedSubject}
                      onClick={() => setModalStep(step.id as any)}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border outline-none",
                        modalStep === step.id 
                          ? "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20" 
                          : idx + 1 <= mapFinalStepIndex 
                            ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" 
                            : "bg-transparent border-transparent text-white/20 cursor-not-allowed"
                      )}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className={cn(
                "flex-1 relative transition-all duration-300",
                modalStep === 'booking' ? "mt-0 overflow-hidden" : "mt-1 overflow-y-auto custom-scrollbar pb-6 px-1 sm:px-6"
              )}>
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Description */}
                  {modalStep === 'description' && (
                    <motion.div
                      key="step-description"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
                    >
                      <div className="mb-8 relative group w-full">
                        {isEditMode && handleUpdateUni ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 justify-center mb-4">
                              <label className="text-sm font-bold text-cyan-400">حجم النص:</label>
                              <input 
                                type="range" 
                                min="14" max="40" 
                                value={config[`uni_desc_size_full_${selectedUni.id}`] || 18}
                                onChange={(e) => updateConfig(`uni_desc_size_full_${selectedUni.id}`, parseInt(e.target.value))}
                                className="w-48 accent-cyan-500"
                              />
                              <span className="text-white/50 text-sm">{config[`uni_desc_size_full_${selectedUni.id}`] || 18}px</span>
                            </div>
                            <textarea
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white leading-relaxed outline-none focus:border-cyan-500 min-h-[200px] text-center"
                              style={{ fontSize: `${config[`uni_desc_size_full_${selectedUni.id}`] || 18}px` }}
                              defaultValue={selectedUni.description || 'أضف وصفاً للجامعة هنا...'}
                              onBlur={(e) => handleUpdateUni(selectedUni.id, 'description', e.target.value)}
                              placeholder="وصف الجامعة..."
                            />
                          </div>
                        ) : (
                          <p 
                            className="text-white/80 leading-relaxed whitespace-pre-wrap"
                            style={{ fontSize: `${config[`uni_desc_size_full_${selectedUni.id}`] || 18}px` }}
                          >
                            {selectedUni.description || 'استعرض المواد والملفات المتاحة لهذه الجامعة.'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1.5: Services */}
                  {modalStep === 'services' && (
                    <motion.div
                      key="step-services"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="h-full flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full"
                    >
                      <h3 className="text-2xl font-black text-white mb-4">
                        <UIText id="choose_service" defaultText="اختر نوع الخدمة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        <button
                          onClick={() => setModalStep('subjects')}
                          className="group p-8 bg-white/5 border border-white/10 rounded-3xl text-center hover:bg-white/10 hover:border-cyan-500/50 transition-all"
                        >
                          <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                            <ClipboardCheck size={32} />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">
                            <UIText id="service_cost_title" defaultText="مساعدة في التكاليف" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                          </h4>
                          <p className="text-white/40 text-sm">
                            <UIText id="service_cost_desc" defaultText="حل الواجبات والمشاريع والتقارير" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                          </p>
                        </button>

                        <button
                          onClick={() => setModalStep('booking')}
                          className="group p-8 bg-white/5 border border-white/10 rounded-3xl text-center hover:bg-white/10 hover:border-purple-500/50 transition-all"
                        >
                          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <Calendar size={32} />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">
                            <UIText id="service_booking_title" defaultText="حجز جلسة اختبار" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                          </h4>
                          <p className="text-white/40 text-sm">
                            <UIText id="service_booking_desc" defaultText="احجز موعداً للمساعدة في اختبارك القادم" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                          </p>
                        </button>
                      </div>

                      <button 
                        onClick={() => setModalStep('description')}
                        className="mt-4 text-white/50 hover:text-white text-sm font-bold flex items-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        <span>رجوع لوصف الجامعة</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Booking */}
                  {modalStep === 'booking' && (
                    <div className="h-full w-full overflow-hidden">
                      <BookingWizard 
                        showSuccess={showSuccess} 
                        settings={settings} 
                        isInsideModal={true} 
                        modalUniId={selectedUni?.id} 
                        onClose={() => setModalStep(null)}
                        isEditMode={isEditMode}
                        onUpdateSettings={onUpdateSettings}
                      />
                    </div>
                  )}

                  {/* Step 2: Subjects */}
                  {modalStep === 'subjects' && (
                    <motion.div
                      key="step-subjects"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="mb-6">
                        <h2 className="text-3xl font-black text-white mb-2">استعراض المواد</h2>
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                           <span>{selectedUni.name}</span>
                        </div>
                      </div>

                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                          <input 
                            type="text"
                            placeholder="ابحث عن مادة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/40 focus:border-cyan-500 outline-none transition-all"
                          />
                        </div>
                        {isLoggedIn && (
                          <button 
                            onClick={handleAddSubjectFromMap}
                            className="p-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                            title="إضافة مادة جديدة"
                          >
                            <PlusCircle size={24} />
                            <span className="hidden md:inline font-bold">إضافة مادة</span>
                          </button>
                        )}
                      </div>

                      {isEditMode && (
                        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 justify-center">
                          <label className="text-sm font-bold text-cyan-400">حجم نص المواد:</label>
                          <input 
                            type="range" 
                            min="12" max="30" 
                            value={config[`subjects_text_size`] || 16}
                            onChange={(e) => updateConfig(`subjects_text_size`, parseInt(e.target.value))}
                            className="w-48 accent-cyan-500"
                          />
                          <span className="text-white/50 text-sm">{config[`subjects_text_size`] || 16}px</span>
                        </div>
                      )}

                      {isLoadingData ? (
                        <div className="flex-1 flex justify-center items-center">
                          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-20 px-2 sm:px-0">
                          {uniSubjects
                            .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((sub, idx) => (
                              <CustomizableWrapper
                                key={`modal-sub-wrapper-${sub.id}`}
                                id={`sub-${sub.id}`}
                                isEnabled={isLoggedIn}
                              >
                                <motion.div
                                  key={`modal-sub-${sub.id}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  onClick={() => {
                                    setSelectedSubject(sub);
                                    setModalStep('plans');
                                  }}
                                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 sm:p-5 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 w-full"
                                >
                                  <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:text-white transition-colors">
                                      <FileText size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    
                                    <div className="flex-1 text-right overflow-hidden">
                                      <h3 
                                        className="font-bold text-white mb-0.5 truncate text-sm sm:text-base" 
                                        style={{ fontSize: `${config[`subjects_text_size`] || 16}px` }}
                                      >
                                        {sub.name}
                                      </h3>
                                      <p 
                                        className="text-white/50 truncate text-[10px] sm:text-xs" 
                                      >
                                        {sub.category}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                      {isLoggedIn && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubject(sub);
                                          }}
                                          className="p-1.5 sm:p-2 bg-white/5 hover:bg-cyan-500 text-white/40 hover:text-white rounded-lg transition-all"
                                        >
                                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                      )}
                                      <ChevronLeft className="text-white/20 group-hover:text-white/60 group-hover:-translate-x-1 transition-all" size={16} />
                                    </div>
                                  </div>
                                </motion.div>
                              </CustomizableWrapper>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Plans */}
                  {modalStep === 'plans' && selectedSubject && (
                    <motion.div
                      key="step-plans"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="mb-6">
                        <h2 className="text-3xl font-black text-white mb-2">اختر الخطة</h2>
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                           <span>مادة {selectedSubject.name}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                        <span className="text-cyan-400">#</span>
                        خطط مادة {selectedSubject.name}
                      </h3>

                      {isEditMode && (
                        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 justify-center">
                          <label className="text-sm font-bold text-cyan-400">حجم نص الخطط:</label>
                          <input 
                            type="range" 
                            min="12" max="30" 
                            value={config[`plans_text_size`] || 16}
                            onChange={(e) => updateConfig(`plans_text_size`, parseInt(e.target.value))}
                            className="w-48 accent-cyan-500"
                          />
                          <span className="text-white/50 text-sm">{config[`plans_text_size`] || 16}px</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pb-20">
                        {(uniPlans[selectedSubject.id] || []).map((plan, idx) => (
                          <CustomizableWrapper key={`modal-plan-wrapper-${plan.id}`} id={`plan-map-${plan.id}`} isEnabled={isLoggedIn} className="w-full">
                            <motion.div
                              key={`modal-plan-${plan.id}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setSelectedOutputs([]); // Reset outputs
                                setModalStep('details');
                              }}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 sm:p-6 cursor-pointer group transition-all flex items-center justify-between gap-3 w-full"
                            >
                              <div className="flex-1 overflow-hidden">
                                <h4 className="font-bold text-white mb-1 sm:mb-2 group-hover:text-cyan-400 transition-colors truncate text-base sm:text-lg" style={{ fontSize: `${config[`plans_text_size`] || 18}px` }}>{plan.name}</h4>
                                <p className="text-white/60 line-clamp-1 sm:line-clamp-2 text-xs" style={{ fontSize: `${(config[`plans_text_size`] || 18) * 0.75}px` }}>{plan.description}</p>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                {isLoggedIn && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPlan(plan);
                                    }}
                                    className="p-1.5 sm:p-2 bg-white/5 hover:bg-cyan-500 text-white/40 hover:text-white rounded-lg transition-all"
                                  >
                                    <Edit2 size={14} className="sm:w-4 sm:h-4" />
                                  </button>
                                )}
                                <span className="text-cyan-400 font-mono font-bold text-sm sm:text-lg whitespace-nowrap">
                                  {(() => {
                                    try {
                                      const out = JSON.parse(plan.outputs || '[]');
                                      return (Array.isArray(out) && out.length > 0) ? 'متغير' : `${plan.price} KD`;
                                    } catch { return `${plan.price} KD`; }
                                  })()}
                                </span>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                  <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                                </div>
                              </div>
                            </motion.div>
                          </CustomizableWrapper>
                        ))}
                        {(uniPlans[selectedSubject.id] || []).length === 0 && (
                          <div className="text-center text-white/40 py-10">
                            لا توجد خطط متاحة لهذه المادة حالياً.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Plan Details */}
                  {modalStep === 'details' && selectedPlan && (
                    <motion.div
                      key="step-details"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="h-full flex flex-col"
                    >
                      <div className="mb-6">
                        <h2 className="text-3xl font-black text-white mb-2">تفاصيل وعينة العمل</h2>
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                           <span>خطة: {selectedPlan.name}</span>
                        </div>
                      </div>

                      {/* Content */}
                      {isEditMode && (
                        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 justify-center shrink-0">
                          <label className="text-sm font-bold text-cyan-400">حجم نص التفاصيل:</label>
                          <input 
                            type="range" 
                            min="14" max="40" 
                            value={config[`plan_details_text_size`] || 18}
                            onChange={(e) => updateConfig(`plan_details_text_size`, parseInt(e.target.value))}
                            className="w-48 accent-cyan-500"
                          />
                          <span className="text-white/50 text-sm">{config[`plan_details_text_size`] || 18}px</span>
                        </div>
                      )}
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                        {parsedOutputsMapMode.length === 0 ? (
                          /* Simplified Centered Layout for Fixed Price Plans (No Outputs) */
                          <div className="max-w-2xl mx-auto space-y-8">
                            <CustomizableWrapper id={`map-details-${selectedPlan.id}`} isEnabled={isLoggedIn} className="w-full">
                              <div className="bg-white/5 rounded-[32px] p-4 sm:p-8 border border-white/10 text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
                                
                                <div className="relative z-10">
                                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-cyan-500/20 mb-4 inline-block">
                                    سعر ثابت • Fixed Price
                                  </span>
                                  <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-4">تفاصيل الطلب</h3>
                                  <p 
                                    className="text-white/60 leading-relaxed max-w-lg mx-auto text-sm sm:text-base" 
                                    style={{ fontSize: `${config[`plan_details_text_size`] || 16}px` }}
                                  >
                                    {selectedPlan.description || 'هذه الخطة تشمل كافة المخرجات الأساسية بسعر ثابت واحد.'}
                                  </p>
                                </div>
                              </div>
                            </CustomizableWrapper>

                            {/* Centered Sample View */}
                            <CustomizableWrapper id={`map-sample-${selectedPlan.id}`} isEnabled={isLoggedIn} className="w-full">
                              <div className="bg-white/5 rounded-[32px] sm:rounded-[40px] p-1.5 border border-white/10 shadow-2xl overflow-hidden">
                                <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
                                  <div>
                                    <h4 className="text-white font-black text-sm sm:text-base">{selectedPlan.sample_title || 'عينة العمل'}</h4>
                                    <p className="text-white/30 text-[9px] mt-0.5">{selectedPlan.sample_subtitle || 'معاينة حية للمحتوى'}</p>
                                  </div>
                                  <div className="p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Eye size={18} className="text-cyan-400" />
                                  </div>
                                </div>
                                <div className="p-1 sm:p-2">
                                  {selectedPlan.sample?.file_path ? (
                                    <div className="rounded-[24px] sm:rounded-[30px] overflow-hidden bg-black/40 aspect-video flex flex-col items-center justify-center relative group">
                                      {selectedPlan.sample.file_type.startsWith('image/') ? (
                                        <img src={selectedPlan.sample.file_path} alt="Sample" className="w-full h-full object-contain" />
                                      ) : selectedPlan.sample.file_type.startsWith('video/') ? (
                                        <video src={selectedPlan.sample.file_path} controls className="w-full h-full object-contain" />
                                      ) : selectedPlan.sample.file_type.includes('pdf') ? (
                                        <div className="w-full h-full p-2">
                                          <embed src={selectedPlan.sample.file_path} type="application/pdf" className="w-full h-full rounded-2xl border border-white/10" />
                                          <button 
                                            onClick={() => window.open(selectedPlan.sample!.file_path, '_blank')}
                                            className="absolute bottom-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-xl text-white rounded-xl font-black text-[10px] border border-white/10 shadow-2xl flex items-center gap-2 hover:bg-black transition-all"
                                          >
                                            <ExternalLink size={12} />
                                            <span>استعراض الملف</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <FileText size={48} className="text-white/10" strokeWidth={1} />
                                      )}
                                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all">
                                        <a href={selectedPlan.sample.file_path} download className="p-3 bg-cyan-500 text-white rounded-xl shadow-xl flex items-center gap-2 font-black text-[10px]">
                                          <Download size={14} />
                                          تنزيل العينة
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-16 sm:py-24 flex flex-col items-center gap-3 text-white/10 bg-black/20 rounded-[24px] sm:rounded-[30px] border-2 border-dashed border-white/5">
                                      <Layers size={36} strokeWidth={1} />
                                      <span className="text-[10px] font-black tracking-widest uppercase">No Sample Provided</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CustomizableWrapper>
                          </div>
                        ) : (
                          /* Grid Layout for Plans with Additional Outputs (Selection Required) */
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                             {/* Content from previous turn */}
                             {/* Left Column: Sample Section */}
                             <div className="space-y-4 order-2 lg:order-1">
                               <div className="bg-white/5 rounded-[32px] p-1 border border-white/10 overflow-hidden shadow-2xl">
                                 <div className="p-5 border-b border-white/5">
                                   <h3 className="font-black text-white" style={{ fontSize: `${(config[`plan_details_text_size`] || 18) * 1.1}px` }}>{selectedPlan.sample_title || 'عينة الخطة'}</h3>
                                   <p className="text-white/40 text-xs mt-1">{selectedPlan.sample_subtitle || 'إليك نظرة عامة على محتوى العمل'}</p>
                                 </div>
                                 
                                 <div className="p-2">
                                   {selectedPlan.sample?.file_path ? (
                                     <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-video flex flex-col items-center justify-center relative group shadow-inner">
                                       {selectedPlan.sample.file_type.startsWith('image/') ? (
                                         <img src={selectedPlan.sample.file_path} alt="Sample" className="w-full h-full object-contain" />
                                       ) : selectedPlan.sample.file_type.startsWith('video/') ? (
                                         <video src={selectedPlan.sample.file_path} controls className="w-full h-full object-contain" />
                                       ) : selectedPlan.sample.file_type.includes('pdf') ? (
                                         <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                           <embed 
                                             src={selectedPlan.sample.file_path} 
                                             type="application/pdf"
                                             className="w-full h-full rounded-xl border border-white/10 bg-white/5"
                                           />
                                           <button 
                                             onClick={() => window.open(selectedPlan.sample!.file_path, '_blank')}
                                             className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md text-white/90 rounded-xl text-[10px] font-black hover:bg-black/80 transition-all flex items-center gap-2 border border-white/10"
                                           >
                                             <ExternalLink size={12} />
                                             <span>فتح في نافذة جديدة</span>
                                           </button>
                                         </div>
                                       ) : (
                                         <div className="flex flex-col items-center gap-4 text-white/20">
                                           <FileText size={64} strokeWidth={1} />
                                           <span className="text-xs font-bold uppercase tracking-widest">Preview Not Available</span>
                                         </div>
                                       )}
                                       
                                       <div className="absolute top-4 left-4 flex gap-2">
                                         <a 
                                           href={selectedPlan.sample.file_path} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           download
                                           className="p-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-all shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                         >
                                           <Download size={18} />
                                           <span className="text-xs font-bold">تنزيل العينة</span>
                                         </a>
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="text-center py-20 text-white/20 border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
                                       <div className="flex flex-col items-center gap-3">
                                         <Eye size={40} strokeWidth={1} />
                                         <span className="text-sm font-bold opacity-50">لا توجد عينة مرفقة</span>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </div>

                             {/* Right Column: Desc & Outputs */}
                             <div className="space-y-6 order-1 lg:order-2">
                               {/* Description Box */}
                               <div className="bg-white/5 rounded-[32px] p-6 border border-white/10">
                                 <h3 className="text-cyan-400 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                                   تفاصيل الخدمة
                                 </h3>
                                 <p 
                                   className="text-white/80 leading-relaxed font-medium" 
                                   style={{ fontSize: `${config[`plan_details_text_size`] || 16}px` }}
                                 >
                                   {selectedPlan.description || 'استعرض المحتويات والاختيارات المتاحة لهذا الطلب.'}
                                 </p>
                               </div>

                               {/* Outputs Section */}
                               {parsedOutputsMapMode.length > 0 && (
                                 <div className="bg-[#0f172a]/40 rounded-[32px] p-6 border border-white/10 shadow-xl">
                                   <div className="flex items-center justify-between mb-6">
                                     <h3 className="font-black text-white flex items-center gap-2">
                                       <PlusCircle size={20} className="text-cyan-400" />
                                       {selectedPlan.outputs_label || 'إضافات اختيارية'}
                                     </h3>
                                     <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black border border-cyan-500/20 uppercase tracking-tighter">
                                       {selectedOutputs.length} محدد
                                     </span>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 gap-3">
                                     {parsedOutputsMapMode.map((output) => {
                                       const isSel = selectedOutputs.some(o => o.id === output.id);
                                       return (
                                         <label 
                                           key={`details-out-${output.id}`} 
                                           className={cn(
                                             "flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all group",
                                             isSel 
                                               ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20" 
                                               : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"
                                           )}
                                         >
                                           <div className="flex items-center gap-3">
                                             <div className={cn(
                                               "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                                               isSel ? "bg-white border-transparent" : "border-white/20 group-hover:border-white/40"
                                             )}>
                                               {isSel && <Check size={14} className="text-cyan-600" />}
                                             </div>
                                             <span className="text-sm font-bold tracking-tight">{output.name}</span>
                                           </div>
                                           {output.price > 0 && (
                                             <span className={cn(
                                               "font-black text-xs px-2 py-1 rounded-md",
                                               isSel ? "bg-white/20 text-white" : "bg-cyan-500/10 text-cyan-400"
                                             )}>
                                               +{output.price} KD
                                             </span>
                                           )}
                                           <input 
                                             type="checkbox" 
                                             className="hidden"
                                             checked={isSel}
                                             onChange={() => {
                                               if (isSel) {
                                                 setSelectedOutputs(prev => prev.filter(o => o.id !== output.id));
                                               } else {
                                                 setSelectedOutputs(prev => [...prev, output]);
                                               }
                                             }}
                                           />
                                         </label>
                                       );
                                     })}
                                   </div>
                                 </div>
                               )}
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Fixed Bottom Action Bar Footer (Moved back into scrolling div to ensure it follows content, but with relative positioning) */}
                      {/* Note: User requested it to be part of the box/window. To ensure it's always accessible, we'll keep it absolute inside the parent flex container */}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* STICKY FOOTER for Action Bar */}
              <AnimatePresence>
                {modalStep === 'description' && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="p-2 sm:p-6 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 flex justify-center z-[100] shrink-0"
                  >
                    <button
                      onClick={() => setModalStep('services')}
                      className="group relative w-full max-w-sm py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                         <EditableText settingKey="map_btn_browse_subjects" defaultText="استمر للاختيار" settings={settings} isLoggedIn={isLoggedIn} />
                         <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </motion.div>
                )}
                
                {modalStep === 'details' && selectedPlan && (() => {
                  const hasOut = parsedOutputsMapMode.length > 0;
                  const selectedCount = selectedOutputs.length;
                  if (hasOut) return selectedCount > 0;
                  return true;
                })() && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="p-2 sm:p-6 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-4 z-[100] shrink-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-white/40 text-xs font-bold text-right">السعر النهائي</span>
                      <span className="text-2xl font-black text-white">{mapFinalPrice} KWD</span>
                    </div>
                    
                    <button
                      onClick={() => setDateModalOpen(true)}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <UIText id="map_btn_confirm_plan" defaultText="تأكيد الخطة" settings={settings} isEditMode={isEditMode} onUpdateSettings={onUpdateSettings} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Selection Modal */}
      <AnimatePresence>
        {dateModalOpen && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-cyan-400" />
                  تحديد تاريخ التسليم
                </h3>
                <button onClick={() => setDateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                {parsedOutputsMapMode.length > 0 && (
                  <div>
                    <label className="block text-white/70 text-sm font-bold mb-3">{selectedPlan.outputs_label || 'مخرجات الخطة'}:</label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {parsedOutputsMapMode.map((output) => (
                        <label key={`modal-out-${output.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                          <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                            checked={selectedOutputs.some(o => o.id === output.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOutputs(prev => [...prev, output]);
                              } else {
                                setSelectedOutputs(prev => prev.filter(o => o.id !== output.id));
                              }
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="text-white/80 text-sm leading-relaxed">
                              {output.name}
                            </span>
                            {output.price > 0 && (
                              <span className="text-cyan-400 font-bold text-xs mt-1">+{output.price} KWD</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white/70 text-sm font-bold mb-2">اختر التاريخ المناسب لك:</label>
                  <input 
                    type="date" 
                    value={selectedDeliveryDate}
                    onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setDateModalOpen(false)}
                  className="px-4 py-3 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    // Redirect to WhatsApp
                    const outputsText = selectedOutputs.length > 0 ? `\n*المخرجات المحددة:*\n${selectedOutputs.map(o => `- ${o.name}`).join('\n')}` : '';
                    const dateText = selectedDeliveryDate ? `\n*تاريخ التسليم المطلوب:* ${selectedDeliveryDate}` : '';
                    
                    const message = `${settings.whatsapp_prefix || 'مرحباً، أود الاستفسار عن'}\n\n*الخطة:* ${selectedPlan.name}\n*المادة:* ${selectedSubject?.name}\n*الجامعة:* ${selectedUni?.name}${outputsText}\n\n*إجمالي السعر:* ${mapFinalPrice} KWD${dateText}`;
                    
                    window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
                    setDateModalOpen(false);
                  }}
                  disabled={parsedOutputsMapMode.length > 0 && selectedOutputs.length === 0}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2",
                    parsedOutputsMapMode.length === 0 || selectedOutputs.length > 0 ? "bg-[#22c55e] hover:bg-[#16a34a] shadow-green-500/20" : "bg-slate-500 cursor-not-allowed opacity-50"
                  )}
                >
                  <MessageCircle size={20} />
                  <EditableText settingKey="map_btn_confirm_send" defaultText="تأكيد وإرسال" settings={settings} isLoggedIn={isLoggedIn} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
