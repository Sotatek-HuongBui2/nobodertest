import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  const saltOrRounds = 10;
  return bcrypt.hash(password, saltOrRounds);
}

export async function hashMatching(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
