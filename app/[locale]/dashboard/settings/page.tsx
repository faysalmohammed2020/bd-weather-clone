"use client";

import { useState } from "react";
import { useSession, twoFactor } from "@/lib/auth-client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Settings as SettingsIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

const Settings = () => {
  const t = useTranslations("Settings");
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStep, setSetupStep] = useState<"password" | "qrcode" | "verify">("password");
  const [totpUri, setTotpUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Get 2FA status from session
  const isTwoFactorEnabled = session?.user?.twoFactorEnabled || false;
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [isDisableLoading, setIsDisableLoading] = useState(false);

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      setIsDialogOpen(true);
    } else {
      setDisableDialogOpen(true);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError(t("twoFactor.errors.passwordRequired"));
      return;
    }

    setIsDisableLoading(true);
    setDisableError("");

    try {
      const { error } = await twoFactor.disable({
        password: disablePassword,
      });

      if (error) {
        setDisableError(error.message || t("twoFactor.errors.disableFailed"));
      } else {
        toast.success(t("twoFactor.success.disabled"));
        setDisableDialogOpen(false);
        setDisablePassword("");
      }
    } catch (err: unknown) {
      setDisableError(err instanceof Error ? err.message : t("twoFactor.errors.generalError"));
    } finally {
      setIsDisableLoading(false);
    }
  };

  const handleInitiate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(t("twoFactor.errors.passwordRequired"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await twoFactor.enable({
        password,
      });

      if (error) {
        setError(error.message || t("twoFactor.errors.enableFailed"));
      } else if (data) {
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes || []);
        setSetupStep("qrcode");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("twoFactor.errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError(t("twoFactor.errors.codeRequired"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await twoFactor.verifyTotp({
        code: verificationCode
      });

      if (error) {
        setError(error.message || t("twoFactor.errors.verifyFailed"));
      } else {
        toast.success(t("twoFactor.success.enabled"));
        setIsDialogOpen(false);
        setSetupStep("password");
        setPassword("");
        setVerificationCode("");
        setTotpUri("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("twoFactor.errors.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("security")}</h2>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-0.5 text-blue-600" />
            <div>
              <h3 className="font-medium">{t("twoFactor.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("twoFactor.description")}
              </p>
            </div>
          </div>
          <Switch 
            checked={isTwoFactorEnabled} 
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSetupStep("password");
            setPassword("");
            setVerificationCode("");
            setTotpUri("");
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === "password" && t("twoFactor.enable.title")}
              {setupStep === "qrcode" && t("twoFactor.enable.scanQR")}
              {setupStep === "verify" && t("twoFactor.enable.verify.title")}
            </DialogTitle>
            <DialogDescription>
              {setupStep === "password" && t("twoFactor.enable.description")}
              {setupStep === "qrcode" && t("twoFactor.enable.scanDescription")}
              {setupStep === "verify" && t("twoFactor.enable.verify.description")}
            </DialogDescription>
          </DialogHeader>

          {setupStep === "password" && (
            <form onSubmit={handleInitiate2FA}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("twoFactor.enable.passwordLabel")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("twoFactor.enable.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("loading.processing") : t("twoFactor.enable.continue")}
                </Button>
              </DialogFooter>
            </form>
          )}

          {setupStep === "qrcode" && (
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                {totpUri && (
                  <div className="p-2 bg-white border rounded-md">
                    <QRCode value={totpUri} size={200} />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-center text-gray-500">
                {t("twoFactor.enable.scanDescription")}
              </p>

              {backupCodes.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">{t("twoFactor.enable.backupCodes.title")}</h4>
                  <p className="text-xs text-gray-500 mb-2">{t("twoFactor.enable.backupCodes.description")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-xs font-mono bg-white p-1 border rounded">{code}</div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button onClick={() => setSetupStep("verify")}>
                  {t("twoFactor.enable.continue")}
                </Button>
              </DialogFooter>
            </div>
          )}

          {setupStep === "verify" && (
            <form onSubmit={handleVerifyTotp}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">{t("twoFactor.enable.verify.codeLabel")}</Label>
                  <Input
                    id="verificationCode"
                    placeholder={t("twoFactor.enable.verify.codePlaceholder")}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSetupStep("qrcode")}
                  disabled={isLoading}
                >
                  {t("buttons.back")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("loading.verifying") : t("twoFactor.enable.verify.verifyButton")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog 
        open={disableDialogOpen} 
        onOpenChange={(open) => {
          setDisableDialogOpen(open);
          if (!open) {
            setDisablePassword("");
            setDisableError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("twoFactor.disable.title")}</DialogTitle>
            <DialogDescription>
              {t("twoFactor.disable.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDisable2FA}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="disablePassword">{t("twoFactor.disable.passwordLabel")}</Label>
                <Input
                  id="disablePassword"
                  type="password"
                  placeholder={t("twoFactor.disable.passwordPlaceholder")}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              {disableError && <p className="text-sm text-red-500">{disableError}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDisableDialogOpen(false)}
                disabled={isDisableLoading}
              >
                {t("buttons.cancel")}
              </Button>
              <Button type="submit" variant="destructive" disabled={isDisableLoading}>
                {isDisableLoading ? t("loading.disabling") : t("twoFactor.disable.disableButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;