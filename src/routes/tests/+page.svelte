<script>
    let title = 'Welcome'
    $: visitorName = '';
</script>

<h1>{`${title} ${visitorName}`}</h1>
<input bind:value={visitorName} type=text />
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<style>
    h1 {
        color: blue;
    }
    p {
        font-size: 18px;
    }
    * {
        font-family: sans-serif;
    }
    a {
        color: red;
    }
    a:hover {
        color: greenyellow;
    }
</style>