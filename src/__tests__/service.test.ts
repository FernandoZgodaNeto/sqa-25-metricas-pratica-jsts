import { service } from "../service";
import { EmailUtils } from "../EmailUtils";
import { CNPJUtils } from "../CNPJUtils";
import { validatePassword } from "../passwordUtils";

jest.mock("../EmailUtils");
jest.mock("../CNPJUtils");
jest.mock("../passwordUtils");

const mockEmailUtils = EmailUtils as jest.Mocked<typeof EmailUtils>;
const mockCNPJUtils = CNPJUtils as jest.Mocked<typeof CNPJUtils>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;

function setupSuccessfulMocks(): void {
  mockEmailUtils.validateEmail.mockReturnValue(true);
  mockValidatePassword.mockReturnValue(true);
  mockCNPJUtils.validateCNPJ.mockReturnValue(true);
  mockEmailUtils.normalizeEmail.mockReturnValue("test@example.com");
  mockEmailUtils.extractDomain.mockReturnValue("example.com");
  mockEmailUtils.isFromDomain.mockReturnValue(true);
  mockCNPJUtils.maskCNPJ.mockReturnValue("11.222.333/0001-81");
  mockCNPJUtils.unmaskCNPJ.mockReturnValue("11222333000181");
  mockCNPJUtils.isValidFormat.mockReturnValue(true);
  mockCNPJUtils.generateValidCNPJ.mockReturnValue("99888777000166");
}

function testSuccessfulExecution(): void {
  describe("successful execution", () => {
    beforeEach(() => { setupSuccessfulMocks(); });
    it("should execute successfully with valid inputs", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.success).toBe(true);
      expect(result.message).toBe("Serviço executado com sucesso");
      expect(result.timestamp).toBeDefined();
    });
    it("should process user data correctly", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.processed).toEqual({ normalizedEmail: "test@example.com", domain: "example.com", isFromSpecificDomain: true, maskedCNPJ: "11.222.333/0001-81", unmaskedCNPJ: "11222333000181", cnpjFormatValid: true });
    });
    it("should generate test data", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.test).toEqual({ testCNPJ: "99888777000166", testEmail: expect.stringMatching(/teste\.\d+@empresa\.com/), testPassword: "Teste123!@#" });
    });
    it("should process batch data", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.batch).toHaveLength(2);
      expect((result.data?.batch as Record<string, unknown>[])?.[0]?.isValid).toBe(true);
    });
  });
}

function testValidationFailures(): void {
  describe("validation failures", () => {
    it("should fail when email is invalid", () => {
      mockEmailUtils.validateEmail.mockReturnValue(false);
      mockValidatePassword.mockReturnValue(true);
      mockCNPJUtils.validateCNPJ.mockReturnValue(true);
      const result = service("invalid-email", "Password123!", "11222333000181");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Dados inválidos");
    });
    it("should fail when password is invalid", () => {
      mockEmailUtils.validateEmail.mockReturnValue(true);
      mockValidatePassword.mockReturnValue(false);
      mockCNPJUtils.validateCNPJ.mockReturnValue(true);
      const result = service("test@example.com", "weak", "11222333000181");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Dados inválidos");
    });
    it("should fail when CNPJ is invalid", () => {
      mockEmailUtils.validateEmail.mockReturnValue(true);
      mockValidatePassword.mockReturnValue(true);
      mockCNPJUtils.validateCNPJ.mockReturnValue(false);
      const result = service("test@example.com", "Password123!", "invalid-cnpj");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Dados inválidos");
    });
  });
}

function testReportsAndAudits(): void {
  describe("reports and audits", () => {
    beforeEach(() => { setupSuccessfulMocks(); });
    it("should generate report", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.report).toEqual({ timestamp: expect.any(String), totalRecords: 2, validRecords: 2, invalidRecords: 0, apiCalls: 4, domain: "example.com", isFromSpecificDomain: true });
    });
    it("should create backup", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.backup).toEqual({ timestamp: expect.any(String), data: expect.any(Array), checksum: expect.any(Number), originalInput: { email: "test@example.com", password: "Password123!", cnpj: "11222333000181" } });
    });
    it("should validate integrity", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.integrity).toEqual({ isValid: true, errors: [], totalChecks: 3 });
    });
    it("should perform audit", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.audit).toEqual({ timestamp: expect.any(String), suspiciousEmails: 2, duplicateCNPJs: 1, totalOperations: 9 });
    });
    it("should export data", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.data?.exported).toEqual({ format: "json", content: expect.any(String), size: expect.any(Number) });
    });
    it("should return correct summary", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      expect(result.summary).toEqual({ totalProcessed: 2, validRecords: 2, invalidRecords: 0, apiCalls: 4, backupCreated: true, integrityValid: true, auditCompleted: true, dataExported: true });
    });
  });
}

