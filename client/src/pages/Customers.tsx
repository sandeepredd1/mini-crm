import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Building2,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Flame,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type CustomerStatus = "lead" | "active" | "inactive";

interface Customer {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes?: string;
}

interface CustomerForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm: CustomerForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "lead",
  notes: "",
};

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);
  const [form, setForm] =
    useState<CustomerForm>(emptyForm);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/customers`,
        {
          withCredentials: true,
        }
      );

      const responseData = response.data;

      const customerList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.customers)
        ? responseData.customers
        : [];

      const normalizedCustomers: Customer[] =
        customerList.map((customer: any) => ({
          _id: customer._id,
          name: customer.name || "",
          company: customer.company || "",
          email: customer.email || "",
          phone: customer.phone || "",
          status:
            String(customer.status).toLowerCase() ===
            "active"
              ? "active"
              : String(customer.status).toLowerCase() ===
                "inactive"
              ? "inactive"
              : "lead",
          notes: customer.notes || "",
        }));

      setCustomers(normalizedCustomers);
    } catch (err: any) {
      console.error(
        "FETCH CUSTOMERS ERROR:",
        err
      );

      if (err?.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load customers."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      status: customer.status || "lead",
      notes: customer.notes || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.company.trim()) {
      setError("Company is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const customerData = {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        status: form.status,
        notes: form.notes.trim(),
      };

      if (editingCustomer) {
        await axios.put(
          `${API_URL}/api/customers/${editingCustomer._id}`,
          customerData,
          {
            withCredentials: true,
          }
        );

        setSuccess(
          "Customer updated successfully."
        );
      } else {
        await axios.post(
          `${API_URL}/api/customers`,
          customerData,
          {
            withCredentials: true,
          }
        );

        setSuccess(
          "Customer added successfully."
        );
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm({ ...emptyForm });

      await fetchCustomers();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error(
        "SAVE CUSTOMER ERROR:",
        err
      );

      const responseMessage =
        err?.response?.data?.message;

      const validationErrors =
        err?.response?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setError(
          validationErrors
            .map(
              (item: any) =>
                item?.message ||
                "Invalid value"
            )
            .join(", ")
        );
      } else {
        setError(
          responseMessage ||
            "Validation failed. Please check your details."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await axios.delete(
        `${API_URL}/api/customers/${id}`,
        {
          withCredentials: true,
        }
      );

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer._id !== id
        )
      );

      setSuccess(
        "Customer deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error(
        "DELETE CUSTOMER ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to delete customer."
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredCustomers =
    customers.filter((customer) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        customer.name
          .toLowerCase()
          .includes(searchValue) ||
        customer.company
          .toLowerCase()
          .includes(searchValue) ||
        customer.email
          .toLowerCase()
          .includes(searchValue) ||
        customer.phone
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const getStatusLabel = (
    customerStatus: CustomerStatus
  ) => {
    if (customerStatus === "active") {
      return "Active";
    }

    if (customerStatus === "inactive") {
      return "Inactive";
    }

    return "Lead";
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between animate-[fadeDown_.5s_ease-out]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
              <Users size={25} />
            </div>

            <div>
              <p className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-orange-600">
                <Flame size={15} />
                CRM Management
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Customers
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your customers and relationships
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl active:translate-y-0"
          >
            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            Add Customer
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm animate-[fadeDown_.3s_ease-out]">
            <CheckCircle2 size={18} />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto rounded-lg p-1 transition hover:bg-green-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && !showModal && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm animate-[fadeDown_.3s_ease-out]">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="mb-7 rounded-3xl border border-orange-100 bg-white p-4 shadow-xl shadow-orange-100/50 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customers, companies or emails..."
                className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full cursor-pointer rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all duration-300 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 md:w-48"
            >
              <option value="All">
                All Status
              </option>

              <option value="lead">
                Lead
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/50"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-orange-100" />

                    <div className="flex-1">
                      <div className="mb-2 h-4 w-32 rounded bg-orange-100" />

                      <div className="h-3 w-24 rounded bg-orange-100" />
                    </div>
                  </div>

                  <div className="mb-3 h-3 w-full rounded bg-orange-50" />

                  <div className="h-3 w-4/5 rounded bg-orange-50" />
                </div>
              )
            )}
          </div>
        ) : filteredCustomers.length === 0 ? (

          /* EMPTY STATE */
          <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-white px-6 py-20 text-center shadow-xl shadow-orange-100/50 animate-[fadeUp_.5s_ease-out]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-500 shadow-lg shadow-orange-100">
              <UserRound size={34} />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              No customers found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search ||
              statusFilter !== "All"
                ? "Try changing your search or filter."
                : "Start adding customers to your CRM."}
            </p>

            {!search &&
              statusFilter === "All" && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl"
                >
                  <UserPlus size={17} />
                  Add Your First Customer
                </button>
              )}
          </div>
        ) : (

          /* CUSTOMER CARDS */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map(
              (customer, index) => (
                <div
                  key={customer._id}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                  className="group animate-[fadeUp_.5s_ease-out_both] rounded-3xl border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-200/60"
                >
                  {/* CARD HEADER */}
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-black text-white shadow-lg shadow-orange-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {customer.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black text-slate-900">
                          {customer.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Building2 size={12} />

                          <span className="truncate">
                            {customer.company}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                        customer.status ===
                        "active"
                          ? "bg-green-50 text-green-600 ring-1 ring-green-100"
                          : customer.status ===
                            "inactive"
                          ? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                          : "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                      }`}
                    >
                      {getStatusLabel(
                        customer.status
                      )}
                    </span>
                  </div>

                  {/* CUSTOMER INFO */}
                  <div className="space-y-3 border-t border-orange-50 pt-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:bg-orange-100 group-hover:scale-105">
                        <Mail size={15} />
                      </div>

                      <span className="truncate">
                        {customer.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-all duration-300 group-hover:bg-amber-100 group-hover:scale-105">
                        <Phone size={15} />
                      </div>

                      <span>
                        {customer.phone}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex items-center gap-2 border-t border-orange-50 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/customers/${customer._id}`
                        )
                      }
                      className="group/view flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-md"
                    >
                      <Eye
                        size={15}
                        className="transition-transform group-hover/view:scale-110"
                      />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(customer)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          customer._id
                        )
                      }
                      disabled={
                        deletingId ===
                        customer._id
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      customer._id ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-lg shadow-orange-100/40">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Total Customers
            </p>

            <p className="text-xl font-black text-orange-600">
              {filteredCustomers.length}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="group flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-md"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : "transition-transform duration-500 group-hover:rotate-180"
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-[fadeIn_.2s_ease-out]"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-900/20 animate-[modalIn_.3s_ease-out]">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-50 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
                  {editingCustomer ? (
                    <Pencil size={19} />
                  ) : (
                    <UserPlus size={19} />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {editingCustomer
                      ? "Edit Customer"
                      : "Add Customer"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {editingCustomer
                      ? "Update customer information"
                      : "Create a new customer record"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all duration-300 hover:rotate-90 hover:bg-orange-100 hover:text-orange-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 animate-[fadeDown_.3s_ease-out]">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Company *
                  </label>

                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone *
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full cursor-pointer rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                >
                  <option value="lead">
                    Lead
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add notes about this customer..."
                  className="w-full resize-none rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 border-t border-orange-50 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingCustomer
                    ? "Update Customer"
                    : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}