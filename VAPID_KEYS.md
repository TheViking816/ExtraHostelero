# Claves VAPID para Notificaciones Push

Estas son las claves VAPID generadas para tu aplicación. **GUÁRDALAS EN UN LUGAR SEGURO**.

## Claves Generadas

**Clave Pública (Public Key):**
```
BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw
```

**Clave Privada (Private Key):**
```
RocoMB4HBNhjV3N6Rwena8SGmA1XMVbIcNMqcYjZk9Y
```

## ¿Dónde usar estas claves?

### 1. Frontend (App.jsx)

Abre `src/App.jsx` y busca la línea que dice:
```javascript
const VAPID_PUBLIC_KEY = 'REEMPLAZAR_CON_TU_CLAVE_VAPID_PUBLICA'
```

Reemplázala con:
```javascript
const VAPID_PUBLIC_KEY = 'BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw'
```

### 2. Supabase Edge Functions Secrets

Ve al Dashboard de Supabase → Settings → Edge Functions → Secrets y agrega:

| Secret Name | Secret Value |
|-------------|--------------|
| `VAPID_PUBLIC_KEY` | `BFD3EPrf6t6d-TVypeh-KHOvRsamoYwihZ9Ilb7uB20D5xlVQYVgfEoXgMT47g1arT0mOwvK-sgiuVsnKyDnylw` |
| `VAPID_PRIVATE_KEY` | `RocoMB4HBNhjV3N6Rwena8SGmA1XMVbIcNMqcYjZk9Y` |

### 3. Configuración de Base de Datos (para triggers)

También necesitas configurar estas variables en PostgreSQL para que los triggers puedan llamar a las Edge Functions:

```sql
-- Conecta a tu base de datos de Supabase y ejecuta:
ALTER DATABASE postgres SET app.settings.supabase_functions_url = 'https://TU_PROJECT_REF.supabase.co/functions/v1';
ALTER DATABASE postgres SET app.settings.supabase_anon_key = 'TU_SUPABASE_ANON_KEY';
```

Reemplaza:
- `TU_PROJECT_REF` con tu project reference de Supabase
- `TU_SUPABASE_ANON_KEY` con tu anon/public key de Supabase (la encuentras en Settings → API)

## Otros Secrets necesarios en Supabase Edge Functions

También necesitas configurar en Supabase Dashboard → Settings → Edge Functions → Secrets:

| Secret Name | Secret Value | Descripción |
|-------------|--------------|-------------|
| `SUPABASE_URL` | `https://TU_PROJECT_REF.supabase.co` | URL de tu proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | `tu-service-role-key` | Service role key (Settings → API) |
| `APP_URL` | `https://tu-dominio.com` | URL de tu app en producción |

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** subas la clave privada a GitHub o repositorios públicos
- La clave pública puede ser pública (va en el frontend)
- La clave privada debe estar SOLO en Supabase Secrets
- Si estas claves se comprometen, genera unas nuevas con `npx web-push generate-vapid-keys`

## Borrar este archivo

Una vez hayas configurado todo, **BORRA ESTE ARCHIVO** para evitar exponer las claves.
