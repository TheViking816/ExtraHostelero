import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, MapPin, Clock, Star, CheckCircle, AlertTriangle, User, Building2,
  ChefHat, Coffee, Utensils, Users, Shield, BadgeCheck, Timer, Euro,
  Phone, FileText, ArrowRight, X, Menu, Bell, Search, TrendingUp,
  Award, Calendar, Navigation, Briefcase, Heart, MessageCircle,
  ClipboardCheck, UserCheck, Eye, CalendarDays, GraduationCap
} from 'lucide-react';

// ============================================
// DATOS SIMULADOS
// ============================================
const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Carlos Martinez',
    role: 'camarero',
    avatar: null,
    distance: 0.3,
    rating: 4.9,
    reliability: 98,
    reviews: 47,
    hourlyRate: 12,
    skills: ['Bandeja', 'Tirar Canas', 'Ingles', 'TPV'],
    verified: true,
    available: true,
    matchScore: 96,
  },
  {
    id: 2,
    name: 'Maria Lopez',
    role: 'cocinero',
    avatar: null,
    distance: 0.5,
    rating: 4.7,
    reliability: 94,
    reviews: 32,
    hourlyRate: 14,
    skills: ['Plancha', 'Frituras', 'Postres'],
    verified: true,
    available: true,
    matchScore: 89,
  },
  {
    id: 3,
    name: 'Javier Ruiz',
    role: 'encargado',
    avatar: null,
    distance: 0.8,
    rating: 4.8,
    reliability: 100,
    reviews: 65,
    hourlyRate: 16,
    skills: ['Gestion Sala', 'Caja', 'Ingles', 'Frances'],
    verified: true,
    available: true,
    matchScore: 92,
  },
  {
    id: 4,
    name: 'Ana Garcia',
    role: 'ayudante_cocina',
    avatar: null,
    distance: 1.2,
    rating: 4.5,
    reliability: 87,
    reviews: 18,
    hourlyRate: 10,
    skills: ['Corte', 'Limpieza', 'Almacen'],
    verified: true,
    available: true,
    matchScore: 78,
  },
  {
    id: 5,
    name: 'Pedro Sanchez',
    role: 'jefe_cocina',
    avatar: null,
    distance: 2.1,
    rating: 5.0,
    reliability: 100,
    reviews: 89,
    hourlyRate: 22,
    skills: ['Corte Jamon', 'Menu Degustacion', 'APPCC'],
    verified: true,
    available: false,
    matchScore: 95,
  },
];

const MOCK_JOBS = [
  {
    id: 1,
    businessName: 'La Tasca del Puerto',
    role: 'camarero',
    distance: 0.3,
    hourlyRate: 13,
    startTime: '20:00',
    endTime: '02:00',
    date: '2024-01-20',
    urgent: true,
    urgencyLevel: 'critical',
    expiresIn: 15,
    requirements: ['Bandeja', 'Tirar Canas'],
    autoAlta: true,
    totalPay: 78,
    isTrial: false,
  },
  {
    id: 2,
    businessName: 'Restaurante El Faro',
    role: 'cocinero',
    distance: 0.7,
    hourlyRate: 15,
    startTime: '19:00',
    endTime: '00:00',
    date: '2024-01-20',
    urgent: true,
    urgencyLevel: 'high',
    expiresIn: 45,
    requirements: ['Plancha', 'Frituras'],
    autoAlta: true,
    totalPay: 75,
    isTrial: false,
  },
  {
    id: 3,
    businessName: 'Cafe Central',
    role: 'camarero',
    distance: 1.5,
    hourlyRate: 11,
    startTime: '08:00',
    endTime: '16:00',
    date: '2024-01-21',
    urgent: false,
    urgencyLevel: 'normal',
    expiresIn: 180,
    requirements: ['TPV', 'Ingles'],
    autoAlta: true,
    totalPay: 88,
    isTrial: false,
  },
  {
    id: 4,
    businessName: 'Gastrobar Moderno',
    role: 'ayudante_cocina',
    distance: 2.3,
    hourlyRate: 10,
    startTime: '12:00',
    endTime: '17:00',
    date: '2024-01-22',
    urgent: false,
    urgencyLevel: 'normal',
    expiresIn: 360,
    requirements: ['Corte', 'Limpieza'],
    autoAlta: false,
    totalPay: 50,
    isTrial: false,
  },
  {
    id: 5,
    businessName: 'Taberna Don Quijote',
    role: 'camarero',
    distance: 0.9,
    hourlyRate: 10,
    startTime: '13:00',
    endTime: '17:00',
    date: '2024-01-23',
    urgent: false,
    urgencyLevel: 'normal',
    expiresIn: 480,
    requirements: ['Bandeja', 'Atencion cliente'],
    autoAlta: true,
    totalPay: 40,
    isTrial: true,
    trialInfo: {
      possibleHire: true,
      evaluationCriteria: ['Rapidez', 'Trato cliente', 'Trabajo en equipo'],
    },
  },
  {
    id: 6,
    businessName: 'Asador Premium',
    role: 'cocinero',
    distance: 1.8,
    hourlyRate: 12,
    startTime: '19:00',
    endTime: '23:00',
    date: '2024-01-24',
    urgent: false,
    urgencyLevel: 'normal',
    expiresIn: 600,
    requirements: ['Parrilla', 'Carnes'],
    autoAlta: true,
    totalPay: 48,
    isTrial: true,
    trialInfo: {
      possibleHire: true,
      evaluationCriteria: ['Tecnica parrilla', 'Puntos carne', 'Limpieza'],
    },
  },
];

