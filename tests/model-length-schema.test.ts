import { expect, test } from "bun:test"
import { hexSocketBoltModelPropsSchema } from "../src/hex-socket-bolt-schema"
import {
  modelLengthSchema,
  nonnegativeModelLengthSchema,
  positiveModelLengthSchema,
} from "../src/model-length-schema"

test("model lengths reject truncated numeric strings", () => {
  for (const value of [
    "1 2",
    "12.3.4",
    "1-2",
    "1+2",
    "1/2",
    "1,2",
    "12 99mm",
    "12.3.4mm",
  ]) {
    expect(modelLengthSchema.safeParse(value).success).toBe(false)
    expect(positiveModelLengthSchema.safeParse(value).success).toBe(false)
    expect(nonnegativeModelLengthSchema.safeParse(value).success).toBe(false)
    expect(
      hexSocketBoltModelPropsSchema.safeParse({
        metricSize: "M3",
        length: value,
      }).success,
    ).toBe(false)
  }
})

test("complete decimal lengths keep supported units and numeric inputs", () => {
  const cases: [string | number, number][] = [
    [2, 2],
    [0, 0],
    [-2, -2],
    [1e-9, 1e-9],
    ["2", 2],
    ["-2", -2],
    ["+2.5", 2.5],
    [".5", 0.5],
    ["2.", 2],
    [" 2 ", 2],
    ["2 mm", 2],
    ["2MM", 2],
    ["2cm", 20],
    ["2m", 2000],
    ["2in", 50.8],
    ["2inch", 50.8],
    ["2mil", 0.0508],
    ["2ft", 609.6],
    ["2feet", 609.6],
  ]
  for (const [value, expected] of cases)
    expect(modelLengthSchema.parse(value)).toBeCloseTo(expected, 12)
  for (const value of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    "",
    "mm",
    "2parsecs",
    "1e3mm",
  ])
    expect(modelLengthSchema.safeParse(value).success).toBe(false)
})
