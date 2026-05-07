import React from 'react';
import { Card } from '../../components/ui';
export function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <Card className="p-8 text-center text-gray-500">
        Profile management functionality coming soon.
      </Card>
    </div>);

}
export function Announcements() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      <Card className="p-8 text-center text-gray-500">
        Announcements feed coming soon.
      </Card>
    </div>);

}
export function ManageScholarships() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Scholarships</h1>
      <Card className="p-8 text-center text-gray-500">
        Scholarship CRUD functionality coming soon.
      </Card>
    </div>);

}
export function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      <Card className="p-8 text-center text-gray-500">
        Exportable reports coming soon.
      </Card>
    </div>);

}