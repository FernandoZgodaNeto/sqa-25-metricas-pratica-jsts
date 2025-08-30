const LOCAL_PART_MAX_LENGTH = 64;
const DOMAIN_MAX_LENGTH = 253;
const DOT = '.';

export class EmailUtils {
  private static validateEmailFormat(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  private static validateLocalPart(local: string): boolean {
    if (local.length > LOCAL_PART_MAX_LENGTH) { return false; }
    if (local.startsWith(DOT) || local.endsWith(DOT)) { return false; }
    if (local.includes(DOT + DOT)) { return false; }
    return true;
  }

  private static validateDomainPart(domain: string): boolean {
    if (domain.length > DOMAIN_MAX_LENGTH) { return false; }
    if (!domain.includes(DOT)) { return false; }
    if (domain.startsWith(DOT) || domain.endsWith(DOT)) { return false; }
    if (domain.includes(DOT + DOT)) { return false; }
    return true;
  }

  private static validateEmailParts(email: string): { local: string; domain: string } | null {
    const [local, domain] = email.split('@');
    if (!local || !domain) { return null; }
    return { local, domain };
  }

  public static validateEmail(email: string): boolean {
    if (typeof email !== 'string') { return false; }
    if (!this.validateEmailFormat(email)) { return false; }
    const parts = this.validateEmailParts(email);
    if (!parts) { return false; }
    if (!this.validateLocalPart(parts.local)) { return false; }
    if (!this.validateDomainPart(parts.domain)) { return false; }
    return true;
  }

  public static extractDomain(email: string): string | null {
    if (!this.validateEmail(email)) { return null; }
    const parts = email.split('@');
    return parts[1] || null;
  }

  public static extractLocalPart(email: string): string | null {
    if (!this.validateEmail(email)) { return null; }
    const parts = email.split('@');
    return parts[0] || null;
  }

  private static checkDomainMatch(emailDomain: string, targetDomain: string): boolean {
    if (emailDomain === targetDomain) { return true; }
    if (emailDomain.endsWith(DOT + targetDomain)) { return true; }
    return false;
  }

  private static checkSubdomainMatch(emailDomain: string, targetDomain: string): boolean {
    const emailParts = emailDomain.split(DOT);
    const domainParts = targetDomain.split(DOT);
    if (emailParts.length >= domainParts.length) {
      const temp = emailParts.slice(-domainParts.length);
      if (temp.join(DOT) === domainParts.join(DOT)) { return true; }
    }
    return false;
  }

  public static isFromDomain(email: string, domain: string): boolean {
    if (!this.validateEmail(email) || !domain) { return false; }
    const extractedDomain = this.extractDomain(email);
    if (!extractedDomain) { return false; }
    const emailDomain = extractedDomain.toLowerCase();
    const targetDomain = domain.toLowerCase();
    if (this.checkDomainMatch(emailDomain, targetDomain)) { return true; }
    if (this.checkSubdomainMatch(emailDomain, targetDomain)) { return true; }
    return false;
  }

  public static normalizeEmail(email: string): string {
    if (email === null || email === undefined) {
      throw new TypeError('Email cannot be null or undefined');
    }
    return email.trim().toLowerCase();
  }
}