function testConsoleLogging(): void {
  describe("console logging", () => {
    it("should log service start", () => {
      setupSuccessfulMocks();
      jest.spyOn(console, "warn").mockImplementation(() => {});
      service("test@example.com", "Password123!", "11222333000181");
      expect(console.warn).toHaveBeenCalledWith("Iniciando serviço...");
    });
    it("should log validation failures", () => {
      mockEmailUtils.validateEmail.mockReturnValue(false);
      jest.spyOn(console, "warn").mockImplementation(() => {});
      service("invalid-email", "Password123!", "11222333000181");
      expect(console.warn).toHaveBeenCalledWith("Dados inválidos detectados");
    });
  });
}

function testInputHandling(): void {
  describe("input handling", () => {
    it("should handle null inputs", () => {
      mockEmailUtils.validateEmail.mockReturnValue(false);
      const result = service(null as unknown as string, "Password123!", "11222333000181");
      expect(result.success).toBe(false);
    });
    it("should handle undefined inputs", () => {
      mockEmailUtils.validateEmail.mockReturnValue(false);
      const result = service(undefined as unknown as string, "Password123!", "11222333000181");
      expect(result.success).toBe(false);
    });
    it("should handle empty string inputs", () => {
      mockEmailUtils.validateEmail.mockReturnValue(false);
      const result = service("", "Password123!", "11222333000181");
      expect(result.success).toBe(false);
    });
  });
}

function testDataProcessing(): void {
  describe("data processing", () => {
    beforeEach(() => { setupSuccessfulMocks(); });
    it("should call all utility functions with correct parameters", () => {
      service("test@example.com", "Password123!", "11222333000181");
      expect(mockEmailUtils.validateEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockValidatePassword).toHaveBeenCalledWith("Password123!");
      expect(mockCNPJUtils.validateCNPJ).toHaveBeenCalledWith("11222333000181");
      expect(mockEmailUtils.normalizeEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockEmailUtils.extractDomain).toHaveBeenCalledWith("test@example.com");
      expect(mockEmailUtils.isFromDomain).toHaveBeenCalledWith("test@example.com", "empresa.com");
      expect(mockCNPJUtils.maskCNPJ).toHaveBeenCalledWith("11222333000181");
      expect(mockCNPJUtils.unmaskCNPJ).toHaveBeenCalledWith("11.222.333/0001-81");
      expect(mockCNPJUtils.isValidFormat).toHaveBeenCalledWith("11.222.333/0001-81");
      expect(mockCNPJUtils.generateValidCNPJ).toHaveBeenCalled();
    });
    it("should process batch data correctly", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      const batch = result.data?.batch as Record<string, unknown>[];
      expect(batch).toHaveLength(2);
      expect(batch?.[0]?.originalData).toEqual({ email: "test@example.com", password: "Password123!", cnpj: "11222333000181" });
      expect(batch?.[0]?.isValid).toBe(true);
    });
    it("should process test data in batch correctly", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      const batch = result.data?.batch as Record<string, unknown>[];
      const testDataItem = batch?.[1];
      const testOriginalData = testDataItem?.originalData as Record<string, unknown>;
      expect(testOriginalData?.email).toMatch(/teste\.\d+@empresa\.com/);
      expect(testOriginalData?.password).toBe("Teste123!@#");
    });
    it("should validate test data cnpj and status", () => {
      const result = service("test@example.com", "Password123!", "11222333000181");
      const batch = result.data?.batch as Record<string, unknown>[];
      const testDataItem = batch?.[1];
      const testOriginalData = testDataItem?.originalData as Record<string, unknown>;
      expect(testOriginalData?.cnpj).toBe("99888777000166");
      expect(testDataItem?.isValid).toBe(true);
    });
  });
}

describe("service", () => {
  beforeEach(() => { jest.clearAllMocks(); jest.spyOn(console, "log").mockImplementation(() => {}); });
  afterEach(() => { jest.restoreAllMocks(); });
  testSuccessfulExecution();
  testValidationFailures();
  testReportsAndAudits();
  testConsoleLogging();
  testInputHandling();
  testDataProcessing();
});
