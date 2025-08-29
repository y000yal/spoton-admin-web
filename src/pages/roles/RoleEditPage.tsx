import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  updateRole,
  fetchRole,
  fetchRolePermissions,
  assignRolePermissions,
} from "../../store/slices/roleSlice";
import { fetchPermissions } from "../../store/slices/permissionSlice";

import {
  Card,
  Button,
  InputField,
  TextareaField,
  FormSection,
  FormActions,
} from "../../components/UI";
import { ArrowLeft, Save, X, Key, RefreshCw } from "lucide-react";
import type { UpdateRoleRequest } from "../../types";

const RoleEditPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasInitialFetch = useRef(false);
  const hasInitialFetchPermissions = useRef(false);

  const { currentRole, isLoading } = useAppSelector((state) => state.roles);
  const { permissions } = useAppSelector((state) => state.permissions);
  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: "",
    display_name: "",
    description: "",
    status: "1",
  });

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true); // Start with loading true
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Check if permissions are loaded
  const arePermissionsLoaded = permissions?.data && permissions.data.length > 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load role data on mount and when roleId changes
  useEffect(() => {
    if (roleId && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      dispatch(fetchRole(parseInt(roleId)));
    }
  }, [roleId, dispatch]);

  // Load permissions if not already loaded
  useEffect(() => {
    // Only fetch permissions if they're not already in the state
    if (!permissions?.data || permissions.data.length === 0) {
      if (!hasInitialFetchPermissions.current) {
        hasInitialFetchPermissions.current = true;
        console.log("🔄 RoleEditPage: No permissions in state, fetching permissions...");
        dispatch(fetchPermissions({ page: 1, limit: 100 }));
      }
    } else {
      console.log("🔄 RoleEditPage: Using existing permissions from state, no need to fetch");
      // If permissions are already loaded, we can stop showing the loading state
      // but only if we're not currently loading role permissions
      if (!permissionsLoading) {
        setPermissionsLoading(false);
      }
    }
  }, [permissions, dispatch, permissionsLoading]);

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
      // Set loading state immediately
      setPermissionsLoading(true);
      // Reset initial fetch flags for the new role
      hasInitialFetch.current = false;
      hasInitialFetchPermissions.current = false;
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

  // Load permissions for the role
  const loadRolePermissions = useCallback(async () => {
    if (!currentRole) return;

    console.log("🔄 RoleEditPage: Starting to load role permissions for role:", currentRole.id);
    console.log("🔄 RoleEditPage: Available permissions in state:", permissions?.data?.length || 0);

    setPermissionsLoading(true);
    try {
      // Fetch role-specific permissions using Redux thunk
      const result = await dispatch(
        fetchRolePermissions(currentRole.id)
      ).unwrap();

      console.log("🔄 RoleEditPage: Role permissions API response:", result);

      // Set selected permissions based on role permissions
      const selectedSlugs = (result.permissions.permissions || []).map(
        (rp: Record<string, unknown>) => rp.slug as string
      );
      
      console.log("🔄 RoleEditPage: Extracted selected slugs:", selectedSlugs);
      
      // Use permissions from state to find matching IDs
      const selectedIds = (permissions?.data || [])
        .filter((p) => selectedSlugs.includes(p.slug as string))
        .map((p) => p.id as number);
      
      console.log("🔄 RoleEditPage: Final selected permission IDs:", selectedIds);
      console.log("🔄 RoleEditPage: Available permissions data:", permissions?.data?.map(p => ({ id: p.id, slug: p.slug, name: p.name })));
      
      setSelectedPermissions(selectedIds);
    } catch (error) {
      console.error("Failed to load role permissions:", error);
    } finally {
      setPermissionsLoading(false);
    }
  }, [currentRole, permissions, dispatch]);

  // Load role permissions when both role and permissions are available
  useEffect(() => {
    if (currentRole && permissions?.data && permissions.data.length > 0) {
      console.log("🔄 RoleEditPage: Both role and permissions loaded, loading role permissions...");
      // Ensure we're in loading state when starting to load role permissions
      setPermissionsLoading(true);
      loadRolePermissions();
    }
  }, [currentRole, permissions, loadRolePermissions]);

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
      await dispatch(
        assignRolePermissions({
          roleId: currentRole.id,
          permissionIds: selectedPermissions,
        })
      ).unwrap();
      console.log("Permissions saved successfully");
    } catch (error) {
      console.error("Failed to save permissions:", error);
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
      await dispatch(
        updateRole({ roleId: parseInt(roleId), roleData: formData })
      ).unwrap();
      navigate("/roles");
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/roles");
  };

  // Show loading screen until all data is fetched and role permissions are loaded
  // Also show loading immediately when roleId changes (to prevent old data flash)
  if (isLoading || !permissions?.data || permissionsLoading || !currentRole || 
      (selectedPermissions.length === 0 && !permissionsLoading) ||
      (roleId && (!currentRole || currentRole.id !== parseInt(roleId)))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                     <p className="mt-4 text-gray-600">
             {isLoading 
               ? "Loading role information..." 
               : !permissions?.data
                 ? "Loading permissions list..."
                 : permissionsLoading 
                   ? "Loading role permissions..." 
                   : "Loading role data..."
             }
           </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Role Data</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${permissions?.data ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Permissions List</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${!permissionsLoading && selectedPermissions.length > 0 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-500">Role Permissions</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRole) {
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
        <div className="flex items-center space-x-4">
          <Button onClick={handleCancel} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
            <p className="text-gray-600">
              Update information for role "
              {currentRole.display_name || currentRole.name}"
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Role Information Form */}
        <Card className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || "1"}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
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

            <FormActions>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  leftIcon={
                    isSubmitting ? undefined : <Save className="h-4 w-4" />
                  }
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </FormActions>
          </form>
        </Card>

        {/* Right Side - Role Permissions */}
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            <FormSection title="Role Permissions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      Select the permissions that should be assigned to this role.
                    </p>
                                         {permissionsLoading ? (
                       <p className="text-sm text-blue-600 mt-1">
                         🔄 Loading role permissions...
                       </p>
                     ) : arePermissionsLoaded ? (
                       <p className="text-sm text-green-600 mt-1">
                         ✓ {permissions.data.length} permissions loaded
                       </p>
                     ) : null}
                  </div>
                  <div className="flex items-center space-x-2">
                                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const allPermissionIds = (permissions?.data || []).map(
                            (p) => p.id
                          );
                          setSelectedPermissions(allPermissionIds);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Select All
                      </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPermissions([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Remove All
                    </Button>
                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         setPermissionsLoading(true);
                         setSelectedPermissions([]);
                         loadRolePermissions();
                       }}
                       leftIcon={<RefreshCw className="h-4 w-4" />}
                       className="text-gray-500 hover:text-gray-700"
                       disabled={permissionsLoading}
                     >
                       {permissionsLoading ? "Refreshing..." : "Refresh"}
                     </Button>
                  </div>
                </div>

                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading role permissions...
                    </span>
                  </div>
                ) : permissions?.data && permissions.data.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                    {permissions.data.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {permission.display_name || permission.name}
                          </div>
                          {permission.description && (
                            <div className="text-sm text-gray-500">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No permissions available
                  </div>
                )}
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
