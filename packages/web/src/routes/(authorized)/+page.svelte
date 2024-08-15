<script lang="ts">
	import { getAuth, type User } from 'firebase/auth';
	import { getContext } from 'svelte';
	import { initializeApp } from 'firebase/app';

	import { firebaseConfig } from '$lib/firebaseConfig';
	import { PUBLIC_ISSUE_INDEFINITE_ACCESS_TOKEN_ENDPOINT } from '$env/static/public';

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
		const response = await fetch(PUBLIC_ISSUE_INDEFINITE_ACCESS_TOKEN_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		if (!response.ok) {
			throw new Error('Error!');
		}
		const json = await response.json();
		obsURL = `${json.exchangeIndefiniteAccessTokenEndpoint}?key=${firebaseConfig.apiKey}#${json.indefiniteAccessToken}`;
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
