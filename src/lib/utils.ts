import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR_PENDING = 'DOCTOR_PENDING',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  institutionId?: string;
  createdAt: any;
  // Doctor application fields
  medicalLicenseId?: string;
  specialization?: string;
  requestedInstitutionName?: string;
  // Patient health profile
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: string;
  weight?: string;
  profileCompleted?: boolean;
  address?: string;
  photoURL?: string;
}

export interface Prescription {
  id?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  institutionId: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
  notes: string;
  version: number;
  parentPrescriptionId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Institution {
  id?: string;
  name: string;
  address: string;
}

export interface QueueEntry {
  id?: string;
  patientId: string;
  patientName: string;
  institutionId: string;
  status: QueueStatus;
  createdAt: any;
}
