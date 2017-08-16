<template>
    <div class="fullpage__page">
        <slot></slot>
    </div>
</template>

<script>
    export default {}
</script>

<style scoped>
    .fullpage__page {
        position: relative;
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        overflow: hidden;
    }
</style>