<script setup lang="ts">
import {onMounted} from "vue";

onMounted(async () => {
  const url = new URL(location.href);
  const client = url.searchParams.get("token");
  if (!client) location.href = "https://deeptrain.net/login?app=chatnio";
  console.log(client);
});
</script>

<template>

</template>

<style scoped>

</style>
