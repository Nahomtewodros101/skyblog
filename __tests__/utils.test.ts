// i have run this test and it passes BUT there is a problem with a small thing that outreatches this projects scope so i left it as it is!
// but the test runs moothly and passes!
import { generateSlug, formatDate, truncateText } from "@/lib/utils"

describe("Utility functions", () => {
  describe("generateSlug", () => {
    it("should generate slug from title", () => {
      expect(generateSlug("Hello World")).toBe("hello-world")
      expect(generateSlug("This is a Test!")).toBe("this-is-a-test")
      expect(generateSlug("Multiple   Spaces")).toBe("multiple-spaces")
    })
  })

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2023-12-25")
      const formatted = formatDate(date)
      expect(formatted).toContain("December")
      expect(formatted).toContain("25")
      expect(formatted).toContain("2023")
    })
  })

  describe("truncateText", () => {
    it("should truncate text correctly", () => {
      const text = "This is a very long text that should be truncated"
      expect(truncateText(text, 20)).toBe("This is a very long ...")
      expect(truncateText("Short", 20)).toBe("Short")
    })
  })
})
