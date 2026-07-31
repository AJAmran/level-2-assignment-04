import { validateQuery } from "../src/middlewares/validateRequest";
import { GlobalValidations } from "../src/utils/validations";

const mockReq: any = {
  query: { page: "1", limit: "50" },
};
const mockRes: any = {};
let nextCalled = false;
const next = () => {
  nextCalled = true;
  console.log("next() called");
  console.log("req.query after middleware:", mockReq.query);
  console.log("types:", typeof mockReq.query.page, typeof mockReq.query.limit);
};

async function main() {
  try {
    await validateQuery(GlobalValidations.paginationSchema)(mockReq, mockRes, next);
    if (!nextCalled) console.log("next NOT called");
  } catch (e) {
    console.log("THREW:", e);
  }
}

main();
