# 🎬 Demo Completa - Flujo Interactivo ExtraHostelero

## Escenario: Local publica oferta → Staff aplica → Local acepta → Chatean

---

## ACTO 1: LOCAL PUBLICA OFERTA

### Pantalla: LocalView

```
┌────────────────────────────────────────────────────┐
│ 📍 El Rincón Madrileño                  🔔 [0]  🚪 │
│ Madrid, Calle Mayor 42                             │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│        SOLICITAR EXTRA                             │
│  ⚡ Cubrir un hueco puntual                        │
└────────────────────────────────────────────────────┘
    ↓ [CLICK] ↓

LOCAL RELLENA FORMULARIO:
├─ Puesto: Camarero
├─ Fecha: Sábado 22 Nov
├─ Horario: 20:00 - 02:00 (6 horas)
├─ Salario: 13€/hora
├─ Auto alta/baja: ✅ Sí
└─ ENVIAR

    ↓ [SUCCESS] ↓

NOTIFICACIÓN EN BD (TRIGGER):
notify_staff_on_job_published()
  ├─ Busca todo el staff con role='camarero'
  ├─ Inserta 127 notificaciones (hay 127 camareros registrados)
  └─ Cada notificación:
     {
       user_id: 'staff_uuid_1',
       type: 'job_published',
       title: 'Nueva oferta disponible',
       body: 'El Rincón Madrileño tiene una oferta de Camarero',
       data: { job_id: 'job_123' }
     }

LocalView RECARGA:
└─ Sección "Mis Ofertas"
   └─ ┌──────────────────────────────────────┐
      │ Camarero - Sábado 22 Nov            │
      │ 20:00 - 02:00 (6h)                  │
      │ [Abierta] → Ver candidatos          │
      └──────────────────────────────────────┘
```

---

## ACTO 2: STAFF RECIBE NOTIFICACIÓN Y APLICA

### En OTRO NAVEGADOR/USUARIO: StaffView

```
┌────────────────────────────────────────────────────┐
│ 👤 Juan García                      🔔 [1]  🚪    │
│ Camarero • Disponible en Madrid                    │
└────────────────────────────────────────────────────┘

BELL NOTIFICACIÓN (rojo, parpadea):
"🔔 Nueva oferta disponible"

┌────────────────────────────────────────────────────┐
│     OFERTAS DISPONIBLES                            │
│                                                     │
│ 🏘️ El Rincón Madrileño                           │
│    Camarero • Sábado 22 Nov                       │
│    20:00 - 02:00 (6h) • 13€/h                     │
│    📍 Calle Mayor 42, Madrid                      │
│                                                     │
│    ┌─────────────────────────────────────┐        │
│    │ CV: CV_Juan_Garcia.pdf ✅ Subido   │        │
│    │ Experiencia: 5 años como camarero  │        │
│    │ Rating: ⭐⭐⭐⭐⭐ (4.8/5)         │        │
│    │                                     │        │
│    │          [APLICAR AHORA]            │        │
│    └─────────────────────────────────────┘        │
└────────────────────────────────────────────────────┘

    ↓ [CLICK APLICAR] ↓

JUAN APLICA:
  ├─ Inserta en tabla 'applications'
  │  {
  │    job_id: 'job_123',
  │    staff_id: 'juan_uuid',
  │    cv_url: 'https://storage.../CV_Juan.pdf',
  │    cv_snapshot_url: 'https://storage.../snapshot.jpg',
  │    status: 'pending',
  │    created_at: 2024-12-22T15:30:00Z
  │  }
  │
  ├─ TRIGGER: notify_local_on_application()
  │  {
  │    user_id: 'local_uuid',  ← El Local
  │    type: 'application_received',
  │    title: 'Nueva candidatura',
  │    body: 'Juan García ha aplicado a tu oferta de Camarero',
  │    data: { job_id: 'job_123', application_id: 'app_456' }
  │  }
  │
  └─ StaffView muestra: "✅ Aplicación enviada"

RESULTADO:
└─ Juan aparece como "Aplicación enviada"
   (no puede aplicar nuevamente)
```

