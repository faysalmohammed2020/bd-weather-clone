"use client";

import type React from "react";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  CloudRain,
  Sun,
  Droplets,
  Shield,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";

// Available roles
const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "station_admin", label: "Station Admin" },
  { value: "data_admin", label: "Data Admin" },
];

export default function SignInForm() {
  const [step, setStep] = useState<"security" | "credentials">("security");
  const [securityCode, setSecurityCode] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSecurityCodeSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to validate security code against database
      const response = await fetch("/api/auth/validate-security-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ securityCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setStep("credentials");
        // Set the role based on what's available for this security code
        if (data.availableRoles && data.availableRoles.length > 0) {
          setRole(data.availableRoles[0]);
        }
        setFormError("");
      } else {
        setFormError(
          data.message || "Invalid security code. Please try again."
        );
      }
    } catch (error) {
      console.error("Security code validation error:", error);
      setFormError(
        "An error occurred while validating the security code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!role) {
      setFormError("Please select a role");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn.email(
      {
        email,
        password,
        role,
        securityCode,
      },
      {
        onRequest: () => {
          setLoading(true);
          setFormError("");
        },
        onSuccess: () => {
          toast.success("Login successful");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          let errorMessage = ctx.error.message;

          // Customize error messages for better user experience
          if (
            errorMessage.includes("permission") ||
            errorMessage.includes("role")
          ) {
            errorMessage =
              "The selected role doesn't match your account permissions";
          } else if (errorMessage.includes("security code")) {
            errorMessage = "The security code doesn't match your account";
          }

          setFormError(errorMessage);
        },
      }
    );

    setLoading(false);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Animated background elements with deeper colors */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-300/20 dark:bg-purple-700/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Floating weather icons with enhanced animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Cloud className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[15%]"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <CloudRain className="h-12 w-12 text-blue-500/40 dark:text-blue-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sun className="h-14 w-14 text-amber-500/40 dark:text-amber-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[25%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Droplets className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
      </div>

      {/* Security Code Form (Step 1) */}
      {step === "security" && (
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          onSubmit={handleSecurityCodeSubmit}
          className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg"
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
            BD Weather
          </motion.h1>
          <p className="text-center text-sm text-gray-500">
            Enter your station security code to continue.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="securityCode" className="sr-only">
                Security Code
              </Label>
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="securityCode"
                name="securityCode"
                type="text"
                placeholder="Enter your station security code"
                className="pl-10"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                required
              />
            </div>
          </div>

          <FormError message={formError} />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
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
                Verifying...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </motion.form>
      )}

      {/* Credentials Form (Step 2) */}
      {step === "credentials" && (
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          onSubmit={handleCredentialsSubmit}
          className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg"
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
            BD Weather
          </motion.h1>
          <p className="text-center text-sm text-gray-500">
            Enter your credentials to continue.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <a href="#" className="text-sm text-black hover:underline">
              Forgot password
            </a>
          </div>

          <FormError message={formError} />

          <div className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
              disabled={loading}
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
              {loading ? "Signing..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setStep("security");
                setFormError("");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Security Code
            </Button>
          </div>

          {/* <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-700 hover:underline"
            >
              Create an account
            </Link>
          </p> */}
        </motion.form>
      )}
    </div>
  );
}
