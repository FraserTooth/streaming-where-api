/* eslint-disable no-console */
const { expect, assert } = require("chai");
const config = require("../config");
const knex = require("knex")(config.db);
const testCases = require("./testCases");
const chai = require("chai");
const chaiGraphQL = require("chai-graphql");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiGraphQL);
chai.use(chaiHttp);
const server = "http://localhost:4000";
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

    testCases.expectedTables.forEach(tableName => {
      it(`has ${tableName} table`, () =>
        knex(tableName)
          .select()
          .catch(() => assert.fail(`${tableName} table is not found.`)));
    });
  });

  describe("Initial Data Seed", () => {
    const expectedSeed = {
      media: testCases.seedMedia,
      streaming_services: testCases.seedStreamingServices,
      countries: testCases.seedCountries,
      languages: testCases.seedLanguages
    };

    for (const table in expectedSeed) {
      const seed = expectedSeed[table];
      it(`table ${table} should have the expected seed data`, async () => {
        const response = await knex(table).select();
        expect(response[0].hasOwnProperty("id")).to.be.true;
        expect(response.length).to.equal(seed.length);
      });
    }
  });
});

describe("API Interactions", () => {
  describe("Media", () => {
    it("getAllMedia can return all media", async () => {
      const query = `{
                getAllMedia {
                  id
                  title
                  type
                  created_at
                  tmdb_api_url
                }
              }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query });

      const data = response.body.data.getAllMedia;

      expect(response.ok).to.be.true;
      expect(data.length).to.equal(4);
      expect(data[0].title).to.equal(testCases.seedMedia[0].title);
    });

    it("can return a specific item by title or id", async () => {
      const query = `{
                getMedia(title:${testCases.seedMedia[0].title}) {
                  id
                  title
                  type
                  tmdb_api_url
                }
              }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query });

      const data = response.body.data.getMedia;

      expect(response.ok).to.be.true;
      expect(data.length).to.equal(1);
      expect(data[0].type).to.equal(testCases.seedMedia[0].type);

      const queryid = `{
                getMedia(id:${data[0].id}) {
                  id
                  title
                  type
                  tmdb_api_url
                }
              }`;

      const responseid = await chai
        .request(server)
        .post("/graphql")
        .send({ queryid });

      const dataid = responseid.body.data.getMedia;

      expect(dataid[0]).to.deep.equal(data[0]);
    });
  });

  describe("Users", () => {
    const testUserA = testCases.testUserA;
    const testUserB = testCases.testUserB;

    it("can create a user", async () => {
      const mutation = `
            mutation {
                addUser(
                input: {
                    name: ${testUserA.username}
                    email: ${testUserA.email}
                    password: ${testUserA.password}
                }){
                    username
                    email
                }
            }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ mutation });

      const data = response.body.data.getMedia;

      expect(response.ok).to.be.true;
      expect(data.length).to.equal(1);
      expect(data[0].username).to.equal(testUserA.username);
      expect(data[0].email).to.equal(testUserB.username);
      expect(data[0].hasOwnProperty("password")).to.be.false;
    });

    it("can retrive specific user information on the basis of username or id", async () => {
      const queryA = `{
                getUser(username: ${testUserA.username}) {
                  id
                  username
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ queryA });

      const dataA = responseA.body.data.getMedia;

      expect(dataA[0].username).to.equal(testUserA.username);

      const queryB = `{
                getUser(id: ${dataA[0].id}) {
                  id
                  username
                }
              }`;

      const responseB = await chai
        .request(server)
        .post("/graphql")
        .send({ queryB });

      const dataB = responseB.body.data.getMedia;

      expect(dataB[0]).to.deep.equal(dataA[0]);
    });

    it("cannot retrive email", async () => {
      const queryA = `{
                getUser(username: ${testUserA.username}) {
                  email
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ queryA });

      const dataA = responseA.body.data.getMedia;
      expect(dataA[0].email).to.equal(undefined);
      expect(responseA.ok).to.be.false;
    });

    it("cannot retrive passwords", async () => {
      const queryA = `{
                getUser(username: ${testUserA.username}) {
                  password_hash
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ queryA });

      const dataA = responseA.body.data.getMedia;
      expect(dataA[0].password).to.equal(undefined);
      expect(responseA.ok).to.be.false;
    });

    //Clean Up, decided not to add a delete user step at present, probably need a 'clean data from account' method so the records are still attributable
    knex("users")
      .whereIn("name", [testUserA.username, testUserB.username])
      .del();
  });

  describe("Media Records", () => {
    it("can create a media record with a user password", () => {});

    it("can view a list of media records", () => {});

    it("can view a given media record by id", () => {});

    it("can return information about media, streaming service and country", () => {});

    it("can find a list of media records for a given media", () => {});
  });
});
