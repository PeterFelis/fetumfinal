<script>
    import winkelwagen from "../stores/store";
    let tijdlijst = [];

    $: lijst = $winkelwagen;
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
</script>

<div class="ww klein">
    {#if lijst.length > 0}
        {#each lijst as item}
            <div class=" m1">
                Type:{item.produkt.model}
                Aantal:{item.aantal}
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
            </div>
        {/each}
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
    }
</style>