// ============================================
// CONSTANTES Y HELPERS
// ============================================
const ROLES = {
  jefe_cocina: { label: 'Jefe de Cocina', color: 'bg-purple-500', icon: ChefHat },
  cocinero: { label: 'Cocinero', color: 'bg-orange-500', icon: ChefHat },
  encargado: { label: 'Encargado', color: 'bg-blue-500', icon: Users },
  segundo_encargado: { label: '2o Encargado', color: 'bg-blue-400', icon: Users },
  camarero: { label: 'Camarero', color: 'bg-green-500', icon: Coffee },
  ayudante_cocina: { label: 'Ayudante Cocina', color: 'bg-yellow-500', icon: Utensils },
};

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('es-ES', options);
};

// ============================================
// COMPONENTES UI BASE
// ============================================
const RoleBadge = ({ role, size = 'md' }) => {
  const roleData = ROLES[role] || ROLES.camarero;
  const Icon = roleData.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 ${roleData.color} text-white rounded-full font-medium ${sizeClasses}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      {roleData.label}
    </span>
  );
};

const SkillTag = ({ skill }) => (
  <span className="inline-block bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-full border border-slate-600">
    {skill}
  </span>
);

const TrialBadge = () => (
  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
    <GraduationCap size={12} />
    PRUEBA
  </span>
);

const ReliabilityIndicator = ({ value }) => {
  const isLow = value < 90;
  const color = isLow ? 'text-red-400' : value >= 98 ? 'text-emerald-400' : 'text-yellow-400';

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      {isLow && <AlertTriangle size={14} />}
      <span className="font-bold">{value}%</span>
      <span className="text-slate-400 text-xs">fiabilidad</span>
    </div>
  );
};

const StarRating = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    <Star size={16} className="text-yellow-400 fill-yellow-400" />
    <span className="font-bold text-white">{rating.toFixed(1)}</span>
    <span className="text-slate-400 text-sm">({reviews})</span>
  </div>
);

const UrgencyBadge = ({ level, expiresIn }) => {
  const configs = {
    critical: { bg: 'bg-red-500', text: 'URGENTE', pulse: true },
    high: { bg: 'bg-orange-500', text: 'Prioridad Alta', pulse: true },
    normal: { bg: 'bg-slate-600', text: 'Normal', pulse: false },
  };
  const config = configs[level] || configs.normal;

  return (
    <div className={`flex items-center gap-2 ${config.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full ${config.pulse ? 'urgency-pulse' : ''}`}>
      {config.pulse && <Timer size={14} className="animate-pulse" />}
      {config.text}
      {level !== 'normal' && (
        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
          {formatTime(expiresIn)}
        </span>
      )}
    </div>
  );
};

const MatchScoreBadge = ({ score }) => {
  const color = score >= 90 ? 'text-emerald-400 border-emerald-400' :
                score >= 75 ? 'text-yellow-400 border-yellow-400' :
                'text-slate-400 border-slate-400';

  return (
    <div className={`flex items-center gap-1 border ${color} rounded-lg px-2 py-1`}>
      <TrendingUp size={14} />
      <span className="font-bold text-sm">{score}%</span>
      <span className="text-[10px] opacity-70">match</span>
    </div>
  );
};

