<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import { getAuth, type User } from 'firebase/auth';
	import { firebaseConfig } from '$lib/firebaseConfig';
	import { getContext } from 'svelte';

	let user: User = getContext('user');
	const firebaseApp = initializeApp(firebaseConfig);
	const auth = getAuth(firebaseApp);

	let obsURL: string = '';

	async function handleSignOut() {
		await auth.signOut();
		location.href = '/';
	}

	async function handleGenerateURLForOBS() {
		const token = await user.getIdToken();
		const response = await fetch(
			'https://has-3jd67qj8.an.gateway.dev/indefiniteAccessToken/issue',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);
		if (!response.ok) {
			throw new Error('Error!');
		}
		const json = await response.json();
		obsURL = `${json.endpoints.indefiniteAccessTokenExchange}?token=${json.indefiniteAccessToken}`;
	}
</script>

<main>
	{user.displayName}
	<p>
		<input type="text" value={obsURL} />
		<button on:click={handleGenerateURLForOBS}>Generate your URL for OBS</button>
	</p>
	<p>
		<button on:click={handleSignOut}>Sign out</button>
	</p>
</main>
