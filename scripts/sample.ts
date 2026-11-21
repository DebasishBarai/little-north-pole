import fs from "fs";
import { renderPack } from "../lib/pdf";
import { SAMPLE_KID } from "../lib/letter";
(async () => {
  const kids = [SAMPLE_KID, { ...SAMPLE_KID, name: "Leo", age: "4", deed: "shared your favorite truck with a new friend at preschool", goal: "", wish: "a dinosaur that roars", pet: "" }];
  fs.writeFileSync("/tmp/pack.pdf", await renderPack(kids));
  fs.writeFileSync("/tmp/sample.pdf", await renderPack([SAMPLE_KID], { sample: true }));
  console.log("ok");
})();
