import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/mission',  label: 'Mission' },
  { to: '/product',  label: 'Product' },
  { to: '/research', label: 'Research' },
  { to: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      {/* Logo */}
      <Link to="/" className="font-serif text-2xl">MOAN</Link>

      {/* Desktop nav links */}
      <nav className="hidden md:flex gap-6 text-sm">
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

      {/* Demo button (desktop only) */}
      <Link
        to="/demo"
        className="hidden md:inline-block rounded-full bg-brand text-white px-4 py-2 text-sm"
      >
        Demo
      </Link>
    </header>
  );
}
