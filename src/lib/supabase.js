import { createClient } from '@supabase/supabase-js'

// Fallbacks para desarrollo local si faltan variables .env
const DEFAULT_SUPABASE_URL = 'https://oknpgpencszibnmndyzm.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbnBncGVuY3N6aWJubW5keXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzE2NzEsImV4cCI6MjA3OTUwNzY3MX0.4Eyxg6kNGcoOBgrfGIiGH7uj9YXkuMI4ORSQPJLHjSo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL o ANON key no configurados. Revisa .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// AUTH HELPERS
// ============================================

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// ============================================
// JOBS
// ============================================

export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteJob = async (jobId) => {
  const { error } = await supabase
    .from('jobs')
    .update({
      deleted_at: new Date().toISOString(),
      status: 'cancelled'
    })
    .eq('id', jobId)

  if (error) throw error
}

export const getJobsForLocal = async (localId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('local_id', localId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getOpenJobs = async (filters = {}) => {
  let query = supabase
    .from('jobs')
    .select(`*, local:profiles!jobs_local_id_fkey(business_name, city, address, avatar_url)`)
    .eq('status', 'open')
    .is('deleted_at', null)
    .gte('shift_date', new Date().toISOString().split('T')[0])
    .order('is_urgent', { ascending: false })
    .order('shift_date', { ascending: true })

  if (filters.jobType) {
    query = query.eq('job_type', filters.jobType)
  }

  if (filters.role) {
    query = query.eq('role_required', filters.role)
  }

  const { data, error } = await query.limit(filters.limit || 30)

  if (error) throw error
  return data
}

// ============================================
// APPLICATIONS
// ============================================

export const applyToJob = async (applicationData) => {
  const { data, error } = await supabase
    .from('applications')
    .insert(applicationData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getApplicationsForJob = async (jobId) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`*, staff:profiles!applications_staff_id_fkey(*)`)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getMyApplications = async (staffId) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`*, job:jobs(*, local:profiles!jobs_local_id_fkey(business_name))`)
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const acceptApplication = async (applicationId, jobId, staffId) => {
  // Accept this application
  await supabase
    .from('applications')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', applicationId)

  // Reject other applications
  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .neq('id', applicationId)

  // Update job
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'matched',
      matched_staff_id: staffId,
      matched_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const rejectApplication = async (applicationId) => {
  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) throw error
}

// ============================================
// MESSAGES / CHAT
// ============================================

export const getMessages = async (userId, otherUserId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return data
}

export const sendMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const markMessagesAsRead = async (userId, senderId) => {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', senderId)
    .is('read_at', null)

  if (error) throw error
}

export const getConversations = async (userId, userType) => {
  const filterColumn = userType === 'local' ? 'local_id' : 'staff_id'

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      local:profiles!conversations_local_id_fkey(id, business_name, avatar_url),
      staff:profiles!conversations_staff_id_fkey(id, full_name, avatar_url)
    `)
    .eq(filterColumn, userId)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// FAVORITES
// ============================================

export const getFavorites = async (localId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      staff:profiles!favorites_staff_id_fkey(*)
    `)
    .eq('local_id', localId)
    .order('times_worked_together', { ascending: false })

  if (error) throw error
  return data
}

export const addFavorite = async (localId, staffId) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ local_id: localId, staff_id: staffId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeFavorite = async (localId, staffId) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('local_id', localId)
    .eq('staff_id', staffId)

  if (error) throw error
}

// ============================================
// NOTIFICATIONS
// ============================================

export const getUnreadNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

export const markNotificationAsRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}

export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// CERTIFICATIONS
// ============================================

export const getCertifications = async (staffId) => {
  const { data, error } = await supabase
    .from('staff_certifications')
    .select('*')
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const addCertification = async (certificationData) => {
  const { data, error } = await supabase
    .from('staff_certifications')
    .insert(certificationData)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// CARNET DIGITAL
// ============================================

export const getCarnetStats = async (staffId) => {
  const { data, error } = await supabase
    .rpc('get_carnet_stats', { p_staff_id: staffId })

  if (error) throw error
  return data
}

export const generateCarnetId = async (staffId) => {
  const { data, error } = await supabase
    .rpc('generate_carnet_digital', { p_staff_id: staffId })

  if (error) throw error
  return data
}

// ============================================
// GEO / SEARCH
// ============================================

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

export const getFavoriteCandidatesForJob = async (localId, role) => {
  const { data, error } = await supabase
    .rpc('get_favorite_candidates_for_job', {
      p_local_id: localId,
      p_role: role
    })

  if (error) throw error
  return data
}

// ============================================
// REVIEWS
// ============================================

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getReviewsFor = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name, business_name, avatar_url)
    `)
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

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

export const subscribeToApplications = (jobId, callback) => {
  return supabase
    .channel(`applications-${jobId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `job_id=eq.${jobId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToMessages = (userId, otherUserId, callback) => {
  return supabase
    .channel(`chat-${userId}-${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

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

// ============================================
// PROFILE
// ============================================

export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// STORAGE (para CVs, fotos, etc.)
// ============================================

export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}
