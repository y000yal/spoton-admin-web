import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AreasPage, AreaCreatePage, AreaEditPage, AreaDetailPage } from '../pages/areas';

const AreaRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AreasPage />} />
      <Route path="create" element={<AreaCreatePage />} />
      <Route path=":areaId" element={<AreaDetailPage />} />
      <Route path=":areaId/edit" element={<AreaEditPage />} />
    </Routes>
  );
};

export default AreaRoutes;
