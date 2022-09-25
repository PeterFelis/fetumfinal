import { writable } from "svelte/store";

export const settings = writable(
    {
        geselecteerdecategorie: 'hoofdtelefoons',
        test: 'test'
    }

);

export default settings