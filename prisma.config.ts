// prisma/prisma.config.ts

// 1. Ensure environment variables are loaded for the CLI tools
import 'dotenv/config'; 

// 2. Import the correct helpers from 'prisma/config'
import { defineConfig, env } from 'prisma/config';

// 3. Export the configuration
export default defineConfig({
  // Specify the path to your schema file
  schema: 'prisma/schema.prisma', 
  
  // Define the datasource URL for tools like 'migrate' and 'db push'
  datasource: {
    // We use env('DB_URL') to pull the connection string from your .env file
    url: env('DB_URL'), 
  },
  
  // Optional: Add other configurations like migrations path
  // migrations: {
  //   path: 'prisma/migrations',
  // },
});