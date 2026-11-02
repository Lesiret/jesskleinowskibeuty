/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceCategory = 'Cílios' | 'Sobrancelha' | 'Boca' | 'Maquiagem' | 'Limpeza de Pele';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Cílios',
  'Sobrancelha',
  'Boca',
  'Maquiagem',
  'Limpeza de Pele',
];

export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number; // Armazenado em minutos, exibido em horas e minutos
  totalPrice: number;
  depositAmount?: number; // Calculado como 40% dinâmico ou customizado
  category: ServiceCategory;
  isActive: boolean;
}

export type AppointmentStatus = 'pendente_sinal' | 'confirmado' | 'concluido' | 'cancelado' | 'recusado';

export interface SelectedServiceItem {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  serviceId: string; // ID do serviço principal ou lista
  serviceName: string; // Nome formatado dos serviços
  selectedServices?: SelectedServiceItem[]; // Lista de múltiplos serviços selecionados
  totalDurationMinutes: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  totalPrice: number;
  depositAmount: number; // 40% do valor total
  status: AppointmentStatus;
  createdAt: string;
}

export interface ScheduleSettings {
  workingDays: number[]; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  defaultSlots: string[]; // ["08:30", "10:30", "13:30", "15:30", "17:30"]
  customDaySlots?: Record<string, string[]>; // Horários específicos customizados por data YYYY-MM-DD
  blockedDates: string[]; // ["2026-12-25", ...]
  pixKey: string;
  pixKeyType: string;
  pixHolderName: string;
  adminPin: string;
  whatsappNumber: string;
  pixExplanationText?: string;
  whatsappTemplateClientRequest?: string;
  whatsappTemplateAccept?: string;
  whatsappTemplateReject?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  duration: string;
  certification?: string;
  includes: string[];
  forWho?: string;
}
