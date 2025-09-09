import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, MapPin, Edit, Building2, Calendar } from 'lucide-react';
import { useArea } from '../../hooks/useAreas';
import { useCenter } from '../../hooks/useCenters';
import { usePermissions } from '../../hooks/usePermissionCheck';
import { PERMISSIONS } from '../../utils/permissions';
import PermissionGate from '../../components/PermissionGate';

const AreaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId, areaId } = useParams<{ centerId: string; areaId: string }>();
  const { hasPermission } = usePermissions();

  const { data: area, isLoading, error } = useArea(parseInt(centerId || '0'), parseInt(areaId || '0'));
  const { data: center } = useCenter(parseInt(centerId || '0'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Area not found</h3>
        <p className="mt-1 text-sm text-gray-500">The area you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(`/centers/${centerId}/areas`)}>
            Back to Areas
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Inactive', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/centers/${centerId}/areas`)}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{area.name}</h1>
            {center && (
              <p className="text-sm text-gray-500">in {center.name}</p>
            )}
          </div>
        </div>
        
        <PermissionGate permission={PERMISSIONS.AREAS_EDIT}>
          <Button
            onClick={() => navigate(`/centers/${centerId}/areas/${area.id}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Area</span>
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{area.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(area.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Floor</label>
                  <p className="mt-1 text-sm text-gray-900">{area.floor}</p>
                </div>

                {area.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{area.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">Center</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{center?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Images and Metadata */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              {area.media && area.media.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {area.media.map((media, index) => (
                    <div key={index} className="relative">
                      <img
                        src={media.url}
                        alt={media.title}
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <p className="mt-2 text-xs text-gray-500 text-center">{media.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No images available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">
                      {area.created_at ? new Date(area.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {area.updated_at ? new Date(area.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailPage;
