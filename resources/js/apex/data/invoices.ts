import { Invoice } from '../types';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2024-00109',
    customer: {
      name: 'Evelyn St. Claire',
      email: 'evelyn.stclaire@meridian.io',
      company: 'Meridian Interactive Systems',
      address: '742 Evergreen Promenade, Suite 400, San Francisco, CA 94107',
    },
    issuer: {
      company: 'Apex Dashboard Systems Inc.',
      email: 'billing@apexcorp.com',
      address: '100 Montgomery St, Suite 1200, San Francisco, CA 94104',
      taxId: 'US-94-3829104',
    },
    issueDate: '2024-05-15',
    dueDate: '2024-06-14',
    items: [
      { description: 'Ergonomic Executive Office Chair Pro (Bulk Pack x2)', quantity: 2, unitPrice: 349.00, taxPercent: 8.5, total: 698.00 },
      { description: 'Anodized Aluminum Dual Laptop Dock Stand', quantity: 1, unitPrice: 44.95, taxPercent: 8.5, total: 44.95 }
    ],
    subtotal: 742.95,
    discount: 37.15,
    tax: 60.00,
    total: 790.80,
    status: 'paid',
    notes: 'Thank you for your valued partnership. All enterprise hardware includes 3-year replacement warranty.',
    terms: 'Payment due within 30 days of invoice date. Overdue balances subject to 1.5% monthly financing charge.',
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2024-00110',
    customer: {
      name: 'Dr. Lucas Sterling',
      email: 'lsterling@sterlingbio.com',
      company: 'Sterling Genomics Laboratories',
      address: '120 Technology Drive, BioLabs Bld 3, Cambridge, MA 02139',
    },
    issuer: {
      company: 'Apex Dashboard Systems Inc.',
      email: 'billing@apexcorp.com',
      address: '100 Montgomery St, Suite 1200, San Francisco, CA 94104',
      taxId: 'US-94-3829104',
    },
    issueDate: '2024-05-18',
    dueDate: '2024-06-17',
    items: [
      { description: 'UltraWide 34-Inch Curved Productivity Display', quantity: 1, unitPrice: 679.00, taxPercent: 8.5, total: 679.00 },
      { description: 'On-site Calibration and Color Calibration Profile', quantity: 1, unitPrice: 150.00, taxPercent: 0, total: 150.00 }
    ],
    subtotal: 829.00,
    discount: 0,
    tax: 57.72,
    total: 886.72,
    status: 'pending',
    notes: 'Hardware delivered to Cambridge BioHub facility. Technical sign-off complete.',
    terms: 'Net 30 wire transfer preferred.',
  },
  {
    id: 'inv_03',
    invoiceNumber: 'INV-2024-00108',
    customer: {
      name: 'Amara Okafor',
      email: 'amara.o@nexusdesign.org',
      company: 'Nexus Creative Studio',
      address: '458 Broadway, Fl 6, New York, NY 10013',
    },
    issuer: {
      company: 'Apex Dashboard Systems Inc.',
      email: 'billing@apexcorp.com',
      address: '100 Montgomery St, Suite 1200, San Francisco, CA 94104',
      taxId: 'US-94-3829104',
    },
    issueDate: '2024-04-10',
    dueDate: '2024-05-10',
    items: [
      { description: 'Wireless Studio Noise-Cancelling Headphones (x4 Team bundle)', quantity: 4, unitPrice: 180.00, taxPercent: 8.875, total: 720.00 }
    ],
    subtotal: 720.00,
    discount: 50.00,
    tax: 59.46,
    total: 729.46,
    status: 'overdue',
    notes: 'Second reminder generated. Late fees will apply starting next statement.',
    terms: 'Payment overdue by 10 days.',
  }
];
