<template>
    <transition name="fade">
      <div v-if="show" class="notification" :class="type">
        <div class="notification-content">
          <span class="notification-message">{{ message }}</span>
          <button @click="dismiss" class="notification-close">×</button>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: "NotificationToast",
    data() {
      return {
        show: false,
        message: '',
        type: 'success', // success, error, warning, info
        timeout: null
      }
    },
    methods: {
      showNotification(message, type = 'success', duration = 3000) {
        this.message = message
        this.type = type
        this.show = true
        
        // Clear existing timeout if any
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        
        this.timeout = setTimeout(() => {
          this.dismiss()
        }, duration)
      },
      dismiss() {
        this.show = false
        if (this.timeout) {
          clearTimeout(this.timeout)
          this.timeout = null
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 250px;
    max-width: 350px;
    padding: 15px;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
  }
  
  .notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .notification-message {
    flex: 1;
    padding-right: 10px;
  }
  
  .notification-close {
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0 5px;
    line-height: 1;
  }
  
  .notification.success { background-color: #42b983; }
  .notification.error { background-color: #ff4d4d; }
  .notification.warning { background-color: #ffc107; color: #333; }
  .notification.info { background-color: #17a2b8; }
  
  /* Transition effects */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s, transform 0.5s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
  </style>