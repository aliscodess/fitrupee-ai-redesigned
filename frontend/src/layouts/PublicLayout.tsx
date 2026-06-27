import { Outlet } from 'react-router-dom';
export default function PublicLayout() {
  return <div style={{ minHeight: '100vh', background: '#F5F0E8' }}><Outlet /></div>;
}
