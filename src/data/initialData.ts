/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ScheduleSettings, Appointment, Course } from '../types';

export const INITIAL_SERVICES: Service[] = [
  // Cílios
  {
    id: 'cil-volume-brasileiro',
    name: 'Volume Brasileiro (Fios em Y)',
    description: 'Volume marcante e acabamento delicado e leve.',
    durationMinutes: 120, // 2h
    totalPrice: 150,
    category: 'Cílios',
    isActive: true,
  },
  {
    id: 'cil-fio-a-fio',
    name: 'Extensão Clássica Fio a Fio',
    description: 'Efeito rímel natural e elegante para o dia a dia.',
    durationMinutes: 120, // 2h
    totalPrice: 130,
    category: 'Cílios',
    isActive: true,
  },
  {
    id: 'cil-volume-russo',
    name: 'Volume Russo',
    description: 'Olhar denso, preenchido e sofisticado com fans artesanais.',
    durationMinutes: 150, // 2h 30min
    totalPrice: 180,
    category: 'Cílios',
    isActive: true,
  },
  {
    id: 'cil-mega-volume',
    name: 'Mega Volume',
    description: 'Máxima densidade e impacto visual luxuoso.',
    durationMinutes: 150, // 2h 30min
    totalPrice: 210,
    category: 'Cílios',
    isActive: true,
  },
  {
    id: 'cil-lash-lifting',
    name: 'Lash Lifting & Nutrição',
    description: 'Curvatura e hidratação profunda dos próprios cílios naturais.',
    durationMinutes: 75, // 1h 15min
    totalPrice: 100,
    category: 'Cílios',
    isActive: true,
  },
  {
    id: 'cil-manutencao',
    name: 'Manutenção de Extensão (até 20 dias)',
    description: 'Reposição de fios e renovação do formato.',
    durationMinutes: 90, // 1h 30min
    totalPrice: 85,
    category: 'Cílios',
    isActive: true,
  },

  // Sobrancelha
  {
    id: 'sob-brow-lamination',
    name: 'Brow Lamination & Alinhamento',
    description: 'Alinhamento dos fios rebeldes, efeito encorpado e moderno.',
    durationMinutes: 60, // 1h
    totalPrice: 120,
    category: 'Sobrancelha',
    isActive: true,
  },
  {
    id: 'sob-design-henna',
    name: 'Design Personalizado com Henna',
    description: 'Mapeamento facial e preenchimento natural com henna.',
    durationMinutes: 45, // 45min
    totalPrice: 55,
    category: 'Sobrancelha',
    isActive: true,
  },
  {
    id: 'sob-design-simples',
    name: 'Design de Sobrancelhas na Pinça',
    description: 'Limpeza e desenho anatômico com visagismo.',
    durationMinutes: 30, // 30min
    totalPrice: 40,
    category: 'Sobrancelha',
    isActive: true,
  },

  // Boca
  {
    id: 'boc-hidra-gloss',
    name: 'Hidra Gloss Lips',
    description: 'Tratamento labial intensivo com ácido hialurônico para viço e hidratação.',
    durationMinutes: 50, // 50min
    totalPrice: 110,
    category: 'Boca',
    isActive: true,
  },
  {
    id: 'boc-revitalizacao',
    name: 'Revitalização Labial / Efeito Cor de Boca',
    description: 'Micropigmentação labial suave para realçar cor e contorno natural.',
    durationMinutes: 120, // 2h
    totalPrice: 220,
    category: 'Boca',
    isActive: true,
  },

  // Maquiagem
  {
    id: 'maq-social',
    name: 'Maquiagem Social / Eventos',
    description: 'Make completa de alta durabilidade com cílios inclusos.',
    durationMinutes: 75, // 1h 15min
    totalPrice: 160,
    category: 'Maquiagem',
    isActive: true,
  },
  {
    id: 'maq-noiva-festa',
    name: 'Maquiagem Noiva / Madrinha Especial',
    description: 'Pele blindada, acabamento premium e prova prévia.',
    durationMinutes: 120, // 2h
    totalPrice: 280,
    category: 'Maquiagem',
    isActive: true,
  },

  // Limpeza de Pele
  {
    id: 'pel-limpeza-profunda',
    name: 'Limpeza de Pele Profunda',
    description: 'Higienização, vapor de ozônio, extração sem marcas e máscara calmante.',
    durationMinutes: 90, // 1h 30min
    totalPrice: 150,
    category: 'Limpeza de Pele',
    isActive: true,
  },
  {
    id: 'pel-peeling-diamante',
    name: 'Peeling de Diamante & Glow Facial',
    description: 'Renovação celular, remoção de células mortas e hidratação profunda.',
    durationMinutes: 60, // 1h
    totalPrice: 130,
    category: 'Limpeza de Pele',
    isActive: true,
  },
];

