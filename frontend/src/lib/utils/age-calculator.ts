// File: frontend/src/lib/utils/age-calculator.ts
// Utility to calculate and display age from date of birth

/**
 * Calculate age in years from date of birth
 * Returns exact age including partial years
 */
export function calculateAge(dateOfBirth: Date | string | null): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age < 0 ? null : age;
}

/**
 * Format age for display
 * Returns "XX years" or "XX years, Y months" depending on exactness needed
 */
export function formatAge(dateOfBirth: Date | string | null, exactFormat: boolean = false): string {
  if (!dateOfBirth) return 'Age not set';

  const dob = new Date(dateOfBirth);
  const today = new Date();

  if (isNaN(dob.getTime())) return 'Invalid date';

  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years--;
  }

  if (years < 0) return 'Not born yet';

  if (exactFormat) {
    // Calculate exact months
    let months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
    if (today.getDate() < dob.getDate()) {
      months--;
    }
    if (months < 0) months = 11;

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''}`;
}

/**
 * Format date of birth for display
 * Returns formatted date like "Jan 15, 1990"
 */
export function formatDateOfBirth(dateOfBirth: Date | string | null, locale: string = 'en'): string {
  if (!dateOfBirth) return 'Not provided';

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 'Invalid date';

  if (locale === 'gu') {
    // Gujarati format: દિવસ મહિનો વર્ષ
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return dob.toLocaleDateString('gu-IN', options);
  } else if (locale === 'hi') {
    // Hindi format
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return dob.toLocaleDateString('hi-IN', options);
  }

  // English format: Month Day, Year
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return dob.toLocaleDateString('en-US', options);
}

/**
 * Get age category (for UI purposes)
 */
export function getAgeCategory(dateOfBirth: Date | string | null): string {
  const age = calculateAge(dateOfBirth);
  if (age === null) return 'unknown';
  if (age < 1) return 'infant';
  if (age < 13) return 'child';
  if (age < 20) return 'teenager';
  if (age < 65) return 'adult';
  return 'senior';
}

/**
 * Check if person's birthday is today
 */
export function isBirthdayToday(dateOfBirth: Date | string | null): boolean {
  if (!dateOfBirth) return false;

  const dob = new Date(dateOfBirth);
  const today = new Date();

  return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
}

/**
 * Get days until next birthday
 */
export function daysUntilBirthday(dateOfBirth: Date | string | null): number | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  const today = new Date();

  // Create date of next birthday
  let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

  // If birthday already passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }

  const daysLeft = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysLeft;
}
