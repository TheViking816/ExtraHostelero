# ⚡ PASOS FINALES - Configuración Supabase para Chat

## Resumen de lo Implementado

✅ **Frontend (React/App.jsx)**:
- Panel de notificaciones con modal desplegable
- Sección de candidatos aceptados
- Chat button en cada candidato aceptado
- Carga automática de candidatos aceptados
- Todos los triggers para notificaciones automáticas

✅ **Base de Datos (SQL)**:
- Tabla cv_documents para guardar CVs
- Tabla de notificaciones con triggers automáticos
- Trigger para notificar cuando se publica job
- Trigger para notificar cuando staff aplica
- Trigger para notificar cuando llega mensaje
- Campos cv_url en profiles para almacenar URL del CV

⏳ **Pendiente - Configuración RLS (Row Level Security)**:
El chat no funciona porque RLS está bloqueando las operaciones. Debes ejecutar estos comandos en el SQL Editor de Supabase:

## 🔒 Comandos SQL a Ejecutar en Supabase

### Opción 1: Deshabilitar RLS Completamente (Recomendado para desarrollo)

```sql
-- Deshabilitar RLS en tablas críticas para chat y CV
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE cv_documents DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó correctamente
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('messages', 'conversations', 'cv_documents');
```

**Qué hace**: Permite que cualquier usuario autenticado pueda leer/escribir mensajes
**Seguridad**: Se mantiene la autenticación (deben estar logged-in), pero sin restricciones de rows
**Mejor para**: Desarrollo, prototipos, testing

### Opción 2: Crear Políticas RLS Específicas (Recomendado para producción)

Si prefieres mantener RLS habilitado, ejecuta esto en su lugar:

```sql
-- MESSAGES - Permitir leer/escribir propios mensajes y del otro usuario
CREATE POLICY "Enable read for authenticated users" ON messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- CONVERSATIONS - Permitir leer/actualizar si eres participante
CREATE POLICY "Enable read for conversation participants" ON conversations
  FOR SELECT USING (
    auth.uid() = local_id OR auth.uid() = staff_id
  );

CREATE POLICY "Enable insert for authenticated" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for participants" ON conversations
  FOR UPDATE USING (auth.uid() = local_id OR auth.uid() = staff_id);

-- CV_DOCUMENTS - Permitir leer propios CVs y CVs de propias aplicaciones
CREATE POLICY "Enable read CV of own staff" ON cv_documents
  FOR SELECT USING (
    auth.uid() = staff_id OR
    auth.uid() IN (
      SELECT local_id FROM jobs WHERE id IN (
        SELECT job_id FROM applications WHERE staff_id = auth.uid()
      )
    )
  );

CREATE POLICY "Enable insert own CV" ON cv_documents
  FOR INSERT WITH CHECK (auth.uid() = staff_id);
```

## 📍 Dónde Encontrar el SQL Editor

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto "ExtraHostelero"
3. En el menú izquierdo: **SQL Editor**
4. Click en **"New Query"**
5. Copia y pega el SQL de arriba (Opción 1 o 2)
6. Click **"Run"** (flecha negra)

## ✅ Cómo Verificar que Funcionó

Después de ejecutar el SQL:

1. **Test Chat Local → Staff**:
   - Login como Local (businesss_name: "Mi Local")
   - Abre "Candidatos Aceptados"
   - Click en "Chat" junto a un candidato
   - Escribe un mensaje y envía
   - Debe decir "Mensaje enviado ✓"

2. **Test Notificación Staff**:
   - Sin cerrar sesión Local, abre otra ventana/pestaña
   - Login como Staff (role: "staff")
   - Debes ver notificación que Local te envió un mensaje
   - Abre el chat y responde

3. **Test Chat Staff → Local**:
   - En la ventana Local, debes recibir la respuesta del Staff
   - Ambas conversaciones deben sincronizarse en tiempo real

## 🐛 Si Algo No Funciona

### Error: "403 Forbidden" en mensajes
- Significa: RLS aún está activo y bloqueando
- Solución: Ejecuta el SQL de Opción 1 nuevamente
- Verifica con: `SELECT * FROM pg_tables WHERE tablename='messages';`

### Error: "No RLS policies found"
- Significa: Tabla tiene RLS habilitado pero sin políticas
- Solución: Ejecuta Opción 1 (más simple) o todas las políticas de Opción 2

### Notificaciones no aparecen
- Verifica que triggers de 003_improvements.sql se ejecutaron
- Check: `SELECT * FROM pg_proc WHERE proname LIKE 'notify%';`

### Candidatos aceptados no aparecen
- Abre Console del navegador (F12)
- Busca errores rojos
- Verifica que al aceptar candidato muestra "Candidato aceptado!"

## 📊 Checklist Final

- [ ] SQL 003_improvements.sql ejecutado en Supabase ✅
- [ ] SQL Option 1 o 2 (RLS) ejecutado en Supabase ⏳ **NECESARIO**
- [ ] App.jsx compiló sin errores (`npm run build`) ✅
- [ ] Notificaciones popup funciona (click Bell) ⏳ **A TESTEAR**
- [ ] Candidatos aceptados aparecen ⏳ **A TESTEAR**
- [ ] Chat funciona (mensajes se envían sin 403) ⏳ **A TESTEAR**
- [ ] Notificaciones de chat recibidas ⏳ **A TESTEAR**

## 🚀 Próximos Pasos Post-Implementación

1. **Ejecuta el SQL de RLS** (30 segundos)
2. **Testea los 4 tests** en LOCALIZACION_FIXES.md
3. **Si todo funciona**: 
   - Documenta los resultados
   - Haz commit de cambios
   - Deploy a Vercel

4. **Si algo no funciona**:
   - Busca el error específico arriba
   - Ejecuta los comandos de diagnóstico
   - Reporte el resultado

---

**Importante**: Sin ejecutar el SQL de RLS, el chat NO funcionará.
**Estimado tiempo**: 2-3 minutos para ejecutar SQL + 5 minutos para testing
