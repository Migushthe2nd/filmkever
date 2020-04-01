<template>
    <v-container>
        <h1 class="display-1 font-weight-bold">
            {{ $parent.title }}
            <span
                v-if="$parent.displayResultsCount && items.length > 0"
                class="subtitle-1 ms-1"
                >({{ $parent.resultAmount }} Results)</span
            >
        </h1>
        <h2 v-if="$parent.subtitle" class="subtitle-1">
            {{ $parent.subtitle }}
        </h2>

        <v-row dense>
            <v-col
                v-for="(item, i) in items"
                :key="i"
                cols="12"
                sm="6"
                md="4"
                lg="3"
            >
                <v-hover v-slot:default="{ hover }">
                    <v-card
                        :elevation="hover ? 16 : null"
                        router
                        exact
                        :to="
                            `/${$parent.mediatype}/${item.ids.slug}-${item.ids.trakt}`
                        "
                    >
                        <div
                            v-if="
                                $parent.autoLoadMoreResults &&
                                    i == Object.keys(items).length - 1 &&
                                    $parent.page !== 1 &&
                                    !$parent.limitReached
                            "
                            v-intersect.once="loadMoreResults"
                        />
                        <div
                            class="d-flex flex-no-wrap align-stretch overflow-hidden"
                        >
                            <v-avatar
                                height="150"
                                min-width="105"
                                tile
                                class="black"
                            >
                                <v-overlay
                                    v-if="$parent.displayItemRank"
                                    opacity="0"
                                    z-index="1"
                                    style="position: absolute; right: unset; bottom: unset;"
                                >
                                    <v-chip
                                        :key="'rank' + i + 1"
                                        class="pa-2 ma-1 text-capitalize"
                                        style="user-select: none;"
                                        small
                                        :color="rankColor(i)"
                                    >
                                        {{ i + 1 }}
                                    </v-chip>
                                </v-overlay>
                                <v-img
                                    v-if="
                                        item.images &&
                                            item.images.poster &&
                                            item.images.poster.length > 0
                                    "
                                    cover
                                    lazy-src="/images/posterPlaceholder.png"
                                    :src="w154(item.images.poster[0])"
                                    @error="
                                        src = w154(
                                            item.images.poster[1]
                                                ? item.images.poster[1]
                                                : item.images.poster[0]
                                        )
                                    "
                                />
                                <v-img
                                    v-else
                                    lazy-src="/images/posterPlaceholder.png"
                                    src="/images/posterPlaceholder.png"
                                />
                            </v-avatar>

                            <v-flex fluid class="d-flex flex-column">
                                <v-card-title
                                    class="title pb-0"
                                    style="
                                    word-break: normal;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    display: -webkit-box;
                                    -webkit-box-orient: vertical;
                                    -webkit-line-clamp: 2;"
                                    >{{ item.title }}</v-card-title
                                >

                                <!-- <v-card-subtitle class="pb-0 text-capitalize">
                                {{ item.genres.join(', ') }}
                            </v-card-subtitle> -->
                                <v-card-subtitle
                                    class="py-0 mt-0 text-capitalize"
                                >
                                    {{
                                        item.released ||
                                            (item.first_aired
                                                ? item.first_aired.slice(0, 10)
                                                : null) ||
                                            item.year
                                    }}
                                </v-card-subtitle>
                                <v-spacer />
                                <v-card-subtitle
                                    v-if="displayProgress(item)"
                                    class="py-0 text-capitalize"
                                >
                                    {{ progressText(item, $parent.mediatype) }}
                                </v-card-subtitle>
                                <v-card-subtitle
                                    v-if="displayProgress(item)"
                                    class="pt-0"
                                >
                                    <v-progress-linear
                                        rounded
                                        :value="
                                            progressValue(
                                                item,
                                                $parent.mediatype
                                            )
                                        "
                                    ></v-progress-linear>
                                </v-card-subtitle>
                                <!-- <v-progress-linear value="15"></v-progress-linear> -->
                            </v-flex>
                        </div>
                    </v-card>
                </v-hover>
            </v-col>

            <v-container class="text-center">
                <v-fade-transition v-if="loading">
                    <v-progress-circular
                        v-model="loading"
                        color="white"
                        indeterminate
                        size="64"
                    >
                    </v-progress-circular>
                </v-fade-transition>

                <v-fade-transition>
                    <h3 v-if="empty && items.length === 0" pt-5>
                        It's empty here
                        <v-icon large>
                            mdi-bookshelf
                        </v-icon>
                    </h3>
                </v-fade-transition>
            </v-container>
        </v-row>
        <Error v-if="error" />
    </v-container>
</template>

<script>
import Error from '@/layouts/error.vue'
import imageFunctions from '@/web_utils/imageFunctions.js'
import progressFunctions from '@/web_utils/progressFunctions.js'

export default {
    components: {
        Error
    },
    mixins: [imageFunctions, progressFunctions],
    props: {
        items: {
            type: Array,
            default: null
        },
        loadResults: {
            type: Function,
            default: null
        }
    },
    data() {
        return {
            loading: true,
            empty: false
        }
    },
    computed: {
        error() {
            return this.$parent.error
        }
    },
    created() {
        if (!this.$parent.limitReached) this.loading = true
        this.loadResults(null, () => {
            if (this.$parent.limitReached) {
                this.loading = false
                setTimeout(() => {
                    this.empty = true
                }, 500)
            }
        })
    },
    methods: {
        loadMoreResults(entries, observer, isIntersecting) {
            if (isIntersecting) {
                this.loadResults(this.$parent.params, () => {
                    if (this.$parent.limitReached) this.loading = false
                })
            }
        },
        rankColor(i) {
            switch (i) {
                case 0:
                    return '#DAA520'
                case 1:
                    return '#C0C0C0'
                case 2:
                    return '#CD7F32'
                default:
                    return null
            }
        }
    }
}
</script>

<style lang="scss">
.headline {
    word-break: normal;
}
</style>
