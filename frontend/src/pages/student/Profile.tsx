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
const IP_STATUS_OPTIONS = ['Yes', 'No', 'Prefer not to say'];
const INDIGENOUS_GROUP_OPTIONS = [
  { label: 'Mindanao', options: ['Manobo', 'Higaonon', 'Talaandig', 'Bukidnon', "T'boli", "B'laan", 'Teduray', 'Subanen', 'Bagobo', 'Mandaya', 'Mansaka', 'Tagakaulo', 'Matigsalug', 'Mamanwa', 'Dibabawon', 'Banwaon', 'Kamayo', 'Mangguangan', 'Sama-Bajau'] },
  { label: 'Luzon', options: ['Igorot', 'Ifugao', 'Kalinga', 'Bontoc', 'Ibaloi', 'Kankanaey', 'Isneg', 'Aeta / Agta', 'Dumagat', 'Bugkalot (Ilongot)', 'Gaddang', 'Tingguian (Itneg)'] },
  { label: 'Palawan', options: ["Palaw'an", 'Tagbanua', 'Batak', 'Molbog'] },
];

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
  const [ipStatus, setIpStatus] = useState(user?.profile?.ipStatus || user?.ipStatus || '');
  const [indigenousGroup, setIndigenousGroup] = useState(user?.profile?.indigenousGroup || user?.indigenousGroup || '');
  const [isSaving, setIsSaving] = useState(false);
  if (!user) return null;

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
        address,
        ipStatus,
        indigenousGroup: ipStatus === 'Yes' ? indigenousGroup : '',
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

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

        </Card>

        {/* Demographic / Personal */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Personal / Demographic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Are you an Indigenous Person (IP)?
              </label>
              <select
                value={ipStatus}
                onChange={(e) => {
                  const next = e.target.value;
                  setIpStatus(next);
                  if (next !== 'Yes') {
                    setIndigenousGroup('');
                  }
                }}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select an option...</option>
                {IP_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {ipStatus === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indigenous Group / Ethnolinguistic Group
                </label>
                <select
                  value={indigenousGroup}
                  onChange={(e) => setIndigenousGroup(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">Select indigenous group...</option>
                  {INDIGENOUS_GROUP_OPTIONS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
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