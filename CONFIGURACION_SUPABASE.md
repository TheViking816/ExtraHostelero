# Configuración de Supabase Storage - Bucket de Avatars

## 📋 Resumen de Cambios

Se ha añadido la funcionalidad de edición de perfil que incluye la subida de fotos de perfil (avatars). Para que esto funcione, necesitas crear un bucket de storage en Supabase.

## 🚀 Opción 1: Crear Bucket con SQL (Recomendado)

### Paso 1: Ejecutar SQL
1. Ve a tu proyecto en Supabase Dashboard
2. En el menú lateral, selecciona **SQL Editor**
3. Crea una nueva query
4. Copia y pega el siguiente código:

```sql
-- Crear el bucket 'avatars'
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que cualquiera pueda VER los avatars (público)
CREATE POLICY "Avatars son públicos para ver"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir que usuarios autenticados suban sus propios avatars
CREATE POLICY "Usuarios pueden subir sus avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Permitir que usuarios autenticados actualicen sus propios avatars
CREATE POLICY "Usuarios pueden actualizar sus avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Permitir que usuarios autenticados eliminen sus propios avatars
CREATE POLICY "Usuarios pueden eliminar sus avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

5. Haz clic en **Run** para ejecutar

### Paso 2: Verificar
Ejecuta esta query para verificar que se creó correctamente:

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

Deberías ver una fila con:
- **id**: avatars
- **name**: avatars
- **public**: true

---

## 🖱️ Opción 2: Crear Bucket desde la Interfaz Web

### Paso 1: Crear el Bucket
1. Ve a tu proyecto en Supabase Dashboard
2. En el menú lateral, selecciona **Storage**
3. Haz clic en **"New bucket"**
4. Configura así:
   - **Name**: `avatars`
   - **Public bucket**: ✅ SÍ (marcado)
   - **File size limit**: 5MB (opcional pero recomendado)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/jpg` (opcional)
5. Haz clic en **"Create bucket"**

### Paso 2: Configurar Políticas de Seguridad

Una vez creado el bucket:

1. Ve a **Storage > avatars > Policies**
2. Haz clic en **"New Policy"**
3. Crea las siguientes 4 políticas:

#### Política 1: Lectura pública
```
Policy name: Avatars son públicos para ver
Operation: SELECT
Target roles: public
USING expression: bucket_id = 'avatars'
```

#### Política 2: Subir avatars
```
Policy name: Usuarios pueden subir sus avatars
Operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'avatars'
```

#### Política 3: Actualizar avatars
```
Policy name: Usuarios pueden actualizar sus avatars
Operation: UPDATE
Target roles: authenticated
USING expression: bucket_id = 'avatars'
```

#### Política 4: Eliminar avatars
```
Policy name: Usuarios pueden eliminar sus avatars
Operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'avatars'
```

---

## ✅ Verificación

Para verificar que todo funciona:

1. Inicia sesión en tu aplicación
2. Intenta editar tu perfil y subir una foto
3. Ve a **Storage > avatars** en Supabase Dashboard
4. Deberías ver el archivo subido
5. La foto debería aparecer en tu perfil

---

## 🔧 Configuración Avanzada (Opcional)

### Limitar tamaño de archivo
Si quieres limitar el tamaño de los avatars a 5MB:
1. Ve a **Storage > avatars > Settings**
2. En **File size limit**, pon `5242880` (5MB en bytes)
3. Guarda cambios

### Restringir tipos de archivo
Para permitir solo imágenes:
1. Ve a **Storage > avatars > Settings**
2. En **Allowed MIME types**, añade:
   ```
   image/jpeg
   image/png
   image/webp
   image/jpg
   ```
3. Guarda cambios

---

## 🌐 URL de los Avatars

Los avatars subidos tendrán URLs públicas con este formato:

```
https://[tu-proyecto-id].supabase.co/storage/v1/object/public/avatars/[nombre-archivo].jpg
```

Ejemplo:
```
https://oknpgpencszibnmndyzm.supabase.co/storage/v1/object/public/avatars/abc123-1234567890.jpg
```

---

## ❓ Solución de Problemas

### Error: "new row violates row-level security policy"
**Causa**: Las políticas de RLS no están configuradas correctamente.
**Solución**: Asegúrate de haber creado las 4 políticas mencionadas arriba.

### Error: "Bucket not found"
**Causa**: El bucket no se creó correctamente.
**Solución**: Verifica que el bucket 'avatars' existe en Storage y está marcado como público.

### Las imágenes no se ven
**Causa**: El bucket no está marcado como público.
**Solución**:
1. Ve a **Storage > avatars > Settings**
2. Marca **Public bucket** como true
3. Guarda cambios

### Error al subir archivo
**Causa**: Puede ser por tamaño de archivo o tipo MIME no permitido.
**Solución**:
- Verifica el tamaño del archivo (debe ser < 5MB)
- Verifica que es una imagen válida (JPG, PNG, WEBP)

---

## 📝 Notas Importantes

- ✅ El bucket debe ser **público** para que las fotos se vean sin autenticación
- ✅ Solo usuarios autenticados pueden subir/modificar/eliminar archivos
- ✅ Cualquiera puede **ver** los avatars (son públicos)
- ✅ El código de la app ya está configurado para usar el bucket 'avatars'
- ⚠️ No olvides crear las 4 políticas de seguridad

---

## 🎯 Próximos Pasos

Una vez configurado el bucket de avatars:

1. ✅ Prueba subir una foto desde la app
2. ✅ Verifica que se ve correctamente
3. ✅ Prueba editar el perfil completo
4. ✅ Verifica que los cambios se guardan

---

## 📚 Referencias

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Limits](https://supabase.com/docs/guides/storage#file-size-limits)
