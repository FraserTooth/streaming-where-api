/* eslint-disable no-console */
const { expect, assert } = require("chai");
const config = require("../config");
const knex = require("knex")(config.db);
const testCases = require("./testCases")
//const models = require("../models")(knex);

const forcePromiseReject = () => {
  throw new Error("This promise should have failed, but did not.");
};

describe("Initialisation", () => {
    describe("Expected Tables", () => {
        it("able to connect to database", () =>
          knex
            .raw("select 1+1 as result")
            .catch(() => assert.fail("unable to connect to db")));
        
        testCases.expectedTables.forEach((tableName) => {
            it(`has ${tableName} table`, () =>
                knex(tableName)
                    .select()
                    .catch(() => assert.fail(`${tableName} table is not found.`)));
        })
    });

    describe("Initial Data Seed", () => {

        const expectedSeed = {
            media: testCases.seedMedia,
            streaming_services: testCases.seedStreamingServices,
            countries: testCases.seedCountries,
            languages: testCases.seedLanguages
        }    

        for (const table in expectedSeed) {
            const seed = expectedSeed[table]
            it(`table ${table} should have the expected seed data`, async () => {
                const response = 
                    await knex(table)
                        .select()
                console.log(seed)
                expect(response[0].hasOwnProperty("id")).to.be.true;
                expect(response.length).to.equal(seed.length);
            })
        } 
        
    })
})