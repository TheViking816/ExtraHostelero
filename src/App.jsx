import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import {
  Zap, MapPin, Clock, Star, CheckCircle, AlertTriangle, User, Building2,
  ChefHat, Coffee, Utensils, Users, Shield, BadgeCheck, Timer, Euro,
  Phone, FileText, ArrowRight, X, Bell, Search, TrendingUp,
  Award, Calendar, Navigation, Briefcase, MessageCircle,
  ClipboardCheck, UserCheck, Eye, CalendarDays, GraduationCap,
  Mail, Lock, LogOut, Loader2, Camera, MapPinned, Trash2, Edit3,
  Send, Heart, HeartOff, Upload, QrCode, Video, Check, XCircle,
  ChevronRight, ChevronLeft, Plus, Image as ImageIcon, File
} from 'lucide-react';

// ============================================
// CONSTANTES
// ============================================
const ROLES = {
  jefe_cocina: { label: 'Jefe de Cocina', color: 'bg-purple-500', icon: ChefHat },
  cocinero: { label: 'Cocinero', color: 'bg-orange-500', icon: ChefHat },
  encargado: { label: 'Encargado', color: 'bg-blue-500', icon: Users },
  segundo_encargado: { label: '2o Encargado', color: 'bg-blue-400', icon: Users },
  camarero: { label: 'Camarero', color: 'bg-green-500', icon: Coffee },
  ayudante_cocina: { label: 'Ayudante Cocina', color: 'bg-yellow-500', icon: Utensils },
};

const DEFAULT_CRITERIA_BY_ROLE = {
  jefe_cocina: ['Liderazgo', 'Organizacion', 'Tecnica culinaria', 'Gestion de costes', 'APPCC'],
  cocinero: ['Tecnica', 'Rapidez', 'Limpieza', 'Trabajo en equipo', 'Creatividad'],
  encargado: ['Liderazgo', 'Trato cliente', 'Gestion caja', 'Resolucion problemas', 'Organizacion'],
  segundo_encargado: ['Apoyo encargado', 'Trato cliente', 'Gestion sala', 'Comunicacion', 'Iniciativa'],
  camarero: ['Rapidez', 'Trato cliente', 'Bandeja', 'Memoria comandas', 'Trabajo en equipo'],
  ayudante_cocina: ['Rapidez', 'Limpieza', 'Corte basico', 'Organizacion', 'Puntualidad'],
};

const ALL_SKILLS = [
  'Bandeja', 'Tirar Canas', 'Corte Jamon', 'Cocteleria', 'Barista',
  'TPV', 'Ingles', 'Frances', 'Aleman', 'Plancha', 'Frituras',
  'Horno', 'Pasteleria', 'Sushi', 'Parrilla', 'APPCC', 'Sommelier',
  'Gestion caja', 'Reservas', 'Delivery', 'Arroces', 'Bocadillos',
  'Alto volumen', 'Josper', 'Rational'
];

const CERTIFICATIONS = [
  { key: 'manipulador_alimentos', label: 'Manipulador de Alimentos', icon: Shield },
  { key: 'alergenos', label: 'Alergenos', icon: AlertTriangle },
  { key: 'prl_hosteleria', label: 'PRL Hosteleria', icon: Shield },
  { key: 'sommelier', label: 'Sommelier', icon: Award },
  { key: 'barista', label: 'Barista Certificado', icon: Coffee },
  { key: 'cocteleria', label: 'Cocteleria', icon: Award },
  { key: 'primeros_auxilios', label: 'Primeros Auxilios', icon: Heart },
  { key: 'appcc', label: 'APPCC', icon: ClipboardCheck },
];

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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

