<script>
    import winkelwagen from "../stores/store";
    $: lijst = $winkelwagen;
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
        console.log(prijzen);
        let besteprijs = prijzen[prijzen.length - 1].prijs;
        let teller = prijzen.length - 1;
        while (teller != 0 && prijzen[teller].aantal >= aantal) {
            console.log(teller);
            besteprijs = prijzen[teller].prijs;
            teller--;
        }
        console.log("besteprijs ", besteprijs);
        return `per stuk € ${besteprijs.toFixed(2)} totaal: ${
            besteprijs * aantal.toFixed(2)
        }`;
    };
</script>

<div class="ww klein">
    {#if lijst.length > 0}
        <h2>Bestellijst</h2>
        <div class="wwlijst">
            {#each lijst as item}
                <div>{item.produkt.model}</div>
                <div>{item.aantal} stuks</div>
                <div>
                    {besteprijs(item.produkt.prijzen, item.aantal)}
                </div>
                <!--
    prijs per stuk:{(item.prijsTotaal*1).toFixed(2)}
    totaalprijs:{(item.aantal*item.prijsTotaal).toFixed(2)} -->
                <div
                    class="knop"
                    on:click={() => {
                        // bij wissen bestelling uit de lijst halen
                        lijst.splice(
                            lijst.findIndex((e) => e.id == item.id),
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

<style>
    .ww {
        position: absolute;
        top: 7rem;
        right: 3rem;
        z-index: 1;
        padding: 1rem;
    }

    .wwlijst {
        justify-content: center;
        align-items: center;
        font-size: 0.6rem;
    }
</style>
