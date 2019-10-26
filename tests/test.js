/* eslint-disable no-console */
const { expect, assert } = require("chai");
const config = require("../config");
const knex = require("knex")(config.db);
const testCases = require("./testCases");
const chai = require("chai");
const chaiGraphQL = require("chai-graphql");
const chaiHttp = require("chai-http");
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
                getMedia(title:"${testCases.seedMedia[0].title}") {
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
        .send({ query: queryid });

      const dataid = responseid.body.data.getMedia;

      expect(dataid[0]).to.deep.equal(data[0]);
    });
  });

  describe("Users", () => {
    const testUserA = testCases.testUserA;
    const testUserB = testCases.testUserB;

    afterEach(() => {});

    it("can create a user", async () => {
      const mutation = `
            mutation {
                addUser(
                  input:{
                    username: "${testUserA.username}"
                    email: "${testUserA.email}"
                    password: "${testUserA.password}"
                  }){
                    id
                    username
                    email
                }
            }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: mutation });

      const data = response.body.data.addUser;

      expect(response.ok).to.be.true;
      expect(data.length).to.equal(1);
      expect(data[0].username).to.equal(testUserA.username);
      expect(data[0].email).to.equal(testUserA.email);
      expect(data[0].hasOwnProperty("password")).to.be.false;
    });

    it("password is hashed", async () => {
      const passwordCheck = await knex("users")
        .select("password_hash")
        .where("username", testUserA.username);

      expect(passwordCheck[0].password_hash[0]).to.equal("$");
    });

    it("can retrive specific user information on the basis of username or id", async () => {
      const queryA = `{
                getUser(username: "${testUserA.username}") {
                  id
                  username
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ query: queryA });

      const dataA = responseA.body.data.getUser;

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
        .send({ query: queryB });

      const dataB = responseB.body.data.getUser;

      expect(dataB[0]).to.deep.equal(dataA[0]);
    });

    it("cannot retrive email", async () => {
      const queryA = `{
                getUser(username: "${testUserA.username}") {
                  email
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ query: queryA });

      expect(responseA.body.errors[0].message).to.equal(
        'Cannot query field "email" on type "User".'
      );
      expect(responseA.ok).to.be.false;
    });

    it("cannot retrive passwords", async () => {
      const queryA = `{
                getUser(username: "${testUserA.username}") {
                  password_hash
                }
              }`;

      const responseA = await chai
        .request(server)
        .post("/graphql")
        .send({ query: queryA });

      expect(responseA.body.errors[0].message).to.equal(
        'Cannot query field "password_hash" on type "User".'
      );
      expect(responseA.ok).to.be.false;
    });

    it("cleans up", async () => {
      console.log("Cleaning Up");
      //Clean Up, decided not to add a delete user step at present, probably need a 'clean data from account' method so the records are still attributable

      await knex("users")
        .where("username", testUserA.username)
        .del();
    });
  });

  describe("Media Records", () => {
    const testUserB = testCases.testUserB;
    let testUserBID;
    let seed;

    it("sets up a test user", async () => {
      //Add test user B
      const mutation = `
              mutation {
                  addUser(
                  input: {
                      username: "${testUserB.username}"
                      email: "${testUserB.email}"
                      password: "${testUserB.password}"
                  }){
                      id
                      username
                      email
                  }
              }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: mutation });

      testUserBID = response.body.data.addUser;

      seed = testCases.testMediaRecord;
    });

    it("can create a media record with a username & password", async () => {
      const mutation = `
            mutation {
                addMediaRecord(
                input: {
                    title: "${seed.title}"
                    streaming_service: "${seed.streaming_service}"
                    country: "${seed.country}"
                    media_url: "${seed.media_url}"
                }
                authentication: {
                    username: "${testUserB.username}"
                    password: "${testUserB.password}"
                }){
                    media_url
                    user_id
                }
            }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: mutation });

      const data = response.body.data.addMediaRecord;

      console.log(response);

      expect(response.ok).to.be.true;
      expect(data.length).to.equal(1);
      expect(data[0].id).to.equal(testUserBID);
      expect(data[0].media_url).to.equal(seed.media_url);
    });

    it("can view a list of media records", async () => {
      const mutation = `
            mutation {
                addMediaRecord(
                input: {
                    title: "Demon Slayer: Kimetsu no Yaiba (2019)"
                    streaming_service: "Amazon Prime Video"
                    country: "Japan"
                    media_url: "https://www.amazon.co.jp/gp/video/detail/B07QBC423H/"
                }
                authentication: {
                    username: ${testUserB.username}
                    password: ${testUserB.password}
                }){
                    media_url
                    user_id
                }
            }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: mutation });

      const query = `{
            getMediaRecords {
              id
              media_url
            }
          }`;

      const response2 = await chai
        .request(server)
        .post("/graphql")
        .send({ query });

      const data = response2.body.data.getMediaRecords;

      expect(data.length).to.equal(2);
    });

    let idFrom1;

    it("gets id for the next few tests", async () => {
      //Get ID For Next Few Tests
      const queryToGetID = `{
          getMediaRecords {
            id
          }
        }`;

      const responseToGetID = await chai
        .request(server)
        .post("/graphql")
        .send({ queryToGetID });

      idFrom1 = responseToGetID.body.data.getMediaRecords[0].id;
    });

    it("can view a given media record by id", async () => {
      const query = `{
            getMediaRecord(id:${idFrom1}) {
              id
              media_url
            }
          }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: query });

      const data = response.body.data.getMediaRecord;

      expect(data.length).to.equal(1);
      expect(response2.ok).to.be.true;
    });

    it("can return further information about media, streaming service, country & user", async () => {
      const query = `{
            getMediaRecord(id:${idFrom1}) {
              Media{
                  title
              }
              StreamingService{
                  name
              }
              Country{
                  name
              }
              User {
                  username
              }
            }
          }`;

      const response = await chai
        .request(server)
        .post("/graphql")
        .send({ query: query });

      const data = response.body.data.getMediaRecord;

      expect(data.length).to.equal(1);
      expect(response2.ok).to.be.true;
      expect(data[0].Media.title).to.equal(seed.title);
      expect(data[0].StreamingService.title).to.equal(seed.streaming_service);
      expect(data[0].Country.name).to.equal(seed.country);
      expect(data[0].User.username).to.equal(testUserB.username);
    });

    it("can find a list of media records for a given media by media title", async () => {});

    it("can find a list of media records for a given user by userId", async () => {});

    it("cleans up", async () => {
      await knex("media_records")
        .where("media_url", testCases.testMediaRecord.media_url)
        .del();

      await knex("users")
        .where("username", testUserB.username)
        .del();
    });
  });
});
