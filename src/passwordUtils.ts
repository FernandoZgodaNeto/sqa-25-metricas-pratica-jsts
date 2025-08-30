
const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const SEQUENTIAL_PATTERNS = [/123/, /abc/, /qwe/, /asd/, /zxc/];

function checkLengthViolations(password: string): string[] {
  const violations: string[] = [];
  if (password.length < MIN_LENGTH) {
    violations.push(`Senha deve ter pelo menos ${MIN_LENGTH} caracteres`);
  }
  if (password.length > MAX_LENGTH) {
    violations.push(`Senha deve ter no máximo ${MAX_LENGTH} caracteres`);
  }
  return violations;
}

function checkCharacterViolations(password: string): string[] {
  const violations: string[] = [];
  if (!/[A-Z]/.test(password)) {
    violations.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    violations.push('Senha deve conter pelo menos uma letra minúscula');
  }
  if (!/\d/.test(password)) {
    violations.push('Senha deve conter pelo menos um número');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    violations.push('Senha deve conter pelo menos um caractere especial');
  }
  return violations;
}

function checkPatternViolations(password: string): string[] {
  const violations: string[] = [];
  if (SEQUENTIAL_PATTERNS.some((pattern) => pattern.test(password.toLowerCase()))) {
    violations.push('Senha não deve conter sequências');
  }
  if (/(.)\1{2,}/.test(password)) {
    violations.push('Senha não deve ter caracteres repetidos em excesso');
  }
  return violations;
}

export function validatePassword(password: string): boolean {
  if (password === null || password === undefined) {
    throw new TypeError('Password cannot be null or undefined');
  }
  if (typeof password !== 'string') { return false; }

  const lengthViolations = checkLengthViolations(password);
  const characterViolations = checkCharacterViolations(password);
  const patternViolations = checkPatternViolations(password);

  const totalViolations = [...lengthViolations, ...characterViolations, ...patternViolations];
  return totalViolations.length === 0;
}