// ============================================
// COMPONENTE: SWIPE TO CONFIRM
// ============================================
const SwipeToConfirm = ({ onConfirm, text = "Desliza para confirmar", color = "orange" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef(null);
  const thumbWidth = 60;

  const colorClasses = {
    orange: 'bg-brand-orange',
    amber: 'bg-amber-500',
  };

  const handleStart = () => {
    if (isConfirmed) return;
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging || isConfirmed) return;
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newPos = Math.max(0, Math.min(clientX - rect.left - thumbWidth/2, rect.width - thumbWidth));
    setPosition(newPos);

    if (newPos >= rect.width - thumbWidth - 10) {
      setIsConfirmed(true);
      setIsDragging(false);
      setTimeout(() => onConfirm(), 300);
    }
  };

  const handleEnd = () => {
    if (!isConfirmed) {
      setPosition(0);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-xl overflow-hidden transition-colors ${
        isConfirmed ? 'bg-emerald-500' : `bg-gradient-to-r from-${color === 'amber' ? 'amber' : 'brand-orange'}-500/30 to-${color === 'amber' ? 'amber' : 'brand-orange'}-500/10`
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-white/70 font-medium transition-opacity ${position > 50 ? 'opacity-0' : 'opacity-100'}`}>
          {isConfirmed ? 'Confirmado!' : text}
        </span>
      </div>
      {!isConfirmed && (
        <div
          className={`absolute top-1 left-1 bottom-1 w-14 ${colorClasses[color]} rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-transform`}
          style={{ transform: `translateX(${position}px)` }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          <ArrowRight size={24} className="text-white" />
        </div>
      )}
      {isConfirmed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle size={28} className="text-white" />
        </div>
      )}
    </div>
  );
};

// ============================================
// VISTA: SELECTOR DE ROL
// ============================================
const RoleSelector = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-full mb-6">
          <Zap size={18} />
          <span className="font-semibold">Respuesta Rapida</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Extra<span className="text-brand-orange">Hostelero</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Staff verificado en minutos, no en dias
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => onSelect('local')}
          className="w-full bg-gradient-to-r from-brand-orange to-brand-orange-dark p-6 rounded-2xl text-left group hover:shadow-glow transition-all duration-300 animate-slide-up"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Local</h2>
              <p className="text-white/70 text-sm">Restaurante, Bar, Cafeteria...</p>
            </div>
            <ArrowRight size={24} className="text-white/50 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onSelect('staff')}
          className="w-full bg-brand-navy-light border-2 border-slate-700 p-6 rounded-2xl text-left group hover:border-brand-orange/50 transition-all duration-300 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center">
              <User size={28} className="text-brand-orange" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Staff</h2>
              <p className="text-slate-400 text-sm">Camarero, Cocinero, Encargado...</p>
            </div>
            <ArrowRight size={24} className="text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      <p className="text-slate-500 text-sm mt-8 text-center">
        Alta y baja SS automatica - Pagos protegidos - 100% legal
      </p>
    </div>
  );
};

// ============================================
// VISTA: LOCAL (RESTAURANTE)
// ============================================
const LocalView = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('urgent'); // 'urgent' | 'trial'
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('urgent'); // 'urgent' | 'trial'
  const [formData, setFormData] = useState({
    role: 'camarero',
    date: new Date().toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '02:00',
    hourlyRate: 12,
    autoAlta: true,
    // Campos especificos para pruebas
    isTrial: false,
    evaluationCriteria: [],
    possibleHire: true,
  });
  const [showCandidates, setShowCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const evaluationOptions = [
    'Rapidez', 'Trato cliente', 'Trabajo en equipo', 'Puntualidad',
    'Limpieza', 'Tecnica', 'Comunicacion', 'Iniciativa', 'Organizacion'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCandidates(true);
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const openForm = (type) => {
    setFormType(type);
    setFormData(prev => ({
      ...prev,
      isTrial: type === 'trial',
      hourlyRate: type === 'trial' ? 10 : 12,
    }));
    setShowForm(true);
  };

  const toggleCriteria = (criteria) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.includes(criteria)
        ? prev.evaluationCriteria.filter(c => c !== criteria)
        : [...prev.evaluationCriteria, criteria]
    }));
  };

  if (selectedCandidate) {
    return (
      <div className="min-h-screen bg-brand-navy">
        <div className={`p-6 pt-12 pb-8 ${formData.isTrial ? 'bg-gradient-to-b from-amber-500 to-amber-600' : 'bg-emerald-500'}`}>
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto text-white mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {formData.isTrial ? 'Prueba Confirmada!' : 'Match Confirmado!'}
            </h2>
            <p className="text-white/80">El {formData.isTrial ? 'candidato' : 'extra'} ha sido notificado</p>
          </div>
        </div>

        <div className="p-6 -mt-4">
          <div className="bg-brand-navy-light rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={32} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={selectedCandidate.role} size="sm" />
                  {formData.isTrial && <TrialBadge />}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-slate-300">
                <span>Fecha</span>
                <span className="font-bold text-white">{formatDate(formData.date)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Horario</span>
                <span className="font-bold text-white">{formData.startTime} - {formData.endTime}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Coste total</span>
                <span className="font-bold text-emerald-400">~{formData.hourlyRate * 6}EUR</span>
              </div>
            </div>

            {formData.isTrial && formData.evaluationCriteria.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardCheck size={20} className="text-amber-400" />
                  <span className="text-white font-medium">Criterios de evaluacion</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.evaluationCriteria.map(c => (
                    <span key={c} className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.autoAlta && (
              <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-brand-orange" />
                  <div>
                    <p className="text-white font-medium">Alta Flash Activada</p>
                    <p className="text-slate-400 text-sm">Gestionamos el alta/baja SS automaticamente</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                Chat
              </button>
              <button className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                <Phone size={20} />
                Llamar
              </button>
            </div>
          </div>

          <button
            onClick={() => { setSelectedCandidate(null); setShowCandidates(false); setShowForm(false); }}
            className="w-full mt-4 text-slate-400 py-3"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (showCandidates) {
    const sortedCandidates = [...MOCK_CANDIDATES]
      .filter(c => c.available)
      .sort((a, b) => b.matchScore - a.matchScore);

    return (
      <div className="min-h-screen bg-brand-navy">
        <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCandidates(false)} className="text-slate-400 p-2">
              <X size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">
                {formData.isTrial ? 'Candidatos para Prueba' : 'Candidatos Disponibles'}
              </h1>
              <p className="text-slate-400 text-sm">{sortedCandidates.length} extras cerca de ti</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {sortedCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="bg-brand-navy-light rounded-2xl p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                      <User size={24} className="text-slate-400" />
                    </div>
                    {candidate.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{candidate.name}</h3>
                    <RoleBadge role={candidate.role} size="sm" />
                  </div>
                </div>
                <MatchScoreBadge score={candidate.matchScore} />
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1 text-slate-300">
                  <MapPin size={14} className="text-brand-orange" />
                  {candidate.distance}km
                </div>
                <StarRating rating={candidate.rating} reviews={candidate.reviews} />
                <ReliabilityIndicator value={candidate.reliability} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {candidate.skills.map(skill => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-slate-300">
                  <span className="text-2xl font-bold text-white">{candidate.hourlyRate}EUR</span>
                  <span className="text-sm">/hora</span>
                </div>
                <button
                  onClick={() => handleSelectCandidate(candidate)}
                  className={`${formData.isTrial ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-orange hover:bg-brand-orange-dark'} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors`}
                >
                  {formData.isTrial ? <Eye size={18} /> : <Zap size={18} />}
                  {formData.isTrial ? 'Probar' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 p-2">
              <X size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Mi Local</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin size={12} /> La Tasca del Puerto
              </p>
            </div>
          </div>
          <button className="relative p-2">
            <Bell size={24} className="text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {!showForm ? (
          <>
            {/* Boton Extra Urgente */}
            <button
              onClick={() => openForm('urgent')}
              className="w-full bg-gradient-to-r from-red-500 to-brand-orange p-6 rounded-3xl shadow-glow mb-4 group urgency-pulse"
            >
              <div className="flex items-center justify-center gap-4">
                <Zap size={36} className="text-white" />
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-white">SOLICITAR EXTRA</h2>
                  <p className="text-white/70 text-sm">Staff verificado en 30 min</p>
                </div>
              </div>
            </button>

            {/* Boton Publicar Prueba */}
            <button
              onClick={() => openForm('trial')}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 p-6 rounded-3xl shadow-lg mb-6 group"
            >
              <div className="flex items-center justify-center gap-4">
                <GraduationCap size={36} className="text-white" />
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-white">PUBLICAR PRUEBA</h2>
                  <p className="text-white/80 text-sm">Evalua antes de contratar</p>
                </div>
              </div>
            </button>

            {/* Seccion de turnos activos */}
            <div className="bg-brand-navy-light rounded-2xl p-5 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-brand-orange" />
                Turnos y Pruebas Activas
              </h3>
              <div className="text-center py-6 text-slate-500">
                No hay turnos activos ahora mismo
              </div>
            </div>

            {/* Extras favoritos */}
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Award size={18} className="text-brand-orange" />
                Extras Favoritos
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {MOCK_CANDIDATES.slice(0, 3).map(c => (
                  <div key={c.id} className="flex-shrink-0 text-center">
                    <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center mb-1 mx-auto">
                      <User size={24} className="text-slate-400" />
                    </div>
                    <p className="text-white text-xs font-medium">{c.name.split(' ')[0]}</p>
                    <p className="text-slate-400 text-[10px]">{c.rating}*</p>
                  </div>
                ))}
                <div className="flex-shrink-0 text-center">
                  <div className="w-14 h-14 bg-slate-800 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center mb-1 mx-auto">
                    <Search size={20} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-xs">Buscar</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header del formulario */}
            <div className={`rounded-2xl p-4 ${formData.isTrial ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-brand-orange/20 border border-brand-orange/30'}`}>
              <div className="flex items-center gap-3">
                {formData.isTrial ? (
                  <GraduationCap size={28} className="text-amber-400" />
                ) : (
                  <Zap size={28} className="text-brand-orange" />
                )}
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {formData.isTrial ? 'Publicar Prueba' : 'Solicitar Extra Urgente'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {formData.isTrial ? 'Evalua al candidato en un turno real' : 'Encuentra staff verificado rapidamente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de Rol */}
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Que puesto necesitas?</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: key })}
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.role === key
                        ? formData.isTrial ? 'bg-amber-500 text-white' : 'bg-brand-orange text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <role.icon size={20} className="mb-1" />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <CalendarDays size={18} className={formData.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
                Fecha {formData.isTrial ? 'de la prueba' : 'del turno'}
              </h3>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
              />
            </div>

            {/* Horario */}
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Horario</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-slate-400 text-sm mb-1 block">Inicio</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-slate-400 text-sm mb-1 block">Fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Salario */}
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Salario</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="8"
                  max="25"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                  className={`flex-1 ${formData.isTrial ? 'accent-amber-500' : 'accent-brand-orange'}`}
                />
                <div className="bg-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white">{formData.hourlyRate}EUR</span>
                  <span className="text-slate-400 text-sm">/h</span>
                </div>
              </div>
            </div>

            {/* Criterios de Evaluacion (solo para pruebas) */}
            {formData.isTrial && (
              <div className="bg-brand-navy-light rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-amber-400" />
                  Criterios de evaluacion
                </h3>
                <p className="text-slate-400 text-sm mb-4">Selecciona que vas a evaluar</p>
                <div className="flex flex-wrap gap-2">
                  {evaluationOptions.map(criteria => (
                    <button
                      key={criteria}
                      type="button"
                      onClick={() => toggleCriteria(criteria)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.evaluationCriteria.includes(criteria)
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {criteria}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Posible contratacion (solo para pruebas) */}
            {formData.isTrial && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={formData.possibleHire}
                      onChange={(e) => setFormData({ ...formData, possibleHire: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 bg-slate-700 border-2 border-slate-500 rounded-md peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-colors flex items-center justify-center">
                      {formData.possibleHire && <CheckCircle size={16} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck size={20} className="text-amber-400" />
                      <span className="text-white font-bold">Posible contratacion</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Indica que si la prueba es satisfactoria, hay posibilidad de contrato
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Alta automatica */}
            <div className={`rounded-2xl p-5 ${formData.isTrial ? 'bg-slate-800' : 'bg-gradient-to-r from-brand-orange/20 to-brand-orange/10 border border-brand-orange/30'}`}>
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    checked={formData.autoAlta}
                    onChange={(e) => setFormData({ ...formData, autoAlta: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className={`w-6 h-6 bg-slate-700 border-2 border-slate-500 rounded-md transition-colors flex items-center justify-center ${formData.autoAlta ? (formData.isTrial ? 'peer-checked:bg-amber-500 peer-checked:border-amber-500' : 'peer-checked:bg-brand-orange peer-checked:border-brand-orange') : ''}`}>
                    {formData.autoAlta && <CheckCircle size={16} className="text-white" />}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Shield size={20} className={formData.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
                    <span className="text-white font-bold">Gestion automatica Alta/Baja SS</span>
                    <span className={`${formData.isTrial ? 'bg-amber-500' : 'bg-brand-orange'} text-white text-xs px-2 py-0.5 rounded-full font-bold`}>+2EUR</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Nos encargamos de toda la burocracia. 100% legal.
                  </p>
                </div>
              </label>
            </div>

            {/* Boton Submit */}
            <button
              type="submit"
              className={`w-full ${formData.isTrial ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-brand-orange to-brand-orange-dark'} text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all`}
            >
              {formData.isTrial ? <GraduationCap size={24} /> : <Zap size={24} />}
              {formData.isTrial ? 'Buscar Candidatos para Prueba' : 'Buscar Extras Disponibles'}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full text-slate-400 py-3"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================
// VISTA: STAFF (CAMARERO/COCINERO)
// ============================================
const StaffView = ({ onBack }) => {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [acceptedJob, setAcceptedJob] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'urgent' | 'trial'

  const handleAcceptJob = (job) => {
    setAcceptedJob(job);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => ({
        ...job,
        expiresIn: Math.max(0, job.expiresIn - 1)
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return job.urgent;
    if (filter === 'trial') return job.isTrial;
    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.urgencyLevel === 'critical' && b.urgencyLevel !== 'critical') return -1;
    if (b.urgencyLevel === 'critical' && a.urgencyLevel !== 'critical') return 1;
    return a.distance - b.distance;
  });

  if (acceptedJob) {
    return (
      <div className="min-h-screen bg-brand-navy">
        <div className={`p-6 pt-12 pb-10 ${acceptedJob.isTrial ? 'bg-gradient-to-b from-amber-500 to-amber-600' : 'bg-gradient-to-b from-emerald-500 to-emerald-600'}`}>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {acceptedJob.isTrial ? <GraduationCap size={48} className="text-white" /> : <CheckCircle size={48} className="text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {acceptedJob.isTrial ? 'Prueba Aceptada!' : 'Turno Aceptado!'}
            </h2>
            <p className="text-white/80">Te esperan en {acceptedJob.businessName}</p>
          </div>
        </div>

        <div className="p-6 -mt-6">
          <div className="bg-brand-navy-light rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
              <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center">
                <Building2 size={28} className={acceptedJob.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{acceptedJob.businessName}</h3>
                <p className="text-slate-400 flex items-center gap-1">
                  <MapPin size={14} /> A {acceptedJob.distance}km de ti
                </p>
              </div>
            </div>

            {acceptedJob.isTrial && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={20} className="text-amber-400" />
                  <span className="text-amber-300 font-bold">Turno de Prueba</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Este turno es una prueba. Da lo mejor de ti para conseguir el puesto!
                </p>
                {acceptedJob.trialInfo?.possibleHire && (
                  <div className="flex items-center gap-2 mt-2 text-emerald-400 text-sm">
                    <UserCheck size={16} />
                    <span>Posibilidad de contratacion</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <Clock size={24} className={`mx-auto mb-2 ${acceptedJob.isTrial ? 'text-amber-400' : 'text-brand-orange'}`} />
                <p className="text-slate-400 text-sm">Horario</p>
                <p className="text-white font-bold">{acceptedJob.startTime} - {acceptedJob.endTime}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <Euro size={24} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-slate-400 text-sm">Ganaras</p>
                <p className="text-emerald-400 font-bold text-xl">{acceptedJob.totalPay}EUR</p>
              </div>
            </div>

            {acceptedJob.autoAlta && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Alta SS Gestionada</p>
                    <p className="text-slate-400 text-sm">Ya estas dado de alta automaticamente</p>
                  </div>
                  <CheckCircle size={20} className="text-emerald-400 ml-auto" />
                </div>
              </div>
            )}

            <button className={`w-full ${acceptedJob.isTrial ? 'bg-amber-500' : 'bg-brand-orange'} text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-3`}>
              <Navigation size={20} />
              Abrir Navegacion
            </button>

            <button
              onClick={() => setAcceptedJob(null)}
              className="w-full text-slate-400 py-3"
            >
              Volver al feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy pb-24">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 p-2">
              <X size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Ofertas Cerca</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin size={12} /> Centro, Madrid
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2">
              <Bell size={24} className="text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"
            >
              <User size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              filter === 'urgent' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Zap size={14} />
            Urgentes
          </button>
          <button
            onClick={() => setFilter('trial')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              filter === 'trial' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <GraduationCap size={14} />
            Pruebas
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {sortedJobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay ofertas con este filtro
          </div>
        ) : (
          sortedJobs.map((job, index) => (
            <div
              key={job.id}
              className={`bg-brand-navy-light rounded-2xl overflow-hidden shadow-card animate-slide-up ${
                job.urgencyLevel === 'critical' ? 'ring-2 ring-red-500' :
                job.isTrial ? 'ring-2 ring-amber-500/50' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-4 ${
                job.urgencyLevel === 'critical' ? 'bg-gradient-to-r from-red-500/20 to-transparent' :
                job.urgencyLevel === 'high' ? 'bg-gradient-to-r from-orange-500/20 to-transparent' :
                job.isTrial ? 'bg-gradient-to-r from-amber-500/20 to-transparent' : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{job.businessName}</h3>
                      {job.autoAlta && (
                        <div className="bg-blue-500/20 p-1 rounded" title="Alta SS incluida">
                          <Shield size={12} className="text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={job.role} size="sm" />
                      {job.isTrial && <TrialBadge />}
                    </div>
                  </div>
                  {job.urgent && !job.isTrial && (
                    <UrgencyBadge level={job.urgencyLevel} expiresIn={job.expiresIn} />
                  )}
                </div>

                {job.isTrial && job.trialInfo?.possibleHire && (
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
                    <UserCheck size={14} />
                    <span>Posibilidad de contratacion</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className={job.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
                    {job.distance}km
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} className={job.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
                    {formatDate(job.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className={job.isTrial ? 'text-amber-400' : 'text-brand-orange'} />
                    {job.startTime} - {job.endTime}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requirements.map(req => (
                    <SkillTag key={req} skill={req} />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-white">{job.hourlyRate}EUR</span>
                    <span className="text-slate-400">/h</span>
                    <span className="text-slate-500 text-sm ml-2">= {job.totalPay}EUR total</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <SwipeToConfirm
                  onConfirm={() => handleAcceptJob(job)}
                  text={job.isTrial ? "Desliza para aceptar prueba" : "Desliza para aceptar turno"}
                  color={job.isTrial ? "amber" : "orange"}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-brand-navy-light w-full rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
              <button onClick={() => setShowProfile(false)} className="text-slate-400 p-2">
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                <User size={48} className="text-slate-400" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BadgeCheck size={18} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Carlos Martinez</h3>
              <RoleBadge role="camarero" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <Star size={20} className="mx-auto text-yellow-400 mb-1" />
                <p className="text-white font-bold">4.9</p>
                <p className="text-slate-400 text-xs">Rating</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <CheckCircle size={20} className="mx-auto text-emerald-400 mb-1" />
                <p className="text-white font-bold">98%</p>
                <p className="text-slate-400 text-xs">Fiabilidad</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <Briefcase size={20} className="mx-auto text-brand-orange mb-1" />
                <p className="text-white font-bold">47</p>
                <p className="text-slate-400 text-xs">Turnos</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Mis Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {['Bandeja', 'Tirar Canas', 'Ingles', 'TPV', 'Cocteleria'].map(skill => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-emerald-400" />
                <div>
                  <p className="text-white font-medium">Documentacion Verificada</p>
                  <p className="text-slate-400 text-sm">DNI y No SS validados</p>
                </div>
                <CheckCircle size={20} className="text-emerald-400 ml-auto" />
              </div>
            </div>

            <button className="w-full bg-slate-700 text-white py-3 rounded-xl font-medium">
              Editar Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// APP PRINCIPAL
// ============================================
export default function App() {
  const [userRole, setUserRole] = useState(null);

  if (!userRole) {
    return <RoleSelector onSelect={setUserRole} />;
  }

  if (userRole === 'local') {
    return <LocalView onBack={() => setUserRole(null)} />;
  }

  return <StaffView onBack={() => setUserRole(null)} />;
}
