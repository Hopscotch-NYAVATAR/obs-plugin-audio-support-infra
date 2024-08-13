<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import { getAuth } from 'firebase/auth';

	import { firebaseConfig } from '$lib/firebaseConfig';
	import SignInRequired from '$lib/SignInRequired.svelte';
	import { setContext } from 'svelte';
	import SignInLoading from '$lib/SignInLoading.svelte';

	const firebaseApp = initializeApp(firebaseConfig);
	const auth = getAuth(firebaseApp);

	const userPromise = new Promise((resolve, reject) => {
		auth.onAuthStateChanged((user) => {
			if (user) {
				resolve(user);
			} else {
				reject(new Error('Not signed in!'));
			}
		});
	});
</script>

<main>
	{#await userPromise}
		<SignInLoading />
	{:then user}
		{(setContext('user', user), '')}
		<slot />
	{:catch}
		<SignInRequired />
	{/await}
</main>