---

## ACTO 3: LOCAL VE NOTIFICACIÓN Y CANDIDATO

### VOLVEMOS A LocalView (1er navegador)

```
┌────────────────────────────────────────────────────┐
│ 📍 El Rincón Madrileño                🔔 [1] 🚪   │
│ Madrid, Calle Mayor 42                             │
│                          ↑ BELL TIENE NOTIFICACIÓN│
└────────────────────────────────────────────────────┘

LOCAL CLICK EN BELL 🔔:

┌──────────────────────────────┐
│ 🔔 Notificaciones (1)        │
├──────────────────────────────┤
│                              │
│ 📍 Nueva candidatura         │
│    Juan García ha aplicado   │
│    a tu oferta de Camarero   │
│    Hace 2 minutos            │
│                              │
└──────────────────────────────┘
      ↓ CLICK FUERA CIERRA ↓

LOCAL VE EN "MIS OFERTAS":
┌────────────────────────────────────────────────────┐
│ 🕐 MIS OFERTAS (1)                                │
│                                                    │
│ Camarero - Sábado 22 Nov, 20:00-02:00             │
│ [Abierta] → Ver candidatos  (NUEVO BADGE: 1)      │
└────────────────────────────────────────────────────┘

    ↓ [CLICK VER CANDIDATOS] ↓

PANTALLA DE CANDIDATOS:

┌────────────────────────────────────────────────────┐
│ ← Candidatos (Camarero - 22 Nov)                   │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ 👤 Juan García                                 │ │
│ │    ⭐⭐⭐⭐⭐ (4.8/5) • 5 años experiencia      │ │
│ │    📄 CV_Juan_Garcia.pdf (245 KB)              │ │
│ │                                                 │ │
│ │  DESCRIPCIÓN:                                  │ │
│ │  "Camarero con experiencia en restaurantes     │ │
│ │   de 100+ cubiertos. Vinos, cócteles, servicio│ │
│ │   inglés certificado."                         │ │
│ │                                                 │ │
│ │  [ACEPTAR] [RECHAZAR]  [VER CV]  [CHAT]       │ │
│ │                                                 │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

    ↓ [LOCAL CLICK ACEPTAR] ↓
```

---

## ACTO 4: LOCAL ACEPTA CANDIDATO

```
LOCAL CLICK ACEPTAR:
  ├─ UPDATE applications
  │  ├─ SET status = 'accepted' WHERE id = 'app_456'
  │  └─ SET responded_at = NOW()
  │
  ├─ UPDATE applications (otros)
  │  └─ SET status = 'rejected' 
  │     WHERE job_id = 'job_123' AND id != 'app_456'
  │  (rechaza automáticamente otros candidatos)
  │
  ├─ UPDATE jobs
  │  ├─ SET status = 'matched'
  │  ├─ SET matched_staff_id = 'juan_uuid'
  │  └─ SET matched_at = NOW()
  │
  ├─ INSERT notifications (para Juan)
  │  {
  │    user_id: 'juan_uuid',
  │    type: 'application_accepted',
  │    title: '✅ ¡Candidatura aceptada!',
  │    body: 'El Rincón Madrileño ha aceptado tu candidatura',
  │    data: { job_id: 'job_123' }
  │  }
  │
  ├─ RELOAD loadJobs()
  │  └─ Jobs se actualizan
  │
  ├─ RELOAD loadAcceptedApplications() ← NUEVO!
  │  └─ Carga Juan en "Candidatos Aceptados"
  │
  └─ Alert: "✅ Candidato aceptado!"

LocalView RECARGA:
┌────────────────────────────────────────────────────┐
│ 📍 El Rincón Madrileño                🔔 [1]  🚪  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  [SOLICITAR EXTRA]                                 │
│  [PUBLICAR PRUEBA]                                 │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  ✅ CANDIDATOS ACEPTADOS (1)  ← NUEVO PANEL!      │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │ 👤 Juan García                             │  │
│  │    Camarero                                │  │
│  │              [💬 CHAT]                     │  │
│  └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  🕐 MIS OFERTAS (1)                               │
│                                                    │
│  Camarero - Sábado 22 Nov                         │
│  [Asignada]  (cambió de Abierta a Asignada)      │
└────────────────────────────────────────────────────┘
```

