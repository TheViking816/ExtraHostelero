# Configuración del Bucket CVS en Supabase - Guía Completa

## Problema Actual

Estás viendo estos errores:
- ❌ `403 Forbidden` en messages (RLS issue)
- ❌ `400 Bad Request` en storage/cvs (bucket no existe o mal configurado)
- ❌ `401 Unauthorized` en manifest.webmanifest (CORS issue)

## Solución Paso a Paso

### PASO 1: Crear el Bucket CVS

1. Abre tu dashboard de Supabase
2. Ve a la sección **Storage** (lado izquierdo)
3. Click en botón azul **"New bucket"**
4. Configuración:
   - **Name**: `cvs`
   - **Public bucket**: ✅ MARCAR (para que sea público)
   - Click **Create bucket**

### PASO 2: Configurar Permisos (RLS) en el Bucket

En el bucket `cvs` que acabas de crear:

1. Click en los **3 puntos (...)** → **Policies**
2. Click **"New Policy"** (o "Add policy")
3. Crear Política 1:

```
Name: Staff puede subir su CV
Definition: di
```

4. Crear Política 2:

```
Name: Todos pueden leer CVs públicos
Definition: FOR SELECT TO public USING (true)
Definition: FOR SELECT TO authenticated USING (true)
```

5. Crear Política 3:

```
Name: Staff puede actualizar su CV
Definition: FOR UPDATE TO authenticated USING (true) WITH CHECK (true)
```

### PASO 3: Verificar la Estructura del Bucket

Después de crear el bucket, debería verse así:
```
cvs/
  ├── [storage files aquí]
```

### PASO 4: Actualizar el Código Frontend

✅ **YA HECHO** - La función `handleCVUpload` en App.jsx ha sido actualizada con:
- Better error handling
- Correct path construction
- Logging para debug

### PASO 5: Problema de RLS en Mensajes

Mencionaste que quitaste RLS en notifications. Ahora también debes quitarla en `messages` si quieres que funcione:

**En Supabase:**
1. Ve a **Authentication** → **Policies**
2. Busca tabla `messages`
3. Si tiene RLS habilitado, desactívalo (por ahora)
4. O crea una política simple:

```sql
-- Para tabla messages: permitir authenticated users
CREATE POLICY "authenticated users can insert messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated users can read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);
```

### PASO 6: Corregir el CORS Issue (manifest.webmanifest)

El error 401 en manifest.webmanifest es un aviso pero no bloquea nada. Pero verifica:

1. Ve a **Project Settings** → **API**
2. Busca la sección **CORS**
3. Asegúrate de que tu dominio Vercel esté incluido:
   - `https://extra-hostelero-*.vercel.app`
   - O usa `*` para permitir todos (menos seguro pero funciona)

### PASO 7: Problemas de Messages 403 Forbidden

El error `403 Forbidden` en messages significa que RLS está bloqueando:

**Solución rápida**: Desactiva RLS en la tabla messages temporalmente:

1. Ve a **Authentication** → **Policies**
2. Busca `messages`
3. Click en **Disable RLS** (si lo ves)

O en la consola SQL ejecuta:
```sql
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

---

## Checklist de Configuración

### ✅ Para que todo funcione:

- [ ] Bucket `cvs` creado
- [ ] Bucket `cvs` es **público**
- [ ] Políticas RLS configuradas en `cvs`
- [ ] RLS deshabilitado en tabla `messages` (temporalmente)
- [ ] RLS deshabilitado en tabla `notifications` (ya hecho)
- [ ] CORS configurado correctamente
- [ ] Código actualizado en App.jsx (ya hecho)

### 🧪 Para Probar:

1. **Probar upload de CV**:
   - Login como staff
   - Editar perfil
   - Subir un PDF
   - Ver logs en F12 → Console
   - Debería ver "✅ CV subido correctamente!"

2. **Probar chat**:
   - Login como local
   - Ir a candidatos
   - Click Chat con alguien
   - Escribir mensaje
   - Debería enviarse sin error 403

3. **Probar notificaciones**:
   - Cambiar a otra cuenta de staff
   - Vuelve a local y publica oferta
   - La otra cuenta debería recibir notificación

---

## Comandos SQL Útiles

Si necesitas ejecutarlos en Supabase SQL Editor:

```sql
-- Ver estado de RLS en todas las tablas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Desactivar RLS en tabla específica
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Activarla de nuevo
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Ver todas las policies en una tabla
SELECT * FROM pg_policies 
WHERE tablename = 'cvs';
```

---

## Logs Esperados (Console)

Cuando todo funcione, en F12 → Console verás:

```
✅ CV subido correctamente!
Uploading CV to: [userid]/1765201030774.pdf
Upload successful: {path: "...", id: "..."}
Public URL: https://oknpgpencszibnmndyzm.supabase.co/storage/v1/object/public/cvs/[userid]/1765201030774.pdf
```

---

## Si Siguen Habiendo Errores

1. **Abre Developer Tools** (F12)
2. Ve a **Console** (pestaña)
3. Intenta subir un CV
4. Copia los logs completos
5. Verifica:
   - ¿Dice "400 Bad Request"? → Bucket mal configurado
   - ¿Dice "403 Forbidden"? → RLS bloqueando
   - ¿Dice "404 Not Found"? → Bucket no existe

---

## Configuración Final (Segura)

Una vez que todo funcione, aquí está la configuración RLS recomendada:

```sql
-- Para tabla CVS (Storage)
CREATE POLICY "Staff puede ver CVs públicos"
  ON cvs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff puede subir su CV"
  ON cvs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Para tabla messages
CREATE POLICY "Solo participantes pueden ver/enviar mensajes"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Usuarios autenticados pueden enviar mensajes"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Para tabla notifications
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

¡Sigue este checklist y debería funcionar! 🚀
