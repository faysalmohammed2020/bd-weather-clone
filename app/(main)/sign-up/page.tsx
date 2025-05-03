"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Cloud,
  CloudRain,
  Sun,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion"; // Adjust the import path as needed
import { LocationProvider, useLocation } from "@/contexts/divisionContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { FormError } from "@/components/ui/form-error";

function SignUpFormWithLocation() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const router = useRouter();

  // Get location data from context
  const {
    selectedDivision,
    setSelectedDivision,
    selectedDistrict,
    setSelectedDistrict,
    selectedUpazila,
    setSelectedUpazila,
    divisions,
    districts,
    upazilas,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const division = selectedDivision?.name as string;
    const district = selectedDistrict?.name as string;
    const upazila = selectedUpazila?.name as string;

    await signUp.email(
      {
        name,
        email,
        role,
        password,
        district,
        division,
        upazila,
      },
      {
        onRequest: () => {
          setLoading(true);
          setFormError("");
        },
        onSuccess: () => {
          toast.success("Registration successful");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
        },
      }
    );

    setLoading(false);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-300/20 dark:bg-purple-700/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Floating weather icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        >
          <Cloud className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[15%]"
          animate={{ y: [0, -20, 0], rotate: [0, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
        >
          <CloudRain className="h-12 w-12 text-blue-500/40 dark:text-blue-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Sun className="h-14 w-14 text-amber-500/40 dark:text-amber-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[25%]"
          animate={{ y: [0, -15, 0], rotate: [0, -8, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        >
          <Droplets className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg"
      >
        <div className="flex justify-center mb-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
            <Cloud className="h-12 w-12 text-white absolute inset-0" />
          </div>
        </div>

        <motion.h1
          className="text-4xl text-center font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400"
          variants={fadeIn}
        >
          Create Account
        </motion.h1>
        <p className="text-center text-sm text-gray-500">
          Join us today! It&apos;s quick and easy.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="superadmin">Super Admin</option>
              <option value="divisionadmin">Division Admin</option>
              <option value="districtadmin">District Admin</option>
              <option value="upazilaadmin">Upazila Admin</option>
              <option value="dataentry">Data Entry</option>
            </select>
          </div>

          {/* Division Dropdown */}
          <div className="relative">
            <Label htmlFor="division">Division</Label>
            <select
              id="division"
              name="division"
              value={selectedDivision?.osmId || ""}
              onChange={(e) => {
                const divisionId = Number(e.target.value);
                const division =
                  divisions.find((d) => d.osmId === divisionId) || null;
                setSelectedDivision(division);
                setSelectedDistrict(null);
                setSelectedUpazila(null);
              }}
              className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
              required
              disabled={locationLoading || divisions.length === 0}
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.osmId} value={division.osmId}>
                  {division.name}
                </option>
              ))}
            </select>
            {locationLoading && divisions.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Loading divisions...</p>
            )}
          </div>

          {/* District Dropdown */}
          {selectedDivision && (
            <div className="relative">
              <Label htmlFor="district">District</Label>
              <select
                id="district"
                name="district"
                value={selectedDistrict?.osmId || ""}
                onChange={(e) => {
                  const districtId = Number(e.target.value);
                  const district =
                    districts.find((d) => d.osmId === districtId) || null;
                  setSelectedDistrict(district);
                  setSelectedUpazila(null);
                }}
                className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
                required
                disabled={locationLoading || districts.length === 0}
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.osmId} value={district.osmId}>
                    {district.name}
                  </option>
                ))}
              </select>
              {locationLoading && districts.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading districts...
                </p>
              )}
            </div>
          )}

          {/* Upazila Dropdown */}
          {selectedDistrict && (
            <div className="relative">
              <Label htmlFor="upazila">Upazila</Label>
              <select
                id="upazila"
                name="upazila"
                value={selectedUpazila?.osmId || ""}
                onChange={(e) => {
                  const upazilaId = Number(e.target.value);
                  const upazila =
                    upazilas.find((u) => u.osmId === upazilaId) || null;
                  setSelectedUpazila(upazila);
                }}
                className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
                required
                disabled={locationLoading || upazilas.length === 0}
              >
                <option value="">Select Upazila</option>
                {upazilas.map((upazila) => (
                  <option key={upazila.osmId} value={upazila.osmId}>
                    {upazila.name}
                  </option>
                ))}
              </select>
              {locationLoading && upazilas.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading upazilas...
                </p>
              )}
            </div>
          )}

          {locationError && (
            <p className="text-xs text-red-500">{locationError}</p>
          )}

          <div className="relative">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="terms" />
          <Label htmlFor="terms">
            I agree to the{" "}
            <a href="#" className="text-black underline">
              terms and conditions
            </a>
          </Label>
        </div>

        <FormError message={formError} />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
          disabled={loading || locationLoading}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          )}
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="font-medium text-blue-700 hover:underline"
          >
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}

// Wrap the form with LocationProvider
export default function SignUpForm() {
  return (
    <LocationProvider>
      <SignUpFormWithLocation />
    </LocationProvider>
  );
}
