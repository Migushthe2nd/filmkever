<template>
    <Summary />
</template>

<script>
import Summary from '@/layouts/pages/summary.vue'

export default {
    components: {
        Summary
    },
    data() {
        return {
            mediatype: 'movie'
        }
    }
}
</script>
