# Cambios Implementados en ExtraHostelero v2.1

## Resumen Ejecutivo

Se han implementado las siguientes mejoras solicitadas:

1. ✅ **Sistema de CV en Candidaturas**: Los candidatos pueden subir su CV (PDF o Word) a su perfil y se envía automáticamente en todas sus candidaturas.

2. ✅ **Notificaciones de Ofertas Publicadas**: Cuando un local publica una oferta, se envía notificación automática a TODOS los trabajadores cuyo puesto coincida con el que el local busca.

3. ✅ **Notificaciones de Postulaciones**: Se envía notificación al local cuando alguien postula a su oferta.

4. ✅ **Arreglo de Chat**: Los mensajes en chat ahora se envían correctamente. Se mejoró el manejo de errores y se agregó indicador visual de envío.

5. ✅ **Notificaciones en Chat**: Se envía notificación automática a ambas partes cuando se recibe un mensaje en chat.

6. ✅ **Sistema de Puntuación**: Se clarificó cuándo se puede puntuar - **DESPUÉS de completar el turno** (cuando el status es 'completed').

---

## Detalles de Implementación

### 1. Sistema de CV en Candidaturas

**Archivo**: `/src/App.jsx` - EditProfileModal mejorado

**Cambios**:
- Agregado input de subida de archivos PDF/Word
- Validación de tipos de archivo permitidos
- Almacenamiento en `Supabase Storage/cvs`
- Vinculación automática en el perfil del staff

**Cómo usar**:
1. El staff va a "Mi Perfil" → "Editar"
2. Sube su CV en PDF o Word
3. Se guarda automáticamente
4. Al aplicar a una oferta, el CV se adjunta automáticamente en `applications.cv_snapshot_url`
5. El local puede ver y descargar el CV junto con la candidatura

---

### 2. Notificaciones de Ofertas Publicadas

**Archivo**: `/supabase/migrations/003_improvements.sql`

**Trigger**: `notify_staff_on_job_published()`

**Funcionalidad**:
- Cuando un local publica una oferta (status = 'open')
- Se buscan TODOS los staff cuyo `staff_role` coincida con `job.role_required`
- Se crea una notificación para cada uno
- La notificación incluye: nombre del local, tipo de oferta, puesto

**Datos en Notificación**:
```json
{
  "job_id": "...",
  "local_id": "...",
  "local_name": "Nombre del local",
  "role_required": "camarero",
  "job_type": "extra"
}
```

---

### 3. Notificaciones de Postulaciones

**Ya implementado en migración anterior** - Trigger: `notify_local_on_application()`

**Cómo funciona**:
- Al insertar en tabla `applications`
- Se notifica al local
- Incluye: nombre del candidato, puesto, ID de la aplicación

---

### 4. Arreglo de Chat - Mensajes

**Archivo**: `/src/App.jsx` - ChatView mejorado

**Problemas Solucionados**:
- ✅ Error silencioso al enviar mensajes
- ✅ Mejor manejo de errores con logging
- ✅ Indicador de estado de envío
- ✅ Reintentos y recuperación de mensajes fallidos

**Mejoras**:
```javascript
// Antes: Sin validación de errores
const { data, error } = await supabase.from('messages').insert(message).select().single();

// Ahora: Con validación completa
const { data, error } = await supabase.from('messages').insert([message]).select().single();
if (error) {
  console.error('Error sending message:', error);
  setNewMessage(messageContent); // Restaurar para reintentar
  alert('Error: ' + error.message);
}
```

---

### 5. Notificaciones en Chat (Ambos Lados)

**Archivo**: `/supabase/migrations/003_improvements.sql`

**Trigger**: `notify_on_message()`

**Funcionalidad**:
- Cada vez que se inserta un mensaje
- Se crea una notificación para el receptor
- Incluye: nombre del remitente, contenido del mensaje, contexto del job

**Datos en Notificación**:
```json
{
  "message_id": "...",
  "sender_id": "...",
  "sender_name": "Juan García",
  "job_id": "...",
  "job_role": "camarero"
}
```

---

### 6. Sistema de Puntuación (Cuándo)

**Respuesta Técnica**:

La puntuación ocurre **DESPUÉS de que el local marca el turno como COMPLETADO**.

