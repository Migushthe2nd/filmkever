<template>
    <v-container v-if="$store.state.loggedIn">
        <v-layout column justify-center pa-3>
            <v-flex mt-5 xs12>
                <v-layout row wrap>
                    <v-flex pa-2 xs12>
                        <h1 class="display-1 font-weight-bold">
                            Preferences
                        </h1>
                        <h2 class="subtitle-1">
                            Change your settings here
                        </h2>
                    </v-flex>
                </v-layout>
                <v-list subheader three-line>
                    <v-subheader>Playback Settings</v-subheader>

                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title
                                >Finish percentage</v-list-item-title
                            >
                            <v-list-item-subtitle
                                >At which percentage something is marked as
                                watched</v-list-item-subtitle
                            >
                            <v-col cols="12" class="px-5 pb-0">
                                <v-slider
                                    v-model="preferences.finishPercentage"
                                    min="50"
                                    hide-details
                                    thumb-label
                                    :label="
                                        preferences.finishPercentage.toString() +
                                            '%'
                                    "
                                ></v-slider>
                            </v-col>
                        </v-list-item-content>
                    </v-list-item>

                    <!-- <v-list-item>
                    <template>
                        <v-list-item-action>
                            <v-checkbox></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                            <v-list-item-title>Sound</v-list-item-title>
                            <v-list-item-subtitle
                                >Auto-update apps at any time. Data charges may
                                apply</v-list-item-subtitle
                            >
                        </v-list-item-content>
                    </template>
                </v-list-item> -->
                </v-list>
                <v-flex mt-5>
                    <v-layout>
                        <v-spacer />
                        <v-tooltip
                            top
                            :open-on-hover="false"
                            :disabled="submitNotification() ? false : true"
                            :value="submitNotification() ? true : false"
                        >
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    color="primary"
                                    depressed
                                    :loading="loading"
                                    v-on="on"
                                    @click="savePreferences()"
                                    >Save changes
                                </v-btn>
                            </template>
                            <span>{{ submitNotification() }}</span>
                        </v-tooltip>
                    </v-layout>
                </v-flex>
            </v-flex>
        </v-layout>
        <!-- <v-list subheader two-line>
            <v-subheader>Profile Settings</v-subheader>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>Username</v-list-item-title>
                    <v-list-item-subtitle
                        >Click here to change your
                        username</v-list-item-subtitle
                    >
                </v-list-item-content>
            </v-list-item>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>Password</v-list-item-title>
                    <v-list-item-subtitle
                        >Click here to change your
                        password</v-list-item-subtitle
                    >
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-divider></v-divider> -->
    </v-container>
</template>

<script>
import queries from '@/web_utils/queries.gql'

export default {
    data() {
        return {
            error: '',
            preferences: this.$store.state.loggedIn
                ? JSON.parse(JSON.stringify(this.$store.state.user.preferences))
                : null,
            loading: false
        }
    },
    beforeMount() {
        if (!this.$store.state.loggedIn) {
            this.$router.replace('/')
        }
    },
    methods: {
        savePreferences() {
            this.loading = true
            this.$apollo
                .mutate({
                    mutation: queries.preferences,
                    variables: {
                        finishPercentage: this.preferences.finishPercentage
                    }
                })
                .then((response) => {
                    this.loading = false
                    this.$router.push({ query: { msg: 'success' } })
                    setTimeout(() => {
                        this.$router.go()
                    }, 2800)
                })
                .catch((error) => {
                    this.loading = false
                    const parsedError = JSON.parse(JSON.stringify(error))
                    if (
                        parsedError.graphQLErrors &&
                        parsedError.graphQLErrors.length > 0 &&
                        parsedError.graphQLErrors[0].message
                    ) {
                        const thisError = parsedError.graphQLErrors[0]

                        this.error = thisError.message
                    }
                })
        },
        submitNotification() {
            setTimeout(() => {
                this.$router.push({ query: {} })
            }, 3000)
            if (this.$route.query.msg === 'success') return 'Success!'
        }
    }
}
</script>
