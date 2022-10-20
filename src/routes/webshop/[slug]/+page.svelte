<script>
    import { goto } from "$app/navigation";
    import ProduktKaart from "$lib/ProduktKaart.svelte";
    export let data;
    let produkt = data.product[0];
    let vorm = "totaal";
</script>

<div class="container">
    <ProduktKaart {produkt} {vorm} />
    <div
        class="hand"
        on:click={() =>
            goto(
                `/webshop?cat=${produkt.categorie}&type=${produkt.type}&model=${produkt.model}`
            )}
    >
        <div class="terug">
            <span class="material-symbols-outlined"> arrow_back</span>
            terug naar overzicht
        </div>
    </div>
</div>

<style>
    .terug {
        display: grid;
        grid-template-columns: 1fr 2fr;
        max-width: 30%;
        justify-content: center;
        align-items: center;
        margin: 2rem auto 5rem auto;
    }
</style>
