import { SocketAddress } from "net";
import z from "zod";

export const CreateUserSchema = z.object({
  name: z.string().max(100),
  email: z
    .string()
    .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
    .toLowerCase(),
  password: z.string(),
  companyName: z.string(),
  contactNo: z.string(),
  address: z.string()
});

export const LoginSchema = z.object({
  contactNo: z.string(),
  password: z.string(),
});

export const CreateVehicleTypeSchema = z.object({
  name:z.string().max(100),
  description:z.string().max(500),
});

export const CreateVehicleSchema = z.object({
  model: z.string().min(2, "Model must be at least 2 characters"),
  registrationNo: z.string().min(1, "Registration number is required"),
  vehicleTypeId: z.string().uuid("Invalid vehicle type"),
  insuranceExpiry: z.string().optional(), 
});

export const CreateDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  address: z.string().min(2, "Address must be at least 2 characters"),
  contactNo: z.string().min(2, "Contact number must be at least 2 characters").max(10, "Contact number must be at most 10 characters"),
  licenseNo: z.string().min(2, "License number must be at least 2 characters"),
  joiningDate: z.string().min(2, "Joining date must be at least 2 characters"),
});

export const CreateJobSchema = z.object({
  vehicleId: z.string().min(1, "Invalid vehicle"),
  driverId: z.string().min(1, "Invalid driver"),
  clientId: z.string().min(1, "Invalid client"),
  vehicleTypeId: z.string().min(1, "Invalid vehicle type"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  totalHours: z.number().min(0, "Total hours must be positive"),
  ratePerHour: z.number().min(0, "Rate per hour must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
  notes: z.string().optional(),
  challanNo: z.string().min(1, "Challan number is required"),
});