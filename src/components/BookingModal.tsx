/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  ChevronLeft,
  ChevronDown,
  Plus,
  Trash2,
  Layers,
  Send
} from 'lucide-react';
import { Service, ServiceCategory, SERVICE_CATEGORIES, ScheduleSettings, SelectedServiceItem } from '../types';
import { StorageService } from '../services/storage';
import { DEFAULT_WHATSAPP_TEMPLATES } from '../data/initialData';
import { CustomSelect } from './CustomSelect';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onBookingComplete }) => {
  // Configurações e Serviços
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings>(() => StorageService.getSettings());

  // Navegação do Fluxo em 4 Etapas
  // 1: Procedimentos (Categoria + Serviço na mesma tela)
  // 2: Data e Horário
  // 3: Preencher Dados
  // 4: PIX (Sinal 40%) & Solicitar Confirmação
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Estados da Seleção da Etapa 1
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
  const [selectedServiceIdForCurrentCat, setSelectedServiceIdForCurrentCat] = useState<string>('');
  
  // Lista dos Procedimentos Escolhidos (+ de 1 serviço)
  const [selectedServicesList, setSelectedServicesList] = useState<SelectedServiceItem[]>([]);

  // Data e Horário (Etapa 2)
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Dados da Cliente (Etapa 3)
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');

  // Status de cópia e finalização (Etapa 4)
  const [copiedPix, setCopiedPix] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [lastBookingWhatsAppUrl, setLastBookingWhatsAppUrl] = useState<string>('');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 3500);
  };

  // Carregar dados ao abrir
  useEffect(() => {
    if (isOpen) {
      const active = StorageService.getServices().filter(s => s.isActive);
      setAllServices(active);
      const curSettings = StorageService.getSettings();
      setSettings(curSettings);

      // Resetar para a etapa 1
      setCurrentStep(1);
      setIsFinished(false);
      setSelectedServicesList([]);
      setSelectedCategory('');
      setSelectedServiceIdForCurrentCat('');
    }
  }, [isOpen]);

  // Serviços da categoria atualmente selecionada
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    return allServices.filter(s => s.category === selectedCategory);
  }, [allServices, selectedCategory]);

  const categoryOptions = useMemo(() => {
    return SERVICE_CATEGORIES.map(cat => ({
      value: cat,
      label: cat,
    }));
  }, []);

  const serviceOptions = useMemo(() => {
    return categoryServices.map(service => ({
      value: service.id,
      label: `${service.name} — ${StorageService.formatCurrency(service.totalPrice)}`,
      description: service.description,
      badge: StorageService.formatDuration(service.durationMinutes),
    }));
  }, [categoryServices]);

  // Atualizar serviço padrão ao trocar de categoria
  useEffect(() => {
    if (categoryServices.length > 0) {
      setSelectedServiceIdForCurrentCat(categoryServices[0].id);
    } else {
      setSelectedServiceIdForCurrentCat('');
    }
  }, [selectedCategory, categoryServices]);

  // Recalcular horários disponíveis
  useEffect(() => {
    if (selectedDate) {
      const slots = StorageService.getAvailableSlots(selectedDate);
      setAvailableSlots(slots);
      if (!slots.includes(selectedTime)) {
        setSelectedTime('');
      }
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedDate]);

  // Cálculos de totais
  const totalPrice = useMemo(() => {
    return selectedServicesList.reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedServicesList]);

  const totalDuration = useMemo(() => {
    return selectedServicesList.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [selectedServicesList]);

  // Valor do Sinal: 40% do valor total
  const depositAmount = useMemo(() => {
    return StorageService.calculateDeposit(totalPrice);
  }, [totalPrice]);

  if (!isOpen) return null;

  // Ação: Adicionar serviço atual à lista e resetar seleção para permitir adicionar mais
  const handleAddServiceToCart = () => {
    const srv = categoryServices.find(s => s.id === selectedServiceIdForCurrentCat);
    if (!srv) return;

    // Evitar duplicar exatamente o mesmo serviço se já estiver
    if (selectedServicesList.some(item => item.serviceId === srv.id)) {
      showBanner('Este procedimento já foi adicionado ao seu agendamento.');
      return;
    }

    const newItem: SelectedServiceItem = {
      serviceId: srv.id,
      serviceName: srv.name,
      category: srv.category,
      price: srv.totalPrice,
      durationMinutes: srv.durationMinutes,
    };

    setSelectedServicesList(prev => [...prev, newItem]);
    // Resetar campos da etapa 1 mantendo a lista fixa abaixo conforme solicitado
    setSelectedCategory('');
    setSelectedServiceIdForCurrentCat('');
  };

  const handleRemoveServiceFromCart = (serviceId: string) => {
    setSelectedServicesList(prev => prev.filter(item => item.serviceId !== serviceId));
  };

  // Avançar da Etapa 1 para Etapa 2
  const handleProceedFromStep1 = () => {
    // Se o usuário selecionou uma categoria e serviço mas ainda não clicou em "Adicionar", adiciona automaticamente
    if (selectedCategory && selectedServiceIdForCurrentCat) {
      const srv = categoryServices.find(s => s.id === selectedServiceIdForCurrentCat);
      if (srv && !selectedServicesList.some(item => item.serviceId === srv.id)) {
        const newItem: SelectedServiceItem = {
          serviceId: srv.id,
          serviceName: srv.name,
          category: srv.category,
          price: srv.totalPrice,
          durationMinutes: srv.durationMinutes,
        };
        setSelectedServicesList(prev => [...prev, newItem]);
        setSelectedCategory('');
        setSelectedServiceIdForCurrentCat('');
        setCurrentStep(2);
        return;
      }
    }

    if (selectedServicesList.length > 0) {
      setCurrentStep(2);
    } else {
      showBanner('Por favor, selecione uma categoria e procedimento para continuar.');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setClientPhone(val);
  };

  // Envio Final da Solicitação de Agendamento
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServicesList.length === 0) {
      showBanner('Por favor, adicione pelo menos um procedimento ao agendamento.');
      setCurrentStep(1);
      return;
    }

    if (!selectedDate || !selectedTime || !clientName.trim() || !clientPhone.trim()) {
      showBanner('Por favor, complete a data, horário e seus dados de contato.');
      return;
    }

    const servicesSummary = selectedServicesList.map(s => s.serviceName).join(' + ');
    const primaryServiceId = selectedServicesList[0].serviceId;

    // Salvar na agenda com status pendente de sinal e de confirmação pela Jéssica
    StorageService.addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      serviceId: primaryServiceId,
      serviceName: servicesSummary,
      selectedServices: selectedServicesList,
      totalDurationMinutes: totalDuration,
      date: selectedDate,
      timeSlot: selectedTime,
      totalPrice: totalPrice,
      depositAmount: depositAmount,
      status: 'pendente_sinal',
    });

    // Mensagem automática gerada a partir do modelo configurado no painel da Jéssica
    const template = settings.whatsappTemplateClientRequest || DEFAULT_WHATSAPP_TEMPLATES.clientRequest;
    const msg = StorageService.renderWhatsAppTemplate(template, {
      cliente: clientName.trim(),
      telefone: clientPhone.trim(),
      procedimentos: servicesSummary,
      duracao: StorageService.formatDuration(totalDuration),
      data: StorageService.formatDateBR(selectedDate),
      horario: `${selectedTime}h`,
      valor_total: StorageService.formatCurrency(totalPrice),
      valor_sinal: StorageService.formatCurrency(depositAmount),
      valor_restante: StorageService.formatCurrency(totalPrice - depositAmount),
      chave_pix: settings.pixKey,
      observacoes: clientNotes.trim() ? `📝 *Observações:* ${clientNotes.trim()}\n` : '',
    });

    const whatsappUrl = `https://wa.me/55${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    setLastBookingWhatsAppUrl(whatsappUrl);
    setIsFinished(true);

    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#fcfbfb] rounded-2xl border border-[#ede5e9] shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Cabeçalho com o subtítulo 'Beauty' conforme solicitado */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f0e7eb] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#faeef2] border border-[#f0dbe5] text-[#c082a0] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-[#c082a0]" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-base sm:text-lg text-[#1c1917] tracking-wider uppercase leading-tight">
                Agendamento Online
              </h2>
              <p className="text-[11px] text-stone-500 font-sans">
                Jéssica Kleinowski · <span className="font-semibold text-[#c082a0]">Beauty</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador das 4 Etapas (1 a 4) */}
        {!isFinished && (
          <div className="shrink-0 px-5 sm:px-6 pt-3 pb-2 bg-white border-b border-[#f0e7eb]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#87556e] font-serif-brand uppercase tracking-wider">
                Etapa {currentStep} de 4: {
                  currentStep === 1 ? 'Procedimentos' :
                  currentStep === 2 ? 'Data & Horário' :
                  currentStep === 3 ? 'Seus Dados' : 'Pagamento do Sinal PIX'
                }
              </span>
              {selectedServicesList.length > 0 && (
                <span className="text-[10px] bg-[#faeef2] text-[#c082a0] border border-[#f0dbe5] px-2 py-0.5 rounded-full font-medium">
                  {selectedServicesList.length} {selectedServicesList.length === 1 ? 'item' : 'itens'} ({StorageService.formatCurrency(totalPrice)})
                </span>
              )}
            </div>

            {/* Barra de Progresso Suave */}
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-[#c082a0] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Mensagem de Aviso / Validação Suave */}
        {bannerMessage && (
          <div className="mx-4 mt-3 mb-1 p-3 rounded-2xl bg-[#faeef2] border border-[#f0dbe5] text-[#87556e] text-xs text-center font-medium shadow-xs animate-in fade-in slide-in-from-top-1">
            {bannerMessage}
          </div>
        )}

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ============================================================== */}
          {/* TELA DE SUCESSO / SOLICITAÇÃO REALIZADA                        */}
          {/* ============================================================== */}
          {isFinished ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-serif-brand font-bold text-xl text-[#1c1917] tracking-wider uppercase">
                  Solicitação Enviada!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  O seu pedido de agendamento foi registrado e está sendo <strong>analisado pela Jéssica</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faeef2]/80 border border-[#f0dbe5] text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-stone-500">Cliente:</span>
                  <span className="font-semibold text-stone-800">{clientName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Procedimento(s):</span>
                  <span className="font-semibold text-stone-800 block text-[11px] mt-0.5">
                    {selectedServicesList.map(s => s.serviceName).join(' + ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Data e Horário:</span>
                  <span className="font-semibold text-stone-800">
                    {StorageService.formatDateBR(selectedDate)} às {selectedTime}h
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#f0dbe5]">
                  <span className="text-[#87556e] font-semibold">Valor Total:</span>
                  <span className="font-bold text-stone-800">
                    {StorageService.formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#87556e] font-semibold">Sinal (40%):</span>
                  <span className="font-bold text-[#c082a0] text-sm">
                    {StorageService.formatCurrency(depositAmount)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] text-left leading-relaxed max-w-sm mx-auto flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> Toque no botão abaixo para abrir a conversa no WhatsApp com a Jéssica e anexar o comprovante do PIX. Assim que verificado, ela confirmará o horário!
                </span>
              </div>

              <div className="space-y-2 pt-2 max-w-sm mx-auto">
                <a
                  href={lastBookingWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-serif-brand font-bold text-xs sm:text-[13px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* ETAPA 1: PROCEDIMENTOS (CATEGORIA + SERVIÇO NA MESMA TELA)      */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200 py-1">
                  <div>
                    <h3 className="font-serif-brand font-bold text-base text-stone-900 uppercase">
                      1. Escolha os Procedimentos
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Selecione a categoria e o serviço desejado. Você pode acrescentar mais de um procedimento!
                    </p>
                  </div>

                  {/* 1. COMBOBOX DE CATEGORIA (BORDAS ARREDONDADAS FECHADA E ABERTA) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider font-serif-brand">
                      Categoria do Atendimento:
                    </label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={val => setSelectedCategory(val as ServiceCategory)}
                      options={categoryOptions}
                      placeholder="Selecione uma categoria..."
                    />
                  </div>

                  {/* 2. COMBOBOX DO SERVIÇO (APARECE LOGO ABAIXO DA CATEGORIA APÓS ESCOLHIDA) */}
                  {selectedCategory && (
                    <div className="space-y-3 p-4 rounded-2xl bg-[#faeef2]/40 border border-[#f0dbe5] animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#87556e] uppercase tracking-wider font-serif-brand">
                          Procedimento em {selectedCategory}:
                        </label>
                        <CustomSelect
                          value={selectedServiceIdForCurrentCat}
                          onChange={val => setSelectedServiceIdForCurrentCat(val)}
                          options={serviceOptions}
                          placeholder="Selecione o procedimento..."
                        />

                        {/* Descrição breve se houver */}
                        {categoryServices.find(s => s.id === selectedServiceIdForCurrentCat)?.description && (
                          <p className="text-[11px] text-stone-500 italic pl-1">
                            {categoryServices.find(s => s.id === selectedServiceIdForCurrentCat)?.description}
                          </p>
                        )}
                      </div>

                      {/* Botão de Adicionar à lista */}
                      <button
                        type="button"
                        onClick={handleAddServiceToCart}
                        className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-[#faeef2] border border-[#e0c4d2] text-[#87556e] font-serif-brand font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                      >
                        <Plus className="w-4 h-4 text-[#c082a0]" />
                        <span>+ Adicionar este Procedimento</span>
                      </button>
                    </div>
                  )}

                  {/* 3. PROCEDIMENTOS ESCOLHIDOS (FIXADOS ABAIXO) */}
                  <div className="space-y-2 pt-2 border-t border-[#f0e7eb]">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider font-serif-brand">
                      <span>Procedimentos Escolhidos:</span>
                      <span className="text-[11px] text-[#c082a0] font-normal">
                        {selectedServicesList.length} adicionado(s)
                      </span>
                    </div>

                    {selectedServicesList.length > 0 ? (
                      <div className="space-y-2">
                        {selectedServicesList.map(item => (
                          <div 
                            key={item.serviceId}
                            className="p-3 rounded-2xl bg-white border border-[#ece2e7] flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div>
                              <span className="text-[9px] uppercase font-bold text-[#c082a0] block font-serif-brand">
                                {item.category}
                              </span>
                              <span className="font-semibold text-xs text-stone-800 block">
                                {item.serviceName}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {StorageService.formatCurrency(item.price)} · {StorageService.formatDuration(item.durationMinutes)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveServiceFromCart(item.serviceId)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remover procedimento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Totalizador acumulado */}
                        <div className="p-3 rounded-2xl bg-[#faeef2]/80 border border-[#f0dbe5] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-serif-brand font-bold text-[#87556e] block uppercase">
                              Total Acumulado:
                            </span>
                            <span className="text-[10px] text-stone-500">
                              Duração estimada: {StorageService.formatDuration(totalDuration)}
                            </span>
                          </div>
                          <span className="font-serif-brand font-bold text-base text-[#c082a0]">
                            {StorageService.formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-500">
                        {selectedCategory 
                          ? 'Clique em "+ Adicionar este Procedimento" acima para confirmar a escolha.'
                          : 'Selecione uma categoria acima para começar a adicionar procedimentos.'}
                      </div>
                    )}
                  </div>

                  {/* 4. BOTÃO PARA AVANÇAR PARA DATA E HORÁRIO */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={selectedServicesList.length === 0 && !selectedCategory}
                      onClick={handleProceedFromStep1}
                      className={`w-full py-3.5 px-4 rounded-2xl font-serif-brand font-bold text-xs sm:text-[13px] tracking-wider uppercase text-white transition-all flex items-center justify-center gap-2 ${
                        selectedServicesList.length === 0 && !selectedCategory
                          ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                          : 'bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] cursor-pointer shadow-[0_4px_16px_rgba(192,130,160,0.3)]'
                      }`}
                    >
                      <span>Avançar para Data & Horário</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ETAPA 2: DATA E HORÁRIO                                        */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-stone-900 uppercase">
                        2. Escolha a Data e Horário
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Duração total estimada: <strong>{StorageService.formatDuration(totalDuration)}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#c082a0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Voltar aos Procedimentos</span>
                    </button>
                  </div>

                  {/* Seletor de Data com borda interna arredondada */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-serif-brand">
                      Data do Atendimento:
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full py-3 px-3.5 rounded-2xl bg-white border border-[#e8dfe4] text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c082a0]/40 focus:border-[#c082a0] transition-all shadow-xs cursor-pointer font-sans"
                      required
                    />
                  </div>

                  {/* Chips de Horários Disponíveis */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-serif-brand">
                      Horários Livres na Agenda:
                    </label>

                    {availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(slot => {
                          const isSelected = selectedTime === slot;
                          return (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2 px-3.5 rounded-2xl text-xs font-mono font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#c082a0] text-white border-[#c082a0] shadow-sm scale-102 ring-2 ring-[#c082a0]/30'
                                  : 'bg-white text-stone-700 border-[#e8dfe4] hover:border-[#c082a0]/60 hover:bg-[#faeef2]/40'
                              }`}
                            >
                              {slot}h
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 px-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                        Nenhum horário livre encontrado para esta data. Por favor selecione outro dia.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="py-3 px-4 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Voltar
                    </button>

                    <button
                      type="button"
                      disabled={!selectedTime}
                      onClick={() => setCurrentStep(3)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-serif-brand font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 ${
                        !selectedTime
                          ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                          : 'bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] cursor-pointer shadow-[0_4px_16px_rgba(192,130,160,0.3)]'
                      }`}
                    >
                      <span>Avançar para Seus Dados</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ETAPA 3: PREENCHER DADOS                                       */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-stone-900 uppercase">
                        3. Preencha seus Dados de Contato
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Usaremos para confirmar seu horário com a Jéssica.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#c082a0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                        Nome Completo: *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Ex: Maria Eduarda Silva"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          className="w-full py-3 pl-10 pr-3.5 rounded-2xl bg-white border border-[#e8dfe4] text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c082a0]/40 focus:border-[#c082a0] transition-all shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                        WhatsApp para Contato: *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="(48) 99999-9999"
                          value={clientPhone}
                          onChange={handlePhoneChange}
                          className="w-full py-3 pl-10 pr-3.5 rounded-2xl bg-white border border-[#e8dfe4] text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#c082a0]/40 focus:border-[#c082a0] transition-all shadow-xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1 font-serif-brand">
                        Observações ou Dúvidas (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Primeira vez fazendo extensão, retirar cílios anteriores..."
                        value={clientNotes}
                        onChange={e => setClientNotes(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-2xl bg-white border border-[#e8dfe4] text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#c082a0]/40 focus:border-[#c082a0] transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3 px-4 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Voltar
                    </button>

                    <button
                      type="button"
                      disabled={!clientName.trim() || clientPhone.replace(/\D/g, '').length < 10}
                      onClick={() => setCurrentStep(4)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-serif-brand font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 ${
                        !clientName.trim() || clientPhone.replace(/\D/g, '').length < 10
                          ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                          : 'bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] cursor-pointer shadow-[0_4px_16px_rgba(192,130,160,0.3)]'
                      }`}
                    >
                      <span>Avançar para Pagamento do Sinal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ETAPA 4: PIX & SOLICITAR CONFIRMAÇÃO (SINAL 40%)               */}
              {/* ============================================================== */}
              {currentStep === 4 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-brand font-bold text-base text-stone-900 uppercase">
                        4. Confirmação & Sinal de Reserva (40%)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        O agendamento será analisado e confirmado pela Jéssica.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-[#c082a0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  </div>

                  {/* Card de Resumo de Valores */}
                  <div className="p-4 rounded-2xl bg-white border border-[#ede5e9] space-y-2.5 shadow-xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Valor Total dos Procedimentos:</span>
                      <span className="font-semibold text-stone-900">{StorageService.formatCurrency(totalPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                      <div>
                        <span className="text-xs font-serif-brand font-bold uppercase tracking-wider text-[#87556e] block">
                          Valor do Sinal de Reserva (40%):
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Abatido do total no dia do atendimento
                        </span>
                      </div>
                      <span className="text-xl font-serif-brand font-bold text-[#c082a0]">
                        {StorageService.formatCurrency(depositAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Mensagem Explicativa solicitada pelo usuário */}
                  <div className="p-3.5 rounded-2xl bg-[#faeef2]/80 border border-[#f0dbe5] text-xs text-[#87556e] leading-relaxed space-y-1">
                    <strong className="block font-serif-brand text-[11px] uppercase tracking-wider">
                      ℹ️ Como funciona a reserva com sinal:
                    </strong>
                    <p className="text-[11px] text-stone-600">
                      {settings.pixExplanationText || 'Para confirmar e reservar seu horário com segurança em nossa agenda, solicitamos um adiantamento de 40% do valor total do procedimento via PIX. Esse valor é abatido integralmente no dia do seu atendimento!'}
                    </p>
                  </div>

                  {/* Informação e Cópia da Chave PIX */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-serif-brand block">
                        Chave PIX da Jéssica:
                      </span>
                      <div className="font-mono text-sm font-bold text-stone-900 tracking-wider">
                        {settings.pixKey}
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        Titular: {settings.pixHolderName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-[#e0c4d2] hover:bg-[#fcf7f9] text-[#c082a0] text-xs font-semibold transition-all shadow-xs cursor-pointer self-start sm:self-center"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Chave Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Chave PIX</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Botão Final: "Solicitar Confirmação" */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 px-4 rounded-2xl bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] text-white font-serif-brand font-bold text-xs sm:text-[13px] tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(192,130,160,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Solicitar Confirmação</span>
                    </button>

                    <p className="text-[10px] text-stone-400 text-center mt-2">
                      * Ao solicitar, você será direcionada para enviar o comprovante no WhatsApp da Jéssica para validação do horário.
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
