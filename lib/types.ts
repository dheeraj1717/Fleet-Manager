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