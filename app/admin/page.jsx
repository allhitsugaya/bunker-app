// app/admin/page.jsx
import AdminPanel from '@/app/_components/admin/AdminPanel';

export const dynamic = 'force-dynamic'; // чтобы не пререндерили на билде


export default function AdminPage() {
  return <AdminPanel />;
}