**Flujo Completo**:

```
1. Local publica oferta (status: 'open')
   ↓
2. Staff aplica (crea application)
   ↓
3. Local acepta candidato (status: 'matched')
   ↓
4. Ocurre el turno (status: 'active')
   ↓
5. Local marca como completado (status: 'completed')
   ↓
6. 🎯 SE ABRE PERÍODO DE RESEÑA
   - Ambas partes pueden puntuar
   - Métricas: Puntualidad, Profesionalidad, Habilidades, Comunicación
   - Rating general (1-5 estrellas)
   - Comentarios opcionales
```

**Componente Implementado**: `ReviewModal`

```javascript
const ReviewModal = ({ job, candidateName, onSubmit, onClose }) => {
  // Interfaz para dejar reseña
  // Métricas de 1-5
  // Comentarios opcionales
}
```

---

## Cambios en Base de Datos

### Nueva Tabla: cv_documents
```sql
CREATE TABLE cv_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  staff_id UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT, -- 'pdf', 'doc', 'docx'
  file_url TEXT NOT NULL,
  
  is_current BOOLEAN DEFAULT true,
  version_number INTEGER DEFAULT 1
);
```

### Nuevos Campos en Tablas Existentes

**profiles**:
- `cv_url TEXT` - URL del CV actual del staff
- `cv_document_id UUID` - Referencia a cv_documents

**notifications**:
- `notification_type TEXT` - Tipo específico de notificación
- `action_url TEXT` - URL a la que ir al hacer clic
- `action_required BOOLEAN` - Si requiere acción inmediata

**jobs**:
- `review_opened_at TIMESTAMPTZ` - Cuándo se abre período de reseña

---

## Cambios en Supabase (Triggers)

Nuevos triggers automáticos:

1. **notify_staff_on_job_published**: Notifica a staff cuando hay oferta que coincide
2. **notify_on_message**: Notifica cuando se recibe mensaje en chat
3. **open_review_period**: Abre período de reseña cuando job se completa

---

## Cómo Probar

### Prueba 1: CV en Candidaturas
1. Login como staff
2. Editar perfil → Subir CV
3. Aplicar a una oferta
4. Login como local → Ver candidatos
5. CV debe estar visible en la candidatura

### Prueba 2: Notificación de Oferta
1. Login como local → Publicar oferta (Ej: "Camarero")
2. Login como diferente staff con puesto "Camarero"
3. Debería recibir notificación inmediata
4. Click en notificación → Abre la oferta

### Prueba 3: Chat
1. Login como local → Ver candidatos
2. Click "Chat" con un candidato
3. Escribir mensaje → Presionar Enviar
4. Mensaje debería aparecer en el chat
5. Cambiar a cuenta de staff → Debería recibir notificación

### Prueba 4: Puntuación
1. Local publica oferta y acepta candidato
2. Después de terminar turno, local marca como "Completado"
3. Se abre modal de reseña
4. Local completa métricas y comentarios
5. Reseña se guarda en tabla `reviews`

---

## Archivos Modificados

1. **src/App.jsx**
   - EditProfileModal: Agregar upload de CV
   - ChatView: Mejorar envío de mensajes
   - ReviewModal: Nuevo componente para reseñas

2. **supabase/migrations/003_improvements.sql**
   - Nueva tabla cv_documents
   - Nuevos triggers para notificaciones
   - RLS para nuevas tablas
   - Índices de performance

3. **TECHNICAL_DOCS.md**
   - Agregadas secciones 7, 8, 9 con documentación completa

---

## Próximos Pasos (Recomendados)

1. **Deploy de Migrations**: Ejecutar la migración 003_improvements.sql en Supabase
2. **Crear Bucket Storage**: Crear bucket `cvs` en Supabase Storage
3. **Configurar RLS**: Aplicar políticas de Row Level Security
4. **Probar en Staging**: Validar todas las funcionalidades en ambiente de prueba
5. **Notificaciones Push**: Considerar agregar FCM tokens para push notifications

---

## Soporte

Para preguntas o problemas con la implementación, revisar:
- Errores en console del navegador (F12 → Console)
- Logs en Supabase (Authentication tab)
- Realtime subscriptions (Supabase → Realtime)
