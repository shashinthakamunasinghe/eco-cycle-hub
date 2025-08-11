import { NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    // Get all pickup requests
    const pickupsSnapshot = await getDocs(collection(db, 'pickupRequests'))
    const pickups: any[] = []
    
    pickupsSnapshot.forEach((doc) => {
      const data = doc.data()
      pickups.push({
        id: doc.id,
        status: data.status,
        collectorId: data.collectorId,
        collectorName: data.collectorName,
        industryName: data.industryName,
        wasteType: data.wasteType,
        weight: data.weight,
        completedAt: data.completedAt?.toDate()?.toISOString() || null,
      })
    })
    
    // Get all collector profiles
    const collectorsSnapshot = await getDocs(collection(db, 'collectorProfiles'))
    const collectors: any[] = []
    
    collectorsSnapshot.forEach((doc) => {
      const data = doc.data()
      collectors.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        completedPickups: data.completedPickups || 0,
        status: data.status
      })
    })
    
    // Calculate statistics
    const totalPickups = pickups.length
    const completedPickups = pickups.filter(p => p.status === 'completed').length
    const statusCounts = pickups.reduce((acc: any, pickup) => {
      acc[pickup.status] = (acc[pickup.status] || 0) + 1
      return acc
    }, {})
    
    const profileCompletedTotal = collectors.reduce((sum, c) => sum + (c.completedPickups || 0), 0)
    
    return NextResponse.json({
      success: true,
      data: {
        totalPickups,
        completedPickups,
        profileCompletedTotal,
        statusCounts,
        collectors: collectors.map(c => ({
          name: c.name,
          completedPickups: c.completedPickups,
          status: c.status
        })),
        samplePickups: pickups.slice(0, 5) // First 5 pickups as sample
      }
    })
    
  } catch (error) {
    console.error('Error fetching pickup data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
