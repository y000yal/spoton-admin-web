import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Button,
  InputField,
  TextareaField,
  FormSection,
  FormActions,
} from "../../components/UI";
import GroupedPermissionsList from "../../components/GroupedPermissionsList";
import { ArrowLeft, Save, X, Key, RefreshCw } from "lucide-react";
import type { UpdateRoleRequest, Permission, PaginatedResponse } from "../../types";
import { useRole, useUpdateRole, useRolePermissions, useAssignRolePermissions } from "../../hooks/useRoles";
import { usePermissionsData } from "../../hooks/usePermissions";
import { useToast } from "../../contexts/ToastContext";

const RoleEditPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const hasInitialFetch = useRef(false);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // React Query hooks
  const roleIdNumber = roleId ? parseInt(roleId) : 0;
  const { data: currentRole, isLoading: roleLoading, error: roleError } = useRole(roleIdNumber);
  const updateRoleMutation = useUpdateRole();
  const { data: permissionsData } = usePermissionsData({ page: 1, limit: 1000 });
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useRolePermissions(roleIdNumber);
  const assignPermissionsMutation = useAssignRolePermissions();
  
  const permissions: Permission[] = useMemo(() => 
    (permissionsData as PaginatedResponse<Permission>)?.data || [], 
    [permissionsData]
  );

  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: "",
    display_name: "",
    description: "",
    status: "1",
  });

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);


  // Check if permissions are loaded
  const arePermissionsLoaded = permissionsData && permissions.length > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Load role data on mount and when roleId changes
  // Data is loaded via React Query hooks above

  // Clear all data immediately when role changes (to prevent showing old data)
  useEffect(() => {
    if (roleId) {
      // Clear form data immediately to prevent showing old role data
      setFormData({
        name: "",
        display_name: "",
        description: "",
        status: "1",
      });
      // Clear selected permissions immediately
      setSelectedPermissions([]);
      // Reset initial fetch flags for the new role
      hasInitialFetch.current = false;
      // Don't reset permissions fetch flag - we want to keep permissions loaded
      // hasInitialFetchPermissions.current = false;
    }
  }, [roleId]);

  // Update form data when role is loaded
  useEffect(() => {
    if (currentRole) {
      setFormData({
        name: currentRole.name || "",
        display_name: currentRole.display_name || "",
        description: currentRole.description || "",
        status: currentRole.status || "1",
      });
    }
  }, [currentRole]);

  // Update selected permissions when role permissions data changes
  useEffect(() => {
    if (rolePermissionsData && permissions.length > 0) {
      // Extract slugs from role permissions
      const selectedSlugs = (rolePermissionsData.permissions || []).map(
        (rp: Record<string, unknown>) => rp.slug as string
      );
      
      // Find matching permission IDs
      const selectedIds = permissions
        .filter((p: Permission) => selectedSlugs.includes(p.slug))
        .map((p: Permission) => p.id);
      
      setSelectedPermissions(selectedIds);
    }
  }, [rolePermissionsData, permissions]);

  // Permissions are loaded via React Query hook above

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!currentRole) return;

    setSavingPermissions(true);
    try {
      await assignPermissionsMutation.mutateAsync({
        roleId: currentRole.id,
        permissionIds: selectedPermissions
      });
      showSuccess(
        `Successfully updated permissions for role "${currentRole.display_name || currentRole.name}"`,
        "Permissions Saved"
      );
    } catch (error: unknown) {
      console.error("Failed to save permissions:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save permissions. Please try again.";
      showError(
        errorMessage,
        "Save Failed"
      );
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateRoleMutation.mutateAsync({ 
        roleId: parseInt(roleId), 
        roleData: formData 
      });
      navigate("/roles");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/roles");
  };

  // Show error if roleId is invalid
  if (!roleId || isNaN(roleIdNumber) || roleIdNumber <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Role ID
          </h2>
          <p className="text-gray-600 mb-6">
            The role ID in the URL is invalid.
          </p>
          <Button onClick={handleCancel} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Show loading screen until all data is fetched and role permissions are loaded
  // Also show loading immediately when roleId changes (to prevent old data flash)
  if (roleLoading || !permissionsData || rolePermissionsLoading || !currentRole || 
      (roleId && (!currentRole || currentRole.id !== parseInt(roleId)))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                     <p className="mt-4 text-gray-600">
             {roleLoading 
               ? "Loading role information..." 
               : !permissionsData
                 ? "Loading permissions list..."
                 : rolePermissionsLoading 
                   ? "Loading role permissions..." 
                   : "Loading role data..."
             }
           </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${roleLoading ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Role Data</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${permissionsData ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Permissions List</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${!rolePermissionsLoading && selectedPermissions.length > 0 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Role Permissions</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if role failed to load
  if (roleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Role
          </h2>
          <p className="text-gray-600 mb-6">
            {roleError.message || "Failed to load role data."}
          </p>
          <Button onClick={handleCancel} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentRole && !roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Role Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The role you're looking for doesn't exist.
          </p>
          <Button onClick={handleCancel} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/roles')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Key className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="role-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Role</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Role Information Form */}
        <Card className="lg:col-span-1">
          <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Role Information">
              <InputField
                label="Role Name"
                name="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., admin, user, moderator"
                required
              />

              <InputField
                label="Display Name"
                name="display_name"
                value={formData.display_name || ""}
                onChange={(e) =>
                  handleInputChange("display_name", e.target.value)
                }
                placeholder="e.g., Administrator, User, Moderator"
                required
              />

              <TextareaField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the role's purpose and responsibilities"
                rows={3}
              />
            </FormSection>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <X className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

          </form>
        </Card>

        {/* Right Side - Role Permissions */}
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            <FormSection title="Role Permissions">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600">
                      Select the permissions that should be assigned to this role.
                    </p>
                                         {rolePermissionsLoading ? (
                       <p className="text-sm text-blue-600 mt-1">
                         🔄 Loading role permissions...
                       </p>
                     ) : arePermissionsLoaded ? (
                       <p className="text-sm text-green-600 mt-1">
                         ✓ {permissions.length} permissions loaded
                       </p>
                     ) : null}
                  </div>
                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={async () => {
                         // Invalidate and refetch role permissions data
                         await queryClient.invalidateQueries({ 
                           queryKey: ['roles', 'permissions', roleIdNumber] 
                         });
                         await queryClient.invalidateQueries({ 
                           queryKey: ['permissions'] 
                         });
                         // Don't clear selected permissions - let the useEffect handle updating them
                       }}
                       leftIcon={<RefreshCw className="h-4 w-4" />}
                       className="text-gray-500 hover:text-gray-700"
                       disabled={rolePermissionsLoading}
                     >
                       {rolePermissionsLoading ? "Refreshing..." : "Refresh"}
                     </Button>
                  </div>

                <GroupedPermissionsList
                  permissions={permissions}
                  selectedPermissions={selectedPermissions}
                  onPermissionToggle={handlePermissionToggle}
                  onSelectAll={() => {
                    const allPermissionIds = permissions.map((p: Permission) => p.id);
                    setSelectedPermissions(allPermissionIds);
                  }}
                  onRemoveAll={() => setSelectedPermissions([])}
                  isLoading={rolePermissionsLoading}
                  showSelectAllButtons={true}
                />
              </div>
            </FormSection>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSavePermissions}
                disabled={savingPermissions}
                leftIcon={<Key className="h-4 w-4" />}
                className="w-full"
              >
                {savingPermissions
                  ? "Saving Permissions..."
                  : "Save Permissions"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleEditPage;
