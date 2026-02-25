import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Camera, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

const EditPersonalDetails = ({ onBack }: Props) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");

    supabase
      .from("profiles")
      .select("display_name, phone, bio, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = "Name is required";
    if (displayName.length > 100) errs.displayName = "Name must be under 100 characters";
    if (!email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) errs.phone = "Invalid phone number";
    if (bio.length > 500) errs.bio = "Bio must be under 500 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setSaving(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          phone: phone.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("A confirmation email has been sent to your new address.");
      }

      // Update display name in auth metadata
      await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });

      toast.success("Profile updated successfully!");
      onBack();
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      setAvatarUrl(url);
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Back
      </button>
      <h2 className="font-display text-xl font-bold text-foreground">Edit Personal Details</h2>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Avatar */}
      <div className="flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-24 w-24">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
            <AvatarFallback className="bg-secondary">
              <User size={36} className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera size={22} className="text-white" />
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="displayName" className="text-sm font-medium text-foreground">Full Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1"
            placeholder="Your full name"
          />
          {errors.displayName && <p className="mt-1 text-xs text-destructive">{errors.displayName}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            placeholder="+1 (555) 000-0000"
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 min-h-[100px]"
            placeholder="Tell others about yourself..."
            maxLength={500}
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/500</p>
          {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
};

export default EditPersonalDetails;
