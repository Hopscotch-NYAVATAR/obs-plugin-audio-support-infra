<script lang="ts">
  import firebase from "firebase/compat/app";
  import "firebaseui/dist/firebaseui.css"
  import { onMount } from "svelte";

  import { firebaseConfig } from "$lib/firebaseConfig";
	import type firebaseui from "firebaseui";

  firebase.initializeApp(firebaseConfig);

  onMount(async () => {
    const firebaseui = await import("firebaseui");
    const { auth: { AuthUI } } = firebaseui;

    const authUI = AuthUI.getInstance() ?? new AuthUI(firebase.auth());

    authUI.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    });
  });
</script>

<main>
  <div id="firebaseui-auth-container"></div>
  <a href="/"><h1>Back to top</h1></a>
</main>
