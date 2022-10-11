<script>
    import { goto } from "$app/navigation";
    import ProduktKaart from "$lib/ProduktKaart.svelte";
    export let data;
    let produkt = data.product[0];
    let vorm = "totaal";
</script>

<div class="container">
    <ProduktKaart {produkt} {vorm} />
    <button
        on:click={() =>
            goto(
                `/webshop?cat=${produkt.categorie}&type=${produkt.type}&model=${produkt.model}`
            )}
    >
        <span class="material-symbols-outlined"> arrow_back </span>
        <span>terug naar overzicht</span>
    </button>
</div>
