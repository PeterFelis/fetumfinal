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
		await supabase.storage.from('produkten').remove([produkt.id.toString()]);
		await supabase.storage.from('produkten').upload(produkt.id.toString(), files[0]);
		let {data,error} = await supabase.from('producten')
		.update({afbeeldingen: [produkt.id.toString()] })
		.eq('id', produkt.id);
		if (!error) console.log('bijwerkenAfbeelding-> bijwerken afbeelding in database gelukt');			
		afbeelding = URL.createObjectURL(files[0]);
	}
	
	const wisafbeelding = async () =>{
		await supabase.storage.from('produkten').remove([produkt.id.toString()]);
		let res = await supabase.from('producten')
				.update({afbeeldingen:null})
				.eq('id', produkt.id);
		if (!res.error) console.log('afbeelding verwijderd en uit database gehaald');			
		afbeelding = null;
	}

	const bijwerkenpdf = async () =>{
		await supabase.storage.from('pdfs').remove([produkt.id.toString()]);
		await supabase.storage.from('pdfs').upload(produkt.id.toString(), files[0]);
		let {publicURL} =await supabase.storage.from('pdfs').getPublicUrl(produkt.id.toString());
		let res = await supabase.from('producten')
				.update({PDF:publicURL})
				.eq('id', produkt.id);
		if (!res.error) console.log('bijwerken pdf in database gelukt');			
		produkt.PDF = publicURL;
	}

	const wispdf = async () =>{
		await supabase.storage.from('pdfs').remove([produkt.id.toString()]);
		let res = await supabase.from('producten')
				.update({PDF:null})
				.eq('id', produkt.id);
		if (!res.error) console.log('PDF verwijderd en uit database gehaald');			
		produkt.PDF = null;
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
	
	{#each produkt.prijzen as prijs}
		{prijs.prijs} - {prijs.aantal}
	{/each}		

	{#if produkt.PDF}
		<div>
	   		<a href ="{produkt.PDF}" target="_blank">Download PDF voor meer info</a> 
		</div>		
	{/if}

	<div class='grid'>
		{#if editable}	
			{#if produkt.PDF}
				<button on:click="{()=>wispdf()}">pdf verwijderen</button>
			{/if}
	
			{#if produkt.afbeeldingen}
				<button on:click="{()=>wisafbeelding()}">afbeelding verwijderen</button>
			{/if}
		<div> image
			<input
				type="file"
				bind:files
				on:change={() => {
					bijwerkenAfbeelding();
					}}
				accept="image/*"
				/>
		</div>
		<div> pfd
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