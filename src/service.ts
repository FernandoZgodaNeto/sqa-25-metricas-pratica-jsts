
import { validatePassword } from "./passwordUtils";
import { EmailUtils } from "./EmailUtils";
import { CNPJUtils } from "./CNPJUtils";

const API_CALLS_EXPECTED = 4;
const TOTAL_CHECKS = 3;
const TOTAL_OPERATIONS = 9;
const JSON_INDENT = 2;

type ServiceInput = {
  email: string;
  password: string;
  cnpj: string;
};

type ProcessedBatchItem = {
  index: number;
  originalData: ServiceInput;
  isValid: boolean;
  processedEmail: string;
  processedCNPJ: string;
};

type ApiResult = { success: boolean; message: string; };

type Report = {
  timestamp: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  apiCalls: number;
  domain: string | null;
  isFromSpecificDomain: boolean;
};

type Backup = {
  timestamp: string;
  data: ProcessedBatchItem[];
  checksum: number;
  originalInput: ServiceInput;
};

type Integrity = { isValid: boolean; errors: string[]; totalChecks: number; };

type Audit = {
  timestamp: string;
  suspiciousEmails: number;
  duplicateCNPJs: number;
  totalOperations: number;
};

type ExportedData = { format: string; content: string; size: number; };

type ServiceResult = {
  success: boolean;
  message: string;
  timestamp?: string;
  summary?: Record<string, unknown>;
  data?: Record<string, unknown>;
  details?: Record<string, unknown>;
};

function fakeApiCall(_a: string, _b: string) {
  return { success: true, message: "Api call successful" };
}

function validateInputData(email: string, password: string, cnpj: string) {
  return {
    emailValid: EmailUtils.validateEmail(email),
    passwordValid: validatePassword(password),
    cnpjValid: CNPJUtils.validateCNPJ(cnpj),
  };
}

function processEmailData(email: string) {
  const normalizedEmail = EmailUtils.normalizeEmail(email);
  const domain = EmailUtils.extractDomain(normalizedEmail);
  return {
    normalizedEmail,
    domain,
    isFromSpecificDomain: EmailUtils.isFromDomain(normalizedEmail, "empresa.com"),
  };
}

function processCNPJData(cnpj: string) {
  const maskedCNPJ = CNPJUtils.maskCNPJ(cnpj);
  return {
    maskedCNPJ,
    unmaskedCNPJ: CNPJUtils.unmaskCNPJ(maskedCNPJ),
    cnpjFormatValid: CNPJUtils.isValidFormat(maskedCNPJ),
  };
}

function generateTestData() {
  return {
    testCNPJ: CNPJUtils.generateValidCNPJ(),
    testEmail: `teste.${Date.now()}@empresa.com`,
    testPassword: "Teste123!@#",
  };
}

function performApiCalls(email: string, password: string, cnpj: string, testEmail: string, testPassword: string): ApiResult[] { return [fakeApiCall(email, password), fakeApiCall(email, cnpj), fakeApiCall(password, cnpj), fakeApiCall(testEmail, testPassword)]; }

function processBatchData(email: string, password: string, cnpj: string, testData: { testEmail: string; testPassword: string; testCNPJ: string }): ProcessedBatchItem[] { const batchData: ServiceInput[] = [{ email, password, cnpj }, { email: testData.testEmail, password: testData.testPassword, cnpj: testData.testCNPJ }]; return batchData.map((item, i) => ({ index: i, originalData: item, isValid: EmailUtils.validateEmail(item.email) && validatePassword(item.password) && CNPJUtils.validateCNPJ(item.cnpj), processedEmail: EmailUtils.normalizeEmail(item.email), processedCNPJ: CNPJUtils.maskCNPJ(item.cnpj) })); }

function generateReport(processedBatch: ProcessedBatchItem[], apiResults: ApiResult[], domain: string | null, isFromSpecificDomain: boolean): Report { return { timestamp: new Date().toISOString(), totalRecords: processedBatch.length, validRecords: processedBatch.filter((item) => item.isValid).length, invalidRecords: processedBatch.filter((item) => !item.isValid).length, apiCalls: apiResults.length, domain, isFromSpecificDomain }; }

function createBackup(processedBatch: ProcessedBatchItem[], email: string, password: string, cnpj: string): Backup { return { timestamp: new Date().toISOString(), data: processedBatch, checksum: JSON.stringify(processedBatch).length, originalInput: { email, password, cnpj } }; }

