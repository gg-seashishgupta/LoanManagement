export const EXECUTIVE_ROLES = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
];

export const getHomeRoute = (role) => {
  switch (role) {
    case "sales":
      return "/operations/sales";
    case "sanction":
      return "/operations/sanction";
    case "disbursement":
      return "/operations/disbursement";
    case "collection":
      return "/operations/collection";
    default:
      return "/";
  }
};

export const getMenuForRole = (role) => {
  const menus = {
    borrower: [
      { name: "Dashboard", path: "/" },
      { name: "Personal Details", path: "/apply/profile" },
      { name: "Upload Salary Slip", path: "/apply/upload" },
      { name: "Apply for Loan", path: "/apply/loan" },
      { name: "My Loans", path: "/my-loans" },
    ],
    sales: [{ name: "Sales Leads", path: "/operations/sales" }],
    sanction: [{ name: "Sanction Queue", path: "/operations/sanction" }],
    disbursement: [
      { name: "Disbursement Queue", path: "/operations/disbursement" },
    ],
    collection: [{ name: "Collection", path: "/operations/collection" }],
    admin: [
      { name: "Dashboard", path: "/" },
      { name: "Sales Leads", path: "/operations/sales" },
      { name: "Sanction", path: "/operations/sanction" },
      { name: "Disbursement", path: "/operations/disbursement" },
      { name: "Collection", path: "/operations/collection" },
    ],
  };

  return menus[role] || [];
};

export const formatRole = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
