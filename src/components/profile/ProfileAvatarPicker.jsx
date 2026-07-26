import React, { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/api/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initialsFromName(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Avatar display + optional upload with public-ranking consent gate.
 * onChange receives { avatar_url, avatar_public_consent_at } after a successful upload,
 * or { avatar_url: null, avatar_public_consent_at } when removed.
 */
export default function ProfileAvatarPicker({
  avatarUrl,
  name,
  size = "lg",
  editable = true,
  hasConsent = false,
  onChange,
  showRemove = true,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [consentChecked, setConsentChecked] = useState(!!hasConsent);
  const [showConsent, setShowConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);

  React.useEffect(() => {
    setPreviewUrl(avatarUrl || null);
  }, [avatarUrl]);

  React.useEffect(() => {
    if (hasConsent) setConsentChecked(true);
  }, [hasConsent]);

  const dim = size === "sm" ? "h-12 w-12" : size === "md" ? "h-16 w-16" : "h-24 w-24";
  const iconDim = size === "sm" ? "h-5 w-5" : size === "md" ? "h-7 w-7" : "h-12 w-12";

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleTapUpload = () => {
    if (!editable || uploading) return;
    if (consentChecked || hasConsent) {
      openFilePicker();
      return;
    }
    setShowConsent(true);
  };

  const handleAcceptAndPick = () => {
    if (!consentChecked) {
      toast.error("Confirme que a foto será pública para continuar.");
      return;
    }
    setShowConsent(false);
    openFilePicker();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!consentChecked && !hasConsent) {
      toast.error("Aceite o aviso de foto pública antes de enviar.");
      setShowConsent(true);
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      if (!file_url) throw new Error("Upload não retornou URL.");
      const consentAt = hasConsent
        ? undefined
        : new Date().toISOString();
      setPreviewUrl(file_url);
      await onChange?.({
        avatar_url: file_url,
        ...(consentAt ? { avatar_public_consent_at: consentAt } : {}),
      });
      toast.success("Foto de perfil atualizada.");
    } catch (error) {
      toast.error(error?.message || "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!editable || uploading) return;
    setUploading(true);
    try {
      setPreviewUrl(null);
      await onChange?.({ avatar_url: null });
      toast.success("Foto removida.");
    } catch (error) {
      toast.error(error?.message || "Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleTapUpload}
          disabled={!editable || uploading}
          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CEF17B]/60 disabled:opacity-60"
          aria-label="Alterar foto de perfil"
        >
          <Avatar className={`${dim} ring-4 ring-[#CEF17B]/30`}>
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt={name || "Avatar"} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-[#CEF17B]/40 to-[#084734] text-[#CEF17B]">
              {name ? (
                <span className="text-lg font-bold">{initialsFromName(name)}</span>
              ) : (
                <User className={`${iconDim} text-[#CEF17B]`} />
              )}
            </AvatarFallback>
          </Avatar>
          {editable && (
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#CEF17B]/40 bg-[#0F1C1B] text-[#CEF17B]">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </span>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      {showConsent && (
        <div
          className="rounded-2xl p-4 text-left"
          style={{
            background: "rgba(206,241,123,0.08)",
            border: "1px solid rgba(206,241,123,0.22)",
          }}
        >
          <p className="text-sm font-bold text-white">Foto pública</p>
          <p className="mt-2 text-xs leading-relaxed text-white/65">
            Sua foto de perfil ficará pública e poderá aparecer no Ranking Global (Top 10)
            para outros usuários. Não envie imagens que você não queira compartilhar.
          </p>
          <label className="mt-3 flex items-start gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5"
            />
            <span>Li e aceito que minha foto será pública no ranking.</span>
          </label>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={() => setShowConsent(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 bg-[#CEF17B] font-bold text-[#0B3936] hover:bg-[#bfe56b]"
              onClick={handleAcceptAndPick}
            >
              Aceito e escolher foto
            </Button>
          </div>
        </div>
      )}

      {editable && showRemove && previewUrl && !showConsent && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white/80"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remover foto
        </button>
      )}
    </div>
  );
}

export { initialsFromName };
