
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowUpRight, RefreshCw, Sparkles, Users } from "lucide-react";

import api from "../services/api";
import type { Customer } from "../types";

import {
  CustomerFormModal,
  CustomerList,
  CustomerToolbar,
} from "./CustomerComponents";

import type {
  CustomerForm,
  CustomerFormModalProps,
} from "./CustomerComponents";

interface CustomerResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiErrorResponse {
  message?: string;
  errors?: { message?: string }[];
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "All";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<CustomerResponse["pagination"]>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  // Load customers
  useEffect(() => {
    let active = true;

    api
      .get<CustomerResponse>("/customers", {
        params: {
          search: search || undefined,
          status: statusFilter === "All" ? undefined : statusFilter,
          page,
          limit: 9,
        },
      })
      .then(({ data }) => {
        if (!active) return;

        setError("");
        setCustomers(data.customers);
        setPagination(data.pagination);
      })
      .catch((requestError: unknown) => {
        if (!active) return;

        const response = axios.isAxiosError<ApiErrorResponse>(requestError)
          ? requestError.response
          : undefined;

        setError(
          response?.status === 401
            ? "Your session has expired. Please sign in again."
            : response?.data?.message || "Unable to load customers."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey, search, statusFilter]);

  // Update search, status, and pagination URL parameters
  const updateListParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }

    if ("search" in updates || "status" in updates) {
      next.delete("page");
    }

    setLoading(true);
    setError("");
    setSearchParams(next, { replace: true });
  };

  const openAddForm = () => {
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      notes: customer.notes,
    });

    setError("");
    setShowModal(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleChange: CustomerFormModalProps["onChange"] = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Add or update customer
  const handleSubmit: CustomerFormModalProps["onSubmit"] = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.company.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError("Name, company, email, and phone are required.");
      return;
    }

    setSaving(true);

    try {
      const customerData = {
        ...form,
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      };

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer._id}`,
          customerData
        );
      } else {
        await api.post("/customers", customerData);
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm({ ...emptyForm });

      setSuccess(
        editingCustomer
          ? "Customer updated successfully."
          : "Customer added successfully."
      );

      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError: unknown) {
      const response = axios.isAxiosError<ApiErrorResponse>(requestError)
        ? requestError.response?.data
        : undefined;

      const messages = response?.errors?.map(
        (item) => item.message || "Invalid value"
      );

      setError(
        messages?.join(", ") ||
          response?.message ||
          "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete customer
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/customers/${id}`);

      setSuccess("Customer deleted successfully.");
      setLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError: unknown) {
      const response = axios.isAxiosError<ApiErrorResponse>(requestError)
        ? requestError.response?.data
        : undefined;

      setError(response?.message || "Unable to delete customer.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="customers-page min-h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(251,146,60,0.10),_transparent_38%),linear-gradient(135deg,#f8fafc,#f8fafc_55%,#fff7ed)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative isolate mb-6 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-xl shadow-orange-100/50 backdrop-blur sm:p-6"
          style={{ animation: "pageRise .45s ease-out both" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-48 w-48 rounded-full bg-orange-200/50 blur-3xl" />

          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#111827] via-[#263247] to-[#63362d] px-5 py-5 text-white shadow-lg shadow-slate-900/10 sm:px-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-100">
                <Sparkles size={12} />
                Relationship hub
              </span>

              <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                Grow your customer network
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Keep every connection organized and moving forward.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/15 text-orange-200">
                <Users size={19} />
              </span>

              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  Your network
                </span>
                <span className="mt-0.5 block text-xl font-bold tabular-nums">
                  {pagination.total}
                </span>
              </span>

              <ArrowUpRight size={16} className="ml-2 text-orange-200" />
            </div>
          </div>

          <CustomerToolbar
            search={search}
            statusFilter={statusFilter}
            error={showModal ? "" : error}
            success={success}
            onSearchChange={(value) =>
              updateListParams({ search: value })
            }
            onStatusChange={(value) =>
              updateListParams({
                status: value === "All" ? "" : value,
              })
            }
            onAdd={openAddForm}
            onDismissError={() => setError("")}
            onDismissSuccess={() => setSuccess("")}
          />
        </div>

        <div
          className="customers-list"
          style={{ animation: "pageRise .45s ease-out .08s both" }}
        >
          <CustomerList
            customers={customers}
            loading={loading}
            search={search}
            statusFilter={statusFilter}
            onAdd={openAddForm}
            onView={(id) => navigate(`/customers/${id}`)}
            onEdit={openEditForm}
            onDelete={(id) => void handleDelete(id)}
            deletingId={deletingId}
          />
        </div>

        <div
          className="mt-6 flex items-center justify-between rounded-2xl border border-orange-100/80 bg-white/90 px-5 py-4 shadow-lg shadow-orange-100/40 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{ animation: "pageRise .45s ease-out .14s both" }}
        >
          <div>
            <p className="text-xs font-medium text-slate-400">
              Total Customers
            </p>
            <p className="text-xl font-black text-orange-600">
              {pagination.total}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadKey((current) => current + 1);
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-600 transition hover:bg-orange-100 hover:shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {pagination.totalPages > 1 && (
          <nav
            aria-label="Customer list pagination"
            className="mt-4 flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-sm"
            style={{ animation: "pageRise .35s ease-out both" }}
          >
            <p className="text-xs text-slate-500 sm:text-sm">
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.total} customers
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  updateListParams({ page: String(page - 1) })
                }
                className="rounded-lg border border-orange-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() =>
                  updateListParams({ page: String(page + 1) })
                }
                className="rounded-lg border border-orange-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>

      {showModal && (
        <CustomerFormModal
          form={form}
          editing={Boolean(editingCustomer)}
          saving={saving}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <style>{`
        @keyframes pageRise {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .customers-list article {
          border-color: rgb(226 232 240 / 0.9);
          border-radius: 1.5rem;
          box-shadow: 0 8px 24px rgb(15 23 42 / 0.045);
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .customers-list article:hover {
          transform: translateY(-4px);
          border-color: rgb(253 186 116 / 0.8);
          box-shadow: 0 18px 36px rgb(124 45 18 / 0.11);
        }

        .customers-page button {
          transition-property:
            color,
            background-color,
            border-color,
            box-shadow,
            transform;
          transition-duration: 180ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .customers-list article {
            transition: none;
          }

          .customers-list article:hover {
            transform: none;
          }

          .customers-page button {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
