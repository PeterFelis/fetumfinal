import { supabase } from '../../stores/supabase';

export async function load() {
    const { data: producten, error } = await supabase.from('producten')
        .select('*')
        .order('catVolgnr', { ascending: true })
        .order('type', { ascending: true });
    return {
        producten
    };
}