---

## ACTO 5: JUAN RECIBE NOTIFICACIÓN

### EN StaffView (otro navegador)

```
JUAN VE NOTIFICACIÓN (AUTOMÁTICA):

🔔 NOTIFICACIÓN BADGE:
  Cambia de 1 a 2 (añade la de aceptación)

┌────────────────────────────────────────────┐
│ 🔔 NOTIFICACIONES (2)                      │
├────────────────────────────────────────────┤
│                                            │
│ 📍 ¡Candidatura aceptada!                 │
│    El Rincón Madrileño ha aceptado tu     │
│    candidatura                             │
│    Hace 1 minuto                          │
│                                            │
│ 📍 Nueva oferta disponible                │
│    El Rincón Madrileño tiene una oferta   │
│    de Camarero                             │
│    Hace 5 minutos                         │
│                                            │
└────────────────────────────────────────────┘

JUAN VE EN SU APLICACIÓN:
┌─────────────────────────────────────────────┐
│ Mis Candidaturas                            │
│                                             │
│ 🏘️ El Rincón Madrileño                    │
│    Camarero • Sábado 22 Nov, 20:00-02:00  │
│    [✅ ACEPTADA]  → [💬 CHAT]             │
│                                             │
│    "Excelente! Te espero el sábado"       │
└─────────────────────────────────────────────┘
```

---

## ACTO 6: JUAN CHATEA CON LOCAL

### EN StaffView - ChatView

```
JUAN CLICK [💬 CHAT]:
  └─ setChatWith({ id: 'local_uuid', name: 'El Rincón Madrileño' })
     └─ Abre ChatView

PANTALLA DE CHAT:

┌────────────────────────────────────────────────────┐
│ ← El Rincón Madrileño                              │
│    Camarero • Sábado 22 Nov, 20:00-02:00          │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                                                    │
│                           19:35                   │
│          EL RINCÓN MADRILEÑO (el local dice):     │
│        "Excelente! Te espero el sábado."         │
│                                                    │
│                           19:37                   │
│          JUAN GARCÍA (el staff dice):             │
│        "Gracias! ¿Debo llevar uniforme?"         │
│                                                    │
│                                                    │
│  JUAN ESCRIBE:                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ "¿A qué hora debo llegar?" [ENVIAR]     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘

    ↓ JUAN PRESIONA ENVIAR ↓

EN BD:
  INSERT INTO messages {
    sender_id: 'juan_uuid',
    recipient_id: 'local_uuid',
    body: '¿A qué hora debo llegar?',
    created_at: 2024-12-22T19:37:15Z
  }

TRIGGER: notify_on_message()
  INSERT INTO notifications {
    user_id: 'local_uuid',  ← El Local recibe notificación
    type: 'message_received',
    title: '💬 Nuevo mensaje',
    body: 'Juan García te escribió un mensaje',
    data: { 
      conversation_id: 'conv_789',
      message_id: 'msg_999'
    }
  }

JUAN VE:
  "✅ Mensaje enviado • 19:37"

LOCAL RECIBE EN OTRO NAVEGADOR:
  🔔 Bell badge aumenta a 2 notificaciones
  
  Panel de notificaciones:
  ┌──────────────────────────────────────┐
  │ 🔔 Notificaciones (2)                │
  ├──────────────────────────────────────┤
  │ 💬 Nuevo mensaje (NUEVO!)            │
  │    Juan García te escribió un        │
  │    mensaje                           │
  │    Hace 1 segundo                    │
  │                                      │
  │ ✅ Candidatura aceptada             │
  │    ... hace 5 minutos                │
  └──────────────────────────────────────┘
```

---

## ACTO 7: LOCAL RESPONDE EN CHAT

### EN LocalView - ChatView

