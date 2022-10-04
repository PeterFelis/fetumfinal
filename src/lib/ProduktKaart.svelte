<script>
	// met opladen afbeelding naar bucket
	import { supabase } from "../stores/supabase";

	import { createEventDispatcher } from "svelte";
	import { goto } from "$app/navigation";

	const dispatch = createEventDispatcher();

	export let produkt;
	export let vorm = "overzicht";

	export let editable = false;

	//geeft status of het in het overzicht zit of alleen als stuk zichtbaar
	export let os = false;

	let opslaan;

	let files;
	let prijzen = produkt.prijzen;
	let lijst;

	let keuze,
		keuzeE = null;
	let doel,
		doelE = null;

	if (prijzen) {
		prijzen.sort((a, b) => (a.aantal > b.aantal ? 1 : -1));
		if (prijzen.length == 0) prijzen.push({ prijs: "--", aantal: "--" });
	}

	let huidigeType = produkt.type;

	const bijwerkenAfbeelding = async () => {
		let nieuweafbeelding;

		await supabase.storage
			.from("produkten")
			.upload(files[0].name, files[0]);

		let URL = await supabase.storage
			.from("produkten")
			.getPublicUrl(files[0].name);

		nieuweafbeelding = URL.publicURL;

		if (produkt.afbeeldingen)
			produkt.afbeeldingen = [...produkt.afbeeldingen, nieuweafbeelding];
		else produkt.afbeeldingen = [nieuweafbeelding];

		let afbeeldingnaardatabase = await supabase
			.from("producten")
			.update({ afbeeldingen: produkt.afbeeldingen })
			.eq("id", produkt.id);
		if (!afbeeldingnaardatabase.error)
			console.log(
				"bijwerkenAfbeelding-> bijwerken afbeelding in database gelukt"
			);
	};

	const bijwerkenpdf = async () => {
		await supabase.storage.from("pdfs").remove([produkt.id.toString()]);
		await supabase.storage
			.from("pdfs")
			.upload(produkt.id.toString(), files[0]);
		let { publicURL } = await supabase.storage
			.from("pdfs")
			.getPublicUrl(produkt.id.toString());
		let res = await supabase
			.from("producten")
			.update({ PDF: publicURL })
			.eq("id", produkt.id);
		if (!res.error) console.log("bijwerken pdf in database gelukt");
		produkt.PDF = publicURL;
	};

	const wispdf = async () => {
		await supabase.storage.from("pdfs").remove([produkt.id.toString()]);
		let res = await supabase
			.from("producten")
			.update({ PDF: null })
			.eq("id", produkt.id);
		if (!res.error) console.log("PDF verwijderd en uit database gehaald");
		produkt.PDF = null;
	};

	const update = async (wat) => {
		if (wat == "model") {
			await supabase
				.from("producten")
				.update({ model: produkt.model })
				.eq("id", produkt.id);
			return;
		}
		if (wat == "headline") {
			await supabase
				.from("producten")
				.update({ headline: produkt.headline })
				.eq("id", produkt.id);
			return;
		}
		if (wat == "omschrijving") {
			await supabase
				.from("producten")
				.update({ omschrijving: produkt.omschrijving })
				.eq("id", produkt.id);
			return;
		}

		if (wat == "categorie") {
			await supabase
				.from("producten")
				.update({ categorie: produkt.categorie })
				.eq("id", produkt.id);

			dispatch("categorie", { text: produkt.categorie });
			return;
		}

		if (wat == "afbeeldingen") {
			let afbeeldingnaardatabase = await supabase
				.from("producten")
				.update({ afbeeldingen: produkt.afbeeldingen })
				.eq("id", produkt.id);
			console.log(afbeeldingnaardatabase);
			return;
		}

		if (wat == "type") {
			await supabase
				.from("producten")
				.update({ type: produkt.type })
				.eq("id", produkt.id);

			dispatch("typ", {
				text: { huidig: huidigeType, nieuw: produkt.type },
			});
			huidigeType = produkt.type;
			return;
		}

		if (wat == "prijzen") {
			let prijzen = [];
			// lege velden eruit filteren
			for (let i = 0; i < produkt.prijzen.length; i++)
				if (
					produkt.prijzen[i].prijs != null &&
					produkt.prijzen[i].aantal != null &&
					!isNaN(produkt.prijzen[i].prijs) &&
					!isNaN(produkt.prijzen[i].aantal)
				)
					prijzen.push(produkt.prijzen[i]);
			console.log("uit de opslag", prijzen);

			//alles omzetten naar int en float
			for (let i = 0; i < prijzen.length; i++) {
				prijzen[i].aantal = parseInt(prijzen[i].aantal);
				prijzen[i].prijs = parseFloat(prijzen[i].prijs);
			}
			// sorteren
			prijzen.sort((a, b) => (a.aantal > b.aantal ? 1 : -1));

			produkt.prijzen = prijzen;
			await supabase
				.from("producten")
				.update({ prijzen: produkt.prijzen })
				.eq("id", produkt.id);
			return;
		}
	};

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target.result;
		};
	};

	function dragStart(e) {
		if (e.target == "li") keuzeE = e.target.querySelector("img");
		else keuzeE = e.target;
		keuze = keuzeE.getAttribute("src");
	}

	function dragend(e) {
		if (doelE == null) return;
		if (keuze == null) return;
		doel = doelE.getAttribute("src");
		doelE.setAttribute("src", keuze);
		keuzeE.setAttribute("src", doel);
		let plaatjes = [];
		for (let teller = 0; teller < lijst.childElementCount; teller++) {
			if (lijst.children[teller].querySelector("img") != null)
				plaatjes.push(lijst.children[teller].querySelector("img").src);
		}
		produkt.afbeeldingen = plaatjes;

		if (opslaan) clearTimeout(opslaan);
		opslaan = setTimeout(() => update("afbeeldingen"), 2000);
	}

	function dragover(e) {
		doelE = null;
		if (e.target.nodeName == "IMG") doelE = e.target;
		if (e.target.nodeName == "LI") doelE = e.target.querySelector("img");
	}
