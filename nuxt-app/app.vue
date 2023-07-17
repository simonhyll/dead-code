<template>
  <div>
    <NuxtLayout></NuxtLayout>
  </div>
</template>
<script setup>
if (useTauri) {
  console.log('Hello')
  console.info('Hello')
  console.warn('Hello')
}
</script>   