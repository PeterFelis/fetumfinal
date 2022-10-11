import { supabase } from '../../stores/supabase';

export async function load({ params, url }) {
    const { data: producten, error } = await supabase.from('producten')
        .select('*')
        .order('catVolgnr', { ascending: true })
        .order('prodtypevolg', { ascending: true })
        .order('prodVolg', { ascending: true })

    let cat = url.searchParams.get('cat')
    let type = url.searchParams.get('type')
    let model = url.searchParams.get('model')

    return {
        producten,
        cat,
        type,
        model
    }
}