import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMenuForRole } from "../../utils/roles";

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menu = getMenuForRole(user?.role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[var(--color-primary)] transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-16 items-center px-6">
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">
            CredFlow LMS
          </span>
        </div>

        <nav className="space-y-1 p-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`block rounded-md px-4 py-3 text-sm font-medium transition ${
                location.pathname === item.path
                  ? "bg-[var(--color-surface)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
