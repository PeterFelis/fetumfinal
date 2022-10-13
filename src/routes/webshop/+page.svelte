<script>
	import Produkt from "$lib/ProduktKaart.svelte";
	import { supabase } from "../../stores/supabase";
	import settings from "../../stores/instellingen";
	import { goto } from "$app/navigation";

	export let data; // data van de serverside load!!;

	// op volgorder zetten, server levert gesorteerd aan
	let volgorde = data.producten;
	let cat = data.cat; // als terugkomt van kaart zorgen dat overzicht weer uptodate is
	let type = data.type;
	let model = data.model;
	let categorien;

	// categorien maken
	const categorieenOpVolgordeZetten = () => {
		let tijdcat = new Set();
		let cats = volgorde;

		cats.forEach((element) => {
			tijdcat.add(element.categorie);
		});
		categorien = [...tijdcat];
	};
	categorieenOpVolgordeZetten();

	$: produkten = volgorde;
	$: cats = categorien;
	$: types = [];
	let typeLijstOpform = [];
	let volgordeOpform = [];

	let produkttype = "";
	if (type) produkttype = type;

	let geselecteerdecategorie = $settings.geselecteerdecategorie;
	if (type) geselecteerdecategorie = cat;
	let editable = false;

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

	export function dragOver(e) {
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

	if (model) goto(`#${model}`);
</script>

<div class="container m2 h50 grid2r">
	<div class="centergrid">
		<h1 class="groot center">Webshop</h1>
		<h2 class="center">Alles op een rij</h2>
	</div>
	<div class="beer" />
</div>

<div class="container">
	<div class="border">
		editabtle <input type="checkbox" bind:checked={editable} />
		{#if editable}
			<span class="material-symbols-outlined"> delete </span>
		{/if}
	</div>

	<div class="allover">
		<div
			class="categorien"
			on:click={() => {
				produkttype = "";
			}}
		>
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
									on:click|preventDefault|stopPropagation={() => {
										geselecteerdecategorie = cat;
										produkttype = "";
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
									on:click|preventDefault|stopPropagation={() =>
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
								{#if produkt.type == produkttype || (produkt.categorie == geselecteerdecategorie && produkttype == "")}
									<a href="#{produkt.model}">
										<li
											on:dragstart={dragStart}
											on:dragleave={dragPRODend}
											on:dragover={dragOver}
											draggable={editable}
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

			<div class="shop">
				{#await produkten then produkten}
					{#each produkten as produkt}
						{#if produkt.categorie == geselecteerdecategorie}
							{#if produkt.type == produkttype || produkttype == ""}
								<div>
									<a id={produkt.model} />
									<Produkt
										{produkt}
										{editable}
										on:categorie={(e) => {
											cats[
												cats.indexOf(
													geselecteerdecategorie
												)
											] = e.detail.text;
											geselecteerdecategorie =
												e.detail.text;
											categorieenOpVolgordeZetten();
										}}
										on:typ={(e) => {
											types[
												types.indexOf(
													e.detail.text.huidig
												)
											] = e.detail.text.nieuw;
											produkttype = e.detail.text.nieuw;
											categorieKeuze();
										}}
										on:model={(e) => {
											console.log("model");
											let pos = produkten.indexOf(
												(i) =>
													i.model ==
													e.detail.text.huidig
											);

											// produkten[
											// 	produkten.indexOf(
											// 		(t) =>
											// 			t.model ==
											// 			e.detail.text.huidig
											// 	)
											// ] = e.detail.text.nieuw;
											console.log("pos", pos);
											//produkttype = e.detail.text.nieuw;
											//categorieKeuze();
											//produkten = produkten;
										}}
										on:verwijderd={(id) => {
											volgorde = produkten.filter(
												function (e) {
													return e.id != id;
												}
											);
											console.log(
												"te verwijderen uit lijst",
												id
											);
										}}
									/>
								</div>
							{/if}
						{/if}
					{/each}
				{/await}
			</div>
		</div>
	</div>
</div>

<style>
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

	.muis {
		cursor: pointer;
	}

	.beer {
		background: url("afbeeldingen/muisopruguitgeknipt.png") center center;
		background-size: cover;
	}

	.allover {
		display: grid;
		grid-template-columns: 1fr 3fr;
	}

	.shop {
		display: grid;
		grid-template-columns: 1fr;
	}
</style>
