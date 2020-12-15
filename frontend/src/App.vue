
<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    created() {
      if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) { //移动端
        this.$router.push('/auction-phone')
      } else {
        this.$router.push('/auction')
      }
    }
  }
</script>
