import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Configuración incompleta: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas. Revisa tu archivo .env.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Función auxiliar para verificar la conectividad con Supabase de forma segura.
 */
export const testSupabaseConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return {
      success: false,
      message: 'Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en tu archivo .env.local.'
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, message: `Error de respuesta en Supabase: ${error.message}` };
    }
    return { success: true, message: '¡Conexión exitosa a tu proyecto de Supabase!' };
  } catch (err) {
    return { success: false, message: `Error de red al conectar con Supabase: ${err.message}` };
  }
};

