import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings')
        .then(res => res.json())
        .then(setSettings);
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
