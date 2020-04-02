<template>
    <v-flex mt-5 xs12>
        <v-layout row wrap>
            <v-flex pa-2 xs12>
                <h1 v-if="row.title" class="display-1 font-weight-bold">
                    {{ row.title }}
                </h1>
                <h2 v-if="row.subtitle" class="subtitle-1">
                    {{ row.subtitle }}
                </h2>
            </v-flex>
        </v-layout>
        <v-layout grouped row wrap>
            <v-fade-transition hide-on-leave>
                <v-container v-if="loading" class="text-center">
                    <v-progress-circular color="white" indeterminate size="64">
                    </v-progress-circular>
                </v-container>
            </v-fade-transition>
            <div></div>
            <v-flex
                v-for="item in $parent[row.items]"
                v-show="$parent[row.items].length > 0"
                :key="item.ids.trakt"
                pa-1
                xs4
                sm2
                md2
                lg2
                xl1
                @mouseover="anyHovered = true"
                @mouseleave="anyHovered = false"
            >
                <v-hover v-slot:default="{ hover }">
                    <v-card
                        :elevation="hover ? 16 : null"
                        router
                        exact
                        :to="
                            `/${row.mediatype}/${item.ids.slug}-${item.ids.trakt}`
                        "
                        style="overflow: hidden;"
                        class="black"
                    >
                        <v-overlay
                            :value="!hover && anyHovered ? true : false"
                            z-index="1"
                            style="height: 100%; width: 200%; position: absolute; right: unset; bottom: unset;"
                        />
                        <v-img
                            v-if="
                                item.images &&
                                    item.images.poster &&
                                    item.images.poster.length > 0
                            "
                            :aspect-ratio="0.667870036101083032490974"
                            lazy-src="/images/posterPlaceholder.png"
                            :src="w185(item.images.poster[0])"
                            @error="
                                src = w185(
                                    item.images.poster[1]
                                        ? item.images.poster[1]
                                        : item.images.poster[0]
                                )
                            "
                        >
                        </v-img>
                        <v-img
                            v-else
                            :aspect-ratio="0.667870036101083032490974"
                            lazy-src="/images/posterPlaceholder.png"
                            src="/images/posterPlaceholder.png"
                        />
                    </v-card>
                </v-hover>
            </v-flex>
        </v-layout>
        <Error v-if="error" />
    </v-flex>
</template>

<script>
import Error from '@/layouts/error.vue'
import imageFunctions from '@/web_utils/imageFunctions.js'

export default {
    components: {
        Error
    },
    mixins: [imageFunctions],
    props: {
        row: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            anyHovered: false,
            loading: false
        }
    },
    computed: {
        error() {
            return this.$parent.error
        }
    },
    created() {
        this.loading = true
        this.loadResults()
    },
    methods: {
        loadResults() {
            this.loading = true
            this.row.loadResultsFunction(this.row.params, () => {
                this.loading = false
            })
        }
    }
}
</script>
