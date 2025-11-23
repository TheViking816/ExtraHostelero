import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper para obtener el perfil del usuario
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Buscar staff cercano
export const findNearbyStaff = async (latitude, longitude, role, radiusKm = 5) => {
  const { data, error } = await supabase
    .rpc('find_nearby_staff', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_role: role,
      p_radius_km: radiusKm
    })

  if (error) throw error
  return data
}

// Buscar jobs cercanos
export const findNearbyJobs = async (latitude, longitude, role, radiusKm = 10) => {
  const { data, error } = await supabase
    .rpc('find_nearby_jobs', {
      p_latitude: latitude,
      p_longitude: longitude,
      p_role: role,
      p_radius_km: radiusKm
    })

  if (error) throw error
  return data
}

// Crear un nuevo job
export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Aceptar un job (crear aplicacion)
export const applyToJob = async (jobId, staffId, matchScore, distanceKm) => {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      staff_id: staffId,
      match_score: matchScore,
      distance_km: distanceKm,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Confirmar match (local selecciona staff)
export const confirmMatch = async (jobId, staffId) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      matched_staff_id: staffId,
      matched_at: new Date().toISOString(),
      status: 'matched'
    })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Suscribirse a cambios en tiempo real de jobs
export const subscribeToJobs = (callback) => {
  return supabase
    .channel('jobs-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'jobs' },
      callback
    )
    .subscribe()
}

// Suscribirse a notificaciones
export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