</script>

<div
	class="kaart"
	on:click={() => {
		if (!editable) goto("/webshop/" + produkt.id);
	}}
>
	<div class="{vorm == 'overzicht' ? 'gridoverzicht' : 'grid1'} g1">
		{#if vorm == "overzicht"}
			<div class="">
				{#if produkt.afbeeldingen}
					<img
						class="fit"
						src={produkt.afbeeldingen[0]}
						alt={produkt.model}
					/>
				{/if}
			</div>
		{/if}
		<div>
			{#if editable}
				<div class="gridcol">
					<input
						class="h2"
						type="text"
						maxlength="26"
						bind:value={produkt.model}
						on:keyup={() => {
							if (opslaan) clearTimeout(opslaan);
							opslaan = setTimeout(() => update("model"), 500);
						}}
					/>
					<div class="small">(model type nummer)</div>
				</div>
			{:else}
				<h2>
					{@html produkt.model}
				</h2>
			{/if}

			{#if editable}
				<div class="gridcol">
					<input
						class="h5"
						type="text"
						maxlength="43"
						bind:value={produkt.headline}
						on:keyup={() => {
							if (opslaan) clearTimeout(opslaan);
							opslaan = setTimeout(() => update("headline"), 500);
						}}
					/>
					<div class="small">(headline)</div>
				</div>
			{:else}
				<h5>{@html produkt.headline}</h5>
			{/if}

			{#if editable}
				<div class="gridcol">
					<input
						class="h5"
						type="text"
						maxlength="25"
						bind:value={produkt.categorie}
						on:keyup={() => {
							if (opslaan) clearTimeout(opslaan);
							opslaan = setTimeout(
								() => update("categorie"),
								500
							);
						}}
					/>
					<div class="small">(categorie)</div>
				</div>
			{/if}

			{#if editable}
				<div class="gridcol">
					<input
						class="h5"
						type="text"
						maxlength="25"
						bind:value={produkt.type}
						on:keyup={() => {
							if (opslaan) clearTimeout(opslaan);
							opslaan = setTimeout(() => update("type"), 500);
						}}
					/>
					<div class="small">(type)</div>
				</div>
			{/if}

			{#if editable}
				<div class="gridcol border">
					<div
						contenteditable
						bind:innerHTML={produkt.omschrijving}
						on:keyup={() => {
							if (opslaan) clearTimeout(opslaan);
							opslaan = setTimeout(
								() => update("omschrijving"),
								500
							);
						}}
					/>
					<div class="small">(omschrijving)</div>
				</div>
			{:else}
				<div class="">
					<div class:cuttext={vorm == "overzicht"}>
						{@html produkt.omschrijving}
					</div>
				</div>
			{/if}
			{#if vorm == "overzicht"}
				{#if !editable}
					<div class="rood font-bold">
						<a href="/webshop/{produkt.id}/">meer ></a>
					</div>
				{/if}
				{#if prijzen}
					<div class="p1">
						Prijs vanaf: {parseFloat(
							prijzen[prijzen.length - 1].prijs
						).toFixed(2)} per stuk.
					</div>
				{/if}
			{/if}

			{#if produkt.PDF}
				<div class="groen">
					<a href={produkt.PDF} target="_blank"
						>Download PDF voor meer info</a
					>
				</div>
			{/if}
		</div>
	</div>
	<div>
		{#if editable}
			<div class="gridautorow">
				{#if produkt.afbeeldingen}
					<ul class="grid" bind:this={lijst}>
						{#each produkt.afbeeldingen as afbeelding, i}
							<li
								on:dragstart={(e) => {
									if (editable) dragStart(e);
								}}
								on:dragend={dragend}
								on:dragover={(e) => {
									if (editable) dragover(e);
								}}
								on:dblclick={() => {
									console.log(i);
									produkt.afbeeldingen.splice(i, 1);
									produkt.afbeeldingen = produkt.afbeeldingen;
									update("afbeeldingen");
								}}
								draggable={editable}
								class="full"
							>
								<img
									class="fit"
									src={afbeelding}
									alt={produkt.model}
								/>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="grid">
				<div>
					Afbeelding
					<input
						onclick="this.value=''"
						name="image_uploads"
						type="file"
						bind:files
						on:change={(e) => {
							bijwerkenAfbeelding();
						}}
						accept="image/*"
					/>
				</div>
				<div>
					PDF
					<input
						onclick="this.value=''"
						type="file"
						bind:files
						on:change={(e) => {
							bijwerkenpdf();
						}}
						accept="application/pdf"
					/>
					{#if produkt.PDF}
						<button on:click={() => wispdf()}
							>pdf verwijderen</button
						>
					{/if}
				</div>
			</div>

			<!--prijsstaffel tonen bij uitgeklapte view en bijwerken bij editable-->
			<div class:cuttext={vorm != "overzicht"}>
				<div class="p4">
					<h3>Prijzen</h3>
					{#if editable}
						<button
							on:click={() => {
								produkt.prijzen = [
									...produkt.prijzen,
									{ prijs: "--", aantal: "--" },
								];
							}}
							>toevoegen
						</button>
					{/if}
					<div class="grid">
						<h5>aantal</h5>
						<h5>prijs per stuk</h5>
					</div>

					{#if produkt.prijzen}
						{#each produkt.prijzen as prijs, i}
							{#if editable}
								<div class="grid">
									<h5
										contenteditable="true"
										bind:innerHTML={prijs.aantal}
										on:blur={() => {
											if (prijs.prijs != "--") {
												update("prijzen");
											}
										}}
									/>
									<h5
										contenteditable="true"
										bind:innerHTML={prijs.prijs}
										on:blur={() => {
											update("prijzen");
											if (
												i ==
												produkt.prijzen.length - 1
											) {
												produkt.prijzen = [
													...produkt.prijzen,
													{
														prijs: "--",
														aantal: "--",
													},
												];
											}
										}}
									/>
								</div>
							{:else}
								<div class="grid">
									<h5>{parseInt(prijs.aantal)} stuks</h5>
									<h5>
										{parseFloat(prijs.prijs).toFixed(2)} per
										stuk
									</h5>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	ul {
		margin: 0;
		padding: 0;
	}

	li {
		list-style: none;
	}

	.gridcol {
		position: relative;
	}

	.gridoverzicht {
		display: grid;
		grid-template-columns: 1fr 3fr;
	}

	.small {
		font-size: 0.8rem;
		top: -1rem;
		right: -2rem;
		position: absolute;
		color: var(--paars);
	}

	.kaart {
		width: 90%;
		height: 100%;
		padding: 1rem;
		margin: 1em 0 1em 0;
		border-radius: 8px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.068);
	}

	.cuttext {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
