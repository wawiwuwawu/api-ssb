module.exports = {
    up: async (queryInterface) => {

      await queryInterface.bulkInsert("UserAdmin", [
        { nama: "Admin 1", email: "admin1@example.com", password: "password123" },
        { nama: "Admin 2", email: "admin2@example.com", password: "password456" },
      ]);
    },
  
    down: async (queryInterface) => {
      await queryInterface.bulkDelete("UserAdmin", null, {});
    },
  };
