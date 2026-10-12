import bcrypt from "bcrypt";
import { seed } from "drizzle-seed";
import { db } from "./db/index.js";
import { products, users } from "./db/schema.js";

process.loadEnvFile();

const productNames = [
  "Wireless Headphones",
  "Mechanical Keyboard",
  "Gaming Mouse",
  "27-inch Monitor",
  "USB-C Hub",
  "Webcam HD",
  "Laptop Stand",
  "Noise-Cancelling Earbuds",
  "Smart Desk Lamp",
  "Portable SSD",
  "Ergonomic Chair",
  "Bluetooth Speaker",
];

const productImages = productNames.map(
  (_, i) => `https://picsum.photos/seed/product${i}/600/400`,
);

const demoUsers = [
  { username: "merchant", email: "merchant@demo.com", role: "merchant" },
  { username: "customer", email: "customer@demo.com", role: "customer" },
];

async function main() {
  const passwordHash = await bcrypt.hash("Password1!", 10);

  for (const user of demoUsers) {
    await db
      .insert(users)
      .values({ ...user, password_hash: passwordHash })
      .onConflictDoUpdate({
        target: users.email,
        set: { username: user.username, role: user.role },
      });
  }

  await seed(db, { products }).refine((funcs) => ({
    products: {
      count: productNames.length,
      columns: {
        name: funcs.valuesFromArray({ values: productNames }),
        image: funcs.valuesFromArray({ values: productImages }),
        description: funcs.loremIpsum({ sentencesCount: 2 }),
        price: funcs.number({ minValue: 5, maxValue: 500, precision: 100 }),
      },
    },
  }));

  console.log("seed complete");
  console.log("users: merchant@demo.com / customer@demo.com (Password1!)");

  process.exit(0);
}

main();
