<script>
	import Produkt from "$lib/ProduktKaart.svelte";
	import { supabase } from "../../stores/supabase";
	import settings from "../../stores/instellingen";

	export let data; // data van de serverside load!!

	// op volgorder zetten, server levert gesorteerd aan
	let volgorde = [...data.producten];
	// categorien maken
	const tijdcat = new Set();
	let cats = volgorde;

	cats.forEach((element) => {
		tijdcat.add(element.categorie);
	});
	let categorien = [...tijdcat];

	$: produkten = volgorde;
	$: cats = categorien;
	$: types = [];
	let typeLijstOpform = [];
	let volgordeOpform = [];

	let types = [];
	let produkttype = "";
	let geselecteerdecategorie = $settings.geselecteerdecategorie;

	let editable = false;
	let ingeklapt = false;

	const categorieKeuze = () => {
		let hulp = [];
		produkten.forEach((element) => {
			if (element.categorie == geselecteerdecategorie) hulp.push(element);
		});
		hulp.sort((a, b) => a.prodtypevolg - b.prodtypevolg);
		types = [];
		for (let teller = 0; teller < hulp.length; teller++)
			types.push(hulp[teller].type);
		hulp = new Set(types);
		types = [...hulp];
	};

	//drag and drop sorteren
	let selected = null;

	function dragOver(e) {
		if (!editable) return;
		if (isBefore(selected, e.target)) {
			e.target.parentNode.insertBefore(selected, e.target);
		} else {
			e.target.parentNode.insertBefore(selected, e.target.nextSibling);
		}
	}

	let opslaan;

	function dragCATEnd() {
		if (!editable) return;
		if (opslaan) clearTimeout(opslaan);
		opslaan = setTimeout(() => aanpassencatVolgnr(), 1000);
		cats = cats;
	}

	function dragTYPEend() {
		if (!editable) return;
		if (opslaan) clearTimeout(opslaan);
		opslaan = setTimeout(() => aanpassentypeVolgnr(), 1000);
	}

	function dragPRODend() {
		if (!editable) return;
		if (opslaan) clearTimeout(opslaan);
		opslaan = setTimeout(() => aanpassenprodVolgnr(), 1000);
	}

	function dragStart(e) {
		if (!editable) return;
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", null);
		selected = e.target;
	}

	function isBefore(el1, el2) {
		if (!editable) return;
		let cur;
		if (el2.parentNode === el1.parentNode) {
			for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
				if (cur === el2) return true;
			}
		}
		return false;
	}

	let lijst;

	const aanpassencatVolgnr = async () => {
		let cat;
		for (let teller = 0; teller < lijst.childElementCount; teller++) {
			cat = lijst.children[teller].innerHTML.trim();

			const { data, error } = await supabase
				.from("producten")
				.update({ catVolgnr: teller })
				.match({ categorie: cat });
		}
	};

	const aanpassenprodVolgnr = async () => {
		let tijd;
		for (
			let teller = 0;
			teller < volgordeOpform.childElementCount;
			teller++
		) {
			tijd = volgordeOpform.children[teller].innerHTML.trim();

			const { data, error } = await supabase
				.from("producten")
				.update({ prodVolg: teller })
				.match({ model: tijd });
		}
	};

	const aanpassentypeVolgnr = async () => {
		let tijd;
		for (
			let teller = 0;
			teller < typeLijstOpform.childElementCount;
			teller++
		) {
			tijd = typeLijstOpform.children[teller].innerHTML.trim();

			const { data, error } = await supabase
				.from("producten")
				.update({ prodtypevolg: teller })
				.match({ type: tijd });
		}
	};
</script>

<div class="container p4 h75 grid2r vertcenter">
	<div>
		<h1 class="groot center">Webshop<br />info</h1>
		<h2 class="center">Alles op een rij</h2>
	</div>
	<div>plaatje</div>
</div>

<div class="container">
	<div class="p4">
		editabtle <input type="checkbox" bind:checked={editable} />
		ingeklapt <input type="checkbox" bind:checked={ingeklapt} />
	</div>

	<div class="gridShop">
		<div class="categorien" on:click={() => (produkttype = "")}>
			<div>
				<div>
					<h4 class="font-bold">Categorien</h4>
					<ul class="lijst muis" bind:this={lijst}>
						{#await cats then cats}
							{#each cats as cat}
								<li
									on:dragstart={dragStart}
									on:dragleave={dragCATEnd}
									on:dragover={dragOver}
									draggable={editable}
									on:click={() => {
										geselecteerdecategorie = cat;
										categorieKeuze();
									}}
								>
									{cat}
								</li>
							{/each}
						{/await}
					</ul>
				</div>
				<div>
					<h4 class="font-bold">Types</h4>
					{#if produkten}
						<ul bind:this={typeLijstOpform} class="muis">
							{#each types as type}
								<li
									on:dragstart={dragStart}
									on:dragleave={dragTYPEend}
									on:dragover={dragOver}
									draggable={editable}
									on:click|stopPropagation={() =>
										(produkttype = type)}
								>
									{type}
									<!--categorieKeuze();-->
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					<h4 class="font-bold">Modellen</h4>
					{#if produkten}
						<ul bind:this={volgordeOpform} class="muis">
							{#each produkten as produkt}
								{#if produkt.type == produkttype}
									<a href="#{produkt.model}">
										<li
											on:dragstart={dragStart}
											on:dragleave={dragPRODend}
											on:dragover={dragOver}
											draggable={editable}
											on:click|stopPropagation={() =>
												(produkttype = type)}
										>
											{produkt.model}
										</li>
									</a>
								{/if}
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>

		<div>
			<h5 class="font-bold center">
				{geselecteerdecategorie}

				{#if produkttype}
					--> {produkttype}
				{/if}
			</h5>
			{#await produkten then produkten}
				{#each produkten as produkt}
					{#if produkt.categorie == geselecteerdecategorie}
						{#if produkttype == ""}
							<a id={produkt.model} />
							<Produkt
								{produkt}
								{editable}
								{ingeklapt}
								on:categorie={(e) => {
									cats[cats.indexOf(geselecteerdecategorie)] =
										e.detail.text;
									geselecteerdecategorie = e.detail.text;
								}}
								on:typ={(e) => {
									types[types.indexOf(e.detail.text.huidig)] =
										e.detail.text.nieuw;
									produkttype = e.detail.text.nieuw;
									types = types;
								}}
							/>
						{:else if produkt.type == produkttype}
							<a id={produkt.model} />
							<Produkt
								{produkt}
								{editable}
								{ingeklapt}
								on:categorie={(e) => {
									cats[cats.indexOf(geselecteerdecategorie)] =
										e.detail.text;
									geselecteerdecategorie = e.detail.text;
								}}
								on:typ={(e) => {
									types[types.indexOf(e.detail.text.huidig)] =
										e.detail.text.nieuw;
									produkttype = e.detail.text.nieuw;
									types = types;
								}}
							/>
						{/if}
					{/if}
				{/each}
			{/await}
		</div>
	</div>
</div>

<style>
	.gridShop {
		display: grid;
		grid-template-columns: 1fr 3fr;
	}

	.categorien {
		padding: 0;
		margin: 0;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	li {
		list-style: none;
		margin: 0;
	}

	h2,
	h4,
	h5 {
		margin: 0;
	}
	.muis {
		cursor: pointer;
	}
</style>
