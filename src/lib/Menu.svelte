<script>
let zichtbaar=false;
</script>


<div class="menugroot container">
	<nav data-sveltekit-prefetch class="grid">
		<a href="/">home</a>
		<a href="/contact">contact</a>
		<a href="/voorwaarden">voorwaarden</a>
		<a href="/webshopinfo">webshopinfo</a>
		<a href="/webshop">webshop</a>
		<a href="/mail">mail</a>
	</nav>
</div>

<div class="kleinknop" 
	on:click="{()=>{zichtbaar=!zichtbaar; console.log(zichtbaar)}}">
	MENU
</div>

<nav data-sveltekit-prefetch class="menuklein"  
	class:zichtbaar={zichtbaar}
	on:click="{()=>zichtbaar=false}"
	>
		<a href="/">home</a>
		<a href="/contact">contact</a>
		<a href="/voorwaarden">voorwaarden</a>
		<a href="/webshopinfo">webshopinfo</a>
		<a href="/webshop">webshop</a>
		<a href="/mail">mail</a>
</nav>


<style>
	a {
		text-decoration: none;
		color: var(--donkergroen);
	}
	.menugroot{
		display: none;
	}
	.menuklein{
		display:grid;
		grid-template-rows: auto;
		grid-template-columns: 1fr;
		visibility: visible;
		background-color: white;
		height:100vh;
		width: 100vw;
		position: fixed;
		left:-100vw;
		top:0;
		z-index: 20;
		padding: 5rem;
	}
	
	.zichtbaar{
		left:0vw;
	}

	.kleinknop{
		position: fixed;
		left:1em;
		top:1em;
		visibility: visible;
		z-index: 100;
	}


@media (min-width: 991px) {
	.menugroot{
		display:block;
		min-height:2rem;
	}
	.menuklein{
		visibility: hidden;
	}
	.kleinknop{
		visibility: hidden;
	}
}

</style>