```
LOCAL VE:
┌────────────────────────────────────────────────────┐
│ ← Juan García                                      │
│    Camarero • Sábado 22 Nov                        │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                                                    │
│                           19:35                   │
│          LOCAL:                                   │
│        "Excelente! Te espero el sábado."         │
│                                                    │
│                           19:37                   │
│          JUAN:                                    │
│        "Gracias! ¿Debo llevar uniforme?"         │
│                                                    │
│          (JUAN)                                    │
│        "¿A qué hora debo llegar?"                │
│                                                    │
│  LOCAL ESCRIBE:                                   │
│  ┌──────────────────────────────────────────┐    │
│  │ "A las 19:45. Uniforme: pantalón neg..." │    │
│  │                              [ENVIAR]     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘

    ↓ LOCAL CLICK ENVIAR ↓

EN BD:
  INSERT INTO messages {
    sender_id: 'local_uuid',
    recipient_id: 'juan_uuid',
    body: 'A las 19:45. Uniforme: pantalón negro, camiseta...',
    created_at: 2024-12-22T19:38:02Z
  }

TRIGGER: notify_on_message()
  INSERT INTO notifications {
    user_id: 'juan_uuid',  ← JUAN recibe notificación
    type: 'message_received',
    title: '💬 Nuevo mensaje',
    body: 'El Rincón Madrileño te escribió un mensaje'
  }

LOCAL ACTUALIZA VIEW:
  ┌────────────────────────────────────────────┐
  │ Mensaje enviado ✓ 19:38                   │
  │ "A las 19:45. Uniforme: pantalón negro..."│
  └────────────────────────────────────────────┘

JUAN RECIBE EN OTRO NAVEGADOR:
  🔔 Bell badge ahora muestra 2 notificaciones
  Chat se actualiza automáticamente (Realtime)
  
  ┌────────────────────────────────────────┐
  │ Mensaje nuevo • 19:38                  │
  │ (LOCAL)                                │
  │ "A las 19:45. Uniforme: pantalón..."  │
  └────────────────────────────────────────┘

CONVERSACIÓN CONTINÚA...
```

---

## 🎬 RESUMEN DEL FLUJO COMPLETO

```
1. LOCAL PUBLICA OFERTA
   ↓ Trigger: notify_staff_on_job_published
   ↓ 127 camareros reciben notificación

2. STAFF (JUAN) RECIBE NOTIFICACIÓN
   ↓ Aplica a la oferta
   ↓ Trigger: notify_local_on_application

3. LOCAL RECIBE NOTIFICACIÓN
   ↓ Ve panel de candidatos
   ↓ Click en "Aceptar"

4. JUAN RECIBE NOTIFICACIÓN
   ↓ Candidatura aceptada
   ↓ Aparece en su lista

5. JUAN O LOCAL CLICK CHAT
   ↓ Abre ChatView
   ↓ Envía mensaje

6. OTRO RECIBE NOTIFICACIÓN
   ↓ Lee mensaje en tiempo real
   ↓ Responde

7. CONVERSACIÓN CONTINÚA
   ↓ Ambos reciben notificaciones
   ↓ Chat sincronizado en tiempo real
```

---

## ✅ CARACTERÍSTICAS DEMOSTRADAS

| Feature | Paso | ¿Funciona? |
|---------|------|-----------|
| CV upload | 2 | ✅ CV se incluye automáticamente |
| Job notifications | 1 | ✅ Staff recibe notificación |
| Application notifications | 2 | ✅ Local recibe notificación |
| Accept application | 3 | ✅ Rechaza otros automáticamente |
| Accepted candidates section | 4 | ✅ Juan aparece en sección |
| Chat access | 5 | ✅ Botón "Chat" funciona |
| Message sending | 5-7 | ✅ Mensajes se envían |
| Message notifications | 5-7 | ✅ Ambos reciben notificaciones |
| Real-time sync | 5-7 | ✅ Chat se sincroniza automático |

---

**Demo completa**: ~7 minutos en tiempo real
**Tecnología**: React Realtime + PostgreSQL Triggers
**Seguridad**: Auth + RLS (si está habilitado)
