/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Appointment, ScheduleSettings, Course } from '../types';
import { INITIAL_SERVICES, INITIAL_SETTINGS, INITIAL_APPOINTMENTS, INITIAL_COURSES } from '../data/initialData';

const STORAGE_KEYS = {
  SERVICES: 'jessica_beauty_services_v3',
  SETTINGS: 'jessica_beauty_settings_v3',
  APPOINTMENTS: 'jessica_beauty_appointments_v3',
  COURSES: 'jessica_beauty_courses_v5',
};

export const StorageService = {
  getServices(): Service[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
      }
      return parsed;
    } catch {
      return INITIAL_SERVICES;
    }
  },

  saveServices(services: Service[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save services', e);
    }
  },

  getCourses(): Course[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  },

  getSettings(): ScheduleSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        return INITIAL_SETTINGS;
      }
      const parsed = JSON.parse(data);
      const merged: ScheduleSettings = {
        ...INITIAL_SETTINGS,
        ...(parsed || {}),
        defaultSlots: Array.isArray(parsed?.defaultSlots) && parsed.defaultSlots.length > 0 
          ? parsed.defaultSlots 
          : INITIAL_SETTINGS.defaultSlots,
        workingDays: Array.isArray(parsed?.workingDays) 
          ? parsed.workingDays 
          : INITIAL_SETTINGS.workingDays,
        blockedDates: Array.isArray(parsed?.blockedDates) 
          ? parsed.blockedDates 
          : INITIAL_SETTINGS.blockedDates,
        adminPin: parsed?.adminPin || INITIAL_SETTINGS.adminPin,
        pixKey: parsed?.pixKey || INITIAL_SETTINGS.pixKey,
        whatsappNumber: parsed?.whatsappNumber || INITIAL_SETTINGS.whatsappNumber,
        pixExplanationText: parsed?.pixExplanationText || INITIAL_SETTINGS.pixExplanationText,
        whatsappTemplateClientRequest: parsed?.whatsappTemplateClientRequest || INITIAL_SETTINGS.whatsappTemplateClientRequest,
        whatsappTemplateAccept: parsed?.whatsappTemplateAccept || INITIAL_SETTINGS.whatsappTemplateAccept,
        whatsappTemplateReject: parsed?.whatsappTemplateReject || INITIAL_SETTINGS.whatsappTemplateReject,
      };
      return merged;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: ScheduleSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
        return INITIAL_APPOINTMENTS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },

  saveAppointments(appointments: Appointment[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments', e);
    }
  },

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const list = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAppointment);
    this.saveAppointments(list);
    return newAppointment;
  },

  updateAppointment(updated: Appointment): void {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
      this.saveAppointments(list);
    }
  },

  deleteAppointment(id: string): void {
    const list = this.getAppointments();
    const filtered = list.filter(a => a.id !== id);
    this.saveAppointments(filtered);
  },

  /**
   * Obtém os horários configurados para uma data específica (personalizados para o dia ou padrão da grade)
   */
  getDaySlots(dateStr: string): string[] {
    const settings = this.getSettings();
    if (settings.customDaySlots && Array.isArray(settings.customDaySlots[dateStr])) {
      return settings.customDaySlots[dateStr];
    }
    return settings.defaultSlots || [];
  },

  /**
   * Salva horários específicos para uma data individual definida pela Jéssica
   */
  setDaySlots(dateStr: string, slots: string[]): void {
    const settings = this.getSettings();
    const custom = { ...(settings.customDaySlots || {}) };
    custom[dateStr] = [...slots].sort();
    const updated = { ...settings, customDaySlots: custom };
    this.saveSettings(updated);
  },

  /**
   * Restaura os horários de um dia para a grade padrão geral
   */
  resetDaySlotsToDefault(dateStr: string): void {
    const settings = this.getSettings();
    if (settings.customDaySlots && settings.customDaySlots[dateStr]) {
      const custom = { ...settings.customDaySlots };
      delete custom[dateStr];
      const updated = { ...settings, customDaySlots: custom };
      this.saveSettings(updated);
    }
  },

  /**
   * Calcula horários livres para uma data específica com base na agenda da Jéssica
   */
  getAvailableSlots(dateStr: string): string[] {
    const settings = this.getSettings();
    if (!dateStr) return [];

    const blocked = settings.blockedDates || [];
    if (blocked.includes(dateStr)) {
      return [];
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return [];
    
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const working = settings.workingDays || [];
    const hasCustomSlots = !!(settings.customDaySlots && settings.customDaySlots[dateStr]?.length);
    if (!working.includes(dayOfWeek) && !hasCustomSlots) {
      return [];
    }

    const appointments = this.getAppointments() || [];
    const bookedSlots = appointments
      .filter(a => a && a.date === dateStr && a.status !== 'cancelado' && a.status !== 'recusado')
      .map(a => a.timeSlot);

    const daySlots = this.getDaySlots(dateStr);
    const available = daySlots.filter(slot => !bookedSlots.includes(slot));
    return available;
  },

  formatCurrency(value: number): string {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  },

  formatDateBR(dateStr: string): string {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  },

  /**
   * Converte minutos em formato amigável de horas e minutos (ex: 120 -> 2h, 90 -> 1h 30min, 45 -> 45min)
   */
  formatDuration(minutes: number): string {
    const m = Math.max(0, Math.round(minutes || 0));
    if (m === 0) return '0min';
    if (m < 60) return `${m}min`;
    const hours = Math.floor(m / 60);
    const remainingMins = m % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}min`;
  },

  /**
   * Calcula o valor de sinal exigido (40% do valor total)
   */
  calculateDeposit(totalPrice: number): number {
    return Math.round((totalPrice || 0) * 0.40 * 100) / 100;
  },

  /**
   * Substitui variáveis dinâmicas em um modelo de mensagem do WhatsApp
   */
  renderWhatsAppTemplate(template: string, data: Record<string, string>): string {
    if (!template) return '';
    let result = template;
    for (const [key, val] of Object.entries(data)) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      result = result.replace(regex, val ?? '');
    }
    return result;
  },
};
