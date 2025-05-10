
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TeamMembersSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage your team and their access levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button>Add Team Member</Button>
        
        <div className="relative overflow-x-auto rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="px-6 py-4 font-medium">Jane Doe</td>
                <td className="px-6 py-4">jane@example.com</td>
                <td className="px-6 py-4">Admin</td>
                <td className="px-6 py-4">
                  <Button variant="outline" size="sm">Edit</Button>
                </td>
              </tr>
              <tr className="bg-white border-b">
                <td className="px-6 py-4 font-medium">John Smith</td>
                <td className="px-6 py-4">john@example.com</td>
                <td className="px-6 py-4">Recruiter</td>
                <td className="px-6 py-4">
                  <Button variant="outline" size="sm">Edit</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
