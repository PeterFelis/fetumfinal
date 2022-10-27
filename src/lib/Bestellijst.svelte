<script>
    import winkelwagen from "../stores/store";
    $: lijst = $winkelwagen;
    let zichtbaar = false;
    // bestelde aantallen optellen, dus combineren
    $: {
        if (lijst.length > 1) {
            let tijd = lijst[lijst.length - 1];
            lijst.splice(lijst.length - 1, 1);
            let waar = lijst.findIndex(
                (item) => item.produkt.id == tijd.produkt.id
            );
            if (waar == -1) lijst.push(tijd);
            else lijst[waar].aantal += tijd.aantal;
        }
    }

    // // beste prijs kiezen voor de klant
    const besteprijs = (prijzen, aantal) => {
        let besteprijs = prijzen[0].prijs;
        for (let teller = 0; teller < prijzen.length - 1; teller++) {
            if (prijzen[teller + 1].aantal > aantal) break;
            besteprijs = prijzen[teller + 1].prijs;
        }
        return `<div>${besteprijs.toFixed(2)} </div>
                <div>${(besteprijs * aantal).toFixed(2)}</div>`;
    };
</script>

<div on:click={() => (zichtbaar = !zichtbaar)}>
    <span class="material-symbols-outlined">shopping_cart</span>
    {#if lijst.length != 0}
        {lijst.length}
    {/if}
</div>

{#if zichtbaar}
    <div class="ww">
        {#if lijst.length > 0}
            <div class="wwlijst">
                <div>type</div>
                <div>Aantal</div>
                <div>prijs</div>
                <div>totaal</div>
                <div />

                {#each lijst as item (item.produkt.id)}
                    <div><b>{item.produkt.model}</b></div>
                    <div>{item.aantal} stuks</div>
                    {besteprijs(item.produkt.prijzen, item.aantal)}

                    <!--
    prijs per stuk:{(item.prijsTotaal*1).toFixed(2)}
    totaalprijs:{(item.aantal*item.prijsTotaal).toFixed(2)} -->
                    <div
                        class="knop"
                        on:click={() => {
                            // bij wissen bestelling uit de lijst halen
                            lijst.splice(
                                lijst.findIndex(
                                    (e) => e.produkt.id == item.produkt.id
                                ),
                                1
                            );
                            winkelwagen.set(lijst);
                            lijst = lijst;
                        }}
                    >
                        wissen
                    </div>
                {/each}
            </div>
        {:else}
            Niets in bestelling
        {/if}
    </div>
{/if}

<style>
    .ww {
        font-size: 1rem;
        width: auto;
        position: fixed;
        z-index: 100;
        top: 5rem;
        right: 20rem;
    }

    .wwlijst {
        font-size: 0.8rem;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        background: greenyellow;
    }

    .wwlijst > div {
        padding: 0.4rem;
        text-align: right;
    }
</style>
