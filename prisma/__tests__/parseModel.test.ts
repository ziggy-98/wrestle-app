import { Promotion } from "../generated/prisma";
import { parseModel } from "../utils/parseModel";

test("Should parse all bigint values into number values", () => {
  const promotion: Promotion = {
    id: BigInt(1),
    name: "First promotion",
    cagematch_correlation_id: BigInt(1),
  };
  const expected = {
    id: 1,
    name: "First promotion",
    cagematch_correlation_id: 1,
  };
  expect(parseModel(promotion)).toEqual(expected);
});