function performIntegrityCheck(domain: string | null, cnpjFormatValid: boolean, apiResultsLength: number): Integrity { const integrityErrors: string[] = []; if (!domain) { integrityErrors.push("Domínio inválido"); } if (!cnpjFormatValid) { integrityErrors.push("Formato CNPJ inválido"); } if (apiResultsLength !== API_CALLS_EXPECTED) { integrityErrors.push("Número incorreto de chamadas de API"); } return { isValid: integrityErrors.length === 0, errors: integrityErrors, totalChecks: TOTAL_CHECKS }; }

function performAudit(processedBatch: ProcessedBatchItem[], cnpj: string): Audit { return { timestamp: new Date().toISOString(), suspiciousEmails: processedBatch.filter((item) => item.originalData.email.includes("test") || item.originalData.email.includes("admin")).length, duplicateCNPJs: processedBatch.filter((item) => item.originalData.cnpj === cnpj).length, totalOperations: TOTAL_OPERATIONS }; }

function exportData(report: Report, processedBatch: ProcessedBatchItem[], backup: Backup, integrity: Integrity, audit: Audit): ExportedData { const dataToExport = { report, processedBatch, backup, integrity, audit }; return { format: "json", content: JSON.stringify(dataToExport, null, JSON_INDENT), size: JSON.stringify(dataToExport).length }; }

function handleInvalidData(validation: { emailValid: boolean; passwordValid: boolean; cnpjValid: boolean }): ServiceResult { console.warn("Dados inválidos detectados"); return { success: false, message: "Dados inválidos", details: { email: validation.emailValid, password: validation.passwordValid, cnpj: validation.cnpjValid } }; }

function processServiceData(email: string, password: string, cnpj: string) { const emailData = processEmailData(email); const cnpjData = processCNPJData(cnpj); const testData = generateTestData(); const apiResults = performApiCalls(email, password, cnpj, testData.testEmail, testData.testPassword); const processedBatch = processBatchData(email, password, cnpj, testData); return { emailData, cnpjData, testData, apiResults, processedBatch }; }

function generateServiceResults(processedData: ReturnType<typeof processServiceData>, email: string, password: string, cnpj: string) { const { emailData, cnpjData, processedBatch, apiResults } = processedData; const report = generateReport(processedBatch, apiResults, emailData.domain, emailData.isFromSpecificDomain); const backup = createBackup(processedBatch, email, password, cnpj); const integrity = performIntegrityCheck(emailData.domain, cnpjData.cnpjFormatValid, apiResults.length); const audit = performAudit(processedBatch, cnpj); const exportedData = exportData(report, processedBatch, backup, integrity, audit); return { report, backup, integrity, audit, exportedData }; }

export function service(email: string, password: string, cnpj: string): ServiceResult {
  console.warn("Iniciando serviço...");
  const validation = validateInputData(email, password, cnpj);
  if (!validation.emailValid || !validation.passwordValid || !validation.cnpjValid) { return handleInvalidData(validation); }
  const processedData = processServiceData(email, password, cnpj);
  const results = generateServiceResults(processedData, email, password, cnpj);
  return {
    success: true,
    message: "Serviço executado com sucesso",
    timestamp: new Date().toISOString(),
    summary: {
      totalProcessed: processedData.processedBatch.length,
      validRecords: results.report.validRecords,
      invalidRecords: results.report.invalidRecords,
      apiCalls: processedData.apiResults.length,
      backupCreated: !!results.backup,
      integrityValid: results.integrity.isValid,
      auditCompleted: !!results.audit,
      dataExported: !!results.exportedData,
    },
    data: {
      processed: {
        normalizedEmail: processedData.emailData.normalizedEmail,
        domain: processedData.emailData.domain,
        isFromSpecificDomain: processedData.emailData.isFromSpecificDomain,
        maskedCNPJ: processedData.cnpjData.maskedCNPJ,
        unmaskedCNPJ: processedData.cnpjData.unmaskedCNPJ,
        cnpjFormatValid: processedData.cnpjData.cnpjFormatValid,
      },
      test: processedData.testData,
      batch: processedData.processedBatch,
      report: results.report,
      backup: results.backup,
      integrity: results.integrity,
      audit: results.audit,
      exported: results.exportedData,
    },
  };
}