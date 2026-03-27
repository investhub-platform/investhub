import { useState, useEffect } from "react";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import api from "../../lib/axios";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: ""
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const fetchPortfolios = async () => {
    try {
      const res = await api.get("/v1/portfolios");
      setPortfolios(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolio.name.trim()) return;

    setCreating(true);
    try {
      await api.post("/v1/portfolios", newPortfolio);
      setNewPortfolio({ name: "", description: "" });
      setShowCreateForm(false);
      fetchPortfolios(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create portfolio");
    } finally {
      setCreating(false);
    }
  };

  const handleEditPortfolio = (portfolio) => {
    setEditingId(portfolio._id);
    setEditForm({
      name: portfolio.name,
      description: portfolio.description || ""
    });
  };

  const handleUpdatePortfolio = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    try {
      await api.put(`/v1/portfolios/${editingId}`, editForm);
      setEditingId(null);
      setEditForm({ name: "", description: "" });
      fetchPortfolios(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update portfolio");
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;

    try {
      await api.delete(`/v1/portfolios/${id}`);
      fetchPortfolios(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete portfolio");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DesktopSidebar />
        <main className="flex-1 w-full">
          <AppNavbar />
          <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
            <h1 className="text-3xl heading-tight">Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Track your active investments and performance.
            </p>
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DesktopSidebar />
        <main className="flex-1 w-full">
          <AppNavbar />
          <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
            <h1 className="text-3xl heading-tight">Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Track your active investments and performance.
            </p>
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DesktopSidebar />
      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl heading-tight">Portfolio</h1>
              <p className="text-muted-foreground mt-1">
                Track your active investments and performance.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {showCreateForm ? "Cancel" : "Create Portfolio"}
            </button>
          </div>

          {showCreateForm && (
            <div className="mt-8 obsidian-card p-6">
              <h2 className="text-xl font-semibold mb-4">
                Create New Portfolio
              </h2>
              <form onSubmit={handleCreatePortfolio}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newPortfolio.name}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          name: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Portfolio"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {portfolios.length === 0 ? (
            <div className="mt-8 obsidian-card p-6">
              <p className="text-sm text-muted-foreground">
                No portfolios found. Create your first portfolio to start
                tracking investments.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {portfolios.map((portfolio) => (
                <div key={portfolio._id} className="obsidian-card p-6">
                  {editingId === portfolio._id ? (
                    <form onSubmit={handleUpdatePortfolio}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/90"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {portfolio.name}
                          </h2>
                          {portfolio.description && (
                            <p className="text-muted-foreground mt-1">
                              {portfolio.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPortfolio(portfolio)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(portfolio._id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium">Investments</h3>
                        {portfolio.investments.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            No investments yet.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {portfolio.investments.map((investment, index) => {
                              const startupOwner = investment.startupId?.UserID;
                              const startupOwnerLabel =
                                startupOwner?.name ||
                                startupOwner?.email ||
                                startupOwner?._id ||
                                "Unknown Owner";

                              return (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-muted rounded"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {investment.startupId?.name ||
                                        "Unknown Startup"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Startup Owner: {startupOwnerLabel}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Invested: LKR{" "}
                                      {investment.amountInvested.toLocaleString()}{" "}
                                      on{" "}
                                      {new Date(
                                        investment.investedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      Shares: {investment.shares}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Total Value: LKR{" "}
                          {portfolio.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
