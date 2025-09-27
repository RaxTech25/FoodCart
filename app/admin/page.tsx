import { prisma } from '@lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const vendors = await prisma.vendorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  const partners = await prisma.partnerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  const counts = {
    vendors: {
      pending: vendors.filter(v => v.approvalStatus === 'PENDING').length,
      approved: vendors.filter(v => v.approvalStatus === 'APPROVED').length,
      rejected: vendors.filter(v => v.approvalStatus === 'REJECTED').length,
    },
    partners: {
      pending: partners.filter(p => p.approvalStatus === 'PENDING').length,
      approved: partners.filter(p => p.approvalStatus === 'APPROVED').length,
      rejected: partners.filter(p => p.approvalStatus === 'REJECTED').length,
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded p-4">
          <h2 className="font-medium mb-2">Vendors</h2>
          <p>Pending: {counts.vendors.pending}</p>
          <p>Approved: {counts.vendors.approved}</p>
          <p>Rejected: {counts.vendors.rejected}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <h2 className="font-medium mb-2">Partners</h2>
          <p>Pending: {counts.partners.pending}</p>
          <p>Approved: {counts.partners.approved}</p>
          <p>Rejected: {counts.partners.rejected}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <h2 className="font-medium mb-2">Turnover</h2>
          <p>Graphs to be added in Phase 3</p>
        </div>
      </section>

      <section className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Vendor Approvals Overview</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Owner Phone</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.user.phone}</td>
                <td className="p-2">{v.shopType}{v.groceryType ? `/${v.groceryType}` : ''}</td>
                <td className="p-2">{v.approvalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Partner Approvals Overview</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Phone</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Status</th>
              <th className="p-2">Kit</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.user.phone}</td>
                <td className="p-2">{p.vehicleType}</td>
                <td className="p-2">{p.approvalStatus}</td>
                <td className="p-2">{p.kitReceived ? 'Received' : (p.kitShipped ? 'Shipped' : 'Pending')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}