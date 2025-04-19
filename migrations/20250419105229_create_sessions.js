/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('sessions', function (table) {
      table.increments('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('jwt_token');
      table.string('device_info');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('expires_at');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('sessions');
  };
