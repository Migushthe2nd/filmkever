<template>
    <div>
        <v-bottom-sheet
            v-model="$parent.displaySourceFinder"
            inset
            max-width="584"
        >
            <v-sheet>
                <v-card-actions>
                    <v-flex
                        v-if="$vuetify.breakpoint.smAndUp"
                        class="d-flex text-center"
                    >
                        <v-col class="pa-0">
                            <v-btn
                                class="d-flex justify-start"
                                color="primary"
                                :disabled="$parent.sourceFinderStep === 0"
                                @click="$parent.sourceFinderStep--"
                                >back</v-btn
                            >
                        </v-col>
                        <v-col class="pa-0 align-self-center">
                            <h1 class="title">
                                {{ currentTitle() }}
                            </h1>
                        </v-col>
                        <v-col class="pa-0" />
                    </v-flex>

                    <v-flex
                        v-if="$vuetify.breakpoint.xsOnly"
                        class="d-flex text-center"
                    >
                        <v-btn
                            class="d-flex justify-start"
                            color="primary"
                            :disabled="$parent.sourceFinderStep === 0"
                            @click="$parent.sourceFinderStep--"
                            >back</v-btn
                        >
                        <v-spacer />
                        <h1 class="align-self-center title">
                            {{ currentTitle() }}
                        </h1>
                        <v-spacer />
                    </v-flex>
                </v-card-actions>
                <v-divider></v-divider>
                <v-window
                    v-model="$parent.sourceFinderStep"
                    touchless
                    class="text-center"
                    :vertical="false"
                >
                    <v-fade-transition>
                        <v-overlay v-model="loading" absolute>
                            <v-flex>
                                <v-progress-circular
                                    color="primary"
                                    indeterminate
                                    size="64"
                                >
                                </v-progress-circular>
                                <h3 class="pt-3" color="primary">
                                    {{
                                        videoUrls.length > 0
                                            ? videoUrls.length + ' results'
                                            : ''
                                    }}
                                </h3>
                                <v-btn
                                    v-if="videoUrls.length === 0"
                                    class="mt-2"
                                    @click="
                                        loading = false
                                        querySubscription.unsubscribe()
                                    "
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    v-if="videoUrls.length > 0"
                                    class="mt-2"
                                    color="primary"
                                    @click="
                                        loading = false
                                        querySubscription.unsubscribe()
                                        makeIframePlayer()
                                    "
                                >
                                    Play
                                    <v-icon>
                                        mdi-play-circle-outline
                                    </v-icon>
                                </v-btn>
                            </v-flex>
                        </v-overlay>
                    </v-fade-transition>
                    <v-window-item :value="0">
                        <v-list>
                            <v-list-item
                                v-for="source in sources"
                                v-show="source[$parent.mediatype]"
                                :key="source.name"
                                @click="
                                    loading = true
                                    selectedSource = source
                                    selectedSource !== source
                                        ? resetPlayerData()
                                        : null
                                    selectedSource.searchFunction()
                                "
                            >
                                <v-list-item-title
                                    >{{ source.name }}
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon
                                                v-if="source.native"
                                                small
                                                color="grey lighten-1"
                                                v-on="on"
                                            >
                                                mdi-check-decagram
                                            </v-icon>
                                        </template>
                                        <span
                                            >Native support! (syncs time and
                                            stuff)</span
                                        >
                                    </v-tooltip>
                                    <v-list-item-subtitle v-if="source.message">
                                        {{ source.message }}
                                    </v-list-item-subtitle>
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-tooltip
                                        v-for="property in source.properties"
                                        :key="property.name"
                                        top
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-icon
                                                color="grey lighten-1"
                                                v-on="on"
                                                >{{
                                                    property.prependIcon
                                                }}</v-icon
                                            >
                                        </template>
                                        <span>{{ property.description }}</span>
                                    </v-tooltip>
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-window-item>
                    <v-window-item
                        :value="1"
                        :style="
                            'overflow-y: auto; max-height: calc(95vh - 108px);'
                        "
                    >
                        <template v-for="(item, index) in searchResponse">
                            <v-hover
                                v-slot:default="{ hover }"
                                :key="item.title"
                            >
                                <v-card
                                    :elevation="hover ? 16 : null"
                                    class="ma-2"
                                    @click="
                                        loading = true
                                        selectedSource.qualityFunction(index)
                                    "
                                >
                                    <div
                                        class="d-flex flex-no-wrap align-stretch overflow-hidden"
                                    >
                                        <v-avatar
                                            height="100"
                                            min-width="70"
                                            tile
                                            class="black"
                                        >
                                            <v-img
                                                v-if="item.poster"
                                                cover
                                                lazy-src="/images/posterPlaceholder.png"
                                                :src="item.poster"
                                            />
                                        </v-avatar>
                                        <v-flex
                                            fluid
                                            class="d-flex flex-column"
                                        >
                                            <v-card-title
                                                class="title pb-0"
                                                style="word-break: normal;
                                                    overflow: hidden;
                                                    text-overflow: ellipsis;
                                                    display: -webkit-box;
                                                    -webkit-box-orient: vertical;
                                                    -webkit-line-clamp: 2;"
                                                >{{ item.title }}</v-card-title
                                            >

                                            <v-card-subtitle
                                                v-if="item.year"
                                                class="py-0 mt-0 text-capitalize"
                                            >
                                                {{ item.year }}
                                            </v-card-subtitle>
                                        </v-flex>
                                    </div>
                                </v-card>
                            </v-hover>
                        </template>
                    </v-window-item>
                    <v-window-item :value="1.5">
                        <v-list>
                            <v-list-item
                                v-for="(quality, index) in qualityResponse"
                                :key="
                                    quality.quality +
                                        quality.size +
                                        quality.group || null
                                "
                                @click="
                                    loading = true
                                    selectedSource.itemsFunction(index)
                                "
                            >
                                <v-list-item-title>
                                    {{ quality.quality }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ quality.size }}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle v-if="quality.group">
                                    {{ quality.group }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-window-item>
                    <v-window-item
                        :value="2"
                        :style="
                            'overflow-y: auto; max-height: calc(' +
                                ($parent.windowHeight - 108) +
                                'px;'
                        "
                    >
                        <div class="ma-1">
                            <template v-for="(item, index) in itemsResponse">
                                <v-btn
                                    :key="item.name"
                                    class="ma-1"
                                    @click="
                                        loading = true
                                        findTraktID(item.name)
                                        selectedSource.playlistFunction(index)
                                    "
                                >
                                    {{ item.name }}
                                </v-btn>
                            </template>
                        </div>
                    </v-window-item>
                </v-window>
            </v-sheet>
        </v-bottom-sheet>
        <v-snackbar
            v-model="sourceSnackbar"
            bottom
            :timeout="3000"
            :color="sourceSnackbarColor"
        >
            {{ sourceSnackbarText }}
            <v-btn text @click="sourceSnackbar = false">
                Close
            </v-btn>
        </v-snackbar>
        <v-dialog
            v-model="displayPlayerIframe"
            max-width="1000"
            class="ma-2"
            width="130vh"
        >
            <v-card>
                <v-toolbar dense>
                    <v-toolbar-title>{{
                        (selectedSource ? selectedSource.name : null) +
                            ' - ' +
                            $parent.summary.title
                    }}</v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-btn
                        icon
                        @click="
                            displayPlayerIframe = false
                            playerIframeSource = null
                        "
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-responsive
                    :aspect-ratio="useUserInput ? null : 1.777777777"
                    :height="useUserInput ? '60vh' : 'inherit'"
                >
                    <iframe
                        v-if="displayPlayerIframe"
                        ref="playerIframe"
                        style="outline: none !important;"
                        :src="playerIframeSource"
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                        frameborder="0"
                        width="100%"
                        height="100%"
                        allowfullscreen="allowfullscreen"
                        @load="iframeIsLoading = false"
                    />
                    <v-fade-transition>
                        <v-overlay v-if="iframeIsLoading" absolute>
                            <v-progress-circular
                                color="primary"
                                indeterminate
                                size="64"
                            ></v-progress-circular>
                        </v-overlay>
                    </v-fade-transition>
                </v-responsive>
                <v-flex
                    v-if="useUserInput"
                    flat
                    :elevation="0"
                    class="px-4 d-flex flex-wrap align-center"
                >
                    <v-toolbar-title class="pt-2">
                        Paste the link:
                    </v-toolbar-title>

                    <v-form
                        class="d-flex flex-wrap"
                        style="width: 100%"
                        @submit.prevent="
                            useUserInput = false
                            makeIframePlayer(userInputDLLink)
                        "
                    >
                        <v-text-field
                            v-model="userInputDLLink"
                            required
                            prepend-inner-icon="mdi-content-paste"
                            hide-details
                            label="Download Link"
                            solo-inverted
                            clearable
                            class="pe-4 my-1"
                        />

                        <v-btn
                            color="primary"
                            class="ma-auto"
                            @click="
                                useUserInput = false
                                makeIframePlayer(userInputDLLink)
                            "
                        >
                            Submit
                        </v-btn>
                    </v-form>
                </v-flex>
                <v-flex v-if="useUserInput" dense>
                    <v-card-subtitle
                        v-if="playerIframeSource"
                        class="pb-2 mt-0"
                    >
                        <v-btn
                            text
                            class="pa-1"
                            color="primary"
                            :href="playerIframeSource"
                            target="_blank"
                            @click="captchaHREFOpen = true"
                        >
                            Try manually
                        </v-btn>
                        if the page refuses to load
                    </v-card-subtitle>
                </v-flex>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import communicateApp from '@/web_utils/communicateApp.js'
import FilePursuit from '@/web_utils/sources/FilePursuit.js'
import MovieFiles from '@/web_utils/sources/MovieFiles.js'
import Bia2HD from '@/web_utils/sources/Bia2HD.js'
import GdrivePlayer from '@/web_utils/sources/GdrivePlayer.js'

export default {
    mixins: [FilePursuit, MovieFiles, Bia2HD, GdrivePlayer, communicateApp],
    data() {
        return {
            selectedSource: null,
            searchResponse: [],
            qualityResponse: [],
            itemsResponse: [],
            videoUrls: [],
            playlistResponse: null,
            displayPlayerIframe: false,
            iframeIsLoading: true,
            playerIframeSource: null,
            captchaHREFOpen: false,
            captchaHREF: null,
            useUserInput: false,
            userInputDLLink: null,
            windowIsFocussed: true,
            querySubscription: null,
            loading: false,
            sources: [
                {
                    name: 'MovieFiles',
                    message: `You can't seek in the stream!`,
                    native: true,
                    movie: true,
                    show: false,
                    searchFunction: this.searchMovieFiles,
                    qualityFunction: this.itemsMovieFiles,
                    itemsFunction: this.itemsMovieFiles,
                    playlistFunction: this.playlistMovieFiles,
                    hideElements: ['progress', 'rewind', 'fast-forward'],
                    icon: null,
                    properties: [
                        {
                            type: 'resolution',
                            prependIcon: 'mdi-quality-high',
                            description: '1080p+',
                            score: 'good'
                        },
                        {
                            type: 'speed',
                            prependIcon: 'mdi-speedometer',
                            description: 'Never buffers!',
                            score: 'good'
                        },
                        {
                            type: 'bitrate',
                            prependIcon: 'mdi-file-certificate',
                            description: 'Bitrate is very high!',
                            score: 'good'
                        }
                    ]
                },
                {
                    name: 'FilePursuit (A lot!)',
                    message: 'Source is undergoing issues',
                    native: true,
                    movie: true,
                    show: true,
                    searchFunction: this.searchFilePursuit,
                    icon: null,
                    properties: [
                        {
                            type: 'resolution',
                            prependIcon: 'mdi-quality-medium',
                            description: '720p+',
                            score: 'good'
                        },
                        {
                            type: 'speed',
                            prependIcon: 'mdi-speedometer-medium',
                            description: 'Sometimes buffers',
                            score: 'good'
                        },
                        {
                            type: 'bitrate',
                            prependIcon: 'mdi-file',
                            description: 'Bitrate is okay-ish',
                            score: 'fine'
                        }
                    ]
                },
                {
                    name: 'Bia2HD',
                    message: 'Audio Persian by default',
                    native: true,
                    movie: true,
                    show: true,
                    searchFunction: this.searchBia2HD,
                    qualityFunction: this.qualityBia2HD,
                    itemsFunction: this.itemsBia2HD,
                    playlistFunction: this.playlistBia2HD,
                    hideElements: [],
                    icon: null,
                    properties: [
                        {
                            type: 'resolution',
                            prependIcon: 'mdi-quality-high',
                            description: '1080p+, 3D',
                            score: 'good'
                        },
                        {
                            type: 'speed',
                            prependIcon: 'mdi-speedometer-medium',
                            description: 'Sometimes buffers',
                            score: 'good'
                        },
                        {
                            type: 'bitrate',
                            prependIcon: 'mdi-file-certificate',
                            description: 'Bitrate is great!',
                            score: 'good'
                        }
                    ]
                },
                {
                    name: 'Source 1',
                    native: false,
                    movie: true,
                    show: true,
                    searchFunction: this.searchGdrivePlayer,
                    qualityFunction: this.itemsGdrivePlayer,
                    itemsFunction: this.itemsGdrivePlayer,
                    playlistFunction: this.playlistGdrivePlayer,
                    hideElements: [],
                    icon: null,
                    properties: [
                        {
                            type: 'resolution',
                            prependIcon: 'mdi-quality-medium',
                            description: 'Mostly 720p',
                            score: 'medium'
                        },
                        {
                            type: 'speed',
                            prependIcon: 'mdi-speedometer-medium',
                            description: 'Sometimes buffers',
                            score: 'medium'
                        },
                        {
                            type: 'bitrate',
                            prependIcon: 'mdi-file',
                            description: 'Bitrate is fine',
                            score: 'medium'
                        }
                    ]
                }
                // {
                //     name: 'Fmovies',
                //     searchFunction: this.searchFmovies,
                //     itemsFunction: this.itemsFmovies,
                //     playlistFunction: this.playlistFmovies,
                //     icon: null,
                //     properties: [
                //         {
                //             type: 'resolution',
                //             prependIcon: 'mdi-quality-high',
                //             description: 'Mostly 720p, but popular are 1080p!',
                //             score: 'good'
                //         },
                //         {
                //             type: 'speed',
                //             prependIcon: 'mdi-speedometer',
                //             description: 'Almost never buffers!',
                //             score: 'good'
                //         },
                //         {
                //             type: 'bitrate',
                //             prependIcon: 'mdi-file',
                //             description: 'Bitrate is fine',
                //             score: 'medium'
                //         },
                //         {
                //             type: 'subtitles',
                //             prependIcon: 'mdi-subtitles',
                //             description:
                //                 'Almost everything has English subtitles!',
                //             score: 'good'
                //         }
                //     ]
                // }
                // {
                //     name: 'Vumoo',
                //     searchFunction: this.searchVumoo,
                //     icon: null,
                //     properties: [
                //         {
                //             type: 'resolution',
                //             prependIcon: 'mdi-quality-medium',
                //             description: 'Mostly 720p',
                //             score: 'medium'
                //         },
                //         {
                //             type: 'speed',
                //             prependIcon: 'mdi-speedometer',
                //             description: 'Almost never buffers!',
                //             score: 'good'
                //         },
                //         {
                //             type: 'bitrate',
                //             prependIcon: 'mdi-file-certificate',
                //             description: 'Bitrate is excellent!',
                //             score: 'good'
                //         },
                //         {
                //             type: 'cast',
                //             prependIcon: 'mdi-cast',
                //             description: 'Supports casting!',
                //             score: 'good'
                //         }
                //     ]
                // },
                // {
                //     name: 'Soap2Day',
                //     searchFunction: this.searchSoap2Day,
                //     itemsFunction: this.itemsSoap2Day,
                //     playlistFunction: this.playlistSoap2Day,
                //     icon: null,
                //     properties: [
                //         {
                //             type: 'resolution',
                //             prependIcon: 'mdi-quality-medium',
                //             description: 'Mostly 720p',
                //             score: 'medium'
                //         },
                //         {
                //             type: 'speed',
                //             prependIcon: 'mdi-speedometer-medium',
                //             description: 'Sometimes buffers',
                //             score: 'medium'
                //         },
                //         {
                //             type: 'bitrate',
                //             prependIcon: 'mdi-file',
                //             description: 'Bitrate is fine',
                //             score: 'medium'
                //         },
                //         {
                //             type: 'cast',
                //             prependIcon: 'mdi-cast',
                //             description: 'Supports casting!',
                //             score: 'good'
                //         }
                //     ]
                // }
            ],
            sourceSnackbar: false,
            sourceSnackbarColor: null,
            sourceSnackbarText: null,
            playerConfig: null,
            sourceConfig: null,
            hidden: null,
            visibilityChange: null,
            lastPosition: null
        }
    },
    computed: {
        currentTitle() {
            return () => {
                switch (this.$parent.sourceFinderStep) {
                    case 0:
                        return 'Select a provider'
                    case 1:
                        return 'Select a result'
                    case 1.5:
                        return 'Select a quality'
                    case 2:
                        return 'Select an item'
                }
            }
        }
    },
    watch: {
        windowIsFocussed(newValue, oldValue) {
            if (this.captchaHREFOpen && newValue === true) {
                this.captchaHREFOpen = false
                this.iframeIsLoading = true
                this.$refs.playerIframe.src = this.playerIframeSource
            }
        }
    },
    mounted() {
        if (typeof document.hidden !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            this.hidden = 'hidden'
            this.visibilityChange = 'visibilitychange'
        } else if (typeof document.msHidden !== 'undefined') {
            this.hidden = 'msHidden'
            this.visibilityChange = 'msvisibilitychange'
        } else if (typeof document.webkitHidden !== 'undefined') {
            this.hidden = 'webkitHidden'
            this.visibilityChange = 'webkitvisibilitychange'
        }

        document.addEventListener(
            this.visibilityChange,
            this.handleVisibilityChange,
            false
        )
    },
    beforeDestroy() {
        let visibilityChange = null
        if (typeof document.hidden !== 'undefined') {
            // Opera 12.10 and Firefox 18 and later support
            visibilityChange = 'visibilitychange'
        } else if (typeof document.msHidden !== 'undefined') {
            visibilityChange = 'msvisibilitychange'
        } else if (typeof document.webkitHidden !== 'undefined') {
            visibilityChange = 'webkitvisibilitychange'
        }

        document.removeEventListener(
            visibilityChange,
            this.handleVisibilityChange
        )
    },
    methods: {
        handleVisibilityChange() {
            if (document[this.hidden]) {
                this.windowIsFocussed = false
            } else {
                this.windowIsFocussed = true
            }
        },
        disablePlyrControl(disableItems) {
            for (let i = 0; i < disableItems.length; i++) {
                this.playerConfig.controls = this.playerConfig.controls.filter(
                    (e) => e !== disableItems[i]
                )
            }
        },
        resetPlayerData() {
            this.displayPlayerIframe = false
            this.iframeIsLoading = true
            this.playerIframeSource = null
            this.captchaHREF = null
            this.useUserInput = false
            this.userInputDLLink = null
            this.playerConfig = null
            this.sourceConfig = null
            this.lastPosition = null
        },
        findTraktID(episodeNr) {
            if (this.$parent.mediatype === 'movie') {
                this.$parent.currPlayingTraktID = this.$parent.summary.ids.trakt
            } else if (this.$parent.mediatype === 'show') {
                if (episodeNr) {
                    for (let i = 0; i < this.$parent.seasons.length; i++) {
                        if (
                            this.$parent.seasons[i].number ===
                            this.$parent.sourceFinderSeason
                        ) {
                            for (
                                let j = 0;
                                j < this.$parent.seasons[i].episodes.length;
                                j++
                            ) {
                                if (
                                    this.$parent.seasons[i].episodes[j]
                                        .number === parseInt(episodeNr)
                                ) {
                                    this.$parent.currPlayingTraktID = this.$parent.seasons[
                                        i
                                    ].episodes[j].ids.trakt
                                }
                            }
                        }
                    }
                } else {
                    // Is this even executed?
                    for (let i = 0; i < this.$parent.seasons.length; i++) {
                        if (
                            this.$parent.seasons[i].number ===
                            this.$parent.sourceFinderSeason
                        ) {
                            for (
                                let j = 0;
                                j < this.$parent.seasons[i].episodes.length;
                                j++
                            ) {
                                if (
                                    this.$parent.seasons[i].episodes[j]
                                        .number ===
                                    this.$parent.sourceFinderEpisode
                                ) {
                                    this.$parent.currPlayingTraktID = this.$parent.seasons[
                                        i
                                    ].episodes[j].ids.trakt
                                }
                            }
                        }
                    }
                }
            }
        },
        makeIframePlayer(videoUrl, hideElements) {
            this.resetPlayerData()

            // Plyr player
            // this.playerConfig = {
            //     controls: [
            //         'play-large',
            //         'play',
            //         'rewind',
            //         'fast-forward',
            //         'progress',
            //         'current-time',
            //         'mute',
            //         'volume',
            //         'captions',
            //         'settings',
            //         'pip',
            //         'airplay',
            //         'download',
            //         'fullscreen'
            //     ],
            //     captions: {
            //         active: true
            //     },
            //     autoplay: true,
            //     volume: 0.3
            // }

            // this.sourceConfig = {
            //     type: 'video',
            //     title: this.$parent.summary.title,
            //     sources: [
            //         {
            //             src: videoUrl
            //         }
            //     ]
            // }

            // this.disablePlyrControl(this.selectedSource.hideElements)

            // const playerHTML =
            //     '%3C%21DOCTYPE%20html%3E%0A%3Chtml%3E%0A%0A%3Chead%3E%0A%20%20%20%20%3Cscript%20src%3D%22https%3A%2F%2Fcontent.jwplatform.com%2Flibraries%2FQpLbHLbV.js%22%20type%3D%22text%2Fjavascript%22%3E%3C%2Fscript%3E%0A%20%20%20%20%3Cscript%20src%3D%22https%3A%2F%2Fcdn.polyfill.io%2Fv2%2Fpolyfill.min.js%3Ffeatures%3Des6%2CArray.prototype.includes%2CCustomEvent%2CObject.entries%2CObject.values%2CURL%22%20type%3D%22text%2Fjavascript%22%3E%3C%2Fscript%3E%0A%20%20%20%20%3Cscript%20src%3D%22https%3A%2F%2Funpkg.com%2Fplyr%403%22%20type%3D%22text%2Fjavascript%22%3E%3C%2Fscript%3E%0A%20%20%20%20%3Clink%20rel%3D%22stylesheet%22%20type%3D%22text%2Fcss%22%20href%3D%22https%3A%2F%2Funpkg.com%2Fplyr%403%2Fdist%2Fplyr.css%22%3E%0A%20%20%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0A%20%20%20%20%20%20%20%20body%2C%0A%20%20%20%20%20%20%20%20html%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20black%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20height%3A%20100%25%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20overflow%3A%20hidden%3B%0A%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%23content%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20position%3A%20absolute%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20left%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20right%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20bottom%3A%200%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20top%3A%200px%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%0A%3Cbody%3E%0A%20%20%20%20%3Cvideo%20width%3D%22100%25%22%20height%3D%22100%25%22%20controls%3E%0A%3C%2Fbody%3E%0A%0A%3Cscript%3E%0A%20%20%20%20const%20playerConfig%20%3D%20REPLACEWITH_playerConfig%0A%20%20%20%20const%20sourceConfig%20%3D%20REPLACEWITH_sourceConfig%0A%0A%20%20%20%20console.log%28playerConfig%2C%20sourceConfig%29%0A%0A%20%20%20%20const%20player%20%3D%20new%20Plyr%28%27video%27%2C%20playerConfig%29%3B%0A%0A%20%20%20%20window.player%20%3D%20player%3B%0A%20%20%20%20player.source%20%3D%20sourceConfig%3B%0A%3C%2Fscript%3E%0A%0A%3C%2Fhtml%3E'
            // const playerHTMLWithConfigs = playerHTML
            //     .replace(
            //         'REPLACEWITH_playerConfig',
            //         JSON.stringify(this.playerConfig)
            //     )
            //     .replace(
            //         'REPLACEWITH_sourceConfig',
            //         JSON.stringify(this.sourceConfig)
            //     )

            // const iframeSrc =
            //     'data:text/html;charset=utf-8,' + playerHTMLWithConfigs

            const metadata = {
                title: this.$parent.summary.title,
                subtitle: null
            }

            let starttime = null
            if (
                this.$parent.summary.user_data &&
                this.$parent.summary.user_data.watch_data &&
                this.$parent.summary.user_data.watch_data.length > 0
            ) {
                if (this.$parent.mediatype === 'movie') {
                    if (
                        !this.$parent.summary.user_data.watch_data[0].finished
                    ) {
                        starttime = this.$parent.summary.user_data.watch_data[0]
                            .position
                    }
                } else if (
                    this.$parent.summary.user_data.watch_data.find((o) => {
                        return (
                            !o.finished &&
                            o.traktid === this.$parent.currPlayingTraktID
                        )
                    })
                ) {
                    starttime = this.$parent.summary.user_data.watch_data.find(
                        (o) => {
                            return (
                                !o.finished &&
                                o.traktid === this.$parent.currPlayingTraktID
                            )
                        }
                    ).position
                }
            }

            const sources = []
            if (videoUrl) {
                sources.push({
                    file: videoUrl,
                    label: 'Source 1',
                    type: 'mp4'
                })
            } else {
                for (let i = 0; i < this.videoUrls.length; i++) {
                    sources.push({
                        file: this.videoUrls[i],
                        label: `Source ${i + 1}`,
                        type: 'mp4'
                    })
                }
            }

            const vttURLS = []
            const tracks = []
            for (const url in vttURLS) {
                tracks.push({
                    file: url,
                    kind: 'captions',
                    label: 'eng',
                    default: true
                })
            }
            const playerConfig = {
                autostart: true,
                hlshtml: !![],
                preload: 'auto',
                captions: {
                    edgeStyle: 'raised',
                    backgroundOpacity: 0
                },
                cast: {},
                playlist: [
                    {
                        file: process.env.APP_HOST + '/media/intro.mp4',
                        type: 'mp4'
                    },
                    {
                        sources,
                        starttime,
                        tracks
                    }
                ]
            }

            const playerHTML =
                '%3C%21DOCTYPE%20html%3E%0A%3Chtml%3E%0A%0A%3Chead%3E%0A%20%20%20%20%3Cscript%20type%3D%22text%2Fjavascript%22%20src%3D%22REPLACEWITH_APP_HOST%2Fjwplayer%2Fjwplayer.js%22%3E%3C%2Fscript%3E%0A%20%20%20%20%3Cscript%20type%3D%22text%2Fjavascript%22%20src%3D%22https%3A%2F%2Fcode.jquery.com%2Fjquery-3.4.1.slim.min.js%22%3E%3C%2Fscript%3E%0A%20%20%20%20%3Clink%20rel%3D%22stylesheet%22%20type%3D%22text%2Fcss%22%20href%3D%22REPLACEWITH_APP_HOST%2Fjwplayer%2Fstyle.css%22%3E%0A%3C%2Fhead%3E%0A%0A%3Cbody%3E%0A%20%20%20%20%3Cdiv%20id%3D%22player%22%3E%0A%3C%2Fbody%3E%0A%0A%3Cscript%3E%0A%20%20%20%20const%20metadata%20%3D%20REPLACEWITH_metadata%0A%20%20%20%20const%20playerConfig%20%3D%20REPLACEWITH_playerConfig%0A%20%20%20%20const%20APP_HOST%20%3D%20%27REPLACEWITH_APP_HOST%27%0A%0A%20%20%20%20console.log%28metadata%2C%20playerConfig%29%0A%0A%20%20%20%20const%20playerInstance%20%3D%20jwplayer%28%22player%22%29.setup%28playerConfig%29%3B%0A%3C%2Fscript%3E%0A%0A%3Cscript%20type%3D%22text%2Fjavascript%22%20src%3D%22REPLACEWITH_APP_HOST%2Fjwplayer%2FcommunicateFrame.js%22%3E%3C%2Fscript%3E%0A%0A%3C%2Fhtml%3E'
            const playerHTMLWithConfigs = playerHTML
                .replace(/REPLACEWITH_APP_HOST/gm, process.env.APP_HOST)
                .replace('REPLACEWITH_metadata', JSON.stringify(metadata))
                .replace(
                    'REPLACEWITH_playerConfig',
                    JSON.stringify(playerConfig)
                )

            this.playerIframeSource =
                'data:text/html;charset=utf-8,' + playerHTMLWithConfigs
            this.iframeIsLoading = true
            this.displayPlayerIframe = true
        },
        makeProxyUrl(url, origin, referer) {
            let proxyUrl =
                process.env.APP_HOST +
                '/proxyframe?url=' +
                encodeURIComponent(url)

            if (origin) {
                proxyUrl = proxyUrl + '&origin=' + origin
            }
            if (referer) {
                proxyUrl = proxyUrl + '&referer=' + referer
            }

            return proxyUrl
        },
        sourceSnackbarErrorResults() {
            this.sourceSnackbar = true
            this.sourceSnackbarColor = 'error'
            this.sourceSnackbarText = 'Error fetching results'
        },
        sourceSnackbarNoResults() {
            this.sourceSnackbar = true
            this.sourceSnackbarColor = 'error'
            this.sourceSnackbarText = 'No results :('
        }
    }
}
</script>
