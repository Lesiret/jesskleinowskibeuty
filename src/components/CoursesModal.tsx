/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, GraduationCap, Sparkles, Check, ArrowRight, Clock, Award, BookOpen } from 'lucide-react';
import { StorageService } from '../services/storage';

interface CoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoursesModal: React.FC<CoursesModalProps> = ({ isOpen, onClose }) => {
  const courses = StorageService.getCourses();
  const settings = StorageService.getSettings();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const getWhatsAppCourseUrl = (courseTitle: string) => {
    const msg = `Olá, Jéssica! Gostaria de receber mais informações e valores sobre o curso profissionalizante de *${courseTitle}*.`;
    return `https://wa.me/55${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#fcfbfb] rounded-2xl border border-[#ede5e9] shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#f0e7eb] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#faeef2] border border-[#f0dbe5] text-[#c082a0] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-brand font-bold text-base sm:text-lg text-[#1c1917] tracking-wider uppercase">
                Cursos Profissionalizantes
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVEGAÇÃO MOBILE (< sm) - 3 Abas Visíveis Simultaneamente sem Barra de Rolagem */}
        <div className="sm:hidden grid grid-cols-3 p-1.5 bg-stone-100/90 border-b border-stone-200 gap-1 shrink-0">
          {courses.map(course => {
            const isSelected = course.id === currentCourse.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#c082a0] shadow-xs font-bold border border-[#f0dbe5]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 mb-0.5 ${isSelected ? 'fill-[#c082a0]' : ''}`} />
                <span className="text-[10px] leading-tight font-serif-brand uppercase tracking-wider text-center">
                  {course.title.replace('EXTENSÃO DE ', '').trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* NAVEGAÇÃO DESKTOP & TABLETS (>= sm) - Abas Completas */}
        <div className="hidden sm:flex border-b border-[#f0e7eb] bg-stone-50 px-4 sm:px-6 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          {courses.map(course => {
            const isSelected = course.id === currentCourse.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`py-3 px-3.5 text-xs font-semibold tracking-wider uppercase transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#c082a0] text-[#c082a0] bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'fill-[#c082a0]' : ''}`} />
                <span>{course.title}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo do Curso Selecionado */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          <div>
            <h3 className="font-serif-brand font-bold text-xl sm:text-2xl text-stone-900 mt-0.5">
              {currentCourse.title}
            </h3>
            {currentCourse.subtitle ? (
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {currentCourse.subtitle}
              </p>
            ) : null}
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-[#fcfbfb] p-4 rounded-xl border border-stone-200/80">
            {currentCourse.description}
          </p>

          {/* Destaques do Curso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#faeef2]/40 border border-[#f0dbe5] flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#c082a0] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#87556e] block font-serif-brand">
                  Carga Horária
                </span>
                <span className="text-xs font-semibold text-stone-800">
                  {currentCourse.duration}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faeef2]/40 border border-[#f0dbe5] flex items-center gap-3">
              <Award className="w-5 h-5 text-[#c082a0] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#87556e] block font-serif-brand">
                  Certificação
                </span>
                <span className="text-xs font-semibold text-stone-800">
                  {currentCourse.certification || 'Certificado incluso'}
                </span>
              </div>
            </div>
          </div>

          {/* O que o aluno vai receber */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-serif-brand flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#c082a0]" />
              <span>O que está incluso no curso:</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentCourse.includes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Contato no WhatsApp para Matrícula */}
          <div className="pt-2">
            <a
              href={getWhatsAppCourseUrl(currentCourse.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#c082a0] hover:bg-[#b57694] active:scale-[0.99] text-white font-serif-brand font-bold text-xs sm:text-[13px] tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(192,130,160,0.3)] flex items-center justify-center gap-2"
            >
              <span>Tirar Dúvidas e Garantir Minha Vaga</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
