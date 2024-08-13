<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import { getAuth, type User } from 'firebase/auth';
	import { firebaseConfig } from '$lib/firebaseConfig';
	import { getContext } from 'svelte';

	let user: User = getContext('user');
	const firebaseApp = initializeApp(firebaseConfig);
	const auth = getAuth(firebaseApp);

	async function handleSignOut() {
		await auth.signOut();
		location.href = '/';
	}
</script>

<main>
	{user.displayName}
	<p>
		<button on:click={handleSignOut}>Sign out</button>
	</p>
</main>
