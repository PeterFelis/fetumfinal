<script>
    import winkelwagen from "../stores/store";
    $:lijst=$winkelwagen;
</script>

{#if lijst.length > 0}
{#each lijst as item (item.naam)}
<div>
    naam:{item.naam} - 
    kleur:{item.kleur} - 
    aantal:{item.aantal} - 
    prijs per stuk:{(item.prijsTotaal*1).toFixed(2)}
    totaalprijs:{(item.aantal*item.prijsTotaal).toFixed(2)}
    <button on:click={()=>{
        // bij wissen bestelling uit de lijst halen 
            lijst.splice(lijst.findIndex((e)=>e.naam==item.naam),1)
            winkelwagen.set(lijst);
            lijst=lijst;
        }}>wissen</button>
    
</div>
{/each}
{:else}
 Niets in bestelling
{/if}


