import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, Building2, Edit, MapPin, Globe, Calendar } from 'lucide-react';
import { useCenter } from '../../hooks/useCenters';
import { usePermissions } from '../../hooks/usePermissionCheck';
import { PERMISSIONS } from '../../utils/permissions';
import PermissionGate from '../../components/PermissionGate';

const CenterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
  const { hasPermission } = usePermissions();

  const { data: center, isLoading, error } = useCenter(parseInt(centerId || '0'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Center not found</h3>
        <p className="mt-1 text-sm text-gray-500">The center you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/centers')}>
            Back to Centers
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
            onClick={() => navigate('/centers')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{center.name}</h1>
        </div>
        
        <PermissionGate permission={PERMISSIONS.CENTERS_EDIT}>
          <Button
            onClick={() => navigate(`/centers/${center.id}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Center</span>
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
                    <p className="mt-1 text-sm text-gray-900">{center.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(center.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Country</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{center.country?.name || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{center.address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Longitude</label>
                    <p className="mt-1 text-sm text-gray-900">{center.longitude}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Latitude</label>
                    <p className="mt-1 text-sm text-gray-900">{center.latitude}</p>
                  </div>
                </div>

                {center.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{center.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Areas Section */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Areas</h2>
                <PermissionGate permission={PERMISSIONS.AREAS_VIEW}>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/centers/${center.id}/areas`)}
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>View All Areas</span>
                  </Button>
                </PermissionGate>
              </div>
              <p className="text-sm text-gray-500">
                Manage areas within this center. Click "View All Areas" to see and manage all areas.
              </p>
            </div>
          </Card>
        </div>

        {/* Images and Metadata */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              {center.media && center.media.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {center.media.map((media, index) => (
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
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
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
                      {center.created_at ? new Date(center.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {center.updated_at ? new Date(center.updated_at).toLocaleDateString() : 'N/A'}
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

export default CenterDetailPage;
