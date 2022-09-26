<script>
	// met opladen afbeelding naar bucket
	import { supabase } from '../stores/supabase';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let produkt;

	export let editable = false;
	export let ingeklapt = false;

	let opslaan;

	let afbeelding;
	let pdf;
	
	let files;

	let huidigeType = produkt.type;

	const bijwerkenAfbeelding = async () =>{
		let naam = (files[0].name);
		let ext=(naam.split('.'));
		let nieuweafbeelding=produkt.id+"."+ext[1];
		console.log(nieuweafbeelding)

		if (produkt.afbeeldingen){
			console.log(produkt.afbeeldingen[0]);
			let {error} = await supabase.storage.from('produkten').remove([nieuweafbeelding]);
				console.log('verwijderen:',error)
				if (error) return;
			}

		let {data,error} = await supabase.storage.from('produkten').upload(nieuweafbeelding, files[0]);
		//let { data, error } = await supabase.storage.from('produkten').update(produkt.id+'.'+naam[1], files[0]);
			console.log(' uploaden afbeelding data ',data, error);
		if (error) {
			console.log('bijwerkenAfbeelding->storage afbeelding',error);
			return;
		}

		produkt.afbeeldingen=nieuweafbeelding;
		let {data3,error3} = await supabase.from('producten')
		.update({afbeeldingen: [produkt.afbeeldingen] })
		.eq('id', produkt.id);
		if (error3) {
			console.log('bijwerkenAfbeelding-> bijwerken produkt in database',error3);
			return
		}
		afbeelding = URL.createObjectURL(files[0]);
	}
	
	const bijwerkenpdf = async () =>{
		let naam = (files[0].name);
		let ext=(naam.split('.'));
		let nieuwepdf=produkt.id+"."+ext[1];
		console.log(nieuwepdf)
		if (produkt.pdf){
			console.log('wissen oude pdf')
			let {data,error} = await supabase.storage.from('pdfs').remove(produkt.pdf);
				if (error) { console.log('pdf verwijderen niet geluk', error)}
			return;
			}

		let {data2,error2} =await supabase.storage.from('pdfs').upload(nieuwepdf, files[0]);
		//let { data, error } = await supabase.storage.from('produkten').update(produkt.id+'.'+naam[1], files[0]);
		let {publicURL,error4} =await supabase.storage.from('pdfs').getPublicUrl(nieuwepdf);
			console.log('opgeladen pdf ',publicURL)
		if (error4) {
			console.log('bijwerkenpfd->storage afbeelding',error4);
			return;
		}

		produkt.pfd=nieuwepdf;
		let {data3,error3} = await supabase.from('producten')
		.update( {pdf: 'bier'})
		.eq('id', produkt.id);
		if (error3) {
			console.log('bijwerkenpdf-> bijwerken pdf in database',error3);
			return
		}
		pdf = publicURL;
		console.log (pdf);

	}
	

	const ophalenAfbeelding = async (afbeelding) => {
		const { data, error } = await supabase.storage.from('produkten').download(afbeelding);
		if (error) console.log(afbeelding,data,'nee');
		else return URL.createObjectURL(data);
	};

	if (produkt.afbeeldingen) {
		afbeelding = ophalenAfbeelding(produkt.afbeeldingen[0]);
	}

	const update = async (wat) => {
		if (wat == 'model') {
			await supabase.from('producten').update({ model: produkt.model }).eq('id', produkt.id);
			return;
		}
		if (wat == 'headline') {
			await supabase.from('producten').update({ headline: produkt.headline }).eq('id', produkt.id);
			return;
		}
		if (wat == 'omschrijving') {
			await supabase
				.from('producten')
				.update({ omschrijving: produkt.omschrijving })
				.eq('id', produkt.id);
			return;
		}
		

		if (wat == 'categorie') {
			await supabase
				.from('producten')
				.update({ categorie: produkt.categorie })
				.eq('id', produkt.id);

			dispatch('categorie', { text: produkt.categorie });
			return;
		}

		if (wat == 'type') {
			await supabase.from('producten').update({ type: produkt.type }).eq('id', produkt.id);

			dispatch('typ', { text: { huidig: huidigeType, nieuw: produkt.type } });
			huidigeType = produkt.type;
			return;
		}
		console.log(wat);
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


<article>
	<div class="gridcolafbeelding">
	<div>	
	{#if editable}
		<div class="gridcol">
			<h2 contenteditable="true"
				bind:innerHTML={produkt.model}
				on:keyup={() => {
					if (opslaan) clearTimeout(opslaan);
					opslaan = setTimeout(() => update('model'), 500);
				}}
			/>
			<div class='small'> (model type nummer)</div>
		</div>
	{:else}
		<h2>
			{@html produkt.model}
		</h2>
	{/if}

	{#if editable}
		<div class="gridcol">
			<h3 contenteditable="true"
				bind:innerHTML={produkt.headline}
				on:keyup={() => {
					if (opslaan) clearTimeout(opslaan);
					opslaan = setTimeout(() => update('headline'), 500);
				}}
			/>
			<div class="small">(headline)</div>
		</div>
	{:else}
		<h3>{@html produkt.headline}</h3>
	{/if}

	{#if editable}
		<div class="gridcol">
			<h3 contenteditable="true"
				bind:innerHTML={produkt.categorie}
				on:keyup={() => {
					if (opslaan) clearTimeout(opslaan);
					opslaan = setTimeout(() => update('categorie'), 500);
				}}
			/>
			<div class="small">(categorie)</div>
		</div>
		{:else}
		<h3>{@html produkt.categorie}</h3>
	{/if}

	{#if editable}
		<div class="gridcol">
			<h3	contenteditable="true"
				bind:innerHTML={produkt.type}
				on:keyup={() => {
					if (opslaan) clearTimeout(opslaan);
					opslaan = setTimeout(() => update('type'), 500);
				}}
			/>
			<div class="small">(type)</div>
			</div>
			{:else}
			<h3>{@html produkt.type}</h3>
	{/if}
			</div>
			<div>
				{#if afbeelding}
					{#await afbeelding then afbeelding}
					<img src={afbeelding} />
					{/await}
				{/if}
			</div>
		</div>	

	{#if !ingeklapt}
		{#if editable}
			<div class="gridcol border">
				<div contenteditable="true"
					bind:innerHTML={produkt.omschrijving}
					on:keyup={() => {
						if (opslaan) clearTimeout(opslaan);
						opslaan = setTimeout(() => update('omschrijving'), 500);
					}}
				/>
				<div class="small">(omschrijving)</div>
			</div>
		{:else}
			<div class="p2">
				{@html produkt.omschrijving}
			</div>
		{/if}
	{/if}

	{#if produkt.pdf}
	   {produkt.pdf}
	{/if}

	{#each produkt.prijzen as prijs}
		{prijs.prijs} - {prijs.aantal}
	{/each}

	{#if editable}
			image
		<input
			type="file"
			bind:files
			on:change={() => {
				bijwerkenAfbeelding();
				}}
			accept="image/*"
			/>
	{/if}

	{#if editable}
		  pfd
		<input
			type="file"
			bind:files
			on:change={() => {
				bijwerkenpdf();
				}}
			accept="application/pdf"
			/>
	{/if}

	</article>

	<style>
		h2,h3{
			margin:0;
			padding:0;
		}

		.gridcol{
			position: relative;
		}

		.gridcolafbeelding{
			position: relative;
			display: grid;
			grid-template-columns: 4fr 1fr;
		}

		.small{
			font-size: .8rem;
			top:-0.5rem;
			left:-3rem;
			position: absolute;
			color: var(--paars);
		}

		.border{
			border:1px solid gainsboro;
			border-radius:4px;
		}

	</style>