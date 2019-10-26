module.exports = {

    expectedTables: [
        "users",
        "media",
        "streaming_services",
        "countries",
        "languages",
        "media_records",
        "media_record_votes",
        "accessibility_records",
        "accessibility_record_votes"
    ],
    
    testUserA: {
        username: "fraserfraser",
        email: "fraserfraser@fraser.com",
        password: "$2y$12$Z92RVZlg729bWa6xXyLdcO0XHJbLsPHkCVSKhMgjBk2oiRFGvWJBa"
    },

    testUserB: {
        username: "mickeyMouse",
        email: "mickey@houseofmouse.com",
        password: "$2y$12$jaDggZFxROVxe/zVmW0EbOw9F6DzMtycerBdwmNPd8la9ZiWuKT8S",
    },

    seedLanguages: [
        {name: "English"},
        {name: "Japanese"},
        {name: "Spanish"},
        {name: "French"},
        {name: "Russian"},
        {name: "Hindi"}
    ],

    seedCountries: [
        {name: "Canada"},
        {name: "UK"},
        {name: "Japan"},
        {name: "USA"},
        {name: "Korea"},
        {name: "India"}
    ],

    seedStreamingServices: [
        {name: "Netflix",
        base_url: "https://netflix"},

        {name: "Amazon Prime Video",
        base_url: "https://amazon"},
    ],

    seedMedia: [
        {title: "Madagascar (2005)",
        tmdb_api_url: "https://www.themoviedb.org/movie/953-madagascar",
        type: "movie"},

        {title: "Coco (2017)",
        tmdb_api_url: "https://www.themoviedb.org/movie/354912-coco",
        type: "movie"},

        {title: "Brooklyn Nine-Nine Season 1 (2013)",
        tmdb_api_url: "https://www.themoviedb.org/tv/48891-brooklyn-nine-nine/season/1",
        type: "season"},

        {title: "Demon Slayer: Kimetsu no Yaiba (2019)",
        tmdb_api_url: "https://www.themoviedb.org/tv/85937/season/1",
        type: "season"}
    ],

    testMediaRecord: {
        title: "Madagascar (2005)",
        streaming_service: "Netflix",
        country: "Canada",
        usename: "fraserfraser",
        media_url: "https://www.netflix.com/watch/70021636"
    },

    testAccessibilityRecord: {
        language: "English",
        username: "fraserfraser",
        type: "subtitle-CC",
        notes: "normal"
    }
  };