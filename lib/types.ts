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
  vehicleId: z.string().uuid("Invalid vehicle"),
  driverId: z.string().uuid("Invalid driver"),
  clientId: z.string().uuid("Invalid client"),
  vehicleTypeId: z.string().uuid("Invalid vehicle type"),
  date: z.string().min(2, "Date must be at least 2 characters"),
  location: z.string().min(2, "Start location must be at least 2 characters"),
  startTime: z.string().min(2, "Start time must be at least 2 characters"),
  ratePerHour: z.number(),
  amount: z.number(),
  notes: z.string().optional(),
});