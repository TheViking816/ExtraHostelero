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
  'Gestion caja', 'Reservas', 'Delivery'
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
const CandidateCard = ({ application, onAccept, onReject, onChat, onToggleFavorite, isFavorite }) => {
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

      <div className="flex gap-2">
        <button
          onClick={() => onReject(application.id)}
          className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl font-medium flex items-center justify-center gap-1"
        >
          <XCircle size={16} />
          Rechazar
        </button>
        <button
          onClick={() => onChat(staff?.id)}
          className="flex-1 bg-slate-700 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-1"
        >
          <MessageCircle size={16} />
          Chat
        </button>
        <button
          onClick={() => onAccept(application.id)}
          className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-1"
        >
          <Check size={16} />
          Aceptar
        </button>
      </div>
    </div>
  );
};

// ============================================
// SISTEMA DE CHAT
// ============================================
const ChatView = ({ userId, otherUserId, otherUserName, jobId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const subscription = subscribeToMessages();
    return () => { subscription?.unsubscribe(); };
  }, [userId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) setMessages(data);
    setLoading(false);

    // Marcar como leidos
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .is('read_at', null);
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`chat-${userId}-${otherUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, (payload) => {
        if (payload.new.sender_id === otherUserId) {
          setMessages(prev => [...prev, payload.new]);
          // Marcar como leido
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', payload.new.id);
        }
      })
      .subscribe();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender_id: userId,
      receiver_id: otherUserId,
      job_id: jobId,
      content: newMessage.trim(),
      message_type: 'text'
    };

    setNewMessage('');

    const { data, error } = await supabase.from('messages').insert(message).select().single();
    if (data) setMessages(prev => [...prev, data]);
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
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading ? (
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
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
            placeholder="Escribe un mensaje..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-brand-orange text-white p-3 rounded-xl disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
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
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    hourly_rate_min: profile?.hourly_rate_min || 10,
    cv_text: profile?.cv_text || '',
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
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
        <label className="text-slate-400 text-sm mb-2 block">CV / Experiencia detallada</label>
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
// VISTA LOCAL
// ============================================
const LocalView = ({ user, profile, onLogout, setProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('extra');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [chatWith, setChatWith] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    role: 'camarero', date: new Date().toISOString().split('T')[0],
    startTime: '20:00', endTime: '02:00', hourlyRate: 12,
    autoAlta: true, jobType: 'extra', evaluationCriteria: [],
    possibleHire: true, skillsRequired: [],
  });

  useEffect(() => {
    loadJobs();
    loadFavorites();
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
    loadJobs();
  };

  const handleAcceptApplication = async (applicationId) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    await supabase.from('applications').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', applicationId);
    await supabase.from('applications').update({ status: 'rejected' }).eq('job_id', selectedJob.id).neq('id', applicationId);
    await supabase.from('jobs').update({ status: 'matched', matched_staff_id: app.staff_id, matched_at: new Date().toISOString() }).eq('id', selectedJob.id);

    // Notificar al staff
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
  };

  const handleRejectApplication = async (applicationId) => {
    await supabase.from('applications').update({ status: 'rejected', responded_at: new Date().toISOString() }).eq('id', applicationId);
    loadApplications(selectedJob.id);
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
    return <ChatView userId={user.id} otherUserId={chatWith.id} otherUserName={chatWith.name} jobId={selectedJob?.id} onClose={() => setChatWith(null)} />;
  }

  return (
    <div className="min-h-screen bg-brand-navy pb-20">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{profile?.business_name || 'Mi Local'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} /> {profile?.city || 'Sin ubicacion'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-slate-700 rounded-full relative">
              <Bell size={20} className="text-slate-400" />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{notifications.length}</span>}
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400"><LogOut size={20} /></button>
          </div>
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

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-500">Aun no hay candidatos</p>
              <p className="text-slate-600 text-sm">Espera a que el staff aplique a tu oferta</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.filter(a => a.status === 'pending').map(app => (
                <CandidateCard
                  key={app.id}
                  application={app}
                  onAccept={handleAcceptApplication}
                  onReject={handleRejectApplication}
                  onChat={(staffId) => setChatWith({ id: staffId, name: app.staff?.full_name })}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(app.staff?.id)}
                />
              ))}
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
                        {job.status === 'open' && (
                          <button
                            onClick={() => { setSelectedJob(job); loadApplications(job.id); }}
                            className="text-brand-orange text-sm font-medium flex items-center gap-1"
                          >
                            Ver candidatos <ChevronRight size={16} />
                          </button>
                        )}
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
      .select(`*, local:profiles!jobs_local_id_fkey(business_name, city, address, avatar_url)`)
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
            <button
              onClick={() => { setShowCarnet(true); loadCarnetStats(); }}
              className="p-2 bg-gradient-to-r from-brand-orange to-red-500 rounded-full"
            >
              <QrCode size={20} className="text-white" />
            </button>
            <button className="p-2 bg-slate-700 rounded-full relative">
              <Bell size={20} className="text-slate-400" />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{notifications.length}</span>}
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400"><LogOut size={20} /></button>
          </div>
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

                <div className="p-4 pt-0">
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
            myApplications.map((app) => (
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
                  <button
                    onClick={() => setChatWith({ id: app.job?.local_id, name: app.job?.local?.business_name, jobId: app.job?.id })}
                    className="w-full bg-brand-orange text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Chat con el local
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Perfil */}
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
