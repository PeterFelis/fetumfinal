<script>
    import "../pico.min.css";
    import "../style.css";
    import Menu from "$lib/Menu.svelte";
    import Logo from "$lib/Logo.svelte";
    import Bestellijst from "$lib/Bestellijst.svelte";
</script>

<Menu />
<Logo />
<Bestellijst/>

<slot />
