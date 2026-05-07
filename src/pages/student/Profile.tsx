import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, Button, Input, Textarea } from '../../components/ui';
import { toast } from 'sonner';
const COURSES = [
'BS Computer Science',
'BS Information Technology',
'BS Computer Engineering',
'BS Accountancy',
'BS Civil Engineering',
'BS Education',
'BS Nursing',
'BS Business Administration',
'BS Agriculture',
'BS Criminology',
'Other'];

export function StudentProfile() {
  const { user } = useAuth();
  const { updateUser, updateUserProfile } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [course, setCourse] = useState(user?.profile?.course || '');
  const [yearLevel, setYearLevel] = useState(user?.profile?.yearLevel || 1);
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  if (!user) return null;
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(user.id, {
        name,
        avatar
      });
      await updateUserProfile(user.id, {
        course,
        yearLevel: Number(yearLevel),
        phone,
        address
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Keep your information up to date — it's used to verify scholarship
          eligibility.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar + Basic */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-3xl font-bold overflow-hidden">
                {avatar ?
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full object-cover" /> :


                initial || <UserIcon className="w-10 h-10" />
                }
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-sky-700">
                
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden" />
              
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required />
              
              <Input label="Email Address" value={user.email} disabled />
            </div>
          </div>
        </Card>

        {/* Academic */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course / Program
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                
                <option value="">Select a course...</option>
                {COURSES.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                
                {[1, 2, 3, 4, 5].map((y) =>
                <option key={y} value={y}>
                    {y}
                    {y === 1 ?
                  'st' :
                  y === 2 ?
                  'nd' :
                  y === 3 ?
                  'rd' :
                  'th'}{' '}
                    Year
                  </option>
                )}
              </select>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX XXX XXXX" />
            
            <Textarea
              label="Home Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Street, Barangay, City, Province" />
            
          </div>
        </Card>

        {/* Save */}
        <div className="flex justify-end gap-3 sticky bottom-4">
          <Button
            type="submit"
            isLoading={isSaving}
            className="gap-2 shadow-lg">
            
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>);

}