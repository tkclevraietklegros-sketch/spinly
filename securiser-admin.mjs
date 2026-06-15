import { writeFileSync, readFileSync } from 'fs';

let c = readFileSync('app/admin/page.tsx', 'utf8');

c = c.replace(
  `'use client';
import { useState, useEffect } from 'react';`,
  `'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';`
);

c = c.replace(
  `const [codes, setCodes] = useState([]);`,
  `const [codes, setCodes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(cookie => cookie.trim().startsWith('admin_auth='));
    if (!auth) router.push('/admin/login');
  }, []);`
);

writeFileSync('app/admin/page.tsx', c);
console.log('Admin securise avec succes !');