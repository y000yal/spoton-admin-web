import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsers, deleteUser } from "../../store/slices/userSlice";

import { Card, Button, DataTable, PermissionGate } from "../../components/UI";
import { Plus, Users, Eye, Edit, Trash2 } from "lucide-react";
import { PERMISSIONS } from "../../utils/permissions";
import type { User } from "../../types";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { users, isLoading } = useAppSelector((state) => state.users);

  // Temporary: Simple state management to test
  const [searchField, setSearchField] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Simple initial fetch
  React.useEffect(() => {
    dispatch(
      fetchUsers({
        page: 1,
        limit: 10,
        sort_field: "created_at",
        sort_by: "desc",
      })
    );
  }, [dispatch]);

  const handleViewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = async (user: User) => {
    if (
      window.confirm(`Are you sure you want to delete user "${user.username}"?`)
    ) {
      try {
        setIsLocalLoading(true);
        await dispatch(deleteUser(user.id)).unwrap();
        // Refresh the users list
        await dispatch(
          fetchUsers({
            page: currentPage,
            limit: 10,
            sort_field: sortField,
            sort_by: sortDirection,
            forceRefresh: true,
          })
        );
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setIsLocalLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "1": { label: "Active", className: "bg-green-100 text-green-800" },
      "0": { label: "Inactive", className: "bg-red-100 text-red-800" },
      "2": {
        label: "Email Pending",
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: "Unknown",
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const tableColumns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (_: unknown, user: User) => user?.id || "N/A",
    },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
      render: (_: unknown, user: User) => {
        if (!user) return "N/A";
        if (typeof user.full_name === "object" && user.full_name !== null) {
          const { first_name, middle_name, last_name } = user.full_name;
          return `${first_name} ${
            middle_name ? middle_name + " " : ""
          }${last_name}`.trim();
        }
        return user.full_name || "N/A";
      },
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (_: unknown, user: User) => user?.email || "N/A",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_: unknown, user: User) => getStatusBadge(user?.status || "0"),
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (_: unknown, user: User) =>
        user?.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (_: unknown, user: User) => {
        if (!user) return <div>N/A</div>;

        return (
          <div className="flex space-x-2">
            <PermissionGate permission={PERMISSIONS.USERS_SHOW}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewUser(user)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.USERS_EDIT}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(user)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.USERS_DELETE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteUser(user)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </PermissionGate>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>

        <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
          <Button
            onClick={() => navigate("/users/create")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        data={users || ([] as any)}
        columns={tableColumns as any}
        isLoading={isLoading || isLocalLoading}
        onPageChange={(page) => {
          setCurrentPage(page);
          setIsLocalLoading(true);
          dispatch(
            fetchUsers({
              page,
              limit: 10,
              sort_field: sortField,
              sort_by: sortDirection,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onPageSizeChange={(pageSize) => {
          setCurrentPage(1);
          setIsLocalLoading(true);
          dispatch(
            fetchUsers({
              page: 1,
              limit: pageSize,
              sort_field: sortField,
              sort_by: sortDirection,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onSort={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
          setCurrentPage(1);
          setIsLocalLoading(true);
          dispatch(
            fetchUsers({
              page: 1,
              limit: 10,
              sort_field: field,
              sort_by: direction,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onSearch={(field, value) => {
          setSearchField(field);
          setSearchValue(value);
          setCurrentPage(1);
          setIsLocalLoading(true);
          const params: any = {
            page: 1,
            limit: 10,
            sort_field: sortField,
            sort_by: sortDirection,
          };
          if (value.trim()) {
            params[`filter[${field}]`] = value.trim();
          }
          dispatch(fetchUsers(params)).finally(() => setIsLocalLoading(false));
        }}
        onClearSearch={() => {
          setSearchField("username");
          setSearchValue("");
          setCurrentPage(1);
          setSortField("created_at");
          setSortDirection("desc");
          setIsLocalLoading(true);
          dispatch(
            fetchUsers({
              page: 1,
              limit: 10,
              sort_field: "created_at",
              sort_by: "desc",
              forceRefresh: true,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onRefresh={() => {
          setIsLocalLoading(true);
          dispatch(
            fetchUsers({
              page: currentPage,
              limit: 10,
              sort_field: sortField,
              sort_by: sortDirection,
              forceRefresh: true,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        searchField={searchField}
        searchValue={searchValue}
        currentPage={currentPage}
        pageSize={10}
      />
    </div>
  );
};

export default UsersPage;
