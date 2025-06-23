import { MAX_FILE_SIZE } from '../constants';

export function validateFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return 'Please select a valid CSV file';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 10MB';
  }
  return null;
} 