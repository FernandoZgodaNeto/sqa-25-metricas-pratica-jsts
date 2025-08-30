import { EmailUtils } from "../EmailUtils";

const EMAIL_LENGTH_65 = 65;
const EMAIL_LENGTH_254 = 254;

function testValidateEmailValid(): void {
  describe("validateEmail - valid cases", () => {
    it("should validate a valid email", () => { expect(EmailUtils.validateEmail("test@example.com")).toBe(true); });
    it("should validate email with subdomain", () => { expect(EmailUtils.validateEmail("user@sub.example.com")).toBe(true); });
    it("should validate email with numbers", () => { expect(EmailUtils.validateEmail("user123@example123.com")).toBe(true); });
    it("should validate email with special characters", () => { expect(EmailUtils.validateEmail("user.name+tag@example.com")).toBe(true); });
  });
}

function testValidateEmailInvalid(): void {
  describe("validateEmail - invalid cases", () => {
    it("should reject email without @ symbol", () => { expect(EmailUtils.validateEmail("testexample.com")).toBe(false); });
    it("should reject email without domain", () => { expect(EmailUtils.validateEmail("test@")).toBe(false); });
    it("should reject email without local part", () => { expect(EmailUtils.validateEmail("@example.com")).toBe(false); });
    it("should reject email with invalid characters", () => { expect(EmailUtils.validateEmail("test@example..com")).toBe(false); });
    it("should reject email starting with dot", () => { expect(EmailUtils.validateEmail(".test@example.com")).toBe(false); });
    it("should reject email ending with dot", () => { expect(EmailUtils.validateEmail("test.@example.com")).toBe(false); });
  });
}

function testValidateEmailEdgeCases(): void {
  describe("validateEmail - edge cases", () => {
    it("should reject email with domain starting with dot", () => { expect(EmailUtils.validateEmail("test@.example.com")).toBe(false); });
    it("should reject email with domain ending with dot", () => { expect(EmailUtils.validateEmail("test@example.com.")).toBe(false); });
    it("should handle empty string", () => { expect(EmailUtils.validateEmail("")).toBe(false); });
    it("should handle null input", () => { expect(EmailUtils.validateEmail(null as unknown as string)).toBe(false); });
    it("should handle undefined input", () => { expect(EmailUtils.validateEmail(undefined as unknown as string)).toBe(false); });
  });
}

function testExtractDomain(): void {
  describe("extractDomain", () => {
    it("should extract domain from valid email", () => { expect(EmailUtils.extractDomain("test@example.com")).toBe("example.com"); });
    it("should extract domain with subdomain", () => { expect(EmailUtils.extractDomain("user@sub.example.com")).toBe("sub.example.com"); });
    it("should return null for invalid email", () => { expect(EmailUtils.extractDomain("invalid-email")).toBeNull(); });
    it("should handle email with multiple @ symbols", () => { expect(EmailUtils.extractDomain("user@@example.com")).toBeNull(); });
    it("should handle null input", () => { expect(EmailUtils.extractDomain(null as unknown as string)).toBeNull(); });
    it("should handle undefined input", () => { expect(EmailUtils.extractDomain(undefined as unknown as string)).toBeNull(); });
  });
}

function testExtractLocalPart(): void {
  describe("extractLocalPart", () => {
    it("should extract local part from valid email", () => { expect(EmailUtils.extractLocalPart("test@example.com")).toBe("test"); });
    it("should extract local part with dots", () => { expect(EmailUtils.extractLocalPart("first.last@example.com")).toBe("first.last"); });
    it("should return null for invalid email", () => { expect(EmailUtils.extractLocalPart("invalid-email")).toBeNull(); });
    it("should handle email with multiple @ symbols", () => { expect(EmailUtils.extractLocalPart("user@@example.com")).toBeNull(); });
    it("should handle null input", () => { expect(EmailUtils.extractLocalPart(null as unknown as string)).toBeNull(); });
    it("should handle undefined input", () => { expect(EmailUtils.extractLocalPart(undefined as unknown as string)).toBeNull(); });
  });
}

function testIsFromDomainBasic(): void {
  describe("isFromDomain - basic cases", () => {
    it("should return true for exact domain match", () => { expect(EmailUtils.isFromDomain("test@example.com", "example.com")).toBe(true); });
    it("should return true for subdomain match", () => { expect(EmailUtils.isFromDomain("user@sub.example.com", "example.com")).toBe(true); });
    it("should return false for different domain", () => { expect(EmailUtils.isFromDomain("test@example.com", "different.com")).toBe(false); });
    it("should return false for invalid email", () => { expect(EmailUtils.isFromDomain("invalid-email", "example.com")).toBe(false); });
    it("should return false for empty domain", () => { expect(EmailUtils.isFromDomain("test@example.com", "")).toBe(false); });
    it("should handle case insensitive comparison", () => { expect(EmailUtils.isFromDomain("test@EXAMPLE.COM", "example.com")).toBe(true); });
  });
}

function testIsFromDomainEdgeCases(): void {
  describe("isFromDomain - edge cases", () => {
    it("should handle null email input", () => { expect(EmailUtils.isFromDomain(null as unknown as string, "example.com")).toBe(false); });
    it("should handle undefined email input", () => { expect(EmailUtils.isFromDomain(undefined as unknown as string, "example.com")).toBe(false); });
    it("should handle null domain input", () => { expect(EmailUtils.isFromDomain("test@example.com", null as unknown as string)).toBe(false); });
    it("should handle undefined domain input", () => { expect(EmailUtils.isFromDomain("test@example.com", undefined as unknown as string)).toBe(false); });
  });
}

function testNormalizeEmail(): void {
  describe("normalizeEmail", () => {
    it("should normalize email to lowercase", () => { expect(EmailUtils.normalizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com"); });
    it("should trim whitespace", () => { expect(EmailUtils.normalizeEmail("  test@example.com  ")).toBe("test@example.com"); });
    it("should handle mixed case", () => { expect(EmailUtils.normalizeEmail("TeSt@ExAmPlE.CoM")).toBe("test@example.com"); });
    it("should handle email with spaces", () => { expect(EmailUtils.normalizeEmail(" USER@DOMAIN.COM ")).toBe("user@domain.com"); });
    it("should handle null input", () => { expect(() => EmailUtils.normalizeEmail(null as unknown as string)).toThrow(); });
    it("should handle undefined input", () => { expect(() => EmailUtils.normalizeEmail(undefined as unknown as string)).toThrow(); });
  });
}

function testEdgeCases(): void {
  describe("edge cases", () => {
    it("should handle very long emails", () => { expect(EmailUtils.validateEmail("a".repeat(EMAIL_LENGTH_65) + "@example.com")).toBe(false); });
    it("should handle very long domains", () => { expect(EmailUtils.validateEmail(`test@${"a".repeat(EMAIL_LENGTH_254)}.com`)).toBe(false); });
    it("should handle special characters in local part", () => { expect(EmailUtils.validateEmail("test.email+tag@example.com")).toBe(true); });
    it("should handle consecutive dots in local part", () => { expect(EmailUtils.validateEmail("test..email@example.com")).toBe(false); });
    it("should handle consecutive dots in domain", () => { expect(EmailUtils.validateEmail("test@example..com")).toBe(false); });
  });
}

describe("EmailUtils", () => {
  testValidateEmailValid();
  testValidateEmailInvalid();
  testValidateEmailEdgeCases();
  testExtractDomain();
  testExtractLocalPart();
  testIsFromDomainBasic();
  testIsFromDomainEdgeCases();
  testNormalizeEmail();
  testEdgeCases();
});