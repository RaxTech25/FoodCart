import { prisma } from '@lib/prisma';

export const dynamic = 'force-dynamic';

async function getData() {
  const vendors = await prisma.vendorProfile.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });
  const partners = await prisma.partnerProfile.findMany({
    where: { approvalStatus: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });
  return { vendors, partners };
}

export default async function StaffPage() {
  const { vendors, partners } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>

      <section className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Pending Vendors</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Phone</th>
              <th className="p-2">Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.user.phone}</td>
                <td className="p-2">{v.shopType}{v.groceryType ? `/${v.groceryType}` : ''}</td>
                <td className="p-2">
                  <form action="/api/staff/approve" method="POST" className="inline">
                    <input type="hidden" name="type" value="vendor" />
                    <input type="hidden" name="id" value={String(v.id)} />
                    <button className="btn-outline mr-2" type="submit">Approve</button>
                  </form>
                  <form action="/api/staff/reject" method="POST" className="inline">
                    <input type="hidden" name="type" value="vendor" />
                    <input type="hidden" name="id" value={String(v.id)} />
                    <input className="input inline w-64" name="reason" placeholder="Enter rejection reason" />
                    <button className="btn-outline ml-2" type="submit">Reject</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white border rounded p-4">
        <h2 className="font-medium mb-4">Pending Partners</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Phone</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.user.phone}</td>
                <td className="p-2">{p.vehicleType}</td>
                <td className="p-2">
                  <form action="/api/staff/approve" method="POST" className="inline">
                    <input type="hidden" name="type" value="partner" />
                    <input type="hidden" name="id" value={String(p.id)} />
                    <button className="btn-outline mr-2" type="submit">Approve</button>
                  </form>
                  <form action="/api/staff/reject" method="POST" className="inline">
                    <input type="hidden" name="type" value="partner" />
                    <input type="hidden" name="id" value={String(p.id)} />
                    <input className="input inline w-64" name="reason" placeholder="Enter rejection reason" />
                    <button className="btn-outline ml-2" type="submit">Reject</button>
                  </form>
                  <form action="/api/staff/partner/kit" method="POST" className="inline ml-4">
                    <input type="hidden" name="id" value={String(p.id)} />
                    <button className="btn-outline" type="submit">Mark Kit Received</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}