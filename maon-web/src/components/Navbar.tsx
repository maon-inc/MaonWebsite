import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/mission', label: 'Mission' },
  { to: '/product', label: 'Products' },
  { to: '/research', label: 'Research' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  return (
    <header className="py-5 bg-brand-light">
      <div className="mx-auto max-w-[90rem] px-12 flex items-center justify-between">
        {/* logo – no border, bigger left padding */}
        <Link to="/" className="font-serif text-2xl leading-none outline-none focus:outline-none">
          MOAN
        </Link>

        {/* centred links */}
        <nav className="flex gap-12 text-sm">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-brand font-medium'
                  : 'text-gray-700 hover:text-brand'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA right-aligned */}
        <Link
          to="/demo"
          className="rounded-full bg-brand text-white px-6 py-2 text-sm"
        >
          Demo
        </Link>
      </div>
    </header>
  );
}
