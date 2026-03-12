<template>
  <view class="uni-popup">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'uni-popup',
  props: {
    type: {
      type: String,
      default: 'center'
    }
  },
  methods: {
    open() {
      this.$emit('open')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.uni-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
</style>
