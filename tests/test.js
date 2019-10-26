/* eslint-disable no-console */
const { expect, assert } = require("chai");
const config = require("../config");
const knex = require("knex")(config.db);
//const models = require("../models")(knex);

const forcePromiseReject = () => {
  throw new Error("This promise should have failed, but did not.");
};

const expectedTables = [
    "users",
    "media",
    "streaming_services",
    "countries",
    "languages",
    "media_records",
    "media_record_votes",
    "accessibility_records",
    "accessibility_record_votes"
]

describe("Initialisation", () => {
    describe("Expected Tables", () => {
        it("able to connect to database", () =>
          knex
            .raw("select 1+1 as result")
            .catch(() => assert.fail("unable to connect to db")));
        
        expectedTables.forEach((tableName) => {
            it(`has ${tableName} table`, () =>
                knex(tableName)
                    .select()
                    .catch(() => assert.fail(`${tableName} table is not found.`)));
        })
    });

    describe("Initial Data Seed", () => {
        
    })
})