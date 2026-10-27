import { mm } from "@tscircuit/mm"
import { z } from "zod"

export const modelLengthSchema = z
  .union([z.number(), z.string()])
  .transform((value, context) => {
    try {
      // The unit converter uses parseFloat, which otherwise truncates inputs
      // such as "1 2" or "12.3.4mm" into apparently valid dimensions.
      if (
        typeof value === "string" &&
        !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*(?:mm|cm|m|in|inch|mil|ft|feet)?$/i.test(
          value.trim(),
        )
      )
        throw new Error("Length must contain one complete decimal value")
      const parsed = mm(value)
      if (!Number.isFinite(parsed)) throw new Error("Length is not finite")
      return parsed
    } catch {
      context.addIssue({
        code: "custom",
        message: `Invalid model length: ${String(value)}`,
      })
      return z.NEVER
    }
  })

export const positiveModelLengthSchema = modelLengthSchema.refine(
  (value) => value > 0,
  "Length must be greater than zero",
)

export const nonnegativeModelLengthSchema = modelLengthSchema.refine(
  (value) => value >= 0,
  "Length cannot be negative",
)
