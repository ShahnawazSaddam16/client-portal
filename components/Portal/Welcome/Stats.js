import { useAuth } from '@/components/context/AuthContext';
import React from 'react';

export default function Stats() {
  const {user} = useAuth();


  return (
    <div>
      <h1>{user.username}</h1>
    </div>
  )
}
