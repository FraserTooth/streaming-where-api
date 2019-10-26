
exports.up = function(knex) {
  return knex.schema
  //Media
  .createTable("media", (t) => {
    t.increments()
      .index()
      .primary();
    
    t.varchar("title", 255)
      .unique()
      .notNullable()
      .index(); //Will be searching on this a lot

    t.varchar("tmdb_api_url",255)
      .unique()
      .notNullable();

    t.varchar("type",25)
      .notNullable();

    t.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  })
  //Streaming Services
  .createTable("streaming_services", (t) => {
    t.increments()
      .index()
      .primary();

    t.varchar("name", 50)
      .notNullable()
      .unique()

    t.varchar("base_url", 50)
      .notNullable()
      .unique()

    t.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  })
  //Countries
  .createTable("countries", (t) => {
    t.increments()
      .index()
      .primary();
    
    t.varchar("name", 255)
      .notNullable()
      .unique();
  })
  //Languages
  .createTable("languages", (t) => {
    t.increments()
      .index()
      .primary();
    
    t.varchar("name", 255)
      .notNullable()
      .unique();
  })
  //Users
  .createTable("users", (t) => {
    t.increments()
      .index()
      .primary();

    t.varchar("email", 255)
      .notNullable()
      .unique()

    t.varchar("username", 30)
      .notNullable()
      .unique()

    t.varchar("password_hash", 500)
      .notNullable()

    t.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  })
  //Media Records
  .createTable("media_records", (t) => {
    t.increments()
      .index()
      .primary();

    t.integer("media_id")
      .notNullable()
      .references('id').inTable('media')
    
    t.integer("streaming_service_id")
      .notNullable()
      .references('id').inTable('streaming_services')
    
    t.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    t.integer("country_id")
      .notNullable()
      .references("id").inTable("countries")

    t.integer("user_id")
      .notNullable()
      .references('id').inTable('users')

    t.varchar("media_url")
  })
  //Accessibility Records
  .createTable("accessibility_records", (t) => {
    t.increments()
      .index()
      .primary();

    t.integer("media_record_id")
      .notNullable()
      .references('id').inTable('media_records')

    t.integer("language_id")
      .notNullable()
      .references('id').inTable('languages')

    t.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    t.integer("user_id")
      .notNullable()
      .references('id').inTable("users")

    t.varchar("type", 30)
      .notNullable()
      .index() //Will be searching on this a lot

    t.varchar("notes", 500)
  })
  //Media Record Votes
  .createTable("media_record_votes", (t) => {
    t.increments()
      .primary()
    
    t.integer("media_record_id")
      .notNullable()
      .references("id").inTable("media_records")

    t.boolean("vote")
      .notNullable()
    
    t.timestamp("voted_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  })
  //Accessibility Record Votes
  .createTable("accessibility_record_votes", (t) => {
    t.increments()
      .primary()
    
    t.integer("media_record_id")
      .notNullable()
      .references("id").inTable("accessibility_records")

    t.boolean("vote")
      .notNullable()
    
    t.timestamp("voted_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  // undo this migration by destroying the 'users' table
  return knex.schema
  .dropTable("accessibility_record_votes")
  .dropTable("media_record_votes")
  .dropTable("accessibility_records")
  .dropTable("media_records")
  .dropTable("users")
  .dropTable("streaming_services")
  .dropTable("countries")
  .dropTable("languages")
  .dropTable("media")
};