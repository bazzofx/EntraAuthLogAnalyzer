/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const DATE_FORMAT = 'dd/MM/yyyy HH:mm:ss';

export const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), DATE_FORMAT);
  } catch (e) {
    return dateStr;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
