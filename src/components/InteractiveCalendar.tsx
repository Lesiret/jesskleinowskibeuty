/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, ScheduleSettings } from '../types';

interface InteractiveCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  appointments?: Appointment[];
  settings?: ScheduleSettings;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  selectedDate,
  onSelectDate,
  appointments = [],
  settings = {
    workingDays: [1, 2, 3, 4, 5, 6],
    defaultSlots: ['08:30', '10:30', '13:30', '15:30', '17:30'],
    blockedDates: [],
    pixKey: '04947299029',
    pixKeyType: 'Chave CPF',
    pixHolderName: 'Jéssica Kleinowski',
    adminPin: '1234',
    whatsappNumber: '48988679214',
  },
}) => {
  // Inicializar ano e mês de forma segura
  const now = new Date();
  let initYear = now.getFullYear();
  let initMonth = now.getMonth();

  if (selectedDate && typeof selectedDate === 'string' && selectedDate.includes('-')) {
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      initYear = parts[0];
      initMonth = parts[1] - 1;
    }
  }

  const [currentYear, setCurrentYear] = useState<number>(initYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if (onSelectDate) {
      onSelectDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  // Calcular dias do mês
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 a 6
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Dias do mês anterior para preencher a primeira semana
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Dias do mês anterior
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Dias do próximo mês para completar semanas inteiras
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeBlockedDates = Array.isArray(settings?.blockedDates) ? settings.blockedDates : [];
  const safeWorkingDays = Array.isArray(settings?.workingDays) ? settings.workingDays : [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm">
      {/* Cabeçalho do Calendário */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div>
          <h3 className="font-serif-brand font-bold text-base sm:text-lg text-stone-900 uppercase tracking-wide">
            {MONTH_NAMES[currentMonth] || ''} {currentYear}
          </h3>
          <p className="text-[11px] text-stone-500 font-sans">
            Toque em um dia para ver os horários marcados e livres
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGoToday}
            className="py-1 px-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[11px] font-medium text-stone-600 transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-[1px] h-4 bg-stone-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dias da Semana (Dom, Seg, Ter...) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {WEEK_DAYS_SHORT.map((wd, i) => (
          <div 
            key={wd} 
            className={`text-[11px] font-semibold uppercase tracking-wider py-1 ${
              i === 0 ? 'text-stone-400' : 'text-stone-600'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Grade dos Dias */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;

          // Agendamentos ativos neste dia
          const dayAppointments = safeAppointments.filter(
            a => a && a.date === item.dateStr && a.status !== 'cancelado'
          );
          const count = dayAppointments.length;

          // Verificar se é dia bloqueado ou dia sem atendimento
          const isBlocked = safeBlockedDates.includes(item.dateStr);
          const parts = item.dateStr.split('-').map(Number);
          const dayOfWeek = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
          const isWorkingDay = safeWorkingDays.includes(dayOfWeek);

          const isOffDay = isBlocked || !isWorkingDay;

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectDate && onSelectDate(item.dateStr)}
              className={`min-h-[58px] sm:min-h-[64px] p-1 sm:p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                !item.isCurrentMonth
                  ? 'opacity-35 bg-stone-50/50 border-stone-100'
                  : isSelected
                  ? 'bg-[#faeef2] border-[#c082a0] ring-2 ring-[#c082a0]/30 shadow-sm'
                  : isToday
                  ? 'bg-amber-50/60 border-amber-300'
                  : isOffDay
                  ? 'bg-stone-50 border-stone-100 hover:border-stone-200'
                  : 'bg-white border-stone-100 hover:border-[#c082a0]/50 hover:bg-[#faeef2]/20'
              }`}
            >
              {/* Número do Dia e Marcador de Hoje */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${
                  isSelected ? 'text-[#c082a0] font-bold' : isToday ? 'text-amber-800' : 'text-stone-700'
                }`}>
                  {item.dayNumber}
                </span>

                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Hoje" />
                )}
              </div>

              {/* Informações Visuais do Dia */}
              <div className="mt-1">
                {isOffDay ? (
                  <span className="text-[9px] text-stone-400 block leading-tight font-sans">
                    Folga
                  </span>
                ) : count > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#c082a0] shrink-0" />
                    <span className="text-[10px] font-semibold text-[#87556e] font-sans truncate">
                      {count} {count === 1 ? 'hora' : 'horas'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] text-emerald-600 block leading-tight font-sans">
                    Livre
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-stone-100 text-[10px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c082a0]" />
          <span>Com cliente agendada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Dia com horários livres</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-300" />
          <span>Folga / Bloqueado</span>
        </div>
      </div>
    </div>
  );
};