const SkillTag = ({ skill, selected, onClick, size = 'md' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-block ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'} rounded-full border transition-all ${
      selected
        ? 'bg-brand-orange text-white border-brand-orange'
        : 'bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500'
    }`}
  >
    {skill}
  </button>
);

const JobTypeBadge = ({ type }) => {
  if (type === 'prueba') {
    return (
      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
        <GraduationCap size={12} />
        PRUEBA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-brand-orange to-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
      <Zap size={12} />
      EXTRA
    </span>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 size={32} className="text-brand-orange animate-spin" />
  </div>
);

const StarRating = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    <Star size={16} className="text-yellow-400 fill-yellow-400" />
    <span className="font-bold text-white">{rating?.toFixed(1) || '0.0'}</span>
    <span className="text-slate-400 text-sm">({reviews || 0})</span>
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
    </div>
  );
};

const FavoriteBadge = ({ count }) => (
  <div className="flex items-center gap-1 bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full text-xs">
    <Heart size={12} className="fill-pink-400" />
    <span>{count} locales</span>
  </div>
);

const VerifiedBadge = () => (
  <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
    <BadgeCheck size={12} />
    <span>Verificado</span>
  </div>
);

// ============================================
// SWIPE TO CONFIRM
// ============================================
const SwipeToConfirm = ({ onConfirm, text = "Desliza para confirmar", color = "orange", disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef(null);
  const thumbWidth = 60;

  const colorClasses = { orange: 'bg-brand-orange', amber: 'bg-amber-500', green: 'bg-emerald-500' };

  const handleStart = () => { if (!isConfirmed && !disabled) setIsDragging(true); };

  const handleMove = (e) => {
    if (!isDragging || isConfirmed || disabled) return;
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

  const handleEnd = () => { if (!isConfirmed) setPosition(0); setIsDragging(false); };

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e) => handleMove(e);
      const endHandler = () => handleEnd();
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchmove', moveHandler);
      window.addEventListener('touchend', endHandler);
      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
      };
    }
  }, [isDragging, isConfirmed]);

  return (
    <div ref={trackRef} className={`relative h-14 rounded-xl overflow-hidden transition-colors ${disabled ? 'opacity-50' : ''} ${isConfirmed ? 'bg-emerald-500' : `bg-gradient-to-r from-${color === 'amber' ? 'amber' : 'brand-orange'}/30 to-${color === 'amber' ? 'amber' : 'brand-orange'}/10`}`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-white/70 font-medium transition-opacity ${position > 50 ? 'opacity-0' : 'opacity-100'}`}>
          {isConfirmed ? 'Confirmado!' : text}
        </span>
      </div>
      {!isConfirmed && (
        <div
          className={`absolute top-1 left-1 bottom-1 w-14 ${colorClasses[color] || colorClasses.orange} rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg`}
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
// MODAL BASE
// ============================================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className={`bg-brand-navy-light w-full ${sizeClasses[size]} rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 p-2 hover:text-white">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================
// FORMULARIO DE APLICACION
// ============================================
const ApplicationForm = ({ job, profile, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    phone: profile?.phone || '',
    experienceSummary: profile?.bio || '',
    availabilityNote: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        cvSnapshotUrl: profile?.cv_url,
        photoUrl: profile?.avatar_url,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <JobTypeBadge type={job.job_type} />
          <RoleBadge role={job.role_required} size="sm" />
        </div>
        <p className="text-white font-medium">{job.local?.business_name}</p>
        <p className="text-slate-400 text-sm">{formatDate(job.shift_date)} · {job.start_time?.slice(0,5)} - {job.end_time?.slice(0,5)}</p>
        <p className="text-brand-orange font-bold mt-2">{job.hourly_rate}EUR/h</p>
      </div>

      {job.job_type === 'prueba' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={18} className="text-amber-400" />
            <span className="text-amber-400 font-medium">Oferta de Prueba</span>
          </div>
          <p className="text-slate-300 text-sm">
            Esta es una prueba con posibilidad de contratacion. El local evaluara tu desempeno segun criterios especificos.
          </p>
          {job.evaluation_criteria?.length > 0 && (
            <div className="mt-3">
              <p className="text-slate-400 text-xs mb-2">Criterios de evaluacion:</p>
              <div className="flex flex-wrap gap-1">
                {job.evaluation_criteria.map(c => (
                  <span key={c} className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-brand-navy-light rounded-xl p-4 border border-slate-700">
        <label className="text-slate-400 text-sm mb-2 block">Telefono de contacto *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
          placeholder="612 345 678"
          required
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4 border border-slate-700">
        <label className="text-slate-400 text-sm mb-2 block">Presentate brevemente *</label>
        <textarea
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-24"
          placeholder="Por que te interesa esta oferta? Que experiencia relevante tienes?"
          required
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4 border border-slate-700">
        <label className="text-slate-400 text-sm mb-2 block">Resumen de experiencia</label>
        <textarea
          value={formData.experienceSummary}
          onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-20"
          placeholder="Anos de experiencia, tipo de locales..."
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4 border border-slate-700">
        <label className="text-slate-400 text-sm mb-2 block">Disponibilidad / Notas</label>
        <input
          type="text"
          value={formData.availabilityNote}
          onChange={(e) => setFormData({ ...formData, availabilityNote: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
          placeholder="Ej: Puedo llegar 15min antes"
        />
      </div>

      {profile?.cv_url && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <FileText size={24} className="text-emerald-400" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">CV adjunto automaticamente</p>
            <p className="text-slate-400 text-xs">Desde tu perfil</p>
          </div>
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-medium">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !formData.phone || !formData.coverLetter}
          className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Enviar Candidatura
        </button>
      </div>
    </form>
  );
};

// ============================================
// COMPONENTE DE CANDIDATO (para locales)
// ============================================
const CandidateCard = ({ application, onAccept, onReject, onChat, onToggleFavorite, isFavorite, onViewProfile }) => {
  const staff = application.staff;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
          {staff?.avatar_url ? (
            <img src={staff.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">{staff?.full_name}</h3>
            {staff?.verification_status === 'verified' && <VerifiedBadge />}
          </div>
          <RoleBadge role={staff?.staff_role} size="sm" />
        </div>
        <button
          onClick={() => onToggleFavorite(staff?.id)}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 text-slate-400 hover:text-pink-400'}`}
        >
          {isFavorite ? <Heart size={18} className="fill-pink-400" /> : <Heart size={18} />}
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
        <StarRating rating={staff?.rating} reviews={staff?.total_reviews} />
        <span className="text-emerald-400">{staff?.reliability_score || 100}% fiable</span>
        <span>{staff?.total_shifts || 0} turnos</span>
      </div>

      {application.cover_letter && (
        <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
          <p className="text-slate-300 text-sm">{application.cover_letter}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        {application.phone_number && (
          <span className="flex items-center gap-1 text-slate-400 text-sm">
            <Phone size={14} />
            {application.phone_number}
          </span>
        )}
        {application.distance_km && (
          <span className="flex items-center gap-1 text-slate-400 text-sm">
            <MapPin size={14} />
            {application.distance_km}km
          </span>
        )}
      </div>

      {staff?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {staff.skills.slice(0, 5).map(skill => (
            <span key={skill} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{skill}</span>
          ))}
          {staff.skills.length > 5 && (
            <span className="text-slate-500 text-xs">+{staff.skills.length - 5}</span>
          )}
        </div>
      )}

      {(onReject || onChat || onViewProfile || onAccept) && (
        <div className="flex gap-2 flex-wrap">
          {onReject && (
            <button
              onClick={() => onReject(application)}
              className="flex-1 min-w-[120px] bg-red-500/20 text-red-400 py-2 rounded-xl font-medium flex items-center justify-center gap-1"
            >
              <XCircle size={16} />
              Rechazar
            </button>
          )}
          {onChat && (
            <button
              onClick={() => onChat(staff?.id)}
              className="flex-1 min-w-[120px] bg-slate-700 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-1"
            >
              <MessageCircle size={16} />
              Chat
            </button>
          )}
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(staff?.id)}
              className="flex-1 min-w-[120px] bg-slate-700 text-slate-100 py-2 rounded-xl font-medium flex items-center justify-center gap-1"
            >
              <Eye size={16} />
              Perfil
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => onAccept(application)}
              className="flex-1 min-w-[120px] bg-emerald-500 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-1"
            >
              <Check size={16} />
              Aceptar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// PERFIL DE STAFF (Modal para locales)
// ============================================
const StaffProfileModal = ({ profile, onClose }) => {
  if (!profile) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={28} className="text-slate-400" />}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{profile.full_name}</h2>
          <p className="text-slate-300 text-sm">{ROLES[profile.staff_role]?.label}</p>
          <StarRating rating={profile.rating} reviews={profile.total_reviews} />
        </div>
      </div>

      {profile.bio && (
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-white font-semibold text-sm mb-1">Bio</p>
          <p className="text-slate-300 text-sm">{profile.bio}</p>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div>
          <p className="text-white font-semibold text-sm mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 12).map(skill => (
              <span key={skill} className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-full border border-slate-700">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
        <Clock size={16} className="text-brand-orange" />
        <div>
          <p className="text-white text-sm font-semibold">Tarifa preferida</p>
          <p className="text-slate-300 text-sm">{profile.hourly_rate_min ? `${profile.hourly_rate_min} - ${profile.hourly_rate_max || profile.hourly_rate_min} EUR/h` : 'No indicada'}</p>
        </div>
      </div>

      {profile.city && (
        <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
          <MapPin size={16} className="text-brand-orange" />
          <div>
            <p className="text-white text-sm font-semibold">Ubicación</p>
            <p className="text-slate-300 text-sm">{profile.city}{profile.address ? ` · ${profile.address}` : ''}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">Cerrar</button>
      </div>
    </div>
  );
};

// ============================================
// REVIEW MODAL
// ============================================
const ReviewModal = ({ isOpen, onClose, onSubmit, targetName }) => {
  const [attended, setAttended] = useState(true);
  const [rating, setRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [skills, setSkills] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [wouldHireAgain, setWouldHireAgain] = useState(true);
  const [fairTreatment, setFairTreatment] = useState(true);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      attendancePresent: attended,
      rating: attended ? rating : 1, // columna rating es NOT NULL y el check exige >=1
      punctuality: attended ? punctuality : null,
      professionalism: attended ? professionalism : null,
      skills: attended ? skills : null,
      communication: attended ? communication : null,
      wouldHireAgain: attended ? wouldHireAgain : null,
      fairTreatment: attended ? fairTreatment : null,
      comment
    });
  };

  if (!isOpen) return null;

  const renderScoreRow = (label, value, setter) => (
    <div className={`flex items-center justify-between gap-2 ${!attended ? 'opacity-50 pointer-events-none' : ''}`}>
      <span className="text-slate-200 text-sm">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setter(v)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${value >= v ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">Valorar a {targetName}</p>
          <p className="text-slate-400 text-sm">Indica si se presentó y, si procede, puntúa cada apartado.</p>
        </div>
        <button
          type="button"
          onClick={() => setAttended(!attended)}
          className={`px-3 py-2 rounded-lg text-sm border ${attended ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-red-500/20 border-red-500 text-red-100'}`}
        >
          {attended ? 'Se presentó' : 'No se presentó'}
        </button>
      </div>

      {renderScoreRow('Valoración general', rating, setRating)}
      {renderScoreRow('Puntualidad', punctuality, setPunctuality)}
      {renderScoreRow('Profesionalidad', professionalism, setProfessionalism)}
      {renderScoreRow('Habilidades', skills, setSkills)}
      {renderScoreRow('Comunicación', communication, setCommunication)}

      {!attended && (
        <div className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          No se presentó, no se valoran otros aspectos.
        </div>
      )}

      <div className={`grid grid-cols-2 gap-3 ${!attended ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={() => setWouldHireAgain(!wouldHireAgain)}
          className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between border ${wouldHireAgain ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-200'}`}
        >
          <span>Volvería a contratar</span>
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={() => setFairTreatment(!fairTreatment)}
          className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between border ${fairTreatment ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-200'}`}
        >
          <span>Trato justo</span>
          <Check size={14} />
        </button>
      </div>

      <textarea
        className="w-full bg-slate-800 text-white rounded-xl p-3 border border-slate-700"
        rows={4}
        placeholder="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">Cancelar</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-brand-orange text-white rounded-lg">Enviar valoraci?n</button>
      </div>
    </div>
  );
};

// ============================================
// REVIEW LOCAL (staff -> local)
// ============================================
const LocalReviewModal = ({ isOpen, onClose, onSubmit, targetName }) => {
  const [rating, setRating] = useState(5);
  const [fairTreatment, setFairTreatment] = useState(true);
  const [wouldReturn, setWouldReturn] = useState(true);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      fairTreatment,
      wouldReturn,
      comment
    });
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-white font-semibold">Valorar al local {targetName}</p>
        <p className="text-slate-400 text-sm">Da una puntuacion general y dinos si el trato fue justo.</p>
      </div>

      <div className="flex gap-2">
        {[1,2,3,4,5].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setRating(v)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${rating >= v ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setFairTreatment(!fairTreatment)}
          className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between border ${fairTreatment ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-200'}`}
        >
          <span>Trato justo</span>
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={() => setWouldReturn(!wouldReturn)}
          className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between border ${wouldReturn ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' : 'bg-slate-800 border-slate-700 text-slate-200'}`}
        >
          <span>Volveria a trabajar</span>
          <Check size={14} />
        </button>
      </div>

      <textarea
        className="w-full bg-slate-800 text-white rounded-xl p-3 border border-slate-700"
        rows={4}
        placeholder="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">Cancelar</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-brand-orange text-white rounded-lg">Enviar valoracion</button>
      </div>
    </div>
  );
};
// ============================================
// SISTEMA DE CHAT// ============================================
// SISTEMA DE CHAT
// ============================================
const ChatView = ({ userId, otherUserId, otherUserName, jobId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }
    loadMessages();
    const subscription = subscribeToMessages();
    return () => { subscription?.unsubscribe(); };
  }, [userId, otherUserId, jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!jobId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) setMessages(data);
    if (error) console.error('Error loading messages:', error);
    setLoading(false);

    // Marcar como leidos
    if (data && data.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .eq('job_id', jobId)
        .is('read_at', null);
      
      if (updateError) console.error('Error marking as read:', updateError);
    }
  };

  const subscribeToMessages = () => {
    if (!jobId) return null;
    return supabase
      .channel(`chat-${userId}-${otherUserId}-${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`
      }, (payload) => {
        const msg = payload.new;
        const isForThisChat =
          (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === userId);
        if (!isForThisChat) return;

        setMessages(prev => [...prev, msg]);
        // Marcar como leido si somos el receptor
        if (msg.receiver_id === userId) {
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id).then();
        }
      })
      .subscribe();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!jobId) {
      alert('Abre el chat desde la oferta concreta para vincular el mensaje.');
      return;
    }
    if (!newMessage.trim()) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const message = {
        sender_id: userId,
        receiver_id: otherUserId,
        job_id: jobId,
        content: messageContent,
        message_type: 'text'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        setNewMessage(messageContent); // Restaurar el mensaje para reintentar
        alert('Error al enviar mensaje: ' + error.message);
      } else if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (err) {
      console.error('Error:', err);
      setNewMessage(messageContent);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async () => {
    if (!confirm('Eliminar este chat? Se borrarán los mensajes de esta oferta.')) return;
    if (!jobId) return;
    setDeleting(true);
    try {
      await supabase.from('messages')
        .delete()
        .eq('job_id', jobId)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);
      await supabase.from('conversations')
        .delete()
        .eq('job_id', jobId)
        .or(`and(local_id.eq.${userId},staff_id.eq.${otherUserId}),and(local_id.eq.${otherUserId},staff_id.eq.${userId})`);
      setMessages([]);
      onClose();
    } catch (err) {
      console.error('Error deleting chat', err);
      alert('No se pudo eliminar el chat');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-navy z-50 flex flex-col">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 flex items-center gap-3">
        <button onClick={onClose} className="p-2 text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
          <User size={20} className="text-slate-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-white">{otherUserName}</h2>
          <p className="text-slate-400 text-sm">Chat</p>
        </div>
        <button
          onClick={deleteConversation}
          disabled={deleting}
          className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-50"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {!jobId ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
            <p className="text-white font-semibold">Este chat necesita una oferta</p>
            <p className="text-slate-400 text-sm mt-1">Abre el chat desde la oferta concreta para vincular mensajes y conversaciones.</p>
          </div>
        ) : loading ? (
          <LoadingSpinner />
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500">No hay mensajes aun</p>
            <p className="text-slate-600 text-sm">Envia el primer mensaje</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.sender_id === userId
                  ? 'bg-brand-orange text-white rounded-br-sm'
                  : 'bg-slate-700 text-white rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-white/60' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-brand-navy-light border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl outline-none disabled:opacity-50"
            placeholder="Escribe un mensaje..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-brand-orange text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center"
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// PERFIL DE LOCAL (Modal)
// ============================================
const LocalProfileModal = ({ local, onClose }) => {
  if (!local) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
          {local.avatar_url ? <img src={local.avatar_url} alt="" className="w-full h-full object-cover" /> : <Building2 size={28} className="text-slate-400" />}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">{local.business_name}</h2>
          <p className="text-slate-400 text-sm">{local.business_type || 'Negocio'}</p>
          <div className="mt-1">
            <StarRating rating={local.rating} reviews={local.total_reviews} />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
        <p className="text-white font-semibold">Ubicación</p>
        <p className="text-slate-300 text-sm">{local.address || 'Sin dirección'}</p>
        <p className="text-slate-400 text-sm">{local.city || ''}</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
        <p className="text-white font-semibold">Descripción</p>
        <p className="text-slate-300 text-sm">{local.service_description || local.bio || 'Sin descripción'}</p>
      </div>

      {(local.menu_url) && (
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          <p className="text-white font-semibold">Menú / Carta</p>
          <a href={local.menu_url} target="_blank" rel="noreferrer" className="text-brand-orange text-sm underline break-all">
            {local.menu_url}
          </a>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg">Cerrar</button>
      </div>
    </div>
  );
};

// ============================================
// CARNET DIGITAL
// ============================================
const CarnetDigital = ({ profile, stats, onClose }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-brand-orange to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white/60" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
            <p className="text-white/80">{ROLES[profile?.staff_role]?.label}</p>
            <div className="flex items-center gap-2 mt-2">
              {profile?.verification_status === 'verified' && (
                <BadgeCheck size={16} className="text-white" />
              )}
              <span className="text-sm text-white/70">ID: {profile?.carnet_digital_id || 'Pendiente'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{stats?.total_shifts || 0}</p>
            <p className="text-xs text-white/70">Turnos</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats?.rating?.toFixed(1) || '5.0'}</p>
            <p className="text-xs text-white/70">Rating</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats?.reliability_score || 100}%</p>
            <p className="text-xs text-white/70">Fiabilidad</p>
          </div>
        </div>
      </div>

      {stats?.favorites_count > 0 && (
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 flex items-center gap-3">
          <Heart size={24} className="text-pink-400 fill-pink-400" />
          <div>
            <p className="text-white font-medium">Favorito de {stats.favorites_count} locales</p>
            <p className="text-slate-400 text-sm">Los locales te prefieren</p>
          </div>
        </div>
      )}

      {stats?.certifications?.length > 0 && (
        <div className="bg-brand-navy-light rounded-xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Award size={18} className="text-brand-orange" />
            Certificaciones Verificadas
          </h3>
          <div className="space-y-2">
            {stats.certifications.map((cert, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-400" />
                  <span className="text-white text-sm">
                    {CERTIFICATIONS.find(c => c.key === cert.type)?.label || cert.type}
                  </span>
                </div>
                {cert.expires_at && (
                  <span className="text-slate-400 text-xs">Exp: {formatDate(cert.expires_at)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile?.verified_skills?.length > 0 && (
        <div className="bg-brand-navy-light rounded-xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            Habilidades Verificadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.verified_skills.map(skill => (
              <span key={skill} className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                <BadgeCheck size={12} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.carnet_qr_code && (
        <div className="bg-white rounded-xl p-6 text-center">
          <QrCode size={120} className="mx-auto text-brand-navy mb-3" />
          <p className="text-brand-navy text-sm font-medium">Escanea para verificar</p>
          <p className="text-slate-500 text-xs">{profile.carnet_qr_code}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// EDITAR PERFIL
// ============================================
const EditProfileModal = ({ profile, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    hourly_rate_min: profile?.hourly_rate_min || 10,
    cv_text: profile?.cv_text || '',
    cv_url: profile?.cv_url || '',
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea PDF o documento
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB máximo
      alert('❌ El archivo no puede ser mayor a 10MB');
      return;
    }

    setUploadingCV(true);
    try {
      // Construir ruta: userid_timestamp_filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${profile.id}_${timestamp}_${file.name}`;

      console.log('Uploading CV to:', fileName);

      // Subir archivo
      const { data, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Error al subir: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener URL del archivo');
      }

      console.log('Public URL:', urlData.publicUrl);
      setFormData(prev => ({ ...prev, cv_url: urlData.publicUrl }));
      alert('✅ CV subido correctamente!');
    } catch (err) {
      console.error('CV upload error:', err);
      alert('❌ Error al subir CV: ' + err.message);
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;
      onSave({ ...profile, ...formData });
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">Nombre completo</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">Telefono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">Ciudad</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">Tarifa minima por hora</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="8"
            max="25"
            value={formData.hourly_rate_min}
            onChange={(e) => setFormData({ ...formData, hourly_rate_min: parseInt(e.target.value) })}
            className="flex-1 accent-brand-orange"
          />
          <div className="bg-slate-700 px-4 py-2 rounded-xl min-w-[80px] text-center">
            <span className="text-xl font-bold text-white">{formData.hourly_rate_min}EUR</span>
          </div>
        </div>
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">Sobre ti</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-24"
          placeholder="Tu experiencia, disponibilidad..."
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-3 block">Subir CV (PDF o Word)</label>
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-brand-orange transition-colors">
          <Upload size={24} className="text-brand-orange mb-2" />
          <span className="text-white font-medium">{uploadingCV ? 'Subiendo...' : 'Selecciona tu CV'}</span>
          <span className="text-slate-400 text-xs mt-1">PDF, DOC o DOCX</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCVUpload}
            disabled={uploadingCV}
            className="hidden"
          />
        </label>
        {formData.cv_url && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <div className="flex-1">
              <p className="text-emerald-400 text-sm font-medium">CV subido correctamente</p>
              <p className="text-slate-400 text-xs">Se enviará automáticamente en candidaturas</p>
            </div>
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
        )}
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-2 block">CV / Experiencia detallada (texto)</label>
        <textarea
          value={formData.cv_text}
          onChange={(e) => setFormData({ ...formData, cv_text: e.target.value })}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-32"
          placeholder="Detalla tu experiencia laboral, formacion..."
        />
      </div>

      <div className="bg-brand-navy-light rounded-xl p-4">
        <label className="text-slate-400 text-sm mb-3 block">Habilidades</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map(skill => (
            <SkillTag
              key={skill}
              skill={skill}
              selected={formData.skills.includes(skill)}
              onClick={() => toggleSkill(skill)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-medium">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

// ============================================
// PANTALLA DE LOGIN/REGISTRO
// ============================================
const AuthScreen = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) onAuth(data.user, true);
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email o contrasena incorrectos' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-full mb-4">
          <Zap size={18} />
          <span className="font-semibold">Respuesta Rapida</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Extra<span className="text-brand-orange">Hostelero</span>
        </h1>
        <p className="text-slate-400">Staff verificado en minutos</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-brand-navy-light rounded-2xl p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center font-medium rounded-l-xl transition-all ${isLogin ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              Iniciar Sesion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center font-medium rounded-r-xl transition-all ${!isLogin ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm mb-1 block">Contrasena</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                  placeholder="Min. 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : null}
              {isLogin ? 'Entrar' : 'Crear Cuenta'}
            </button>
          </form>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          Alta SS automatica · Pagos protegidos · 100% legal
        </p>
      </div>
    </div>
  );
};

// ============================================
// ONBOARDING - SELECCION DE TIPO
// ============================================
const OnboardingTypeSelect = ({ onSelect }) => (
  <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6">
    <div className="text-center mb-10">
      <h1 className="text-2xl font-bold text-white mb-2">Bienvenido!</h1>
      <p className="text-slate-400">Como vas a usar ExtraHostelero?</p>
    </div>

    <div className="w-full max-w-sm space-y-4">
      <button
        onClick={() => onSelect('local')}
        className="w-full bg-gradient-to-r from-brand-orange to-brand-orange-dark p-6 rounded-2xl text-left group hover:shadow-glow transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Soy Local</h2>
            <p className="text-white/70 text-sm">Quiero contratar extras</p>
          </div>
          <ArrowRight size={24} className="text-white/50 ml-auto" />
        </div>
      </button>

      <button
        onClick={() => onSelect('staff')}
        className="w-full bg-brand-navy-light border-2 border-slate-700 p-6 rounded-2xl text-left group hover:border-brand-orange/50 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center">
            <User size={28} className="text-brand-orange" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Soy Staff</h2>
            <p className="text-slate-400 text-sm">Busco turnos extra</p>
          </div>
          <ArrowRight size={24} className="text-slate-500 ml-auto" />
        </div>
      </button>
    </div>
  </div>
);

// ============================================
// ONBOARDING - LOCAL
// ============================================
const OnboardingLocal = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '', business_type: 'restaurante', cif: '',
    phone: '', address: '', city: '',
    latitude: null, longitude: null,
  });

  const businessTypes = [
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'bar', label: 'Bar' },
    { value: 'cafeteria', label: 'Cafeteria' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'catering', label: 'Catering' },
    { value: 'otro', label: 'Otro' },
  ];

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        (err) => console.error('Error getting location:', err)
      );
    }
  };

  useEffect(() => { getLocation(); }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        id: user.id, user_type: 'local',
        full_name: formData.business_name, business_name: formData.business_name,
        business_type: formData.business_type, cif: formData.cif,
        phone: formData.phone, address: formData.address, city: formData.city,
        latitude: formData.latitude, longitude: formData.longitude,
        verification_status: 'pending',
      });
      if (error) throw error;
      onComplete();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-brand-orange" />
          </div>
          <h1 className="text-xl font-bold text-white">Configura tu Local</h1>
          <p className="text-slate-400 text-sm">Paso {step} de 2</p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-brand-orange' : 'bg-slate-700'}`} />
          <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-brand-orange' : 'bg-slate-700'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Nombre del establecimiento *</label>
              <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="Ej: La Tasca del Puerto" />
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Tipo de negocio *</label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map(type => (
                  <button key={type.value} type="button" onClick={() => setFormData({ ...formData, business_type: type.value })} className={`p-3 rounded-xl text-sm font-medium transition-all ${formData.business_type === type.value ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'}`}>{type.label}</button>
                ))}
              </div>
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">CIF de la empresa *</label>
              <input type="text" value={formData.cif} onChange={(e) => setFormData({ ...formData, cif: e.target.value.toUpperCase() })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="B12345678" maxLength={9} />
            </div>
            <button onClick={() => setStep(2)} disabled={!formData.business_name || !formData.cif} className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50">Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Telefono de contacto *</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="612 345 678" />
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Direccion *</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none mb-3" placeholder="Calle, numero..." />
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="Ciudad" />
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-white font-medium">Ubicacion GPS</p><p className="text-slate-400 text-sm">Para mostrar ofertas cercanas</p></div>
                {formData.latitude ? <div className="flex items-center gap-2 text-emerald-400"><CheckCircle size={20} /><span className="text-sm">Obtenida</span></div> : <button onClick={getLocation} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"><MapPinned size={16} />Obtener</button>}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold">Atras</button>
              <button onClick={handleSubmit} disabled={loading || !formData.phone || !formData.address || !formData.city} className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={20} className="animate-spin" />}Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ONBOARDING - STAFF
// ============================================
const OnboardingStaff = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', staff_role: 'camarero',
    skills: [], hourly_rate_min: 10, city: '',
    latitude: null, longitude: null, bio: '',
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        (err) => console.error('Error:', err)
      );
    }
  };

  useEffect(() => { getLocation(); }, []);

  const toggleSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Generar carnet digital ID
      const carnetId = 'EH-' + user.id.substring(0, 8).toUpperCase() + '-' + new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);

      const { error } = await supabase.from('profiles').insert({
        id: user.id, user_type: 'staff',
        full_name: formData.full_name, phone: formData.phone,
        staff_role: formData.staff_role, skills: formData.skills,
        hourly_rate_min: formData.hourly_rate_min, city: formData.city,
        latitude: formData.latitude, longitude: formData.longitude,
        bio: formData.bio, available: true, verification_status: 'pending',
        reliability_score: 100, rating: 5.0, total_reviews: 0, total_shifts: 0,
        carnet_digital_id: carnetId,
        carnet_qr_code: `https://extrahostelero.com/verify/${carnetId}`,
      });
      if (error) throw error;
      onComplete();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-brand-orange" />
          </div>
          <h1 className="text-xl font-bold text-white">Crea tu Perfil</h1>
          <p className="text-slate-400 text-sm">Paso {step} de 3</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => <div key={s} className={`flex-1 h-1 rounded ${step >= s ? 'bg-brand-orange' : 'bg-slate-700'}`} />)}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Nombre completo *</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="Tu nombre y apellidos" />
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Telefono *</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="612 345 678" />
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Ciudad *</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" placeholder="Madrid, Barcelona..." />
            </div>
            <button onClick={() => setStep(2)} disabled={!formData.full_name || !formData.phone || !formData.city} className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50">Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-3 block">Tu puesto principal *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button key={key} type="button" onClick={() => setFormData({ ...formData, staff_role: key })} className={`p-3 rounded-xl text-left transition-all ${formData.staff_role === key ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <role.icon size={20} className="mb-1" /><span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-3 block">Tarifa minima por hora</label>
              <div className="flex items-center gap-4">
                <input type="range" min="8" max="25" value={formData.hourly_rate_min} onChange={(e) => setFormData({ ...formData, hourly_rate_min: parseInt(e.target.value) })} className="flex-1 accent-brand-orange" />
                <div className="bg-slate-700 px-4 py-2 rounded-xl min-w-[80px] text-center"><span className="text-xl font-bold text-white">{formData.hourly_rate_min}EUR</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold">Atras</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold">Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-3 block">Tus habilidades (selecciona varias)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.map(skill => <SkillTag key={skill} skill={skill} selected={formData.skills.includes(skill)} onClick={() => toggleSkill(skill)} />)}
              </div>
            </div>
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Sobre ti (opcional)</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-24" placeholder="Experiencia, disponibilidad..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold">Atras</button>
              <button onClick={handleSubmit} disabled={loading || formData.skills.length === 0} className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={20} className="animate-spin" />}Crear Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// LOCAL PROFILE EDIT VIEW
// ============================================
const LocalProfileEditView = ({ profile, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: profile.business_name || '',
    business_type: profile.business_type || '',
    address: profile.address || '',
    city: profile.city || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    service_description: profile.service_description || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatar_url = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileName = `${profile.id}-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatar_url = publicUrl;
      }

      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      alert('Perfil actualizado correctamente');
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="bg-slate-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={32} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <Camera size={18} className="inline mr-2" />
                  Cambiar Foto
                </label>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Negocio</label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Negocio</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="bar">Bar</option>
                  <option value="cafeteria">Cafetería</option>
                  <option value="hotel">Hotel</option>
                  <option value="catering">Catering</option>
                  <option value="pub">Pub</option>
                  <option value="discoteca">Discoteca</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descripción Breve</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                  rows={3}
                  placeholder="Cuéntanos sobre tu negocio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descripción del Servicio / Tipo de Comida</label>
                <textarea
                  value={formData.service_description}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
                  rows={3}
                  placeholder="Ej: Cocina mediterránea, tapas, comida italiana..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STAFF SEARCH VIEW (para Locales)
// ============================================
const StaffSearchView = ({ currentLocalId, onClose, onSelectStaff }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', minRating: 0, minReliability: 0 });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadStaff();
  }, [filters]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const { getAllStaff } = await import('./lib/supabase.js');
      const data = await getAllStaff(filters);
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWith = async (staffMember) => {
    try {
      const { createOrGetConversation } = await import('./lib/supabase.js');
      await createOrGetConversation(currentLocalId, staffMember.id);
      onSelectStaff(staffMember);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error al iniciar chat');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users size={28} />
              Buscar Empleados
            </h1>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Puesto</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
                >
                  <option value="">Todos los puestos</option>
                  <option value="jefe_cocina">Jefe de Cocina</option>
                  <option value="cocinero">Cocinero</option>
                  <option value="encargado">Encargado</option>
                  <option value="segundo_encargado">2º Encargado</option>
                  <option value="camarero">Camarero</option>
                  <option value="ayudante_cocina">Ayudante Cocina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Valoración Mínima</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
                >
                  <option value="0">Todas</option>
                  <option value="3">3+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fiabilidad Mínima</label>
                <select
                  value={filters.minReliability}
                  onChange={(e) => setFilters({ ...filters, minReliability: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
                >
                  <option value="0">Todas</option>
                  <option value="70">70+</option>
                  <option value="80">80+</option>
                  <option value="90">90+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.length === 0 ? (
                <div className="col-span-full text-center text-slate-400 py-12">
                  No se encontraron empleados con los filtros seleccionados
                </div>
              ) : (
                staff.map((member) => (
                  <div key={member.id} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={24} className="text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{member.full_name}</h3>
                        {member.staff_role && <RoleBadge role={member.staff_role} size="sm" />}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-700 rounded-lg p-2">
                        <div className="text-xs text-slate-400">Valoración</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-bold">{member.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-slate-400">({member.total_reviews || 0})</span>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-2">
                        <div className="text-xs text-slate-400">Fiabilidad</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Shield size={14} className="text-emerald-400" />
                          <span className="text-white font-bold">{member.reliability_score || 100}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {member.city && (
                      <div className="flex items-center gap-1 text-sm text-slate-400 mb-3">
                        <MapPin size={14} />
                        {member.city}
                      </div>
                    )}

                    {/* Phone */}
                    {member.phone && (
                      <div className="flex items-center gap-1 text-sm text-slate-300 mb-3">
                        <Phone size={14} />
                        <a href={`tel:${member.phone}`} className="hover:text-brand-orange">
                          {member.phone}
                        </a>
                      </div>
                    )}

                    {/* Skills */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {member.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setShowProfile(true);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition text-sm"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => handleChatWith(member)}
                        className="px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Staff Profile Modal */}
      {showProfile && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedStaff.full_name}</h2>
                <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {selectedStaff.avatar_url ? (
                    <img src={selectedStaff.avatar_url} alt={selectedStaff.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={32} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {selectedStaff.staff_role && <RoleBadge role={selectedStaff.staff_role} />}
                  <div className="flex items-center gap-4 mt-2">
                    <StarRating rating={selectedStaff.rating} reviews={selectedStaff.total_reviews} />
                    <div className="flex items-center gap-1 text-sm">
                      <Shield size={16} className="text-emerald-400" />
                      <span className="text-white font-bold">{selectedStaff.reliability_score || 100}</span>
                      <span className="text-slate-400">fiabilidad</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStaff.bio && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Sobre mí</h3>
                  <p className="text-white">{selectedStaff.bio}</p>
                </div>
              )}

              {selectedStaff.skills && selectedStaff.skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaff.skills.map((skill, idx) => (
                      <SkillTag key={idx} skill={skill} selected={false} />
                    ))}
                  </div>
                </div>
              )}

              {(selectedStaff.city || selectedStaff.address) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Ubicación</h3>
                  <div className="flex items-start gap-2 text-white">
                    <MapPin size={16} className="text-slate-400 mt-1" />
                    <div>
                      {selectedStaff.address && <div>{selectedStaff.address}</div>}
                      {selectedStaff.city && <div>{selectedStaff.city}</div>}
                    </div>
                  </div>
                </div>
              )}

              {selectedStaff.phone && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Contacto</h3>
                  <a href={`tel:${selectedStaff.phone}`} className="flex items-center gap-2 text-brand-orange hover:text-orange-400">
                    <Phone size={16} />
                    {selectedStaff.phone}
                  </a>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleChatWith(selectedStaff)}
                  className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition"
                >
                  <MessageCircle size={18} className="inline mr-2" />
                  Enviar Mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// LOCAL SEARCH VIEW (para Staff)
// ============================================
const LocalSearchView = ({ currentStaffId, onClose, onSelectLocal }) => {
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '' });
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadLocales();
  }, [filters]);

  const loadLocales = async () => {
    setLoading(true);
    try {
      const { getAllLocals } = await import('./lib/supabase.js');
      const data = await getAllLocals(filters);
      setLocales(data || []);
    } catch (error) {
      console.error('Error loading locales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWith = async (local) => {
    try {
      const { createOrGetConversation } = await import('./lib/supabase.js');
      await createOrGetConversation(local.id, currentStaffId);
      onSelectLocal(local);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error al iniciar chat');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 size={28} />
              Buscar Locales
            </h1>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Buscar por Ciudad</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Escribe una ciudad..."
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locales.length === 0 ? (
                <div className="col-span-full text-center text-slate-400 py-12">
                  No se encontraron locales con los filtros seleccionados
                </div>
              ) : (
                locales.map((local) => (
                  <div key={local.id} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-750 transition">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {local.avatar_url ? (
                          <img src={local.avatar_url} alt={local.business_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={24} className="text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{local.business_name}</h3>
                        {local.business_type && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                            {local.business_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {(local.city || local.address) && (
                      <div className="flex items-start gap-1 text-sm text-slate-400 mb-3">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <div className="truncate">
                          {local.city && <div>{local.city}</div>}
                          {local.address && <div className="text-xs">{local.address}</div>}
                        </div>
                      </div>
                    )}

                    {/* Service Description */}
                    {local.service_description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {local.service_description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedLocal(local);
                          setShowProfile(true);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition text-sm"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => handleChatWith(local)}
                        className="px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Local Profile Modal */}
      {showProfile && selectedLocal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedLocal.business_name}</h2>
                <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {selectedLocal.avatar_url ? (
                    <img src={selectedLocal.avatar_url} alt={selectedLocal.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={32} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {selectedLocal.business_type && (
                    <span className="inline-block mb-2 text-sm px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {selectedLocal.business_type}
                    </span>
                  )}
                </div>
              </div>

              {selectedLocal.bio && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Sobre el negocio</h3>
                  <p className="text-white">{selectedLocal.bio}</p>
                </div>
              )}

              {selectedLocal.service_description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Tipo de comida / Servicio</h3>
                  <p className="text-white">{selectedLocal.service_description}</p>
                </div>
              )}

              {(selectedLocal.city || selectedLocal.address) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Ubicación</h3>
                  <div className="flex items-start gap-2 text-white">
                    <MapPin size={16} className="text-slate-400 mt-1" />
                    <div>
                      {selectedLocal.address && <div>{selectedLocal.address}</div>}
                      {selectedLocal.city && <div>{selectedLocal.city}</div>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleChatWith(selectedLocal)}
                  className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition"
                >
                  <MessageCircle size={18} className="inline mr-2" />
                  Enviar Mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// VISTA LOCAL
// ============================================
const LocalView = ({ user, profile, onLogout, setProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('extra');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobChats, setJobChats] = useState([]);
  const [staffProfileView, setStaffProfileView] = useState(null);
  const [showStaffProfile, setShowStaffProfile] = useState(false);
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [chatWith, setChatWith] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReviewModalStaff, setShowReviewModalStaff] = useState(false);
  const [reviewTargetStaff, setReviewTargetStaff] = useState(null);
  const [showReviewModalLocal, setShowReviewModalLocal] = useState(false);
  const [reviewTargetLocal, setReviewTargetLocal] = useState(null);
  const [showStaffSearch, setShowStaffSearch] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [formData, setFormData] = useState({
    role: 'camarero', date: new Date().toISOString().split('T')[0],
    startTime: '20:00', endTime: '02:00', hourlyRate: 12,
    autoAlta: true, jobType: 'extra', evaluationCriteria: [],
    possibleHire: true, skillsRequired: [],
    trialShiftPeriod: 'tarde',
    trialSchedule: '',
    trialSalaryMonth: 1200,
    trialContractHours: 40,
    trialDaysOff: '2 dias libres',
    trialDaysOffType: 'fijos',
    trialDaysOffFixed: [],
  });

  useEffect(() => {
    loadJobs();
    loadFavorites();
    loadAcceptedApplications();
    loadNotifications();

    const channel = supabase.channel('local-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        if (selectedJob) loadApplications(selectedJob.id);
        loadNotifications();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => loadNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const loadJobChats = async (jobId) => {
    if (!jobId) return setJobChats([]);

    // Obtener los últimos mensajes relacionados con este job donde participa este local
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id,full_name,avatar_url), receiver:profiles!messages_receiver_id_fkey(id,full_name,avatar_url)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error loading job chats:', error);
      return setJobChats([]);
    }

    // Agrupar por la otra parte (staff) y quedarnos con el último mensaje
    const map = new Map();
    (data || []).forEach(m => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!otherId) return;
      if (!map.has(otherId)) {
        map.set(otherId, {
          otherId,
          otherName: (m.sender_id === user.id ? m.receiver.full_name : m.sender.full_name) || 'Usuario',
          otherAvatar: (m.sender_id === user.id ? m.receiver.avatar_url : m.sender.avatar_url) || null,
          lastMessage: m.content,
          lastAt: m.created_at,
        });
      }
    });

    setJobChats(Array.from(map.values()));
  };

  const loadStaffProfile = async (staffId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, staff_role, skills, bio, city, address, hourly_rate_min, hourly_rate_max, rating, total_reviews')
      .eq('id', staffId)
      .single();
    if (error) {
      console.error('Error loading staff profile:', error);
      return;
    }
    setStaffProfileView(data);
    setShowStaffProfile(true);
  };

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('local_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setJobs(data);
  };

  const loadApplications = async (jobId) => {
    const { data } = await supabase
      .from('applications')
      .select(`*, staff:profiles!applications_staff_id_fkey(*)`)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    if (data) setApplications(data);
  };

  const loadFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('staff_id')
      .eq('local_id', user.id);
    if (data) setFavorites(data.map(f => f.staff_id));
  };

  const loadAcceptedApplications = async () => {
    // Primero, obtener todos los job_ids del local actual
    const { data: jobIds } = await supabase
      .from('jobs')
      .select('id')
      .eq('local_id', user.id);
    
    if (!jobIds || jobIds.length === 0) {
      setAcceptedApplications([]);
      return;
    }

    // Luego, obtener todas las aplicaciones aceptadas para esos jobs
    const { data } = await supabase
      .from('applications')
      .select(`*, staff:profiles!applications_staff_id_fkey(*), job:jobs(id, role_required, job_type, shift_date, start_time, end_time)`)
      .in('job_id', jobIds.map(j => j.id))
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });
    if (data) setAcceptedApplications(data);
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  const handleToggleNotifications = async (forceClose = false) => {
    // Si forceClose o ya está abierto, cerramos
    if (forceClose || showNotifications) {
      setShowNotifications(false);
      return;
    }

    // Al abrir, marcar notificaciones como leídas en backend
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }

    // Refrescar localmente (loadNotifications filtra read_at null así quedará vacío)
    await loadNotifications();
    setShowNotifications(true);
  };

  useEffect(() => {
    if (formData.jobType === 'prueba') {
      setFormData(prev => ({ ...prev, evaluationCriteria: DEFAULT_CRITERIA_BY_ROLE[prev.role] || [] }));
    }
  }, [formData.role, formData.jobType]);

  const openForm = (type) => {
    setFormType(type);
    setFormData(prev => ({
      ...prev,
      jobType: type,
      hourlyRate: type === 'prueba' ? 10 : 12,
      evaluationCriteria: type === 'prueba' ? DEFAULT_CRITERIA_BY_ROLE[prev.role] || [] : [],
    }));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('jobs').insert({
        local_id: user.id,
        role_required: formData.role,
        skills_required: formData.skillsRequired,
        shift_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        hourly_rate: formData.hourlyRate,
        auto_alta: formData.autoAlta,
        job_type: formData.jobType,
        is_urgent: formData.jobType === 'extra',
        urgency_level: formData.jobType === 'extra' ? 'high' : 'normal',
        evaluation_criteria: formData.jobType === 'prueba' ? formData.evaluationCriteria : [],
        possible_hire: formData.jobType === 'prueba' ? formData.possibleHire : false,
        trial_shift_period: formData.jobType === 'prueba' ? formData.trialShiftPeriod : null,
        trial_schedule: formData.jobType === 'prueba' ? formData.trialSchedule : null,
        trial_salary_month: formData.jobType === 'prueba' ? formData.trialSalaryMonth : null,
        trial_contract_hours: formData.jobType === 'prueba' ? formData.trialContractHours : null,
        trial_days_off: formData.jobType === 'prueba' ? formData.trialDaysOff : null,
        trial_days_off_type: formData.jobType === 'prueba' ? formData.trialDaysOffType : null,
        trial_days_off_fixed: formData.jobType === 'prueba' && formData.trialDaysOffType === 'fijos' ? formData.trialDaysOffFixed : null,
        latitude: profile?.latitude,
        longitude: profile?.longitude,
        address: profile?.address,
        status: 'open',
      });

      if (error) throw error;
      alert('Oferta publicada correctamente!');
      setShowForm(false);
      loadJobs();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Seguro que quieres eliminar esta oferta?')) return;
    await supabase.from('jobs').update({ deleted_at: new Date().toISOString(), status: 'cancelled' }).eq('id', jobId);
    // Limpiar chats y aplicaciones asociadas para evitar que sigan visibles
    await supabase.from('applications').update({ status: 'withdrawn' }).eq('job_id', jobId);
    loadJobs();
  };

  const handleAcceptApplication = async (applicationId) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    let accepted = false;
    try {
      // Si la RPC falla por falta de extensiones o schema, no bloqueamos
      const { error: accError } = await supabase.rpc('accept_application_safe', { p_app_id: applicationId });
      if (!accError) accepted = true;
    } catch (err) {
      console.warn('RPC accept_application_safe fallo, usando fallback:', err?.message);
    }

    // Fallback manual siempre, para garantizar que cambia el estado
    if (!accepted) {
      try {
        await supabase.from('applications').update({ status: 'accepted' }).eq('id', applicationId);
        await supabase.from('applications').update({ status: 'rejected' }).eq('job_id', app.job_id).neq('id', applicationId).eq('status', 'pending');
        accepted = true;
      } catch (inner) {
        console.error('Error manual accept fallback', inner);
        alert(inner.message || 'No se pudo aceptar la candidatura');
        return;
      }
    }

    if (!accepted) return;

    // Notificación insertada también por trigger; mantenemos redundancia por UX
    await supabase.from('notifications').insert({
      user_id: app.staff_id,
      type: 'application_accepted',
      title: 'Candidatura aceptada!',
      body: `${profile?.business_name} ha aceptado tu candidatura`,
      data: { job_id: selectedJob.id }
    });

    alert('Candidato aceptado!');
    setSelectedJob(null);
    loadJobs();
    loadAcceptedApplications();
  };

  const handleRejectApplication = async (applicationId) => {
    const { error } = await supabase.rpc('reject_application_safe', { p_app_id: applicationId });
    if (error) {
      alert(error.message || 'No se pudo rechazar');
      return;
    }
    loadApplications(selectedJob.id);
  };

  const handleCancelAccepted = async (application) => {
    try {
      await supabase.from('applications').update({ status: 'rejected' }).eq('id', application.id);
      await supabase.from('notifications').insert({
        user_id: application.staff_id,
        type: 'application_rejected',
        title: 'Candidatura cancelada',
        body: `${profile?.business_name || 'El local'} ha cancelado tu aceptación`,
        data: { job_id: application.job_id }
      });
      loadApplications(selectedJob?.id);
      loadAcceptedApplications();
    } catch (err) {
      console.error('Error cancelando aceptado', err);
      alert(err.message || 'No se pudo cancelar la aceptación');
    }
  };

  const toggleFavorite = async (staffId) => {
    if (favorites.includes(staffId)) {
      await supabase.from('favorites').delete().eq('local_id', user.id).eq('staff_id', staffId);
      setFavorites(prev => prev.filter(id => id !== staffId));
    } else {
      await supabase.from('favorites').insert({ local_id: user.id, staff_id: staffId });
      setFavorites(prev => [...prev, staffId]);
    }
  };

  const toggleCriteria = (criteria) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.includes(criteria)
        ? prev.evaluationCriteria.filter(c => c !== criteria)
        : [...prev.evaluationCriteria, criteria]
    }));
  };

  if (chatWith) {
    return <ChatView userId={user.id} otherUserId={chatWith.id} otherUserName={chatWith.name} jobId={chatWith.jobId || selectedJob?.id} onClose={() => setChatWith(null)} />;
  }

  if (showStaffSearch) {
    return <StaffSearchView
      currentLocalId={user.id}
      onClose={() => setShowStaffSearch(false)}
      onSelectStaff={(staff) => {
        setShowStaffSearch(false);
        setChatWith({ id: staff.id, name: staff.full_name });
      }}
    />;
  }

  if (showProfileEdit) {
    return <LocalProfileEditView
      profile={profile}
      onClose={() => setShowProfileEdit(false)}
      onUpdate={(updatedProfile) => setProfile(updatedProfile)}
    />;
  }

  return (
    <div className="min-h-screen bg-brand-navy pb-20">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfileEdit(true)} className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center hover:bg-orange-600 transition">
              <Building2 size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{profile?.business_name || 'Mi Local'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} /> {profile?.city || 'Sin ubicacion'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStaffSearch(true)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600" title="Buscar Empleados">
              <Users size={20} className="text-slate-400" />
            </button>
            <button onClick={() => handleToggleNotifications()} className="p-2 bg-slate-700 rounded-full relative hover:bg-slate-600">
              <Bell size={20} className="text-slate-400" />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{notifications.length}</span>}
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400"><LogOut size={20} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition text-sm flex items-center justify-center gap-2"
          >
            <Edit3 size={16} />
            Editar Perfil
          </button>
          <button
            onClick={() => setShowStaffSearch(true)}
            className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition text-sm flex items-center justify-center gap-2"
          >
            <Users size={16} />
            Buscar Empleados
          </button>
        </div>
      </header>

      {/* Vista de candidatos de un job */}
      {selectedJob ? (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => { setSelectedJob(null); setApplications([]); }} className="p-2 bg-slate-700 rounded-full"><ChevronLeft size={20} className="text-white" /></button>
            <div>
              <h2 className="text-white font-bold">Candidatos</h2>
              <p className="text-slate-400 text-sm"><JobTypeBadge type={selectedJob.job_type} /> {ROLES[selectedJob.role_required]?.label} - {formatDate(selectedJob.shift_date)}</p>
            </div>
          </div>

          {/* Chats para esta oferta (si existen) */}
          {jobChats.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-4 mb-4">
              <h4 className="text-white font-bold mb-3">Chats relacionados con esta oferta</h4>
              <div className="space-y-2">
                {jobChats.map(c => (
                  <div key={c.otherId} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                        {c.otherAvatar ? <img src={c.otherAvatar} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{c.otherName}</p>
                        <p className="text-slate-400 text-xs truncate max-w-[260px]">{c.lastMessage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setChatWith({ id: c.otherId, name: c.otherName, jobId: selectedJob?.id }); }} className="px-3 py-1 bg-brand-orange text-white rounded">Chat</button>
                      <button onClick={() => loadStaffProfile(c.otherId)} className="px-3 py-1 bg-slate-700 text-slate-200 rounded">Perfil</button>
                      <button
                        onClick={async () => {
                          if (!confirm('Eliminar este chat?')) return;
                          await supabase.from('messages').delete().eq('job_id', selectedJob?.id).or(`and(sender_id.eq.${user.id},receiver_id.eq.${c.otherId}),and(sender_id.eq.${c.otherId},receiver_id.eq.${user.id})`);
                          await supabase.from('conversations').delete().eq('job_id', selectedJob?.id).or(`and(local_id.eq.${user.id},staff_id.eq.${c.otherId}),and(local_id.eq.${c.otherId},staff_id.eq.${user.id})`);
                          await supabase.from('applications').update({ status: 'withdrawn' }).eq('job_id', selectedJob?.id).eq('staff_id', c.otherId);
                          loadJobChats(selectedJob?.id);
                          setAcceptedApplications(prev => prev.filter(a => !(a.job_id === selectedJob?.id && a.staff_id === c.otherId)));
                          loadAcceptedApplications();
                        }}
                        className="px-3 py-1 bg-red-700 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-500">Aun no hay candidatos</p>
              <p className="text-slate-600 text-sm">Espera a que el staff aplique a tu oferta</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Pendientes</h4>
                  {applications.filter(a => a.status === 'pending').map(app => (
                    <CandidateCard
                      key={app.id}
                      application={app}
                      onAccept={(a) => handleAcceptApplication(a.id)}
                      onReject={(a) => handleRejectApplication(a.id)}
                      onChat={(staffId) => setChatWith({ id: staffId, name: app.staff?.full_name, jobId: selectedJob?.id })}
                      onViewProfile={loadStaffProfile}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(app.staff?.id)}
                    />
                  ))}
                </div>
              )}

              {applications.filter(a => a.status === 'accepted').length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-emerald-300 font-semibold">Aceptados</h4>
                  {applications.filter(a => a.status === 'accepted').map(app => (
                    <CandidateCard
                      key={app.id}
                      application={app}
                      onChat={(staffId) => setChatWith({ id: staffId, name: app.staff?.full_name, jobId: selectedJob?.id })}
                      onViewProfile={loadStaffProfile}
                      onReject={(a) => handleCancelAccepted(a)}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(app.staff?.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : !showForm ? (
        <div className="p-6">
          {/* Botones principales */}
          <button onClick={() => openForm('extra')} className="w-full bg-gradient-to-r from-red-500 to-brand-orange p-6 rounded-3xl shadow-glow mb-4 urgency-pulse">
            <div className="flex items-center justify-center gap-4">
              <Zap size={36} className="text-white" />
              <div className="text-left">
                <h2 className="text-xl font-extrabold text-white">SOLICITAR EXTRA</h2>
                <p className="text-white/70 text-sm">Cubrir un hueco puntual</p>
              </div>
            </div>
          </button>

          <button onClick={() => openForm('prueba')} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 p-6 rounded-3xl mb-6">
            <div className="flex items-center justify-center gap-4">
              <GraduationCap size={36} className="text-white" />
              <div className="text-left">
                <h2 className="text-xl font-extrabold text-white">PUBLICAR PRUEBA</h2>
                <p className="text-white/80 text-sm">Proceso de seleccion</p>
              </div>
            </div>
          </button>

          {/* Candidatos Aceptados */}
          {acceptedApplications.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-900 to-brand-navy-light rounded-2xl p-5 mb-6 border border-emerald-700">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" />
                Candidatos Aceptados ({acceptedApplications.length})
              </h3>
              <div className="space-y-3">
                {acceptedApplications.map(app => (
                  <div key={app.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between hover:bg-slate-700 transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">{app.staff?.full_name?.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{app.staff?.full_name}</p>
                        <p className="text-slate-400 text-xs">
                          {ROLES[app.job?.role_required]?.label || 'Posicion'}
                          {app.job?.job_type && ` · ${app.job.job_type === 'prueba' ? 'Prueba' : 'Extra'}`}
                          {app.job?.shift_date && ` · ${formatDate(app.job.shift_date)}${app.job?.start_time ? ' ' + app.job.start_time.slice(0,5) : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChatWith({ id: app.staff?.id, name: app.staff?.full_name, jobId: app.job_id || app.job?.id })}
                        className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium flex items-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Chat
                      </button>
                      <button
                        onClick={() => { setReviewTargetLocal({ jobId: app.job_id || app.job?.id, reviewedId: app.staff_id, name: app.staff?.full_name, reviewerType: 'local' }); setShowReviewModalLocal(true); }}
                        className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm"
                      >
                        Valorar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de ofertas */}
          <div className="bg-brand-navy-light rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-brand-orange" />
              Mis Ofertas ({jobs.length})
            </h3>

            {jobs.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No has publicado ofertas aun</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => {
                  const pendingApps = job.status === 'open';
                  return (
                    <div key={job.id} className="bg-slate-800 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <JobTypeBadge type={job.job_type} />
                          <RoleBadge role={job.role_required} size="sm" />
                        </div>
                        <button onClick={() => deleteJob(job.id)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{formatDate(job.shift_date)} · {job.start_time?.slice(0,5)} - {job.end_time?.slice(0,5)}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          job.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                          job.status === 'matched' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {job.status === 'open' ? 'Abierta' : job.status === 'matched' ? 'Asignada' : job.status}
                        </span>
                        <button
                          onClick={() => { setSelectedJob(job); loadApplications(job.id); loadJobChats(job.id); }}
                          className="text-brand-orange text-sm font-medium flex items-center gap-1"
                        >
                          Ver detalle <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Formulario de creación */
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className={`rounded-2xl p-4 ${formData.jobType === 'prueba' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-brand-orange/20 border border-brand-orange/30'}`}>
            <div className="flex items-center gap-3">
              {formData.jobType === 'prueba' ? <GraduationCap size={28} className="text-amber-400" /> : <Zap size={28} className="text-brand-orange" />}
              <div>
                <h2 className="text-white font-bold text-lg">{formData.jobType === 'prueba' ? 'Publicar Prueba' : 'Solicitar Extra'}</h2>
                <p className="text-slate-400 text-sm">{formData.jobType === 'prueba' ? 'Proceso de seleccion con evaluacion' : 'Cubrir turno puntual'}</p>
              </div>
            </div>
          </div>

          {formData.jobType === 'prueba' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-300 text-sm">
                <strong>Prueba:</strong> Los candidatos envian CV y carta de presentacion. Tu decides a quien seleccionar despues de chatear con ellos.
              </p>
            </div>
          )}

          <div className="bg-brand-navy-light rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Puesto</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLES).map(([key, role]) => (
                <button key={key} type="button" onClick={() => setFormData({ ...formData, role: key })} className={`p-3 rounded-xl text-left transition-all ${formData.role === key ? (formData.jobType === 'prueba' ? 'bg-amber-500' : 'bg-brand-orange') + ' text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <role.icon size={20} className="mb-1" /><span className="text-sm font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-brand-navy-light rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Fecha y Horario</h3>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl mb-3 outline-none" />
            <div className="flex gap-4">
              <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" />
              <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl outline-none" />
            </div>
          </div>

          <div className="bg-brand-navy-light rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Salario por hora</h3>
            <div className="flex items-center gap-4">
              <input type="range" min="8" max="25" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })} className="flex-1 accent-brand-orange" />
              <div className="bg-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]"><span className="text-2xl font-bold text-white">{formData.hourlyRate}EUR</span></div>
            </div>
          </div>

          {formData.jobType === 'prueba' && (
            <div className="bg-brand-navy-light rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold mb-2">Condiciones de prueba</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Turno</p>
                  <div className="flex gap-2">
                    {['manana', 'tarde'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, trialShiftPeriod: opt })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.trialShiftPeriod === opt ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'}`}
                      >
                        {opt === 'manana' ? 'Mañana' : 'Tarde'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Horario</p>
                  <input
                    type="text"
                    value={formData.trialSchedule}
                    onChange={(e) => setFormData({ ...formData, trialSchedule: e.target.value })}
                    placeholder="Ej: 09:00-17:00"
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Sueldo / mes (EUR)</p>
                  <input
                    type="number"
                    value={formData.trialSalaryMonth}
                    onChange={(e) => setFormData({ ...formData, trialSalaryMonth: parseInt(e.target.value || 0) })}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Horas contrato</p>
                  <input
                    type="number"
                    value={formData.trialContractHours}
                    onChange={(e) => setFormData({ ...formData, trialContractHours: parseInt(e.target.value || 0) })}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Días libres</p>
                  <input
                    type="text"
                    value={formData.trialDaysOff}
                    onChange={(e) => setFormData({ ...formData, trialDaysOff: e.target.value })}
                    placeholder="Ej: 2 dias/semana"
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Tipo</p>
                  <div className="flex gap-2">
                    {['fijos', 'rotativos'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, trialDaysOffType: opt })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.trialDaysOffType === opt ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'}`}
                      >
                        {opt === 'fijos' ? 'Fijos' : 'Rotativos'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.trialDaysOffType === 'fijos' && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Selecciona los días libres</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const exists = formData.trialDaysOffFixed.includes(day);
                          setFormData({
                            ...formData,
                            trialDaysOffFixed: exists
                              ? formData.trialDaysOffFixed.filter(d => d !== day)
                              : [...formData.trialDaysOffFixed, day]
                          });
                        }}
                        className={`px-3 py-2 rounded-lg text-sm capitalize ${formData.trialDaysOffFixed.includes(day) ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.jobType === 'prueba' && (
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2"><ClipboardCheck size={18} className="text-amber-400" />Criterios de evaluacion</h3>
              <p className="text-slate-400 text-xs mb-3">Selecciona los criterios que evaluaras</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set([...(DEFAULT_CRITERIA_BY_ROLE[formData.role] || []), 'Puntualidad', 'Comunicacion', 'Iniciativa', 'Actitud'])].map(c => (
                  <button key={c} type="button" onClick={() => toggleCriteria(c)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.evaluationCriteria.includes(c) ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800 rounded-2xl p-5">
            <label className="flex items-center gap-4 cursor-pointer">
              <input type="checkbox" checked={formData.autoAlta} onChange={(e) => setFormData({ ...formData, autoAlta: e.target.checked })} className="sr-only peer" />
              <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center ${formData.autoAlta ? 'bg-brand-orange border-brand-orange' : 'bg-slate-700 border-slate-500'}`}>
                {formData.autoAlta && <CheckCircle size={16} className="text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-brand-orange" />
                  <span className="text-white font-bold">Alta/Baja SS automatica</span>
                  <span className="bg-brand-orange text-white text-xs px-2 py-0.5 rounded-full">+2EUR</span>
                </div>
                <p className="text-slate-400 text-sm">Gestionamos la burocracia</p>
              </div>
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full ${formData.jobType === 'prueba' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-brand-orange'} text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2`}>
            {loading && <Loader2 size={20} className="animate-spin" />}
            Publicar {formData.jobType === 'prueba' ? 'Prueba' : 'Extra'}
          </button>

          <button type="button" onClick={() => setShowForm(false)} className="w-full text-slate-400 py-3">Cancelar</button>
        </form>
      )}

      {/* Modal de Notificaciones */}
      {showNotifications && (
        <div onClick={() => handleToggleNotifications(true)} className="fixed inset-0 bg-black/50 z-40 flex items-start justify-end pt-20 pr-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-brand-navy-light rounded-2xl w-full max-w-sm max-h-[60vh] overflow-auto shadow-2xl">
            <div className="p-4 border-b border-slate-700 sticky top-0 bg-brand-navy-light">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Bell size={18} className="text-brand-orange" />
                Notificaciones ({notifications.length})
              </h2>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-12 p-4">
                <Bell size={40} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500">Sin notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-slate-800 rounded-xl p-3 border-l-4 border-brand-orange hover:bg-slate-700 transition">
                    <p className="text-white font-medium text-sm">{notif.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{notif.body}</p>
                    <p className="text-slate-500 text-xs mt-2">{formatDateTime(notif.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Perfil Staff */}
      <Modal isOpen={showStaffProfile} onClose={() => setShowStaffProfile(false)} title="Perfil del trabajador" size="lg">
        <StaffProfileModal profile={staffProfileView} onClose={() => setShowStaffProfile(false)} />
      </Modal>

      {/* Modal de Review */}
      <Modal
        isOpen={showReviewModalLocal}
        onClose={() => { setShowReviewModalLocal(false); setReviewTargetLocal(null); }}
        title="Valorar"
        size="lg"
      >
        <ReviewModal
          isOpen={showReviewModalLocal}
          targetName={reviewTargetLocal?.name || ''}
          onClose={() => { setShowReviewModalLocal(false); setReviewTargetLocal(null); }}
          onSubmit={async ({ attendancePresent, rating, punctuality, professionalism, skills, communication, wouldHireAgain, fairTreatment, comment }) => {
            if (!reviewTargetLocal?.jobId || !reviewTargetLocal?.reviewedId) return;
            try {
              const { error } = await supabase.from('reviews').insert({
                job_id: reviewTargetLocal.jobId,
                reviewer_id: user.id,
                reviewed_id: reviewTargetLocal.reviewedId,
                attendance_present: attendancePresent,
                rating,
                punctuality,
                professionalism,
                skills,
                communication,
                would_hire_again: wouldHireAgain,
                fair_treatment: fairTreatment,
                comment
              });
              if (error) {
                if (error.code === '23505') {
                  alert('Ya has valorado esta oferta. Solo se permite una review por job y usuario.');
                  return;
                }
                throw error;
              }
              alert('Valoración enviada');
            } catch (err) {
              console.error('Error creando review', err);
              alert(err.message || 'No se pudo guardar la valoración (verifica permisos/RLS)');
            } finally {
              setShowReviewModalLocal(false);
              setReviewTargetLocal(null);
            }
          }}
        />
      </Modal>
    </div>
  );
};

// ============================================
// VISTA STAFF
// ============================================
const StaffView = ({ user, profile, onLogout, setProfile }) => {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCarnet, setShowCarnet] = useState(false);
  const [carnetStats, setCarnetStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('buscar');
  const [chatWith, setChatWith] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [viewJob, setViewJob] = useState(null);
  const [localProfileView, setLocalProfileView] = useState(null);
  const [showLocalProfile, setShowLocalProfile] = useState(false);
  const [showReviewModalStaff, setShowReviewModalStaff] = useState(false);
  const [reviewTargetStaff, setReviewTargetStaff] = useState(null);
  const [showReviewModalLocal, setShowReviewModalLocal] = useState(false);
  const [reviewTargetLocal, setReviewTargetLocal] = useState(null);
  const [showLocalSearch, setShowLocalSearch] = useState(false);

  useEffect(() => {
    loadJobs();
    loadMyApplications();
    loadNotifications();

    const channel = supabase.channel('staff-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => loadJobs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => loadNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const loadJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select(`*, local:profiles!jobs_local_id_fkey(business_name, city, address, avatar_url, business_type, bio, rating, total_reviews, menu_url, service_description)`)
      .eq('status', 'open')
      .is('deleted_at', null)
      .gte('shift_date', new Date().toISOString().split('T')[0])
      .order('is_urgent', { ascending: false })
      .order('shift_date', { ascending: true })
      .limit(30);

    if (data) {
      const jobsWithDistance = data.map(job => ({
        ...job,
        distance: profile?.latitude && job.latitude
          ? Math.round(getDistance(profile.latitude, profile.longitude, job.latitude, job.longitude) * 10) / 10
          : null
      })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
      setJobs(jobsWithDistance);
    }
    setLoading(false);
  };

  const loadMyApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select(`*, job:jobs(*, local:profiles!jobs_local_id_fkey(business_name))`)
      .eq('staff_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setMyApplications(data);
  };

  const openLocalProfile = async (localId, localData = null) => {
    if (!localId) return;
    // Mostrar inmediatamente con los datos que ya tenemos en el job, por si RLS bloquea la consulta
    if (localData) {
      setLocalProfileView(localData);
      setShowLocalProfile(true);
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, business_type, address, city, bio, avatar_url, rating, total_reviews, menu_url, service_description')
        .eq('id', localId)
        .single();
      if (error) throw error;
      setLocalProfileView(data);
      setShowLocalProfile(true);
    } catch (err) {
      console.error('Error loading local profile:', err);
      if (!localData) alert('No se pudo cargar el perfil del local');
    }
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadNotifications(data.filter(n => !n.read_at).length);
    }
  };

  const handleToggleNotifications = async (forceClose = false) => {
    if (forceClose || showNotifications) {
      setShowNotifications(false);
      return;
    }

    setShowNotifications(true);
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }

    try {
      await loadNotifications();
      setUnreadNotifications(0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const loadCarnetStats = async () => {
    const { data } = await supabase.rpc('get_carnet_stats', { p_staff_id: user.id });
    if (data) setCarnetStats(data);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const submitApplication = async (applicationData) => {
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: selectedJob.id,
        staff_id: user.id,
        status: 'pending',
        distance_km: selectedJob.distance,
        cover_letter: applicationData.coverLetter,
        phone_number: applicationData.phone,
        experience_summary: applicationData.experienceSummary,
        availability_note: applicationData.availabilityNote,
        cv_snapshot_url: applicationData.cvSnapshotUrl,
        photo_url: applicationData.photoUrl,
      });

      if (error) throw error;

      alert('Candidatura enviada! El local revisara tu perfil.');
      setShowApplicationForm(false);
      setSelectedJob(null);
      loadMyApplications();
      loadJobs();
    } catch (err) {
      if (err.code === '23505') {
        alert('Ya has aplicado a esta oferta');
      } else {
        alert('Error: ' + err.message);
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    // Filtrar jobs a los que ya hemos aplicado
    const alreadyApplied = myApplications.some(app => app.job_id === job.id);
    if (alreadyApplied) return false;

    if (filter === 'extra') return job.job_type === 'extra';
    if (filter === 'prueba') return job.job_type === 'prueba';
    return true;
  });

  if (chatWith) {
    return <ChatView userId={user.id} otherUserId={chatWith.id} otherUserName={chatWith.name} jobId={chatWith.jobId} onClose={() => setChatWith(null)} />;
  }

  if (showLocalSearch) {
    return <LocalSearchView
      currentStaffId={user.id}
      onClose={() => setShowLocalSearch(false)}
      onSelectLocal={(local) => {
        setShowLocalSearch(false);
        setChatWith({ id: local.id, name: local.business_name });
      }}
    />;
  }

  if (viewJob) {
    const applied = myApplications.some(app => app.job_id === viewJob.id && !['cancelled'].includes(app.status));
    const appliedStatus = myApplications.find(app => app.job_id === viewJob.id && !['cancelled'].includes(app.status))?.status;
    return (
      <div className="min-h-screen bg-brand-navy pb-24">
        <header className="bg-brand-navy-light border-b border-slate-700 p-4 flex items-center gap-3">
          <button onClick={() => setViewJob(null)} className="p-2 text-slate-400">
            <ChevronLeft size={24} />
          </button>
          <div>
            <p className="text-slate-400 text-xs">Oferta</p>
            <h2 className="text-white font-bold">{viewJob.local?.business_name || 'Local'}</h2>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="bg-brand-navy-light rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <JobTypeBadge type={viewJob.job_type} />
                  <RoleBadge role={viewJob.role_required} size="sm" />
                </div>
                <p className="text-slate-300 text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-brand-orange" />
                  {(viewJob.address || viewJob.local?.address || 'Ubicación no especificada')} · {(viewJob.local?.city || '')}
                </p>
              </div>
              <button onClick={() => openLocalProfile(viewJob.local_id, viewJob.local)} className="text-brand-orange text-sm underline">Ver local</button>
            </div>

            <div className="flex items-center gap-4 text-slate-300 text-sm">
              <span className="flex items-center gap-1"><CalendarDays size={14} className="text-brand-orange" />{formatDate(viewJob.shift_date)}</span>
              <span className="flex items-center gap-1"><Clock size={14} className="text-brand-orange" />{viewJob.start_time?.slice(0,5)} - {viewJob.end_time?.slice(0,5)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{viewJob.hourly_rate}EUR</span>
              <span className="text-slate-400">/h</span>
            </div>

            {viewJob.job_type === 'prueba' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2">
                <p className="text-amber-300 text-sm font-semibold">Condiciones si te contratan:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-200 text-sm">
                  <span>Turno: {viewJob.trial_shift_period === 'manana' ? 'Mañana' : viewJob.trial_shift_period === 'tarde' ? 'Tarde' : 'No especificado'}</span>
                  <span>Horario: {viewJob.trial_schedule || 'No especificado'}</span>
                  <span>Sueldo mes: {viewJob.trial_salary_month ? `${viewJob.trial_salary_month} EUR` : 'No especificado'}</span>
                  <span>Horas contrato: {viewJob.trial_contract_hours || 'No especificado'}</span>
                  <span>Dias libres: {viewJob.trial_days_off || 'No especificado'}</span>
                  <span>Tipo dias libres: {viewJob.trial_days_off_type || 'No especificado'}</span>
                  {viewJob.trial_days_off_type === 'fijos' && (
                    <span className="col-span-2">Dias libres fijos: {viewJob.trial_days_off_fixed?.length ? viewJob.trial_days_off_fixed.join(', ') : 'No especificado'}</span>
                  )}
                </div>
              </div>
            )}

            {viewJob.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewJob.skills_required.map(skill => (
                  <span key={skill} className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-full border border-slate-700">{skill}</span>
                ))}
              </div>
            )}

            {viewJob.notes && (
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-white font-semibold text-sm mb-1">Notas</p>
                <p className="text-slate-300 text-sm">{viewJob.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setChatWith({ id: viewJob.local_id, name: viewJob.local?.business_name, jobId: viewJob.id })}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Chat con el local
            </button>
            {applied ? (
              <div className="w-full bg-slate-800 text-slate-200 py-3 rounded-xl text-center text-sm">
                {appliedStatus === 'accepted' ? 'Candidatura aceptada' : `Ya aplicaste (${appliedStatus || 'pendiente'})`}
              </div>
            ) : (
              <button
                onClick={() => { handleApply(viewJob); setViewJob(null); }}
                className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Aplicar a esta oferta
              </button>
            )}
          </div>
        </div>
        <Modal isOpen={showLocalProfile} onClose={() => setShowLocalProfile(false)} title="Perfil del Local" size="lg">
          <LocalProfileModal local={localProfileView} onClose={() => setShowLocalProfile(false)} />
        </Modal>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-brand-navy pb-24">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-brand-orange" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{profile?.full_name || 'Mi Perfil'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} /> {profile?.city || 'Sin ubicacion'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLocalSearch(true)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600" title="Buscar Locales">
              <Building2 size={20} className="text-slate-400" />
            </button>
            <button
              onClick={() => { setShowCarnet(true); loadCarnetStats(); }}
              className="p-2 bg-gradient-to-r from-brand-orange to-red-500 rounded-full"
            >
              <QrCode size={20} className="text-white" />
            </button>
            <button onClick={() => handleToggleNotifications()} className="p-2 bg-slate-700 rounded-full relative">
              <Bell size={20} className="text-slate-400" />
              {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadNotifications}</span>}
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400"><LogOut size={20} /></button>
          </div>
        </div>

        {/* Buscar Locales Button */}
        <div className="mb-3">
          <button
            onClick={() => setShowLocalSearch(true)}
            className="w-full px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition text-sm flex items-center justify-center gap-2"
          >
            <Building2 size={16} />
            Buscar Locales / Restaurantes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('buscar')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm ${activeTab === 'buscar' ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Buscar Ofertas
          </button>
          <button
            onClick={() => setActiveTab('mis')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm relative ${activeTab === 'mis' ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Mis Candidaturas
            {myApplications.filter(a => a.status === 'accepted').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center">
                {myApplications.filter(a => a.status === 'accepted').length}
              </span>
            )}
          </button>
        </div>

        {/* Filtros */}
        {activeTab === 'buscar' && (
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'extra', label: 'Extras', icon: Zap },
              { key: 'prueba', label: 'Pruebas', icon: GraduationCap },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
                  filter === f.key
                    ? f.key === 'extra' ? 'bg-red-500 text-white' : f.key === 'prueba' ? 'bg-amber-500 text-white' : 'bg-brand-orange text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {f.icon && <f.icon size={14} />}
                {f.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {activeTab === 'buscar' ? (
        <div className="p-4 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay ofertas disponibles</p>
              <p className="text-sm">Vuelve a revisar mas tarde</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className={`bg-brand-navy-light rounded-2xl overflow-hidden shadow-card ${job.job_type === 'extra' && job.is_urgent ? 'ring-2 ring-red-500' : job.job_type === 'prueba' ? 'ring-2 ring-amber-500/50' : ''}`}>
                <div className={`p-4 ${job.job_type === 'extra' ? 'bg-gradient-to-r from-red-500/20 to-transparent' : 'bg-gradient-to-r from-amber-500/20 to-transparent'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{job.local?.business_name || 'Local'}</h3>
                        {job.auto_alta && <div className="bg-blue-500/20 p-1 rounded"><Shield size={12} className="text-blue-400" /></div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <JobTypeBadge type={job.job_type} />
                        <RoleBadge role={job.role_required} size="sm" />
                      </div>
                    </div>
                    {job.job_type === 'extra' && job.is_urgent && <UrgencyBadge level={job.urgency_level} />}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
                    {job.distance && <span className="flex items-center gap-1"><MapPin size={14} className="text-brand-orange" />{job.distance}km</span>}
                    <span className="flex items-center gap-1"><CalendarDays size={14} className="text-brand-orange" />{formatDate(job.shift_date)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} className="text-brand-orange" />{job.start_time?.slice(0,5)} - {job.end_time?.slice(0,5)}</span>
                  </div>

                  {job.job_type === 'prueba' && job.possible_hire && (
                    <div className="bg-amber-500/10 rounded-lg px-3 py-2 mb-3">
                      <p className="text-amber-300 text-xs flex items-center gap-1">
                        <GraduationCap size={12} />
                        Posibilidad de contratacion
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-white">{job.hourly_rate}EUR</span>
                      <span className="text-slate-400">/h</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewJob(job)}
                      className="flex-1 bg-slate-800 text-slate-100 py-2 rounded-xl text-sm font-medium"
                    >
                      Ver oferta
                    </button>
                    <button
                      onClick={() => openLocalProfile(job.local_id, job.local)}
                      className="flex-1 bg-slate-700 text-slate-200 py-2 rounded-xl text-sm font-medium"
                    >
                      Ver local
                    </button>
                  </div>

                  {job.job_type === 'prueba' ? (
                    <button
                      onClick={() => handleApply(job)}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Enviar Candidatura
                    </button>
                  ) : (
                    <SwipeToConfirm onConfirm={() => handleApply(job)} text="Desliza para aplicar" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Mis Candidaturas */
        <div className="p-4 space-y-4">
          {myApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>No has enviado candidaturas</p>
              <p className="text-sm">Explora las ofertas disponibles</p>
            </div>
          ) : (
            myApplications
              .filter(app => app.job?.deleted_at === null && app.job?.status !== 'cancelled')
              .map((app) => (
              <div key={app.id} className={`bg-brand-navy-light rounded-xl p-4 ${app.status === 'accepted' ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{app.job?.local?.business_name}</h3>
                      <JobTypeBadge type={app.job?.job_type} />
                    </div>
                    <RoleBadge role={app.job?.role_required} size="sm" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Aceptada!' : 'Rechazada'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  {formatDate(app.job?.shift_date)} · {app.job?.start_time?.slice(0,5)} - {app.job?.end_time?.slice(0,5)}
                </p>

                {app.status === 'accepted' && (
                  <div className="bg-emerald-500/10 rounded-lg p-3 mb-3">
                    <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                      <CheckCircle size={16} />
                      Has sido seleccionado!
                    </p>
                    <p className="text-slate-400 text-xs mt-1">Contacta con el local para confirmar detalles</p>
                  </div>
                )}

                {app.status === 'accepted' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setChatWith({ id: app.job?.local_id, name: app.job?.local?.business_name, jobId: app.job?.id })}
                      className="w-full bg-brand-orange text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Chat con el local
                    </button>
                    <button
                      onClick={() => { setReviewTargetLocal({ jobId: app.job?.id, reviewedId: app.job?.local_id, name: app.job?.local?.business_name, reviewerType: 'staff' }); setShowReviewModalLocal(true); }}
                      className="w-full bg-slate-800 text-slate-100 py-2 rounded-xl font-medium"
                    >
                      Valorar al local
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Panel de Notificaciones */}
      {showNotifications && (
        <div onClick={() => handleToggleNotifications(true)} className="fixed inset-0 bg-black/50 z-40 flex items-start justify-end pt-20 pr-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-brand-navy-light rounded-2xl w-full max-w-sm max-h-[65vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-700 sticky top-0 bg-brand-navy-light flex items-center justify-between">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Bell size={18} className="text-brand-orange" />
                Notificaciones ({notifications.length})
              </h2>
              <button onClick={() => handleToggleNotifications(true)} className="text-slate-400 text-sm hover:text-white">
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={40} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-500">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <div key={notif.id} className={`rounded-xl p-3 border ${isUnread ? 'border-brand-orange/60 bg-slate-800' : 'border-slate-700 bg-slate-800/70'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-medium text-sm">{notif.title}</p>
                        {isUnread && <span className="text-amber-400 text-xs font-semibold">Nuevo</span>}
                      </div>
                      {notif.body && <p className="text-slate-300 text-sm mt-1">{notif.body}</p>}
                      <p className="text-slate-500 text-xs mt-2">{formatDateTime(notif.created_at)}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      <Modal isOpen={showLocalProfile} onClose={() => setShowLocalProfile(false)} title="Perfil del Local" size="lg">
        <LocalProfileModal local={localProfileView} onClose={() => setShowLocalProfile(false)} />
      </Modal>

      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="Mi Perfil" size="lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-slate-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white">{profile?.full_name}</h3>
          <RoleBadge role={profile?.staff_role} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Star size={20} className="mx-auto text-yellow-400 mb-1" />
            <p className="text-white font-bold">{profile?.rating?.toFixed(1) || '5.0'}</p>
            <p className="text-slate-400 text-xs">Rating</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <CheckCircle size={20} className="mx-auto text-emerald-400 mb-1" />
            <p className="text-white font-bold">{profile?.reliability_score || 100}%</p>
            <p className="text-slate-400 text-xs">Fiabilidad</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center">
            <Briefcase size={20} className="mx-auto text-brand-orange mb-1" />
            <p className="text-white font-bold">{profile?.total_shifts || 0}</p>
            <p className="text-slate-400 text-xs">Turnos</p>
          </div>
        </div>

        {profile?.bio && (
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <h4 className="text-white font-semibold mb-2">Sobre mi</h4>
            <p className="text-slate-300 text-sm">{profile.bio}</p>
          </div>
        )}

        {profile?.skills?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Mis Habilidades</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => <SkillTag key={skill} skill={skill} />)}
            </div>
          </div>
        )}

        <button
          onClick={() => { setShowProfile(false); setShowEditProfile(true); }}
          className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Edit3 size={18} />
          Editar Perfil
        </button>
      </Modal>

      {/* Modal Editar Perfil */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Editar Perfil" size="lg">
        <EditProfileModal
          profile={profile}
          onSave={(updated) => setProfile(updated)}
          onClose={() => setShowEditProfile(false)}
        />
      </Modal>

      {/* Modal Carnet Digital */}
      <Modal isOpen={showCarnet} onClose={() => setShowCarnet(false)} title="Carnet Digital" size="lg">
        <CarnetDigital profile={profile} stats={carnetStats || profile} onClose={() => setShowCarnet(false)} />
      </Modal>

      {/* Modal de Review (staff valora local) */}
      <Modal
        isOpen={showReviewModalLocal}
        onClose={() => { setShowReviewModalLocal(false); setReviewTargetLocal(null); }}
        title="Valorar"
        size="lg"
      >
        <LocalReviewModal
          isOpen={showReviewModalLocal}
          targetName={reviewTargetLocal?.name || ''}
          onClose={() => { setShowReviewModalLocal(false); setReviewTargetLocal(null); }}
          onSubmit={async ({ rating, fairTreatment, wouldReturn, comment }) => {
            if (!reviewTargetLocal?.jobId || !reviewTargetLocal?.reviewedId) return;
            try {
              const { error } = await supabase.from('reviews').insert({
                job_id: reviewTargetLocal.jobId,
                reviewer_id: user.id,
                reviewed_id: reviewTargetLocal.reviewedId,
                rating,
                fair_treatment: fairTreatment,
                would_hire_again: wouldReturn,
                comment,
                local_review: true
              });
              if (error) {
                if (error.code === '23505') {
                  alert('Ya has valorado esta oferta. Solo se permite una review por job y usuario.');
                  return;
                }
                throw error;
              }
              alert('Valoracion enviada');
            } catch (err) {
              console.error('Error creando review', err);
              alert(err.message || 'No se pudo guardar la valoracion (verifica permisos/RLS)');
            } finally {
              setShowReviewModalLocal(false);
              setReviewTargetLocal(null);
            }
          }}
        />
      </Modal>

      {/* Modal Formulario de Aplicacion */}
      <Modal isOpen={showApplicationForm} onClose={() => setShowApplicationForm(false)} title="Enviar Candidatura" size="lg">
        {selectedJob && (
          <ApplicationForm
            job={selectedJob}
            profile={profile}
            onSubmit={submitApplication}
            onClose={() => setShowApplicationForm(false)}
          />
        )}
      </Modal>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-navy-light border-t border-slate-700 p-4 flex justify-around">
        <button onClick={() => setActiveTab('buscar')} className={`flex flex-col items-center gap-1 ${activeTab === 'buscar' ? 'text-brand-orange' : 'text-slate-500'}`}>
          <Search size={24} />
          <span className="text-xs">Buscar</span>
        </button>
        <button onClick={() => setActiveTab('mis')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'mis' ? 'text-brand-orange' : 'text-slate-500'}`}>
          <Briefcase size={24} />
          <span className="text-xs">Candidaturas</span>
          {myApplications.filter(a => a.status === 'accepted').length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-emerald-500 rounded-full text-white text-[10px] flex items-center justify-center">
              {myApplications.filter(a => a.status === 'accepted').length}
            </span>
          )}
        </button>
        <button onClick={() => setShowProfile(true)} className="flex flex-col items-center gap-1 text-slate-500">
          <User size={24} />
          <span className="text-xs">Perfil</span>
        </button>
        <button onClick={() => { setShowCarnet(true); loadCarnetStats(); }} className="flex flex-col items-center gap-1 text-slate-500">
          <QrCode size={24} />
          <span className="text-xs">Carnet</span>
        </button>
      </div>
    </div>
  );
};

// ============================================
// APP PRINCIPAL
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingType, setOnboardingType] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
    setLoading(false);
  };

  const handleAuth = (authUser, isNew = false) => {
    setUser(authUser);
    if (isNew) setNeedsOnboarding(true);
    else loadProfile(authUser.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setNeedsOnboarding(false);
    setOnboardingType(null);
  };

  const handleOnboardingComplete = () => {
    loadProfile(user.id);
    setOnboardingType(null);
  };

  if (loading) return <LoadingSpinner />;

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  if (needsOnboarding) {
    if (!onboardingType) return <OnboardingTypeSelect onSelect={setOnboardingType} />;
    if (onboardingType === 'local') return <OnboardingLocal user={user} onComplete={handleOnboardingComplete} />;
    if (onboardingType === 'staff') return <OnboardingStaff user={user} onComplete={handleOnboardingComplete} />;
  }

  if (profile?.user_type === 'local') return <LocalView user={user} profile={profile} onLogout={handleLogout} setProfile={setProfile} />;
  if (profile?.user_type === 'staff') return <StaffView user={user} profile={profile} onLogout={handleLogout} setProfile={setProfile} />;

  return <AuthScreen onAuth={handleAuth} />;
}
