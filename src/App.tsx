/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, Lock, Calendar, GraduationCap } from 'lucide-react';
import profilePic from './image/profile.jpeg';
import { BookingModal } from './components/BookingModal';
import { AdminPanel } from './components/AdminPanel';
import { CoursesModal } from './components/CoursesModal';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState<boolean>(false);

  // Links configurados conforme solicitado
  const WHATSAPP_PHONE = '48988679214';
  const WHATSAPP_LINK = `https://wa.me/55${WHATSAPP_PHONE}?text=${encodeURIComponent(
    'Olá, Jéssica! Gostaria de informações sobre agendamentos e cursos de beleza.'
  )}`;
  const INSTAGRAM_LINK = 'https://www.instagram.com/jesskleinowski.beauty?rpxt=cmUyNWRjNWhmdGd5&utm_source=qr';
  const TIKTOK_LINK = 'https://www.tiktok.com/@jesskleinowskibeauty'; 

  return (
    <div className="min-h-screen bg-[#fcfbfb] text-[#1c1917] flex flex-col justify-between items-center selection:bg-[#faeef2] selection:text-[#c082a0] antialiased">
      {/* Botão de acesso rápido ao painel administrativo (discreto no topo) */}
      <div className="w-full max-w-sm sm:max-w-md px-5 pt-4 flex justify-end">
        <button
          onClick={() => setIsAdminOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#faeef2] text-stone-400 hover:text-[#c082a0] text-[11px] font-medium transition-all border border-stone-200/80 cursor-pointer"
          title="Acesso Jéssica · Painel de Horários e Agenda"
        >
          <Lock className="w-3 h-3" />
          <span>Painel Jéssica</span>
        </button>
      </div>

      {/* Container Principal Centralizado (Layout idêntico ao print) */}
      <main className="w-full max-w-sm sm:max-w-md px-5 pt-4 pb-8 flex flex-col items-center flex-1">
        
        {/* Foto de Perfil com o Badge de Estrela no canto */}
        <div className="relative mb-5">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-sm border border-[#ede5e9] bg-white">
            <img
              src={profilePic}
              alt="Jéssica Kleinowski"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_42%] rounded-full"
            />
          </div>

          {/* Badge circular branco com estrela rosa/malva no canto inferior direito */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md border border-[#f3ebef] flex items-center justify-center text-[#c082a0]">
            <svg 
              className="w-4 h-4 fill-[#c082a0]" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
              <circle cx="19" cy="5" r="1.5" />
            </svg>
          </div>
        </div>

        {/* Nome do Perfil em Serif Didone de Alto Contraste */}
        <h1 className="font-serif-brand font-bold text-2xl sm:text-[28px] tracking-[0.16em] text-[#1c1917] text-center uppercase mb-6">
          Jéssica Kleinowski
        </h1>

        {/* Lista de Botões com o design, paleta e espaçamento idênticos ao print */}
        <div className="w-full space-y-3.5">
          
          {/* 1. AGENDAR HORÁRIO (Abre a agenda online embutida) */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className="group relative flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] text-white shadow-[0_4px_16px_rgba(192,130,160,0.28)] transition-all duration-200 cursor-pointer"
          >
            {/* Ícone de Estrela/Brilho à esquerda */}
            <div className="w-5 h-5 flex items-center justify-center text-white shrink-0">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
              </svg>
            </div>

            {/* Texto Centralizado */}
            <span className="font-serif-brand font-bold text-xs sm:text-[13px] tracking-[0.18em] uppercase text-white flex-1 text-center pr-2 pl-2">
              AGENDAR HORÁRIO
            </span>

            {/* Ícone de Agenda / Seta */}
            <Calendar className="w-4 h-4 text-white/90 group-hover:scale-110 shrink-0 transition-transform" />
          </button>

          {/* CURSOS (Extensão de Cílios, Brow Lamination, Lash Lifting) */}
          <button
            onClick={() => setIsCoursesOpen(true)}
            className="group relative flex items-center justify-between w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-white hover:bg-[#fdfbfc] border border-[#f2edf0] hover:border-[#e6d6de] shadow-[0_2px_10px_rgba(0,0,0,0.025)] hover:shadow-[0_4px_14px_rgba(192,130,160,0.08)] active:scale-[0.99] transition-all duration-200 cursor-pointer text-left"
          >
            {/* Ícone de Chapéu de Graduação */}
            <div className="w-5 h-5 flex items-center justify-center text-[#c082a0] shrink-0">
              <GraduationCap className="w-4 h-4 stroke-[#c082a0]" />
            </div>

            {/* Texto Centralizado */}
            <span className="font-serif-brand font-bold text-xs sm:text-[13px] tracking-[0.18em] uppercase text-[#1c1917] flex-1 text-center pr-2 pl-2">
              CURSOS
            </span>

            {/* Ícone de Seta/Acesso */}
            <ExternalLink className="w-4 h-4 text-[#d1a3b8] group-hover:text-[#c082a0] shrink-0 transition-colors" strokeWidth={1.75} />
          </button>

          {/* 2. WHATSAPP (Card Branco com ícone malva) */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-white hover:bg-[#fdfbfc] border border-[#f2edf0] hover:border-[#e6d6de] shadow-[0_2px_10px_rgba(0,0,0,0.025)] hover:shadow-[0_4px_14px_rgba(192,130,160,0.08)] active:scale-[0.99] transition-all duration-200"
          >
            {/* Ícone do WhatsApp */}
            <div className="w-5 h-5 flex items-center justify-center text-[#c082a0] shrink-0">
              <svg className="w-4 h-4 stroke-[#c082a0] fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>

            {/* Texto do Botão */}
            <span className="font-serif-brand font-bold text-xs sm:text-[13px] tracking-[0.18em] uppercase text-[#1c1917] flex-1 text-center pr-2 pl-2">
              WHATSAPP
            </span>

            {/* Ícone de Link Externo */}
            <ExternalLink className="w-4 h-4 text-[#d1a3b8] group-hover:text-[#c082a0] shrink-0 transition-colors" strokeWidth={1.75} />
          </a>

          {/* 3. INSTAGRAM (Card Branco com ícone malva) */}
          <a
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-white hover:bg-[#fdfbfc] border border-[#f2edf0] hover:border-[#e6d6de] shadow-[0_2px_10px_rgba(0,0,0,0.025)] hover:shadow-[0_4px_14px_rgba(192,130,160,0.08)] active:scale-[0.99] transition-all duration-200"
          >
            {/* Ícone do Instagram */}
            <div className="w-5 h-5 flex items-center justify-center text-[#c082a0] shrink-0">
              <svg className="w-4 h-4 stroke-[#c082a0] fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>

            {/* Texto do Botão */}
            <span className="font-serif-brand font-bold text-xs sm:text-[13px] tracking-[0.18em] uppercase text-[#1c1917] flex-1 text-center pr-2 pl-2">
              INSTAGRAM
            </span>

            {/* Ícone de Link Externo */}
            <ExternalLink className="w-4 h-4 text-[#d1a3b8] group-hover:text-[#c082a0] shrink-0 transition-colors" strokeWidth={1.75} />
          </a>

          {/* 4. TIKTOK */}
          <a
            href={TIKTOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-white hover:bg-[#fdfbfc] border border-[#f2edf0] hover:border-[#e6d6de] shadow-[0_2px_10px_rgba(0,0,0,0.025)] hover:shadow-[0_4px_14px_rgba(192,130,160,0.08)] active:scale-[0.99] transition-all duration-200"
          >
            <div className="w-5 h-5 flex items-center justify-center text-[#c082a0] shrink-0">
              <svg className="w-4 h-4 fill-[#c082a0]" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.8a8.3 8.3 0 0 0 4.9 1.58V6.93a4.8 4.8 0 0 1-1.01-.24z"/>
              </svg>
            </div>

            <span className="font-serif-brand font-bold text-xs sm:text-[13px] tracking-[0.18em] uppercase text-[#1c1917] flex-1 text-center pr-2 pl-2">
              TIKTOK
            </span>

            <ExternalLink className="w-4 h-4 text-[#d1a3b8] group-hover:text-[#c082a0] shrink-0 transition-colors" strokeWidth={1.75} />
          </a>

        </div>
      </main>

      {/* Rodapé sutil com link de gestão da Jéssica */}
      <footer className="w-full max-w-sm sm:max-w-md px-5 py-6 text-center text-xs text-stone-400">
        <button
          onClick={() => setIsAdminOpen(true)}
          className="text-[11px] text-stone-400 hover:text-[#c082a0] transition-colors underline cursor-pointer"
        >
          Área de Gestão da Jéssica (Horários & Agenda)
        </button>
      </footer>

      {/* MODAL DE AGENDAMENTO DA CLIENTE */}
      {isBookingOpen && (
        <BookingModal 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}

      {/* MODAL DO PAINEL ADMINISTRATIVO DA JÉSSICA */}
      {isAdminOpen && (
        <AdminPanel 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* MODAL DE CURSOS PROFISSIONALIZANTES */}
      {isCoursesOpen && (
        <CoursesModal 
          isOpen={isCoursesOpen}
          onClose={() => setIsCoursesOpen(false)}
        />
      )}
    </div>
  );
}
