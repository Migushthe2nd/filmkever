<template>
    <v-container>
        <v-layout column justify-center pa-3>
            <LogoFull
                class="intro-title logo d-block ml-1 mr-1"
                height="60"
                width="auto"
                fill
            />
            <div v-for="row in rows" :key="row.title">
                <rowList :row="row" />
            </div>
        </v-layout>
    </v-container>
</template>

<script>
import LogoFull from '@/assets/images/logo_full.svg'
import rowList from '@/components/rowList.vue'
import loadResults from '@/web_utils/loadResults.js'

export default {
    components: {
        LogoFull,
        rowList
    },
    mixins: [loadResults],
    data() {
        return {
            APP_TITLE: process.env.APP_TITLE,
            rows: [
                {
                    title: 'Most played movies',
                    subtitle: 'This month',
                    mediatype: 'movie',
                    params: {
                        period: 'monthly'
                    },
                    autoLoadMoreResults: false,
                    loadResultsFunction: this.loadPlayedMovies,
                    items: 'playedMoviesItems',
                    loading: true
                },
                {
                    title: 'Most played shows',
                    subtitle: 'This month',
                    mediatype: 'show',
                    params: {
                        period: 'monthly'
                    },
                    autoLoadMoreResults: false,
                    loadResultsFunction: this.loadPlayedShows,
                    items: 'playedShowsItems',
                    loading: true
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';

.intro-title {
    animation: puff-in-center 0.5s cubic-bezier(0.47, 0, 0.745, 0.715) both;
    animation-delay: 1s;
}

@keyframes puff-in-center {
    0% {
        transform: scale(2);
        filter: blur(4px);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        filter: blur(0px);
        opacity: 1;
    }
}
</style>
