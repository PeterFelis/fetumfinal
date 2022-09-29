<script>
	// met opladen afbeelding naar bucket
	import { supabase } from "../stores/supabase";

	import { createEventDispatcher } from "svelte";
	import Logo from "./Logo.svelte";
	const dispatch = createEventDispatcher();

	export let produkt;

	export let editable = false;
	export let ingeklapt = false;

	let opslaan;
	let afbeelding;
	let files;
	let prijzen = produkt.prijzen;
	let plaatje;

	prijzen.sort((a, b) => (a.aantal > b.aantal ? 1 : -1));

	if (prijzen.length == 0) prijzen.push({ prijs: "--", aantal: "--" });

	let huidigeType = produkt.type;

	const bijwerkenAfbeelding = async () => {
		let nieuweafbeelding = files[0].name;
		produkt.afbeeldingen.push(nieuweafbeelding);
		console.log(files[0]);
		//	await supabase.storage
		//		.from("produkten")
		//		.remove([produkt.id.toString()]);
		await supabase.storage
			.from("produkten")
			.upload(files[0].name, files[0]);

		let { data, error } = await supabase
			.from("producten")
			.update({ afbeeldingen: produkt.afbeeldingen })
			.eq("id", produkt.id);
		if (!error)
			console.log(
				"bijwerkenAfbeelding-> bijwerken afbeelding in database gelukt"
			);
	};

	const wisafbeelding = async () => {
		await supabase.storage
			.from("produkten")
			.remove([produkt.id.toString()]);
		let res = await supabase
			.from("producten")
			.update({ afbeeldingen: null })
			.eq("id", produkt.id);
		if (!res.error)
			console.log("afbeelding verwijderd en uit database gehaald");
		afbeelding = null;
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

	const ophalenAfbeelding = async (afbeelding) => {
		const { data, error } = await supabase.storage
			.from("produkten")
			.download(afbeelding);
		if (error) console.log(afbeelding, data, "nee");
		else return URL.createObjectURL(data);
	};

	if (produkt.afbeeldingen) {
		afbeelding = ophalenAfbeelding(produkt.afbeeldingen[0]);
	}

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
</script>

<div class="kaart">
	<div class="gridcolafbeelding g1">
		<div>
			{#if editable}
				<div class="gridcol">
					<h2
						contenteditable="true"
						bind:innerHTML={produkt.model}
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
					<h5
						contenteditable="true"
						bind:innerHTML={produkt.headline}
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
					<h3
						contenteditable="true"
						bind:innerHTML={produkt.categorie}
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
					<h3
						contenteditable="true"
						bind:innerHTML={produkt.type}
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
						contenteditable="true"
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
				<div class="p2">
					<div class:cuttext={ingeklapt}>
						{@html produkt.omschrijving}
					</div>
					{#if ingeklapt}
						<a href="/webshop/{produkt.id}/">meer...</a>
					{/if}
				</div>
				<!--prijs per stuk tonen bij ingeklapte view door klant-->
				{#if prijzen.length > 0 && ingeklapt}
					<div>
						Prijs vanaf: {parseFloat(
							prijzen[prijzen.length - 1].prijs
						).toFixed(2)} per stuk.
					</div>
				{/if}
			{/if}
		</div>

		{#if produkt.afbeeldingen}
			{#each produkt.afbeeldingen as afbeelding}
				{#await afbeelding then afbeelding}
					plaatje=URL.createObjectURL(afbeelding)
					<div class="full">
						<img class="fit" src={plaatje} />
					</div>
				{/await}
			{/each}
		{/if}
	</div>

	<!--prijsstaffel tonen bij uitgeklapte view en bijwerken bij editable-->
	{#if !ingeklapt}
		<div class="p4">
			<h3>Prijzen</h3>
			<button
				on:click={() => {
					produkt.prijzen = [
						...produkt.prijzen,
						{ prijs: "--", aantal: "--" },
					];
				}}
				>toevoegen
			</button>
			<div class="grid">
				<h5>aantal</h5>
				<h5>prijs per stuk</h5>
			</div>
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
								if (i == produkt.prijzen.length - 1) {
									produkt.prijzen = [
										...produkt.prijzen,
										{ prijs: "--", aantal: "--" },
									];
								}
							}}
						/>
					</div>
				{:else}
					<div class="grid">
						<h5>{parseInt(prijs.aantal)} stuks</h5>
						<h5>{parseFloat(prijs.prijs).toFixed(2)} per stuk</h5>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	{#if produkt.PDF}
		<div>
			<a href={produkt.PDF} target="_blank">Download PDF voor meer info</a
			>
		</div>
	{/if}

	<div class="grid">
		{#if editable}
			{#if produkt.PDF}
				<button on:click={() => wispdf()}>pdf verwijderen</button>
			{/if}

			{#if produkt.afbeeldingen}
				<button on:click={() => wisafbeelding()}
					>afbeelding verwijderen</button
				>
			{/if}
			<div>
				image
				<input
					type="file"
					bind:files
					on:change={() => {
						bijwerkenAfbeelding();
					}}
					accept="image/*"
				/>
			</div>
			<div>
				pfd
				<input
					type="file"
					bind:files
					on:change={() => {
						bijwerkenpdf();
					}}
					accept="application/pdf"
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	h2,
	h3 {
		margin: 0;
		padding: 0;
	}

	.gridcol {
		position: relative;
	}

	.gridcolafbeelding {
		position: relative;
		display: grid;
		grid-template-columns: 4fr 2fr;
	}

	.small {
		font-size: 0.8rem;
		top: -0.5rem;
		left: -3rem;
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

	.kaart:hover {
		border-bottom: 1px solid transparent;
		box-shadow: rgba(18, 120, 197, 0.1) 0px 1px 2px 0px,
			rgba(60, 64, 67, 0.05) 0px 2px 6px 2px,
			rgba(204, 39, 39, 0.08) 0px 4px 12px;
	}

	.cuttext {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
