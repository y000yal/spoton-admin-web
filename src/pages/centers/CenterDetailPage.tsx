import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, Building2, Edit, MapPin, Globe, Calendar, User, Mail, Phone, Clock, Image as ImageIcon } from 'lucide-react';
import { useCenter } from '../../hooks/useCenters';

import PermissionGate from '../../components/PermissionGate';

const CenterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
  const { data: center, isLoading } = useCenter(parseInt(centerId || '0'));

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
        
        <PermissionGate permission={'center-update'}>
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

                {(center.center_details?.email || center.center_details?.contact_number) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {center.center_details?.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Center Email</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{center.center_details.email}</span>
                        </div>
                      </div>
                    )}
                    {center.center_details?.contact_number && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{center.center_details.contact_number}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Operating Hours Section */}
          {center.center_details?.operating_hours && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  Operating Hours
                </h2>
                <div className="space-y-3">
                  {Object.entries(center.center_details.operating_hours).map(([day, schedule]) => (
                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </div>
                      <div className="text-sm text-gray-600">
                        {schedule.closed ? (
                          <span className="text-red-600 font-medium">Closed</span>
                        ) : (
                          <span>{schedule.open} - {schedule.close}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Images Section */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
                Images
              </h2>
              {center.media && center.media.length > 0 ? (
                <div className="space-y-4">
                  {/* Banner Image */}
                  {center.center_details?.banner_image && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Banner Image</h3>
                      <div className="relative">
                        <img
                          src={center.center_details.banner_image.url}
                          alt="Banner image"
                          className="w-full h-64 object-cover rounded-lg border border-blue-300"
                        />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Banner
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Images */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      All Images ({center.media.length})
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {center.media.map((media, index) => (
                        <div key={index} className="relative">
                          <img
                            src={media.url}
                            alt={`Center image ${index + 1}`}
                            className={`w-full h-48 object-cover rounded-lg border ${
                              media.media_id === center.center_details?.banner_image?.id 
                                ? 'border-blue-300 ring-2 ring-blue-200' 
                                : 'border-gray-300'
                            }`}
                          />
                          {media.media_id === center.center_details?.banner_image?.id && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                              Banner
                            </div>
                          )}
                          <p className="mt-2 text-xs text-gray-500 text-center">Image {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No images available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Areas and Metadata */}
        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner</h2>
              {center.user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {center.user.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {center.user.email}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          center.user.status === '1' || center.user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {center.user.status === '1' || center.user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No owner assigned</p>
                </div>
              )}
            </div>
          </Card>

          {/* Areas */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Areas</h2>
                <PermissionGate permission={'area-index'}>
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
                      {center.created_at || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {center.updated_at || 'N/A'}
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
