const CPF_LENGTH = 11;
const FIRST_DIGIT_INDEX = 9;
const SECOND_DIGIT_INDEX = 10;
const DOT_POS_1 = 3;
const DOT_POS_2 = 6;
const DASH_POS = 9;
const ELEVEN = 11;
const TWO = 2;
const WEIGHTS1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS2 = [ELEVEN, 10, 9, 8, 7, 6, 5, 4, 3, 2];

export class CPFUtils {
  public static validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== CPF_LENGTH) { return false; }
  if (/^(\d)\1{10}$/.test(cleanCPF)) { return false; }

    const calcDigit = (base: string, weights: number[]): number => {
      const sum = base
        .split("")
        .map((num, idx) => parseInt(num, 10) * weights[idx])
        .reduce((acc, val) => acc + val, 0);
      const remainder = sum % ELEVEN;
      return remainder < TWO ? 0 : ELEVEN - remainder;
    };

    const firstDigit = calcDigit(cleanCPF.slice(0, 9), WEIGHTS1);
    const secondDigit = calcDigit(cleanCPF.slice(0, 10), WEIGHTS2);

    return (
      parseInt(cleanCPF.charAt(FIRST_DIGIT_INDEX), 10) === firstDigit &&
      parseInt(cleanCPF.charAt(SECOND_DIGIT_INDEX), 10) === secondDigit
    );
  }

  public static maskCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== CPF_LENGTH) {
      throw new Error(`CPF deve ter ${CPF_LENGTH} dígitos`);
    }
    return `${cleanCPF.slice(0, DOT_POS_1)}.${cleanCPF.slice(DOT_POS_1, DOT_POS_2)}.${cleanCPF.slice(DOT_POS_2, DASH_POS)}-${cleanCPF.slice(DASH_POS, CPF_LENGTH)}`;
  }

  public static unmaskCPF(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  public static generateValidCPF(): string {
    const generateRandomDigits = (length: number): string => {
      return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
    };
    let partialCPF = generateRandomDigits(FIRST_DIGIT_INDEX);
    const firstDigit = CPFUtils.calculateVerifierDigit(partialCPF, true);
    partialCPF += firstDigit.toString();
    const secondDigit = CPFUtils.calculateVerifierDigit(partialCPF, false);
    partialCPF += secondDigit.toString();
    return partialCPF;
  }

  private static calculateVerifierDigit(partialCPF: string, isFirstDigit: boolean): number {
    const weights = isFirstDigit ? WEIGHTS1 : WEIGHTS2;
    const sum = partialCPF
      .split("")
      .map((num, idx) => parseInt(num, 10) * weights[idx])
      .reduce((acc, val) => acc + val, 0);
    const remainder = sum % ELEVEN;
    return remainder < TWO ? 0 : ELEVEN - remainder;
  }

  public static isValidFormat(cpf: string): boolean {
    const formats = [
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      new RegExp(`^\\d{${CPF_LENGTH}}$`),
      /^\d{0,3}(\.\d{0,3})?(\.\d{0,3})?(-\d{0,2})?$/
    ];
    return formats.some((regex) => regex.test(cpf));
  }
}
