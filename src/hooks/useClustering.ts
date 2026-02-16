import { useMemo } from 'react';
import Supercluster from 'supercluster';
import { logger } from '@/lib/logger';

export interface ClusterPoint {
  id: string;
  user_id: string;
  firstName: string;
  signal: 'green' | 'yellow' | 'red';
  activity: string;
  latitude: number;
  longitude: number;
  distance?: number;
  avatar_url?: string;
  rating?: number;
}

export interface ClusterFeature {
  type: 'Feature';
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    // For non-cluster points
    user?: ClusterPoint;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface UseClusteringOptions {
  points: ClusterPoint[];
  bounds: [number, number, number, number] | null; // [west, south, east, north]
  zoom: number;
  options?: Supercluster.Options<ClusterPoint, { cluster: boolean }>;
}

export function useClustering({
  points,
  bounds,
  zoom,
  options = {},
}: UseClusteringOptions) {
  // Create supercluster instance
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 18,
      minZoom: 0,
      ...options,
    });

    // Convert points to GeoJSON features
    const features = points.map((point): GeoJSON.Feature<GeoJSON.Point> => ({
      type: 'Feature',
      properties: {
        cluster: false,
        user: point,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
    }));

    cluster.load(features as any);
    return cluster;
  }, [points, options]);

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    if (!bounds) return [];

    try {
      const rawClusters = supercluster.getClusters(bounds, Math.floor(zoom));
      return rawClusters as ClusterFeature[];
    } catch (e) {
      logger.ui.error('useClustering', String(e));
      return [];
    }
  }, [supercluster, bounds, zoom]);

  // Function to expand a cluster
  const getClusterExpansionZoom = (clusterId: number): number => {
    try {
      return supercluster.getClusterExpansionZoom(clusterId);
    } catch (e) {
      return zoom + 2;
    }
  };

  // Get points in a cluster
  const getClusterLeaves = (clusterId: number): ClusterPoint[] => {
    try {
      const leaves = supercluster.getLeaves(clusterId, Infinity);
      return leaves.map((leaf: any) => leaf.properties.user).filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  return {
    clusters,
    supercluster,
    getClusterExpansionZoom,
    getClusterLeaves,
  };
}
