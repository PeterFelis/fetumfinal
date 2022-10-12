<script>
	// met opladen afbeelding naar bucket
	import { supabase } from "../stores/supabase";

	import { createEventDispatcher } from "svelte";
	import { goto } from "$app/navigation";

	const dispatch = createEventDispatcher();

	export let produkt;

	let groteAfbeelding;
	if (produkt.afbeeldingen) {
		groteAfbeelding = 0;
	}
	export let vorm = "overzicht";
	export let editable = false;

	let opslaan;

	let files;
	let prijzen = produkt.prijzen;

	let lijst;
	// dit is voor het drag en drop
	let keuze,
		keuzeE = null;
	let doel,
		doelE = null;

	//prijzen automatisch op volgorde zetten
	if (prijzen) {
		prijzen.sort((a, b) => (a.aantal > b.aantal ? 1 : -1));
		if (prijzen.length == 0) prijzen.push({ prijs: "--", aantal: "--" });
	}

	let huidigeType = produkt.type;

	// hoever de winow gescrolled is om bij klikken geen springer te krijgen

	function omzetten(text) {
		// als leeg
		if (text == null) return (text = "");
		//splitsen op de divs
		let lijst = text.split("<div>");
		//</divs verwijderen
		for (let i = 0; i < lijst.length; i++)
			if (lijst[i].includes("</div>")) {
				let pos = lijst[i].indexOf("</div");
				lijst[i] = lijst[i].substr(0, pos);
			}

		text = "";
		for (const lijn of lijst) {
			if (lijn[0] == "-") text += "<h4>" + lijn.substring(1) + "</h4>";
			else {
				let keyval = lijn.split(",");
				console.log(keyval);
				text += "<div class='grid'><div>" + keyval[0];
				if (keyval.length > 1) text += "</div><div>" + keyval[1];

				text += "</div></div>";
			}
		}

		return text;
	}

	let aanvullendetext = omzetten(produkt.aanvullen);

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

		if (wat == "aanvullen") {
			await supabase
				.from("producten")
				.update({ aanvullen: produkt.aanvullen })
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
			// kijken of een van de pos is leeg -> dan in bewerking
			for (let i = 0; i < produkt.prijzen.length; i++) {
				if (
					produkt.prijzen[i].aantal == null &&
					produkt.prijzen[i].prijs != null
				)
					return;
				if (
					produkt.prijzen[i].aantal != null &&
					produkt.prijzen[i].prijs == null
				)
					return;
			}
			// beide regels leeg -> verwijderen
			for (let i = 0; i < produkt.prijzen.length; i++) {
				if (
					produkt.prijzen[i].aantal != null &&
					produkt.prijzen[i].prijs != null
				)
					prijzen.push(produkt.prijzen[i]);
			}

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
	<!-- plaatje een links laten zien bij algemeen overzicht -->
	<div class="{vorm == 'overzicht' ? 'gridoverzicht' : 'grid2'} g2">
		{#if vorm == "overzicht"}
			<div class="">
				{#if produkt.afbeeldingen}
					<img
						class="pas"
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

			<!--prijzen op detail view-->
			{#if produkt.prijzen}
				{#if vorm != "overzicht"}
					<div class="grid2 p2 border">
						<div class="font-bold">Aantal</div>
						<div class="font-bold">Prijs</div>
						{#each produkt.prijzen as { aantal, prijs }}
							<div>{aantal}</div>
							<div>{parseFloat(prijs).toFixed(2)}</div>
						{/each}
					</div>
				{/if}
			{/if}

			<!-- afbeeldingen op detail niveau-->
			<div>
				{#if vorm != "overzicht"}
					<div class="grid p1">
						{#if produkt.afbeeldingen}
							<ul class="grid">
								{#each produkt.afbeeldingen as afbeelding, i}
									<li class="full">
										<img
											class="fit"
											src={afbeelding}
											alt={produkt.model}
											on:click|preventDefault|stopPropagation={() => {
												groteAfbeelding = i;
											}}
										/>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>

			<!-- aanvullende tekst met formattering-->
			{#if vorm != "overzicht"}
				<div>
					{@html aanvullendetext}
				</div>
			{/if}
		</div>

		<!-- plaatjes op detailpagina-->

		{#if vorm != "overzicht"}
			<!--plaatjes recht bij detailview-->
			<!-- hier zit het springerprobleem-->
			<div class="grid">
				{#if produkt.afbeeldingen}
					<img
						class="pas"
						src={produkt.afbeeldingen[groteAfbeelding]}
						alt={produkt.model}
					/>
				{/if}
			</div>
		{/if}
	</div>
	<div>
		<!-- alle plaatjes tonen bij editable om te kunnen verplaatsen-->
		<!-- bestaand plaatje dubbelklikken om te verwijderen-->
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

			<!-- opladen afbeeldingen en ivoegen en verwijderen pdf-->
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

			<!--prijsstaffel tonen bij bijwerken bij editable-->
			<div class:cuttext={vorm != "overzicht"}>
				<div class="p4">
					<h3>Prijzen</h3>
					<div class="grid">
						<h5>aantal</h5>
						<h5>prijs per stuk</h5>
					</div>

					{#if produkt.prijzen}
						{#each produkt.prijzen as prijs, i}
							{#if editable}
								<div class="grid">
									<input
										type="number"
										contenteditable="true"
										bind:value={prijs.aantal}
										on:keydown={(e) => {
											if (e.key == "Tab")
												update("prijzen");
										}}
									/>
									<input
										type="number"
										contenteditable="true"
										data-nr={i}
										bind:value={prijs.prijs}
										on:keydown={(e) => {
											if (
												e.key == "Tab" &&
												e.target.dataset.nr ==
													produkt.prijzen.length - 1
											) {
												update("prijzen");
												produkt.prijzen = [
													...produkt.prijzen,
													{
														prijs: null,
														aantal: null,
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

	<!-- extra tekxt bij produkt invullen, wordt automatisch bewerkt door systeem-->
	{#if editable}
		<div class="gridcol border">
			<div
				contenteditable
				bind:innerHTML={produkt.aanvullen}
				on:keyup={() => {
					if (opslaan) clearTimeout(opslaan);
					opslaan = setTimeout(() => update("aanvullen"), 500);
				}}
			/>
			<div class="small">(omschrijving)</div>
		</div>
	{/if}
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
