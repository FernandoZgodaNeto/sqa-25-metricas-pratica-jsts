const CNPJ_LENGTH = 14;
const FIRST_DIGIT_INDEX = 12;
const SECOND_DIGIT_INDEX = 13;
const DOT_POS_1 = 2;
const DOT_POS_2 = 5;
const SLASH_POS = 8;
const DASH_POS = 12;
const WEIGHTS1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const ELEVEN = 11;
const TWO = 2;

export class CNPJUtils {
  public static validateCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length !== CNPJ_LENGTH) { return false; }
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) { return false; }

    const calcDigit = (base: string, weights: number[]): number => {
      const sum = base
        .split("")
        .map((num, idx) => parseInt(num, 10) * weights[idx])
        .reduce((acc, val) => acc + val, 0);
      const remainder = sum % ELEVEN;
      return remainder < TWO ? 0 : ELEVEN - remainder;
    };

    const firstDigit = calcDigit(cleanCNPJ.slice(0, FIRST_DIGIT_INDEX), WEIGHTS1);
    const secondDigit = calcDigit(cleanCNPJ.slice(0, SECOND_DIGIT_INDEX), WEIGHTS2);

    return (
      parseInt(cleanCNPJ.charAt(FIRST_DIGIT_INDEX), 10) === firstDigit &&
      parseInt(cleanCNPJ.charAt(SECOND_DIGIT_INDEX), 10) === secondDigit
    );
  }

  public static maskCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== CNPJ_LENGTH) {
      throw new Error("CNPJ deve ter 14 dígitos");
    }
    return `${cleanCNPJ.slice(0, DOT_POS_1)}.${cleanCNPJ.slice(DOT_POS_1, DOT_POS_2)}.${cleanCNPJ.slice(DOT_POS_2, SLASH_POS)}/${cleanCNPJ.slice(SLASH_POS, DASH_POS)}-${cleanCNPJ.slice(DASH_POS, CNPJ_LENGTH)}`;
  }

  public static unmaskCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
  }

  public static generateValidCNPJ(): string {
    const generateRandomDigits = (length: number): string => {
      return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
    };
    let partialCNPJ = generateRandomDigits(FIRST_DIGIT_INDEX);
    const firstDigit = CNPJUtils.calculateVerifierDigit(partialCNPJ, true);
    partialCNPJ += firstDigit.toString();
    const secondDigit = CNPJUtils.calculateVerifierDigit(partialCNPJ, false);
    partialCNPJ += secondDigit.toString();
    return partialCNPJ;
  }

  private static calculateVerifierDigit(partialCNPJ: string, isFirstDigit: boolean): number {
    const weights = isFirstDigit ? WEIGHTS1 : WEIGHTS2;
    const sum = partialCNPJ
      .split("")
      .map((num, idx) => parseInt(num, 10) * weights[idx])
      .reduce((acc, val) => acc + val, 0);
    const remainder = sum % ELEVEN;
    return remainder < TWO ? 0 : ELEVEN - remainder;
  }

  public static isValidFormat(cnpj: string): boolean {
    const formats = [
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      /^\d{14}$/,
      /^\d{0,2}(\.\d{0,3})?(\.\d{0,3})?(\/\d{0,4})?(-\d{0,2})?$/
    ];
    return formats.some((regex) => regex.test(cnpj));
  }
}
