<script lang="ts">
	import firebase from 'firebase/compat/app';
	import 'firebaseui/dist/firebaseui.css';
	import { onMount } from 'svelte';

	import { firebaseConfig } from '$lib/firebaseConfig';

	firebase.initializeApp(firebaseConfig);

	onMount(async () => {
		const firebaseui = await import('firebaseui');
		const {
			auth: { AuthUI }
		} = firebaseui;

		const authUI = AuthUI.getInstance() ?? new AuthUI(firebase.auth());

		authUI.start('#firebaseui-auth-container', {
			signInFlow: 'popup',
			signInSuccessUrl: '/',
			signInOptions: [
				{
					provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					customParameters: {
						prompt: 'select_account'
					}
				}
			]
		});
	});
</script>

<main>
	<div id="firebaseui-auth-container"></div>
	<a href="/"><h1>Back to top</h1></a>
</main>
