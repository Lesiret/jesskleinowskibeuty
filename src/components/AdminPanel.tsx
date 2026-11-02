/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  Sparkles, 
  Lock, 
  MessageSquare, 
  CalendarCheck, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Tag,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { Appointment, Service, ScheduleSettings, AppointmentStatus, ServiceCategory, SERVICE_CATEGORIES } from '../types';
import { StorageService } from '../services/storage';
import { DEFAULT_WHATSAPP_TEMPLATES } from '../data/initialData';
import { CustomSelect } from './CustomSelect';
import { InteractiveCalendar } from './InteractiveCalendar';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onDataUpdated }) => {
  // --------------------------------------------------------------------------
  // TODOS OS HOOKS DO REACT (Executados estritamente no topo, sem retornos antes)
  // --------------------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule_config' | 'appointments' | 'services' | 'settings'>('calendar');
  const [mobileCalendarView, setMobileCalendarView] = useState<'calendar' | 'day_detail'>('calendar');
  const [customBlockedDateInput, setCustomBlockedDateInput] = useState<string>('');

  const [appointments, setAppointments] = useState<Appointment[]>(() => StorageService.getAppointments() || []);
  const [services, setServices] = useState<Service[]>(() => StorageService.getServices() || []);
  const [settings, setSettings] = useState<ScheduleSettings>(() => StorageService.getSettings());

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  const handleSelectCalendarDate = (date: string) => {
    setSelectedCalendarDate(date);
    setMobileCalendarView('day_detail');
  };

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [serviceFilterCategory, setServiceFilterCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showNewAppModal, setShowNewAppModal] = useState<boolean>(false);
  const [presetModalDate, setPresetModalDate] = useState<string>('');
  const [presetModalTime, setPresetModalTime] = useState<string>('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [reschedulingApp, setReschedulingApp] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  const [newAppClientName, setNewAppClientName] = useState('');
  const [newAppClientPhone, setNewAppClientPhone] = useState('');
  const [newAppServiceId, setNewAppServiceId] = useState('');
  const [newAppNotes, setNewAppNotes] = useState('');

  // Estados de Criação / Edição de Serviço
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Cílios');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDuration, setServiceDuration] = useState('120'); // Armazenado em minutos, exibido em horas/minutos
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDeposit, setServiceDeposit] = useState('');

  const [newSlotTime, setNewSlotTime] = useState('');
  const [newExtraSlotTime, setNewExtraSlotTime] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Hook useEffect para recarregar dados quando modal abre
  useEffect(() => {
    try {
      setAppointments(StorageService.getAppointments() || []);
      setServices(StorageService.getServices() || []);
      setSettings(StorageService.getSettings());
    } catch (e) {
      console.error('Error loading admin data in effect', e);
    }
  }, [isOpen]);

  // Hook useMemo para dia da semana
  const dayOfWeek = useMemo(() => {
    if (!selectedCalendarDate) return 1;
    try {
      const parts = selectedCalendarDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
      }
      return 1;
    } catch {
      return 1;
    }
  }, [selectedCalendarDate]);

  // Hook useMemo para agendamentos do dia (ignora cancelados e recusados para liberar horário)
  const dayAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(
      a => a && a.date === selectedCalendarDate && a.status !== 'cancelado' && a.status !== 'recusado'
    );
  }, [appointments, selectedCalendarDate]);

  // Hook useMemo para timeline do dia (suporta horários configurados por dia)
  const daySlotsTimeline = useMemo(() => {
    const slots = StorageService.getDaySlots(selectedCalendarDate);
    return slots.map(time => {
      const bookedApp = (dayAppointments || []).find(a => a?.timeSlot === time);
      return {
        time,
        isBooked: !!bookedApp,
        appointment: bookedApp || null,
      };
    });
  }, [settings?.defaultSlots, settings?.customDaySlots, selectedCalendarDate, dayAppointments]);

  // Hook useMemo para título formatado do dia
  const formattedDayTitle = useMemo(() => {
    if (!selectedCalendarDate) return '';
    try {
      const parts = selectedCalendarDate.split('-').map(Number);
      if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        return selectedCalendarDate;
      }
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      if (isNaN(dateObj.getTime())) return selectedCalendarDate;

      const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${dayNames[dateObj.getDay()]}, ${parts[2]} de ${monthNames[dateObj.getMonth()]} de ${parts[0]}`;
    } catch {
      return selectedCalendarDate;
    }
  }, [selectedCalendarDate]);

  // --------------------------------------------------------------------------
  // FIM DOS HOOKS - A partir daqui podem existir condicionais e funções
  // --------------------------------------------------------------------------

  if (!isOpen) return null;

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const openWhatsAppUrl = (url: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const loadData = () => {
    try {
      setAppointments(StorageService.getAppointments() || []);
      setServices(StorageService.getServices() || []);
      setSettings(StorageService.getSettings());
    } catch (e) {
      console.error('Failed to load admin data', e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = StorageService.getSettings();
    if (pinInput.trim() === currentSettings.adminPin) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN incorreto. O padrão inicial é 1234.');
    }
  };

  // Se o usuário ainda não digitou o PIN correto, exibe modal de autenticação
  if (!isAuthenticated) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-6 shadow-2xl text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-[#faeef2] border border-[#f0dbe5] text-[#c082a0] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="font-serif-brand font-bold text-lg text-stone-900 tracking-wider uppercase mb-1">
            Painel da Jéssica
          </h3>
          <p className="text-xs text-stone-500 mb-5 font-sans">
            Digite seu PIN de 4 dígitos para gerenciar a agenda, horários e valores.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                placeholder="Digite o PIN (Padrão: 1234)"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                autoFocus
                className="w-full py-3 px-4 text-center font-mono text-lg tracking-widest rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c082a0] focus:bg-white transition-all"
              />
              {pinError && (
                <p className="text-xs text-rose-500 mt-2 font-medium">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white font-serif-brand font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Acessar Painel
            </button>

            <p className="text-[11px] text-stone-400">
              Dica: O PIN inicial é <span className="font-mono font-semibold">1234</span> (você pode alterá-lo nas configurações).
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Ações de Agendamento
  const handleUpdateStatus = (app: Appointment, newStatus: AppointmentStatus) => {
    const updated = { ...app, status: newStatus };
    StorageService.updateAppointment(updated);
    loadData();
    if (onDataUpdated) onDataUpdated();
    showNotify(`Status alterado para "${newStatus.replace('_', ' ')}"!`);
  };

  // Disparo automático WhatsApp: ACEITAR agendamento
  const handleAcceptAppointment = (app: Appointment) => {
    const cleanPhone = app.clientPhone ? app.clientPhone.replace(/\D/g, '') : '';
    const dateFormatted = StorageService.formatDateBR(app.date);
    const durationFormatted = StorageService.formatDuration(app.totalDurationMinutes || 120);

    const msg = [
      `Olá, ${app.clientName}! ✨`,
      ``,
      `Seu agendamento para *${app.serviceName}* no dia *${dateFormatted}* às *${app.timeSlot}h* foi *CONFIRMADO* com sucesso por Jéssica Kleinowski! 💖`,
      ``,
      `⏳ *Duração estimada:* ${durationFormatted}`,
      `💳 *Sinal recebido:* ${StorageService.formatCurrency(app.depositAmount)}`,
      `💵 *Restante no dia do atendimento:* ${StorageService.formatCurrency(app.totalPrice - app.depositAmount)}`,
      ``,
      `Te esperamos no nosso espaço com muito carinho. Caso precise tirar qualquer dúvida, estou por aqui!`
    ].join('\n');

    handleUpdateStatus(app, 'confirmado');

    if (cleanPhone) {
      const template = settings.whatsappTemplateAccept || DEFAULT_WHATSAPP_TEMPLATES.accept;
      const msg = StorageService.renderWhatsAppTemplate(template, {
        cliente: app.clientName,
        telefone: app.clientPhone,
        procedimentos: app.serviceName,
        data: dateFormatted,
        horario: `${app.timeSlot}h`,
        duracao: durationFormatted,
        valor_total: StorageService.formatCurrency(app.totalPrice),
        valor_sinal: StorageService.formatCurrency(app.depositAmount),
        valor_restante: StorageService.formatCurrency(app.totalPrice - app.depositAmount),
        chave_pix: settings.pixKey,
        observacoes: app.clientNotes ? `📝 Observações: ${app.clientNotes}` : '',
      });

      const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
      openWhatsAppUrl(url);
      showNotify(`Agendamento confirmado! Mensagem enviada para ${app.clientName}.`);
    } else {
      showNotify('Agendamento confirmado com sucesso!');
    }
  };

  // Disparo automático WhatsApp: RECUSAR agendamento (libera o horário na agenda)
  const handleRejectAppointment = (app: Appointment) => {
    const cleanPhone = app.clientPhone ? app.clientPhone.replace(/\D/g, '') : '';
    const dateFormatted = StorageService.formatDateBR(app.date);
    const durationFormatted = StorageService.formatDuration(app.totalDurationMinutes || 120);

    handleUpdateStatus(app, 'recusado');

    if (cleanPhone) {
      const template = settings.whatsappTemplateReject || DEFAULT_WHATSAPP_TEMPLATES.reject;
      const msg = StorageService.renderWhatsAppTemplate(template, {
        cliente: app.clientName,
        telefone: app.clientPhone,
        procedimentos: app.serviceName,
        data: dateFormatted,
        horario: `${app.timeSlot}h`,
        duracao: durationFormatted,
        valor_total: StorageService.formatCurrency(app.totalPrice),
        valor_sinal: StorageService.formatCurrency(app.depositAmount),
        valor_restante: StorageService.formatCurrency(app.totalPrice - app.depositAmount),
        chave_pix: settings.pixKey,
        observacoes: app.clientNotes ? `📝 Observações: ${app.clientNotes}` : '',
      });

      const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
      openWhatsAppUrl(url);
      showNotify(`Horário liberado e WhatsApp aberto para ${app.clientName}.`);
    } else {
      showNotify('Agendamento recusado e horário liberado!');
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const app = (appointments || []).find(a => a.id === id);
    if (app) {
      handleUpdateStatus(app, 'cancelado');
      showNotify('Horário cancelado e liberado!');
    }
  };

  const handleOpenReschedule = (app: Appointment) => {
    setReschedulingApp(app);
    setRescheduleDate(app.date);
    setRescheduleTime(app.timeSlot);
  };

  const handleConfirmReschedule = (newDate: string, newTime: string) => {
    if (!reschedulingApp || !newDate || !newTime) return;
    const updated = {
      ...reschedulingApp,
      date: newDate,
      timeSlot: newTime,
      status: 'confirmado' as AppointmentStatus,
    };
    StorageService.updateAppointment(updated);
    setReschedulingApp(null);
    loadData();
    if (onDataUpdated) onDataUpdated();
    showNotify('Horário reagendado com sucesso!');
  };

  const handleOpenManualBooking = (date?: string, time?: string) => {
    setPresetModalDate(date || selectedCalendarDate);
    const slots = Array.isArray(settings?.defaultSlots) ? settings.defaultSlots : ['10:30'];
    setPresetModalTime(time || (slots[0] || '10:30'));
    setNewAppClientName('');
    setNewAppClientPhone('');
    setNewAppNotes('');
    if (services.length > 0) {
      setNewAppServiceId(services[0].id);
    }
    setShowNewAppModal(true);
  };

  const handleCreateManualApp = (e: React.FormEvent) => {
    e.preventDefault();
    const service = (services || []).find(s => s.id === newAppServiceId);
    if (!service || !newAppClientName || !presetModalDate || !presetModalTime) {
      showNotify('Preencha os campos obrigatórios.');
      return;
    }

    const calculatedDeposit = StorageService.calculateDeposit(service.totalPrice);

    StorageService.addAppointment({
      clientName: newAppClientName.trim(),
      clientPhone: newAppClientPhone.trim() || '-',
      clientNotes: newAppNotes.trim(),
      serviceId: service.id,
      serviceName: service.name,
      totalDurationMinutes: service.durationMinutes,
      date: presetModalDate,
      timeSlot: presetModalTime,
      totalPrice: service.totalPrice,
      depositAmount: calculatedDeposit,
      status: 'confirmado',
    });

    setShowNewAppModal(false);
    loadData();
    if (onDataUpdated) onDataUpdated();
    showNotify('Agendamento registrado com sucesso!');
  };

  // Bloquear/Desbloquear o dia selecionado
  const isSelectedDateBlocked = (settings?.blockedDates || []).includes(selectedCalendarDate);

  const handleToggleBlockSelectedDate = () => {
    let updated: string[];
    const currentBlocked = settings?.blockedDates || [];
    if (isSelectedDateBlocked) {
      updated = currentBlocked.filter(d => d !== selectedCalendarDate);
      showNotify(`Data ${StorageService.formatDateBR(selectedCalendarDate)} desbloqueada para atendimento!`);
    } else {
      updated = [...currentBlocked, selectedCalendarDate];
      showNotify(`Data ${StorageService.formatDateBR(selectedCalendarDate)} bloqueada (Folga)!`);
    }
    const newSettings = { ...settings, blockedDates: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (onDataUpdated) onDataUpdated();
  };

  // Adicionar horário especificamente neste dia selecionado
  const handleAddExtraSlotToDay = () => {
    if (!newExtraSlotTime.trim()) return;
    const currentDaySlots = StorageService.getDaySlots(selectedCalendarDate);
    if (currentDaySlots.includes(newExtraSlotTime.trim())) {
      showNotify('Este horário já está cadastrado para este dia.');
      return;
    }
    const updated = [...currentDaySlots, newExtraSlotTime.trim()].sort();
    StorageService.setDaySlots(selectedCalendarDate, updated);
    setSettings(StorageService.getSettings());
    setNewExtraSlotTime('');
    if (onDataUpdated) onDataUpdated();
    showNotify(`Horário ${newExtraSlotTime.trim()}h adicionado ao dia ${StorageService.formatDateBR(selectedCalendarDate)}!`);
  };

  // Remover um horário específico deste dia
  const handleRemoveSlotFromDay = (slotTime: string) => {
    const currentDaySlots = StorageService.getDaySlots(selectedCalendarDate);
    const updated = currentDaySlots.filter(t => t !== slotTime);
    StorageService.setDaySlots(selectedCalendarDate, updated);
    setSettings(StorageService.getSettings());
    if (onDataUpdated) onDataUpdated();
    showNotify(`Horário ${slotTime}h removido do dia ${StorageService.formatDateBR(selectedCalendarDate)}!`);
  };

  // Restaurar horários deste dia para a grade padrão geral
  const handleResetDaySlotsToDefault = () => {
    StorageService.resetDaySlotsToDefault(selectedCalendarDate);
    setSettings(StorageService.getSettings());
    if (onDataUpdated) onDataUpdated();
    showNotify(`Horários do dia ${StorageService.formatDateBR(selectedCalendarDate)} restaurados para a grade padrão!`);
  };

  const isDayCustomized = !!(settings?.customDaySlots && settings.customDaySlots[selectedCalendarDate]);

  const isWorkingDayOfWeek = (settings?.workingDays || []).includes(dayOfWeek);
  const isDayActuallyAvailable = isWorkingDayOfWeek && !isSelectedDateBlocked;

  // Ações de Serviços
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice) return;

    const priceNum = parseFloat(servicePrice.replace(',', '.'));
    const durationNum = parseInt(serviceDuration, 10) || 120;
    const depositNum = serviceDeposit.trim() 
      ? parseFloat(serviceDeposit.replace(',', '.'))
      : StorageService.calculateDeposit(priceNum);

    let updatedList: Service[] = [...(services || [])];

    if (editingService) {
      updatedList = updatedList.map(s => 
        s.id === editingService.id 
          ? {
              ...s,
              name: serviceName.trim(),
              category: serviceCategory,
              description: serviceDesc.trim(),
              totalPrice: priceNum,
              depositAmount: depositNum,
              durationMinutes: durationNum,
            }
          : s
      );
      showNotify('Serviço atualizado com sucesso!');
    } else {
      const newService: Service = {
        id: `srv_${Date.now()}`,
        name: serviceName.trim(),
        category: serviceCategory,
        description: serviceDesc.trim(),
        totalPrice: priceNum,
        depositAmount: depositNum,
        durationMinutes: durationNum,
        isActive: true,
      };
      updatedList.push(newService);
      showNotify('Novo serviço adicionado com sucesso!');
    }

    StorageService.saveServices(updatedList);
    setServices(updatedList);
    setEditingService(null);
    setServiceName('');
    setServiceDesc('');
    setServicePrice('');
    setServiceDeposit('');
    setServiceDuration('120');
    if (onDataUpdated) onDataUpdated();
  };

  const handleToggleServiceActive = (service: Service) => {
    const updated = (services || []).map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s);
    StorageService.saveServices(updated);
    setServices(updated);
    if (onDataUpdated) onDataUpdated();
  };

  const handleDeleteService = (id: string) => {
    if ((services || []).length <= 1) {
      showNotify('Você deve manter pelo menos 1 serviço cadastrado.');
      return;
    }
    const updated = (services || []).filter(s => s.id !== id);
    StorageService.saveServices(updated);
    setServices(updated);
    if (onDataUpdated) onDataUpdated();
    showNotify('Serviço removido com sucesso!');
  };

  // Ações de Configuração Geral de Horários
  const handleToggleWorkingDay = (dayIndex: number) => {
    const current = settings?.workingDays || [];
    let updated: number[];
    if (current.includes(dayIndex)) {
      updated = current.filter(d => d !== dayIndex);
    } else {
      updated = [...current, dayIndex].sort();
    }
    const newSettings = { ...settings, workingDays: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (onDataUpdated) onDataUpdated();
    showNotify('Dias de atendimento atualizados!');
  };

  const handleAddDefaultSlot = () => {
    if (!newSlotTime.trim()) return;
    const currentSlots = Array.isArray(settings?.defaultSlots) ? settings.defaultSlots : [];
    if (currentSlots.includes(newSlotTime.trim())) {
      showNotify('Este horário já está na lista.');
      return;
    }
    const updated = [...currentSlots, newSlotTime.trim()].sort();
    const newSettings = { ...settings, defaultSlots: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    setNewSlotTime('');
    if (onDataUpdated) onDataUpdated();
    showNotify('Horário adicionado à grade padrão!');
  };

  const handleRemoveDefaultSlot = (slot: string) => {
    const currentSlots = Array.isArray(settings?.defaultSlots) ? settings.defaultSlots : [];
    const updated = currentSlots.filter(s => s !== slot);
    const newSettings = { ...settings, defaultSlots: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (onDataUpdated) onDataUpdated();
    showNotify('Horário removido da grade.');
  };

  const handleAddCustomBlockedDate = () => {
    if (!customBlockedDateInput) return;
    const current = settings?.blockedDates || [];
    if (current.includes(customBlockedDateInput)) {
      showNotify('Esta data já está bloqueada.');
      return;
    }
    const updated = [...current, customBlockedDateInput].sort();
    const newSettings = { ...settings, blockedDates: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    setCustomBlockedDateInput('');
    if (onDataUpdated) onDataUpdated();
    showNotify(`Data ${StorageService.formatDateBR(customBlockedDateInput)} bloqueada!`);
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    const current = settings?.blockedDates || [];
    const updated = current.filter(d => d !== dateStr);
    const newSettings = { ...settings, blockedDates: updated };
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (onDataUpdated) onDataUpdated();
    showNotify(`Data ${StorageService.formatDateBR(dateStr)} desbloqueada!`);
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    if (onDataUpdated) onDataUpdated();
    showNotify('Configurações e modelos de WhatsApp salvos com sucesso!');
  };

  const insertTemplateTag = (
    field: 'whatsappTemplateClientRequest' | 'whatsappTemplateAccept' | 'whatsappTemplateReject',
    tag: string
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: (prev[field] || '') + ` ${tag}`
    }));
  };

  const handleResetWhatsAppTemplates = () => {
    setSettings(prev => ({
      ...prev,
      whatsappTemplateClientRequest: DEFAULT_WHATSAPP_TEMPLATES.clientRequest,
      whatsappTemplateAccept: DEFAULT_WHATSAPP_TEMPLATES.accept,
      whatsappTemplateReject: DEFAULT_WHATSAPP_TEMPLATES.reject,
    }));
    showNotify('Modelos de WhatsApp restaurados para o padrão!');
  };

  const DAYS_LABEL = [
    { idx: 0, label: 'Dom' },
    { idx: 1, label: 'Seg' },
    { idx: 2, label: 'Ter' },
    { idx: 3, label: 'Qua' },
    { idx: 4, label: 'Qui' },
    { idx: 5, label: 'Sex' },
    { idx: 6, label: 'Sáb' },
  ];

  // Cores de status
  const statusBadgeStyle: Record<AppointmentStatus, string> = {
    pendente_sinal: 'bg-amber-50 text-amber-800 border-amber-200',
    confirmado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    concluido: 'bg-stone-100 text-stone-700 border-stone-200',
    cancelado: 'bg-stone-100 text-stone-400 border-stone-200 line-through',
    recusado: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusLabelText: Record<AppointmentStatus, string> = {
    pendente_sinal: 'Aguardando Análise / Sinal',
    confirmado: 'Confirmado',
    concluido: 'Atendimento Concluído',
    cancelado: 'Cancelado',
    recusado: 'Recusado / Horário Liberado',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh] sm:max-h-[92vh]"
      >
        {/* Cabeçalho do Painel (shrink-0 impede encolhimento vertical) */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 bg-[#fcfbfb]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#faeef2] border border-[#f0dbe5] text-[#c082a0] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-sm sm:text-lg text-stone-900 tracking-wider uppercase">
                Painel da Jéssica · Gestão
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 font-sans">
                Controle de horários, aprovação via WhatsApp e valores de sinal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notification && (
              <span className="hidden md:inline-block text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 font-medium animate-in fade-in">
                {notification}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO MOBILE (< sm) - 5 Abas Visíveis Simultaneamente sem Barra de Rolagem */}
        <div className="sm:hidden grid grid-cols-5 p-1.5 bg-stone-100/90 border-b border-stone-200 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider">Agenda</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule_config')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'schedule_config'
                ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider">Grade</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'appointments'
                ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Users className="w-4 h-4 mb-0.5" />
              {appointments.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#c082a0] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {appointments.length}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider">Clientes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider">Serviços</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider">Config</span>
          </button>
        </div>

        {/* NAVEGAÇÃO DESKTOP & TABLETS (>= sm) - Abas Completas */}
        <div className="hidden sm:flex shrink-0 border-b border-stone-200 bg-stone-50 px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`shrink-0 min-h-[46px] py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#c082a0] text-[#c082a0] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendário & Horários</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule_config')}
            className={`shrink-0 min-h-[46px] py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'schedule_config'
                ? 'border-[#c082a0] text-[#c082a0] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Grade Padrão</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`shrink-0 min-h-[46px] py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-[#c082a0] text-[#c082a0] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lista Geral ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`shrink-0 min-h-[46px] py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'border-[#c082a0] text-[#c082a0] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Serviços & Sinal (40%)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`shrink-0 min-h-[46px] py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#c082a0] text-[#c082a0] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Chave PIX & Mensagens WhatsApp</span>
          </button>
        </div>

        {/* Notificação toast visível no mobile */}
        {notification && (
          <div className="md:hidden bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium">
            {notification}
          </div>
        )}

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-50/50">
          
          {/* ============================================================== */}
          {/* ABA 1: CALENDÁRIO INTERATIVO & DETALHE DO DIA                  */}
          {/* ============================================================== */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Grid Responsivo: Calendário à Esquerda, Horários do Dia à Direita */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                {/* COLUNA ESQUERDA: O CALENDÁRIO MENSAL */}
                <div className={`lg:col-span-5 space-y-3 ${mobileCalendarView === 'day_detail' ? 'hidden lg:block' : 'block'}`}>
                  <InteractiveCalendar 
                    selectedDate={selectedCalendarDate}
                    onSelectDate={handleSelectCalendarDate}
                    appointments={appointments}
                    settings={settings}
                  />

                  {/* Botão de Atalho para Agendar Manualmente */}
                  <button
                    onClick={() => handleOpenManualBooking(selectedCalendarDate)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#c082a0]/40 hover:bg-[#faeef2]/40 text-[#c082a0] font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Marcar Cliente neste Dia</span>
                  </button>

                  {/* Atalho no Celular para ir direto aos horários do dia selecionado */}
                  <button
                    type="button"
                    onClick={() => setMobileCalendarView('day_detail')}
                    className="lg:hidden w-full py-2.5 px-3 rounded-xl bg-[#faeef2] hover:bg-[#c082a0] text-[#c082a0] hover:text-white border border-[#f0dbe5] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Ver Horários do Dia ({StorageService.formatDateBR(selectedCalendarDate)})</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* COLUNA DIREITA: HORÁRIOS DETALHADOS DO DIA SELECIONADO */}
                <div className={`lg:col-span-7 space-y-4 ${mobileCalendarView === 'calendar' ? 'hidden lg:block' : 'block'}`}>
                  {/* Botão de Voltar ao Calendário no Celular */}
                  <div className="lg:hidden flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setMobileCalendarView('calendar')}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-stone-200 hover:border-[#c082a0] text-stone-700 hover:text-[#c082a0] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#c082a0]" />
                      <span>Voltar ao Calendário</span>
                    </button>
                    <span className="text-xs text-stone-500 font-medium">
                      {StorageService.formatDateBR(selectedCalendarDate)}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
                    
                    {/* Topo do Dia */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#c082a0] font-semibold block font-serif-brand">
                          Agenda do Dia Selecionado
                        </span>
                        <h3 className="font-serif-brand font-bold text-base sm:text-lg text-stone-900">
                          {formattedDayTitle}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleBlockSelectedDate}
                        className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all border cursor-pointer self-start sm:self-auto ${
                          isSelectedDateBlocked
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelectedDateBlocked ? 'Dia Bloqueado (Liberar Folga)' : 'Bloquear este Dia (Folga)'}
                      </button>
                    </div>

                    {/* Estatísticas Rápidas do Dia */}
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="p-2.5 rounded-xl bg-[#faeef2]/50 border border-[#f0dbe5]">
                        <span className="text-[10px] text-[#87556e] uppercase tracking-wider block font-serif-brand">
                          Agendamentos
                        </span>
                        <span className="text-lg font-serif-brand font-bold text-[#c082a0]">
                          {dayAppointments.length}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                        <span className="text-[10px] text-emerald-800 uppercase tracking-wider block font-serif-brand">
                          Horários Livres
                        </span>
                        <span className="text-lg font-serif-brand font-bold text-emerald-700">
                          {daySlotsTimeline.filter(s => !s.isBooked).length}
                        </span>
                      </div>
                    </div>

                    {/* Timeline de Horários */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-stone-800 uppercase tracking-wider font-serif-brand whitespace-nowrap">
                          Horários do Dia:
                        </span>
                        <span className="text-[10px] sm:text-xs text-stone-400 font-sans font-medium whitespace-nowrap">
                          {daySlotsTimeline.length} horários config.
                        </span>
                      </div>

                      {daySlotsTimeline.map(slot => {
                        if (slot.isBooked && slot.appointment) {
                          const app = slot.appointment;
                          const cleanPhone = app.clientPhone ? app.clientPhone.replace(/\D/g, '') : '';
                          const clientWhatsAppUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
                          const durationFormatted = StorageService.formatDuration(app.totalDurationMinutes || 120);

                          return (
                            <div 
                              key={slot.time}
                              className="p-3.5 rounded-2xl border border-[#e8d5df] bg-[#faeef2]/30 hover:bg-[#faeef2]/50 transition-all flex flex-col gap-3 shadow-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-xs sm:text-sm text-[#87556e] bg-white border border-[#e0c4d2] px-2 py-0.5 rounded-md">
                                      {slot.time}h
                                    </span>
                                    <span className="font-bold text-sm text-stone-900">
                                      {app.clientName}
                                    </span>
                                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusBadgeStyle[app.status]}`}>
                                      {statusLabelText[app.status]}
                                    </span>
                                  </div>

                                  <div className="text-xs text-stone-600 flex flex-wrap gap-x-3 gap-y-0.5">
                                    <span className="font-medium text-[#c082a0]">
                                      {app.serviceName}
                                    </span>
                                    <span className="text-stone-500">
                                      ⏳ Duração: <strong>{durationFormatted}</strong>
                                    </span>
                                    <span>
                                      Sinal: <strong className="text-[#87556e]">{StorageService.formatCurrency(app.depositAmount)}</strong> (Total: {StorageService.formatCurrency(app.totalPrice)})
                                    </span>
                                  </div>

                                  {app.clientPhone && app.clientPhone !== '-' && (
                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                      <Phone className="w-3 h-3" />
                                      <span>{app.clientPhone}</span>
                                      {clientWhatsAppUrl && (
                                        <a
                                          href={clientWhatsAppUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 text-[11px] underline"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                          <span>Conversar no WhatsApp</span>
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {app.clientNotes && (
                                    <p className="text-[11px] text-stone-500 italic bg-white p-2 rounded-lg border border-stone-200 mt-1">
                                      Obs da cliente: {app.clientNotes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Barra de Ações Rápidas (Aceitar / Recusar / Reagendar) */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0dbe5]">
                                {app.status === 'pendente_sinal' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptAppointment(app)}
                                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                      title="Confirmar agendamento e enviar mensagem automática para o WhatsApp da cliente"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Aceitar & Enviar no WhatsApp</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRejectAppointment(app)}
                                      className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                                      title="Recusar agendamento, liberar horário na agenda e enviar mensagem educada no WhatsApp da cliente"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Recusar / Reajustar</span>
                                    </button>
                                  </>
                                )}

                                {app.status === 'confirmado' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(app, 'concluido')}
                                      className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium transition-all cursor-pointer"
                                    >
                                      Marcar Atendimento Concluído
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRejectAppointment(app)}
                                      className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                                      title="Desmarcar atendimento, liberar horário na agenda e avisar no WhatsApp da cliente"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Desmarcar & WhatsApp</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenReschedule(app)}
                                  className="py-1.5 px-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-all cursor-pointer"
                                >
                                  Reagendar
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={slot.time}
                            className="p-3 rounded-2xl border border-dashed border-stone-200 bg-white hover:border-[#c082a0]/40 transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-semibold text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                {slot.time}h
                              </span>
                              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Horário Livre para Clientes no Site
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenManualBooking(selectedCalendarDate, slot.time)}
                                className="py-1.5 px-3 rounded-xl bg-[#faeef2] hover:bg-[#c082a0] text-[#c082a0] hover:text-white border border-[#f0dbe5] text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Encaixar Cliente</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSlotFromDay(slot.time)}
                                className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                                title="Remover este horário deste dia específico"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-stone-600 font-medium font-serif-brand">Adicionar horário neste dia:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={newExtraSlotTime}
                            onChange={e => setNewExtraSlotTime(e.target.value)}
                            className="py-1.5 px-2.5 rounded-xl border border-stone-200 text-xs font-mono bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddExtraSlotToDay}
                            className="py-1.5 px-3 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-medium cursor-pointer transition-all shadow-xs flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Adicionar ao Dia</span>
                          </button>
                        </div>
                      </div>

                      {isDayCustomized && (
                        <button
                          type="button"
                          onClick={handleResetDaySlotsToDefault}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[#e0c4d2] text-[#87556e] bg-[#faeef2] hover:bg-[#c082a0] hover:text-white text-xs font-medium transition-all cursor-pointer self-start sm:self-auto shadow-xs"
                          title="Restaurar horários deste dia para a grade padrão"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar Grade Padrão</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: CONFIGURAÇÃO DA GRADE PADRÃO E DIAS DE ATENDIMENTO      */}
          {/* ============================================================== */}
          {activeTab === 'schedule_config' && (
            <div className="space-y-4 sm:space-y-5 max-w-4xl">
              
              {/* Header da Grade Padrão */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-serif-brand flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c082a0]" />
                    <span>Configuração da Grade Padrão & Dias de Atendimento</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Organize os dias habituais de funcionamento da sua agenda, horários padrão e bloqueie datas específicas para folgas ou feriados.
                  </p>
                </div>
              </div>

              {/* CARD 1: DIAS DA SEMANA */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-serif-brand">
                    Dias da Semana em que você Atende:
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Os dias desmarcados ficarão desabilitados para agendamento online no calendário das clientes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {DAYS_LABEL.map(day => {
                    const isChecked = (settings?.workingDays || []).includes(day.idx);
                    return (
                      <button
                        type="button"
                        key={day.idx}
                        onClick={() => handleToggleWorkingDay(day.idx)}
                        className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isChecked
                            ? 'bg-[#c082a0] text-white border-[#c082a0] shadow-xs'
                            : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CARD 2: HORÁRIOS DISPONÍVEIS DA GRADE */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-serif-brand">
                    Horários Disponíveis para Agendamento:
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Cada horário só poderá ser agendado por 1 cliente por data. Assim que alguém marca, o horário some automaticamente do site.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(settings?.defaultSlots || []).map(slot => (
                    <div
                      key={slot}
                      className="inline-flex items-center gap-1.5 py-1.5 pl-3 pr-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-medium text-stone-800 shadow-xs"
                    >
                      <span>{slot}h</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDefaultSlot(slot)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                        title="Remover horário"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={newSlotTime}
                      onChange={e => setNewSlotTime(e.target.value)}
                      className="py-2 px-3 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddDefaultSlot}
                      className="py-2 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-medium cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Horário</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 3: BLOQUEAR DATAS ESPECÍFICAS (FOLGAS OU FERIADOS) */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-serif-brand">
                    Bloquear Datas Específicas (Folgas ou Feriados):
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Nenhum agendamento online poderá ser feito nas datas bloqueadas por você.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <input
                    type="date"
                    value={customBlockedDateInput}
                    onChange={e => setCustomBlockedDateInput(e.target.value)}
                    className="py-2 px-3 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBlockedDate}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer transition-all shadow-xs"
                  >
                    Bloquear Data
                  </button>
                </div>

                {(settings?.blockedDates || []).length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                      Datas Atualmente Bloqueadas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(settings?.blockedDates || []).map(dateStr => (
                        <div
                          key={dateStr}
                          className="inline-flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800"
                        >
                          <span>{StorageService.formatDateBR(dateStr)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlockedDate(dateStr)}
                            className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer transition-colors"
                            title="Desbloquear data"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: LISTA GERAL DE AGENDAMENTOS                             */}
          {/* ============================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Buscar cliente ou procedimento..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="py-2 px-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c082a0] w-full sm:w-60 shadow-xs"
                  />

                  <div className="w-full sm:w-56">
                    <CustomSelect
                      value={filterStatus}
                      onChange={val => setFilterStatus(val)}
                      options={[
                        { value: 'todos', label: 'Todos os Status' },
                        { value: 'pendente_sinal', label: 'Pendente Sinal / Análise' },
                        { value: 'confirmado', label: 'Confirmado' },
                        { value: 'concluido', label: 'Concluído' },
                        { value: 'recusado', label: 'Recusado' },
                        { value: 'cancelado', label: 'Cancelado' },
                      ]}
                      placeholder="Filtrar por status..."
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleOpenManualBooking()}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Agendamento Manual</span>
                </button>
              </div>

              {/* Lista filtrada de agendamentos */}
              {(appointments || [])
                .filter(app => {
                  if (filterStatus !== 'todos' && app.status !== filterStatus) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return (
                      (app.clientName || '').toLowerCase().includes(q) ||
                      (app.serviceName || '').toLowerCase().includes(q) ||
                      (app.clientPhone || '').includes(q)
                    );
                  }
                  return true;
                })
                .length > 0 ? (
                <div className="space-y-3">
                  {(appointments || [])
                    .filter(app => {
                      if (filterStatus !== 'todos' && app.status !== filterStatus) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return (
                          (app.clientName || '').toLowerCase().includes(q) ||
                          (app.serviceName || '').toLowerCase().includes(q) ||
                          (app.clientPhone || '').includes(q)
                        );
                      }
                      return true;
                    })
                    .map(app => {
                      const cleanPhone = app.clientPhone ? app.clientPhone.replace(/\D/g, '') : '';
                      const clientWhatsAppUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
                      const durationFormatted = StorageService.formatDuration(app.totalDurationMinutes || 120);

                      return (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif-brand font-bold text-sm text-stone-900">
                                {app.clientName}
                              </span>
                              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusBadgeStyle[app.status]}`}>
                                {statusLabelText[app.status]}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                              <span className="flex items-center gap-1 font-medium text-stone-800">
                                <CalendarIcon className="w-3.5 h-3.5 text-[#c082a0]" />
                                {StorageService.formatDateBR(app.date)} às {app.timeSlot}h
                              </span>
                              <span className="text-[#87556e] font-medium">
                                {app.serviceName}
                              </span>
                              <span className="text-stone-500">
                                ⏳ {durationFormatted}
                              </span>
                              <span>
                                Sinal: <strong className="text-[#87556e]">{StorageService.formatCurrency(app.depositAmount)}</strong> (Total: {StorageService.formatCurrency(app.totalPrice)})
                              </span>
                            </div>

                            {app.clientPhone && app.clientPhone !== '-' && (
                              <div className="flex items-center gap-2 text-xs text-stone-500 pt-0.5">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{app.clientPhone}</span>
                                {clientWhatsAppUrl && (
                                  <a
                                    href={clientWhatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 text-[11px] underline"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Conversar no WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {app.clientNotes && (
                              <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-xl border border-stone-100 mt-1">
                                Obs: {app.clientNotes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                            {app.status === 'pendente_sinal' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptAppointment(app)}
                                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Confirmar e enviar mensagem de aprovação via WhatsApp"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Aceitar & WhatsApp</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRejectAppointment(app)}
                                  className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                                  title="Recusar e avisar via WhatsApp"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Recusar</span>
                                </button>
                              </>
                            )}

                            {app.status === 'confirmado' && (
                              <button
                                onClick={() => handleUpdateStatus(app, 'concluido')}
                                className="py-1.5 px-2.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-medium transition-all cursor-pointer"
                              >
                                Concluir
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenReschedule(app)}
                              className="py-1.5 px-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-[11px] font-medium transition-all cursor-pointer"
                            >
                              Reagendar
                            </button>

                            {app.status !== 'cancelado' && app.status !== 'recusado' && app.status !== 'pendente_sinal' ? (
                              <button
                                onClick={() => handleRejectAppointment(app)}
                                className="py-1.5 px-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition-all cursor-pointer"
                                title="Desmarcar agendamento e avisar via WhatsApp"
                              >
                                Desmarcar & WhatsApp
                              </button>
                            ) : (
                              (app.status === 'cancelado' || app.status === 'recusado') && (
                                <button
                                  onClick={() => handleDeleteAppointment(app.id)}
                                  className="py-1.5 px-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-stone-700 text-[11px] font-medium transition-all cursor-pointer"
                                  title="Excluir do histórico"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl p-6 bg-white">
                  <p className="text-xs text-stone-500">
                    Nenhum agendamento encontrado nesta busca.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: SERVIÇOS & VALORES DE SINAL (40%)                       */}
          {/* ============================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-stone-900">
                    Procedimentos, Categorias & Sinal
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cadastre os serviços de Beleza e configure os preços e a duração em horas e minutos.
                  </p>
                </div>
              </div>

              {/* Formulário de Adicionar / Editar Serviço */}
              <form 
                onSubmit={handleSaveService} 
                className="p-4 sm:p-5 rounded-2xl border border-[#f0dbe5] bg-white space-y-3.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-brand font-bold text-xs uppercase tracking-wider text-[#87556e]">
                    {editingService ? 'Editar Procedimento' : '+ Adicionar Novo Procedimento'}
                  </h4>
                  {editingService && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null);
                        setServiceName('');
                        setServiceDesc('');
                        setServicePrice('');
                        setServiceDeposit('');
                        setServiceDuration('120');
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Categoria do Atendimento:
                    </label>
                    <CustomSelect
                      value={serviceCategory}
                      onChange={val => setServiceCategory(val as ServiceCategory)}
                      options={SERVICE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                      placeholder="Selecione a categoria..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Nome do Procedimento:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Volume Brasileiro"
                      value={serviceName}
                      onChange={e => setServiceName(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:bg-white"
                      required
                    />
                  </div>

                  {/* Duração em Horas e Minutos */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider font-serif-brand">
                        Duração do Atendimento:
                      </label>
                      <span className="text-xs font-bold text-[#c082a0]">
                        Formatado: {StorageService.formatDuration(parseInt(serviceDuration, 10) || 120)}
                      </span>
                    </div>

                    {/* Chips rápidos de duração */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[30, 45, 60, 75, 90, 105, 120, 150, 180].map(mins => {
                        const isSel = serviceDuration === mins.toString();
                        return (
                          <button
                            type="button"
                            key={mins}
                            onClick={() => setServiceDuration(mins.toString())}
                            className={`py-1 px-2.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-[#c082a0] text-white border-[#c082a0]' 
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {StorageService.formatDuration(mins)}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="number"
                      placeholder="Minutos (ex: 120 para 2h)"
                      value={serviceDuration}
                      onChange={e => setServiceDuration(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Valor Total (R$):
                    </label>
                    <input
                      type="text"
                      placeholder="150,00"
                      value={servicePrice}
                      onChange={e => {
                        const val = e.target.value;
                        setServicePrice(val);
                        // Auto calcular 40% do sinal se o campo de sinal estiver vazio ou acompanhando
                        const num = parseFloat(val.replace(',', '.'));
                        if (!isNaN(num) && num > 0) {
                          setServiceDeposit((num * 0.4).toFixed(2).replace('.', ','));
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#87556e] font-semibold uppercase tracking-wider mb-1 font-serif-brand">
                      Valor de Sinal (40% sugerido):
                    </label>
                    <input
                      type="text"
                      placeholder="60,00"
                      value={serviceDeposit}
                      onChange={e => setServiceDeposit(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-[#e0c4d2] text-xs font-semibold text-[#c082a0]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1 font-serif-brand uppercase tracking-wider">
                    Descrição Breve (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Efeito marcante com fios macios e leves."
                    value={serviceDesc}
                    onChange={e => setServiceDesc(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  {editingService ? 'Salvar Alterações' : 'Cadastrar Procedimento'}
                </button>
              </form>

              {/* Filtro e Lista de Serviços Cadastrados */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-serif-brand font-bold text-xs uppercase tracking-wider text-stone-700">
                    Procedimentos Cadastrados:
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Mostrando {(services || []).filter(s => serviceFilterCategory === 'todas' || s.category === serviceFilterCategory).length} de {(services || []).length}
                  </span>
                </div>

                {/* Filtro de Categorias em Chips Arredondados */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
                  <button
                    type="button"
                    onClick={() => setServiceFilterCategory('todas')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      serviceFilterCategory === 'todas'
                        ? 'bg-[#c082a0] text-white border-[#c082a0] shadow-xs font-semibold'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    Todas ({(services || []).length})
                  </button>
                  {SERVICE_CATEGORIES.map(cat => {
                    const count = (services || []).filter(s => s.category === cat).length;
                    const isSelected = serviceFilterCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setServiceFilterCategory(cat)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                          isSelected
                            ? 'bg-[#c082a0] text-white border-[#c082a0] shadow-xs font-semibold'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {(services || [])
                    .filter(s => serviceFilterCategory === 'todas' || s.category === serviceFilterCategory)
                    .map(srv => (
                  <div
                    key={srv.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                      srv.isActive ? 'bg-white border-stone-200' : 'bg-stone-100 border-stone-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#faeef2] text-[#c082a0] border border-[#f0dbe5]">
                          {srv.category}
                        </span>
                        <span className="font-semibold text-xs sm:text-sm text-stone-900">
                          {srv.name}
                        </span>
                        {!srv.isActive && (
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                            Pausado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>Valor: <strong>{StorageService.formatCurrency(srv.totalPrice)}</strong></span>
                        <span className="text-[#87556e]">
                          Sinal (40%): <strong>{StorageService.formatCurrency(srv.depositAmount || StorageService.calculateDeposit(srv.totalPrice))}</strong>
                        </span>
                        <span className="text-stone-700">
                          ⏳ Duração: <strong>{StorageService.formatDuration(srv.durationMinutes)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(srv);
                          setServiceName(srv.name);
                          setServiceCategory(srv.category || 'Cílios');
                          setServiceDesc(srv.description || '');
                          setServicePrice(srv.totalPrice.toString());
                          setServiceDeposit((srv.depositAmount || StorageService.calculateDeposit(srv.totalPrice)).toString());
                          setServiceDuration(srv.durationMinutes.toString());
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleServiceActive(srv)}
                        className="py-1 px-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-[11px] cursor-pointer"
                      >
                        {srv.isActive ? 'Pausar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  ))}
                </div>

                {(services || []).filter(s => serviceFilterCategory === 'todas' || s.category === serviceFilterCategory).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-2xl p-4 bg-white text-xs text-stone-400">
                    Nenhum procedimento cadastrado nesta categoria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 4: CONFIGURAÇÕES, PIX E SENHA                             */}
          {/* ============================================================== */}
          {/* ============================================================== */}
          {/* ABA 4: CONFIGURAÇÕES, PIX E MENSAGENS WHATSAPP                */}
          {/* ============================================================== */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="font-serif-brand font-bold text-base text-stone-900 uppercase">
                    Configurações do Espaço & Mensagens WhatsApp
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ajuste sua chave PIX, senha de acesso e personalize os textos que são enviados automaticamente no WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleResetWhatsAppTemplates}
                    className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-medium transition-all cursor-pointer shadow-xs"
                    title="Restaurar textos padrão originais"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    <span>Restaurar Mensagens</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* COLUNA 1: DADOS DE RECEBIMENTO E ACESSO */}
                <div className="lg:col-span-5 space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-fit">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="text-sm">🔑</span>
                    <h4 className="font-semibold text-xs text-stone-800 uppercase tracking-wider font-serif-brand">
                      Chave PIX & Acesso
                    </h4>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Chave PIX da Jéssica:
                    </label>
                    <input
                      type="text"
                      value={settings?.pixKey || ''}
                      onChange={e => setSettings({ ...settings, pixKey: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                      required
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      Exibida para a cliente copiar no momento do agendamento.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Nome do Titular da Conta PIX:
                    </label>
                    <input
                      type="text"
                      value={settings?.pixHolderName || ''}
                      onChange={e => setSettings({ ...settings, pixHolderName: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      WhatsApp para Receber Comprovantes e Agendamentos:
                    </label>
                    <input
                      type="text"
                      value={settings?.whatsappNumber || ''}
                      onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="48988679214"
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      Mensagem Explicativa do Sinal PIX (40%):
                    </label>
                    <textarea
                      rows={3}
                      value={settings?.pixExplanationText || ''}
                      onChange={e => setSettings({ ...settings, pixExplanationText: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                      placeholder="Mensagem explicando o adiantamento de 40%..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                      PIN de Acesso a este Painel (Senha):
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      value={settings?.adminPin || ''}
                      onChange={e => setSettings({ ...settings, adminPin: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                      required
                    />
                  </div>
                </div>

                {/* COLUNA 2: MODELOS DE MENSAGENS DO WHATSAPP */}
                <div className="lg:col-span-7 space-y-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="pb-2 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-stone-800 uppercase tracking-wider font-serif-brand flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#c082a0]" />
                        <span>Modelos de Mensagens do WhatsApp</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Você pode editar todo o texto. Clique nos botões para inserir as variáveis automáticas.
                      </p>
                    </div>
                  </div>

                  {/* 1. MENSAGEM DE SOLICITAÇÃO (ENVIADA PELA CLIENTE) */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-stone-50/70 border border-stone-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-stone-800 uppercase tracking-wider font-serif-brand">
                        1. Solicitação de Agendamento (Enviada pela Cliente com Comprovante)
                      </label>
                      <span className="text-[10px] text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                        Enviada ao concluir no site
                      </span>
                    </div>

                    {/* Chips de tags */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { tag: '{cliente}', label: 'Cliente' },
                        { tag: '{telefone}', label: 'Telefone' },
                        { tag: '{procedimentos}', label: 'Procedimentos' },
                        { tag: '{data}', label: 'Data' },
                        { tag: '{horario}', label: 'Horário' },
                        { tag: '{duracao}', label: 'Duração' },
                        { tag: '{valor_total}', label: 'Total' },
                        { tag: '{valor_sinal}', label: 'Sinal (40%)' },
                        { tag: '{chave_pix}', label: 'Chave PIX' },
                        { tag: '{observacoes}', label: 'Observações' },
                      ].map(t => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => insertTemplateTag('whatsappTemplateClientRequest', t.tag)}
                          className="text-[10px] bg-white border border-stone-200 hover:border-[#c082a0] text-stone-600 hover:text-[#87556e] px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer"
                          title={`Inserir ${t.tag}`}
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={6}
                      value={settings?.whatsappTemplateClientRequest || ''}
                      onChange={e => setSettings({ ...settings, whatsappTemplateClientRequest: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-[#c082a0] leading-relaxed"
                    />
                  </div>

                  {/* 2. MENSAGEM DE CONFIRMAÇÃO (ENVIADA PELA JÉSSICA) */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider font-serif-brand">
                        2. Confirmação / Horário Aceito (Enviada pela Jéssica)
                      </label>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
                        Botão "Aceitar no WhatsApp"
                      </span>
                    </div>

                    {/* Chips de tags */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { tag: '{cliente}', label: 'Cliente' },
                        { tag: '{procedimentos}', label: 'Procedimentos' },
                        { tag: '{data}', label: 'Data' },
                        { tag: '{horario}', label: 'Horário' },
                        { tag: '{duracao}', label: 'Duração' },
                        { tag: '{valor_sinal}', label: 'Sinal Recebido' },
                        { tag: '{valor_restante}', label: 'Restante' },
                      ].map(t => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => insertTemplateTag('whatsappTemplateAccept', t.tag)}
                          className="text-[10px] bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-900 px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer"
                          title={`Inserir ${t.tag}`}
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={6}
                      value={settings?.whatsappTemplateAccept || ''}
                      onChange={e => setSettings({ ...settings, whatsappTemplateAccept: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-[#c082a0] leading-relaxed"
                    />
                  </div>

                  {/* 3. MENSAGEM DE RECUSA / REAJUSTE DE HORÁRIO (ENVIADA PELA JÉSSICA) */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-rose-50/40 border border-rose-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider font-serif-brand">
                        3. Recusa / Reajuste de Horário (Enviada pela Jéssica)
                      </label>
                      <span className="text-[10px] text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-full font-medium">
                        Botão "Recusar / Reajustar"
                      </span>
                    </div>

                    {/* Chips de tags */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { tag: '{cliente}', label: 'Cliente' },
                        { tag: '{procedimentos}', label: 'Procedimentos' },
                        { tag: '{data}', label: 'Data' },
                        { tag: '{horario}', label: 'Horário' },
                      ].map(t => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => insertTemplateTag('whatsappTemplateReject', t.tag)}
                          className="text-[10px] bg-white border border-rose-200 hover:border-rose-400 text-rose-900 px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer"
                          title={`Inserir ${t.tag}`}
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={5}
                      value={settings?.whatsappTemplateReject || ''}
                      onChange={e => setSettings({ ...settings, whatsappTemplateReject: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-[#c082a0] leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* MODAL PARA REAGENDAMENTO */}
      {reschedulingApp && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setReschedulingApp(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-3"
          >
            <h4 className="font-serif-brand font-bold text-sm text-stone-900 uppercase">
              Reagendar Cliente: {reschedulingApp.clientName}
            </h4>
            <p className="text-xs text-stone-500">
              Escolha a nova data e horário para este atendimento:
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleConfirmReschedule(rescheduleDate, rescheduleTime);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Nova Data:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Novo Horário:</label>
                <CustomSelect
                  value={rescheduleTime}
                  onChange={val => setRescheduleTime(val)}
                  options={(settings?.defaultSlots || []).map(s => ({ value: s, label: `${s}h` }))}
                  placeholder="Selecione o novo horário..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApp(null)}
                  className="py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Confirmar Reagendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA AGENDAMENTO MANUAL */}
      {showNewAppModal && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowNewAppModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif-brand font-bold text-sm text-stone-900 uppercase">
                Marcar Cliente na Agenda
              </h4>
              <button 
                onClick={() => setShowNewAppModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Cadastre quando uma cliente solicitar o horário direto no WhatsApp para reservar na hora.
            </p>

            <form onSubmit={handleCreateManualApp} className="space-y-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Nome da Cliente: *</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={newAppClientName}
                  onChange={e => setNewAppClientName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">WhatsApp da Cliente:</label>
                <input
                  type="text"
                  placeholder="(48) 99999-9999"
                  value={newAppClientPhone}
                  onChange={e => setNewAppClientPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Procedimento: *</label>
                <CustomSelect
                  value={newAppServiceId}
                  onChange={val => setNewAppServiceId(val)}
                  options={(services || []).map(s => ({
                    value: s.id,
                    label: `${s.name} (${StorageService.formatCurrency(s.totalPrice)})`,
                    badge: StorageService.formatDuration(s.durationMinutes),
                  }))}
                  placeholder="Selecione o serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Data:</label>
                  <input
                    type="date"
                    value={presetModalDate}
                    onChange={e => setPresetModalDate(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-2xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#c082a0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Horário:</label>
                  <CustomSelect
                    value={presetModalTime}
                    onChange={val => setPresetModalTime(val)}
                    options={(settings?.defaultSlots || []).map(s => ({
                      value: s,
                      label: `${s}h`,
                    }))}
                    placeholder="Selecione o horário..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Observações:</label>
                <input
                  type="text"
                  placeholder="Informações adicionais..."
                  value={newAppNotes}
                  onChange={e => setNewAppNotes(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAppModal(false)}
                  className="py-1.5 px-3 rounded-xl border border-stone-200 text-xs text-stone-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-xl bg-[#c082a0] text-white text-xs font-semibold cursor-pointer"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
