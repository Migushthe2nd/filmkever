<template>
    <v-layout column justify-center align-center pa-3>
        <v-card max-width="600">
            <v-card-title class="headline">
                About
            </v-card-title>
            <v-card-text>
                <p>
                    {{ APP_TITLE }} is a project which aims to be a reliable
                    indexer for content. It provides the user with sources it
                    can choose from and the webapplication gets the source and
                    plays the video, when possible, in a native video player.
                </p>
                <p v-if="APP_DISCORD_INVITE">
                    If you have questions, please join the
                    <a
                        :href="APP_DISCORD_INVITE"
                        target="_blank"
                        title="discord"
                        >Discord server</a
                    >.
                </p>
                <p>
                    Found a bug or have a suggestion? Let me know on the GitHub
                    <a
                        :href="APP_FEEDBACK_URL"
                        target="_blank"
                        title="contribute"
                        >issue board</a
                    >.
                </p>
                <div class="text-xs-right">
                    <em>
                        <small>&mdash; Migush</small>
                    </em>
                </div>
                <hr class="my-3" />
            </v-card-text>
        </v-card>
    </v-layout>
</template>

<script>
export default {
    data: () => ({
        APP_TITLE: process.env.APP_TITLE,
        APP_DISCORD_INVITE: process.env.APP_DISCORD_INVITE,
        APP_FEEDBACK_URL: process.env.APP_FEEDBACK_URL
    })
}
</script>
