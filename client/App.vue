<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    const token = uni.getStorageSync('token')
    if (token) {
      this.$store.commit('user/SET_TOKEN', token)
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  padding: 20rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background-color: #4CAF50;
  color: #ffffff;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  font-size: 28rpx;
}

.btn-primary:active {
  background-color: #43A047;
}

.text-primary {
  color: #4CAF50;
}

.text-secondary {
  color: #666666;
}

.text-muted {
  color: #999999;
}

.text-danger {
  color: #f44336;
}

.text-success {
  color: #4CAF50;
}

.text-warning {
  color: #ff9800;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.ml-10 {
  margin-left: 10rpx;
}

.ml-20 {
  margin-left: 20rpx;
}

.mr-10 {
  margin-right: 10rpx;
}

.mr-20 {
  margin-right: 20rpx;
}

.mt-10 {
  margin-top: 10rpx;
}

.mt-20 {
  margin-top: 20rpx;
}

.mb-10 {
  margin-bottom: 10rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.p-20 {
  padding: 20rpx;
}

.p-30 {
  padding: 30rpx;
}

.bg-white {
  background-color: #ffffff;
}

.rounded {
  border-radius: 8rpx;
}

.rounded-lg {
  border-radius: 16rpx;
}

.shadow {
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-right: 10rpx;
}

.tag-primary {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.tag-warning {
  background-color: #FFF3E0;
  color: #FF9800;
}

.tag-danger {
  background-color: #FFEBEE;
  color: #F44336;
}

.divider {
  height: 1rpx;
  background-color: #eeeeee;
  margin: 20rpx 0;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-state image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-state text {
  color: #999999;
  font-size: 28rpx;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999999;
}
</style>
