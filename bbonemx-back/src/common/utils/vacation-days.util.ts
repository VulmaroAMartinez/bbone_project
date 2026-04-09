interface VacationBracket {
  minYear: number;
  maxYear: number;
  days: number;
}

const VACATION_BRACKETS: VacationBracket[] = [
  { minYear: 1, maxYear: 1, days: 12 },
  { minYear: 2, maxYear: 2, days: 14 },
  { minYear: 3, maxYear: 3, days: 16 },
  { minYear: 4, maxYear: 4, days: 18 },
  { minYear: 5, maxYear: 5, days: 20 },
  { minYear: 6, maxYear: 10, days: 22 },
  { minYear: 11, maxYear: 15, days: 24 },
  { minYear: 16, maxYear: 20, days: 26 },
  { minYear: 21, maxYear: 25, days: 28 },
  { minYear: 26, maxYear: 30, days: 30 },
  { minYear: 31, maxYear: 35, days: 32 },
];

/**
 * Calculates the number of vacation days earned based on anniversary-based seniority.
 *
 * @param hireDate - The technician's hire date
 * @param referenceDate - The date to calculate against (defaults to today; injectable for testing)
 * @returns Number of vacation days, or 0 if hireDate is in the future or < 1 year
 */
export function calculateVacationDays(
  hireDate: Date,
  referenceDate: Date = new Date(),
): number {
  const hire = new Date(
    Date.UTC(hireDate.getFullYear(), hireDate.getMonth(), hireDate.getDate()),
  );
  const ref = new Date(
    Date.UTC(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    ),
  );

  if (hire >= ref) return 0;

  // Count completed years of service (anniversary-based)
  let completedYears = ref.getUTCFullYear() - hire.getUTCFullYear();

  // If the anniversary hasn't occurred yet this year, subtract one year
  const anniversaryThisYear = new Date(
    Date.UTC(ref.getUTCFullYear(), hire.getUTCMonth(), hire.getUTCDate()),
  );
  if (ref < anniversaryThisYear) {
    completedYears -= 1;
  }

  if (completedYears < 1) return 0;

  const bracket = VACATION_BRACKETS.find(
    (b) => completedYears >= b.minYear && completedYears <= b.maxYear,
  );

  // For seniority beyond 35 years, keep the maximum
  if (!bracket) return 32;

  return bracket.days;
}
