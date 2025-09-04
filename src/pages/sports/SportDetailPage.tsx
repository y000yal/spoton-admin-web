import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSport } from '../../store/slices/sportSlice';
import { Button, Card, DeleteConfirmationModal } from '../../components/UI';
import { ArrowLeft, Trophy, Edit, Trash2 } from 'lucide-react';
import { PermissionGate } from '../../components/UI';
import { PERMISSIONS } from '../../utils/permissions';

const SportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sportId } = useParams<{ sportId: string }>();
  
  const { currentSport, isLoading } = useAppSelector((state) => state.sports);

  // Ref to track if sport has been fetched
  const fetchedSportIdRef = useRef<number | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    isLoading: false
  });

  // Fetch sport data when component mounts - only once per sportId
  useEffect(() => {
    if (sportId) {
      const sportIdNum = parseInt(sportId);
      if (fetchedSportIdRef.current !== sportIdNum) {
        fetchedSportIdRef.current = sportIdNum;
        dispatch(fetchSport(sportIdNum));
      }
    }
  }, [dispatch, sportId]);

  const handleEdit = () => {
    if (sportId) {
      navigate(`/sports/${sportId}/edit`);
    }
  };

  const handleDelete = () => {
    setDeleteModal({
      isOpen: true,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!currentSport) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      // You can add delete functionality here if needed
      console.log('Delete sport:', currentSport.id);
      navigate('/sports');
    } catch (error) {
      console.error('Failed to delete sport:', error);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, isLoading: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentSport) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sport not found</h3>
        <p className="mt-1 text-sm text-gray-500">The sport you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/sports')}>
            Back to Sports
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
            onClick={() => navigate('/sports')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Sport Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <PermissionGate permission={PERMISSIONS.SPORTS_EDIT}>
            <Button
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </PermissionGate>
          
          <PermissionGate permission={PERMISSIONS.SPORTS_DELETE}>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <p className="text-lg text-gray-900">{currentSport.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(currentSport.status)}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900">
                    {currentSport.description || 'No description provided'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {currentSport.created_at ? new Date(currentSport.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Updated At
                  </label>
                  <p className="text-gray-900">
                    {currentSport.updated_at ? new Date(currentSport.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Image Section */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Sport Image
              </label>
              {currentSport.media_url ? (
                <div className="space-y-4">
                  <img
                    src={currentSport.media_url}
                    alt={currentSport.name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {currentSport.name} Image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Trophy className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Sport"
        message="Are you sure you want to delete this sport? This action cannot be undone."
        itemName={currentSport?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default SportDetailPage;