export const DEFAULT_WHATSAPP_TEMPLATES = {
  clientRequest: `Olá, Jéssica! ✨ Gostaria de *SOLICITAR O AGENDAMENTO* de atendimento:

👤 *Cliente:* {cliente}
📱 *WhatsApp:* {telefone}
✨ *Procedimento(s):* {procedimentos}
⏳ *Duração Estimada:* {duracao}
📅 *Data Escolhida:* {data}
⏰ *Horário:* {horario}

💵 *Valor Total:* {valor_total}
💳 *Valor do Sinal (40%):* {valor_sinal}
🔑 *Chave PIX:* {chave_pix}
{observacoes}
Estou enviando o comprovante do sinal em anexo para você analisar e confirmar meu horário! ✨`,

  accept: `Olá, {cliente}! ✨

Seu agendamento para *{procedimentos}* no dia *{data}* às *{horario}* foi *CONFIRMADO* com sucesso por Jéssica Kleinowski! 💖

⏳ *Duração estimada:* {duracao}
💳 *Sinal recebido:* {valor_sinal}
💵 *Restante no dia do atendimento:* {valor_restante}

Te esperamos no nosso espaço com muito carinho. Caso precise tirar qualquer dúvida, estou por aqui! 💕`,

  reject: `Olá, {cliente}! ✨

Passando para falar sobre o seu pedido de horário para *{procedimentos}* no dia *{data}* às *{horario}*.

Infelizmente tive um imprevisto na agenda e *não poderei atendê-la neste horário específico*.

Podemos verificar outro dia ou horário para você? Me responda por aqui para encontrarmos o melhor momento juntas! 💕`,
};

export const INITIAL_SETTINGS: ScheduleSettings = {
  workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  defaultSlots: ['08:30', '10:30', '13:30', '15:30', '17:30'],
  customDaySlots: {},
  blockedDates: [],
  pixKey: '04947299029',
  pixKeyType: 'Chave CPF',
  pixHolderName: 'Jéssica Kleinowski',
  adminPin: '1234',
  whatsappNumber: '48988679214',
  pixExplanationText: 'Para confirmar e reservar seu horário com segurança em nossa agenda, solicitamos um adiantamento de 40% do valor total do procedimento via PIX. Esse valor é abatido integralmente no dia do seu atendimento! Após realizar o PIX, envie o comprovante para análise e confirmação imediata da Jéssica.',
  whatsappTemplateClientRequest: DEFAULT_WHATSAPP_TEMPLATES.clientRequest,
  whatsappTemplateAccept: DEFAULT_WHATSAPP_TEMPLATES.accept,
  whatsappTemplateReject: DEFAULT_WHATSAPP_TEMPLATES.reject,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'curso-extensao-cilios',
    title: 'EXTENSÃO DE CÍLIOS',
    subtitle: '',
    description: 'Aprenda extensão de cílios do zero! Conheça as principais técnicas do mercado, com aulas teóricas e práticas em modelo, materiais inclusos e suporte após o curso.',
    duration: '10 horas de curso',
    certification: 'Certificado incluso',
    includes: [
      'Apostila completa',
      'Materiais para treinamento',
      'Kit básico para atendimento',
      'Suporte pós-curso pelo WhatsApp',
    ],
  },
  {
    id: 'curso-brow-lamination',
    title: 'BROW LAMINATION',
    subtitle: '',
    description: 'Aprenda a técnica que alinha e organiza os fios das sobrancelhas, proporcionando um efeito mais preenchido e definido. Aprenda o passo a passo do procedimento, desde a preparação até a finalização.',
    duration: '8h',
    certification: 'Certificado de conclusão incluso',
    includes: [
      'Apostila didática',
      'Aula teórica e prática',
      'Materiais para treinamento',
      'Prática supervisionada',
      'Kit pra iniciar atendimentos',
      'Suporte pós curso pelo WhatsApp',
    ],
  },
  {
    id: 'curso-lash-lifting',
    title: 'LASH LIFTING',
    subtitle: '',
    description: 'Aprenda a técnica que curva e realça os cílios naturais, proporcionando um olhar mais destacado sem a necessidade de extensões. Aprenda a execução do procedimento com segurança.',
    duration: '8h',
    certification: 'Certificado de conclusão incluso',
    includes: [
      'Apostila completa',
      'Aula teórica e prática',
      'Materiais para treinamento',
      'kit para atendimentos',
      'Prática supervisionada',
      'Suporte pós curso pelo WhatsApp',
    ],
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-sample-1',
    clientName: 'Camila Fernandes',
    clientPhone: '48991234567',
    clientNotes: 'Primeira vez fazendo extensão. Prefere tamanho médio.',
    serviceId: 'cil-volume-brasileiro',
    serviceName: 'Volume Brasileiro (Fios em Y)',
    selectedServices: [
      {
        serviceId: 'cil-volume-brasileiro',
        serviceName: 'Volume Brasileiro (Fios em Y)',
        category: 'Cílios',
        price: 150,
        durationMinutes: 120,
      }
    ],
    totalDurationMinutes: 120,
    date: '2026-10-31',
    timeSlot: '13:30',
    totalPrice: 150,
    depositAmount: 60, // 40% de 150
    status: 'confirmado',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'app-sample-2',
    clientName: 'Beatriz Rocha',
    clientPhone: '48998765432',
    clientNotes: 'Combo cílios + sobrancelha.',
    serviceId: 'cil-fio-a-fio',
    serviceName: 'Extensão Clássica Fio a Fio + Brow Lamination & Alinhamento',
    selectedServices: [
      {
        serviceId: 'cil-fio-a-fio',
        serviceName: 'Extensão Clássica Fio a Fio',
        category: 'Cílios',
        price: 130,
        durationMinutes: 120,
      },
      {
        serviceId: 'sob-brow-lamination',
        serviceName: 'Brow Lamination & Alinhamento',
        category: 'Sobrancelha',
        price: 120,
        durationMinutes: 60,
      }
    ],
    totalDurationMinutes: 180,
    date: '2026-11-03',
    timeSlot: '10:30',
    totalPrice: 250,
    depositAmount: 100, // 40% de 250
    status: 'pendente_sinal',
    createdAt: new Date().toISOString(),
  },
];
