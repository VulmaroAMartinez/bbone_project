export function canCreateWorkOrder(description: string): boolean {
  return description.trim().length > 0;
}

export function canCloseWorkOrder(input: {
  isAveria: boolean;
  cause?: string;
  actionTaken?: string;
  downtimeMinutes?: number | null;
  observations?: string;
}): boolean {
  if (input.isAveria) {
    return (
      (input.cause?.trim().length ?? 0) > 0 &&
      (input.actionTaken?.trim().length ?? 0) > 0 &&
      typeof input.downtimeMinutes === 'number' &&
      input.downtimeMinutes >= 0
    );
  }

  return (input.observations?.trim().length ?? 0) > 0;
}
