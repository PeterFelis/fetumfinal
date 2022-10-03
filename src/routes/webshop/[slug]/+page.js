import { supabase } from '../../../stores/supabase';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { data: product, error } = await supabase.from('producten')
        .select()
        .eq('id', params.slug)

    if (error) {
        throw error(401, 'ik snap er niets van');
        return;
    }

    return {
        product
    };
}