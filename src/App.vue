<template>
    <router-view></router-view>
</template>
<script>
import { useAuthStore } from '@/stores/auth'
export default {
    name: 'app',
    async mounted() {
        // Initialize auth when app loads
        const authStore = useAuthStore()
        if (!authStore.initialized) {
            await authStore.initializeAuth()
        }
    }
}
</script>
