'use client';

import { useState, useEffect } from 'react';
import { pickupService } from '@/lib/firebase-services';
import type { PickupRequest } from '@/types';

export default function TestPickupsPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [filteredPickups, setFilteredPickups] = useState<PickupRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestPickups() {
      try {
        const collectorId = 'xDolpHlBysSwHlfpFGDEoPrZPko1'; // Hardcoded for testing
        
        console.log('🔍 Loading pickups for collector:', collectorId);
        
        // Get ALL pickups
        const allPickups = await pickupService.getAllPickupRequests();
        console.log('📋 Total pickups in database:', allPickups.length);
        
        // Filter for this collector
        const collectorPickups = allPickups.filter(
          (pickup: PickupRequest) => pickup.collectorId === collectorId
        );
        
        console.log('👤 Collector pickups found:', collectorPickups.length);
        console.log('📊 Statuses found:', collectorPickups.map(p => p.status));
        
        setPickups(collectorPickups);
      } catch (error) {
        console.error('❌ Error loading pickups:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTestPickups();
  }, []);

  useEffect(() => {
    const filtered = pickups.filter((pickup) => 
      statusFilter === 'all' || pickup.status === statusFilter
    );
    console.log(`🔧 Filtered for "${statusFilter}":`, filtered.length, 'pickups');
    setFilteredPickups(filtered);
  }, [pickups, statusFilter]);

  if (loading) {
    return <div className="p-6">Loading test pickups...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Pickups Page</h1>
      
      <div className="flex space-x-4">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All ({pickups.length})
        </button>
        <button 
          onClick={() => setStatusFilter('assigned')}
          className={`px-4 py-2 rounded ${statusFilter === 'assigned' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Assigned ({pickups.filter(p => p.status === 'assigned').length})
        </button>
        <button 
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2 rounded ${statusFilter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Completed ({pickups.filter(p => p.status === 'completed').length})
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>Showing {filteredPickups.length} pickups for filter: {statusFilter}</p>
      </div>

      <div className="space-y-4">
        {filteredPickups.map((pickup) => (
          <div key={pickup.id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{pickup.industryName}</h3>
                <p className="text-sm text-gray-600">{pickup.wasteType} - {pickup.weight}kg</p>
                <p className="text-sm text-gray-500">Status: {pickup.status}</p>
                <p className="text-sm text-gray-500">ID: {pickup.id}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                pickup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}>
                {pickup.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPickups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pickups found for filter: {statusFilter}
        </div>
      )}
    </div>
  );
}
