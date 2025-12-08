# 🚀 Próximos Pasos - Resumen Rápido

## LO QUE YA HICISTE ✅
- Ejecutaste la migración SQL en Supabase
- Quitaste RLS en tabla `notifications`

---

## LO QUE DEBES HACER AHORA 👇

### 1️⃣ Crear Bucket CVS (2 minutos)

**En Supabase Dashboard:**
1. **Storage** → **New bucket**
2. Nombre: `cvs`
3. ✅ Marcar "Make it public" 
4. Click **Create**

### 2️⃣ Desactivar RLS en Tabla Messages

**En Supabase → SQL Editor**, ejecuta:
```sql
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

O desde UI:
1. **Authentication** → **Policies**
2. Tabla `messages` → **Disable RLS**

### 3️⃣ Verificar CORS (si falla storage)

**En Supabase:**
1. **Project Settings** → **API**
2. En **CORS** agrega tu dominio Vercel:
   ```
   https://extra-hostelero-*.vercel.app
   ```

---

## 🧪 Cómo Probar

### Test 1: Upload de CV
```
1. F12 para abrir Developer Tools
2. Login como staff
3. Editar Perfil → Subir CV
4. Buscar en Console logs:
   - "Uploading CV to: ..."
   - "✅ CV subido correctamente!"
```

### Test 2: Mensajes en Chat
```
1. Login como local
2. Candidatos → Chat con alguien
3. Escribir mensaje → Enviar
4. En Console debería estar limpio (sin 403)
```

### Test 3: Notificaciones
```
1. Login como staff A
2. Abrir nueva pestaña → Login como local
3. Publicar oferta de tipo "Camarero"
4. Volver a staff A → Debería tener notificación
```

---

## 📋 Errores que Deberían Desaparecer

Después de seguir los pasos:
- ❌ ~~`403 Forbidden` en messages~~ → ✅ Desaparece
- ❌ ~~`400 Bad Request` en cvs~~ → ✅ Desaparece
- ❌ ~~`401 Unauthorized` manifest~~ → ✅ Aviso, pero no bloquea

---

## 💡 Si Algo Falla

**Antes de preguntar, comprueba:**
1. ¿Abriste **F12 → Console**? ¿Ves logs claros?
2. ¿El bucket `cvs` existe en Storage?
3. ¿Ejecutaste el ALTER TABLE?
4. ¿Renovaste la página (Ctrl+Shift+R)?

---

## 📞 Si Necesitas Ayuda

Pasa estos datos:
1. Screenshot de Storage → buckets (muestra si `cvs` existe)
2. Logs de Console (F12) cuando intentes subir CV
3. Resultado de ejecutar en SQL Editor:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'messages';
   ```

---

¡Esto debería resolver todos los errores! 🎯
