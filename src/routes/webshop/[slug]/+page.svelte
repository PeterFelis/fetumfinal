<script>
    import ProduktKaart from "$lib/ProduktKaart.svelte";
    export let data;
    let produkt = data.product[0];
    let vorm = "totaal";
</script>

<div class="container">
    <button on:click={() => history.back()}>terug </button>
    <ProduktKaart {produkt} {vorm} />
</div>
