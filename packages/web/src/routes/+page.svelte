<script type="ts">
  import firebase from "firebase/compat/app";
  import "firebaseui/dist/firebaseui.css"
  import { onMount } from "svelte";

  import { firebaseConfig } from "$lib/firebaseConfig";

  firebase.initializeApp(firebaseConfig);

  onMount(async () => {
    const firebaseui = await import("firebaseui");
    const ui = new firebaseui.auth.AuthUI(firebase.auth());

    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    });
  });
</script>

<main>
  <div id="firebaseui-auth-container"></div>
</main>
