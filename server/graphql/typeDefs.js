const gql = require('graphql-tag')

module.exports = gql`
    type User {
        uuid: String!
        username: String!
        email: String!
        password_hash: String!
        joined: String!
        last_logged_in: String
        role: String
    }

    type UserInfo {
        uuid: String!
        username: String!
        email: String!
        joined: String!
        last_logged_in: String
        role: String
    }

    type AuthPayload {
        user: UserInfo
    }

    type UserWatchData {
        # Int?
        finished: Boolean
        time_modified: String
        time_watched: String
        length: Int
        position: Int
    }

    type ShowUserWatchData {
        # Int?
        finished: Boolean
        traktid: Int
        season: Int
        episode_number: Int
        time_modified: String
        time_watched: String
        length: Int
        position: Int
    }

    type UserWatchlistData {
        added: Boolean!
        time_added: String
    }

    type UserData {
        watch_data: [UserWatchData]
        watchlist_data: UserWatchlistData
    }

    type ShowUserData {
        watch_data: [ShowUserWatchData]
        watchlist_data: UserWatchlistData
    }

    type EpisodeUserData {
        watch_data: [UserWatchData]
    }

    type SummaryIds {
        trakt: Int!
        slug: String!
        imdb: String
        tmdb: Int
        tvdb: Int
    }

    type SeasonAndEpisodeIds {
        trakt: Int!
        tmdb: Int
        tvdb: Int
    }

    type ImageLinks {
        poster: [String]
        background: [String]
        logo: [String]
    }

    type episodeImageLinks {
        background: [String]
    }

    type AirTime {
        day: String
        time: String
        timezone: String
    }

    type Movie {
        title: String!
        year: Int
        ids: SummaryIds!
        tagline: String
        overview: String
        released: String
        runtime: String
        country: String
        updated_at: String
        trailer: String
        homepage: String
        status: String
        rating: Float
        language: String
        genres: [String!]
        certification: String
        images: ImageLinks
        user_data: UserData
    }

    type Show {
        title: String!
        year: Int
        ids: SummaryIds!
        overview: String
        first_aired: String
        airs: AirTime
        aired_episodes: Int
        runtime: String
        network: String
        country: String
        updated_at: String
        trailer: String
        status: String
        rating: Float
        certification: String
        language: String
        genres: [String!]
        images: ImageLinks
        user_data: ShowUserData
    }

    type Episode {
        title: String
        season: Int!
        number: Int!
        ids: SeasonAndEpisodeIds!
        overview: String
        first_aired: String
        rating: Float
        runtime: String
        # FIX THIS: !!
        images: episodeImageLinks
        user_data: EpisodeUserData
    }

    type EpisodeMinimal {
        season: Int!
        number: Int!
        title: String
        ids: SeasonAndEpisodeIds!
        # FIX THIS: !!
        images: episodeImageLinks
        user_data: EpisodeUserData
    }

    type SeasonEpisodesMinimal {
        number: Int
        ids: SeasonAndEpisodeIds!
        episodes: [EpisodeMinimal]
    }

    type Season {
        number: Int
        ids: SeasonAndEpisodeIds!
        rating: Int
        episode_count: Int
        aired_episodes: Int
        title: String
        overview: String
        first_aired: String
        network: String
    }

    type Pagination {
        item_count: Int
        limit: Int
        page: Int
        page_count: Int
        lastID: Int
    }

    type MoviePage {
        items: [Movie]
        pagination: Pagination
    }

    type ShowPage {
        items: [Show]
        pagination: Pagination
    }

    type Query {
        allUsers: [User!]
        me: UserInfo!
        emailAvailable(email: String!): Boolean!
        movie(traktID: Int!): Movie
        show(traktID: Int!): Show
        episode(traktID: Int!): Episode
        seasonsAndEpisodes(
            traktID: Int!
            saveTmdbID: Int
        ): [SeasonEpisodesMinimal]
        # episodes(traktID: String!): [Episode]

        # Movies
        searchMovies(page: Int, query: String): MoviePage
        watchlistMovies(page: Int, lastID: Int): MoviePage
        trendingMovies(page: Int): MoviePage
        boxofficeMovies(page: Int): MoviePage
        popularMovies(page: Int): MoviePage

        # Shows
        searchShows(page: Int, query: String): ShowPage
        watchlistShows(page: Int, lastID: Int): ShowPage
        trendingShows(page: Int): ShowPage
        popularShows(page: Int): ShowPage
    }

    type Mutation {
        register(
            username: String!
            email: String!
            password: String!
        ): AuthPayload
        login(email: String!, password: String!): AuthPayload
        logout: String
        progress(
            mediatype: String!
            traktID: Int!
            finished: Boolean
            length: Int
            position: Int
        ): Boolean
        watchlist(mediatype: String!, traktID: Int!, state: Boolean): Boolean
    }

    schema {
        query: Query
        mutation: Mutation
    }
`
