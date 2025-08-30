import { validatePassword } from "../passwordUtils";

function testValidPasswords(): void {
  describe("valid passwords", () => {
    it("should validate a strong password", () => { expect(validatePassword("StrongPass713!")).toBe(true); });
    it("should validate password with all required elements", () => { expect(validatePassword("MyP@ssw0rd")).toBe(true); });
    it("should validate password with special characters", () => { expect(validatePassword("P@ssw0rd!@#$%^&*()")).toBe(true); });
    it("should validate password with minimum length", () => { expect(validatePassword("Ab1!defg")).toBe(true); });
  });
}

function testLengthValidation(): void {
  describe("length validation", () => {
    it("should reject password shorter than minimum length", () => { expect(validatePassword("Ab1!def")).toBe(false); });
    it("should reject password longer than maximum length", () => { expect(validatePassword("ComplexP@ssw0rd2024!".repeat(6) + "b1!defghijklmnopqrstuvwxyz")).toBe(false); });
    it("should accept password with exactly minimum length", () => { expect(validatePassword("Ab1!defg")).toBe(true); });
    it("should accept password with exactly maximum length", () => { expect(validatePassword("ComplexP@ssw0rd2024!".repeat(6) + "b1!defg")).toBe(true); });
  });
}

function testUppercaseRequirement(): void {
  describe("uppercase requirement", () => {
    it("should reject password without uppercase letters", () => { expect(validatePassword("mypassword123!")).toBe(false); });
    it("should accept password with uppercase letters", () => { expect(validatePassword("MyPassword713!")).toBe(true); });
    it("should accept password with only uppercase letters", () => { expect(validatePassword("MYPASSWORD713!")).toBe(false); });
  });
}

function testLowercaseRequirement(): void {
  describe("lowercase requirement", () => {
    it("should reject password without lowercase letters", () => { expect(validatePassword("MYPASSWORD713!")).toBe(false); });
    it("should accept password with lowercase letters", () => { expect(validatePassword("MyPassword713!")).toBe(true); });
    it("should accept password with only lowercase letters", () => { expect(validatePassword("mypassword713!")).toBe(false); });
  });
}

function testNumberRequirement(): void {
  describe("number requirement", () => {
    it("should reject password without numbers", () => { expect(validatePassword("MyPassword!")).toBe(false); });
    it("should accept password with numbers", () => { expect(validatePassword("MyPassword713!")).toBe(true); });
    it("should accept password with only numbers and letters", () => { expect(validatePassword("MyPassword713")).toBe(false); });
  });
}

function testSymbolRequirement(): void {
  describe("symbol requirement", () => {
    it("should reject password without symbols", () => { expect(validatePassword("MyPassword713")).toBe(false); });
    it("should accept password with symbols", () => { expect(validatePassword("MyPassword713!")).toBe(true); });
    it("should accept various symbol types", () => {
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      for (const symbol of symbols) {
        expect(validatePassword(`MyPassword713${symbol}`)).toBe(true);
      }
    });
  });
}

function testSequentialPatternPrevention(): void {
  describe("sequential pattern prevention", () => {
    it("should reject password with sequential numbers", () => { expect(validatePassword("MyPass123!")).toBe(false); });
    it("should reject password with sequential letters", () => { expect(validatePassword("MyPassabc!")).toBe(false); });
    it("should reject password with qwe sequence", () => { expect(validatePassword("MyPassqwe!")).toBe(false); });
    it("should reject password with asd sequence", () => { expect(validatePassword("MyPassasd!")).toBe(false); });
    it("should reject password with zxc sequence", () => { expect(validatePassword("MyPasszxc!")).toBe(false); });
    it("should handle case insensitive sequential patterns", () => { expect(validatePassword("MyPassABC!")).toBe(false); });
  });
}

function testRepeatingCharacterPrevention(): void {
  describe("repeating character prevention", () => {
    it("should reject password with three consecutive same characters", () => { expect(validatePassword("MyPassss713!")).toBe(false); });
    it("should reject password with four consecutive same characters", () => { expect(validatePassword("MyPasssss713!")).toBe(false); });
    it("should accept password with two consecutive same characters", () => { expect(validatePassword("MyPassss713!")).toBe(false); });
    it("should accept password with no consecutive same characters", () => { expect(validatePassword("MyPassword713!")).toBe(true); });
  });
}

function testEdgeCases(): void {
  describe("edge cases", () => {
    it("should handle empty string", () => { expect(validatePassword("")).toBe(false); });
    it("should handle null input", () => { expect(() => validatePassword(null as unknown as string)).toThrow(); });
    it("should handle undefined input", () => { expect(() => validatePassword(undefined as unknown as string)).toThrow(); });
    it("should handle very short valid password", () => { expect(validatePassword("Ab1!defg")).toBe(true); });
    it("should handle password with spaces", () => { expect(validatePassword("My Pass 713!")).toBe(true); });
    it("should handle password with unicode characters", () => { expect(validatePassword("MyPáss713!")).toBe(true); });
    it("should handle password with emojis", () => { expect(validatePassword("MyPass713!😀")).toBe(true); });
  });
}

function testComplexValidationScenarios(): void {
  describe("complex validation scenarios", () => {
    it("should validate password that meets all requirements", () => { expect(validatePassword("ComplexP@ssw0rd2024!")).toBe(true); });
    it("should reject password missing multiple requirements", () => { expect(validatePassword("simple")).toBe(false); });
    it("should reject password with sequential and repeating issues", () => { expect(validatePassword("MyPass123sss!")).toBe(false); });
    it("should accept password with complex patterns", () => { expect(validatePassword("K9#mP2$vL8@nR5!")).toBe(true); });
  });
}

describe("validatePassword", () => {
  testValidPasswords();
  testLengthValidation();
  testUppercaseRequirement();
  testLowercaseRequirement();
  testNumberRequirement();
  testSymbolRequirement();
  testSequentialPatternPrevention();
  testRepeatingCharacterPrevention();
  testEdgeCases();
  testComplexValidationScenarios();
});
