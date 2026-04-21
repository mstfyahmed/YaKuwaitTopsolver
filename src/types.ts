import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fallbackSettings from './data/settings.json';

export interface University {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
}

export interface Subject {
  id: number;
  university_id: number;
  name: string;
  category: string;
  description: string;
  font?: string;
  color?: string;
}

export interface PlanOutputItem {
  id: string;
  name: string;
  price: number;
}

export interface Plan {
  id: number;
  subject_id: number;
  name: string;
  description: string;
  price: number;
  font?: string;
  color?: string;
  subject_name?: string;
  sample?: {
    file_path: string;
    file_type: string;
  };
  outputs?: string; // Will store JSON.stringify of PlanOutputItem[]
  label?: string;
  outputs_label?: string;
  sample_title?: string;
  sample_subtitle?: string;
  delivery_date?: string;
}

export interface Settings {
  site_name: string;
  whatsapp_number: string;
  whatsapp_prefix: string;
  whatsapp_button_text?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  [key: string]: string | undefined;
}

export interface InfoBox {
  id: number;
  title?: string;
  text: string;
  bg_color: string;
  text_color: string;
  text_size: string;
  font_family: string;
  shape: string;
  is_bold: boolean;
  has_3d_shadow: boolean;
  width: number;
  height: number;
  pos_x: number;
  pos_y: number;
  sort_order: number;
  file_url?: string;
}

const defaultSettings: Settings = {
  site_name: 'Yakuwait Top Solver',
  whatsapp_number: '',
  whatsapp_prefix: 'السلام عليكم',
  whatsapp_button_text: 'اطلب عبر واتساب',
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#f3f4f6',
  layout_mode: 'list',
  ui_texts: '{}',
  booking_test_types: '["Quiz", "Midterm", "Final", "GSA", "Lab Test"]',
  booking_slots: '{"morning": ["08:00 AM", "09:00 AM"], "afternoon": ["12:00 PM"]}',
  map_elements_config: '{}'
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch settings');
          return res.json();
        })
        .then(data => {
          if (data && typeof data === 'object') {
            setSettings(prev => ({ ...prev, ...data }));
          }
        })
        .catch(err => {
          console.warn('Settings fetch error (using fallback):', err.message);
          setSettings(prev => ({ ...prev, ...fallbackSettings }));
        });
    };

    fetchSettings();

    const socket = io();
    socket.on('data_updated', () => {
      fetchSettings();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return settings;
}
