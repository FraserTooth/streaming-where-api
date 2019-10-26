const seed = require("../tests/testCases")

exports.up = function(knex, Promise) {
    const seedMedia = () =>{
        return knex('media')
            .insert(seed.seedMedia)
    }

    const seedCountries = () =>{
        return knex('countries')
            .insert(seed.seedCountries)
    }

    const seedLanguages = () => {
        return knex('languages')
            .insert(seed.seedLanguages)
    }

    const seedServices = () => {
        return knex('streaming_services')
            .insert(seed.seedStreamingServices)
    }

    return seedMedia()
        .then(seedCountries)
        .then(seedLanguages)
        .then(seedServices)
};

exports.down = function(knex) {
    const deleteSeedMedia = () =>{
        return knex('media')
            .whereIn('title', seed.seedMedia.map((item)=>item.title))
            .del()
    }

    const deleteSeedCountries = () =>{
        return knex('countries')
            .whereIn('name', seed.seedCountries.map((item)=>item.name))
            .del()
    }

    const deleteSeedLanguages = () =>{
        return knex('languages')
            .whereIn('name', seed.seedLanguages.map((item)=>item.name))
            .del()
    }

    const deleteSeedServices = () =>{
        return knex('streaming_services')
            .whereIn('name', seed.seedStreamingServices.map((item)=>item.name))
            .del()
    }


    return deleteSeedMedia()
        .then(deleteSeedCountries)
        .then(deleteSeedLanguages)
        .then(deleteSeedServices)
};
