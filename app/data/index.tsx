import React from 'react';
import { Redirect } from 'expo-router';

// This component will redirect any requests to the /data route to the main textiles page
export default function DataIndexRoute() {
  return <Redirect href="/textiles" />;
} 