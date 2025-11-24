import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import {
  Zap, MapPin, Clock, Star, CheckCircle, AlertTriangle, User, Building2,
  ChefHat, Coffee, Utensils, Users, Shield, BadgeCheck, Timer, Euro,
  Phone, FileText, ArrowRight, X, Bell, Search, TrendingUp,
  Award, Calendar, Navigation, Briefcase, MessageCircle,
  ClipboardCheck, UserCheck, Eye, CalendarDays, GraduationCap,
  Mail, Lock, LogOut, Loader2, Camera, MapPinned
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

// Criterios predeterminados por puesto
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

const SkillTag = ({ skill, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-block text-xs px-2.5 py-1 rounded-full border transition-all ${
      selected
        ? 'bg-brand-orange text-white border-brand-orange'
        : 'bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500'
    }`}
  >
    {skill}
  </button>
);

const TrialBadge = () => (
  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
    <GraduationCap size={12} />
    PRUEBA
  </span>
);

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
      {level !== 'normal' && expiresIn && (
        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{formatTime(expiresIn)}</span>
      )}
    </div>
  );
};

const MatchScoreBadge = ({ score }) => {
  const color = score >= 90 ? 'text-emerald-400 border-emerald-400' :
                score >= 75 ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-slate-400';
  return (
    <div className={`flex items-center gap-1 border ${color} rounded-lg px-2 py-1`}>
      <TrendingUp size={14} />
      <span className="font-bold text-sm">{score}%</span>
      <span className="text-[10px] opacity-70">match</span>
    </div>
  );
};

// ============================================
// SWIPE TO CONFIRM
// ============================================
const SwipeToConfirm = ({ onConfirm, text = "Desliza para confirmar", color = "orange" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef(null);
  const thumbWidth = 60;

  const colorClasses = { orange: 'bg-brand-orange', amber: 'bg-amber-500' };

  const handleStart = () => { if (!isConfirmed) setIsDragging(true); };

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
    <div ref={trackRef} className={`relative h-14 rounded-xl overflow-hidden transition-colors ${isConfirmed ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-orange/30 to-brand-orange/10'}`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-white/70 font-medium transition-opacity ${position > 50 ? 'opacity-0' : 'opacity-100'}`}>
          {isConfirmed ? 'Confirmado!' : text}
        </span>
      </div>
      {!isConfirmed && (
        <div
          className={`absolute top-1 left-1 bottom-1 w-14 ${colorClasses[color]} rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg`}
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
        if (data.user) {
          onAuth(data.user, true); // true = nuevo usuario, necesita onboarding
        }
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email o contrasena incorrectos'
        : err.message);
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
const OnboardingTypeSelect = ({ onSelect }) => {
  return (
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
};

// ============================================
// ONBOARDING - LOCAL
// ============================================
const OnboardingLocal = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'restaurante',
    cif: '',
    phone: '',
    address: '',
    city: '',
    latitude: null,
    longitude: null,
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
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }));
        },
        (err) => console.error('Error getting location:', err)
      );
    }
  };

  useEffect(() => { getLocation(); }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        user_type: 'local',
        full_name: formData.business_name,
        business_name: formData.business_name,
        business_type: formData.business_type,
        cif: formData.cif,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        verification_status: 'pending',
      });
      if (error) throw error;
      onComplete();
    } catch (err) {
      console.error('Error:', err);
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
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="Ej: La Tasca del Puerto"
              />
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Tipo de negocio *</label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, business_type: type.value })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      formData.business_type === type.value
                        ? 'bg-brand-orange text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">CIF de la empresa *</label>
              <input
                type="text"
                value={formData.cif}
                onChange={(e) => setFormData({ ...formData, cif: e.target.value.toUpperCase() })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="B12345678"
                maxLength={9}
              />
              <p className="text-slate-500 text-xs mt-2">Necesario para las altas en SS</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.business_name || !formData.cif}
              className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Telefono de contacto *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="612 345 678"
              />
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Direccion *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none mb-3"
                placeholder="Calle, numero..."
              />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none"
                placeholder="Ciudad"
              />
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Ubicacion GPS</p>
                  <p className="text-slate-400 text-sm">Para mostrar ofertas cercanas</p>
                </div>
                {formData.latitude ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle size={20} />
                    <span className="text-sm">Obtenida</span>
                  </div>
                ) : (
                  <button onClick={getLocation} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                    <MapPinned size={16} />
                    Obtener
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold">
                Atras
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.phone || !formData.address || !formData.city}
                className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                Finalizar
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
    full_name: '',
    phone: '',
    staff_role: 'camarero',
    skills: [],
    hourly_rate_min: 10,
    city: '',
    latitude: null,
    longitude: null,
    bio: '',
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
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        user_type: 'staff',
        full_name: formData.full_name,
        phone: formData.phone,
        staff_role: formData.staff_role,
        skills: formData.skills,
        hourly_rate_min: formData.hourly_rate_min,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        bio: formData.bio,
        available: true,
        verification_status: 'pending',
        reliability_score: 100,
        rating: 5.0,
        total_reviews: 0,
        total_shifts: 0,
      });
      if (error) throw error;
      onComplete();
    } catch (err) {
      console.error('Error:', err);
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
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded ${step >= s ? 'bg-brand-orange' : 'bg-slate-700'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Nombre completo *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
                placeholder="Tu nombre y apellidos"
              />
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Telefono *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
                placeholder="612 345 678"
              />
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Ciudad *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
                placeholder="Madrid, Barcelona..."
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.full_name || !formData.phone || !formData.city}
              className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-3 block">Tu puesto principal *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, staff_role: key })}
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.staff_role === key ? 'bg-brand-orange text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <role.icon size={20} className="mb-1" />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-3 block">Tarifa minima por hora</label>
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

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <label className="text-slate-400 text-sm mb-2 block">Sobre ti (opcional)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl outline-none resize-none h-24"
                placeholder="Experiencia, disponibilidad..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-slate-700 text-white py-4 rounded-xl font-bold">Atras</button>
              <button
                onClick={handleSubmit}
                disabled={loading || formData.skills.length === 0}
                className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                Crear Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// VISTA LOCAL (CON DATOS REALES)
// ============================================
const LocalView = ({ user, profile, onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('urgent');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    role: 'camarero',
    date: new Date().toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '02:00',
    hourlyRate: 12,
    autoAlta: true,
    isTrial: false,
    evaluationCriteria: [],
    possibleHire: true,
    skillsRequired: [],
  });

  // Cargar jobs del local
  useEffect(() => {
    const loadJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('local_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setJobs(data);
    };
    loadJobs();
  }, [user.id]);

  // Auto-seleccionar criterios cuando cambia el rol
  useEffect(() => {
    if (formData.isTrial) {
      setFormData(prev => ({
        ...prev,
        evaluationCriteria: DEFAULT_CRITERIA_BY_ROLE[prev.role] || []
      }));
    }
  }, [formData.role, formData.isTrial]);

  const openForm = (type) => {
    const isTrial = type === 'trial';
    setFormType(type);
    setFormData(prev => ({
      ...prev,
      isTrial,
      hourlyRate: isTrial ? 10 : 12,
      evaluationCriteria: isTrial ? DEFAULT_CRITERIA_BY_ROLE[prev.role] || [] : [],
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
        is_urgent: formType === 'urgent',
        urgency_level: formType === 'urgent' ? 'high' : 'normal',
        latitude: profile?.latitude,
        longitude: profile?.longitude,
        address: profile?.address,
        status: 'open',
      });

      if (error) throw error;
      alert('Oferta publicada correctamente!');
      setShowForm(false);
      // Recargar jobs
      const { data } = await supabase.from('jobs').select('*').eq('local_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (data) setJobs(data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-brand-navy">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{profile?.business_name || 'Mi Local'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin size={12} /> {profile?.city || 'Sin ubicacion'}
              </p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="p-6">
        {!showForm ? (
          <>
            <button onClick={() => openForm('urgent')} className="w-full bg-gradient-to-r from-red-500 to-brand-orange p-6 rounded-3xl shadow-glow mb-4 urgency-pulse">
              <div className="flex items-center justify-center gap-4">
                <Zap size={36} className="text-white" />
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-white">SOLICITAR EXTRA</h2>
                  <p className="text-white/70 text-sm">Staff verificado en 30 min</p>
                </div>
              </div>
            </button>

            <button onClick={() => openForm('trial')} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 p-6 rounded-3xl mb-6">
              <div className="flex items-center justify-center gap-4">
                <GraduationCap size={36} className="text-white" />
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-white">PUBLICAR PRUEBA</h2>
                  <p className="text-white/80 text-sm">Evalua antes de contratar</p>
                </div>
              </div>
            </button>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-brand-orange" />
                Mis Ofertas ({jobs.length})
              </h3>
              {jobs.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No has publicado ofertas aun</p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <RoleBadge role={job.role_required} size="sm" />
                        <p className="text-slate-400 text-xs mt-1">{formatDate(job.shift_date)} · {job.start_time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                        job.status === 'matched' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {job.status === 'open' ? 'Abierta' : job.status === 'matched' ? 'Match' : job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={`rounded-2xl p-4 ${formData.isTrial ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-brand-orange/20 border border-brand-orange/30'}`}>
              <div className="flex items-center gap-3">
                {formData.isTrial ? <GraduationCap size={28} className="text-amber-400" /> : <Zap size={28} className="text-brand-orange" />}
                <div>
                  <h2 className="text-white font-bold text-lg">{formData.isTrial ? 'Publicar Prueba' : 'Solicitar Extra'}</h2>
                  <p className="text-slate-400 text-sm">{formData.isTrial ? 'Con criterios predeterminados' : 'Encuentra staff ya'}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-navy-light rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Puesto</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: key })}
                    className={`p-3 rounded-xl text-left transition-all ${formData.role === key ? (formData.isTrial ? 'bg-amber-500' : 'bg-brand-orange') + ' text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    <role.icon size={20} className="mb-1" />
                    <span className="text-sm font-medium">{role.label}</span>
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
              <h3 className="text-white font-bold mb-4">Salario</h3>
              <div className="flex items-center gap-4">
                <input type="range" min="8" max="25" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })} className="flex-1 accent-brand-orange" />
                <div className="bg-slate-700 px-4 py-2 rounded-xl text-center min-w-[80px]">
                  <span className="text-2xl font-bold text-white">{formData.hourlyRate}EUR</span>
                </div>
              </div>
            </div>

            {formData.isTrial && (
              <div className="bg-brand-navy-light rounded-2xl p-5">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-amber-400" />
                  Criterios de evaluacion
                </h3>
                <p className="text-slate-400 text-xs mb-3">Pre-seleccionados para {ROLES[formData.role]?.label}</p>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...(DEFAULT_CRITERIA_BY_ROLE[formData.role] || []), 'Puntualidad', 'Comunicacion', 'Iniciativa'])].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCriteria(c)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.evaluationCriteria.includes(c) ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                      {c}
                    </button>
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

            <button type="submit" disabled={loading} className={`w-full ${formData.isTrial ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-brand-orange'} text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2`}>
              {loading && <Loader2 size={20} className="animate-spin" />}
              Publicar Oferta
            </button>

            <button type="button" onClick={() => setShowForm(false)} className="w-full text-slate-400 py-3">Cancelar</button>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================
// VISTA STAFF (CON DATOS REALES)
// ============================================
const StaffView = ({ user, profile, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      // Cargar jobs abiertos
      let query = supabase
        .from('jobs')
        .select(`*, local:profiles!jobs_local_id_fkey(business_name, city, address)`)
        .eq('status', 'open')
        .gte('shift_date', new Date().toISOString().split('T')[0])
        .order('is_urgent', { ascending: false })
        .order('shift_date', { ascending: true })
        .limit(20);

      // Si tenemos ubicacion, filtrar por distancia (aproximado)
      if (profile?.latitude && profile?.longitude) {
        // Por ahora cargamos todos, el filtro de distancia lo haremos client-side
      }

      const { data, error } = await query;
      if (data) {
        // Calcular distancia aproximada
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
    loadJobs();

    // Suscribirse a cambios en tiempo real
    const channel = supabase.channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => loadJobs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  // Calcular distancia Haversine
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleAcceptJob = async (job) => {
    try {
      // Crear aplicacion
      await supabase.from('applications').insert({
        job_id: job.id,
        staff_id: user.id,
        status: 'pending',
        distance_km: job.distance,
      });
      alert('Has aplicado a esta oferta! El local te contactara pronto.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'urgent') return job.is_urgent;
    if (filter === 'trial') return job.is_trial;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-brand-navy pb-24">
      <header className="bg-brand-navy-light border-b border-slate-700 p-4 pt-8 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-brand-orange" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{profile?.full_name || 'Mi Perfil'}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin size={12} /> {profile?.city || 'Sin ubicacion'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowProfile(true)} className="p-2 bg-slate-700 rounded-full">
              <User size={20} className="text-slate-400" />
            </button>
            <button onClick={onLogout} className="p-2 text-slate-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'urgent', label: 'Urgentes', icon: Zap },
            { key: 'trial', label: 'Pruebas', icon: GraduationCap },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
                filter === f.key
                  ? f.key === 'urgent' ? 'bg-red-500 text-white' : f.key === 'trial' ? 'bg-amber-500 text-white' : 'bg-brand-orange text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {f.icon && <f.icon size={14} />}
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay ofertas disponibles</p>
            <p className="text-sm">Vuelve a revisar mas tarde</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => (
            <div key={job.id} className={`bg-brand-navy-light rounded-2xl overflow-hidden shadow-card ${job.is_urgent ? 'ring-2 ring-red-500' : ''}`}>
              <div className={`p-4 ${job.is_urgent ? 'bg-gradient-to-r from-red-500/20 to-transparent' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{job.local?.business_name || 'Local'}</h3>
                      {job.auto_alta && (
                        <div className="bg-blue-500/20 p-1 rounded"><Shield size={12} className="text-blue-400" /></div>
                      )}
                    </div>
                    <RoleBadge role={job.role_required} size="sm" />
                  </div>
                  {job.is_urgent && <UrgencyBadge level={job.urgency_level} />}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
                  {job.distance && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-brand-orange" />
                      {job.distance}km
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-brand-orange" />
                    {formatDate(job.shift_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-brand-orange" />
                    {job.start_time?.slice(0,5)} - {job.end_time?.slice(0,5)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-white">{job.hourly_rate}EUR</span>
                    <span className="text-slate-400">/h</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <SwipeToConfirm onConfirm={() => handleAcceptJob(job)} text="Desliza para aplicar" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Perfil */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-brand-navy-light w-full rounded-t-3xl p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
              <button onClick={() => setShowProfile(false)} className="text-slate-400 p-2"><X size={24} /></button>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={40} className="text-slate-400" />
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
            {profile?.skills?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Mis Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => <SkillTag key={skill} skill={skill} />)}
                </div>
              </div>
            )}
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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingType, setOnboardingType] = useState(null);

  useEffect(() => {
    // Verificar sesion existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de auth
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
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
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
    if (isNew) {
      setNeedsOnboarding(true);
    } else {
      loadProfile(authUser.id);
    }
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

  // No autenticado
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  // Necesita onboarding
  if (needsOnboarding) {
    if (!onboardingType) return <OnboardingTypeSelect onSelect={setOnboardingType} />;
    if (onboardingType === 'local') return <OnboardingLocal user={user} onComplete={handleOnboardingComplete} />;
    if (onboardingType === 'staff') return <OnboardingStaff user={user} onComplete={handleOnboardingComplete} />;
  }

  // Ya tiene perfil
  if (profile?.user_type === 'local') return <LocalView user={user} profile={profile} onLogout={handleLogout} />;
  if (profile?.user_type === 'staff') return <StaffView user={user} profile={profile} onLogout={handleLogout} />;

  return <AuthScreen onAuth={handleAuth} />;
}
