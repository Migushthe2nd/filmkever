<template>
    <v-container fluid text-center>
        <v-row>
            <v-col cols="12">
                <v-col>
                    <h1 class="display-2 primary--text">Whoops!</h1>

                    <h3 class="ma-3">An error occurred</h3>
                    <p class="ma-3 font-italic">{{ title }}</p>

                    <v-btn color="primary" @click.stop="$router.go(-1)">
                        Go back
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    layout: 'empty',
    props: {
        error: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            title: null
        }
    },
    head() {
        this.title = this.$parent.error
            ? this.$parent.error
            : 'An error occurred'
        return {
            title: this.title
        }
    }
}
</script>

<style scoped>
/* h1 {
    font-size: 20px;
} */
</style>
