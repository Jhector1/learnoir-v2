import "dotenv/config";
import { runSeed } from "./runSeed";
import { genPracticeCatalog } from "./_genPracticeCatalog";
export async function main() {
  // ✅ generate catalog every time you seed
    runSeed();
  genPracticeCatalog();


  // ... your existing seeding logic ...
}
main()
  .then((r) => {

  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
