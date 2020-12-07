
<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    created() {
      this.$router.push('/auction')
    }
  }
</script>
