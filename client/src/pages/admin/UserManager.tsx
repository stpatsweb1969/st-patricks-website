import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ROLE_LABELS, type UserRole } from "@shared/roles";
import { Users, Shield } from "lucide-react";
import { format } from "date-fns";

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: "admin", label: "Administrator", color: "bg-red-100 text-red-800" },
  { value: "communications", label: "Communications", color: "bg-blue-100 text-blue-800" },
  { value: "religious_ed", label: "Religious Education", color: "bg-green-100 text-green-800" },
  { value: "youth_ministry", label: "Youth Ministry", color: "bg-orange-100 text-orange-800" },
  { value: "sacraments", label: "Sacraments", color: "bg-purple-100 text-purple-800" },
  { value: "parish_life", label: "Parish Life", color: "bg-green-100 text-green-800" },
  { value: "user", label: "Parishioner (no admin)", color: "bg-gray-100 text-gray-800" },
];

export default function UserManager() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole as any });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Assign roles to staff members. Each role grants access to specific admin sections.
        </p>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            <div><Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge> — Full access to all sections</div>
            <div><Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Communications</Badge> — News, Bulletins, Gallery, Subscribers</div>
            <div><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Religious Ed</Badge> — CCD, Permissions, Documents</div>
            <div><Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Youth Ministry</Badge> — CYO, Teen Life</div>
            <div><Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Sacraments</Badge> — Baptism, Marriage, Funeral</div>
            <div><Badge className="bg-green-100 text-green-800 hover:bg-green-100">Parish Life</Badge> — Events, Volunteers, Key Dates, Registrations</div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || "No email"}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {format(new Date(user.lastSignedIn), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="sm:w-48">
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No users have signed in yet.</p>
        </Card>
      )}
    </div>
  );
}
